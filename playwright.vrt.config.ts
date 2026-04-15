import { existsSync } from 'fs';
import { resolve } from 'path';

import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

/**
 * VRT（ビジュアルリグレッションテスト）専用 Playwright設定
 *
 * 通常のE2Eテストとは分離して実行する
 */

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
