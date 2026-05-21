"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export function DeletePostButton({ postId }: { postId: string }) {
  const [confirming, setConfirming] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    await fetch(`/api/posts?id=${postId}`, { method: "DELETE" })
    router.refresh()
  }

  if (!confirming) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
        <Trash2 className="size-4 text-destructive" />
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <Button variant="destructive" size="sm" onClick={handleDelete}>
        Confirm
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
        Cancel
      </Button>
    </div>
  )
}
