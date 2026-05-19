import { expect, test } from "@playwright/test";
import { loginAs } from "./auth-helpers.mjs";

test.describe("cart page", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, {
      email: "customer@smallc.test",
      password: "correct-password",
    });
    await page.evaluate(() => {
      window.sessionStorage.setItem("smallc:cart", JSON.stringify([]));
      window.sessionStorage.removeItem("smallc:appliedCoupon");
    });
    await page.goto("/home#shop");
  });

  test("customer can change quantity and remove items", async ({ page }) => {
    const productName = "Soundcore Life Q30";

    await page.getByTestId("add-product-1").first().click();
    await page.getByTestId("cart-button").click();
    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByText(productName)).toBeVisible();

    const increase = page.getByRole("button", {
      name: `Increase quantity of ${productName}`,
    });
    await increase.click();
    await expect(
      page.getByRole("group", { name: `Quantity for ${productName}` }),
    ).toContainText("2");

    await page.getByRole("button", { name: "Remove" }).click();
    await expect(page.getByText("Your cart is empty.")).toBeVisible();
  });

  test("renders a full-width storefront footer", async ({ page }) => {
    await page.getByTestId("cart-button").click();
    await expect(page).toHaveURL(/\/cart$/);

    const footer = page.locator("footer").last();
    await expect(footer).toBeVisible();
    await expect(footer.getByRole("link", { name: /small/i })).toBeVisible();
    await expect(footer.getByText("© 2026 smallC. All rights reserved.")).toBeVisible();

    const footerBox = await footer.boundingBox();
    const viewport = page.viewportSize();
    expect(footerBox).not.toBeNull();
    expect(viewport).not.toBeNull();
    if (footerBox && viewport) {
      expect(footerBox.width).toBeGreaterThan(viewport.width * 0.95);
    }
  });
});
