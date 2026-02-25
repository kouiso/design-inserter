import { defineConfig, devices } from '@playwright/test';

/**
 * VRT（ビジュアルリグレッションテスト）専用 Playwright設定
 *
 * 通常のE2Eテストとは分離して実行する
 */

const environments = {
  local: 'http://localhost:10010',
  staging: 'https://musashipaint.xsrv.jp/staging',
  production: 'https://musashipaint.xsrv.jp',
};

const testEnv = (process.env.TEST_ENV || 'local') as keyof typeof environments;
const baseURL = environments[testEnv] || environments.local;

// staging環境のBasic認証（VRT_USER / VRT_PASS 環境変数で指定）
const httpCredentials = (process.env.VRT_USER && process.env.VRT_PASS)
  ? { username: process.env.VRT_USER, password: process.env.VRT_PASS }
  : undefined;

console.log(`\n📸 VRT Mode: ${process.env.VRT_DIR || 'actual'}`);
console.log(`🌐 Test Environment: ${testEnv}`);
console.log(`📍 Base URL: ${baseURL}`);
if (httpCredentials) console.log(`🔑 Basic Auth: ${httpCredentials.username}`);
console.log('');

export default defineConfig({
  testDir: './test/vrt',
  fullyParallel: true,
  retries: 0,
  workers: 3,
  reporter: [['list']],
  use: {
    baseURL,
    httpCredentials,
    screenshot: 'off',
    video: 'off',
    trace: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
