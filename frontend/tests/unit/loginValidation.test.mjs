import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  authenticateLogin,
  validateLogin,
} from "../../src/lib/loginValidation.mjs";

describe("login validation", () => {
  it("requires a valid email and password", () => {
    const result = validateLogin({ email: "invalid", password: "short" });

    assert.equal(result.isValid, false);
    assert.equal(result.errors.email, "Enter a valid email address.");
    assert.equal(
      result.errors.password,
      "Password must be at least 8 characters.",
    );
  });

  it("trims email and accepts valid credentials", () => {
    const result = validateLogin({
      email: " customer@smallc.test ",
      password: "correct-password",
    });

    assert.equal(result.isValid, true);
    assert.deepEqual(result.errors, {});
    assert.equal(result.values.email, "customer@smallc.test");
  });

  it("rejects incorrect demo credentials", async () => {
    const result = await authenticateLogin({
      email: "customer@smallc.test",
      password: "wrong-password",
    });

    assert.equal(result.isValid, false);
    assert.equal(result.errors.form, "Email or password is incorrect.");
  });

  it("authenticates the demo account", async () => {
    const result = await authenticateLogin({
      email: " customer@smallc.test ",
      password: "correct-password",
    });

    assert.equal(result.isValid, true);
    assert.deepEqual(result.errors, {});
    assert.equal(result.values.email, "customer@smallc.test");
  });
});
