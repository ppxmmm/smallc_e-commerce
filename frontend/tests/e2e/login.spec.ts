import { expect, test } from "@playwright/test";

test.describe("login page", () => {
  test("validates required fields before signing in", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Welcome back",
      }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Email is required.")).toBeVisible();
    await expect(page.getByText("Password is required.")).toBeVisible();
  });

  test("shows and hides the password value", async ({ page }) => {
    await page.goto("/login");

    const password = page.getByLabel("Password");
    await password.fill("correct-password");
    await expect(password).toHaveAttribute("type", "password");

    await page.getByRole("button", { name: "Show" }).click();
    await expect(password).toHaveAttribute("type", "text");

    await page.getByRole("button", { name: "Hide" }).click();
    await expect(password).toHaveAttribute("type", "password");
  });

  test("shows an error when credentials do not match", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("customer@smallc.test");
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByRole("button", { name: "Signing in..." })).toBeVisible();
    await expect(page.getByText("Email or password is incorrect.")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("routes valid sign in to the home page", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("customer@smallc.test");
    await page.getByLabel("Password", { exact: true }).fill("correct-password");
    await page.getByRole("checkbox", { name: "Remember me" }).check();
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/home$/);
    await expect(page.locator("h1", { hasText: "New Season Sale" })).toBeVisible();
    await expect(page.getByText("Seller Dashboard")).toHaveCount(0);
    const rememberedEmail = await page.evaluate(() =>
      window.localStorage.getItem("smallc:rememberedEmail"),
    );
    expect(rememberedEmail).toBe("customer@smallc.test");
  });

  test("routes to signup and creates a local customer profile", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("link", { name: "Create an account" }).click();
    await expect(
      page.getByRole("heading", { name: "Create your SmallC account" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Full name is required.")).toBeVisible();
    await expect(page.getByText("Email is required.")).toBeVisible();

    const signupEmail = `new-${Date.now()}@smallc.test`;

    await page.getByLabel("Full name").fill("SmallC Customer");
    await page.getByLabel("Email").fill(signupEmail);
    await page.getByLabel("Password", { exact: true }).fill("correct-password");
    await page.getByLabel("Confirm password").fill("correct-password");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL(/\/home$/);
    const lastSignup = await page.evaluate(() =>
      window.sessionStorage.getItem("smallc:lastSignup"),
    );
    expect(lastSignup).toBe(signupEmail);
  });
});
