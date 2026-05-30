import { describe, expect, it } from "@jest/globals"

import { buildGraphData } from "@/lib/graph"

const uncategorized = null

describe("buildGraphData", () => {
  it("builds directed links from wiki-link targets", () => {
    const graph = buildGraphData([
      {
        id: "post-a",
        title: "Alpha Note",
        slug: "alpha-note",
        content: "A link to [[Beta Note]].",
        category: { name: "Ideas" },
      },
      {
        id: "post-b",
        title: "Beta Note",
        slug: "beta-note",
        content: null,
        category: { name: "Ideas" },
      },
    ])

    expect(graph.links).toEqual([{ source: "post-a", target: "post-b" }])
    expect(graph.nodes).toEqual([
      { id: "post-a", title: "Alpha Note", slug: "alpha-note", group: "Ideas", val: 1 },
      { id: "post-b", title: "Beta Note", slug: "beta-note", group: "Ideas", val: 1 },
    ])
  })

  it("resolves links by slug and ignores duplicates or self-links", () => {
    const graph = buildGraphData([
      {
        id: "post-a",
        title: "Alpha",
        slug: "alpha",
        content: "[[beta]] [[Beta]] [[alpha]]",
        category: uncategorized,
      },
      {
        id: "post-b",
        title: "Beta",
        slug: "beta",
        content: "",
        category: uncategorized,
      },
    ])

    expect(graph.links).toEqual([{ source: "post-a", target: "post-b" }])
    expect(graph.nodes[0]).toMatchObject({ group: "uncategorized", val: 1 })
  })

  it("keeps isolated posts visible", () => {
    const graph = buildGraphData([
      {
        id: "post-a",
        title: "Alpha",
        slug: "alpha",
        content: "No graph links here.",
        category: uncategorized,
      },
    ])

    expect(graph).toEqual({
      nodes: [{ id: "post-a", title: "Alpha", slug: "alpha", group: "uncategorized", val: 0 }],
      links: [],
    })
  })
})
