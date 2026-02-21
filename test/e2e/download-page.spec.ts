import { test, expect } from '@playwright/test';

test.describe('ダウンロードページ', () => {

  test.describe('カタログダウンロード（/document/）', () => {

    test('検索ラベルが正しいテキストで表示される', async ({ page }) => {
      await page.goto('/document/');

      const searchLabel = page.locator('.download__search-label');
      await expect(searchLabel).toBeVisible();
      await expect(searchLabel).toHaveText('製品名（カタカナ）で製品の絞り込みができます。');
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
      await expect(nav.locator('.navigation__link:has-text("カタログダウンロード")')).toBeVisible();

      // 製品詳細リンクが存在する
      await expect(nav.locator('.navigation__link:has-text("製品詳細")')).toBeVisible();
    });

    test('サイドバーのカタログダウンロードがカレント状態', async ({ page }) => {
      await page.goto('/document/');

      const currentItem = page.locator('.navigation__item.is-current');
      await expect(currentItem).toBeVisible();
      await expect(currentItem.locator('.navigation__link')).toHaveText('カタログダウンロード');
    });

    test('サイドバーリンクにパディングが適用されている', async ({ page }) => {
      await page.goto('/document/');

      const navLink = page.locator('.navigation__link').first();
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
      await expect(searchLabel).toHaveText('製品名（カタカナ）で製品の絞り込みができます。');
    });

    test('検索プレースホルダーが正しいテキストで表示される', async ({ page }) => {
      await page.goto('/document-featured/');

      const searchInput = page.locator('.download__search-input');
      await expect(searchInput).toBeVisible();
      await expect(searchInput).toHaveAttribute('placeholder', '製品名・キーワードで検索');
    });

    test('サイドバーの製品詳細がカレント状態', async ({ page }) => {
      await page.goto('/document-featured/');

      const currentItem = page.locator('.navigation__item.is-current');
      await expect(currentItem).toBeVisible();
      await expect(currentItem.locator('.navigation__link')).toHaveText('製品詳細');
    });

    test('製品詳細リンクが/document-featured/に遷移する', async ({ page }) => {
      await page.goto('/document/');

      const featuredLink = page.locator('.navigation__link:has-text("製品詳細")');
      await featuredLink.click();

      await expect(page).toHaveURL(/\/document-featured\//);
    });
  });
});
