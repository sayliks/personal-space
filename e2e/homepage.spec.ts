import { test, expect } from "@playwright/test"

test("homepage renders recent posts heading", async ({ page }) => {
  await page.goto("/")
  await expect(page.locator("h2")).toContainText("最新文章")
})

test("navigates to articles page", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("link", { name: "文章" }).click()
  await expect(page).toHaveURL("/posts")
})

test("opens search dialog", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("button", { name: "搜索" }).click()
  await expect(page.getByPlaceholder("搜索文章...")).toBeVisible()
})

test("header logo links to home", async ({ page }) => {
  await page.goto("/about")
  await page.getByRole("link", { name: "frostsalix's blog" }).click()
  await expect(page).toHaveURL("/")
})
