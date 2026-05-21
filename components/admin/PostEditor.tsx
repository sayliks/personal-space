"use client"

import { Textarea } from "@/components/ui/textarea"
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PostEditorProps {
  value: string
  onChange: (value: string) => void
}

export function PostEditor({ value, onChange }: PostEditorProps) {
  return (
    <Tabs defaultValue="write" className="w-full">
      <TabsList>
        <TabsTrigger value="write">Write</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>
      <TabsContent value="write">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your post in Markdown..."
          className="min-h-[400px] font-mono text-sm"
        />
      </TabsContent>
      <TabsContent value="preview" className="border rounded-md p-4 min-h-[400px]">
        {value ? (
          <MarkdownRenderer content={value} />
        ) : (
          <p className="text-muted-foreground">Nothing to preview.</p>
        )}
      </TabsContent>
    </Tabs>
  )
}
