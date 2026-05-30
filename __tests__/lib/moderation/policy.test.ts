import { describe, it, expect } from "@jest/globals"
import { decideModeration, REJECT_SCORE, FLAG_SCORE } from "@/lib/moderation/policy"
import type { LlmVerdict, PreFilterResult } from "@/lib/moderation/types"

const clean: PreFilterResult = { hardBlock: false, signals: [], linkCount: 0 }
const blocked: PreFilterResult = {
  hardBlock: true,
  signals: ["excessive-links"],
  linkCount: 5,
}
const verdict = (risk_score: number, label: LlmVerdict["label"] = "normal"): LlmVerdict => ({
  label,
  risk_score,
  reason: "test",
})

describe("decideModeration", () => {
  it("rejects on a deterministic hard block, ignoring the verdict", () => {
    const out = decideModeration({
      preFilter: blocked,
      verdict: verdict(0.0),
      accountAgeDays: 365,
    })
    expect(out.action).toBe("reject")
    expect(out.label).toBe("spam")
    expect(out.score).toBe(1)
  })

  it("fails open to flag-for-review when verdict is null", () => {
    const out = decideModeration({ preFilter: clean, verdict: null, accountAgeDays: 10 })
    expect(out.action).toBe("flag-for-review")
    expect(out.label).toBeNull()
    expect(out.score).toBeNull()
    expect(out.reason).toBeNull()
  })

  it("rejects at REJECT_SCORE", () => {
    const out = decideModeration({
      preFilter: clean,
      verdict: verdict(REJECT_SCORE, "spam"),
      accountAgeDays: null,
    })
    expect(out.action).toBe("reject")
    expect(out.label).toBe("spam")
  })

  it("rejects above REJECT_SCORE", () => {
    const out = decideModeration({
      preFilter: clean,
      verdict: verdict(REJECT_SCORE + 0.001, "spam"),
      accountAgeDays: null,
    })
    expect(out.action).toBe("reject")
  })

  it("flags just below REJECT_SCORE", () => {
    const out = decideModeration({
      preFilter: clean,
      verdict: verdict(REJECT_SCORE - 0.001),
      accountAgeDays: null,
    })
    expect(out.action).toBe("flag-for-review")
  })

  it("flags at FLAG_SCORE", () => {
    const out = decideModeration({
      preFilter: clean,
      verdict: verdict(FLAG_SCORE),
      accountAgeDays: null,
    })
    expect(out.action).toBe("flag-for-review")
  })

  it("flags above FLAG_SCORE", () => {
    const out = decideModeration({
      preFilter: clean,
      verdict: verdict(FLAG_SCORE + 0.001),
      accountAgeDays: null,
    })
    expect(out.action).toBe("flag-for-review")
  })

  it("approves just below FLAG_SCORE", () => {
    const out = decideModeration({
      preFilter: clean,
      verdict: verdict(FLAG_SCORE - 0.001),
      accountAgeDays: null,
    })
    expect(out.action).toBe("approve")
  })

  it("notes an established account when approving", () => {
    const out = decideModeration({
      preFilter: clean,
      verdict: verdict(0.1),
      accountAgeDays: 60,
    })
    expect(out.action).toBe("approve")
    expect(out.reason).toContain("established account")
  })

  it("carries pre-filter signals into the reason even when safe", () => {
    const out = decideModeration({
      preFilter: { hardBlock: false, signals: ["prohibited-term"], linkCount: 0 },
      verdict: verdict(0.1),
      accountAgeDays: 5,
    })
    expect(out.action).toBe("approve")
    expect(out.reason).toContain("prohibited-term")
    expect(out.reason).toContain("new account")
  })
})
