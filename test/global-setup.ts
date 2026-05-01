/**
 * Playwright globalSetup.
 *
 * Responsibilities:
 *   1. Materialise `test/.auth/admin.json` once per test run by logging into
 *      `wp-login.php`. Individual tests then opt-in via `test.use({ storageState })`.
 *   2. Be tolerant when WordPress is not reachable (e.g. unit-style invocation
 *      in CI without a live container) — log and return rather than aborting,
 *      so admin-less tests can still run.
 *   3. Honour `SKIP_AUTH_SETUP=1` for fast iteration when an existing
 *      storageState file is already on disk.
 */

import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

import { chromium, type FullConfig } from '@playwright/test';

import {
  getAdminCredentialsFromEnv,
  loginAsAdmin,
  saveAdminStorageState,
} from './helpers/auth';

const STORAGE_STATE_PATH = 'test/.auth/admin.json';

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
    console.log(`[global-setup] Admin storageState written to ${STORAGE_STATE_PATH}.`);
  } catch (err) {
    console.warn(
      `[global-setup] Admin login failed: ${(err as Error).message}. ` +
        'Admin-only tests will be unable to load storageState.',
    );
  } finally {
    await browser.close();
  }
}

export default globalSetup;
