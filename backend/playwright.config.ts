import path from 'node:path';

import { defineConfig } from '@playwright/test';

const goCacheDir = path.join(__dirname, '.gocache');

export default defineConfig({
  testDir: './tests/playwright',
  testMatch: ['**/*.spec.ts'],
  timeout: 30000,
  use: {
    baseURL: 'http://127.0.0.1:18080',
  },
  webServer: {
    command: `sh -c "rm -f ./playwright.db && env GOCACHE=${goCacheDir} go run ./cmd/api"`,
    url: 'http://127.0.0.1:18080/api/health',
    reuseExistingServer: false,
    env: {
      APP_ENV: 'test',
      APP_PORT: '18080',
      DB_PATH: './playwright.db',
      JWT_SECRET: 'playwright-secret',
      SCHEMA_PATH: './schema.sql',
      MOCK_PAYMENT_AUTO_APPROVE: 'false',
    },
  },
});
