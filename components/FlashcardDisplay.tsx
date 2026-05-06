'use client';

import { useState } from "react";

interface Card { front: string; back: string; }

function parseCards(raw: string): Card[] | null {
  try {
    const cleaned = raw.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed[0]?.front) return parsed as Card[];
  } catch {}
  return null;
}

export default function FlashcardDisplay({ result }: { result: string }) {
  const cards = parseCards(result);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());

  if (!cards) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
        <p className="text-red-400 text-sm">Could not generate flashcards for this content. Try a different source.</p>
      </div>
    );
  }

  const card = cards[index];
  const knownCount = known.size;

  const go = (dir: number) => {
    setIndex((i) => (i + dir + cards.length) % cards.length);
    setFlipped(false);
  };

  const markKnown = () => {
    setKnown((prev) => new Set([...prev, index]));
    if (index < cards.length - 1) go(1);
  };

  const reset = () => { setKnown(new Set()); setIndex(0); setFlipped(false); };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-violet-400" />
          <h2 className="text-sm font-semibold text-white">Flashcards</h2>
          <span className="text-xs text-white/30">{index + 1} / {cards.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-green-400 font-medium">{knownCount} known</span>
          <button onClick={reset} className="text-xs text-white/30 hover:text-white/50 transition-colors">Reset</button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-white/5 rounded-full mb-5 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-300"
          style={{ width: `${((index + 1) / cards.length) * 100}%` }} />
      </div>

      {/* Card with flip */}
      <div className="relative w-full mb-4" style={{ perspective: "1000px", minHeight: "220px" }}>
        <div
          onClick={() => setFlipped((f) => !f)}
          className="relative w-full cursor-pointer transition-transform duration-500"
          style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", minHeight: "220px" }}
        >
          {/* Front */}
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center"
            style={{ backfaceVisibility: "hidden" }}>
            <p className="text-[10px] text-white/25 uppercase tracking-widest mb-4">Question</p>
            <p className="text-white text-lg font-medium leading-relaxed">{card.front}</p>
            <p className="text-white/20 text-xs mt-6">Click to reveal answer</p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/8 p-8 text-center"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <p className="text-[10px] text-violet-300/50 uppercase tracking-widest mb-4">Answer</p>
            <p className="text-white/90 text-base leading-relaxed">{card.back}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 mb-3">
        <button onClick={() => go(-1)}
          className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-white/50 text-sm hover:bg-white/[0.08] transition-all">
          ← Prev
        </button>
        {flipped && !known.has(index) && (
          <button onClick={markKnown}
            className="flex-1 py-2.5 rounded-xl bg-green-500/20 border border-green-500/30 text-green-300 text-sm font-medium hover:bg-green-500/30 transition-all">
            ✓ I know this
          </button>
        )}
        <button onClick={() => go(1)}
          className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-white/50 text-sm hover:bg-white/[0.08] transition-all">
          Next →
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 flex-wrap">
        {cards.map((_, i) => (
          <button key={i} onClick={() => { setIndex(i); setFlipped(false); }}
            className={`w-2 h-2 rounded-full transition-all ${i === index ? "bg-violet-400 w-4" : known.has(i) ? "bg-green-500/60" : "bg-white/15"}`} />
        ))}
      </div>

      {knownCount === cards.length && (
        <div className="mt-4 text-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <p className="text-green-300 font-semibold text-sm">You know all {cards.length} cards!</p>
          <button onClick={reset} className="text-xs text-white/40 hover:text-white/60 mt-1 transition-colors">Start over</button>
        </div>
      )}
    </div>
  );
}
