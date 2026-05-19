import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateCart, formatBaht } from "../../src/lib/cartMath.mjs";

describe("cart totals", () => {
  it("adds subtotal, shipping, and total for regular carts", () => {
    const totals = calculateCart([
      { price: 1290, quantity: 2 },
      { price: 590, quantity: 1 },
    ]);

    assert.deepEqual(totals, {
      subtotal: 3170,
      shipping: 60,
      discount: 0,
      total: 3230,
      appliedCoupon: "",
    });
  });

  it("applies SAVE10 as a ten percent subtotal discount", () => {
    const totals = calculateCart([{ price: 2500, quantity: 2 }], "save10");

    assert.equal(totals.discount, 500);
    assert.equal(totals.total, 4560);
    assert.equal(totals.appliedCoupon, "SAVE10");
  });

  it("waives shipping with FREESHIP and keeps empty carts at zero", () => {
    assert.equal(calculateCart([{ price: 900, quantity: 1 }], "FREESHIP").total, 900);
    assert.equal(calculateCart([], "SAVE10").total, 0);
  });
});

describe("currency formatting", () => {
  it("formats values as Thai baht", () => {
    assert.equal(formatBaht(3040), "฿3,040");
  });
});
