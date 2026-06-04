/* ============================================================
   COMPAGNON — ClaudeCodeAdapter
   Talks to the local sidecar, which shells out to the Claude Code
   CLI (your Max subscription, no paid API). Prompt building and
   output parsing live in prompts.ts / parse.ts.
   ============================================================ */

import type { Flashcard } from "@/lib/types";
import type {
  CardSuggestion,
  LLMAdapter,
  RoleplayMessage,
  SuggestOptions,
  TagSuggestion,
} from "./types";
import { palComplete, palHealth } from "./client";
import { roleplayPrompt, suggestPrompt, tagPrompt } from "./prompts";
import { asCardSuggestions, asRoleplayMessage, asTagSuggestion, extractJSON } from "./parse";

export class ClaudeCodeAdapter implements LLMAdapter {
  readonly id = "claude-code";
  readonly label = "Claude Code (Max)";

  async isAvailable(): Promise<boolean> {
    return (await palHealth()).ok;
  }

  async suggestCards(opts: SuggestOptions): Promise<CardSuggestion[]> {
    const text = await palComplete(suggestPrompt(opts));
    return asCardSuggestions(extractJSON(text));
  }

  async tagCard(card: Pick<Flashcard, "front" | "back" | "type">): Promise<TagSuggestion> {
    const text = await palComplete(tagPrompt(card));
    return asTagSuggestion(extractJSON(text));
  }

  async roleplayTurn(history: RoleplayMessage[], draft: string): Promise<RoleplayMessage> {
    const text = await palComplete(roleplayPrompt(history, draft));
    return asRoleplayMessage(extractJSON(text));
  }
}

export const claudeCodeAdapter = new ClaudeCodeAdapter();
