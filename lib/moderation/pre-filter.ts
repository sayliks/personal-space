/**
 * Layer 1 — deterministic pre-filter.
 *
 * Pure, dependency-free, and cheap. Runs before any LLM call so obvious spam
 * (link floods) can be rejected without spending a token. Other heuristics are
 * recorded as *signals* and left for the policy layer to weigh — only the link
 * flood is a hard block.
 */

import { COMMENT_MAX_LENGTH } from "@/lib/validations";
import type { PreFilterResult } from "./types";

/** More than this many links in one comment is treated as a hard spam block. */
export const MAX_LINKS = 3;

/**
 * Small curated list of terms that, if present, raise a "prohibited-term"
 * signal (advisory only — the policy layer decides what to do with it).
 * Kept intentionally short; extend via review feedback rather than scope creep.
 */
export const PROHIBITED_TERMS: readonly string[] = [
  "viagra",
  "casino",
  "porn",
  "crypto airdrop",
  "free money",
];

const URL_PATTERN = /https?:\/\//gi;

export function preFilter(content: string): PreFilterResult {
  const signals: string[] = [];

  const linkCount = (content.match(URL_PATTERN) ?? []).length;
  if (linkCount > MAX_LINKS) {
    signals.push("excessive-links");
  }

  const lower = content.toLowerCase();
  if (PROHIBITED_TERMS.some((term) => lower.includes(term))) {
    signals.push("prohibited-term");
  }

  // Length is already enforced by createCommentSchema; we only note when a
  // comment sits near the cap as a weak signal, never a block.
  if (content.length >= COMMENT_MAX_LENGTH) {
    signals.push("at-length-limit");
  }

  return {
    hardBlock: linkCount > MAX_LINKS,
    signals,
    linkCount,
  };
}
