import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

const requiredPaths = [
  "src/app/page.tsx",
  "src/components",
  "src/services",
  "src/store",
  "src/hooks",
  "src/types",
  "src/utils",
  ".env.example",
  "postcss.config.mjs",
  "tailwind.config.ts",
  ".prettierrc.json",
  "playwright.config.ts",
];

describe("frontend setup artifacts", () => {
  it("keeps the required task 1.1 folder and config structure in place", () => {
    for (const path of requiredPaths) {
      assert.equal(existsSync(path), true, `${path} should exist`);
    }
  });

  it("exposes the expected development and test scripts", () => {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

    assert.equal(packageJson.scripts.dev, "next dev");
    assert.equal(packageJson.scripts.lint, "eslint");
    assert.match(packageJson.scripts["test:unit"], /node --test/);
    assert.equal(packageJson.scripts["test:e2e"], "playwright test");
  });
});
