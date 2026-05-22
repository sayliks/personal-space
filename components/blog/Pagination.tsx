"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"

interface PaginationProps {
  page: number
  totalPages: number
  baseUrl?: string
}

export function Pagination({ page, totalPages, baseUrl = "" }: PaginationProps) {
  const t = useTranslations("pagination")

  if (totalPages <= 1) return null

  return (
    <nav className="flex items-center justify-center gap-2 pt-8">
      {page > 1 && (
        <Link
          href={`${baseUrl}?page=${page - 1}`}
          className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
        >
          {t("previous")}
        </Link>
      )}
      <span className="text-sm text-muted-foreground">
        {t("pageInfo", { page, total: totalPages })}
      </span>
      {page < totalPages && (
        <Link
          href={`${baseUrl}?page=${page + 1}`}
          className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
        >
          {t("next")}
        </Link>
      )}
    </nav>
  )
}
