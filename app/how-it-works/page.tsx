import Navbar from "@/components/Navbar";
import Link from "next/link";

const features = [
  {
    id: "summarize",
    icon: "📋",
    name: "Summarize",
    tagline: "Get the gist in seconds",
    short: "Paste anything and get a clean, natural summary. Choose between a quick 3-sentence version or a full breakdown.",
    accent: "from-violet-500/20 to-violet-600/5",
    border: "border-violet-500/25",
    pill: "bg-violet-500/10 text-violet-300 border-violet-500/20",
    dot: "bg-violet-400",
    how: "Paste any YouTube video, article, or PDF. Prismiq reads the full content and writes a summary the way a knowledgeable friend would explain it. Choose Quick overview for a 3-sentence version or Full breakdown for a detailed walkthrough of every major point.",
    when: "When you want to understand something fast without reading the whole thing.",
    example: {
      input: "youtube.com/watch?v=zjkBMFhNj_g",
      label: "Summary",
      lines: [
        { type: "p", text: "Andrej Karpathy walks through exactly how large language models work, from raw training data all the way to a working assistant. He explains why scale matters, how transformers learn by predicting the next word, and why fine-tuning on human feedback is what turns a raw model into something useful." },
        { type: "p", text: "The talk is technical but grounded, and by the end you have a real mental model of what is actually happening inside ChatGPT." },
      ],
    },
  },
  {
    id: "notes",
    icon: "📝",
    name: "Key Notes",
    tagline: "Study notes without the effort",
    short: "Prismiq organizes the most important ideas under clear headings, written in plain language like a top student's notes.",
    accent: "from-blue-500/20 to-blue-600/5",
    border: "border-blue-500/25",
    pill: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    dot: "bg-blue-400",
    how: "Prismiq reads through the content and pulls out the most important ideas, organizing them under clear topic headings. Each section is written in plain language, not copied text.",
    when: "When you want structured notes from a lecture, article, or long video without re-watching it.",
    example: {
      input: "en.wikipedia.org/wiki/Artificial_intelligence",
      label: "Key Notes",
      lines: [
        { type: "h", text: "What AI Actually Is" },
        { type: "p", text: "Artificial intelligence refers to computer systems that can perform tasks which normally require human judgment, like recognizing speech, making decisions, or translating language." },
        { type: "h", text: "The Two Main Approaches" },
        { type: "p", text: "Most modern AI relies on machine learning, where a system learns patterns from huge amounts of data instead of following hand-written rules." },
      ],
    },
  },
  {
    id: "qa",
    icon: "💡",
    name: "Q&A",
    tagline: "Questions worth asking, answered",
    short: "8 to 10 thoughtful questions about the content, each answered in clear, natural sentences.",
    accent: "from-pink-500/20 to-pink-600/5",
    border: "border-pink-500/25",
    pill: "bg-pink-500/10 text-pink-300 border-pink-500/20",
    dot: "bg-pink-400",
    how: "Prismiq generates questions a curious student would actually ask, then answers each one in 2 to 4 clear sentences. Great for checking your understanding or preparing for a test.",
    when: "When you want to make sure you understood the key points, or need to prepare for a discussion.",
    example: {
      input: "paulgraham.com/startupideas.html",
      label: "Q&A",
      lines: [
        { type: "q", text: "Q: What does Paul Graham mean by noticing a problem?" },
        { type: "a", text: "A: The best startup ideas come from noticing a real gap in your own life, not brainstorming in the abstract. Founders who live the problem they are solving tend to understand it at a deeper level." },
        { type: "q", text: "Q: Why are the obvious startup ideas already taken?" },
        { type: "a", text: "A: The obvious ones have been visible to many people for a long time. The best opportunities often look like bad ideas at first glance, which is why they are still available." },
      ],
    },
  },
  {
    id: "search",
    icon: "🔍",
    name: "Search",
    tagline: "Find anything inside the content",
    short: "Type a specific question and Prismiq finds the exact answer from within the content. No more ctrl+F.",
    accent: "from-green-500/20 to-green-600/5",
    border: "border-green-500/25",
    pill: "bg-green-500/10 text-green-300 border-green-500/20",
    dot: "bg-green-400",
    how: "Type a specific question or topic and Prismiq scans the entire content to find and answer it. You get a direct, clear answer written in natural language rather than a list of page results.",
    when: "When you need one specific fact from a long video or PDF and do not want to read through everything.",
    example: {
      input: "Search inside: How does attention work in transformers?",
      label: "Search Result",
      lines: [
        { type: "p", text: "Attention allows the model to look at every other word in the sentence when deciding what a given word means. Instead of reading left to right like older models, the transformer can weigh the relevance of any word to any other word in a single step, which is why it handles long-range relationships in text so well." },
      ],
    },
  },
  {
    id: "flashcards",
    icon: "🃏",
    name: "Flashcards",
    tagline: "Turn any content into study cards",
    short: "Flip through key concepts as cards. Mark what you know, track your progress, finish with a score.",
    accent: "from-amber-500/20 to-amber-600/5",
    border: "border-amber-500/25",
    pill: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    dot: "bg-amber-400",
    how: "Prismiq pulls out the key concepts and turns them into flip cards. Click a card to reveal the answer, mark ones you know, and navigate with the arrow keys. A completion screen shows your score at the end.",
    when: "When you want to actively memorize key terms and ideas instead of just reading them.",
    example: {
      input: "PDF: Introduction to Machine Learning",
      label: "Flashcard",
      lines: [
        { type: "card-front", text: "What is overfitting in machine learning?" },
        { type: "card-back", text: "When a model learns the training data too well, including its noise and quirks, and then performs poorly on new data it has never seen. The model memorizes instead of generalizing." },
      ],
    },
  },
  {
    id: "quiz",
    icon: "📊",
    name: "Quiz",
    tagline: "Test yourself with real questions",
    short: "A 6-question multiple choice quiz with instant feedback and a full score breakdown at the end.",
    accent: "from-rose-500/20 to-rose-600/5",
    border: "border-rose-500/25",
    pill: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    dot: "bg-rose-400",
    how: "Prismiq creates a multiple choice quiz based on the content. Pick an answer and get instant green or red feedback, plus a short explanation of why the correct answer is right. Your final score appears at the end.",
    when: "When you want to test whether you actually understood what you just read or watched.",
    example: {
      input: "YouTube: How the Internet Works",
      label: "Quiz question",
      lines: [
        { type: "q", text: "What does DNS stand for and what does it do?" },
        { type: "option-wrong", text: "A. Dynamic Network System — it speeds up connections" },
        { type: "option-correct", text: "B. Domain Name System — it translates domain names into IP addresses" },
        { type: "option-wrong", text: "C. Data Navigation Service — it routes traffic between servers" },
        { type: "option-wrong", text: "D. Digital Node Structure — it organizes network nodes" },
      ],
    },
  },
  {
    id: "glossary",
    icon: "📖",
    name: "Glossary",
    tagline: "Every key term, defined clearly",
    short: "Extracts 8 to 12 important terms and defines each one in plain, human language.",
    accent: "from-cyan-500/20 to-cyan-600/5",
    border: "border-cyan-500/25",
    pill: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    dot: "bg-cyan-400",
    how: "Prismiq extracts the most important terms, names, and concepts from the content and writes a clear definition for each one in plain language. Perfect for technical articles or research papers packed with jargon.",
    when: "When the content is full of unfamiliar terms and you want a reference you can actually read.",
    example: {
      input: "Article: Quantum Computing Explained",
      label: "Glossary",
      lines: [
        { type: "term", text: "Qubit" },
        { type: "def", text: "The basic unit of quantum information, similar to a classical bit but able to exist in a superposition of both 0 and 1 at the same time, which gives quantum computers their unique power." },
        { type: "term", text: "Entanglement" },
        { type: "def", text: "A phenomenon where two qubits become linked so that the state of one instantly affects the other, regardless of the distance between them." },
      ],
    },
  },
  {
    id: "chat",
    icon: "💬",
    name: "Chat",
    tagline: "Ask anything, get real answers",
    short: "After any scan, ask follow-up questions directly about the content. Free and unlimited.",
    accent: "from-purple-500/20 to-purple-600/5",
    border: "border-purple-500/25",
    pill: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    dot: "bg-purple-400",
    how: "After analyzing any content, a chat box appears below your result. Ask follow-up questions, request simpler explanations, or go deeper on any point. Prismiq keeps the full content in context so answers stay accurate. Chat does not use your scan quota.",
    when: "When you have a specific follow-up question after reading the summary or notes.",
    example: {
      input: "After getting a summary of a video...",
      label: "Chat",
      lines: [
        { type: "you", text: "Can you explain the RLHF part in simpler terms?" },
        { type: "ai", text: "Sure. After the model is trained on a massive amount of text, it can predict words well but it does not know what humans actually want. RLHF is how they fix that. Human raters compare pairs of responses and say which one is better. The model then learns to produce the kind of answers people prefer." },
      ],
    },
  },
];

function renderLine(line: { type: string; text: string }, i: number) {
  switch (line.type) {
    case "h": return <p key={i} className="text-white/90 font-semibold text-sm mt-3 first:mt-0">{line.text}</p>;
    case "p": return <p key={i} className="text-white/55 text-sm leading-relaxed">{line.text}</p>;
    case "q": return <p key={i} className="text-violet-300 text-sm font-medium mt-3 first:mt-0">{line.text}</p>;
    case "a": return <p key={i} className="text-white/60 text-sm leading-relaxed mt-1 ml-3">{line.text}</p>;
    case "card-front": return <div key={i} className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/80">{line.text}</div>;
    case "card-back": return <div key={i} className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-4 py-3 text-sm text-white/55 mt-2">{line.text}</div>;
    case "option-correct": return <div key={i} className="flex items-start gap-2 text-sm text-green-400 mt-1"><span className="shrink-0 mt-0.5">✓</span>{line.text}</div>;
    case "option-wrong": return <div key={i} className="flex items-start gap-2 text-sm text-white/30 mt-1"><span className="shrink-0 mt-0.5">·</span>{line.text}</div>;
    case "term": return <p key={i} className="text-white/90 font-semibold text-sm mt-3 first:mt-0">{line.text}</p>;
    case "def": return <p key={i} className="text-white/55 text-sm leading-relaxed mt-0.5">{line.text}</p>;
    case "you": return <div key={i} className="flex justify-end mt-2"><div className="bg-violet-600 text-white text-sm px-4 py-2 rounded-2xl rounded-br-sm max-w-[85%]">{line.text}</div></div>;
    case "ai": return <div key={i} className="flex justify-start mt-2"><div className="bg-white/8 border border-white/10 text-white/70 text-sm px-4 py-2 rounded-2xl rounded-bl-sm max-w-[85%] leading-relaxed">{line.text}</div></div>;
    default: return null;
  }
}

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-60 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.5) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
      </div>

      <main className="relative z-10 flex flex-col items-center px-4 pt-28 pb-24 min-h-screen">

        {/* Floating decorative icons — scattered behind the hero */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {/* Left column */}
          <div className="animate-float absolute left-[6%] top-[14%] flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-300 shadow-sm backdrop-blur-sm">
            <span>📋</span><span>Summarize</span>
          </div>
          <div className="animate-float-rev absolute left-[4%] top-[32%] flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs text-blue-300 shadow-sm backdrop-blur-sm" style={{ animationDelay: "0.8s" }}>
            <span>📝</span><span>Key Notes</span>
          </div>
          <div className="animate-float-slow absolute left-[8%] top-[52%] flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-300 shadow-sm backdrop-blur-sm" style={{ animationDelay: "1.6s" }}>
            <span>🃏</span><span>Flashcards</span>
          </div>
          <div className="animate-float absolute left-[3%] top-[70%] flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-300 shadow-sm backdrop-blur-sm" style={{ animationDelay: "2.4s" }}>
            <span>📖</span><span>Glossary</span>
          </div>
          {/* Right column */}
          <div className="animate-float-slow absolute right-[6%] top-[13%] flex items-center gap-1.5 rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1.5 text-xs text-pink-300 shadow-sm backdrop-blur-sm" style={{ animationDelay: "0.5s" }}>
            <span>💡</span><span>Q&amp;A</span>
          </div>
          <div className="animate-float absolute right-[4%] top-[30%] flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs text-green-300 shadow-sm backdrop-blur-sm" style={{ animationDelay: "1.2s" }}>
            <span>🔍</span><span>Search</span>
          </div>
          <div className="animate-float-rev absolute right-[7%] top-[50%] flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-300 shadow-sm backdrop-blur-sm" style={{ animationDelay: "2.0s" }}>
            <span>📊</span><span>Quiz</span>
          </div>
          <div className="animate-float-slow absolute right-[3%] top-[68%] flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs text-purple-300 shadow-sm backdrop-blur-sm" style={{ animationDelay: "0.3s" }}>
            <span>💬</span><span>Chat</span>
          </div>
          {/* Scattered source-type chips */}
          <div className="animate-float absolute left-[15%] top-[8%] flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/40 shadow-sm backdrop-blur-sm" style={{ animationDelay: "1.0s" }}>
            <span>▶</span><span>YouTube</span>
          </div>
          <div className="animate-float-rev absolute right-[15%] top-[7%] flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/40 shadow-sm backdrop-blur-sm" style={{ animationDelay: "1.8s" }}>
            <span>📄</span><span>PDF</span>
          </div>
          <div className="animate-float absolute left-[20%] top-[85%] flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/40 shadow-sm backdrop-blur-sm" style={{ animationDelay: "0.6s" }}>
            <span>🌐</span><span>Website</span>
          </div>
          <div className="animate-float-slow absolute right-[20%] top-[84%] flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/40 shadow-sm backdrop-blur-sm" style={{ animationDelay: "2.2s" }}>
            <span>🖼</span><span>Image</span>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center mb-14 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Every feature, explained
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">How Prismiq works</h1>
          <p className="text-white/50 text-base leading-relaxed">
            Eight ways to understand any content. Here is what each one does and when to use it.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/20">
            Try it free
          </Link>
        </div>

        {/* Floating feature grid */}
        <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-3 mb-16">
          {features.map((f) => (
            <a key={f.id} href={`#${f.id}`}
              className={`group relative rounded-2xl border bg-gradient-to-b ${f.accent} ${f.border} p-4 flex flex-col gap-2 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-pointer`}>
              <span className="text-2xl">{f.icon}</span>
              <p className="text-white font-semibold text-sm">{f.name}</p>
              <p className="text-white/40 text-xs leading-snug">{f.short}</p>
              <span className="mt-auto text-xs text-violet-400 group-hover:text-violet-300 transition-colors font-medium">
                Read more →
              </span>
            </a>
          ))}
        </div>

        {/* Feature detail sections */}
        <div className="w-full max-w-3xl space-y-5">
          {features.map((f) => (
            <div key={f.id} id={f.id}
              className={`scroll-mt-24 rounded-2xl border bg-gradient-to-b ${f.accent} ${f.border} overflow-hidden`}>

              {/* Section header */}
              <div className="flex items-center gap-4 px-6 py-5 border-b border-white/8">
                <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shrink-0">
                  {f.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-white font-bold text-base">{f.name}</h2>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${f.pill}`}>{f.tagline}</span>
                  </div>
                </div>
                <Link href="/" className={`shrink-0 text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors hover:opacity-80 ${f.pill}`}>
                  Try it
                </Link>
              </div>

              <div className="px-6 py-5 grid sm:grid-cols-2 gap-6">
                {/* Left: How + When */}
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/25 mb-1.5">How it works</p>
                    <p className="text-white/60 text-sm leading-relaxed">{f.how}</p>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] border border-white/8 px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/25 mb-1">Best used when</p>
                    <p className="text-white/55 text-sm leading-relaxed">{f.when}</p>
                  </div>
                </div>

                {/* Right: Live example */}
                <div className="rounded-xl border border-white/8 bg-black/20 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/8 bg-white/[0.02]">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${f.dot}`} />
                    <span className="text-white/25 text-xs truncate flex-1">{f.example.input}</span>
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border ${f.pill}`}>{f.example.label}</span>
                  </div>
                  <div className="px-4 py-4 space-y-1.5">
                    {f.example.lines.map((line, i) => renderLine(line, i))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-14">
          <p className="text-white/30 text-sm mb-4">Ready to try it?</p>
          <Link href="/" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/20">
            Start for free
          </Link>
          <p className="text-white/20 text-xs mt-3">No account needed to begin</p>
        </div>
      </main>
    </>
  );
}
