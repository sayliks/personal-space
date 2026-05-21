import Link from "next/link"

export function CategoryBadge({
  name,
  slug,
}: {
  name: string
  slug: string
}) {
  return (
    <Link
      href={`/categories/${slug}`}
      className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium hover:bg-muted transition-colors"
    >
      {name}
    </Link>
  )
}
