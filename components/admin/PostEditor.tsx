"use client"

import { useTranslations } from "next-intl"
import { Textarea } from "@/components/ui/textarea"
import dynamic from "next/dynamic"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const MarkdownRenderer = dynamic(
  () => import("@/components/blog/MarkdownRenderer").then((mod) => ({ default: mod.MarkdownRenderer })),
  { ssr: false, loading: () => <div className="animate-pulse h-48 rounded bg-muted" /> }
)

interface PostEditorProps {
  value: string
  onChange: (value: string) => void
}

export function PostEditor({ value, onChange }: PostEditorProps) {
  const t = useTranslations("admin")

  return (
    <Tabs defaultValue="write" className="w-full">
      <TabsList>
        <TabsTrigger value="write">{t("write")}</TabsTrigger>
        <TabsTrigger value="preview">{t("preview")}</TabsTrigger>
      </TabsList>
      <TabsContent value="write">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("markdownPlaceholder")}
          className="min-h-[400px] font-mono text-sm"
        />
      </TabsContent>
      <TabsContent value="preview" className="border rounded-md p-4 min-h-[400px]">
        {value ? (
          <MarkdownRenderer content={value} />
        ) : (
          <p className="text-muted-foreground">{t("nothingToPreview")}</p>
        )}
      </TabsContent>
    </Tabs>
  )
}
