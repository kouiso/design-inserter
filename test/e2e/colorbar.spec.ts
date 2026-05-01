import { test, expect } from '@playwright/test';

/**
 * TOPページ KVナビ検索アイコンの色変化テスト
 * Issue #153: 背景色が変わった時に検索アイコンの色が適切に変わることを確認
 *
 * 注: KVナビはPC表示（768px以上）でのみ表示されるため、PC表示で実行
 */

test.describe('TOPページ KVナビ - 検索アイコンの色変化', () => {

  test.beforeEach(async ({ page }) => {
    // PC表示に設定
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    // ページの読み込み完了を待つ
    await page.waitForLoadState('domcontentloaded');
  });

  test('data-text-color属性に応じて検索アイコンの色が変わる', async ({ page }) => {
    // KVセクションとナビ要素が存在するか確認
    const kvSection = page.locator('.top-kv');
    const searchIcon = page.locator('.top-kv__nav-link--search');
    const navLinkText = page.locator('.top-kv__nav-link-text').first();

    // KVナビはPCのみ表示（要素が存在しない場合はスキップ）
    const kvExists = await kvSection.count();
    const searchExists = await searchIcon.count();
    test.skip(
      kvExists === 0 || searchExists === 0,
      'TOPページのKVセクションまたは検索アイコンが存在しないためスキップ',
    );

    // 検索アイコンが表示されているか確認（モバイル表示では非表示）
    const isSearchVisible = await searchIcon.isVisible();
    test.skip(!isSearchVisible, 'モバイル表示では検索アイコンが非表示のためスキップ');

    // 初期色を捕捉してから data-text-color="white" を適用する
    // 初期状態で偶然 searchIcon と navLinkText の色が一致していた場合、
    // s === n のポーリングが即座に通って遷移前の色を掴んでしまうため、
    // 「初期色から実際に変化した」ことを基準にトランジション完了を待つ
    const initialSearchColor = await searchIcon.evaluate((el) => window.getComputedStyle(el).color);

    // data-text-color="white"を設定
    await kvSection.evaluate((el) => {
      el.setAttribute('data-text-color', 'white');
    });
    // CSSトランジション完了後、(1) searchIcon の色が初期色から変化し、
    // かつ (2) searchIcon と navLinkText の色が同期するのを待つ
    await expect.poll(
      async () => {
        const s = await searchIcon.evaluate((el) => window.getComputedStyle(el).color);
        const n = await navLinkText.evaluate((el) => window.getComputedStyle(el).color);
        return s !== initialSearchColor && s === n ? s : null;
      },
      { timeout: 2000 }
    ).not.toBeNull();

    // 検索アイコンとナビリンクテキストの色を取得
    const searchColorWhite = await searchIcon.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    const navColorWhite = await navLinkText.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // whiteテーマで検索アイコンとナビリンクテキストの色が一致することを確認
    expect(searchColorWhite).toBe(navColorWhite);

    // data-text-color="black"を設定
    await kvSection.evaluate((el) => {
      el.setAttribute('data-text-color', 'black');
    });
    // CSSトランジション完了後、白から色が変化したことを確認
    await expect.poll(
      async () => searchIcon.evaluate((el) => window.getComputedStyle(el).color),
      { timeout: 2000 }
    ).not.toBe(searchColorWhite);

    // 色を再取得
    const searchColorBlack = await searchIcon.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    const navColorBlack = await navLinkText.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // blackテーマで検索アイコンとナビリンクテキストの色が一致することを確認
    expect(searchColorBlack).toBe(navColorBlack);

    // whiteとblackで色が異なることを確認（テーマが実際に機能している）
    expect(searchColorWhite).not.toBe(searchColorBlack);
  });
});
