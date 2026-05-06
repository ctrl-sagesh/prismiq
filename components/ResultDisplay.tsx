'use client';

import React, { useState } from "react";

export default function ResultDisplay({ result, action, sourceUrl }: { result: string; action: string; sourceUrl?: string }) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const labels: Record<string, string> = {
    summarize: "Summary",
    notes: "Study Notes",
    qa: "Questions & Answers",
    search: "Search Results",
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (!sourceUrl) return;
    const shareLink = `${window.location.origin}/?url=${encodeURIComponent(sourceUrl)}`;
    navigator.clipboard.writeText(shareLink);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prismiq-${action}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Render inline bold (**text**) and italic (*text*)
  const renderInline = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**"))
        return <strong key={j} className="text-white/90 font-semibold">{part.slice(2, -2)}</strong>;
      if (part.startsWith("*") && part.endsWith("*"))
        return <em key={j} className="italic">{part.slice(1, -1)}</em>;
      return part;
    });
  };

  const renderLine = (line: string, i: number) => {
    // H1 heading
    if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-bold text-white mt-5 mb-2 first:mt-0">{line.slice(2)}</h1>;
    // H2 heading
    if (line.startsWith("## ")) return <h2 key={i} className="text-base font-semibold text-violet-300 mt-5 mb-2 first:mt-0">{line.slice(3)}</h2>;
    // H3 heading
    if (line.startsWith("### ")) return <h3 key={i} className="text-sm font-semibold text-purple-300 mt-4 mb-1">{line.slice(4)}</h3>;
    // Divider
    if (line.trim() === "---") return <hr key={i} className="border-white/10 my-4" />;
    // Q&A question line
    if (line.startsWith("Q:")) return <p key={i} className="font-semibold text-violet-200 mt-5 text-sm">{renderInline(line)}</p>;
    // Q&A answer line
    if (line.startsWith("A:")) return <p key={i} className="text-white/70 text-sm leading-relaxed mt-1 ml-4">{renderInline(line)}</p>;
    // Bullet point
    if (line.startsWith("- ") || line.startsWith("* ")) {
      return (
        <div key={i} className="flex gap-2.5 text-sm text-white/70 leading-relaxed">
          <span className="text-violet-400 mt-1 shrink-0">·</span>
          <span>{renderInline(line.slice(2))}</span>
        </div>
      );
    }
    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const text = line.replace(/^\d+\.\s/, "");
      const num = line.match(/^(\d+)\./)?.[1];
      return (
        <div key={i} className="flex gap-2.5 text-sm text-white/70 leading-relaxed">
          <span className="text-violet-400 shrink-0 font-medium">{num}.</span>
          <span>{renderInline(text)}</span>
        </div>
      );
    }
    // Empty line
    if (line.trim() === "") return <div key={i} className="h-2" />;
    // Table row
    if (line.startsWith("|")) {
      const cells = line.split("|").filter(c => c.trim() !== "");
      const isSeparator = cells.every(c => /^[-:\s]+$/.test(c));
      if (isSeparator) return null;
      return (
        <div key={i} className="grid text-sm" style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}>
          {cells.map((cell, j) => (
            <span key={j} className={`px-3 py-1.5 border-b border-white/10 text-white/70 ${j === 0 ? "font-medium text-white/90" : ""}`}>
              {renderInline(cell.trim())}
            </span>
          ))}
        </div>
      );
    }
    // Normal paragraph
    return <p key={i} className="text-sm text-white/70 leading-relaxed">{renderInline(line)}</p>;
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <h2 className="text-sm font-semibold text-white">{labels[action] || "Result"}</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs text-white/50 hover:text-white hover:bg-white/10 transition-all">
            {copied ? "✓ Copied" : "Copy"}
          </button>
          <button onClick={handleDownload}
            className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs text-white/50 hover:text-white hover:bg-white/10 transition-all">
            Download
          </button>
          {sourceUrl && (
            <button onClick={handleShare}
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs text-white/50 hover:text-white hover:bg-white/10 transition-all">
              {shared ? "✓ Link copied" : "Share"}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-1.5 max-h-[620px] overflow-y-auto">
        {result.split("\n").map((line, i) => renderLine(line, i))}
      </div>

      <p className="text-xs text-white/20 text-center mt-3">Generated by Prismiq · prismiqai.vercel.app</p>
    </div>
  );
}
