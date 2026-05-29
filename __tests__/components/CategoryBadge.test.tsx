/**
 * @jest-environment jsdom
 */

import { render, within } from "@testing-library/react"
import { screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { CategoryBadge } from "@/components/blog/CategoryBadge"

describe("CategoryBadge", () => {
  it("renders the category name", () => {
    render(<CategoryBadge name="JavaScript" slug="javascript" />)
    expect(screen.getByText("JavaScript")).toBeInTheDocument()
  })

  it("links to the category slug", () => {
    render(<CategoryBadge name="React" slug="react" />)
    const link = screen.getByRole("link")
    expect(link).toHaveAttribute("href", "/categories/react")
  })

  it("applies the border style class", () => {
    render(<CategoryBadge name="CSS" slug="css" />)
    const link = screen.getByRole("link")
    expect(link.className).toContain("border")
  })
})
