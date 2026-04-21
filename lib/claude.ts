import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type Action = "summarize" | "notes" | "qa" | "search";

export async function processWithClaude(
  content: string,
  action: Action,
  searchQuery?: string
): Promise<string> {
  const prompts: Record<Action, string> = {
    summarize: `Read the following content and write a clear, natural summary the way a knowledgeable friend would explain it — not like a robot generating bullet points. Use plain conversational language. Organize it with a few meaningful sections if needed, but keep it flowing and easy to read. Avoid excessive formatting, dashes, or symbols. Write in full sentences.

Content:
${content}`,

    notes: `Read the following content and create study notes the way a smart student would write them — organized, clear, and in your own words. Use natural headings for topics, short paragraphs or clean bullet points only where they genuinely help. Write as if explaining to a classmate. Avoid robotic lists and excessive symbols.

Content:
${content}`,

    qa: `Read the following content and write 8 to 10 thoughtful questions and answers that cover the most important ideas. Write questions a curious student would actually ask. Write answers as a knowledgeable teacher would — in clear, natural sentences, not robotic lists. Format each one as:

Q: [question]
A: [answer in 2-4 natural sentences]

Content:
${content}`,

    search: `The user wants to find this specific information: "${searchQuery}"

Read through the content below and answer their question directly and naturally, as if you're a helpful expert explaining it to them. Use their exact words in your answer. Be specific and clear. Write in normal conversational sentences.

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
  searchQuery?: string
): Promise<string> {
  const instructions: Record<Action, string> = {
    summarize: "Look at this image and describe what it contains in clear, natural language — like you're explaining it to a friend. Cover the main content, any text visible, and what it's about. Write in flowing sentences, not robotic bullet points.",
    notes: "Extract the key information from this image and write it as clean study notes. Use natural language and organize it logically. Write the way a good student would take notes — clear, in your own words, easy to review later.",
    qa: "Based on this image, write 6 to 8 natural questions and answers. Format each as:\n\nQ: [question]\nA: [answer in clear sentences]",
    search: `The user is looking for: "${searchQuery}". Look at this image and find that specific information. Answer directly and clearly in normal conversational sentences.`,
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
