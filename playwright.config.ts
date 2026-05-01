import { existsSync } from 'fs';
import { resolve } from 'path';

import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

/**
 * Playwright設定ファイル
 *
 * 環境切り替え:
 *   - ローカル: npx playwright test (デフォルト)
 *   - 本番: TEST_ENV=production npx playwright test
 *   - ステージング: TEST_ENV=staging npx playwright test
 */

// 環境別のベースURL設定
const envFile = [resolve(__dirname, '.env'), resolve(__dirname, '.env.docker')].find((candidate) =>
  existsSync(candidate),
);

if (envFile) {
  dotenv.config({ path: envFile });
}

const wpJpPort = process.env._DOCKER_COMPOSE_HOST_PORT_WP_JP || process.env.WP_JP_PORT || '8080';
const wpEnPort = process.env._DOCKER_COMPOSE_HOST_PORT_WP_EN || process.env.WP_EN_PORT || '8081';
const wpBogoPort = process.env._DOCKER_COMPOSE_HOST_PORT_WP_BOGO || process.env.WP_BOGO_PORT || '8082';

const environments = {
  local: 'http://localhost:10010',
  docker: `http://localhost:${wpJpPort}`,
  'docker-en': `http://localhost:${wpEnPort}`,
  'docker-bogo': `http://localhost:${wpBogoPort}`,
  staging: 'https://musashipaint.xsrv.jp/staging',
  production: 'https://musashipaint.xsrv.jp',
  'wpx-en': 'https://xw727268.xwp.jp',
  'xsrv-en': 'https://musashipaint.xsrv.jp/en',
};

// 環境変数からベースURLを決定
const testEnv = (process.env.TEST_ENV || 'local') as keyof typeof environments;
const baseURL = environments[testEnv] || environments.local;

console.log(`\n🌐 Test Environment: ${testEnv}`);
console.log(`📍 Base URL: ${baseURL}\n`);

export default defineConfig({
  testDir: './test',
  testIgnore: ['**/vrt/**'],
  // Materialise test/.auth/admin.json once per run. Tests that need wp-admin
  // opt-in via `test.use({ storageState: 'test/.auth/admin.json' })` — the
  // default fixture stays anonymous so public-site tests are unchanged.
  globalSetup: './test/global-setup.ts',
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
    // 公開サイト向けテスト用の 3 ブラウザ並列プロジェクト。
    // degradation.spec.ts は WordPress の管理画面オプション（共有 DB 状態）を
    // 書き換えるテストを含むため、cross-worker race を避ける目的で
    // 各プロジェクトから testIgnore で除外する。実体は下の admin プロジェクトで
    // chromium のみ単一ワーカーで実行する。
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: [/degradation\.spec\.ts/],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: [/degradation\.spec\.ts/],
    },
    {
      name: 'msedge',
      use: { ...devices['Desktop Edge'] },
      testIgnore: [/degradation\.spec\.ts/],
    },
    // 管理画面 / DB ミューテーションを伴うテスト専用のプロジェクト。
    // test.describe.configure({ mode: 'serial' }) は単一ワーカー内でしか直列化を
    // 保証しないため、複数プロジェクトを並列実行すると同じ wp_options を
    // 別ワーカーが同時に書き換えて flaky になる。chromium のみに絞ることで
    // ワーカー多重化を排除し、共有 DB 状態の整合性を担保する。
    {
      name: 'admin',
      use: { ...devices['Desktop Chrome'] },
      testMatch: [/degradation\.spec\.ts/],
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
