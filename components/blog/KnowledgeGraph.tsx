"use client"

import * as d3 from "d3"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useTranslations } from "next-intl"

import type { GraphData } from "@/lib/graph"

type GraphNode = GraphData["nodes"][number] & d3.SimulationNodeDatum
type GraphLink = d3.SimulationLinkDatum<GraphNode> & {
  source: string | GraphNode
  target: string | GraphNode
}

type GraphDatum = {
  links: GraphLink[]
  nodes: GraphNode[]
}

type TooltipState = {
  group: string
  links: number
  title: string
  x: number
  y: number
} | null

type LinkSelection = d3.Selection<SVGLineElement, GraphLink, SVGGElement, unknown>
type NodeSelection = d3.Selection<SVGCircleElement, GraphNode, SVGGElement, unknown>
type LabelSelection = d3.Selection<SVGTextElement, GraphNode, SVGGElement, unknown>

const MIN_RADIUS = 2.8
const MAX_RADIUS = 7.4
const NEBULA_BACKGROUND =
  "radial-gradient(circle at 18% 18%, rgba(129, 140, 248, 0.16), transparent 30%), radial-gradient(circle at 78% 24%, rgba(56, 189, 248, 0.09), transparent 28%), radial-gradient(circle at 46% 78%, rgba(168, 85, 247, 0.1), transparent 34%), radial-gradient(circle at 78% 82%, rgba(34, 197, 94, 0.045), transparent 30%), linear-gradient(180deg, #060913 0%, #0b0f1a 52%, #070a12 100%)"

const GROUP_PALETTE = {
  ai: "#9f8fe8",
  note: "#87909f",
  people: "#d89a62",
  project: "#78b98b",
  system: "#78c8dc",
}

function getNodeId(node: string | GraphNode): string {
  return typeof node === "string" ? node : node.id
}

function getNodeRadius(node: Pick<GraphNode, "val">): number {
  return Math.min(MAX_RADIUS, MIN_RADIUS + Math.sqrt(Math.max(0, node.val)) * 1.35)
}

function getNodeTone(group: string): string {
  const normalized = group.toLowerCase()

  if (
    normalized.includes("ai") ||
    normalized.includes("llm") ||
    normalized.includes("model") ||
    normalized.includes("智能")
  ) {
    return GROUP_PALETTE.ai
  }

  if (
    normalized.includes("tool") ||
    normalized.includes("system") ||
    normalized.includes("tech") ||
    normalized.includes("开发") ||
    normalized.includes("技术") ||
    normalized.includes("分享")
  ) {
    return GROUP_PALETTE.system
  }

  if (
    normalized.includes("person") ||
    normalized.includes("people") ||
    normalized.includes("作者") ||
    normalized.includes("人物")
  ) {
    return GROUP_PALETTE.people
  }

  if (
    normalized.includes("project") ||
    normalized.includes("workspace") ||
    normalized.includes("产品") ||
    normalized.includes("项目")
  ) {
    return GROUP_PALETTE.project
  }

  return GROUP_PALETTE.note
}

function shouldShowDefaultLabel(node: GraphNode, nodes: GraphNode[]): boolean {
  if (node.val >= 4) return true

  const ranked = [...nodes].sort((a, b) => b.val - a.val).slice(0, 4)
  return node.val > 0 && ranked.some((rankedNode) => rankedNode.id === node.id)
}

function cloneGraphData(data: GraphData, activeGroups: Set<string>): GraphDatum {
  const nodes = data.nodes
    .filter((node) => activeGroups.has(node.group))
    .map((node) => ({ ...node }))
  const visibleIds = new Set(nodes.map((node) => node.id))

  const links = data.links
    .filter((link) => visibleIds.has(link.source) && visibleIds.has(link.target))
    .map((link) => ({ ...link }))

  return { nodes, links }
}

function buildAdjacency(links: GraphLink[]) {
  const adjacency = new Map<string, Set<string>>()

  for (const link of links) {
    const source = getNodeId(link.source)
    const target = getNodeId(link.target)
    if (!adjacency.has(source)) adjacency.set(source, new Set())
    if (!adjacency.has(target)) adjacency.set(target, new Set())
    adjacency.get(source)?.add(target)
    adjacency.get(target)?.add(source)
  }

  return adjacency
}

function isConnected(adjacency: Map<string, Set<string>>, a: string, b: string): boolean {
  return a === b || Boolean(adjacency.get(a)?.has(b))
}

export function KnowledgeGraph() {
  const t = useTranslations("graph")
  const [data, setData] = useState<GraphData | null>(null)
  const [error, setError] = useState(false)
  const [dimensions, setDimensions] = useState({ height: 620, width: 960 })
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeGroups, setActiveGroups] = useState<Set<string>>(new Set())
  const [tooltip, setTooltip] = useState<TooltipState>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const viewportRef = useRef<SVGGElement>(null)
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null)
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const linkSelectionRef = useRef<LinkSelection | null>(null)
  const nodeSelectionRef = useRef<NodeSelection | null>(null)
  const glowSelectionRef = useRef<NodeSelection | null>(null)
  const labelSelectionRef = useRef<LabelSelection | null>(null)

  useEffect(() => {
    fetch("/api/graph")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((graph: GraphData) => {
        setData(graph)
        setActiveGroups(new Set(graph.nodes.map((node) => node.group)))
      })
      .catch(() => setError(true))
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      setDimensions({
        height: Math.max(520, Math.floor(entry.contentRect.height)),
        width: Math.max(320, Math.floor(entry.contentRect.width)),
      })
    })

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const groups = useMemo(() => {
    if (!data) return []
    return Array.from(new Set(data.nodes.map((node) => node.group))).sort((a, b) =>
      a.localeCompare(b)
    )
  }, [data])

  const graph = useMemo(() => {
    if (!data) return null
    return cloneGraphData(data, activeGroups)
  }, [activeGroups, data])

  const adjacency = useMemo(() => buildAdjacency(graph?.links ?? []), [graph])
  const nodeById = useMemo(() => {
    const map = new Map<string, GraphNode>()
    for (const node of graph?.nodes ?? []) map.set(node.id, node)
    return map
  }, [graph])

  const selectedNode = selectedId ? nodeById.get(selectedId) ?? null : null
  const searchId = useMemo(() => {
    if (!graph || !searchQuery.trim()) return null

    const query = searchQuery.trim().toLowerCase()
    const match = graph.nodes.find(
      (node) => node.title.toLowerCase().includes(query) || node.group.toLowerCase().includes(query)
    )

    return match?.id ?? null
  }, [graph, searchQuery])

  const selectedConnections = useMemo(() => {
    if (!selectedNode) return []
    const connectionIds = adjacency.get(selectedNode.id) ?? new Set<string>()
    return Array.from(connectionIds)
      .map((id) => nodeById.get(id))
      .filter((node): node is GraphNode => Boolean(node))
      .sort((a, b) => b.val - a.val || a.title.localeCompare(b.title))
  }, [adjacency, nodeById, selectedNode])

  const focusNode = useCallback((node: GraphNode, scale = 1.7) => {
    const svg = svgRef.current
    const zoom = zoomRef.current
    if (!svg || !zoom || node.x == null || node.y == null) return

    d3.select(svg)
      .transition()
      .duration(650)
      .ease(d3.easeCubicOut)
      .call(
        zoom.transform,
        d3.zoomIdentity
          .translate(dimensions.width / 2, dimensions.height / 2)
          .scale(scale)
          .translate(-node.x, -node.y)
      )
  }, [dimensions.height, dimensions.width])

  const updateGraphStyles = useCallback(
    (activeId: string | null, selected: string | null, found: string | null) => {
      if (!graph) return

      const nodes = nodeSelectionRef.current
      const glowNodes = glowSelectionRef.current
      const links = linkSelectionRef.current
      const labels = labelSelectionRef.current
      if (!nodes || !glowNodes || !links || !labels) return

      const focusId = activeId ?? selected ?? found

      nodes
        .transition()
        .duration(180)
        .attr("r", (node) => {
          const base = getNodeRadius(node)
          if (node.id === selected) return base + 3.4
          if (node.id === activeId || node.id === found) return base + 1.8
          return base
        })
        .attr("opacity", (node) => {
          if (!focusId) return 0.86
          return isConnected(adjacency, focusId, node.id) ? 0.98 : 0.16
        })
        .attr("stroke", (node) =>
          node.id === selected ? "rgba(255,255,255,0.86)" : "rgba(255,255,255,0.46)"
        )
        .attr("stroke-width", (node) => (node.id === selected ? 1.8 : node.id === activeId ? 1.15 : 0.45))

      glowNodes
        .transition()
        .duration(180)
        .attr("r", (node) => {
          const base = getNodeRadius(node) + 5
          if (node.id === selected) return base + 9
          return node.id === activeId || node.id === found ? base + 5 : base
        })
        .attr("opacity", (node) => {
          if (!focusId) return node.val > 0 ? 0.16 : 0.065
          if (node.id === selected) return 0.42
          return isConnected(adjacency, focusId, node.id) ? 0.26 : 0.018
        })

      links
        .transition()
        .duration(180)
        .attr("opacity", (link) => {
          if (!focusId) return 0.42
          const source = getNodeId(link.source)
          const target = getNodeId(link.target)
          return source === focusId || target === focusId ? 0.82 : 0.035
        })
        .attr("stroke-width", (link) => {
          if (!focusId) return 0.55
          const source = getNodeId(link.source)
          const target = getNodeId(link.target)
          return source === focusId || target === focusId ? 1.1 : 0.35
        })

      labels
        .transition()
        .duration(180)
        .attr("opacity", (node) => {
          if (node.id === selected || node.id === activeId || node.id === found) return 0.92
          if (focusId && isConnected(adjacency, focusId, node.id)) return 0.58
          return shouldShowDefaultLabel(node, graph.nodes) ? 0.32 : 0
        })
    },
    [adjacency, graph]
  )

  useEffect(() => {
    if (!graph || !svgRef.current || !viewportRef.current) return

    simulationRef.current?.stop()
    const svg = d3.select(svgRef.current)
    const viewport = d3.select(viewportRef.current)
    viewport.selectAll("*").remove()

    const defs = svg.select("defs")
    defs.selectAll("*").remove()
    defs
      .append("filter")
      .attr("id", "graph-node-glow")
      .attr("x", "-90%")
      .attr("y", "-90%")
      .attr("width", "280%")
      .attr("height", "280%")
      .append("feGaussianBlur")
      .attr("stdDeviation", 4.2)
      .attr("result", "coloredBlur")

    const linkLayer = viewport.append("g").attr("class", "graph-links")
    const nodeLayer = viewport.append("g").attr("class", "graph-nodes")
    const labelLayer = viewport.append("g").attr("class", "graph-labels")

    const links = linkLayer
      .selectAll<SVGLineElement, GraphLink>("line")
      .data(graph.links)
      .join("line")
      .attr("stroke", "rgba(168, 181, 216, 0.16)")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 0.55)

    const glowNodes = nodeLayer
      .selectAll<SVGCircleElement, GraphNode>("circle.graph-node-glow")
      .data(graph.nodes)
      .join("circle")
      .attr("class", "graph-node-glow")
      .attr("r", (node) => getNodeRadius(node) + 5)
      .attr("fill", (node) => getNodeTone(node.group))
      .attr("opacity", 0.14)
      .attr("filter", "url(#graph-node-glow)")
      .style("pointer-events", "none")

    const nodes = nodeLayer
      .selectAll<SVGCircleElement, GraphNode>("circle.graph-node")
      .data(graph.nodes)
      .join("circle")
      .attr("class", "graph-node")
      .attr("r", (node) => getNodeRadius(node))
      .attr("fill", (node) => getNodeTone(node.group))
      .attr("stroke", "rgba(255,255,255,0.46)")
      .attr("stroke-width", 0.45)
      .style("cursor", "grab")

    const labels = labelLayer
      .selectAll<SVGTextElement, GraphNode>("text")
      .data(graph.nodes)
      .join("text")
      .attr("dy", (node) => getNodeRadius(node) + 12)
      .attr("text-anchor", "middle")
      .attr("fill", "rgba(220, 229, 247, 0.72)")
      .attr("font-size", 10.5)
      .attr("font-family", "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace")
      .attr("letter-spacing", 0)
      .attr("paint-order", "stroke")
      .attr("stroke", "rgba(6, 9, 19, 0.86)")
      .attr("stroke-width", 2.4)
      .attr("stroke-linejoin", "round")
      .style("pointer-events", "none")
      .text((node) => node.title)

    linkSelectionRef.current = links
    nodeSelectionRef.current = nodes
    glowSelectionRef.current = glowNodes
    labelSelectionRef.current = labels

    nodes
      .on("pointerenter", (event, node) => {
        setHoveredId(node.id)
        setTooltip({
          group: node.group,
          links: node.val,
          title: node.title,
          x: event.offsetX,
          y: event.offsetY,
        })
      })
      .on("pointermove", (event, node) => {
        setTooltip({
          group: node.group,
          links: node.val,
          title: node.title,
          x: event.offsetX,
          y: event.offsetY,
        })
      })
      .on("pointerleave", () => {
        setHoveredId(null)
        setTooltip(null)
      })
      .on("click", (event, node) => {
        event.stopPropagation()
        node.fx = node.x
        node.fy = node.y
        setSelectedId(node.id)
        focusNode(node, 1.55)
      })
      .on("dblclick", (event, node) => {
        event.stopPropagation()
        node.fx = null
        node.fy = null
        simulationRef.current?.alphaTarget(0.08).restart()
        window.setTimeout(() => simulationRef.current?.alphaTarget(0), 250)
      })
      .call(
        d3
          .drag<SVGCircleElement, GraphNode>()
          .on("start", (event, node) => {
            if (!event.active) simulationRef.current?.alphaTarget(0.08).restart()
            node.fx = node.x
            node.fy = node.y
            d3.select(event.sourceEvent.target).style("cursor", "grabbing")
          })
          .on("drag", (event, node) => {
            node.fx = event.x
            node.fy = event.y
          })
          .on("end", (event) => {
            if (!event.active) simulationRef.current?.alphaTarget(0)
            d3.select(event.sourceEvent.target).style("cursor", "grab")
          })
      )

    svg.on("click", (event) => {
      const target = event.target as SVGElement | null
      if (target === svgRef.current || target?.tagName.toLowerCase() === "rect") {
        setSelectedId(null)
        setSearchQuery("")
      }
    })

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.35, 4])
      .on("zoom", (event) => {
        viewport.attr("transform", event.transform.toString())
      })
    zoomRef.current = zoom
    svg.call(zoom)

    const centerX = dimensions.width / 2
    const centerY = dimensions.height / 2
    const simulation = d3
      .forceSimulation<GraphNode>(graph.nodes)
      .force(
        "link",
        d3
          .forceLink<GraphNode, GraphLink>(graph.links)
          .id((node) => node.id)
          .distance((link) => {
            const source = typeof link.source === "string" ? null : link.source
            const target = typeof link.target === "string" ? null : link.target
            const importance = Math.max(source?.val ?? 0, target?.val ?? 0)
            return Math.max(96, 150 - importance * 7)
          })
          .strength(0.14)
      )
      .force(
        "charge",
        d3.forceManyBody<GraphNode>().strength((node) => -122 - Math.min(node.val, 8) * 15)
      )
      .force("collide", d3.forceCollide<GraphNode>().radius((node) => getNodeRadius(node) + 16))
      .force("center", d3.forceCenter(centerX, centerY).strength(0.34))
      .force("x", d3.forceX<GraphNode>(centerX).strength(0.014))
      .force("y", d3.forceY<GraphNode>(centerY).strength(0.014))
      .alpha(0.92)
      .alphaDecay(0.04)
      .velocityDecay(0.46)
      .on("tick", () => {
        links
          .attr("x1", (link) => (link.source as GraphNode).x ?? centerX)
          .attr("y1", (link) => (link.source as GraphNode).y ?? centerY)
          .attr("x2", (link) => (link.target as GraphNode).x ?? centerX)
          .attr("y2", (link) => (link.target as GraphNode).y ?? centerY)

        nodes.attr("cx", (node) => node.x ?? centerX).attr("cy", (node) => node.y ?? centerY)
        glowNodes.attr("cx", (node) => node.x ?? centerX).attr("cy", (node) => node.y ?? centerY)
        labels.attr("x", (node) => node.x ?? centerX).attr("y", (node) => node.y ?? centerY)
      })

    simulationRef.current = simulation
    updateGraphStyles(null, null, null)

    return () => {
      simulation.stop()
      svg.on(".zoom", null)
      svg.on("click", null)
      linkSelectionRef.current = null
      nodeSelectionRef.current = null
      glowSelectionRef.current = null
      labelSelectionRef.current = null
    }
  }, [dimensions.height, dimensions.width, focusNode, graph, updateGraphStyles])

  useEffect(() => {
    updateGraphStyles(hoveredId, selectedId, searchId)
  }, [hoveredId, searchId, selectedId, updateGraphStyles])

  useEffect(() => {
    const match = searchId ? nodeById.get(searchId) : null
    if (!match) return

    window.setTimeout(() => focusNode(match, 2), 80)
  }, [focusNode, nodeById, searchId])

  const toggleGroup = (group: string) => {
    setActiveGroups((current) => {
      const next = new Set(current)
      if (next.has(group)) {
        next.delete(group)
      } else {
        next.add(group)
      }
      return next.size === 0 ? current : next
    })
  }

  const resetFilters = () => {
    if (!data) return
    setActiveGroups(new Set(data.nodes.map((node) => node.group)))
  }

  if (error) {
    return (
      <div className="flex h-[70vh] min-h-[560px] w-full items-center justify-center bg-[#070b14]">
        <span className="font-mono text-xs text-slate-500">{t("loadError")}</span>
      </div>
    )
  }

  if (!data) {
    return (
      <div
        className="flex h-[70vh] min-h-[560px] w-full animate-pulse items-center justify-center"
        style={{ background: NEBULA_BACKGROUND }}
      >
        <span className="font-mono text-xs text-slate-500">{t("loading")}</span>
      </div>
    )
  }

  if (data.nodes.length === 0) {
    return (
      <div
        className="flex h-[70vh] min-h-[560px] w-full items-center justify-center"
        style={{ background: NEBULA_BACKGROUND }}
      >
        <span className="font-mono text-xs text-slate-500">{t("empty")}</span>
      </div>
    )
  }

  return (
    <section
      ref={containerRef}
      className="relative h-[74vh] min-h-[640px] w-full overflow-hidden shadow-[0_44px_120px_rgba(0,0,0,0.34)]"
      style={{ background: NEBULA_BACKGROUND }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px)] [background-size:52px_52px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:radial-gradient(rgba(255,255,255,0.22)_0.7px,transparent_0.7px)] [background-size:29px_29px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.12)_46%,rgba(0,0,0,0.48)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      <svg ref={svgRef} className="absolute inset-0 h-full w-full touch-none" role="img">
        <defs />
        <rect width="100%" height="100%" fill="transparent" />
        <g ref={viewportRef} />
      </svg>

      <div className="absolute left-5 top-5 flex max-w-[calc(100%-2.5rem)] flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="graph-search">
          {t("searchLabel")}
        </label>
        <input
          id="graph-search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder={t("searchPlaceholder")}
          className="h-8 w-52 rounded-full border border-white/[0.045] bg-[#0c1220]/20 px-3.5 font-mono text-[11px] text-slate-400/80 opacity-65 outline-none backdrop-blur-xl transition placeholder:text-slate-700 hover:border-white/[0.09] hover:bg-[#101827]/30 hover:opacity-100 focus:border-cyan-200/20 focus:bg-[#101827]/38 focus:opacity-100"
        />
        <button
          type="button"
          onClick={resetFilters}
          className="h-8 rounded-full border border-white/[0.04] bg-white/[0.015] px-3.5 font-mono text-[10px] lowercase tracking-[0.14em] text-slate-600 opacity-70 backdrop-blur-xl transition hover:border-white/[0.1] hover:text-slate-400 hover:opacity-100"
        >
          {t("allGroups")}
        </button>
      </div>

      <div className="absolute bottom-5 left-5 flex max-w-[calc(100%-2.5rem)] flex-wrap gap-x-4 gap-y-2">
        {groups.map((group) => {
          const active = activeGroups.has(group)
          return (
            <button
              key={group}
              type="button"
              onClick={() => toggleGroup(group)}
              className="inline-flex h-7 items-center gap-2 rounded-full border border-transparent bg-transparent px-0 font-mono text-[10px] lowercase tracking-[0.12em] text-slate-600 transition hover:text-slate-400"
              style={{ opacity: active ? 0.78 : 0.24 }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: getNodeTone(group),
                  boxShadow: active ? `0 0 8px ${getNodeTone(group)}` : "none",
                  opacity: active ? 0.9 : 0.45,
                }}
              />
              {group}
            </button>
          )
        })}
      </div>

      <div className="absolute bottom-5 right-5 font-mono text-[10px] text-slate-600">
        {t("stats", { links: graph?.links.length ?? 0, nodes: graph?.nodes.length ?? 0 })}
      </div>

      {tooltip && (
        <div
          className="pointer-events-none absolute z-20 min-w-36 rounded-md border border-white/[0.045] bg-[#0b1020]/42 px-2.5 py-1.5 text-xs text-slate-500 shadow-lg shadow-black/20 backdrop-blur-2xl"
          style={{
            left: Math.min(tooltip.x + 14, dimensions.width - 210),
            top: Math.min(tooltip.y + 14, dimensions.height - 92),
          }}
        >
          <div className="text-xs text-slate-300">{tooltip.title}</div>
          <div className="mt-1 font-mono text-[10px] text-slate-600">
            {tooltip.group} · {t("linkCount", { count: tooltip.links })}
          </div>
        </div>
      )}

      <aside
        className="absolute right-5 top-5 w-72 rounded-md border border-white/[0.065] bg-[#080d18]/45 p-4 text-slate-400 shadow-2xl shadow-black/25 backdrop-blur-2xl transition"
        style={{ opacity: selectedNode ? 0.96 : 0.58 }}
      >
        {selectedNode ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] lowercase tracking-[0.16em] text-slate-600">
                  {selectedNode.group}
                </p>
                <h2 className="mt-1 text-base leading-snug text-slate-200">{selectedNode.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="font-mono text-xs text-slate-600 transition hover:text-slate-300"
                aria-label={t("clearSelection")}
              >
                ×
              </button>
            </div>

            <a
              href={`/posts/${selectedNode.slug}`}
              className="mt-4 inline-block font-mono text-[11px] lowercase tracking-[0.12em] text-cyan-200/55 transition hover:text-cyan-100/90"
            >
              {t("openNote")}
            </a>

            <div className="mt-5 border-t border-white/[0.06] pt-4">
              <p className="font-mono text-[10px] lowercase tracking-[0.16em] text-slate-600">
                {t("connectedNodes", { count: selectedConnections.length })}
              </p>
              <div className="mt-3 max-h-56 space-y-2 overflow-auto pr-1">
                {selectedConnections.length > 0 ? (
                  selectedConnections.map((node) => (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(node.id)
                        focusNode(node, 1.8)
                      }}
                      className="block w-full rounded-sm border border-transparent px-2 py-1.5 text-left text-xs text-slate-400 transition hover:border-white/[0.06] hover:bg-white/[0.03] hover:text-slate-200"
                    >
                      <span
                        className="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle"
                        style={{ backgroundColor: getNodeTone(node.group) }}
                      />
                      {node.title}
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-slate-600">{t("noConnections")}</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div>
            <p className="font-mono text-[10px] lowercase tracking-[0.16em] text-slate-600">
              {t("details")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{t("selectHint")}</p>
          </div>
        )}
      </aside>
    </section>
  )
}
