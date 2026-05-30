"use client"

import { useRef } from "react"
import { useTranslations } from "next-intl"

interface InlineAddFormProps {
  action: (formData: FormData) => void
  placeholder: string
  label: string
}

export function InlineAddForm({ action, placeholder, label }: InlineAddFormProps) {
  const formRef = useRef<HTMLFormElement>(null)

  useTranslations("studio")

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await action(formData)
        formRef.current?.reset()
      }}
      className="flex items-center gap-3 max-w-md"
    >
      <input
        name="name"
        placeholder={placeholder}
        required
        className="flex-1 bg-transparent border-b border-border/30 focus:border-border/60 px-1 py-2 text-sm outline-none transition-colors duration-300 placeholder:text-muted-foreground/40"
      />
      <button
        type="submit"
        className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-foreground/5 hover:bg-foreground/10 border border-border/20 hover:border-border/40 rounded-lg text-sm font-medium transition-all duration-300"
      >
        <span>+</span>
        <span>{label}</span>
      </button>
    </form>
  )
}
