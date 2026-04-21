'use client';

import { useState } from "react";

export default function ResultDisplay({ result, action }: { result: string; action: string }) {
  const [copied, setCopied] = useState(false);

  const actionLabels: Record<string, string> = {
    summarize: "Summary",
    notes: "Study Notes",
    qa: "Q&A",
    search: "Search Results",
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prismiq-${action}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const lines = result.split("\n");

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">
          {actionLabels[action] || "Result"}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            Download .md
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-2 max-h-[600px] overflow-y-auto">
        {lines.map((line, i) => {
          if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-bold text-violet-300 mt-4 first:mt-0">{line.slice(3)}</h2>;
          if (line.startsWith("### ")) return <h3 key={i} className="text-base font-semibold text-purple-300 mt-3">{line.slice(4)}</h3>;
          if (line.startsWith("**Q")) return <p key={i} className="font-semibold text-violet-200 mt-4">{line.replace(/\*\*/g, "")}</p>;
          if (line.startsWith("- ") || line.startsWith("* ")) return (
            <div key={i} className="flex gap-2 text-sm text-white/80">
              <span className="text-violet-400 mt-0.5">•</span>
              <span>{line.slice(2).replace(/\*\*(.*?)\*\*/g, "$1")}</span>
            </div>
          );
          if (line.trim() === "") return <div key={i} className="h-1" />;
          return <p key={i} className="text-sm text-white/80 leading-relaxed">{line.replace(/\*\*(.*?)\*\*/g, "$1")}</p>;
        })}
      </div>
    </div>
  );
}
