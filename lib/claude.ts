import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";

export type Action = "summarize" | "notes" | "qa" | "search" | "flashcards" | "quiz" | "glossary";
export type SummarizeMode = "brief" | "detailed";

const NO_BULLETS = `CRITICAL WRITING RULES — follow all of these exactly:
- Write like a knowledgeable human, not an AI assistant.
- Do NOT start lines with dashes, hyphens, asterisks, bullets, or any list markers.
- Do NOT use em-dashes (—) anywhere.
- Do NOT use filler phrases like "In conclusion", "It is worth noting", "It is important to", "Delve into", "Comprehensive", "Leverage", "Furthermore", "Moreover", "Additionally" at the start of sentences.
- Do NOT start a response with "I" or "This".
- Write in full, natural paragraphs. Vary sentence length. Sound like a smart person explaining something to a friend.
- Use ## headings for major topics. Use ### for subtopics. Never use # (H1).
- Only use numbered lists for actual step-by-step sequences.`;

export async function processWithClaude(
  content: string,
  action: Action,
  searchQuery?: string,
  summarizeMode?: SummarizeMode
): Promise<string> {
  const prompts: Record<Action, string> = {
    summarize: action === "summarize" && summarizeMode === "brief"
      ? `Read the following content and write a SHORT, punchy summary in 3 to 5 sentences max. Write the way a smart friend would explain it in 30 seconds — casual, clear, no jargon. ${NO_BULLETS}\n\nContent:\n${content}`
      : `Read the following content and write a thorough, well-organized summary the way a knowledgeable friend would explain it. Use clear natural headings for major topics. Write full paragraphs under each heading. Cover all the important points. ${NO_BULLETS}\n\nContent:\n${content}`,

    notes: `Read the following content and create study notes the way a smart student would write them. Use clear headings for each topic. Under each heading write 2 to 4 short natural sentences explaining the key ideas in your own words. ${NO_BULLETS}\n\nContent:\n${content}`,

    qa: `Read the following content and write 8 to 10 thoughtful questions and answers covering the most important ideas. Write questions a curious student would actually ask. Write answers as a knowledgeable teacher would — in 2 to 4 clear natural sentences. Format each one exactly as:\n\nQ: [question here]\nA: [answer here in natural sentences]\n\n${NO_BULLETS}\n\nContent:\n${content}`,

    search: `The user wants to find this specific information: "${(searchQuery || "").replace(/["\n\r]/g, " ").slice(0, 500)}"\n\nRead through the content below and answer their question directly and naturally, as if you are a helpful expert explaining it to them. Be specific and clear. Write in normal conversational sentences. ${NO_BULLETS}\n\nContent:\n${content}`,

    flashcards: `Generate 8 to 10 flashcards for studying this content. Return ONLY a valid JSON array — no explanation, no markdown, no code blocks, just raw JSON.\n\nEach card must have "front" (a question or key term) and "back" (the answer or definition).\n\nFormat:\n[{"front":"Question or term","back":"Answer or definition"},{"front":"...","back":"..."}]\n\nContent:\n${content}`,

    quiz: `Create 6 multiple choice quiz questions from this content to test understanding. Return ONLY a valid JSON array — no explanation, no markdown, no code blocks, just raw JSON.\n\nEach item must have:\n- "question": the question string\n- "options": array of exactly 4 strings, each starting with "A. ", "B. ", "C. ", "D. "\n- "answer": just the letter "A", "B", "C", or "D"\n- "explanation": 1-2 sentences explaining why that answer is correct\n\nContent:\n${content}`,

    glossary: `Extract the 8 to 12 most important terms, concepts, or names from this content and define each one clearly in 1 to 2 natural sentences.\n\nFormat each term exactly like this — keep this exact format:\n\n**Term**: Clear definition in 1 to 2 sentences.\n\n${NO_BULLETS}\n\nContent:\n${content}`,
  };

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [{ role: "user", content: prompts[action] }],
  });

  const block = message.content[0];
  return block.type === "text" ? block.text : "";
}

export async function processImageWithClaude(
  base64Image: string,
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp",
  action: Action,
  searchQuery?: string,
  summarizeMode?: SummarizeMode
): Promise<string> {
  const instructions: Record<Action, string> = {
    summarize: summarizeMode === "brief"
      ? `Look at this image and describe what it contains in 3 to 5 clear sentences — like you are texting a friend a quick explanation. ${NO_BULLETS}`
      : `Look at this image and write a thorough description of everything it contains — any text, diagrams, data, and what it is about. Use clear headings if there are multiple sections. ${NO_BULLETS}`,
    notes: `Extract the key information from this image and write it as clean study notes. Use clear headings for each topic. Write 2 to 4 natural sentences per heading explaining the key ideas. ${NO_BULLETS}`,
    qa: `Based on this image, write 6 to 8 natural questions and answers. Format each exactly as:\n\nQ: [question]\nA: [answer in clear natural sentences]\n\n${NO_BULLETS}`,
    search: `The user is looking for: "${(searchQuery || "").replace(/["\n\r]/g, " ").slice(0, 500)}". Look at this image and find that specific information. Answer directly and clearly in normal conversational sentences. ${NO_BULLETS}`,
    flashcards: `Generate 6 to 8 flashcards based on what you see in this image. Return ONLY a valid JSON array — no explanation, no markdown, no code blocks.\n\nFormat: [{"front":"Question or term","back":"Answer or definition"},...]`,
    quiz: `Create 5 multiple choice quiz questions based on this image. Return ONLY a valid JSON array — no explanation, no markdown, no code blocks.\n\nEach item: {"question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"answer":"A","explanation":"..."}`,
    glossary: `Extract the 6 to 10 most important terms visible in this image and define each one. Format each exactly as:\n\n**Term**: Clear definition in 1 to 2 sentences.\n\n${NO_BULLETS}`,
  };

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64Image } },
          { type: "text", text: instructions[action] },
        ],
      },
    ],
  });

  const block = message.content[0];
  return block.type === "text" ? block.text : "";
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function chatWithContent(
  content: string,
  question: string,
  history: ChatMessage[]
): Promise<string> {
  const systemPrompt = `You are a helpful assistant. The user has provided the following source content and wants to ask questions about it. Answer naturally and conversationally, staying focused on the content provided. If the answer isn't in the content, say so honestly.

SOURCE CONTENT:
${content}`;

  const messages = [
    ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user" as const, content: question },
  ];

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  const block = message.content[0];
  return block.type === "text" ? block.text : "";
}
