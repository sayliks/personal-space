/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/react"
import "@testing-library/jest-dom"

// MarkdownRenderer wraps react-markdown (ESM), so we mock it shallowly.
// The integration of remark/rehype plugins is tested via E2E (homepage.spec.ts).

jest.mock("react-markdown", () => {
  const MockReactMarkdown = ({ children }: { children: string }) => (
    <div data-testid="markdown-content">{children}</div>
  )
  return { __esModule: true, default: MockReactMarkdown }
})
jest.mock("remark-gfm", () => ({}))
jest.mock("remark-math", () => ({}))
jest.mock("rehype-highlight", () => ({}))
jest.mock("rehype-katex", () => ({}))
jest.mock("rehype-slug", () => ({}))
jest.mock("rehype-raw", () => ({}))
jest.mock("@/lib/remark-wiki-link", () => ({ remarkWikiLink: () => (tree: unknown) => tree }))

import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer"

describe("MarkdownRenderer", () => {
  it("renders content inside a prose article", () => {
    const { container } = render(<MarkdownRenderer content="Hello" />)
    const article = container.querySelector("article")
    expect(article).toBeInTheDocument()
    expect(article).toHaveClass("prose")
  })
})
