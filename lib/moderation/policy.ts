/**
 * Layer 3 — policy mapping.
 *
 * Pure function that combines the deterministic pre-filter, the optional LLM
 * verdict, and the only available trust signal (account age) into a single
 * advisory ModerationOutcome. Thresholds are named constants so they're easy
 * to audit and tune.
 *
 * IMPORTANT: a null verdict is the fail-open path (no API key, or the LLM call
 * / parse failed). It must always degrade to "flag-for-review", never block.
 */

import type {
  LlmVerdict,
  ModerationOutcome,
  PreFilterResult,
} from "./types";

/** risk_score at or above this recommends rejection. */
export const REJECT_SCORE = 0.85;
/** risk_score at or above this recommends manual review. */
export const FLAG_SCORE = 0.4;
/** Accounts at least this old are considered established (a confirming nudge). */
export const TRUSTED_ACCOUNT_DAYS = 30;

export function decideModeration(args: {
  preFilter: PreFilterResult;
  verdict: LlmVerdict | null;
  accountAgeDays: number | null;
}): ModerationOutcome {
  const { preFilter, verdict, accountAgeDays } = args;

  // Deterministic hard block (link flood) — reject without an LLM opinion.
  if (preFilter.hardBlock) {
    return {
      action: "reject",
      label: "spam",
      score: 1,
      reason: `Deterministic block: ${preFilter.signals.join(", ")}`,
    };
  }

  // Fail-open: no verdict available -> leave for the human reviewer.
  if (verdict === null) {
    return { action: "flag-for-review", label: null, score: null, reason: null };
  }

  const action =
    verdict.risk_score >= REJECT_SCORE
      ? "reject"
      : verdict.risk_score >= FLAG_SCORE
        ? "flag-for-review"
        : "approve";

  // Carry pre-filter signals into the reason so the reviewer sees them even
  // when the LLM rated the comment safe. Account age only nudges the reason.
  const notes: string[] = [];
  if (preFilter.signals.length > 0) {
    notes.push(`signals: ${preFilter.signals.join(", ")}`);
  }
  if (action === "approve" && accountAgeDays !== null) {
    notes.push(
      accountAgeDays >= TRUSTED_ACCOUNT_DAYS
        ? "established account"
        : "new account",
    );
  }

  const reason =
    notes.length > 0 ? `${verdict.reason} (${notes.join("; ")})` : verdict.reason;

  return {
    action,
    label: verdict.label,
    score: verdict.risk_score,
    reason,
  };
}
