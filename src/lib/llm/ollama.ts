/* ============================================================
   COMPAGNON — OllamaAdapter (stub)
   Placeholder for a fully-local Ollama/Mistral backend. Not
   implemented yet — reports unavailable so it never activates.
   TODO(india): route through the sidecar (add an "ollama" backend
   to sidecar/server.mjs calling http://localhost:11434/api/chat),
   then mirror ClaudeCodeAdapter here. See docs/LLM.md.
   ============================================================ */

import type { Flashcard } from "@/lib/types";
import type {
  CardSuggestion,
  LLMAdapter,
  RoleplayMessage,
  SuggestOptions,
  TagSuggestion,
} from "./types";

const NOT_IMPLEMENTED = "The Ollama backend isn't implemented yet — install Ollama and see docs/LLM.md.";

export class OllamaAdapter implements LLMAdapter {
  readonly id = "ollama";
  readonly label = "Ollama (local)";

  async isAvailable(): Promise<boolean> {
    return false;
  }

  async suggestCards(_opts: SuggestOptions): Promise<CardSuggestion[]> {
    throw new Error(NOT_IMPLEMENTED);
  }

  async tagCard(_card: Pick<Flashcard, "front" | "back" | "type">): Promise<TagSuggestion> {
    throw new Error(NOT_IMPLEMENTED);
  }

  async roleplayTurn(_history: RoleplayMessage[], _draft: string): Promise<RoleplayMessage> {
    throw new Error(NOT_IMPLEMENTED);
  }
}

export const ollamaAdapter = new OllamaAdapter();
