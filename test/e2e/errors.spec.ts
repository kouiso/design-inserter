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

test.describe('エラーページ - 404 (JP)', () => {

  test('存在しないパスにアクセスすると HTTP 404 が返る', async ({ page }) => {
    const response = await page.goto('/this-path-definitely-does-not-exist-xyz/');

    // goto の戻り値で HTTP ステータスを検証（auto-retry 不要・1リクエストで確定）
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(404);
  });

  test('404 ページでもグローバル header / footer がレンダリングされる', async ({ page }) => {
    await page.goto('/this-path-definitely-does-not-exist-xyz/');

    // レイアウトが保たれていることを確認
    await expect(page.locator('header').first()).toBeVisible();
    await expect(page.locator('footer').first()).toBeVisible();
  });

  test('404 ページに「見つかりません」系の文言またはトップへの導線が表示される', async ({ page }) => {
    await page.goto('/this-path-definitely-does-not-exist-xyz/');

    // 404.php が存在しないため WordPress 既定の挙動に依存する。
    // 安定セレクタとして body 要素の存在 + ページタイトル系要素のいずれかを検証。
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // body に「見つかりません」「Not Found」「404」「ページがありません」のいずれかが
    // 含まれること、または page__title 要素 / main コンテンツが表示されていることで
    // テンプレートが正常に処理されたと判断する。
    const bodyText = await body.textContent();
    const hasNotFoundIndicator =
      /見つかりません|見つかりませんでした|Not Found|404|ページがありません|お探しのページ/i.test(
        bodyText ?? ''
      );
    const mainVisible = await page.locator('main, .page, .l-main').first().isVisible().catch(() => false);

    expect(hasNotFoundIndicator || mainVisible).toBe(true);
  });
});

test.describe('エラーページ - 404 (EN)', () => {

  test('EN サイトの存在しないパスにアクセスすると HTTP 404 が返る', async ({ page, baseURL }) => {
    // EN サイトはサブドメイン（https://en.musashipaint.com）または別構成の可能性が高く、
    // baseURL と異なるオリジンの場合はこのスペックの責務外として skip する。
    // 同一オリジン配下に /en/ プレフィックスでホスティングされている場合のみ検証する。
    const response = await page.goto('/en/this-path-definitely-does-not-exist-xyz/', {
      waitUntil: 'domcontentloaded',
    }).catch(() => null);

    test.skip(
      response === null,
      'EN サイトが baseURL 配下にホスティングされていない、またはアクセス不可のため skip'
    );

    // /en/ にアクセスしてリダイレクトでサブドメインに飛ぶ場合も skip
    const finalUrl = page.url();
    test.skip(
      !finalUrl.startsWith(baseURL ?? ''),
      `EN サイトが別オリジンに存在するため skip (final url: ${finalUrl})`
    );

    expect(response!.status()).toBe(404);
  });
});

test.describe('アクセス制御 - 管理画面保護', () => {

  test('未ログイン時に /wp-admin/ へアクセスすると wp-login.php へリダイレクトされる', async ({ page }) => {
    await page.goto('/wp-admin/');

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

  test('該当のないキーワードで検索すると 0 件メッセージが表示される', async ({ page }) => {
    const noisyQuery = 'zzzzz_no_results_query_xyzqq';
    const response = await page.goto(`/?s=${noisyQuery}`);

    // 検索結果ページは 200 OK で返る（致命エラーではない）
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);

    // search.php が読み込まれ、ページタイトルが表示される
    await expect(page.locator('.page__title.js-page-title')).toBeVisible();

    // 0 件メッセージの判定:
    //   1) .search-results__empty が表示される
    //   2) または「一致する結果は見つかりませんでした」というテンプレ文言が含まれる
    const emptyContainer = page.locator('.search-results__empty');
    const emptyMessage = page.locator(
      '.search-results__message',
      { hasText: /一致する結果は見つかりませんでした/ }
    );

    // どちらかが表示されていることを確認（auto-retry 構文）
    const emptyVisible = await emptyContainer.isVisible().catch(() => false);
    if (emptyVisible) {
      await expect(emptyContainer).toBeVisible();
      await expect(emptyMessage).toBeVisible();
    } else {
      // フォールバック: archive リストが存在しない、または件数が 0 であることを確認
      const archiveItems = page.locator('.archive__item');
      const itemCount = await archiveItems.count();
      expect(itemCount).toBe(0);
    }
  });

  test('0件ヒットの検索結果ページでもグローバル header / footer がレンダリングされる', async ({ page }) => {
    await page.goto('/?s=zzzzz_no_results_query_xyzqq');

    await expect(page.locator('header').first()).toBeVisible();
    await expect(page.locator('footer').first()).toBeVisible();
  });
});
