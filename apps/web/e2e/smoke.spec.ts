import { test, expect } from "@playwright/test";

/**
 * E2E smoke test — walks through the core public user flow:
 *   Homepage → Category listing → Product detail → Affiliate link
 *
 * Note: The site layout uses Clerk for auth. If Clerk env vars aren't
 * configured, the <header> and <footer> won't render, but all page
 * content still works. This test checks page content directly to remain
 * resilient in both local dev and CI environments.
 *
 * The test relies on seed data (4 products in "electronics" and
 * "home-garden" categories, each with 1 affiliate link).
 */
test("homepage → category → product → affiliate link", async ({ page }) => {
  // ── Step 1: Homepage ──────────────────────────────────
  await page.goto("/", { waitUntil: "networkidle" });

  // Verify the page rendered
  await expect(page).toHaveTitle(/ALAYA INSIDER/);

  // Verify hero content is visible
  await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

  // ── Step 2: Navigate to a category with products ──────
  // Seed data has products in "electronics" category
  await page.goto("/electronics", { waitUntil: "networkidle" });

  // Verify category heading
  await expect(page.locator("h1")).toBeVisible({ timeout: 15_000 });

  // ── Step 3: Navigate to product detail page ──────────
  // Seed product: SoundWave Pro Headphones (subcategory is null)
  // URL pattern: /:category/:subcategory/product/:slug
  await page.goto(
    "/electronics/product/product/soundwave-pro-headphones",
    { waitUntil: "networkidle" }
  );

  // Verify product page rendered
  const h1 = page.locator("h1");
  await expect(h1).toBeVisible({ timeout: 10_000 });

  // ── Step 4: Verify affiliate link exists ──────────────
  // PriceComparison renders <a href="/go/:linkId"><button>Buy at Retailer</button></a>
  const affiliateButton = page.locator('a[href^="/go/"]').first();
  await expect(affiliateButton).toBeVisible({ timeout: 10_000 });

  // Verify button text contains a CTA like "Buy" or "Shop"
  const buttonText = await affiliateButton.textContent();
  expect(buttonText?.toLowerCase()).toMatch(/buy|shop/);

  // Verify the affiliate redirect URL has a valid format
  const href = await affiliateButton.getAttribute("href");
  expect(href).toMatch(/^\/go\/[a-zA-Z0-9]+$/);
});
