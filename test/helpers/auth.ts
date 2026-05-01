/**
 * Admin storageState helper for E2E tests.
 *
 * Pattern: admin auth is OPT-IN per test. The Playwright globalSetup writes
 * `test/.auth/admin.json` once per run; tests that need wp-admin then add
 * `test.use({ storageState: 'test/.auth/admin.json' })` at the top of their
 * describe block. Tests that hit only the public site stay anonymous.
 *
 * Credentials come from env: WP_ADMIN_USER (default `admin`) and WP_ADMIN_PASS
 * (default `password` — local-dev only; CI is warned in the console).
 */

import type { Page } from '@playwright/test';

export interface AdminCredentials {
  username: string;
  password: string;
}

/**
 * Resolve admin credentials from env vars, falling back to local-dev defaults.
 * Emits a console warning when defaulting in CI so a missing secret is loud.
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
 * Submit the wp-login.php form and wait for the redirect into wp-admin.
 *
 * Uses CSS selectors (`#user_login`, `#user_pass`, `#wp-submit`) which are
 * stable across WordPress core versions. Throws if the redirect lands anywhere
 * other than under `/wp-admin/` — that indicates auth failed.
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
 * Persist the current browser context's storage state to disk so other tests
 * can re-attach via `test.use({ storageState: path })`.
 */
export async function saveAdminStorageState(page: Page, path: string): Promise<void> {
  await page.context().storageState({ path });
}
