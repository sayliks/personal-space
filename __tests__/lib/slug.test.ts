import { describe, it, expect } from "@jest/globals"
import { generateSlug } from "@/lib/slug"

describe("generateSlug", () => {
  it("converts basic text to kebab-case", () => {
    expect(generateSlug("Hello World")).toBe("hello-world")
  })

  it("removes special characters", () => {
    expect(generateSlug("Hello! @World #2024")).toBe("hello-world-2024")
  })

  it("keeps Chinese characters", () => {
    expect(generateSlug("学习的本质")).toBe("学习的本质")
  })

  it("handles empty string with fallback", () => {
    const result = generateSlug("")
    expect(result).toMatch(/^post-/)
  })

  it("handles punctuation-only input", () => {
    const result = generateSlug("!@#$%")
    expect(result).toMatch(/^post-/)
  })

  it("trims leading and trailing whitespace", () => {
    expect(generateSlug("  hello world  ")).toBe("hello-world")
  })

  it("collapses multiple spaces into single dash", () => {
    expect(generateSlug("hello    world")).toBe("hello-world")
  })
})
