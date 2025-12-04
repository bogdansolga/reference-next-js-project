import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages } from "ai";
import { readFileSync } from "fs";
import { join } from "path";

const systemPrompt = readFileSync(
  join(process.cwd(), "src/prompts/chat-system.md"),
  "utf-8"
);

const chatModel = process.env.CHAT_MODEL || "gpt-4.1-nano";

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: "OPENAI_API_KEY environment variable is not configured" },
      { status: 500 }
    );
  }

  const { messages } = await req.json();

  const result = streamText({
    model: openai(chatModel),
    system: systemPrompt,
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
