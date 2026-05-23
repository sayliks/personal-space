"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function CommentForm({ postId }: { postId: string }) {
  const t = useTranslations("post")
  const tc = useTranslations("common")
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"
  const isLoading = status === "loading"

  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      setContent("")
      setError("")
      setSuccess(false)
    }
  }, [isAuthenticated])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!session?.user) return

    setSubmitting(true)
    setError("")

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId,
        authorName: session.user.name ?? "",
        authorEmail: session.user.email ?? "",
        userId: session.user.id,
        content,
      }),
    })

    if (res.ok) {
      setSuccess(true)
      setContent("")
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || t("failedToSubmitComment"))
    }

    setSubmitting(false)
  }

  if (isLoading) {
    return (
      <div className="border-t pt-6 mt-6">
        <p className="text-sm text-muted-foreground">{tc("loading")}</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-4 border-t pt-6 mt-6">
        <h3 className="font-semibold">{t("leaveComment")}</h3>
        <p className="text-sm text-muted-foreground">{t("loginRequiredToComment")}</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => signIn("github", { callbackUrl: window.location.href })}
        >
          <svg className="mr-2 size-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          {t("signInWithGithub")}
        </Button>
      </div>
    )
  }

  if (success) {
    return (
      <div className="border-t pt-6 mt-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          {session.user?.image && (
            <img
              src={session.user.image}
              alt=""
              className="size-6 rounded-full"
            />
          )}
          <span>{t("signedInAs", { name: session.user?.name ?? "" })}</span>
          <button
            type="button"
            onClick={() => signOut()}
            className="text-xs underline hover:text-foreground"
          >
            {t("signOut")}
          </button>
        </div>
        <p className="text-sm text-muted-foreground">{t("commentSubmitted")}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border-t pt-6 mt-6">
      <h3 className="font-semibold">{t("leaveComment")}</h3>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {session.user?.image && (
          <img
            src={session.user.image}
            alt=""
            className="size-6 rounded-full"
          />
        )}
        <span>{t("signedInAs", { name: session.user?.name ?? "" })}</span>
        <button
          type="button"
          onClick={() => signOut()}
          className="text-xs underline hover:text-foreground"
        >
          {t("signOut")}
        </button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">{t("content")}</Label>
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
        {submitting ? t("submitting") : t("submitComment")}
      </Button>
    </form>
  )
}
