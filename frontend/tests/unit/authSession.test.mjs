import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  clearAuthSession,
  getAuthToken,
  getAuthUser,
  saveAuthSession,
} from "../../src/lib/authSession.mjs";
import { installBrowserMock } from "./test-helpers.mjs";

describe("auth session storage", () => {
  /** @type {ReturnType<typeof installBrowserMock> | undefined} */
  let browserMock;

  beforeEach(() => {
    browserMock = installBrowserMock();
    browserMock.browser.sessionStorage.clear();
  });

  afterEach(() => {
    browserMock?.restore();
  });

  it("persists token and user profile", () => {
    saveAuthSession({
      token: "token-123",
      user: { email: "customer@smallc.test", name: "Test Customer" },
    });

    assert.equal(getAuthToken(), "token-123");
    assert.deepEqual(getAuthUser(), {
      email: "customer@smallc.test",
      name: "Test Customer",
    });
  });

  it("clears stored credentials", () => {
    saveAuthSession({
      token: "token-123",
      user: { email: "customer@smallc.test" },
    });

    clearAuthSession();

    assert.equal(getAuthToken(), null);
    assert.equal(getAuthUser(), null);
  });
});
