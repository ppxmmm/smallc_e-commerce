import { expect, test } from "@playwright/test";

test("customer can search, add to cart, apply coupon, and place a mock order", async ({ page }) => {
  await page.goto("/home");

  await expect(page.locator("h1", { hasText: "New Season Sale" })).toBeVisible();
  await page.getByTestId("global-search").fill("soundcore");
  await expect(page.getByRole("heading", { name: "Soundcore Life Q30" }).first()).toBeVisible();

  await page.getByTestId("add-product-1").first().click();
  await expect(page.getByTestId("cart-button")).toContainText("3");

  await page.getByLabel("Coupon code").fill("SAVE10");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page.getByText(/-฿/).first()).toBeVisible();

  await page.getByRole("button", { name: "Place Order" }).click();
  await expect(page.getByText("Payment successful. Your order has been placed.")).toBeVisible();
});

test("shop search exposes an empty state", async ({ page }) => {
  await page.goto("/home");

  await page.getByTestId("global-search").fill("not-a-real-product");
  await expect(page.getByTestId("empty-state")).toContainText("No products found.");
});

test("admin preview includes dashboard, product, and order management", async ({ page }) => {
  await page.goto("/home");

  await expect(page.getByRole("heading", { name: "Dashboard Overview" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Product Management" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Order Management" })).toBeVisible();
});
