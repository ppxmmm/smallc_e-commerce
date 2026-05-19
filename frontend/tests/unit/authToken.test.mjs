import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isSellerRole, userFromToken } from "../../src/lib/authToken.mjs";
import { makeJwtPayload } from "./test-helpers.mjs";

describe("auth token helpers", () => {
  it("returns null for missing or malformed tokens", () => {
    assert.equal(userFromToken(""), null);
    assert.equal(userFromToken("not-a-jwt"), null);
    assert.equal(userFromToken("only.two"), null);
  });

  it("decodes user id and role from jwt payload", () => {
    const user = userFromToken(
      makeJwtPayload({ sub: "42", role: "customer" }),
    );

    assert.deepEqual(user, { id: 42, role: "customer" });
  });

  it("treats seller and admin as seller workspace roles", () => {
    assert.equal(isSellerRole("seller"), true);
    assert.equal(isSellerRole("admin"), true);
    assert.equal(isSellerRole("customer"), false);
    assert.equal(isSellerRole(null), false);
  });
});
