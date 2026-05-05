'use client';

import { useState, useRef, useCallback, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ResultDisplay from "@/components/ResultDisplay";
import PaywallModal from "@/components/PaywallModal";

type InputType = "url" | "file";
type Action = "summarize" | "notes" | "qa" | "search";
type SummarizeMode = "brief" | "detailed";
type ModalType = "signin_required" | "upgrade_required" | null;

const actions = [
  { id: "summarize" as Action, label: "Summarize", icon: "📋", desc: "Quick overview" },
  { id: "notes" as Action, label: "Key Notes", icon: "📝", desc: "Study notes" },
  { id: "qa" as Action, label: "Q&A", icon: "💡", desc: "Questions & answers" },
  { id: "search" as Action, label: "Search", icon: "🔍", desc: "Find specific info" },
];

const steps = [
  { icon: "📎", title: "Drop anything", desc: "A link, YouTube video, PDF, or image" },
  { icon: "⚡", title: "Pick what you need", desc: "Summary, notes, Q&A, or search" },
  { icon: "✅", title: "Read the result", desc: "Clear and useful, no filler" },
];

const works = ["YouTube tutorials and lectures", "Any website or article", "PDF documents", "Screenshots and images", "Text files and notes"];
const doesnt = ["Movies and TV clips", "Music videos", "Private or deleted videos", "Age-restricted videos"];

export default function Home() {
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

  // Fetch scan status on mount so signed-in users see their count immediately
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

  // Live countdown for the main page scan counter
  useEffect(() => {
    if (!resetAt) { setPageTimer(""); return; }
    function tick() {
      const diff = new Date(resetAt!).getTime() - Date.now();
      if (diff <= 0) { setPageTimer("00:00:00"); return; }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setPageTimer(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [resetAt]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) { setFile(dropped); setInputType("file"); }
  }, []);

  const handleSubmit = async () => {
    if (inputType === "url" && !url.trim()) return setError("Please enter a URL");
    if (inputType === "file" && !file) return setError("Please select a file");
    if (action === "search" && !searchQuery.trim()) return setError("Please enter what you want to find");

    setLoading(true);
    setError(null);
    setResult(null);

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
      // scroll to result
      setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      setError("Request timed out. Try a shorter video or a different URL.");
    } finally {
      setLoading(false);
    }
  };

  const activeAction = actions.find((a) => a.id === action)!;

  return (
    <>
      <Navbar />
      {modal && <PaywallModal type={modal} onClose={() => setModal(null)} resetAt={resetAt} />}

      {/* Background glow orbs — radial-gradient so edges naturally fade to transparent */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[600px] h-[600px]" style={{ background: "radial-gradient(circle at 30% 30%, rgba(139,92,246,0.18) 0%, transparent 70%)" }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px]" style={{ background: "radial-gradient(circle at 70% 20%, rgba(236,72,153,0.12) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px]" style={{ background: "radial-gradient(circle at 50% 80%, rgba(192,38,211,0.08) 0%, transparent 70%)" }} />
      </div>

      <main className="relative z-10 flex flex-col items-center px-4 pt-24 pb-20 min-h-screen">

        {/* Hero */}
        <div className="relative text-center mb-10 max-w-2xl">

          {/* Floating input-type chips — visible on large screens only */}
          <div className="hidden lg:block">
            <div className="absolute -left-36 top-6 animate-float">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/40 backdrop-blur-sm whitespace-nowrap">
                🎬 YouTube
              </div>
            </div>
            <div className="absolute -left-44 top-20 animate-float-rev">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/40 backdrop-blur-sm whitespace-nowrap">
                📄 PDF
              </div>
            </div>
            <div className="absolute -right-36 top-6 animate-float-slow">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/40 backdrop-blur-sm whitespace-nowrap">
                🌐 Website
              </div>
            </div>
            <div className="absolute -right-32 top-20 animate-float">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/40 backdrop-blur-sm whitespace-nowrap">
                🖼️ Image
              </div>
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
            Paste a YouTube video, website, PDF or image. Get a clear summary, study notes or Q&A in seconds.
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

          {/* Toggle */}
          <div className="flex gap-2 mb-5 p-1 rounded-xl bg-white/5 border border-white/10">
            {(["url", "file"] as InputType[]).map((t) => (
              <button key={t} onClick={() => { setInputType(t); setError(null); setResult(null); setFile(null); setUrl(""); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${inputType === t ? "bg-violet-600 text-white shadow" : "text-white/50 hover:text-white"}`}>
                {t === "url" ? "🔗  Link or YouTube" : "📁  File or Image"}
              </button>
            ))}
          </div>

          {/* URL Input */}
          {inputType === "url" && (
            <input type="text" value={url} onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="e.g. https://youtube.com/watch?v=... or any website URL"
              className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm outline-none focus:border-violet-500/60 transition-colors" />
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

          {/* Actions */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {actions.map((a) => (
              <button key={a.id} onClick={() => setAction(a.id)}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs transition-all ${action === a.id ? "border-violet-500/60 bg-violet-500/15 text-violet-300" : "border-white/10 bg-white/[0.03] text-white/40 hover:text-white/70 hover:border-white/20"}`}>
                <span className="text-xl">{a.icon}</span>
                <span className="font-medium">{a.label}</span>
              </button>
            ))}
          </div>

          {/* Brief / Detailed toggle for summarize */}
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

          {/* Scan status — shown for signed-in users */}
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

        {/* What works — always visible */}
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

        {/* Example output — shown when no result yet */}
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
            <ResultDisplay result={result} action={action} />
          </div>
        )}

        {/* Social proof */}
        <div className="text-center mt-2 mb-4">
          <p className="text-white/15 text-xs">Trusted by students, researchers and professionals</p>
        </div>
      </main>
    </>
  );
}
