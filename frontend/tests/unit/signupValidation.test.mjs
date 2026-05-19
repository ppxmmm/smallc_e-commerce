import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateSignup } from "../../src/lib/signupValidation.mjs";

describe("signup validation", () => {
  it("requires customer details", () => {
    const result = validateSignup({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    assert.equal(result.isValid, false);
    assert.equal(result.errors.name, "Full name is required.");
    assert.equal(result.errors.email, "Email is required.");
    assert.equal(result.errors.password, "Password is required.");
    assert.equal(result.errors.confirmPassword, "Confirm your password.");
  });

  it("rejects password mismatch", () => {
    const result = validateSignup({
      name: "SmallC Customer",
      email: "customer@smallc.test",
      password: "correct-password",
      confirmPassword: "different-password",
    });

    assert.equal(result.isValid, false);
    assert.equal(result.errors.confirmPassword, "Passwords do not match.");
  });

  it("trims profile fields and accepts valid signup data", () => {
    const result = validateSignup({
      name: " SmallC Customer ",
      email: " new@smallc.test ",
      password: "correct-password",
      confirmPassword: "correct-password",
    });

    assert.equal(result.isValid, true);
    assert.deepEqual(result.errors, {});
    assert.equal(result.values.name, "SmallC Customer");
    assert.equal(result.values.email, "new@smallc.test");
  });
});
