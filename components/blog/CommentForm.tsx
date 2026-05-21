"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function CommentForm({ postId }: { postId: string }) {
  const [authorName, setAuthorName] = useState("")
  const [authorEmail, setAuthorEmail] = useState("")
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId,
        authorName,
        authorEmail: authorEmail || undefined,
        content,
      }),
    })

    if (res.ok) {
      setSuccess(true)
      setAuthorName("")
      setAuthorEmail("")
      setContent("")
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || "Failed to submit comment")
    }

    setSubmitting(false)
  }

  if (success) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        Comment submitted. It will appear after approval.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border-t pt-6 mt-6">
      <h3 className="font-semibold">Leave a Comment</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email (optional)</Label>
          <Input
            id="email"
            type="email"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Comment *</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          required
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  )
}
