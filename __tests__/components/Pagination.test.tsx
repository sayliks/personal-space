/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"

const mockT = jest.fn((key: string, params?: Record<string, unknown>) => {
  if (key === "pageInfo") return `Page ${params?.page} of ${params?.total}`
  if (key === "previous") return "Previous"
  if (key === "next") return "Next"
  return key
})

jest.mock("next-intl", () => ({
  useTranslations: () => mockT,
}))

import { Pagination } from "@/components/blog/Pagination"

describe("Pagination", () => {
  it("renders page info", () => {
    render(<Pagination page={2} totalPages={5} />)
    expect(screen.getByText("Page 2 of 5")).toBeInTheDocument()
  })

  it("renders prev link when not on first page", () => {
    render(<Pagination page={2} totalPages={5} />)
    expect(screen.getByText("Previous")).toBeInTheDocument()
    const prevLink = screen.getByText("Previous").closest("a")
    expect(prevLink).toHaveAttribute("href", "?page=1")
  })

  it("renders next link when not on last page", () => {
    render(<Pagination page={2} totalPages={5} />)
    expect(screen.getByText("Next")).toBeInTheDocument()
    const nextLink = screen.getByText("Next").closest("a")
    expect(nextLink).toHaveAttribute("href", "?page=3")
  })

  it("hides prev link on first page", () => {
    render(<Pagination page={1} totalPages={5} />)
    expect(screen.queryByText("Previous")).not.toBeInTheDocument()
  })

  it("hides next link on last page", () => {
    render(<Pagination page={5} totalPages={5} />)
    expect(screen.queryByText("Next")).not.toBeInTheDocument()
  })

  it("returns null for single-page results", () => {
    const { container } = render(<Pagination page={1} totalPages={1} />)
    expect(container.firstChild).toBeNull()
  })

  it("prepends baseUrl to page links", () => {
    render(<Pagination page={1} totalPages={3} baseUrl="/posts" />)
    const nextLink = screen.getByText("Next").closest("a")
    expect(nextLink).toHaveAttribute("href", "/posts?page=2")
  })
})
