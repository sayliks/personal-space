# 代码审查与文档优化记录

> 每 5 分钟自动审查，只审查和提交文档，不修改业务代码。

---

## 审查 #9 — 2026-05-28 00:15

**分支**: master (ahead of origin by 22 commits)
**未提交业务变更** (20 files, +229/-176): 继续修复审查 #7 遗留问题 + 测试修复

### #9 已修复项目

**i18n**:

- ✅ [中] KnowledgeGraph.tsx — "Failed to load graph" → `t("loadError")`，"nodes · links" → `t("stats")`
- ✅ [低] Header.tsx — 缩进修复 + `sayliks&apos;s blog` → `{t("siteTitle")}`
- ✅ [低] ThemeToggle.tsx — `aria-label="Toggle theme"` → `aria-label={t("toggleTheme")}`
- ✅ [低] SearchDialog.tsx — 移除多余 `"搜索中..."` 回退
- ✅ messages/en.json + zh.json — 添加 `common.toggleTheme`、`common.siteTitle`、`graph.loadError`、`graph.stats`

**可访问性**:

- ✅ [中] CommentSection.tsx — 头像 `alt=""` → `alt={comment.authorName}`

**一致性**:

- ✅ [中] search/route.ts — 改用 `searchPosts()` from lib/queries.ts，不再直接调用 Prisma

**错误处理**:

- ✅ [中] Backlinks.tsx — `.catch()` 添加 `console.error` 日志
- ✅ [中] KnowledgeGraph.tsx — setTimeout 添加清理函数
- ✅ [中] SearchDialog.tsx — setTimeout 添加清理函数

**死代码**:

- ✅ [低] lib/markdown.ts — 删除未使用的 `getExcerpt` 和 `stripMarkdown`

**测试**:

- ✅ MarkdownRenderer.test.tsx — 添加 `jest.mock("rehype-raw")` 解决 ESM 兼容性

### #9 审查结论

**变更合理，继续系统性解决审查 #7 遗留问题。**

- i18n 覆盖率提升：4 个硬编码字符串已国际化
- 可访问性：CommentSection 头像 alt 已修复
- 一致性：search route 遵循 CLAUDE.md 查询层约定
- 错误处理：Backlinks 日志、两个 setTimeout 清理
- 死代码清理：lib/markdown.ts 未使用函数已删除
- 无新引入问题

**剩余未修复（低优先级）**:

- Admin server actions 输入校验（formData.get → Zod）
- CommentForm.tsx 头像 `alt=""`
- validations.ts 中 createCategorySchema / createTagSchema 未使用
- Footer.tsx 空组件
- Pagination、SearchForm、AdminLayoutClient aria-label 缺失
- Admin 页面直接调用 Prisma

---

## 审查 #8 — 2026-05-28 00:00

**分支**: master (ahead of origin by 21 commits)
**未提交业务变更** (8 files, +167/-107): 批量修复审查 #7 问题

### 已修复（审查 #7 问题）

**安全**:

- ✅ [高] comments/route.ts — `userId` 不再来自请求体，改用 `session.user.id`
- ✅ [高] posts/route.ts — 标签替换改为 `prisma.$transaction()` 事务
- ✅ [高] posts/route.ts — `session.user.id!` 非空断言已移除，添加 `!session.user.id` 检查
- ✅ [中] posts/route.ts — id 使用 `z.string().cuid()` 校验（PUT + DELETE）

**错误处理**:

- ✅ [高] posts/route.ts — Prisma create/update/delete 全部加 try/catch + console.error
- ✅ [中] comments/route.ts — Prisma create + findMany 加 try/catch
- ✅ [中] graph/route.ts — catch 中添加 console.error
- ✅ [中] CommentForm.tsx — fetch 改为 try/catch/finally，`setSubmitting(false)` 放入 finally
- ✅ [中] SearchDialog.tsx — 添加 `if (!res.ok) throw`

**i18n / 一致性**:

- ✅ [高] RecentPosts.tsx — `<a>` → `<Link>`，`toLocaleDateString("zh-CN")` → `formatDate()`
- ✅ [中] 两个 route 添加 `request.json()` try/catch
- ✅ [低] SearchDialog.tsx — 移除多余的 `"搜索中..."` 回退
- ✅ [低] posts/route.ts + comments/route.ts — 添加 `export const runtime = "nodejs"`
- ✅ validations.ts — 移除 `userId` 字段

### #8 审查结论

**变更合理，是审查 #7 发现问题的系统性修复。**

- 所有 4 个高优先级安全问题已解决
- 绝大部分中优先级错误处理问题已解决
- 无新引入问题
- 剩余未修复：可访问性（alt=""、aria-label）、死代码、Admin 直接调用 Prisma

---

## 审查 #7 — 2026-05-27 23:30（全量代码审查）

**分支**: master (ahead of origin by 19 commits)
**范围**: components/ + lib/ + app/api/ + app/admin/ 全量

---

### 安全问题

**[高] app/api/comments/route.ts:28 — 客户端 userId 用于认证判断**

- `userId` 来自请求体而非 session，攻击者可传入他人 ID 冒充评论
- 修复: `userId` 应从 `session.user.id` 获取，不在请求体中接受

**[高] app/api/posts/route.ts:77 — 标签替换未使用事务**

- `deleteMany` 和 `update` 分两步执行，无 `$transaction` 包裹
- 如果 update 失败，标签已永久删除
- 修复: 用 `prisma.$transaction()` 包裹两个操作

**[高] app/api/comments/route.ts:28 — POST 处理中使用了客户端 userId**

- 客户端发送 `userId` 到服务端，服务端用它判断 `isAuthenticated`
- 应该只使用 `session.user.id`，忽略请求体中的 userId
- 修复: 从 session 获取 userId，从 schema 中移除 userId 字段

**[中] app/api/posts/route.ts:11,52 — request.json() 无 try/catch**

- 请求体非 JSON 时抛异常，返回原始 500 错误
- 修复: 包裹 try/catch，返回 400

**[中] app/api/posts/route.ts:35 — session.user.id! 非空断言**

- `authorId: session.user.id!` 使用了 `!` 断言
- 修复: 从 session 提取 id 后检查存在性，或改用类型守卫

**[中] app/api/posts/route.ts:52,105 — id 未校验 CUID 格式**

- PUT 从 body 提取 `id`，DELETE 从 searchParams 提取 `id`，均未格式校验
- 修复: 用 `z.string().cuid()` 校验

**[中] Admin server actions 缺少输入校验**

- `app/admin/categories/page.tsx:9-16`、`app/admin/tags/page.tsx:9-16`、`app/admin/comments/page.tsx:9-21`
- `formData.get()` 直接 `as string`，绕过了 Zod 校验边界
- 修复: 用 Zod schema 校验 formData 输入

**[低] lib/env.ts:25-26 — 关键环境变量空字符串回退**

- `DATABASE_URL` / `AUTH_SECRET` 校验失败时回退为空字符串 `""`
- PrismaPg 会用空连接串创建连接，产生难以理解的运行时错误
- 修复: 关键变量校验失败应抛异常而非静默回退

---

### 错误处理缺失

**[高] app/api/posts/route.ts:79-97 — Prisma update 无 try/catch**

- `prisma.post.update()` 无错误处理，失败返回原始 500
- 且前面的 `deleteMany` 已执行，数据可能不一致

**[中] app/api/comments/route.ts:30 — Prisma create 无 try/catch**
**[中] app/api/posts/route.ts:26,109 — Prisma create/delete 无 try/catch**
**[中] app/api/graph/route.ts:22 — 错误吞没无日志**

- `catch { return 500 }` 但未 console.error，生产环境无法调试

**[中] components/blog/CommentForm.tsx:42-63 — fetch 无 try/catch**

- 网络失败时 `setSubmitting(false)` 永不执行，按钮永久禁用
- 修复: 用 `try/finally` 包裹 fetch 调用

**[中] components/blog/CommentForm.tsx:59 — res.json() 不安全**

- 非 JSON 响应体会抛异常
- 修复: 包裹 try/catch

**[中] components/layout/SearchDialog.tsx:46-51 — 缺少 res.ok 检查**

- 4xx/5xx 响应时 res.json() 可能成功但返回错误对象
- 与 KnowledgeGraph.tsx:80-81 的 `if (!res.ok)` 不一致

**[中] components/blog/Backlinks.tsx:13,27 — 数据库错误静默吞没**

- `.catch(() => null)` 不记录错误，生产环境无法调试
- 修复: `.catch((e) => { console.error(e); return null })`

---

### i18n 硬编码

**[中] components/blog/KnowledgeGraph.tsx:200 — "Failed to load graph" 硬编码英文**
**[中] components/blog/KnowledgeGraph.tsx:256-257 — "nodes · links" 状态文本未国际化**
**[中] components/blog/RecentPosts.tsx:23-27 — 硬编码 `toLocaleDateString("zh-CN")`**

- 不跟随用户 locale 切换
- 修复: 用 `getLocale()` 获取当前 locale

**[低] components/layout/Header.tsx:13 — 硬编码 `sayliks&apos;s blog`**

- messages 中已有 `home.siteTitle`，但 Header 未使用

**[低] components/layout/ThemeToggle.tsx:17 — aria-label="Toggle theme" 硬编码英文**

- 修复: 添加 `common.toggleTheme` 翻译 key

**[低] components/layout/SearchDialog.tsx:118 — 多余的中文回退**

- `t("loading") || "搜索中..."` 中 key 已存在，`||` 回退是死代码

---

### 可访问性

**[中] components/blog/CommentSection.tsx:25,44 — 头像 alt=""**

- 用户头像应设 `alt={comment.authorName}` 而非空字符串

**[中] components/blog/CommentForm.tsx:100,120 — 头像 alt=""**
**[低] components/blog/Pagination.tsx:18 — `<nav>` 缺少 aria-label**
**[低] components/blog/SearchForm.tsx:24 — 搜索输入框缺少 aria-label / label**
**[低] components/admin/PostForm.tsx:142-155 — 标签切换按钮缺少 aria-pressed**
**[低] components/admin/AdminLayoutClient.tsx:99-102 — 拖拽手柄缺少 role/aria-label/tabIndex**

---

### 一致性问题

**[高] components/blog/RecentPosts.tsx:18 — 使用 `<a>` 而非 `<Link>`**

- 全站其他组件都用 `next/link`，此处用 `<a>` 导致全页刷新
- 修复: `import Link from "next/link"` 替换

**[中] components/blog/RecentPosts.tsx:23-27 — 日期格式化不一致**

- 此处用 `toLocaleDateString("zh-CN")`，其他组件用 `formatDate` (lib/utils.ts)
- 修复: 统一使用 `formatDate`

**[中] app/api/search/route.ts — 重复 queries.ts 查询逻辑**

- CLAUDE.md 约定 "All read queries live in lib/queries.ts"
- search route 自行实现 Prisma 查询而非调用 `searchPosts()`

**[低] app/api/comments/route.ts GET handler — 重复查询逻辑**
**[低] Admin 页面直接调用 Prisma**

- `app/admin/page.tsx`、`categories/page.tsx`、`tags/page.tsx`、`comments/page.tsx`
- CLAUDE.md 约定 "Pages do not call Prisma directly"

**[低] app/api/posts/route.ts + app/api/comments/route.ts — 缺少 `export const runtime = "nodejs"`**

- CLAUDE.md 约定 admin API route 声明 nodejs runtime

---

### 死代码

**[低] lib/markdown.ts — getExcerpt + stripMarkdown 均未被导入**

- 全库无引用，属于死代码
- 修复: 删除或移到需要的地方

**[低] lib/validations.ts:23-28 — createCategorySchema / createTagSchema 未在 API route 中使用**

- Admin server actions 未使用这些 schema，目前是死代码

---

### 其他

**[中] app/api/posts/route.ts:77 — 标签删除/重建未用事务**（已列在安全问题中）

**[中] components/blog/KnowledgeGraph.tsx:103-107 — setTimeout 无清理**

- 组件卸载时 500ms 内的 timeout 可能访问已销毁的 ref
- 修复: `return () => clearTimeout(timer)`

**[中] components/layout/SearchDialog.tsx:33-37 — setTimeout 无清理**

- 快速开关对话框时旧 timeout 可能触发
- 修复: `const id = setTimeout(...); return () => clearTimeout(id)`

**[低] lib/validations.ts:9 — tags 数组接受任意字符串**

- 应校验为 CUID 格式（与 postId/parentId 一致）

**[低] components/layout/Footer.tsx — 空组件**

- 渲染空 `<footer>`，messages 中有 `footer.copyright` 但未使用

---

### 按优先级汇总

| 优先级 | 问题 | 文件 |
| ------ | ---- | ---- |
| 高 | 客户端 userId 用于认证 | comments/route.ts:28 |
| 高 | 标签替换无事务保护 | posts/route.ts:77 |
| 高 | Prisma update 无 try/catch | posts/route.ts:79 |
| 高 | RecentPosts 用 `<a>` 非 `<Link>` | RecentPosts.tsx:18 |
| 中 | request.json() 无异常处理 | posts/route.ts:11,52 |
| 中 | fetch 无 try/catch | CommentForm.tsx:42 |
| 中 | res.json() 不安全 | CommentForm.tsx:59, SearchDialog.tsx:46 |
| 中 | 数据库错误静默吞没 | Backlinks.tsx:13,27 |
| 中 | 硬编码 locale "zh-CN" | RecentPosts.tsx:23 |
| 中 | search route 重复查询 | search/route.ts |
| 中 | setTimeout 无清理 | KnowledgeGraph.tsx:103, SearchDialog.tsx:33 |
| 中 | 头像 alt="" | CommentSection.tsx:25, CommentForm.tsx:100 |
| 低 | 缺少 runtime="nodejs" | posts/route.ts, comments/route.ts |
| 低 | Admin 直接调用 Prisma | admin/*.tsx |
| 低 | 死代码 | lib/markdown.ts, validations.ts |
| 低 | aria-label 缺失 | Pagination, SearchForm, AdminLayout |

---

## 审查 #6 — 2026-05-27 23:15

**分支**: master (ahead of origin by 19 commits)
**未提交业务变更**: 无。所有业务代码已在 `1ab0080 fix: resolve all ESLint errors and warnings` 中提交

**最近提交**:

- `1ab0080` fix: resolve all ESLint errors and warnings (10 files, +113/-117)

### 审查结论

**本次审查未发现新问题。**

- 业务代码已全部提交，ESLint 0 errors 0 warnings
- `1ab0080` 包含此前审查 #14-#16 报告的所有改进（img→Image、any→类型、eslint-disable 清理）
- Header.tsx 缩进问题（#14 报告）已随 1ab0080 一并修复
- KnowledgeGraph.tsx mounted 守卫（#15 报告）已通过 `@ts-expect-error` + `ForceGraphMethods` 类型解决
- PLAN.md / refactoring.md 与代码一致
