# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smallc-shopping.spec.ts >> customer storefront >> customer can search, add to cart, apply coupon, and place a mock order
- Location: tests/e2e/smallc-shopping.spec.ts:12:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Thank you for your order!')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Thank you for your order!')

```

```yaml
- alert
- main:
  - link "smallC":
    - /url: /home
  - navigation "Primary navigation":
    - link "Home":
      - /url: /home
    - link "Shop":
      - /url: /home#shop
    - link "Orders":
      - /url: /orders
  - paragraph: Welcome
  - paragraph: Hi, Customer
  - button "Sign out"
  - link "Favourites with 0 items":
    - /url: /wishlist
  - link "Cart with 3 items":
    - /url: /cart
    - text: Cart 3
  - article:
    - heading "Order Timeline" [level=2]
    - paragraph: Order Placed
    - paragraph: Payment Confirmed
    - paragraph: Processing
    - paragraph: Shipped
    - paragraph: Delivered
  - article:
    - heading "My Orders" [level=2]
    - table:
      - rowgroup:
        - row "Order ID Payment Fulfillment Total":
          - columnheader "Order ID"
          - columnheader "Payment"
          - columnheader "Fulfillment"
          - columnheader "Total"
      - rowgroup:
        - row "SC250517-0036 Paid Processing ฿3,040":
          - cell "SC250517-0036"
          - cell "Paid"
          - cell "Processing"
          - cell "฿3,040"
        - row "SC250517-0005 Paid Packed ฿1,290":
          - cell "SC250517-0005"
          - cell "Paid"
          - cell "Packed"
          - cell "฿1,290"
        - row "SC250509-0064 Paid Delivered ฿3,590":
          - cell "SC250509-0064"
          - cell "Paid"
          - cell "Delivered"
          - cell "฿3,590"
  - link "smallC":
    - /url: /home
  - paragraph: Everyday essentials, electronics, home goods, and fashion delivered with secure checkout and friendly customer support.
  - link "Facebook":
    - /url: "#"
  - link "Instagram":
    - /url: "#"
  - link "TikTok":
    - /url: "#"
  - heading "Shop" [level=2]
  - navigation "Footer shop links":
    - link "Electronics":
      - /url: /home#shop
    - link "Fashion":
      - /url: /home#shop
    - link "Beauty":
      - /url: /home#shop
    - link "Home & Living":
      - /url: /home#shop
  - heading "Support" [level=2]
  - navigation "Footer support links":
    - link "Customer support":
      - /url: /orders
    - link "Shipping":
      - /url: /orders
    - link "Returns":
      - /url: /orders
    - link "Track order":
      - /url: /orders
  - heading "Contact" [level=2]
  - text: "support@smallc.store Bangkok fulfillment center Secure payments: Visa · Mastercard · PromptPay © 2026 smallC. All rights reserved. Privacy policy · Terms and conditions"
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | import { loginAs } from "./auth-helpers.mjs";
  3  | 
  4  | test.describe("customer storefront", () => {
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await loginAs(page, {
  7  |       email: "customer@smallc.test",
  8  |       password: "correct-password",
  9  |     });
  10 |   });
  11 | 
  12 |   test("customer can search, add to cart, apply coupon, and place a mock order", async ({
  13 |     page,
  14 |   }) => {
  15 |     await expect(page.locator("h1", { hasText: "New Season Sale" })).toBeVisible();
  16 |     await page.locator("#shop").scrollIntoViewIfNeeded();
  17 |     await page.getByTestId("global-search").fill("soundcore");
  18 |     await expect(page.getByRole("link", { name: "Soundcore Life Q30" }).first()).toBeVisible();
  19 | 
  20 |     await page.getByTestId("add-product-1").first().click();
  21 |     await page.getByTestId("cart-button").click();
  22 |     await expect(page).toHaveURL(/\/cart$/);
  23 | 
  24 |     await page.getByLabel("Coupon code").fill("SAVE10");
  25 |     await page.getByRole("button", { name: "Apply" }).click();
  26 |     await expect(page.getByText(/-฿/).first()).toBeVisible();
  27 | 
  28 |     await page.getByRole("link", { name: "Continue to checkout" }).click();
  29 |     await expect(page).toHaveURL(/\/checkout$/);
  30 | 
  31 |     await page.getByRole("button", { name: "Place Order" }).click();
  32 |     await expect(page).toHaveURL(/\/orders$/);
> 33 |     await expect(page.getByText("Thank you for your order!")).toBeVisible();
     |                                                               ^ Error: expect(locator).toBeVisible() failed
  34 |   });
  35 | 
  36 |   test("shop search exposes an empty state", async ({ page }) => {
  37 |     await page.locator("#shop").scrollIntoViewIfNeeded();
  38 |     await page.getByTestId("global-search").fill("not-a-real-product");
  39 |     await expect(page.getByTestId("empty-state")).toContainText("No products found.");
  40 |   });
  41 | 
  42 |   test("does not show checkout blocks on the home page", async ({ page }) => {
  43 |     await expect(page.getByRole("heading", { name: "Cart & Checkout Preview" })).toHaveCount(0);
  44 |     await expect(page.getByRole("heading", { name: "Shipping & Payment" })).toHaveCount(0);
  45 |     await expect(page.getByRole("heading", { name: "Product Detail Preview" })).toHaveCount(0);
  46 |     await expect(page.getByRole("heading", { name: "My Orders" })).toHaveCount(0);
  47 |   });
  48 | 
  49 |   test("does not show the seller dashboard", async ({ page }) => {
  50 |     await expect(page.getByRole("heading", { name: "Dashboard Overview" })).toHaveCount(0);
  51 |     await expect(page.getByText("Seller Dashboard")).toHaveCount(0);
  52 |   });
  53 | });
  54 | 
  55 | test.describe("seller workspace", () => {
  56 |   test.beforeEach(async ({ page }) => {
  57 |     await loginAs(page, {
  58 |       email: "seller@smallc.test",
  59 |       password: "correct-password",
  60 |     });
  61 |   });
  62 | 
  63 |   test("seller dashboard includes product and order management", async ({ page }) => {
  64 |     await expect(page.getByRole("heading", { name: "Dashboard Overview" })).toBeVisible();
  65 |     await expect(page.getByRole("heading", { name: "Product Management" })).toBeVisible();
  66 |     await expect(page.getByRole("heading", { name: "Order Management" })).toBeVisible();
  67 |     await expect(page.getByText("Seller Dashboard")).toBeVisible();
  68 |   });
  69 | 
  70 |   test("does not show the customer storefront hero", async ({ page }) => {
  71 |     await expect(page.locator("h1", { hasText: "New Season Sale" })).toHaveCount(0);
  72 |   });
  73 | });
  74 | 
```