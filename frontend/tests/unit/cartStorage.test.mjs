import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  addProductToCart,
  changeProductQuantity,
  getAppliedCoupon,
  getCart,
  getCartCount,
  removeProductFromCart,
  setAppliedCoupon,
  setCart,
  subscribeToCartUpdates,
  updateProductQuantity,
} from "../../src/lib/cartStorage.mjs";
import { products } from "../../src/lib/products.mjs";
import { installBrowserMock } from "./test-helpers.mjs";

describe("cart storage", () => {
  /** @type {ReturnType<typeof installBrowserMock> | undefined} */
  let browserMock;

  beforeEach(() => {
    browserMock = installBrowserMock();
    browserMock.browser.sessionStorage.clear();
    setCart([]);
  });

  afterEach(() => {
    browserMock?.restore();
  });

  it("adds new products and increments existing quantities", () => {
    const product = products[2];

    addProductToCart(product);
    addProductToCart(product);

    const cart = getCart();
    assert.equal(cart.length, 1);
    assert.equal(cart[0].id, product.id);
    assert.equal(cart[0].quantity, 2);
    assert.equal(getCartCount(), 2);
  });

  it("updates quantities and removes items at zero", () => {
    setCart([{ ...products[0], quantity: 2 }]);

    changeProductQuantity(products[0].id, 1);
    assert.equal(getCart()[0].quantity, 3);

    updateProductQuantity(products[0].id, 0);
    assert.equal(getCart().length, 0);
  });

  it("removes a product by id", () => {
    setCart([
      { ...products[0], quantity: 1 },
      { ...products[1], quantity: 1 },
    ]);

    removeProductFromCart(products[0].id);

    assert.equal(getCart().length, 1);
    assert.equal(getCart()[0].id, products[1].id);
  });

  it("stores coupons and notifies subscribers", () => {
    let updates = 0;
    const unsubscribe = subscribeToCartUpdates(() => {
      updates += 1;
    });

    setAppliedCoupon("SAVE10");
    assert.equal(getAppliedCoupon(), "SAVE10");
    assert.equal(updates, 1);

    unsubscribe();
    setAppliedCoupon("FREESHIP");
    assert.equal(updates, 1);
  });
});
