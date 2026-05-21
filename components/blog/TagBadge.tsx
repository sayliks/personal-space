import Link from "next/link"

export function TagBadge({ name, slug }: { name: string; slug: string }) {
  return (
    <Link
      href={`/tags/${slug}`}
      className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
    >
      {name}
    </Link>
  )
}

export function TagList({ tags }: { tags: { name: string; slug: string }[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <TagBadge key={tag.slug} name={tag.name} slug={tag.slug} />
      ))}
    </div>
  )
}
