import { test, expect } from "@playwright/test"

// Helper to set locale cookie
async function setLocale(page: import("@playwright/test").Page, locale: string) {
  await page.context().addCookies([
    { name: "NEXT_LOCALE", value: locale, domain: "localhost", path: "/" },
  ])
}

test("homepage renders in Chinese", async ({ page }) => {
  await setLocale(page, "zh")
  await page.goto("/")
  await expect(page.locator("h1")).toContainText("文章")
})

test("homepage renders in English", async ({ page }) => {
  await setLocale(page, "en")
  await page.goto("/")
  await expect(page.locator("h1")).toContainText("frostsalix blog")
})

test("navigates to about page", async ({ page }) => {
  await setLocale(page, "zh")
  await page.goto("/")
  await page.getByRole("link", { name: "关于" }).click()
  await expect(page.locator("h1")).toContainText("关于")
})

test("navigates to search page", async ({ page }) => {
  await setLocale(page, "zh")
  await page.goto("/")
  await page.getByRole("link", { name: "搜索" }).click()
  await expect(page.locator("h1")).toContainText("搜索")
})

test("header logo links to home", async ({ page }) => {
  await setLocale(page, "zh")
  await page.goto("/about")
  await page.getByRole("link", { name: "frostsalix blog" }).click()
  await expect(page).toHaveURL("/")
})

test("language toggle switches to English", async ({ page }) => {
  await setLocale(page, "zh")
  await page.goto("/")
  await page.getByRole("button", { name: "Switch language" }).click()
  await expect(page.locator("h1")).toContainText("frostsalix blog")
})
