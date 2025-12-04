import Anthropic from "@anthropic-ai/sdk";
import { config } from "dotenv";
import { resolve } from "path";
import { existsSync, writeFileSync } from "fs";

// Load environment variables from .env.local or .env file
const envLocalPath = resolve(process.cwd(), ".env.local");
const envPath = resolve(process.cwd(), ".env");

if (existsSync(envLocalPath)) {
  config({ path: envLocalPath });
  console.log("Loaded environment variables from .env.local");
} else if (existsSync(envPath)) {
  config({ path: envPath });
  console.log("Loaded environment variables from .env");
} else {
  console.warn("Warning: No .env.local or .env file found. Using system environment variables.");
}

/**
 * Simple script to invoke the Anthropic API
 * 
 * Usage:
 *   pnpm invoke:anthropic
 * 
 * Requires ANTHROPIC_API_KEY in .env.local file (or .env as fallback)
 */

async function main() {
  // Get API key from environment variable
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const usedModel = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929";
  const systemPrompt = process.env.ANTHROPIC_SYSTEM_PROMPT; // Optional system prompt
  
  if (!apiKey) {
    console.error("\nError: ANTHROPIC_API_KEY environment variable is required");
    console.error("\nPlease create a .env.local file in the project root with:");
    console.error("  ANTHROPIC_API_KEY=your-api-key-here");
    console.error("  ANTHROPIC_SYSTEM_PROMPT=Your system prompt (optional)");
    console.error("\nOr set it as an environment variable:");
    console.error("  ANTHROPIC_API_KEY=your-api-key pnpm invoke:anthropic\n");
    process.exit(1);
  }

  // Initialize the Anthropic client
  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  try {
    console.log("Calling Anthropic API...\n");
    if (systemPrompt) {
      console.log(`System prompt: ${systemPrompt}\n`);
    }

    // Prepare the API call parameters
    const apiParams = {
      model: usedModel,
      max_tokens: 1024,
      messages: [
        {
          role: "user" as const,
          content: "Actionează ca și un antrenor de fitness, explică GenAI pentru participanții la un curs",
        },
      ],
      ...(systemPrompt && { system: systemPrompt }),
    };

    // Make the API call
    const message = await anthropic.messages.create(apiParams);

    // Collect text content from response
    let responseText = "";
    for (const contentBlock of message.content) {
      if (contentBlock.type === "text") {
        responseText += contentBlock.text + "\n";
      }
    }

    // Display the response
    console.log("Response received:\n");
    console.log("---");
    console.log(responseText);
    console.log("---\n");
    console.log(`Usage: ${JSON.stringify(message.usage, null, 2)}`);

    // Export to Markdown file
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
    const outputDir = resolve(process.cwd(), "output");
    const outputFile = resolve(outputDir, `anthropic-response-${timestamp}.md`);
    
    // Create output directory if it doesn't exist
    if (!existsSync(outputDir)) {
      const { mkdirSync } = await import("fs");
      mkdirSync(outputDir, { recursive: true });
    }

    // Write markdown file with metadata
    const markdownContent = `# Anthropic API Response

**Model:** ${usedModel}  
**Timestamp:** ${new Date().toISOString()}  
**Input Tokens:** ${message.usage.input_tokens}  
**Output Tokens:** ${message.usage.output_tokens}  
**Total Tokens:** ${message.usage.input_tokens + message.usage.output_tokens}${systemPrompt ? `  
**System Prompt:** ${systemPrompt}` : ""}

---

${responseText}

---

## Usage Details

\`\`\`json
${JSON.stringify(message.usage, null, 2)}
\`\`\`
`;

    writeFileSync(outputFile, markdownContent, "utf-8");
    console.log(`\n✅ Response exported to: ${outputFile}`);
  } catch (error) {
    console.error("Error calling Anthropic API:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});

