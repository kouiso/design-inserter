/**
 * E2E テスト用の管理者 storageState ヘルパー。
 *
 * 方針: 管理者認証はテストごとのオプトイン。Playwright の globalSetup が
 * 1 ラン 1 回だけ `test/.auth/admin.json` を書き出し、wp-admin が必要なテストは
 * describe ブロック先頭で `test.use({ storageState: 'test/.auth/admin.json' })` を
 * 付与して取り込む。公開サイトのみを叩くテストは匿名のまま走らせる。
 *
 * 認証情報は環境変数から取得: WP_ADMIN_USER（既定 `admin`）と
 * WP_ADMIN_PASS（既定 `password` — ローカル開発専用。CI ではコンソール警告を出す）。
 */

import type { Page } from '@playwright/test';

export interface AdminCredentials {
  username: string;
  password: string;
}

/**
 * 環境変数から管理者の認証情報を解決し、未設定の場合はローカル開発用のデフォルトに
 * フォールバックする。CI でデフォルトに落ちた場合はコンソール警告を出して、
 * シークレット未設定を気付かせる。
 */
export function getAdminCredentialsFromEnv(): AdminCredentials {
  const username = process.env.WP_ADMIN_USER || 'admin';
  const password = process.env.WP_ADMIN_PASS || 'password';

  if (process.env.CI && (!process.env.WP_ADMIN_USER || !process.env.WP_ADMIN_PASS)) {
    console.warn(
      '[auth] WP_ADMIN_USER / WP_ADMIN_PASS not set in CI — falling back to local-dev defaults. ' +
        'Admin-tagged tests will likely fail until secrets are wired.',
    );
  }

  return { username, password };
}

/**
 * wp-login.php フォームを送信し、wp-admin へのリダイレクトを待つ。
 *
 * セレクタは WordPress コアのバージョンを通して安定している
 * `#user_login` / `#user_pass` / `#wp-submit` を使用。
 * `/wp-admin/` 以外へリダイレクトされた場合は認証失敗とみなして throw する。
 */
export async function loginAsAdmin(
  page: Page,
  baseURL: string,
  credentials: AdminCredentials,
): Promise<void> {
  const loginUrl = new URL('/wp-login.php', baseURL).toString();
  await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });

  await page.fill('#user_login', credentials.username);
  await page.fill('#user_pass', credentials.password);

  await Promise.all([
    page.waitForURL(/\/wp-admin\/?/, { timeout: 15_000 }),
    page.click('#wp-submit'),
  ]);

  if (!/\/wp-admin\//.test(page.url())) {
    throw new Error(
      `loginAsAdmin: expected redirect into /wp-admin/, got ${page.url()}. ` +
        `Check WP_ADMIN_USER / WP_ADMIN_PASS.`,
    );
  }
}

/**
 * 現在のブラウザコンテキストの storage state をディスクに書き出す。
 * 他のテストが `test.use({ storageState: path })` で再アタッチできるようにする。
 */
export async function saveAdminStorageState(page: Page, path: string): Promise<void> {
  await page.context().storageState({ path });
}
