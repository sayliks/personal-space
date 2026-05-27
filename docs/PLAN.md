# my-blog 全栈开发计划

> 项目：个人全栈博客 · 制定日期：2026-05-21
> 最后更新：2026-05-27 — Phase 0-11 全部完成，47 tests 通过

---

## 一、技术栈

| 层       | 选型                            |
| -------- | ------------------------------- |
| 全栈框架 | Next.js 16 (App Router)         |
| 数据库   | PostgreSQL on Supabase          |
| ORM      | Prisma 7                        |
| UI       | shadcn/ui                       |
| 样式     | Tailwind CSS v4                 |
| 认证     | Auth.js v5                      |
| 部署     | Vercel                          |

---

## 二、数据库模型设计

6 个模型：

| 模型        | 用途      | 关键字段                                                                                    |
| ----------- | --------- | ------------------------------------------------------------------------------------------- |
| **User**    | 管理员    | id, name, email(@unique), passwordHash, createdAt, updatedAt                                |
| **Post**    | 文章      | slug(@unique), summary, coverImage, publishedAt, views, authorId, categoryId, published, updatedAt |
| **Category**| 分类      | id, name(@unique), slug(@unique), createdAt, updatedAt                                      |
| **Tag**     | 标签      | id, name(@unique), slug(@unique), createdAt, updatedAt                                      |
| **PostTag** | 文章-标签 | postId + tagId（复合主键）                                                                  |
| **Comment** | 评论      | content, authorName, authorEmail?, approved, parentId, postId, createdAt, updatedAt         |

关系：User 1→N Post → Category 1→N Post → Post N↔N Tag → Post 1→N Comment → Comment 1→N Comment(replies)

---

## 三、路由设计

```
# 公开路由
app/
├── page.tsx                          # 首页：知识图谱（Obsidian Graph View）
├── posts/[slug]/page.tsx             # 文章详情 + 评论区
├── categories/[slug]/page.tsx        # 按分类筛选
├── tags/[slug]/page.tsx              # 按标签筛选
├── search/page.tsx                   # 搜索结果
├── about/page.tsx                    # 关于页面

# 后台管理（受 AdminLayout auth() 保护，登录页独立于 /login）
app/admin/
├── layout.tsx                        # 后台框架（auth 检查 + 侧边栏 + sonner toaster）
├── page.tsx                          # 仪表盘
├── posts/page.tsx                    # 文章列表
├── posts/new/page.tsx                # 新建文章
├── posts/[id]/edit/page.tsx          # 编辑文章
├── categories/page.tsx               # 分类管理
├── tags/page.tsx                     # 标签管理
└── comments/page.tsx                 # 评论审核

app/login/
├── layout.tsx                        # 登录页独立布局
└── page.tsx                          # 登录页

# API
app/api/
├── auth/[...nextauth]/route.ts       # Auth.js
├── posts/route.ts                    # 文章 CRUD
├── comments/route.ts                 # 评论提交 & 审核
├── search/route.ts                   # 搜索
└── graph/route.ts                    # 图谱数据 API
```

---

## 四、组件结构

```
components/
├── layout/      # Header, Footer
├── blog/        # PostCard, Pagination, TagBadge, CategoryBadge, MarkdownRenderer,
│                # CommentSection, CommentForm, SearchForm
│                # KnowledgeGraph, Backlinks
├── admin/       # PostForm, DeletePostButton, CategoryManager, TagManager, CommentManager
└── auth/        # SessionProviderWrapper
```

---

## 五、实施状态

**全部完成。** Phase 0-11 均已完成，47 tests 全部通过，`npm run build` 成功。

| Phase | 内容 | 状态 |
|-------|------|------|
| 0-0.5 | shadcn/ui 初始化 + 环境配置 | done |
| 1     | 数据库迁移 + Prisma 7 适配 | done |
| 2     | Auth.js 认证（Credentials + GitHub OAuth） | done |
| 3     | Markdown 渲染 + 排版 | done |
| 4     | 后台 CRUD（文章/分类/标签/评论） | done |
| 5     | 公开博客页面 | done |
| 6     | 评论系统 | done |
| 7     | 搜索（RSS 已移除） | done |
| 8     | SEO / i18n / 暗色模式 / error boundary | done |
| 9     | 单元测试 + E2E + 组件测试（47 tests） | done |
| 10    | GitHub OAuth + 评论增强 | done |
| 11    | 知识图谱（Obsidian Graph View） | done |

---

## 六、架构要点

### Prisma 7 注意事项

- 客户端生成到 `app/generated/prisma/`，从该路径导入，不要用 `@prisma/client`
- `prisma.config.ts` 持有 `datasource.url`，schema 中不再写 url
- 构造 `PrismaClient` 必须传 `adapter`（`PrismaPg`）
- `lib/prisma.ts` 用 `globalThis` 做单例缓存

### Auth

- JWT sessions，`PrismaAdapter` 仅用于 OAuth 数据关联
- 无 `middleware.ts`（Edge Runtime 不兼容 Prisma），auth 保护在 `AdminLayout` 层
- `/login` 独立于 `/admin/`，避免重定向死循环
- admin layout 和 auth API route 显式声明 `runtime = "nodejs"`

### i18n

- next-intl 4，cookie 驱动（`NEXT_LOCALE`），无 URL 前缀
- 回退链：cookie → Accept-Language header → `zh`

### 构建

- 公开页面 `export const dynamic = "force-dynamic"` 避免 PgBouncer 连接池耗尽

---

## 七、代码规范

### 提交前自查

```
✅ TypeScript 编译无错误（strict 模式）
✅ ESLint 无警告
✅ npm run build 成功
✅ 所有用户输入已验证（Zod）
✅ 无 console.log 遗留
✅ Server Component 和 Client Component 职责清晰
```

### Git 提交规范

feat / fix / refactor / perf / docs / test

---

## 八、待深入方向

> 详见 `OPTIMIZE.md` — 全量性能审计与优化清单

| 方向 | 说明 |
|------|------|
| Server Actions | 当前用 API Routes，可逐步迁移到 Server Actions 简化表单提交 |
| API 响应标准化 | 引入 `ApiResponse<T>` 类型 + `ok()`/`fail()` 工具函数 |
| 图片优化 | 使用 `next/image` 处理封面图 |
| 更多测试 | 补充 API route 集成测试、E2E 覆盖后台流程 |
| TypeScript 严格化 | 开启 `noUncheckedIndexedAccess` |

### 安全检查清单

| 风险点 | 防御措施 |
|--------|---------|
| XSS | react-markdown 禁止 raw HTML |
| SQL 注入 | Prisma ORM 自动参数化 |
| CSRF | Server Actions 内置防护 |
| 密码存储 | bcryptjs salt rounds ≥ 12 |

---

## 九、推荐学习资源

- **Next.js 16 文档**：`node_modules/next/dist/docs/`
- **Prisma 文档**：https://www.prisma.io/docs
- **shadcn/ui**：https://ui.shadcn.com/docs
- **Auth.js v5**：https://authjs.dev/getting-started
- **Total TypeScript**：https://www.totaltypescript.com/
