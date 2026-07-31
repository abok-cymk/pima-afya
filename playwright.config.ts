import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  webServer: [
    {
      // firebase-tools is in devDependencies — use pnpm exec, not pnpm dlx
      // --project must match the emulator project used in CI (demo-pima-afya)
      command: 'pnpm exec firebase emulators:start --project=demo-pima-afya',
      port: 8082,
      reuseExistingServer: true,
    },
    { command: 'pnpm dev', port: 5173, reuseExistingServer: true },
  ],
  use: { baseURL: 'http://localhost:5173' },
});