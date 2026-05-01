import { test, expect } from '@playwright/test';

/**
 * エラーページ・アクセス制御のE2Eテスト
 * - 404ページ（JP）の表示と HTTP ステータス
 * - 404ページ（EN）の表示（EN サイトが同一オリジンで提供されない場合は skip）
 * - 未ログイン時の wp-admin アクセス → wp-login.php へのリダイレクト（管理画面保護）
 * - 0件ヒットの検索結果ページ表示
 *
 * メモ:
 *   muashi テーマには 404.php が存在しないため WordPress 既定の 404 挙動を使用する。
 *   レイアウト崩れを起こさないことを確認するため、グローバル header / footer の表示も検証。
 */

/**
 * baseURL のパスプレフィックス（例: /staging）を尊重して URL を組み立てる。
 *
 * 注意: `new URL(relative, base)` は base の末尾が `/` でない場合、
 * 最終セグメントを relative で置換する仕様のため、必ず末尾スラッシュを付与する。
 *   例: new URL('foo', 'https://h/staging')  -> https://h/foo  (誤)
 *       new URL('foo', 'https://h/staging/') -> https://h/staging/foo (正)
 */
function buildUrl(relative: string, baseURL: string | undefined): string {
  if (!baseURL) {
    throw new Error('baseURL is not configured in playwright.config');
  }
  const normalizedBase = baseURL.endsWith('/') ? baseURL : `${baseURL}/`;
  return new URL(relative, normalizedBase).toString();
}

test.describe('エラーページ - 404 (JP)', () => {

  test('存在しないパスにアクセスすると HTTP 404 が返る', async ({ page, baseURL }) => {
    const url = buildUrl('this-path-definitely-does-not-exist-xyz/', baseURL);
    const response = await page.goto(url);

    // goto の戻り値で HTTP ステータスを検証（auto-retry 不要・1リクエストで確定）
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(404);
  });

  test('404 ページでもグローバル header / footer がレンダリングされる', async ({ page, baseURL }) => {
    const url = buildUrl('this-path-definitely-does-not-exist-xyz/', baseURL);
    await page.goto(url);

    // レイアウトが保たれていることを確認
    await expect(page.locator('header').first()).toBeVisible();
    await expect(page.locator('footer').first()).toBeVisible();
  });

  test('404 ページに「見つかりません」系の文言またはトップへの導線が表示される', async ({ page, baseURL }) => {
    const url = buildUrl('this-path-definitely-does-not-exist-xyz/', baseURL);
    await page.goto(url);

    // 404.php が存在しないため WordPress 既定の挙動に依存する。
    // 安定セレクタとして body 要素の存在 + ページタイトル系要素のいずれかを検証。
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // body に「見つかりません」「Not Found」「404」「ページがありません」のいずれかが
    // 含まれることを auto-retry assertion で検証する。
    // toContainText は内部で polling するため、レンダリング遅延に強い。
    await expect(body).toContainText(
      /見つかりません|見つかりませんでした|Not Found|404|ページがありません|お探しのページ/i
    );
  });
});

test.describe('エラーページ - 404 (EN)', () => {

  test('EN サイトの存在しないパスにアクセスすると HTTP 404 が返る', async ({ page, baseURL }) => {
    // EN サイトはサブドメイン（https://en.musashipaint.com）または別構成の可能性が高く、
    // baseURL と異なるオリジンの場合はこのスペックの責務外として skip する。
    // 同一オリジン配下に /en/ プレフィックスでホスティングされている場合のみ検証する。
    const url = buildUrl('en/this-path-definitely-does-not-exist-xyz/', baseURL);
    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
    }).catch(() => null);

    test.skip(
      response === null,
      'EN サイトが baseURL 配下にホスティングされていない、またはアクセス不可のため skip'
    );

    // /en/ にアクセスしてリダイレクトでサブドメインに飛ぶ場合も skip
    // baseURL がパスプレフィックス (例: /staging) を持つ場合に startsWith 比較は誤検知するため、
    // origin (scheme + host + port) 同士で比較する。
    const finalUrl = page.url();
    const finalOrigin = new URL(finalUrl).origin;
    const baseOrigin = baseURL ? new URL(baseURL).origin : '';
    test.skip(
      finalOrigin !== baseOrigin,
      `EN サイトが別オリジンに存在するため skip (final url: ${finalUrl})`
    );

    expect(response!.status()).toBe(404);
  });
});

test.describe('アクセス制御 - 管理画面保護', () => {

  test('未ログイン時に /wp-admin/ へアクセスすると wp-login.php へリダイレクトされる', async ({ page, baseURL }) => {
    const url = buildUrl('wp-admin/', baseURL);
    await page.goto(url);

    // WordPress 既定挙動: 未ログイン時は wp-login.php へリダイレクトされる
    await expect(page).toHaveURL(/wp-login\.php/);

    // ログインフォームの主要要素が表示されること
    const loginForm = page.locator('#loginform, form[name="loginform"]').first();
    await expect(loginForm).toBeVisible();

    const userInput = page.locator('#user_login');
    await expect(userInput).toBeVisible();

    const passInput = page.locator('#user_pass');
    await expect(passInput).toBeVisible();
  });
});

test.describe('検索 - 0件ヒット', () => {

  test('該当のないキーワードで検索すると 0 件メッセージが表示される', async ({ page, baseURL }) => {
    const noisyQuery = 'zzzzz_no_results_query_xyzqq';
    const url = buildUrl(`?s=${noisyQuery}`, baseURL);
    const response = await page.goto(url);

    // 検索結果ページは 200 OK で返る（致命エラーではない）
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);

    // search.php が読み込まれ、ページタイトルが表示される
    await expect(page.locator('.page__title.js-page-title')).toBeVisible();

    // muashi テーマの search.php は、検索キーワードあり & have_posts() が false の場合
    // 必ず .search-results__empty + .search-results__message を出力するため、
    // 直接 auto-retry assertion で検証する（フォールバック分岐は不要）。
    const emptyContainer = page.locator('.search-results__empty');
    const emptyMessage = page.locator(
      '.search-results__message',
      { hasText: /一致する結果は見つかりませんでした/ }
    );

    await expect(emptyContainer).toBeVisible();
    await expect(emptyMessage).toBeVisible();
  });

  test('0件ヒットの検索結果ページでもグローバル header / footer がレンダリングされる', async ({ page, baseURL }) => {
    const url = buildUrl('?s=zzzzz_no_results_query_xyzqq', baseURL);
    await page.goto(url);

    await expect(page.locator('header').first()).toBeVisible();
    await expect(page.locator('footer').first()).toBeVisible();
  });
});
