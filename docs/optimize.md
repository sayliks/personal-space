# 剩余待优化项

> 来自自动化代码审查，按优先级排列。

## 中优先级

- [ ] Admin 服务端操作输入校验 — `formData.get` 改用 Zod schema 校验
- [ ] Admin 页面直接调用 Prisma — 应迁移到 `lib/queries.ts` 查询层

## 低优先级

- [ ] CommentForm.tsx 头像 `alt=""` — 应改为用户名称
- [ ] `validations.ts` 中 `createCategorySchema` / `createTagSchema` 未使用
- [ ] Footer.tsx 空组件 — 移除或添加内容
- [ ] Pagination、SearchForm、AdminLayoutClient 缺少 `aria-label`