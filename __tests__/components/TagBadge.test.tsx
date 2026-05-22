/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { TagBadge, TagList } from "@/components/blog/TagBadge"

describe("TagBadge", () => {
  it("renders the tag name", () => {
    render(<TagBadge name="TypeScript" slug="typescript" />)
    expect(screen.getByText("TypeScript")).toBeInTheDocument()
  })

  it("links to the tag slug", () => {
    render(<TagBadge name="Next.js" slug="nextjs" />)
    const link = screen.getByRole("link")
    expect(link).toHaveAttribute("href", "/tags/nextjs")
  })

  it("renders with rounded-full style", () => {
    render(<TagBadge name="CSS" slug="css" />)
    const link = screen.getByRole("link")
    expect(link.className).toContain("rounded-full")
  })
})

describe("TagList", () => {
  it("renders multiple tags", () => {
    const tags = [
      { name: "React", slug: "react" },
      { name: "TypeScript", slug: "typescript" },
      { name: "Prisma", slug: "prisma" },
    ]
    render(<TagList tags={tags} />)
    expect(screen.getByText("React")).toBeInTheDocument()
    expect(screen.getByText("TypeScript")).toBeInTheDocument()
    expect(screen.getByText("Prisma")).toBeInTheDocument()
  })

  it("returns empty container when no tags", () => {
    const { container } = render(<TagList tags={[]} />)
    expect(container.firstChild).toBeInTheDocument()
    expect(container.firstChild?.childNodes.length).toBe(0)
  })

  it("renders each tag as a link", () => {
    const tags = [{ name: "React", slug: "react" }]
    render(<TagList tags={tags} />)
    expect(screen.getByRole("link")).toHaveAttribute("href", "/tags/react")
  })
})
