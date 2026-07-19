import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Desktop Chrome
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Mobile — Realme-sized viewport
    { name: 'mobile-android', use: { ...devices['Pixel 5'] } },
    // iPhone
    { name: 'mobile-ios', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
