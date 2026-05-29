```markdown
# my-blog Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill documents the development patterns and workflows for the `my-blog` TypeScript codebase. It covers coding conventions, data model and database migration workflows, and testing patterns. The repository is structured for maintainability and clarity, with a focus on conventional commit messages, organized file naming, and robust migration processes.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `postList.tsx`, `userProfile.ts`

### Import Style
- Use **alias imports** to reference modules.
  - Example:
    ```typescript
    import { getPosts } from '@/lib/queries';
    import AdminSidebar from '@/components/admin/sidebar';
    ```

### Export Style
- **Mixed**: Both default and named exports are used.
  - Example:
    ```typescript
    // Named export
    export function getPosts() { ... }

    // Default export
    export default AdminSidebar;
    ```

### Commit Messages
- Use **conventional commit** prefixes: `feat`, `refactor`, `fix`, `docs`
- Example:
  ```
  feat: add tags support to post model
  fix: correct post date formatting in blog list
  ```

## Workflows

### Data Model Migration Workflow
**Trigger:** When replacing or significantly refactoring a core data model (e.g., changing Post/Category to Document).
**Command:** `/migrate-model`

1. **Update the Prisma schema**  
   Edit `prisma/schema.prisma` to define new or updated models and relationships.
   ```prisma
   model Document {
     id        String   @id @default(uuid())
     title     String
     content   String
     // ...
   }
   ```
2. **Write migration scripts**  
   Create scripts like `prisma/migrate-to-document.ts` to transform existing data.
   ```typescript
   // prisma/migrate-to-document.ts
   // Example: migrate posts to documents
   ```
3. **Refactor backend query logic**  
   Update `lib/queries.ts` to use new models.
   ```typescript
   // Before
   export async function getPosts() { ... }
   // After
   export async function getDocuments() { ... }
   ```
4. **Update server actions**  
   Refactor files in `app/actions/*.ts` to use new models and fields.
5. **Update API routes**  
   Change endpoints in `app/api/*/route.ts` to reflect the new data model.
6. **Update admin UI pages**  
   Refactor `app/admin/**/*.tsx` to use new field names and relationships.
7. **Update user-facing pages/components**  
   Update files like `app/categories/[slug]/page.tsx` and `app/posts/[slug]/page.tsx` to reference the new model.
8. **Update documentation/runbooks**  
   Document the migration process in `docs/MIGRATION_RUNBOOK.md` and `docs/PLAN.md`.

### Database Migration Script Workflow
**Trigger:** When migrating data or verifying database integrity after schema changes.
**Command:** `/add-migration-script`

1. **Create or update migration scripts**  
   Add scripts like `prisma/migrate-to-*.ts` to transform or clean up data.
2. **Add verification scripts**  
   Implement scripts such as `prisma/check-tables.ts` to check tables and row counts.
   ```typescript
   // prisma/check-tables.ts
   // Example: verify table row counts after migration
   ```
3. **Clean up old tables**  
   Use scripts like `prisma/drop-old-tables.ts` to remove obsolete tables post-migration.
4. **Document migration steps**  
   Update `docs/MIGRATION_RUNBOOK.md` with steps and safety checks.

## Testing Patterns

- **File Pattern:** Test files are named with `*.test.*` (e.g., `postService.test.ts`)
- **Framework:** Not explicitly detected; likely uses a standard TypeScript-compatible test runner (e.g., Jest, Vitest).
- **Example:**
  ```typescript
  // postService.test.ts
  import { getPosts } from '@/lib/queries';

  test('getPosts returns all posts', async () => {
    const posts = await getPosts();
    expect(posts).toBeInstanceOf(Array);
  });
  ```

## Commands

| Command             | Purpose                                                        |
|---------------------|----------------------------------------------------------------|
| /migrate-model      | Start a core data model migration workflow                     |
| /add-migration-script | Add or update a database migration script and safety checks  |
```
