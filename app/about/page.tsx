import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About",
  description: "About this blog",
}

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">About</h1>
      <div className="prose prose-neutral dark:prose-invert">
        <p>
          Welcome to my personal blog. Here I write about things I find interesting
          — technology, programming, and life.
        </p>
        <p>
          This blog is built with Next.js, shadcn/ui, Prisma, and deployed on Vercel.
          It&apos;s a space for me to share thoughts and document my learning journey.
        </p>
        <p>
          Feel free to explore and leave comments on posts you find interesting.
        </p>
      </div>
    </div>
  )
}
