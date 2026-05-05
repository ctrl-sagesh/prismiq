import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type Action = "summarize" | "notes" | "qa" | "search";
export type SummarizeMode = "brief" | "detailed";

const NO_BULLETS = `IMPORTANT: Do NOT use bullet points, dashes, or hyphens at the start of lines. Do NOT use markdown symbols like *, -, or • as list markers. Write everything in natural flowing paragraphs like a human would write. Only use numbered lists if absolutely necessary for steps.`;

export async function processWithClaude(
  content: string,
  action: Action,
  searchQuery?: string,
  summarizeMode?: SummarizeMode
): Promise<string> {
  const prompts: Record<Action, string> = {
    summarize: action === "summarize" && summarizeMode === "brief"
      ? `Read the following content and write a SHORT, punchy summary in 3 to 5 sentences max. Write the way a smart friend would explain it in 30 seconds — casual, clear, no jargon. ${NO_BULLETS}

Content:
${content}`
      : `Read the following content and write a thorough, well-organized summary the way a knowledgeable friend would explain it. Use clear natural headings for major topics. Write full paragraphs under each heading. Cover all the important points. ${NO_BULLETS}

Content:
${content}`,

    notes: `Read the following content and create study notes the way a smart student would write them. Use clear headings for each topic. Under each heading write 2 to 4 short natural sentences explaining the key ideas in your own words. ${NO_BULLETS}

Content:
${content}`,

    qa: `Read the following content and write 8 to 10 thoughtful questions and answers covering the most important ideas. Write questions a curious student would actually ask. Write answers as a knowledgeable teacher would — in 2 to 4 clear natural sentences. Format each one exactly as:

Q: [question here]
A: [answer here in natural sentences]

${NO_BULLETS}

Content:
${content}`,

    search: `The user wants to find this specific information: "${searchQuery}"

Read through the content below and answer their question directly and naturally, as if you are a helpful expert explaining it to them. Be specific and clear. Write in normal conversational sentences. ${NO_BULLETS}

Content:
${content}`,
  };

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
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
    search: `The user is looking for: "${searchQuery}". Look at this image and find that specific information. Answer directly and clearly in normal conversational sentences. ${NO_BULLETS}`,
  };

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
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
