# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.ts >> login page >> routes to signup and creates a local customer profile
- Location: tests/e2e/login.spec.ts:64:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Create account' })
    - locator resolved to <button type="submit" class="w-full rounded-md bg-[#176c5c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0e5146] focus:outline-none focus:ring-4 focus:ring-[#45d0a2]/24 disabled:cursor-not-allowed disabled:bg-[#93a29e]">Create account</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <footer class="grid grid-cols-2 items-center border-t border-[#dfe5e3] bg-white px-6 text-sm font-medium text-[#66717a] sm:grid-cols-4 sm:px-14">…</footer> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <footer class="grid grid-cols-2 items-center border-t border-[#dfe5e3] bg-white px-6 text-sm font-medium text-[#66717a] sm:grid-cols-4 sm:px-14">…</footer> intercepts pointer events
    - retrying click action
      - waiting 100ms
    55 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <footer class="grid grid-cols-2 items-center border-t border-[#dfe5e3] bg-white px-6 text-sm font-medium text-[#66717a] sm:grid-cols-4 sm:px-14">…</footer> intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - alert [ref=e2]: Welcome back
  - main [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - complementary [ref=e6]:
          - generic [ref=e7]:
            - link "SmallC" [ref=e8] [cursor=pointer]:
              - /url: /
            - heading "Welcome back" [level=1] [ref=e9]
            - paragraph [ref=e10]: Sign in to continue shopping
            - generic [ref=e11]:
              - generic [ref=e12]:
                - generic [ref=e13]: C
                - generic [ref=e14]:
                  - generic [ref=e15]: Curated products
                  - generic [ref=e16]: Thoughtfully selected items you'll love.
              - generic [ref=e17]:
                - generic [ref=e18]: S
                - generic [ref=e19]:
                  - generic [ref=e20]: Secure checkout
                  - generic [ref=e21]: Safe payments and trusted protection.
              - generic [ref=e22]:
                - generic [ref=e23]: F
                - generic [ref=e24]:
                  - generic [ref=e25]: Fast, reliable delivery
                  - generic [ref=e26]: Quick dispatch and easy returns.
          - generic:
            - generic:
              - generic: SmallC
        - generic [ref=e28]:
          - generic [ref=e29]:
            - link "Sign in" [ref=e30] [cursor=pointer]:
              - /url: /login
            - link "Create account" [ref=e31] [cursor=pointer]:
              - /url: /signup
          - generic [ref=e32]:
            - heading "Create your SmallC account" [level=2] [ref=e33]
            - paragraph [ref=e34]: Create a customer profile for saved carts, faster checkout, and order updates.
          - generic [ref=e35]:
            - generic [ref=e36]:
              - text: Full name
              - textbox "Full name" [ref=e37]:
                - /placeholder: Your name
                - text: SmallC Customer
              - paragraph [ref=e38]: Full name is required.
            - generic [ref=e39]:
              - text: Email
              - textbox "Email" [ref=e40]:
                - /placeholder: you@example.com
                - text: new@smallc.test
              - paragraph [ref=e41]: Email is required.
            - generic [ref=e42]:
              - text: Password
              - generic [ref=e43]:
                - textbox "Password" [ref=e44]:
                  - /placeholder: At least 8 characters
                  - text: correct-password
                - button "Show" [ref=e45]
              - paragraph [ref=e46]: Password is required.
            - generic [ref=e47]:
              - text: Confirm password
              - textbox "Confirm password" [active] [ref=e48]:
                - /placeholder: Repeat your password
                - text: correct-password
              - paragraph [ref=e49]: Confirm your password.
            - generic [ref=e50]:
              - checkbox "Send me SmallC offers and order updates." [checked] [ref=e51]
              - text: Send me SmallC offers and order updates.
            - button "Create account" [ref=e52]
            - paragraph [ref=e53]:
              - text: Already have an account?
              - link "Sign in" [ref=e54] [cursor=pointer]:
                - /url: /login
      - generic [ref=e55]:
        - generic [ref=e56]:
          - img [ref=e57]
          - generic [ref=e60]: Free shipping on orders $50+
        - generic [ref=e61]:
          - img [ref=e62]
          - generic [ref=e66]: Easy returns within 30 days
        - generic [ref=e67]:
          - img [ref=e68]
          - generic [ref=e70]: Secure payments
        - generic [ref=e71]:
          - img [ref=e72]
          - generic [ref=e75]: Customer support
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
  14 |     await page.getByRole("button", { name: "Sign in" }).click();
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
> 80 |     await page.getByRole("button", { name: "Create account" }).click();
     |                                                                ^ Error: locator.click: Test timeout of 30000ms exceeded.
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