import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright設定ファイル
 *
 * 環境切り替え:
 *   - ローカル: npx playwright test (デフォルト)
 *   - 本番: TEST_ENV=production npx playwright test
 *   - ステージング: TEST_ENV=staging npx playwright test
 */

// 環境別のベースURL設定
const environments = {
  local: 'http://localhost:10010',
  docker: 'http://localhost:8080',
  'docker-en': 'http://localhost:8081',
  staging: 'https://musashipaint.xsrv.jp/staging',
  production: 'https://musashipaint.xsrv.jp',
};

// 環境変数からベースURLを決定
const testEnv = (process.env.TEST_ENV || 'local') as keyof typeof environments;
const baseURL = environments[testEnv] || environments.local;

console.log(`\n🌐 Test Environment: ${testEnv}`);
console.log(`📍 Base URL: ${baseURL}\n`);

export default defineConfig({
  testDir: './test',
  testIgnore: ['**/vrt/**'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL,
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
