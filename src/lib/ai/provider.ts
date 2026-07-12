import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import type { LanguageModelV1 } from "ai";

/**
 * Swappable model provider. Set AI_PROVIDER=openai | anthropic.
 * Optionally override the model with AI_MODEL.
 */
export function getChatModel(): LanguageModelV1 {
  const provider = process.env.AI_PROVIDER ?? "openai";
  const model = process.env.AI_MODEL;

  switch (provider) {
    case "anthropic":
      return anthropic(model ?? "claude-sonnet-4-20250514");
    case "openai":
      return openai(model ?? "gpt-4o");
    default:
      throw new Error(`Unknown AI_PROVIDER: ${provider}`);
  }
}

/** Embeddings are pinned to OpenAI (1536 dims must match the DB schema). */
export const embeddingModel = openai.embedding("text-embedding-3-small");
