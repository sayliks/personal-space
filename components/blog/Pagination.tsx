import Link from "next/link"

interface PaginationProps {
  page: number
  totalPages: number
  baseUrl?: string
}

export function Pagination({ page, totalPages, baseUrl = "" }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav className="flex items-center justify-center gap-2 pt-8">
      {page > 1 && (
        <Link
          href={`${baseUrl}?page=${page - 1}`}
          className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
        >
          Previous
        </Link>
      )}
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      {page < totalPages && (
        <Link
          href={`${baseUrl}?page=${page + 1}`}
          className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
        >
          Next
        </Link>
      )}
    </nav>
  )
}
