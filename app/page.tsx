'use client';

import { useState, useRef, useCallback, useEffect } from "react";
import Navbar from "@/components/Navbar";
import WelcomeScreen from "@/components/WelcomeScreen";
import ResultDisplay from "@/components/ResultDisplay";
import FlashcardDisplay from "@/components/FlashcardDisplay";
import QuizDisplay from "@/components/QuizDisplay";
import PaywallModal from "@/components/PaywallModal";

type InputType = "url" | "file";
type Action = "summarize" | "notes" | "qa" | "search" | "flashcards" | "quiz" | "glossary";
type SummarizeMode = "brief" | "detailed";
type ModalType = "signin_required" | "upgrade_required" | null;

interface ChatMessage { role: "user" | "assistant"; content: string; }

const analyzeActions = [
  { id: "summarize" as Action, label: "Summarize", icon: "📋", desc: "Overview" },
  { id: "notes" as Action, label: "Key Notes", icon: "📝", desc: "Study notes" },
  { id: "qa" as Action, label: "Q&A", icon: "💡", desc: "Questions" },
  { id: "search" as Action, label: "Search", icon: "🔍", desc: "Find info" },
];

const studyActions = [
  { id: "flashcards" as Action, label: "Flashcards", icon: "🃏", desc: "Flip cards" },
  { id: "quiz" as Action, label: "Quiz", icon: "📊", desc: "Test yourself" },
  { id: "glossary" as Action, label: "Glossary", icon: "📖", desc: "Key terms" },
];

const allActions = [...analyzeActions, ...studyActions];

const steps = [
  { icon: "📎", title: "Drop anything", desc: "A link, YouTube video, PDF, or image" },
  { icon: "⚡", title: "Pick what you need", desc: "Summary, notes, Q&A, or search" },
  { icon: "✅", title: "Read the result", desc: "Clear and useful, no filler" },
];

const works = ["YouTube tutorials and lectures", "Any website or article", "PDF documents", "Screenshots and images", "Text files and notes"];
const doesnt = ["Movies and TV clips", "Music videos", "Private or deleted videos", "Age-restricted videos"];

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('prismiq_welcomed');
    }
    return true;
  });
  const [inputType, setInputType] = useState<InputType>("url");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [action, setAction] = useState<Action>("summarize");
  const [searchQuery, setSearchQuery] = useState("");
  const [summarizeMode, setSummarizeMode] = useState<SummarizeMode>("detailed");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalType>(null);
  const [scansLeft, setScansLeft] = useState<number | null>(null);
  const [resetAt, setResetAt] = useState<string | undefined>(undefined);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [pageTimer, setPageTimer] = useState("");
  const [dragging, setDragging] = useState(false);

  const [scannedUrl, setScannedUrl] = useState<string | undefined>(undefined);

  // Chat state
  const [extractedContent, setExtractedContent] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Pre-fill URL from ?url= query param (shareable links)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get("url");
    if (shared) { setUrl(shared); setInputType("url"); }
  }, []);

  // Fetch scan status on mount
  useEffect(() => {
    fetch("/api/scan-status")
      .then((r) => r.json())
      .then((data) => {
        if (data.signedIn) {
          setIsSignedIn(true);
          setScansLeft(data.scansLeft ?? null);
          if (data.resetAt) setResetAt(data.resetAt);
        }
      })
      .catch(() => {});
  }, []);

  // Live countdown for main page
  useEffect(() => {
    if (!resetAt) { setPageTimer(""); return; }
    function tick() {
      const diff = new Date(resetAt!).getTime() - Date.now();
      if (diff <= 0) { setPageTimer("00:00:00"); return; }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setPageTimer(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [resetAt]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) { setFile(dropped); setInputType("file"); }
  }, []);

  const resetForNewInput = () => {
    setResult(null);
    setError(null);
    setExtractedContent(null);
    setChatMessages([]);
    setChatInput("");
  };

  const handleSubmit = async () => {
    if (inputType === "url" && !url.trim()) return setError("Please enter a URL");
    if (inputType === "url") {
      const trimmed = url.trim();
      const hasProtocol = /^https?:\/\//i.test(trimmed);
      const looksLikeUrl = /\.[a-z]{2,}/i.test(trimmed);
      if (!hasProtocol && !looksLikeUrl) return setError("That doesn't look like a valid URL. Try pasting the full link including https://");
      if (!hasProtocol) setUrl("https://" + trimmed);
    }
    if (inputType === "file" && !file) return setError("Please select a file");
    if (action === "search" && !searchQuery.trim()) return setError("Please enter what you want to find");

    setLoading(true);
    setError(null);
    setResult(null);
    setExtractedContent(null);
    setChatMessages([]);

    const formData = new FormData();
    formData.append("action", action);
    formData.append("inputType", inputType);
    if (action === "search") formData.append("searchQuery", searchQuery);
    if (action === "summarize") formData.append("summarizeMode", summarizeMode);
    if (inputType === "url") formData.append("url", url);
    if (inputType === "file" && file) formData.append("file", file);

    try {
      const res = await fetch("/api/process", { method: "POST", body: formData });
      const data = await res.json();

      if (res.status === 429) {
        if (data.resetAt) setResetAt(data.resetAt);
        setModal(data.error === "signin_required" ? "signin_required" : "upgrade_required");
        return;
      }
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setResult(data.result);
      setScansLeft(data.scansLeft);
      if (data.isSignedIn) setIsSignedIn(true);
      if (data.extractedContent) setExtractedContent(data.extractedContent);
      if (inputType === "url") setScannedUrl(url.trim()); else setScannedUrl(undefined);
      setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      setError("Request timed out. Try a shorter video or a different URL.");
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || !extractedContent || chatLoading) return;
    const question = chatInput.trim();
    setChatInput("");
    const newMessages: ChatMessage[] = [...chatMessages, { role: "user", content: question }];
    setChatMessages(newMessages);
    setChatLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: extractedContent, question, history: chatMessages }),
      });
      const data = await res.json();
      setChatMessages([...newMessages, { role: "assistant", content: data.answer || data.error }]);
    } catch {
      setChatMessages([...newMessages, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const activeAction = allActions.find((a) => a.id === action)!;

  return (
    <>
      {showWelcome && (
        <WelcomeScreen onEnter={() => {
          setShowWelcome(false);
          sessionStorage.setItem('prismiq_welcomed', '1');
        }} />
      )}
      <Navbar />
      {modal && <PaywallModal type={modal} onClose={() => setModal(null)} resetAt={resetAt} />}

      {/* Background glow orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[600px] h-[600px]" style={{ background: "radial-gradient(circle at 30% 30%, rgba(139,92,246,0.18) 0%, transparent 70%)" }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px]" style={{ background: "radial-gradient(circle at 70% 20%, rgba(236,72,153,0.12) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px]" style={{ background: "radial-gradient(circle at 50% 80%, rgba(192,38,211,0.08) 0%, transparent 70%)" }} />
      </div>

      <main className="relative z-10 flex flex-col items-center px-4 pt-24 pb-20 min-h-screen">

        {/* Hero */}
        <div className="relative text-center mb-10 max-w-2xl">
          <div className="hidden lg:block">
            <div className="absolute -left-36 top-6 animate-float">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/40 backdrop-blur-sm whitespace-nowrap">🎬 YouTube</div>
            </div>
            <div className="absolute -left-44 top-20 animate-float-rev">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/40 backdrop-blur-sm whitespace-nowrap">📄 PDF</div>
            </div>
            <div className="absolute -right-36 top-6 animate-float-slow">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/40 backdrop-blur-sm whitespace-nowrap">🌐 Website</div>
            </div>
            <div className="absolute -right-32 top-20 animate-float">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/40 backdrop-blur-sm whitespace-nowrap">🖼️ Image</div>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs mb-6 font-medium">
            ✨ Free to try. No account needed.
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-5 leading-[1.1] tracking-tight">
            Stop scrolling.<br />
            <span style={{ background: "linear-gradient(to right, #a78bfa, #c084fc, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Just understand.
            </span>
          </h1>
          <p className="text-white/50 text-lg leading-relaxed max-w-lg mx-auto">
            Paste a YouTube video, website, PDF or image. Get a clear summary, flashcards, quiz, and more in seconds.
          </p>
        </div>

        {/* How it works */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10 w-full max-w-2xl">
          {steps.map((s, i) => (
            <div key={s.title} className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03]">
              <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-400 shrink-0">{i + 1}</div>
              <div>
                <p className="text-white text-sm font-medium">{s.title}</p>
                <p className="text-white/40 text-xs">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/[0.04] p-6 mb-4 shadow-2xl">

          {/* Input toggle */}
          <div className="flex gap-2 mb-5 p-1 rounded-xl bg-white/5 border border-white/10">
            {(["url", "file"] as InputType[]).map((t) => (
              <button key={t} onClick={() => { setInputType(t); resetForNewInput(); setFile(null); setUrl(""); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${inputType === t ? "bg-violet-600 text-white shadow" : "text-white/50 hover:text-white"}`}>
                {t === "url" ? "🔗  Link or YouTube" : "📁  File or Image"}
              </button>
            ))}
          </div>

          {/* URL Input */}
          {inputType === "url" && (
            <div>
              <input type="text" value={url} onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Paste a YouTube link, website URL, or any article..."
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm outline-none focus:border-violet-500/60 transition-colors" />
              {!url && (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-[11px] text-white/20">Try:</span>
                  {[
                    { label: "Karpathy on LLMs", url: "https://www.youtube.com/watch?v=zjkBMFhNj_g" },
                    { label: "Paul Graham Essay", url: "https://paulgraham.com/startupideas.html" },
                    { label: "Wikipedia: AI", url: "https://en.wikipedia.org/wiki/Artificial_intelligence" },
                  ].map((ex) => (
                    <button key={ex.label} onClick={() => setUrl(ex.url)}
                      className="text-[11px] text-violet-400/70 hover:text-violet-300 border border-violet-500/20 hover:border-violet-500/40 px-2 py-0.5 rounded-full transition-all">
                      {ex.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* File Drop */}
          {inputType === "file" && (
            <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
              onDrop={handleDrop} onClick={() => fileRef.current?.click()}
              className={`w-full min-h-[110px] flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-all ${dragging ? "border-violet-500 bg-violet-500/10" : "border-white/15 hover:border-violet-500/40 bg-white/[0.02]"}`}>
              <input ref={fileRef} type="file" className="hidden" accept=".pdf,.txt,.md,image/*"
                onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
              {file ? (
                <div className="text-center">
                  <p className="text-violet-300 font-medium text-sm">{file.name}</p>
                  <p className="text-white/30 text-xs mt-1">{(file.size / 1024).toFixed(1)} KB · click to change</p>
                </div>
              ) : (
                <>
                  <span className="text-3xl">📎</span>
                  <p className="text-white/50 text-sm font-medium">Drop your file here or click to browse</p>
                  <p className="text-white/25 text-xs">PDF, PNG, JPG, TXT supported</p>
                </>
              )}
            </div>
          )}

          {/* Analyze actions */}
          <div className="mt-4">
            <p className="text-[10px] text-white/20 uppercase tracking-widest mb-2 font-medium">Analyze</p>
            <div className="grid grid-cols-4 gap-2">
              {analyzeActions.map((a) => (
                <button key={a.id} onClick={() => setAction(a.id)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs transition-all ${action === a.id ? "border-violet-500/60 bg-violet-500/15 text-violet-300" : "border-white/10 bg-white/[0.03] text-white/40 hover:text-white/70 hover:border-white/20"}`}>
                  <span className="text-xl">{a.icon}</span>
                  <span className="font-medium">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Study actions */}
          <div className="mt-3">
            <p className="text-[10px] text-white/20 uppercase tracking-widest mb-2 font-medium">Study</p>
            <div className="grid grid-cols-3 gap-2">
              {studyActions.map((a) => (
                <button key={a.id} onClick={() => setAction(a.id)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs transition-all ${action === a.id ? "border-pink-500/60 bg-pink-500/15 text-pink-300" : "border-white/10 bg-white/[0.03] text-white/40 hover:text-white/70 hover:border-white/20"}`}>
                  <span className="text-xl">{a.icon}</span>
                  <span className="font-medium">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brief/Detailed for summarize */}
          {action === "summarize" && (
            <div className="flex gap-2 mt-3">
              {(["brief", "detailed"] as SummarizeMode[]).map((mode) => (
                <button key={mode} onClick={() => setSummarizeMode(mode)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all border ${summarizeMode === mode ? "border-violet-500/60 bg-violet-500/15 text-violet-300" : "border-white/10 bg-white/[0.03] text-white/40 hover:text-white/60"}`}>
                  {mode === "brief" ? "⚡ Quick overview" : "📖 Full breakdown"}
                </button>
              ))}
            </div>
          )}

          {/* Search input */}
          {action === "search" && (
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="What do you want to find? e.g. 'main concepts' or 'how to install'"
              className="w-full mt-4 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm outline-none focus:border-violet-500/60 transition-colors" />
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading}
            className="mt-5 w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg">
            {loading ? (
              <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Analyzing content...</>
            ) : (
              `${activeAction.icon}  ${activeAction.label} this`
            )}
          </button>

          {/* Scan status */}
          {isSignedIn && scansLeft !== null && (
            <div className="mt-3 flex items-center justify-center">
              {scansLeft > 0 ? (
                <p className="text-xs text-white/30 text-center">
                  <span className="text-green-400 font-semibold">{scansLeft}</span> free scan{scansLeft !== 1 ? "s" : ""} left today ·{" "}
                  <a href="/upgrade" className="text-violet-400 hover:underline">Upgrade for more</a>
                </p>
              ) : pageTimer ? (
                <div className="flex flex-col items-center gap-0.5">
                  <p className="text-[11px] text-white/25 uppercase tracking-wider">Free scans reset in</p>
                  <p className="text-base font-bold tabular-nums"
                    style={{ background: "linear-gradient(to right, #a78bfa, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {pageTimer}
                  </p>
                  <p className="text-[10px] text-white/20">· <a href="/upgrade" className="text-violet-400 hover:underline">Upgrade to skip the wait</a></p>
                </div>
              ) : (
                <p className="text-xs text-white/30 text-center">
                  No free scans left ·{" "}
                  <a href="/upgrade" className="text-violet-400 hover:underline">Upgrade for more</a>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Requirements & limits info */}
        <details className="w-full max-w-2xl mb-4 group rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <summary className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none list-none">
            <div className="flex items-center gap-2">
              <span className="text-white/40 text-sm">ℹ️</span>
              <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">Requirements &amp; plan limits</span>
            </div>
            <span className="text-white/25 text-xs group-open:rotate-180 transition-transform duration-200 inline-block">▾</span>
          </summary>

          <div className="px-5 pb-5 pt-1 space-y-5">
            {/* Supported formats */}
            <div>
              <p className="text-white/25 text-[10px] uppercase tracking-wider font-semibold mb-2.5">Supported formats</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { icon: "▶", label: "YouTube", detail: "Any public video" },
                  { icon: "🌐", label: "Website", detail: "Any article / page" },
                  { icon: "📄", label: "PDF", detail: "Up to 5 MB" },
                  { icon: "🖼️", label: "Image", detail: "JPG, PNG, GIF, WebP" },
                ].map(f => (
                  <div key={f.label} className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{f.icon}</span>
                      <span className="text-white/70 text-xs font-semibold">{f.label}</span>
                    </div>
                    <span className="text-white/30 text-[11px]">{f.detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Per-plan limits table */}
            <div>
              <p className="text-white/25 text-[10px] uppercase tracking-wider font-semibold mb-2.5">Limits by plan</p>
              <div className="rounded-xl border border-white/8 overflow-hidden text-xs">
                <div className="grid grid-cols-5 bg-white/[0.03] border-b border-white/8">
                  <div className="px-3 py-2 text-white/25 font-medium"></div>
                  {["Free", "Starter", "Pro", "Unlimited"].map(p => (
                    <div key={p} className={`px-3 py-2 text-center font-semibold ${p === "Pro" ? "text-violet-300" : p === "Unlimited" ? "text-amber-300" : "text-white/40"}`}>{p}</div>
                  ))}
                </div>
                {[
                  { label: "Scans / day", vals: ["4", "5", "20", "∞"] },
                  { label: "YouTube length", vals: ["20 min", "45 min", "3 hrs", "∞"] },
                  { label: "PDF size", vals: ["5 MB", "5 MB", "5 MB", "5 MB"] },
                  { label: "Price", vals: ["Free", "$3.99/mo", "$8.99/mo", "$15.99/mo"] },
                ].map((row, i) => (
                  <div key={row.label} className={`grid grid-cols-5 ${i % 2 === 0 ? "" : "bg-white/[0.01]"} border-b border-white/5 last:border-0`}>
                    <div className="px-3 py-2.5 text-white/35 font-medium">{row.label}</div>
                    {row.vals.map((v, j) => (
                      <div key={j} className={`px-3 py-2.5 text-center ${j === 2 ? "text-violet-300 font-semibold" : j === 3 ? "text-amber-300 font-semibold" : "text-white/45"}`}>{v}</div>
                    ))}
                  </div>
                ))}
              </div>
              <p className="text-white/20 text-[10px] mt-2">
                Video limit enforced at scan time. Exceeding your plan limit shows a clear upgrade message.{" "}
                <a href="/upgrade" className="text-violet-400 hover:underline">See all plan features →</a>
              </p>
            </div>

            {/* What doesn't work */}
            <div>
              <p className="text-white/25 text-[10px] uppercase tracking-wider font-semibold mb-2">Not supported</p>
              <div className="flex flex-wrap gap-2">
                {doesnt.map(d => (
                  <span key={d} className="flex items-center gap-1 text-[11px] text-white/30 border border-white/8 rounded-full px-2.5 py-1">
                    <span className="text-orange-400/50">✕</span>{d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </details>

        {/* What works */}
        <div className="w-full max-w-2xl mb-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-4">What works with Prismiq</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-green-400 text-xs font-semibold mb-2">Works great with</p>
              <div className="space-y-1.5">
                {works.map(w => (
                  <p key={w} className="text-white/50 text-xs flex items-center gap-2">
                    <span className="text-green-400 shrink-0">✓</span>{w}
                  </p>
                ))}
              </div>
            </div>
            <div>
              <p className="text-orange-400 text-xs font-semibold mb-2">Does not work with</p>
              <div className="space-y-1.5">
                {doesnt.map(d => (
                  <p key={d} className="text-white/40 text-xs flex items-center gap-2">
                    <span className="text-orange-400/70 shrink-0">✕</span>{d}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Example output */}
        {!result && (
          <div className="w-full max-w-2xl mb-8">
            <p className="text-center text-white/20 text-xs uppercase tracking-wider mb-4">Example output</p>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                <span className="text-white/25 text-xs truncate">youtube.com/watch?v=aircAruvnKk</span>
                <span className="ml-auto shrink-0 text-xs text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">Summary</span>
              </div>
              <h3 className="text-white font-semibold text-sm mb-2">What this video is about</h3>
              <p className="text-white/55 text-sm leading-relaxed mb-4">
                Andrej Karpathy gives a deep, practical walkthrough of how large language models like ChatGPT are built. He covers the full training pipeline, from raw text data to a working model, and explains the key ideas behind pretraining, fine-tuning, and RLHF in plain language anyone can follow.
              </p>
              <h3 className="text-white font-semibold text-sm mb-2">Key topics covered</h3>
              <p className="text-white/55 text-sm leading-relaxed">
                The video explains how transformers learn to predict the next token, why scale matters so much, and how instruction-tuning turns a raw model into a helpful assistant. Karpathy also shares honest mental models for understanding what these models can and cannot do reliably.
              </p>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div id="result" className="w-full max-w-2xl">
            {action === "flashcards" ? (
              <FlashcardDisplay result={result} />
            ) : action === "quiz" ? (
              <QuizDisplay result={result} />
            ) : (
              <ResultDisplay result={result} action={action} sourceUrl={scannedUrl} />
            )}

            {/* Chat follow-up — only available when text content was extracted */}
            {extractedContent && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-white/8">
                  <span className="text-sm">💬</span>
                  <p className="text-white/60 text-sm font-medium">Ask anything about this content</p>
                  <span className="ml-auto text-[10px] text-white/20 uppercase tracking-wider">Free</span>
                </div>

                {/* Messages */}
                {chatMessages.length > 0 && (
                  <div className="px-5 py-4 space-y-4 max-h-80 overflow-y-auto">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                          ? "bg-violet-600 text-white rounded-br-sm"
                          : "bg-white/8 text-white/80 border border-white/10 rounded-bl-sm"}`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white/8 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-2.5 flex gap-1.5 items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                )}

                {/* Input */}
                <div className="flex gap-2 p-3 border-t border-white/8">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleChat()}
                    placeholder="e.g. Can you explain the main argument in simpler terms?"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm outline-none focus:border-violet-500/50 transition-colors"
                  />
                  <button
                    onClick={handleChat}
                    disabled={chatLoading || !chatInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0">
                    Ask
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-6 mb-4">
          <p className="text-white/15 text-xs">Trusted by students, researchers and professionals</p>
        </div>
      </main>
    </>
  );
}
