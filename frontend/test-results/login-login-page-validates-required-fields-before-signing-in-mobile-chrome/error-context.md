# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.ts >> login page >> validates required fields before signing in
- Location: tests/e2e/login.spec.ts:4:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Sign in' })
    - locator resolved to <button type="submit" class="w-full rounded-md bg-[#176c5c] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#0e5146] focus:outline-none focus:ring-4 focus:ring-[#45d0a2]/24 disabled:cursor-not-allowed disabled:bg-[#93a29e]">Sign in</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="flex items-center justify-center gap-3">…</div> from <footer class="grid grid-cols-2 items-center border-t border-[#dfe5e3] bg-white px-6 text-sm font-medium text-[#66717a] sm:grid-cols-4 sm:px-14">…</footer> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="flex items-center justify-center gap-3">…</div> from <footer class="grid grid-cols-2 items-center border-t border-[#dfe5e3] bg-white px-6 text-sm font-medium text-[#66717a] sm:grid-cols-4 sm:px-14">…</footer> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    57 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="flex items-center justify-center gap-3">…</div> from <footer class="grid grid-cols-2 items-center border-t border-[#dfe5e3] bg-white px-6 text-sm font-medium text-[#66717a] sm:grid-cols-4 sm:px-14">…</footer> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - complementary [ref=e5]:
          - generic [ref=e6]:
            - link "SmallC" [ref=e7] [cursor=pointer]:
              - /url: /
            - heading "Welcome back" [level=1] [ref=e8]
            - paragraph [ref=e9]: Sign in to continue shopping
            - generic [ref=e10]:
              - generic [ref=e11]:
                - generic [ref=e12]: C
                - generic [ref=e13]:
                  - generic [ref=e14]: Curated products
                  - generic [ref=e15]: Thoughtfully selected items you'll love.
              - generic [ref=e16]:
                - generic [ref=e17]: S
                - generic [ref=e18]:
                  - generic [ref=e19]: Secure checkout
                  - generic [ref=e20]: Safe payments and trusted protection.
              - generic [ref=e21]:
                - generic [ref=e22]: F
                - generic [ref=e23]:
                  - generic [ref=e24]: Fast, reliable delivery
                  - generic [ref=e25]: Quick dispatch and easy returns.
        - generic [ref=e27]:
          - generic [ref=e28]:
            - link "Sign in" [ref=e29] [cursor=pointer]:
              - /url: /login
            - link "Create account" [ref=e30] [cursor=pointer]:
              - /url: /signup
          - generic [ref=e31]:
            - heading "Welcome back" [level=2] [ref=e32]
            - paragraph [ref=e33]: Sign in to continue shopping and manage your SmallC orders.
          - generic [ref=e34]:
            - generic [ref=e35]:
              - text: Email
              - textbox "Email" [ref=e36]:
                - /placeholder: you@example.com
            - generic [ref=e37]:
              - text: Password
              - generic [ref=e38]:
                - textbox "Password" [ref=e39]:
                  - /placeholder: Enter your password
                - button "Show" [ref=e40]
            - generic [ref=e41]:
              - generic [ref=e42]:
                - checkbox "Remember me" [ref=e43]
                - text: Remember me
              - link "Forgot password?" [ref=e44] [cursor=pointer]:
                - /url: "#"
            - button "Sign in" [ref=e45]
            - paragraph [ref=e46]: "Demo account: customer@smallc.test / correct-password"
            - paragraph [ref=e47]:
              - text: New to SmallC?
              - link "Create an account" [ref=e48] [cursor=pointer]:
                - /url: /signup
      - generic [ref=e49]:
        - img [ref=e51]
        - img [ref=e55]
        - img [ref=e60]
        - img [ref=e63]
  - alert [ref=e66]: Welcome back
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | test.describe("login page", () => {
  4  |   test("validates required fields before signing in", async ({ page }) => {
  5  |     await page.goto("/login");
  6  | 
  7  |     await expect(
  8  |       page.getByRole("heading", {
  9  |         level: 2,
  10 |         name: "Welcome back",
  11 |       }),
  12 |     ).toBeVisible();
  13 | 
> 14 |     await page.getByRole("button", { name: "Sign in" }).click();
     |                                                         ^ Error: locator.click: Test timeout of 30000ms exceeded.
  15 | 
  16 |     await expect(page.getByText("Email is required.")).toBeVisible();
  17 |     await expect(page.getByText("Password is required.")).toBeVisible();
  18 |   });
  19 | 
  20 |   test("shows and hides the password value", async ({ page }) => {
  21 |     await page.goto("/login");
  22 | 
  23 |     const password = page.getByLabel("Password");
  24 |     await password.fill("correct-password");
  25 |     await expect(password).toHaveAttribute("type", "password");
  26 | 
  27 |     await page.getByRole("button", { name: "Show" }).click();
  28 |     await expect(password).toHaveAttribute("type", "text");
  29 | 
  30 |     await page.getByRole("button", { name: "Hide" }).click();
  31 |     await expect(password).toHaveAttribute("type", "password");
  32 |   });
  33 | 
  34 |   test("shows an error when demo credentials do not match", async ({ page }) => {
  35 |     await page.goto("/login");
  36 | 
  37 |     await page.getByLabel("Email").fill("customer@smallc.test");
  38 |     await page.getByLabel("Password").fill("wrong-password");
  39 |     await page.getByRole("button", { name: "Sign in" }).click();
  40 | 
  41 |     await expect(page.getByRole("button", { name: "Signing in..." })).toBeVisible();
  42 |     await expect(page.getByText("Email or password is incorrect.")).toBeVisible();
  43 |     await expect(page).toHaveURL(/\/login$/);
  44 |   });
  45 | 
  46 |   test("routes valid sign in to the home page", async ({ page }) => {
  47 |     await page.goto("/login");
  48 | 
  49 |     await page.getByLabel("Email").fill("customer@smallc.test");
  50 |     await page.getByLabel("Password", { exact: true }).fill("correct-password");
  51 |     await page.getByRole("checkbox", { name: "Remember me" }).check();
  52 |     await page.getByRole("button", { name: "Sign in" }).click();
  53 | 
  54 |     await expect(page).toHaveURL(/\/home$/);
  55 |     await expect(
  56 |       page.locator("h1", { hasText: "New Season Sale" }),
  57 |     ).toBeVisible();
  58 |     const rememberedEmail = await page.evaluate(() =>
  59 |       window.localStorage.getItem("smallc:rememberedEmail"),
  60 |     );
  61 |     expect(rememberedEmail).toBe("customer@smallc.test");
  62 |   });
  63 | 
  64 |   test("routes to signup and creates a local customer profile", async ({ page }) => {
  65 |     await page.goto("/login");
  66 | 
  67 |     await page.getByRole("link", { name: "Create an account" }).click();
  68 |     await expect(
  69 |       page.getByRole("heading", { name: "Create your SmallC account" }),
  70 |     ).toBeVisible();
  71 | 
  72 |     await page.getByRole("button", { name: "Create account" }).click();
  73 |     await expect(page.getByText("Full name is required.")).toBeVisible();
  74 |     await expect(page.getByText("Email is required.")).toBeVisible();
  75 | 
  76 |     await page.getByLabel("Full name").fill("SmallC Customer");
  77 |     await page.getByLabel("Email").fill("new@smallc.test");
  78 |     await page.getByLabel("Password", { exact: true }).fill("correct-password");
  79 |     await page.getByLabel("Confirm password").fill("correct-password");
  80 |     await page.getByRole("button", { name: "Create account" }).click();
  81 | 
  82 |     await expect(page).toHaveURL(/\/home$/);
  83 |     const lastSignup = await page.evaluate(() =>
  84 |       window.sessionStorage.getItem("smallc:lastSignup"),
  85 |     );
  86 |     expect(lastSignup).toBe("new@smallc.test");
  87 |   });
  88 | });
  89 | 
```