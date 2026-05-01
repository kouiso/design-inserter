/**
 * Playwright globalSetup。
 *
 * 役割:
 *   1. 1 ラン 1 回だけ `wp-login.php` にログインして `test/.auth/admin.json` を生成する。
 *      個別のテストは `test.use({ storageState })` でオプトイン取得する。
 *   2. WordPress に到達できない場合（ライブコンテナのない CI でのユニット風実行など）は
 *      中断せずにログを残して return することで、管理者不要のテストを引き続き走らせる。
 *   3. 既に storageState ファイルがディスクにある場合の高速反復用に
 *      `SKIP_AUTH_SETUP=1` を尊重する。
 */

import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { dirname } from 'path';

import { chromium, type FullConfig } from '@playwright/test';

import {
  getAdminCredentialsFromEnv,
  loginAsAdmin,
  saveAdminStorageState,
} from './helpers/auth';

const STORAGE_STATE_PATH = 'test/.auth/admin.json';

/**
 * STORAGE_STATE_PATH が残っている場合に削除する。
 * ログイン失敗時に古い storageState を残してしまうと、後続のテストランで
 * 古い／無効な Cookie が再利用されて wp-admin に到達できているかのように
 * 見えてしまうため、失敗パスでは必ずファイルごと破棄する。
 */
function removeStaleStorageState(): void {
  if (existsSync(STORAGE_STATE_PATH)) {
    try {
      unlinkSync(STORAGE_STATE_PATH);
    } catch (err) {
      console.warn(
        `[global-setup] Failed to remove stale storageState: ${(err as Error).message}`,
      );
    }
  }
}

async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = config.projects?.[0]?.use?.baseURL || process.env.BASE_URL;
  if (!baseURL) {
    console.warn('[global-setup] No baseURL configured; skipping admin login.');
    return;
  }

  if (existsSync(STORAGE_STATE_PATH) && process.env.SKIP_AUTH_SETUP === '1') {
    console.log('[global-setup] Re-using existing storageState (SKIP_AUTH_SETUP=1).');
    return;
  }

  // Ensure the directory exists before Playwright tries to write into it.
  mkdirSync(dirname(STORAGE_STATE_PATH), { recursive: true });

  // Probe baseURL with a HEAD request before launching a browser; if the host
  // is unreachable we degrade gracefully instead of crashing the whole run.
  try {
    const probe = await fetch(baseURL, { method: 'HEAD' });
    // Any HTTP response (even 404) is fine — it proves the host is up.
    if (!probe) {
      throw new Error('no response');
    }
  } catch (err) {
    console.warn(
      `[global-setup] baseURL ${baseURL} not reachable (${(err as Error).message}); ` +
        'admin storageState will NOT be created. Admin-only tests will fail individually ' +
        'when they try to load the missing storageState file.',
    );
    return;
  }

  const credentials = getAdminCredentialsFromEnv();
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAsAdmin(page, baseURL, credentials);
    await saveAdminStorageState(page, STORAGE_STATE_PATH);

    // スモークチェック: 書き出した storageState が実際に管理者権限を伴って
    // wp-admin に到達できることを 1 リクエストで検証する。
    // /wp-admin/index.php に GET し、最終 URL が /wp-admin/ 配下に留まっていれば
    // Cookie が有効。wp-login.php へリダイレクトされた場合は認証無効と判断し、
    // 古い／壊れた storageState を残さないよう削除して例外を投げる。
    const adminUrl = new URL('/wp-admin/index.php', baseURL).toString();
    const probeResponse = await page.goto(adminUrl, { waitUntil: 'domcontentloaded' });
    const finalUrl = page.url();
    const reachedAdmin =
      probeResponse !== null &&
      probeResponse.status() < 400 &&
      /\/wp-admin\//.test(finalUrl) &&
      !/wp-login\.php/.test(finalUrl);

    if (!reachedAdmin) {
      removeStaleStorageState();
      throw new Error(
        `storageState smoke check failed: final URL=${finalUrl}, ` +
          `status=${probeResponse?.status() ?? 'no-response'}.`,
      );
    }

    console.log(`[global-setup] Admin storageState written to ${STORAGE_STATE_PATH}.`);
  } catch (err) {
    // ログイン or スモークチェック失敗時は古い storageState を残さない。
    // 残してしまうと次回ラン以降で existsSync が真になり、無効な Cookie で
    // 管理画面テストが走って誤判定（古いセッションで通ってしまう／真っ白で落ちる）
    // を起こすため、失敗パスでは必ずファイルを削除する。
    removeStaleStorageState();
    console.warn(
      `[global-setup] Admin login failed: ${(err as Error).message}. ` +
        'Stale storageState removed; admin-only tests will be unable to load storageState.',
    );
  } finally {
    await browser.close();
  }
}

export default globalSetup;
