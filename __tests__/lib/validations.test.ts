import { describe, it, expect } from "@jest/globals"
import {
  createPostSchema,
  createCommentSchema,
  createCategorySchema,
  createTagSchema,
} from "@/lib/validations"

describe("createPostSchema", () => {
  it("accepts a valid post with title only", () => {
    const result = createPostSchema.safeParse({ title: "Hello" })
    expect(result.success).toBe(true)
  })

  it("rejects empty title", () => {
    const result = createPostSchema.safeParse({ title: "" })
    expect(result.success).toBe(false)
  })

  it("rejects title over 200 chars", () => {
    const result = createPostSchema.safeParse({ title: "a".repeat(201) })
    expect(result.success).toBe(false)
  })

  it("accepts null for optional string fields", () => {
    const result = createPostSchema.safeParse({
      title: "Hello",
      content: null,
      summary: null,
    })
    expect(result.success).toBe(true)
  })

  it("defaults tags to empty array", () => {
    const result = createPostSchema.safeParse({ title: "Hello" })
    if (result.success) {
      expect(result.data.tags).toEqual([])
    }
  })

  it("rejects invalid URL for coverImage", () => {
    const result = createPostSchema.safeParse({
      title: "Hello",
      coverImage: "not-a-url",
    })
    expect(result.success).toBe(false)
  })
})

describe("createCommentSchema", () => {
  it("accepts a valid comment", () => {
    const result = createCommentSchema.safeParse({
      content: "Great post!",
      authorName: "Alice",
      postId: "clx1234567890abcdefghijkl",
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty content", () => {
    const result = createCommentSchema.safeParse({
      content: "",
      authorName: "Alice",
      postId: "clx1234567890abcdefghijkl",
    })
    expect(result.success).toBe(false)
  })

  it("accepts empty email", () => {
    const result = createCommentSchema.safeParse({
      content: "Hi",
      authorName: "Bob",
      authorEmail: "",
      postId: "clx1234567890abcdefghijkl",
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid email", () => {
    const result = createCommentSchema.safeParse({
      content: "Hi",
      authorName: "Bob",
      authorEmail: "not-an-email",
      postId: "clx1234567890abcdefghijkl",
    })
    expect(result.success).toBe(false)
  })
})

describe("createCategorySchema", () => {
  it("accepts a valid name", () => {
    const result = createCategorySchema.safeParse({ name: "JavaScript" })
    expect(result.success).toBe(true)
  })

  it("rejects empty name", () => {
    const result = createCategorySchema.safeParse({ name: "" })
    expect(result.success).toBe(false)
  })
})

describe("createTagSchema", () => {
  it("accepts a valid name", () => {
    const result = createTagSchema.safeParse({ name: "TypeScript" })
    expect(result.success).toBe(true)
  })

  it("rejects empty name", () => {
    const result = createTagSchema.safeParse({ name: "" })
    expect(result.success).toBe(false)
  })
})
