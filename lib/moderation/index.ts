/**
 * Orchestrator for the advisory comment-moderation pipeline.
 *
 * pre-filter -> (optional) LLM verdict -> policy mapping.
 *
 * Guarantees it never throws: any unexpected error degrades to a safe
 * "flag-for-review" outcome so callers (the createComment server action) are
 * never blocked by moderation.
 */

import { getLlmVerdict } from "./llm";
import { decideModeration } from "./policy";
import { preFilter } from "./pre-filter";
import type { ModerationOutcome } from "./types";

const FAIL_OPEN: ModerationOutcome = {
  action: "flag-for-review",
  label: null,
  score: null,
  reason: null,
};

export async function moderateComment(
  content: string,
  accountAgeDays: number | null,
): Promise<ModerationOutcome> {
  try {
    const pf = preFilter(content);

    // Obvious deterministic spam — don't spend an LLM call.
    if (pf.hardBlock) {
      return decideModeration({ preFilter: pf, verdict: null, accountAgeDays });
    }

    const verdict = await getLlmVerdict(content);
    return decideModeration({ preFilter: pf, verdict, accountAgeDays });
  } catch (error) {
    console.error("[moderation] pipeline error, falling back to manual review:", error);
    return FAIL_OPEN;
  }
}

export type { ModerationOutcome } from "./types";
