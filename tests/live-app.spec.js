import { expect, test } from "@playwright/test";

test("desktop live flow loads events and switches detail panes", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktop-only flow");

  await page.goto("/");

  await expect(page.locator("#statusLine")).toContainText("Loaded", { timeout: 15_000 });
  await expect(page.locator(".event-card")).toHaveCount(15);

  const firstCard = page.locator(".event-card").first();
  await firstCard.click();

  await expect(page.locator(".event-detail-title")).toBeVisible();
  await expect(page.locator(".viewing-chip").first()).toBeVisible();

  await page.getByRole("button", { name: "Results" }).click();
  await expect(page.locator('[data-pane-body="results"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "Results" })).toHaveAttribute("aria-selected", "true");
});

test("mobile live flow opens detail and returns to list", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "Mobile-only flow");

  await page.goto("/");

  await expect(page.locator("#statusLine")).toContainText("Loaded", { timeout: 15_000 });
  await expect(page.locator(".event-card")).toHaveCount(15);

  await page.locator(".event-card").first().click();

  await expect(page.locator("#shell")).toHaveClass(/mobile-detail-active/);
  await expect(page.locator("#mobileBackBtn")).toBeVisible();
  await expect(page.locator(".event-detail-title")).toBeVisible();

  await page.locator("#mobileBackBtn").click();

  await expect(page.locator("#shell")).not.toHaveClass(/mobile-detail-active/);
  await expect(page.locator(".list-shell")).toBeVisible();
});
