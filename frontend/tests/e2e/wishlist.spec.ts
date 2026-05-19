import { expect, test } from "@playwright/test";
import { loginAs } from "./auth-helpers.mjs";

test.describe("wishlist", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, {
      email: "customer@smallc.test",
      password: "correct-password",
    });
    await page.evaluate(() => {
      window.sessionStorage.removeItem("smallc:wishlist");
      window.sessionStorage.removeItem("smallc:cart");
      window.sessionStorage.removeItem("smallc:appliedCoupon");
    });
    await page.goto("/home#shop");
  });

  test("customer can save, view, and remove favourites", async ({ page }) => {
    const productName = "Soundcore Life Q30";

    await page
      .getByRole("button", { name: `Add ${productName} to favourites` })
      .first()
      .click();

    await expect(
      page.getByLabel("Favourites with 1 items"),
    ).toBeVisible();

    await page.getByLabel("Favourites with 1 items").click();
    await expect(page).toHaveURL(/\/wishlist$/);
    await expect(page.getByRole("heading", { name: "Favourites" })).toBeVisible();
    await expect(page.getByRole("link", { name: productName })).toBeVisible();

    await page.getByRole("button", { name: "Remove" }).click();
    await expect(page.getByText("No favourites yet.")).toBeVisible();
  });

  test("customer can move a favourite into the cart", async ({ page }) => {
    const productName = "Uniqlo U Crew Neck T-Shirt";

    await page
      .getByRole("button", { name: `Add ${productName} to favourites` })
      .first()
      .click();

    await page.getByLabel("Favourites with 1 items").click();
    await page.getByRole("button", { name: "Add to cart" }).click();

    await expect(page.getByRole("status")).toContainText(`Added ${productName} to cart`);
    await page.getByTestId("cart-button").click();
    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByText(productName)).toBeVisible();
  });
});
