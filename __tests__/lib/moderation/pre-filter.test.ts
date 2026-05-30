import { describe, it, expect } from "@jest/globals"
import { preFilter, MAX_LINKS } from "@/lib/moderation/pre-filter"
import { COMMENT_MAX_LENGTH } from "@/lib/validations"

const links = (n: number) =>
  Array.from({ length: n }, (_, i) => `https://example${i}.com`).join(" ")

describe("preFilter", () => {
  it("passes a normal comment with no signals", () => {
    const r = preFilter("Thanks, this was a really helpful post!")
    expect(r.hardBlock).toBe(false)
    expect(r.signals).toEqual([])
    expect(r.linkCount).toBe(0)
  })

  it("hard-blocks comments with more than MAX_LINKS links", () => {
    const r = preFilter(links(MAX_LINKS + 1))
    expect(r.hardBlock).toBe(true)
    expect(r.signals).toContain("excessive-links")
    expect(r.linkCount).toBe(MAX_LINKS + 1)
  })

  it("does not block at exactly MAX_LINKS links (boundary)", () => {
    const r = preFilter(links(MAX_LINKS))
    expect(r.hardBlock).toBe(false)
    expect(r.signals).not.toContain("excessive-links")
    expect(r.linkCount).toBe(MAX_LINKS)
  })

  it("flags prohibited terms case-insensitively without hard-blocking", () => {
    const r = preFilter("Buy cheap VIAGRA now")
    expect(r.signals).toContain("prohibited-term")
    expect(r.hardBlock).toBe(false)
  })

  it("flags a comment at the length limit", () => {
    const r = preFilter("a".repeat(COMMENT_MAX_LENGTH))
    expect(r.signals).toContain("at-length-limit")
    expect(r.hardBlock).toBe(false)
  })

  it("counts http and https links", () => {
    const r = preFilter("see http://a.com and https://b.com")
    expect(r.linkCount).toBe(2)
  })
})
