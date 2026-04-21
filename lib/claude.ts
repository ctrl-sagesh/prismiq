import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type Action = "summarize" | "notes" | "qa" | "search";

export async function processWithClaude(
  content: string,
  action: Action,
  searchQuery?: string
): Promise<string> {
  const prompts: Record<Action, string> = {
    summarize: `You are an expert summarizer. Summarize the following content clearly and concisely.
Cover the main topic, key points, and important conclusions. Use markdown formatting with headers and bullet points.

Content:
${content}`,

    notes: `You are an expert note-taker. Extract the most important information from the following content and organize it as structured study notes.
Use markdown with clear headers (##), sub-headers (###), bullet points, and bold key terms.

Content:
${content}`,

    qa: `You are an expert educator. Generate 8-12 insightful questions and detailed answers based on the following content.
Format as:
**Q1: [Question]**
A: [Detailed answer]

Cover key concepts, important details, and anything a student should understand.

Content:
${content}`,

    search: `You are an expert researcher. The user wants to find specific information from the content below.

User's query: "${searchQuery}"

Search through the content and provide a detailed, focused answer to the query. Quote relevant sections if helpful. Use markdown formatting.

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
    summarize: "Analyze this image and provide a clear, structured summary of all the information, text, diagrams, or concepts visible. Use markdown formatting.",
    notes: "Extract all important information from this image and organize it as structured study notes with headers, bullet points, and bold key terms.",
    qa: "Generate 6-10 questions and detailed answers based on everything visible in this image. Format as **Q1: [Question]** followed by A: [Answer]",
    search: `The user wants to find: "${searchQuery}". Search this image for that specific information and provide a detailed answer.`,
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
