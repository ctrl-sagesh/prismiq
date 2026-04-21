'use client';

import { useState, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import ResultDisplay from "@/components/ResultDisplay";
import PaywallModal from "@/components/PaywallModal";

type InputType = "url" | "file";
type Action = "summarize" | "notes" | "qa" | "search";

const actions = [
  { id: "summarize" as Action, label: "Summarize", icon: "📋", desc: "Get a clear, concise summary" },
  { id: "notes" as Action, label: "Key Notes", icon: "📝", desc: "Structured study notes" },
  { id: "qa" as Action, label: "Q&A", icon: "💡", desc: "Questions & answers" },
  { id: "search" as Action, label: "Search", icon: "🔍", desc: "Find specific info" },
];

export default function Home() {
  const [inputType, setInputType] = useState<InputType>("url");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [action, setAction] = useState<Action>("summarize");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [scansLeft, setScansLeft] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
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
    if (inputType === "url") formData.append("url", url);
    if (inputType === "file" && file) formData.append("file", file);

    try {
      const res = await fetch("/api/process", { method: "POST", body: formData });
      const data = await res.json();

      if (res.status === 429) { setShowPaywall(true); return; }
      if (!res.ok) {
        const msg = data.error || "Something went wrong";
        if (msg.includes("transcript") || msg.includes("No transcript")) {
          setError("⚠️ This video has no captions/transcript. Try an educational video, tutorial, or lecture — those always have transcripts.");
        } else {
          setError(msg);
        }
        return;
      }

      setResult(data.result);
      setScansLeft(data.scansLeft);
    } catch (err) {
      console.error(err);
      setError("Request timed out or failed. Try a shorter video or a different URL.");
    } finally {
      setLoading(false);
    }
  };

  const activeAction = actions.find((a) => a.id === action)!;

  return (
    <>
      <Navbar />
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}

      <main className="flex flex-col items-center px-4 pt-28 pb-20 min-h-screen">
        {/* Hero */}
        <div className="text-center mb-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs mb-5">
            ✨ AI-powered content understanding
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            Understand{" "}
            <span style={{ background: "linear-gradient(to right, #a78bfa, #c084fc, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              anything
            </span>{" "}
            instantly
          </h1>
          <p className="text-white/50 text-base sm:text-lg">
            Drop a link, PDF, image, or YouTube video. Get summaries, notes, Q&amp;A, or search for exactly what you need.
          </p>
        </div>

        {/* Input Card */}
        <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/[0.04] p-6 mb-6 shadow-xl">
          {/* Input Type Toggle */}
          <div className="flex gap-2 mb-5 p-1 rounded-xl bg-white/5 border border-white/10">
            {(["url", "file"] as InputType[]).map((t) => (
              <button
                key={t}
                onClick={() => { setInputType(t); setError(null); setResult(null); setFile(null); setUrl(""); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${inputType === t ? "bg-violet-600 text-white shadow" : "text-white/50 hover:text-white"}`}
              >
                {t === "url" ? "🔗  Link / YouTube" : "📁  File / Image"}
              </button>
            ))}
          </div>

          {/* URL Input */}
          {inputType === "url" && (
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Paste any URL, docs link, or YouTube video..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm outline-none focus:border-violet-500/60 transition-colors"
            />
          )}

          {/* File Drop Zone */}
          {inputType === "file" && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`w-full min-h-[120px] flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-all ${dragging ? "border-violet-500 bg-violet-500/10" : "border-white/20 hover:border-white/40 bg-white/5"}`}
            >
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept=".pdf,.txt,.md,image/*"
                onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
              />
              {file ? (
                <div className="text-center">
                  <p className="text-violet-300 font-medium text-sm">{file.name}</p>
                  <p className="text-white/40 text-xs mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                  <p className="text-white/30 text-xs mt-1">Click to change</p>
                </div>
              ) : (
                <>
                  <span className="text-3xl">📎</span>
                  <p className="text-white/50 text-sm">Drop file here or click to browse</p>
                  <p className="text-white/30 text-xs">PDF, PNG, JPG, TXT supported</p>
                </>
              )}
            </div>
          )}

          {/* Action Selector */}
          <div className="grid grid-cols-4 gap-2 mt-5">
            {actions.map((a) => (
              <button
                key={a.id}
                onClick={() => setAction(a.id)}
                className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-xs transition-all ${action === a.id ? "border-violet-500/60 bg-violet-500/15 text-violet-300" : "border-white/10 bg-white/5 text-white/50 hover:text-white hover:border-white/20"}`}
              >
                <span className="text-xl">{a.icon}</span>
                <span className="font-medium">{a.label}</span>
              </button>
            ))}
          </div>

          {/* Search Query */}
          {action === "search" && (
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="What do you want to find? e.g. 'main concepts', 'installation steps'..."
              className="w-full mt-4 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm outline-none focus:border-violet-500/60 transition-colors"
            />
          )}

          {error && <p className="mt-4 text-red-400 text-sm text-center">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-5 w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Processing...
              </>
            ) : (
              `${activeAction.icon}  ${activeAction.label} this`
            )}
          </button>

          {scansLeft !== null && (
            <p className="mt-3 text-center text-xs text-white/30">
              {scansLeft} free scan{scansLeft !== 1 ? "s" : ""} remaining •{" "}
              <a href="/upgrade" className="text-violet-400 hover:underline">Upgrade for unlimited</a>
            </p>
          )}
        </div>

        {/* Result */}
        {result && <ResultDisplay result={result} action={action} />}

        {/* Feature Pills */}
        {!result && (
          <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-lg">
            {["Any website or docs", "YouTube videos", "PDF documents", "Screenshots & images", "Text files"].map((f) => (
              <span key={f} className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/40 text-xs">{f}</span>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
