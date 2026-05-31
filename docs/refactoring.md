# AI Knowledge Workspace — Database Design

Evolving from personal blog to AI knowledge management system with unified Document model.

## Core Model

**Everything is a Document.** Posts, notes, and pages share one table with types.

```
User
 └─ Document
     ├─ Tag
     ├─ Relation (bidirectional links)
     ├─ Embedding (vector chunks)
     └─ AI Summary
```

## Prisma Schema

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  avatar    String?
  documents Document[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Document {
  id           String   @id @default(cuid())
  title        String
  slug         String   @unique
  content      String   @db.Text
  excerpt      String?  @db.Text
  type         DocumentType
  status       DocumentStatus
  visibility   Visibility
  coverImage   String?
  parentId     String?
  parent       Document? @relation("DocumentTree", fields: [parentId], references: [id])
  children     Document[] @relation("DocumentTree")
  authorId     String
  author       User @relation(fields: [authorId], references: [id])
  tags         DocumentTag[]
  outgoingRelations DocumentRelation[] @relation("OutgoingRelations")
  incomingRelations DocumentRelation[] @relation("IncomingRelations")
  embeddings   DocumentEmbedding[]
  aiSummary    AISummary?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  publishedAt  DateTime?
  @@index([slug])
  @@index([type])
  @@index([status])
}

enum DocumentType { POST, NOTE, PAGE }
enum DocumentStatus { DRAFT, PUBLISHED, ARCHIVED }
enum Visibility { PUBLIC, PRIVATE, UNLISTED }

model Tag {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  documents DocumentTag[]
  createdAt DateTime @default(now())
}

model DocumentTag {
  documentId String
  tagId      String
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  tag        Tag @relation(fields: [tagId], references: [id], onDelete: Cascade)
  @@id([documentId, tagId])
}

model DocumentRelation {
  id            String @id @default(cuid())
  fromDocumentId String
  toDocumentId   String
  relationType   RelationType
  fromDocument   Document @relation("OutgoingRelations", fields: [fromDocumentId], references: [id])
  toDocument     Document @relation("IncomingRelations", fields: [toDocumentId], references: [id])
  createdAt      DateTime @default(now())
  @@index([fromDocumentId])
  @@index([toDocumentId])
}

enum RelationType { BACKLINK, REFERENCE, RELATED, QUOTE }

// 以下模型需先安装 pgvector 扩展（项目当前未安装）
model DocumentEmbedding {
  id        String @id @default(cuid())
  documentId String
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  chunkIndex Int
  chunkText  String @db.Text
  embedding  Unsupported("vector")
  model      String
  createdAt  DateTime @default(now())
  @@index([documentId])
}

model AISummary {
  id        String @id @default(cuid())
  documentId String @unique
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  summary   String @db.Text
  model     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Wiki-link Relations

Wiki-link syntax (`[[target|alias]]`) parses to `DocumentRelation` records, enabling backlinks and related posts.

## Implementation Phases

**Phase 1 (Core):** Document model, Tag system, Relations, document tree, Markdown, search

**Phase 2 (AI):** Embeddings + pgvector, RAG search, AI summary, Q&A

**Phase 3 (Workspace):** AI chat, recommendations, enhanced editor
