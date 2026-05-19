import { expect, test } from "@playwright/test";
import { loginAs } from "./auth-helpers.mjs";

test.describe("product detail", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, {
      email: "customer@smallc.test",
      password: "correct-password",
    });
    await page.goto("/home#shop");
  });

  test("customer can open a product page and add it to cart", async ({ page }) => {
    const productName = "Soundcore Life Q30";

    await page.getByRole("link", { name: productName }).first().click();
    await expect(page).toHaveURL(/\/products\/1$/);
    await expect(page.getByRole("heading", { name: productName })).toBeVisible();
    await expect(page.getByText("Wireless Headphones")).toBeVisible();

    await page.getByTestId("add-product-1").click();
    await page.getByTestId("cart-button").click();
    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByText(productName)).toBeVisible();
  });

  test("customer can favourite a product from the detail page", async ({ page }) => {
    await page.evaluate(() => {
      window.sessionStorage.removeItem("smallc:wishlist");
    });

    await page.goto("/products/1");
    await page
      .getByRole("button", { name: "Add Soundcore Life Q30 to favourites" })
      .click();

    await expect(page.getByLabel("Favourites with 1 items")).toBeVisible();
  });
});
