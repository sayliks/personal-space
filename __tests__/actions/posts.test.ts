/**
 * @jest-environment node
 */

// IMPORTANT: use the global `jest` (provided by next/jest) rather than importing
// it from "@jest/globals". Only the global form is hoisted above imports by
// babel-plugin-jest-hoist, which we need so these mocks intercept the auth/prisma
// modules before app/actions/posts.ts pulls them in.

// Auth: return an admin session so requireAdmin() passes. Stubbing here means the
// real lib/auth.ts (and its next-auth ESM import) is never loaded.
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(async () => ({
    user: { id: "admin-id", role: "admin", name: "Admin", email: "a@b.c" },
  })),
}))

// next/cache: revalidatePath is a no-op in tests.
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}))

// Prisma: hand-rolled mock exposing only what updatePost uses. The transaction
// callback receives a `tx` that records its calls so we can assert tag behavior.
const documentTagDeleteMany = jest.fn(async () => ({ count: 0 }))
const documentUpdate = jest.fn(async () => ({}))
const findFirst = jest.fn()

const tx = {
  documentTag: { deleteMany: documentTagDeleteMany },
  document: { update: documentUpdate },
}

jest.mock("@/lib/prisma", () => ({
  prisma: {
    document: { findFirst: (...args) => findFirst(...args) },
    $transaction: async (cb) => cb(tx),
  },
}))

import { updatePost } from "@/app/actions/posts"

const EXISTING_POST = {
  id: "clx1234567890abcdefghijkl",
  title: "Existing Title",
  slug: "existing-title",
  content: "body",
  summary: "sum",
  coverImage: null,
  published: true,
  publishedAt: new Date("2026-01-01"),
  categoryId: null,
  type: "POST",
}

function baseFormData() {
  const fd = new FormData()
  fd.set("id", EXISTING_POST.id)
  fd.set("title", "Existing Title")
  return fd
}

describe("updatePost — three-state tag contract", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Deterministic by intent rather than call-order: return the existing post
    // when queried by id, and null for the slug-duplicate lookup. (Avoids the
    // mockResolvedValueOnce queue leaking across tests, which clearAllMocks does
    // not reset.)
    findFirst.mockImplementation(async (args) => {
      const where = args?.where ?? {}
      if (where.id === EXISTING_POST.id) return EXISTING_POST
      return null
    })
  })

  it("PRESERVE: no tagsProvided marker → tags untouched", async () => {
    const fd = baseFormData()

    const result = await updatePost(fd)

    expect(result).toEqual({ success: true })
    expect(documentTagDeleteMany).not.toHaveBeenCalled()
    const updateArg = documentUpdate.mock.calls[0][0]
    expect(updateArg.data.tags).toBeUndefined()
  })

  it("CLEAR: tagsProvided marker + no tag ids → all tags removed", async () => {
    const fd = baseFormData()
    fd.set("tagsProvided", "1")

    const result = await updatePost(fd)

    expect(result).toEqual({ success: true })
    expect(documentTagDeleteMany).toHaveBeenCalledTimes(1)
    expect(documentTagDeleteMany).toHaveBeenCalledWith({
      where: { documentId: EXISTING_POST.id },
    })
    const updateArg = documentUpdate.mock.calls[0][0]
    expect(updateArg.data.tags).toBeUndefined()
  })

  it("REPLACE: tagsProvided marker + tag ids → relations replaced", async () => {
    const fd = baseFormData()
    fd.set("tagsProvided", "1")
    fd.append("tags", "tag-a")
    fd.append("tags", "tag-b")

    const result = await updatePost(fd)

    expect(result).toEqual({ success: true })
    expect(documentTagDeleteMany).toHaveBeenCalledTimes(1)
    const updateArg = documentUpdate.mock.calls[0][0]
    expect(updateArg.data.tags).toEqual({
      create: [{ tagId: "tag-a" }, { tagId: "tag-b" }],
    })
  })
})
