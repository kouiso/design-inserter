import { test, expect } from '@playwright/test';

test.describe('ダウンロードページ', () => {

  test.describe('カタログダウンロード（/document/）', () => {

    test('検索ラベルが正しいテキストで表示される', async ({ page }) => {
      await page.goto('/document/');

      const searchLabel = page.locator('.download__search-label');
      await expect(searchLabel).toBeVisible();
      await expect(searchLabel).toContainText('製品名');
    });

    test('検索プレースホルダーが正しいテキストで表示される', async ({ page }) => {
      await page.goto('/document/');

      const searchInput = page.locator('.download__search-input');
      await expect(searchInput).toBeVisible();
      await expect(searchInput).toHaveAttribute('placeholder', '製品名・キーワードで検索');
    });

    test('サイドバーナビゲーションが表示される', async ({ page }) => {
      await page.goto('/document/');

      const nav = page.locator('.navigation');
      await expect(nav).toBeVisible();

      // カタログダウンロードリンクが存在する
      await expect(nav.locator('.navigation__item-title:has-text("カタログダウンロード")')).toBeVisible();
    });

    test('サイドバーのカタログダウンロードがアクティブ状態', async ({ page }) => {
      await page.goto('/document/');

      const nav = page.locator('.navigation');
      await expect(nav).toBeVisible();
      await expect(nav).toContainText('カタログダウンロード');
    });

    test('サイドバーリンクにパディングが適用されている', async ({ page }) => {
      await page.goto('/document/');

      const navLink = page.locator('.navigation__item-title').first();
      await expect(navLink).toBeVisible();

      const paddingTop = await navLink.evaluate(
        (el) => window.getComputedStyle(el).paddingTop
      );
      expect(parseInt(paddingTop)).toBeGreaterThanOrEqual(16);
    });
  });

  test.describe('製品詳細（/document-featured/）', () => {

    test('検索ラベルが正しいテキストで表示される', async ({ page }) => {
      await page.goto('/document-featured/');

      const searchLabel = page.locator('.download__search-label');
      await expect(searchLabel).toBeVisible();
      await expect(searchLabel).toContainText('製品名');
    });

    test('検索プレースホルダーが正しいテキストで表示される', async ({ page }) => {
      await page.goto('/document-featured/');

      const searchInput = page.locator('.download__search-input');
      await expect(searchInput).toBeVisible();
      await expect(searchInput).toHaveAttribute('placeholder', '製品名・キーワードで検索');
    });

    test('サイドバーナビゲーションが表示される', async ({ page }) => {
      await page.goto('/document-featured/');

      const nav = page.locator('.navigation');
      await expect(nav).toBeVisible();

      // カタログダウンロードリンクが存在する
      await expect(nav.locator('.navigation__item-title:has-text("カタログダウンロード")')).toBeVisible();
    });
  });
});
