/**
 * Shared types for the advisory comment-moderation pipeline.
 *
 * The pipeline is three pure-ish layers:
 *   1. pre-filter (deterministic)  -> PreFilterResult
 *   2. llm        (optional, async) -> LlmVerdict | null  (null = fail-open)
 *   3. policy     (deterministic)  -> ModerationOutcome
 *
 * Nothing here enforces visibility — comments still gate on `Comment.approved`.
 * The outcome is advisory annotation shown in the admin queue.
 */

export type ModerationLabel = "spam" | "toxic" | "normal";

export type ModerationAction = "approve" | "flag-for-review" | "reject";

export interface PreFilterResult {
  /** Deterministic spam (e.g. link flood) — skip the LLM and reject outright. */
  hardBlock: boolean;
  /** Human-readable signal keys, e.g. ["excessive-links", "prohibited-term"]. */
  signals: string[];
  /** Count of URLs found in the content. */
  linkCount: number;
}

export interface LlmVerdict {
  label: ModerationLabel;
  /** Risk score in [0, 1]. */
  risk_score: number;
  reason: string;
}

export interface ModerationOutcome {
  action: ModerationAction;
  label: ModerationLabel | null;
  score: number | null;
  reason: string | null;
}
