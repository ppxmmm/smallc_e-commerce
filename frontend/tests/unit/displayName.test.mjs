import test from "node:test";
import assert from "node:assert/strict";
import { getDisplayName, getInitials } from "../../src/lib/displayName.mjs";

test("getDisplayName prefers stored full name", () => {
  assert.equal(getDisplayName({ name: "Test User", email: "other@mail.com" }), "Test User");
});

test("getDisplayName derives from email local part", () => {
  assert.equal(getDisplayName({ email: "test@gmail.com" }), "Test");
  assert.equal(getDisplayName({ email: "john.doe@example.com" }), "John Doe");
});

test("getInitials builds avatar letters", () => {
  assert.equal(getInitials("Test"), "TE");
  assert.equal(getInitials("John Doe"), "JD");
});
