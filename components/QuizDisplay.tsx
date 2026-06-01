'use client';

import { useState } from "react";

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

function parseQuiz(raw: string): QuizQuestion[] | null {
  try {
    const cleaned = raw.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed[0]?.question) return parsed as QuizQuestion[];
  } catch {}
  return null;
}

export default function QuizDisplay({ result }: { result: string }) {
  const questions = parseQuiz(result);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);

  if (!questions) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
        <p className="text-red-400 text-sm">Could not generate a quiz for this content. Try a different source.</p>
      </div>
    );
  }

  const q = questions[current];
  const isCorrect = selected === q?.answer;
  const pct = Math.round((score / questions.length) * 100);

  const handleSelect = (letter: string) => {
    if (selected) return;
    setSelected(letter);
    if (letter === q.answer) setScore((s) => s + 1);
    setAnswers((prev) => [...prev, letter]);
  };

  const next = () => {
    if (current + 1 >= questions.length) { setFinished(true); return; }
    setCurrent((c) => c + 1);
    setSelected(null);
  };

  const restart = () => { setCurrent(0); setSelected(null); setScore(0); setFinished(false); setAnswers([]); };

  if (finished) {
    return (
      <div className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <div className="text-5xl mb-4">{pct >= 80 ? "🏆" : pct >= 50 ? "👍" : "📚"}</div>
        <h2 className="text-white font-bold text-2xl mb-1">{score} / {questions.length} correct</h2>
        <p className="text-white/40 text-sm mb-6">{pct}% — {pct >= 80 ? "Excellent work!" : pct >= 50 ? "Good effort, keep studying!" : "Review the material and try again."}</p>

        <div className="space-y-2 mb-6 text-left">
          {questions.map((q, i) => {
            const userAnswer = answers[i];
            const correct = userAnswer === q.answer;
            return (
              <div key={i} className={`px-4 py-3 rounded-xl border text-sm ${correct ? "border-green-500/20 bg-green-500/8" : "border-red-500/20 bg-red-500/8"}`}>
                <p className={`font-medium mb-0.5 ${correct ? "text-green-300" : "text-red-300"}`}>
                  {correct ? "✓" : "✗"} Q{i + 1}: {q.question}
                </p>
                {!correct && <p className="text-white/40 text-xs">Your answer: {userAnswer} · Correct: {q.answer}</p>}
              </div>
            );
          })}
        </div>

        <button onClick={restart}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-pink-400" />
          <h2 className="text-sm font-semibold text-white">Quiz</h2>
          <span className="text-xs text-white/30">Question {current + 1} of {questions.length}</span>
        </div>
        <span className="text-xs text-white/30">{score} correct so far</span>
      </div>

      {/* Progress */}
      <div className="w-full h-1 bg-white/5 rounded-full mb-5 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-pink-500 to-violet-500 rounded-full transition-all duration-300"
          style={{ width: `${(current / questions.length) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 mb-4">
        <p className="text-white font-medium text-base leading-relaxed">{q.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-2.5 mb-4">
        {q.options.map((opt) => {
          const letter = opt.slice(0, 1);
          const isSelected = selected === letter;
          const isAnswer = letter === q.answer;
          let cls = "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20 hover:bg-white/[0.06]";
          if (selected) {
            if (isAnswer) cls = "border-green-500/50 bg-green-500/15 text-green-200";
            else if (isSelected) cls = "border-red-500/50 bg-red-500/15 text-red-200";
            else cls = "border-white/5 bg-white/[0.02] text-white/30";
          }
          return (
            <button key={letter} onClick={() => handleSelect(letter)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${cls} ${!selected ? "cursor-pointer" : "cursor-default"}`}>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {selected && (
        <div className={`rounded-xl px-4 py-3 mb-4 border text-sm ${isCorrect ? "bg-green-500/8 border-green-500/20" : "bg-orange-500/8 border-orange-500/20"}`}>
          <p className={`font-semibold mb-1 text-xs uppercase tracking-wide ${isCorrect ? "text-green-400" : "text-orange-400"}`}>
            {isCorrect ? "Correct!" : `Correct answer: ${q.answer}`}
          </p>
          <p className="text-white/60">{q.explanation}</p>
        </div>
      )}

      {selected && (
        <button onClick={next}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer">
          {current + 1 >= questions.length ? "See Results" : "Next Question →"}
        </button>
      )}
    </div>
  );
}
