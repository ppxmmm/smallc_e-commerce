import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  authenticateLogin,
  validateLogin,
} from "../../src/lib/loginValidation.mjs";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

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

  it("rejects incorrect credentials from the API", async () => {
    globalThis.fetch = async () => ({
      ok: false,
      status: 401,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({ error: "invalid email or password" }),
    });

    const result = await authenticateLogin({
      email: "customer@smallc.test",
      password: "wrong-password",
    });

    assert.equal(result.isValid, false);
    assert.equal(result.errors.form, "Email or password is incorrect.");
  });

  it("returns a token when the API accepts credentials", async () => {
    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiY3VzdG9tZXIiLCJzdWIiOiIxIn0.test",
      }),
    });

    const result = await authenticateLogin({
      email: " customer@smallc.test ",
      password: "correct-password",
    });

    assert.equal(result.isValid, true);
    assert.deepEqual(result.errors, {});
    assert.equal(result.values.email, "customer@smallc.test");
    assert.equal(result.user?.role, "customer");
    assert.equal(result.user?.email, "customer@smallc.test");
  });
});
