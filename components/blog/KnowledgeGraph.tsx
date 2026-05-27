"use client"

import { useEffect, useRef, useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import dynamic from "next/dynamic"
import type { GraphData } from "@/lib/graph"

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false })

type ForceGraphMethods = { zoomToFit(duration?: number): void }

function hexFromOklch(l: number, c: number, h: number): string {
  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b
  const s_ = l - 0.0894841775 * a - 1.291485548 * b

  const l3 = l_ * l_ * l_
  const m3 = m_ * m_ * m_
  const s3 = s_ * s_ * s_

  let r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3
  let g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3
  let bl = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3

  r = Math.max(0, Math.min(1, r))
  g = Math.max(0, Math.min(1, g))
  bl = Math.max(0, Math.min(1, bl))

  const toHex = (v: number) =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, "0")
  return `#${toHex(r)}${toHex(g)}${toHex(bl)}`
}

const colorCache = new Map<string, string>()

function colorForGroup(group: string): string {
  const cached = colorCache.get(group)
  if (cached) return cached
  let hash = 0
  for (let i = 0; i < group.length; i++) {
    hash = group.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = ((hash % 360) + 360) % 360
  const color = hexFromOklch(0.7, 0.15, hue)
  colorCache.set(group, color)
  return color
}

type GraphNode = GraphData["nodes"][number] & {
  x?: number
  y?: number
}
interface GraphLink {
  source: string | { id: string }
  target: string | { id: string }
}

export function KnowledgeGraph() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const t = useTranslations("graph")
  const [data, setData] = useState<GraphData | null>(null)
  const [error, setError] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 })
  const containerRef = useRef<HTMLDivElement>(null)
  const fgRef = useRef<ForceGraphMethods | null>(null)

  const isDark = resolvedTheme === "dark"

  useEffect(() => {
    fetch("/api/graph")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(setData)
      .catch(() => setError(true))
  }, [])

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setDimensions({
          width: Math.floor(entry.contentRect.width),
          height: Math.floor(entry.contentRect.height),
        })
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!data || !fgRef.current) return
    const timer = setTimeout(() => fgRef.current?.zoomToFit(400), 500)
    return () => clearTimeout(timer)
  }, [data])

  const neighbors = useMemo(() => {
    if (!hoveredId || !data) return new Set<string>()
    const set = new Set<string>([hoveredId])
    for (const link of data.links) {
      const s = typeof link.source === "string" ? link.source : ""
      const t = typeof link.target === "string" ? link.target : ""
      if (s === hoveredId) set.add(t)
      if (t === hoveredId) set.add(s)
    }
    return set
  }, [hoveredId, data])

  const nodeColor = useCallback(
    (node: GraphNode) => {
      if (hoveredId && neighbors.size > 0) {
        return neighbors.has(node.id) ? colorForGroup(node.group) : "rgba(100,100,100,0.15)"
      }
      return colorForGroup(node.group)
    },
    [hoveredId, neighbors]
  )

  const linkColor = useCallback(
    (link: GraphLink) => {
      if (hoveredId && neighbors.size > 0) {
        const sourceId = typeof link.source === "string" ? link.source : link.source?.id ?? ""
        const targetId = typeof link.target === "string" ? link.target : link.target?.id ?? ""
        return neighbors.has(sourceId) && neighbors.has(targetId)
          ? "rgba(255,255,255,0.3)"
          : "rgba(100,100,100,0.05)"
      }
      return isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"
    },
    [hoveredId, neighbors, isDark]
  )

  const nodeCanvasObject = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const x = node.x ?? 0
      const y = node.y ?? 0
      const size = Math.sqrt(node.val) * 4 + 3
      const color = colorForGroup(node.group)

      ctx.shadowBlur = hoveredId === node.id ? 20 : 10
      ctx.shadowColor = color

      ctx.beginPath()
      ctx.arc(x, y, size, 0, 2 * Math.PI)
      ctx.fillStyle = nodeColor(node)
      ctx.fill()

      ctx.shadowBlur = 0

      if (globalScale > 1.2 || hoveredId === node.id || neighbors.has(node.id)) {
        const fontSize = Math.max(10, 12 / globalScale)
        ctx.font = `${fontSize}px sans-serif`
        ctx.fillStyle = isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.75)"
        ctx.textAlign = "center"
        ctx.textBaseline = "top"
        ctx.fillText(node.title, x, y + size + 4)
      }
    },
    [hoveredId, neighbors, isDark, nodeColor]
  )

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      if (node.slug) router.push(`/posts/${node.slug}`)
    },
    [router]
  )

  const nodePointerAreaPaint = useCallback(
    (node: GraphNode, color: string, ctx: CanvasRenderingContext2D) => {
      const size = Math.sqrt(node.val) * 4 + 3
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(node.x ?? 0, node.y ?? 0, size, 0, 2 * Math.PI)
      ctx.fill()
    },
    []
  )

  const handleNodeHover = useCallback(
    (node: GraphNode | null) => setHoveredId(node?.id ?? null),
    []
  )

  if (error) {
    return (
      <div className="w-full h-[60vh] min-h-[400px] max-h-[700px] rounded-lg bg-muted flex items-center justify-center">
        <span className="text-muted-foreground text-sm">{t("loadError")}</span>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="w-full h-[60vh] min-h-[400px] max-h-[700px] rounded-lg bg-muted animate-pulse flex items-center justify-center">
        <span className="text-muted-foreground text-sm">{t("loading")}</span>
      </div>
    )
  }

  const hoveredNode = hoveredId ? data.nodes.find((n) => n.id === hoveredId) : null

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[60vh] min-h-[400px] max-h-[700px] rounded-lg overflow-hidden"
      style={{ background: isDark ? "#09090b" : "#fafafa" }}
    >
      {/* @ts-expect-error ForceGraph2D generic types don't match our custom GraphNode/GraphLink */}
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor={isDark ? "#09090b" : "#fafafa"}
        nodeCanvasObject={nodeCanvasObject}
        nodePointerAreaPaint={nodePointerAreaPaint}
        linkColor={linkColor}
        linkWidth={1}
        onNodeHover={handleNodeHover}
        onNodeClick={handleNodeClick}
        cooldownTicks={100}
        warmupTicks={50}
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
      />

      {hoveredNode && (
        <div
          className="absolute top-4 left-4 px-3 py-2 rounded-md text-sm pointer-events-none"
          style={{
            background: isDark ? "rgba(9,9,11,0.9)" : "rgba(250,250,250,0.9)",
            border: `1px solid ${colorForGroup(hoveredNode.group)}`,
            color: isDark ? "#fff" : "#000",
          }}
        >
          <div className="font-medium">{hoveredNode.title}</div>
          <div className="text-xs text-muted-foreground">{hoveredNode.group}</div>
        </div>
      )}

      <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
        {t("stats", { nodes: data.nodes.length, links: data.links.length })}
      </div>
    </div>
  )
}
