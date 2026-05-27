# 性能优化清单

> 最后更新：2026-05-27
> 基于全量代码审计生成

---

## 当前优化状态

| 类别 | 状态 | 说明 |
|------|------|------|
| Prisma 查询并行化 | ✅ | `getPublishedPosts` 等多处使用 `Promise.all` |
| KnowledgeGraph 动态导入 | ✅ | `next/dynamic` + `{ ssr: false }` |
| 搜索防抖 | ✅ | SearchDialog 200ms debounce |
| useCallback/useMemo | ✅ | KnowledgeGraph 内所有 handler 已 memoize |
| Server/Client 边界 | ✅ | 仅 7 个组件标记 `"use client"`，边界合理 |
| SessionProvider 隔离 | ✅ | SessionProviderWrapper 独立 client 组件 |
| POST_INCLUDES 复用 | ✅ | `lib/queries.ts` 共享 include 常量 |
| Graph API 缓存 | ✅ | `Cache-Control: s-maxage=3600, stale-while-revalidate=86400` |
| Tailwind v4 tree-shaking | ✅ | 自动清除未使用样式 |
| next/font/google | ✅ | 字体自托管 + `font-display: swap` |

---

## 待修复项

### P0 — 影响核心体验

#### 1. Backlinks 全表加载

- **文件**: `components/blog/Backlinks.tsx`
- **问题**: 每次文章页加载时，查询**所有**已发布文章的 `content` 字段到内存，再用 JS 正则逐篇匹配。文章多了之后内存和 CPU 开销巨大
- **修复方案**: 预计算 wiki-link 关系到数据库表，或用 `Prisma contains` 做数据库层预筛选（已有部分实现，但正则二次匹配仍加载全文）。可将 link 关系在 `lib/graph.ts` 构建时写入缓存/数据库

#### 2. 首页 force-dynamic

- **文件**: `app/page.tsx:7`
- **问题**: `export const dynamic = "force-dynamic"` 导致每个请求都查数据库。首页展示知识图谱数据，变化不频繁
- **修复方案**: 改为 `export const revalidate = 60` 或与 `/posts` 页面合并（首页已不是文章列表，是图谱，图谱 API 已有 CDN 缓存）

#### 3. 没有使用 next/image

- **文件**: `components/blog/CommentSection.tsx`, `components/blog/CommentForm.tsx`
- **问题**: GitHub 头像用 `<img>` 标签，无 width/height/alt，导致 CLS 且不走 Next.js 图片优化
- **修复方案**: 将 `<img>` 替换为 `<Image>`，配置 `next.config.ts` 的 `images.remotePatterns` 允许 `avatars.githubusercontent.com`

#### 4. highlight.js 打入客户端 JS

- **文件**: `components/blog/MarkdownRenderer.tsx`
- **问题**: `rehype-highlight` 将完整的 highlight.js (~250KB) 打包进客户端。PostEditor 的预览 tab 每次都会加载
- **修复方案**: 在 PostEditor 中对预览 tab 使用 `next/dynamic` 延迟加载 MarkdownRenderer；或在 MarkdownRenderer 中动态 import `rehype-highlight`

---

### P1 — 中等影响

#### 5. 5 个 Google Fonts（含 2 个 CJK 字体）

- **文件**: `app/layout.tsx:11-36`
- **问题**: `Noto_Sans_SC` + `Noto_Serif_SC` 各含 3 个 weight，CJK 字体文件很大。`subsets: ["latin"]` 对 CJK 字体无效
- **修复方案**: 考虑移除 `Dancing_Script`（仅品牌文字用），CJK 字体降级到 2 个 weight，或改用系统字体栈 + `font-display: optional`

#### 6. 搜索使用 ILIKE 全文扫描

- **文件**: `lib/queries.ts:108-123`, `app/api/search/route.ts`
- **问题**: `content: { contains: q, mode: "insensitive" }` 转换为 `ILIKE '%q%'`，无法使用 B-tree 索引，全表扫描
- **修复方案**: 搜索只搜 `title` 和 `summary`（不含 `content`），或引入 PostgreSQL 全文搜索（`tsvector` + GIN 索引）

#### 7. 缺少 `publishedAt` 索引

- **文件**: `prisma/schema.prisma`
- **问题**: `getPublishedPosts` 按 `publishedAt` 过滤，但复合索引是 `[published, createdAt]`
- **修复方案**: 添加 `@@index([published, publishedAt(sort: Desc)])`

#### 8. 后台文章列表无分页

- **文件**: `app/admin/posts/page.tsx:10`
- **问题**: `getAllPosts()` 一次性加载全部文章，文章多了会慢
- **修复方案**: 改为分页查询，与前台 `getPublishedPosts` 一致

#### 9. PostEditor 预览每次按键都重新渲染 Markdown

- **文件**: `components/admin/PostEditor.tsx`
- **问题**: 编辑区每次输入都触发 MarkdownRenderer 完整渲染（react-markdown + 4 plugins）
- **修复方案**: 用 `useMemo` 包裹渲染结果，或加 debounce 延迟预览更新

---

### P2 — 低影响 / 锦上添花

#### 10. highlight.js 暗色主题不跟随手动切换

- **文件**: `app/globals.css:5`
- **问题**: `github-dark.css` 用 `prefers-color-scheme: dark` 媒体查询，但站点用 `next-themes` 的 class 策略（`.dark` 类）。手动切换暗色时代码块不会变暗
- **修复方案**: 将 `github-dark.css` 改为 `.dark { ... }` 选择器包裹，或用 `data-theme` 属性条件加载

#### 11. generateStaticParams 只预生成 5 篇

- **文件**: `app/posts/[slug]/page.tsx:16`
- **问题**: `pageSize: 5` 导致旧文章首次访问有 ISR 冷启动
- **修复方案**: 增大到 20-50，或移除 `generateStaticParams` 纯靠 ISR

#### 12. 搜索 API 无 Cache-Control

- **文件**: `app/api/search/route.ts`
- **修复方案**: 添加 `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`

#### 13. MarkdownRenderer 插件数组每次渲染重建

- **文件**: `components/blog/MarkdownRenderer.tsx:15-16`
- **修复方案**: 将 `remarkPlugins` 和 `rehypePlugins` 数组提取为模块级常量

#### 14. KnowledgeGraph 节点尺寸重复计算

- **文件**: `components/blog/KnowledgeGraph.tsx:153, 189`
- **修复方案**: 用 `useMemo` 预计算 `Map<id, size>`，避免每帧重复 `Math.sqrt`

#### 15. KnowledgeGraph hoveredId 线性查找

- **文件**: `components/blog/KnowledgeGraph.tsx:220`
- **修复方案**: 用 `useMemo` 建立 `Map<id, node>`，O(1) 查找

#### 16. setTimeout 缺少 cleanup

- **文件**: `components/blog/KnowledgeGraph.tsx:107`, `components/layout/SearchDialog.tsx:34`
- **修复方案**: effect cleanup 中 `clearTimeout`

#### 17. CommentForm 内联 SVG

- **文件**: `components/blog/CommentForm.tsx:82-83`
- **修复方案**: 提取为 `GithubIcon` 常量或组件

#### 18. 搜索 API 逻辑与 queries.ts 重复

- **文件**: `app/api/search/route.ts`
- **修复方案**: 统一使用 `searchPosts` 或删除其中一个

---

## 数据库索引补全

```prisma
// prisma/schema.prisma — 建议添加
model Post {
  // ...已有 @@index([published, createdAt(sort: Desc)])
  @@index([published, publishedAt(sort: Desc)])  // 补充 publishedAt 索引
}

model Comment {
  // ...已有 @@index([postId]), @@index([userId])
  @@index([approved])  // getPendingComments 过滤用
  @@index([parentId])  // 评论嵌套查询用
}
```

---

## 已确认无需优化

- `lib/queries.ts` 的 `Promise.all` 并行查询 — 已做好
- `lib/prisma.ts` 的 globalThis 单例 — 正确
- Tailwind CSS tree-shaking — v4 自动处理
- `lucide-react` named imports — tree-shakeable
- 无第三方分析脚本 — 干净
- Server/Client 组件边界 — 合理
- SearchDialog 防抖 — 已实现
- Graph API CDN 缓存 — 已配置
