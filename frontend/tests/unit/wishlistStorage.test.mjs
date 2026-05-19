import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  getWishlist,
  getWishlistCount,
  isProductInWishlist,
  removeFromWishlist,
  subscribeToWishlistUpdates,
  toggleWishlistProduct,
} from "../../src/lib/wishlistStorage.mjs";
import { products } from "../../src/lib/products.mjs";
import { installBrowserMock } from "./test-helpers.mjs";

describe("wishlist storage", () => {
  /** @type {ReturnType<typeof installBrowserMock> | undefined} */
  let browserMock;

  beforeEach(() => {
    browserMock = installBrowserMock();
    browserMock.browser.sessionStorage.clear();
  });

  afterEach(() => {
    browserMock?.restore();
  });

  it("starts empty", () => {
    assert.deepEqual(getWishlist(), []);
    assert.equal(getWishlistCount(), 0);
    assert.equal(isProductInWishlist(products[0].id), false);
  });

  it("toggles products on and off", () => {
    const product = products[0];

    assert.equal(toggleWishlistProduct(product), true);
    assert.equal(isProductInWishlist(product.id), true);
    assert.equal(getWishlistCount(), 1);

    assert.equal(toggleWishlistProduct(product), false);
    assert.equal(getWishlist().length, 0);
  });

  it("removes a saved product explicitly", () => {
    toggleWishlistProduct(products[1]);
    removeFromWishlist(products[1].id);
    assert.equal(getWishlistCount(), 0);
  });

  it("notifies wishlist subscribers", () => {
    let updates = 0;
    const unsubscribe = subscribeToWishlistUpdates(() => {
      updates += 1;
    });

    toggleWishlistProduct(products[2]);
    assert.equal(updates, 1);

    unsubscribe();
    toggleWishlistProduct(products[3]);
    assert.equal(updates, 1);
  });
});
