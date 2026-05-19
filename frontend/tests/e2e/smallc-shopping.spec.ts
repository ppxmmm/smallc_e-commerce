import { expect, test } from "@playwright/test";
import { loginAs } from "./auth-helpers.mjs";

test.describe("customer storefront", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, {
      email: "customer@smallc.test",
      password: "correct-password",
    });
  });

  test("customer can search, add to cart, apply coupon, and place a mock order", async ({
    page,
  }) => {
    await expect(page.locator("h1", { hasText: "New Season Sale" })).toBeVisible();
    await page.locator("#shop").scrollIntoViewIfNeeded();
    await page.getByTestId("global-search").fill("soundcore");
    await expect(page.getByRole("heading", { name: "Soundcore Life Q30" }).first()).toBeVisible();

    await page.getByTestId("add-product-1").first().click();
    await page.getByTestId("cart-button").click();
    await expect(page).toHaveURL(/\/cart$/);

    await page.getByLabel("Coupon code").fill("SAVE10");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByText(/-฿/).first()).toBeVisible();

    await page.getByRole("link", { name: "Continue to checkout" }).click();
    await expect(page).toHaveURL(/\/checkout$/);

    await page.getByRole("button", { name: "Place Order" }).click();
    await expect(page).toHaveURL(/\/orders$/);
    await expect(page.getByText("Thank you for your order!")).toBeVisible();
  });

  test("shop search exposes an empty state", async ({ page }) => {
    await page.locator("#shop").scrollIntoViewIfNeeded();
    await page.getByTestId("global-search").fill("not-a-real-product");
    await expect(page.getByTestId("empty-state")).toContainText("No products found.");
  });

  test("does not show checkout blocks on the home page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Cart & Checkout Preview" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Shipping & Payment" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Product Detail Preview" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "My Orders" })).toHaveCount(0);
  });

  test("does not show the seller dashboard", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Dashboard Overview" })).toHaveCount(0);
    await expect(page.getByText("Seller Dashboard")).toHaveCount(0);
  });
});

test.describe("seller workspace", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, {
      email: "seller@smallc.test",
      password: "correct-password",
    });
  });

  test("seller dashboard includes product and order management", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Dashboard Overview" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Product Management" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Order Management" })).toBeVisible();
    await expect(page.getByText("Seller Dashboard")).toBeVisible();
  });

  test("does not show the customer storefront hero", async ({ page }) => {
    await expect(page.locator("h1", { hasText: "New Season Sale" })).toHaveCount(0);
  });
});
