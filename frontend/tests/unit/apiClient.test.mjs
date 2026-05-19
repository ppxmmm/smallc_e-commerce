import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { apiRequest } from "../../src/services/apiClient.mjs";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("api client", () => {
  it("returns parsed json for successful responses", async () => {
    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({ token: "abc123" }),
    });

    const payload = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "a@b.c", password: "secret" }),
    });

    assert.deepEqual(payload, { token: "abc123" });
  });

  it("throws api error messages from json payloads", async () => {
    globalThis.fetch = async () => ({
      ok: false,
      status: 401,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({ error: "invalid email or password" }),
    });

    await assert.rejects(
      () =>
        apiRequest("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: "a@b.c", password: "wrong" }),
        }),
      (error) => {
        assert.equal(error.message, "invalid email or password");
        assert.equal(error.status, 401);
        return true;
      },
    );
  });

  it("reports network failures clearly", async () => {
    globalThis.fetch = async () => {
      throw new Error("connection refused");
    };

    await assert.rejects(
      () => apiRequest("/api/health"),
      /Could not reach the server/,
    );
  });
});
