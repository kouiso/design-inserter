import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright設定ファイル
 * ベースURL: http://localhost:10010 (Local by Flywheelの設定に合わせる)
 */
export default defineConfig({
  testDir: './test',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:10010',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'msedge',
      use: { ...devices['Desktop Edge'] },
    },
    // モバイルテスト（必要に応じて有効化）
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  // webServer: {
  //   // ローカル環境が既に起動している前提
  //   // 自動起動が必要な場合はここで設定
  //   // command: 'npm run start',
  //   // url: 'http://localhost:10010',
  //   // reuseExistingServer: !process.env.CI,
  // },
});
