export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="max-w-4xl mx-auto flex items-center justify-between h-14 px-4 text-sm text-muted-foreground">
        <span>&copy; {new Date().getFullYear()} My Blog</span>
        <span>
          Built with <a href="https://nextjs.org" className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">Next.js</a> + <a href="https://ui.shadcn.com" className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">shadcn/ui</a>
        </span>
      </div>
    </footer>
  )
}
