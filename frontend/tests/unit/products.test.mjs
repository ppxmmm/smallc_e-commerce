import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  categories,
  defaultCartItems,
  getProductById,
  products,
} from "../../src/lib/products.mjs";

describe("product catalog", () => {
  it("exposes unique product ids", () => {
    const ids = products.map((product) => product.id);
    assert.equal(ids.length, new Set(ids).size);
  });

  it("includes All as the first category filter", () => {
    assert.equal(categories[0], "All");
    assert.ok(categories.includes("Electronics"));
  });

  it("finds products by numeric id", () => {
    const product = getProductById(1);
    assert.equal(product?.name, "Soundcore Life Q30");
    assert.equal(product?.category, "Electronics");
  });

  it("returns null for unknown ids", () => {
    assert.equal(getProductById("999"), null);
    assert.equal(getProductById("not-a-number"), null);
  });

  it("seeds the default cart with two starter items", () => {
    const items = defaultCartItems();
    assert.equal(items.length, 2);
    assert.ok(items.every((item) => item.quantity >= 1));
    assert.equal(items[0].id, products[0].id);
    assert.equal(items[1].id, products[1].id);
  });
});
