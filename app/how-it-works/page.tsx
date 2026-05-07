import Navbar from "@/components/Navbar";
import Link from "next/link";

const features = [
  {
    icon: "📋",
    name: "Summarize",
    tagline: "Get the gist in seconds",
    color: "violet",
    border: "border-violet-500/20",
    bg: "bg-violet-500/5",
    badge: "bg-violet-500/10 text-violet-300 border-violet-500/20",
    how: "Paste any YouTube video, article, or PDF. Prismiq reads the full content and writes a clean, natural summary — the way a smart friend would explain it to you. Choose Quick overview for a 3-sentence version or Full breakdown for a detailed walkthrough of every major point.",
    example: {
      input: "youtube.com/watch?v=zjkBMFhNj_g",
      label: "Summary",
      output: `Andrej Karpathy walks through exactly how large language models work, from raw training data all the way to a working assistant. He explains why scale matters, how transformers learn by predicting the next word, and why fine-tuning on human feedback is what turns a raw model into something useful. The talk is technical but grounded, and by the end you have a real mental model of what is actually happening inside ChatGPT.`,
    },
  },
  {
    icon: "📝",
    name: "Key Notes",
    tagline: "Study notes without the effort",
    color: "blue",
    border: "border-blue-500/20",
    bg: "bg-blue-500/5",
    badge: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    how: "Prismiq reads through the content and pulls out the most important ideas, organizing them under clear topic headings. Each section is written in plain language, not copied text. Think of it as the notes a top student would take after reading everything carefully.",
    example: {
      input: "en.wikipedia.org/wiki/Artificial_intelligence",
      label: "Key Notes",
      output: `## What AI Actually Is\nArtificial intelligence refers to computer systems that can perform tasks which normally require human judgment, like recognizing speech, making decisions, or translating language. The field has gone through several waves of excitement and disappointment since the 1950s.\n\n## The Two Main Approaches\nMost modern AI relies on machine learning, where a system learns patterns from huge amounts of data instead of following hand-written rules. Deep learning, a subset of this, uses layered neural networks that can recognize images, understand text, and generate content at a surprisingly high level.`,
    },
  },
  {
    icon: "💡",
    name: "Q&A",
    tagline: "Questions worth asking, answered",
    color: "pink",
    border: "border-pink-500/20",
    bg: "bg-pink-500/5",
    badge: "bg-pink-500/10 text-pink-300 border-pink-500/20",
    how: "Prismiq generates 8 to 10 questions a curious student would actually ask about the content, then answers each one in clear, natural sentences. Great for checking your understanding or preparing for a test without re-reading everything.",
    example: {
      input: "paulgraham.com/startupideas.html",
      label: "Q&A",
      output: `Q: What does Paul Graham mean by a startup idea being a problem you notice?\nA: Graham argues the best startup ideas come from noticing a real gap in your own life, not brainstorming in the abstract. Founders who live the problem they are solving tend to understand it at a deeper level than those who spot it from a distance.\n\nQ: Why does he say most obvious startup ideas are already taken?\nA: Because the obvious ones have been visible to many people for a long time. The best opportunities are often ones that look like bad ideas at first glance, which is why they are still available.`,
    },
  },
  {
    icon: "🔍",
    name: "Search",
    tagline: "Find anything inside the content",
    color: "green",
    border: "border-green-500/20",
    bg: "bg-green-500/5",
    badge: "bg-green-500/10 text-green-300 border-green-500/20",
    how: "Type a specific question or topic and Prismiq scans the entire content to find and answer it. Instead of ctrl+F on a page, you get a direct, clear answer written in natural language. Works especially well for long videos or PDFs where finding one detail would take forever.",
    example: {
      input: "Search: How does attention work in transformers?",
      label: "Search Result",
      output: "Attention allows the model to look at every other word in the sentence when deciding what a given word means. Instead of reading left to right like older models, the transformer can weigh the relevance of any word to any other word in a single step, which is why it handles long-range relationships in text so well.",
    },
  },
  {
    icon: "🃏",
    name: "Flashcards",
    tagline: "Turn any content into study cards",
    color: "amber",
    border: "border-amber-500/20",
    bg: "bg-amber-500/5",
    badge: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    how: "Prismiq pulls out the key concepts and turns them into flip cards. Click a card to reveal the answer, mark ones you know, and navigate with the arrow keys. A completion screen shows your score when you finish the deck. Works for any content type.",
    example: {
      input: "PDF: Introduction to Machine Learning",
      label: "Flashcard example",
      output: "Front: What is overfitting in machine learning?\nBack: When a model learns the training data too well, including its noise and quirks, and then performs poorly on new data it has never seen. The model memorizes instead of generalizing.",
    },
  },
  {
    icon: "📊",
    name: "Quiz",
    tagline: "Test yourself with real questions",
    color: "rose",
    border: "border-rose-500/20",
    bg: "bg-rose-500/5",
    badge: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    how: "Prismiq creates a 6-question multiple choice quiz based on the content. Pick an answer and get instant feedback in green or red, plus a short explanation of why the correct answer is right. Your final score and a question-by-question breakdown appear at the end.",
    example: {
      input: "YouTube: How the Internet Works",
      label: "Quiz question example",
      output: "Q: What does DNS stand for and what does it do?\nA. Dynamic Network System — it speeds up connections\nB. Domain Name System — it translates domain names into IP addresses ✓\nC. Data Navigation Service — it routes traffic between servers\nD. Digital Node Structure — it organizes network nodes",
    },
  },
  {
    icon: "📖",
    name: "Glossary",
    tagline: "Every key term, defined clearly",
    color: "cyan",
    border: "border-cyan-500/20",
    bg: "bg-cyan-500/5",
    badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    how: "Prismiq extracts the 8 to 12 most important terms, names, and concepts from the content and writes a clean definition for each one in plain language. Perfect for technical articles, research papers, or any video packed with terminology you want to remember.",
    example: {
      input: "Article: Quantum Computing Explained",
      label: "Glossary entries",
      output: "Qubit: The basic unit of quantum information, similar to a classical bit but able to exist in a superposition of both 0 and 1 at the same time, which gives quantum computers their unique power.\n\nEntanglement: A phenomenon where two qubits become linked so that the state of one instantly affects the other, regardless of the distance between them.",
    },
  },
  {
    icon: "💬",
    name: "Chat",
    tagline: "Ask anything, get real answers",
    color: "purple",
    border: "border-purple-500/20",
    bg: "bg-purple-500/5",
    badge: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    how: "After analyzing any content, a chat box appears below your result. Ask follow-up questions, request simpler explanations, or go deeper on any specific point. Prismiq keeps the full content in context so answers are always accurate and specific to what you shared. Chat does not use your scan quota.",
    example: {
      input: "After getting a summary of a video...",
      label: "Chat example",
      output: "You: Can you explain the RLHF part in simpler terms?\n\nPrismiq: Sure. After the model is trained on a massive amount of text, it can predict words well but it does not know what humans actually want. RLHF is how they fix that. Human raters compare pairs of responses and say which one is better. The model then learns to produce the kind of answers people prefer, which is why it feels helpful rather than just statistically likely.",
    },
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-25"
          style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.4) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <main className="relative z-10 flex flex-col items-center px-4 pt-28 pb-24 min-h-screen">

        {/* Hero */}
        <div className="text-center mb-16 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Every feature, explained
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            How Prismiq works
          </h1>
          <p className="text-white/50 text-lg leading-relaxed">
            Eight ways to understand any content — from a quick summary to a full quiz. Here is what each one does and when to use it.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity">
            Try it now →
          </Link>
        </div>

        {/* Features */}
        <div className="w-full max-w-3xl space-y-6">
          {features.map((f) => (
            <div key={f.name} className={`rounded-2xl border ${f.border} ${f.bg} p-6`}>
              {/* Header */}
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shrink-0">
                  {f.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-white font-bold text-lg">{f.name}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${f.badge}`}>{f.tagline}</span>
                  </div>
                  <p className="text-white/55 text-sm leading-relaxed">{f.how}</p>
                </div>
              </div>

              {/* Example */}
              <div className="rounded-xl border border-white/8 bg-black/20 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/8 bg-white/[0.02]">
                  <span className="text-white/25 text-xs truncate">{f.example.input}</span>
                  <span className={`ml-auto shrink-0 text-xs px-2 py-0.5 rounded-full border ${f.badge}`}>{f.example.label}</span>
                </div>
                <div className="px-4 py-4">
                  {f.example.output.split("\n").map((line, i) => {
                    if (line.startsWith("##")) return <h3 key={i} className="text-white/80 font-semibold text-sm mt-3 mb-1 first:mt-0">{line.replace(/^##\s*/, "")}</h3>;
                    if (line.startsWith("Q:")) return <p key={i} className="text-violet-300 text-sm font-medium mt-3 first:mt-0">{line}</p>;
                    if (line.startsWith("A:") || line.startsWith("Back:")) return <p key={i} className="text-white/60 text-sm mt-1 leading-relaxed">{line}</p>;
                    if (line.startsWith("Front:")) return <p key={i} className="text-white/80 text-sm font-medium">{line}</p>;
                    if (line.startsWith("You:")) return <p key={i} className="text-violet-300 text-sm font-medium mt-3 first:mt-0">{line}</p>;
                    if (line.startsWith("Prismiq:")) return <p key={i} className="text-white/60 text-sm mt-1 leading-relaxed">{line}</p>;
                    if (line.trim() === "") return <div key={i} className="h-1" />;
                    return <p key={i} className="text-white/60 text-sm leading-relaxed">{line}</p>;
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-14">
          <p className="text-white/40 text-sm mb-4">Ready to try it yourself?</p>
          <Link href="/"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold hover:opacity-90 transition-opacity">
            Start for free →
          </Link>
          <p className="text-white/20 text-xs mt-3">No account needed to try</p>
        </div>
      </main>
    </>
  );
}
