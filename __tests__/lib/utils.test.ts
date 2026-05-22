import { describe, it, expect } from "@jest/globals"
import { formatDate, formatDateLong, cn } from "@/lib/utils"

describe("formatDate", () => {
  it("formats a Date object as yyyy-MM-dd", () => {
    expect(formatDate(new Date(2026, 0, 15))).toBe("2026-01-15")
  })

  it("formats an ISO string as yyyy-MM-dd", () => {
    expect(formatDate("2026-05-22")).toBe("2026-05-22")
  })

  it("pads single-digit months and days", () => {
    expect(formatDate(new Date(2026, 0, 1))).toBe("2026-01-01")
  })
})

describe("formatDateLong", () => {
  it("formats a Date in long format", () => {
    const result = formatDateLong(new Date(2026, 0, 15))
    expect(result).toBe("January 15, 2026")
  })

  it("formats an ISO string in long format", () => {
    const result = formatDateLong("2026-05-22")
    expect(result).toBe("May 22, 2026")
  })
})

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2")
  })

  it("resolves tailwind conflicts", () => {
    expect(cn("px-4", "px-2")).toBe("px-2")
  })

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "extra")).toBe("base extra")
  })

  it("handles empty input", () => {
    expect(cn()).toBe("")
  })
})
