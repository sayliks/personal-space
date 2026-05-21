import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 min-h-[50vh]">
      <p className="text-6xl font-bold text-muted-foreground/30">404</p>
      <h2 className="text-xl font-semibold">页面未找到</h2>
      <p className="text-muted-foreground text-sm max-w-md text-center">
        你访问的页面不存在，可能已被移除或地址输入有误。
      </p>
      <Link
        href="/"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        返回首页
      </Link>
    </div>
  );
}
