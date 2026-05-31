import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import Image from "next/image"
import { SiGithub, SiX } from "react-icons/si"
import { FiMail } from "react-icons/fi"
import { GiPenguin } from "react-icons/gi"

export const dynamic = "force-static"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about")
  return {
    title: t("title"),
  }
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 sm:px-6">
      {/* Authored intro — lead with the greeting, no template title */}
      <section className="pt-14 pb-10 sm:pt-20">
        <p className="text-base font-medium text-foreground">
          你好，我是 sayliks <span className="font-serif">👋</span>
        </p>
        <div className="mt-5 space-y-5 font-serif text-[15px] leading-loose text-foreground/80">
          <p>目前是一名软件工程专业的大二学生。</p>
          <p>这个网站最开始，其实只是我想认真完成一次完整的全栈项目实践。我希望自己能真正经历一个项目从需求文档、设计、开发，到部署和后续维护的整个过程，而不是只停留在「把功能做出来」。</p>
          <p>后来慢慢发现，比起单纯做一个博客，我好像更喜欢一点点搭建属于自己的空间。</p>
          <p>所以这里不只是用来放文章。我会在这里记录学习、保存一些零散想法，也会分享最近感兴趣的东西。有时候是技术，有时候是音乐、阅读，或者一些暂时还没有整理清楚的思考（甚至只是某个深夜突然冒出来的念头）。</p>
          <p>平时我喜欢跑步、篮球和乒乓球。运动对我来说很重要，它能让我重新回到一种比较专注、平静的状态。</p>
          <p>
            音乐也是生活里不可缺少的一部分 🎧 我平时会听 R&B、欧美流行、乡村和纯音乐，最喜欢的专辑是
            <a
              href="https://music.163.com/#/album?id=75808773"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/90 underline decoration-foreground/20 underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground/40"
            >
              《東京物语》
            </a>
            。
          </p>
          <p>中度游戏爱好者，喜欢氛围好、剧情不错的游戏。</p>
          <p>有些音乐会让人很自然地安静下来，也会让人开始回忆、联想，或者单纯地发呆一会儿。</p>
          <p>除了技术之外，我也会看文学、历史、时事和一些政治相关内容。相比快速获取信息，我其实更在意自己能不能长期保持思考和感受世界的能力。</p>
          <p>我一直觉得，技术能力本身并不是目的。它更像是一种工具，让人在创造和表达的时候能够更加自由，也更加顺畅。</p>
          <p>我很喜欢简约、干净、克制的东西。无论是设计、文字，还是人与人之间的交流，我都会更偏向那些自然、不过度表达的状态。</p>
          <p>希望自己以后也能一直保持热爱、保持好奇心，慢慢成长，专注于真正重要的事情 🌱</p>
          <p>如果你也对技术、阅读、音乐或者任何其他有趣的事物感兴趣，欢迎来和我聊聊 :)</p>
        </div>
      </section>

      {/* 站外链接 — 低调的等宽排版 */}
      <section className="border-t border-border/40 py-10">
        <h2 className="mb-5 font-mono text-xs lowercase tracking-wide text-muted-foreground/50">
          站外
        </h2>
        <div className="space-y-4 font-mono text-xs text-muted-foreground/65">
          <div className="flex flex-row items-center gap-4 flex-nowrap">
            <a
              href="https://github.com/sayliks"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
              aria-label="GitHub"
            >
              <span className="inline-flex items-center gap-2">
                <SiGithub className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </span>
            </a>
            <a
              href="https://x.com/frsayliks"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
              aria-label="X"
            >
              <span className="inline-flex items-center gap-2">
                <SiX className="h-4 w-4" />
                <span className="sr-only">X</span>
              </span>
            </a>
            <a
              href="mailto:sayliks@outlook.com"
              className="transition-colors hover:text-foreground"
              aria-label="Email"
            >
              <span className="inline-flex items-center gap-2">
                <FiMail className="h-4 w-4" />
                <span className="sr-only">Email</span>
              </span>
            </a>
            <div className="relative inline-flex w-fit items-center gap-2 group">
              <button className="transition-colors hover:text-foreground" aria-label="QQ">
                <GiPenguin className="h-5 w-5 text-muted-foreground/60" aria-hidden />
                <span className="sr-only">QQ 联系</span>
              </button>

              {/* 隐藏可见的 QQ 号码，仅保留二维码悬停弹层供查看 */}
              <div className="pointer-events-none absolute bottom-full left-0 z-10 mb-3 hidden w-56 rounded-2xl border border-border/60 bg-card/95 p-3 shadow-xl backdrop-blur-sm group-hover:block group-focus-within:block">
                <Image
                  src="/images/contact/qq-qr-code.png"
                  alt="QQ 二维码"
                  width={768}
                  height={1365}
                  className="h-auto w-full rounded-lg"
                />
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground/60">
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
