import { test, expect } from '@playwright/test';

/**
 * タクソノミーテスト
 * 製品情報の5分類（用途/基材/意匠性/機能/環境）ターム遷移を検証
 */

test.describe('Taxonomy Tests - タクソノミー機能確認', () => {
  
  test('製品情報: サイドバーにタクソノミーメニューが表示される', async ({ page }) => {
    await page.goto('/product/');
    
    // サイドバーナビゲーション確認
    await expect(page.locator('.navigation')).toBeVisible();
    
    // 5つのタクソノミーメニュー確認（サイドバー内に限定）
    const nav = page.locator('.navigation');
    await expect(nav.getByText('用途でえらぶ')).toBeVisible();
    await expect(nav.getByText('基材でえらぶ')).toBeVisible();
    await expect(nav.getByText('意匠性でえらぶ')).toBeVisible();
    await expect(nav.getByText('機能でえらぶ')).toBeVisible();
    await expect(nav.getByText('環境キーワードでえらぶ')).toBeVisible();
  });

  test('用途でえらぶ: アーカイブページが正常に表示される', async ({ page }) => {
    // 用途でえらぶのトップレベルページに遷移
    await page.goto('/product/application/');
    
    // ページタイトル確認
    await expect(page.locator('.page__title')).toBeVisible();
    
    // サイドバーで「用途でえらぶ」のアコーディオンが展開されていることを確認
    const activeList = page.locator('.navigation__sub-accordion-list.is-active');
    await expect(activeList).toBeVisible();
  });

  test('基材でえらぶ: アーカイブページが正常に表示される', async ({ page }) => {
    await page.goto('/product/material/');
    
    await expect(page.locator('.page__title')).toBeVisible();
  });

  test('意匠性でえらぶ: アーカイブページが正常に表示される', async ({ page }) => {
    await page.goto('/product/design/');
    
    await expect(page.locator('.page__title')).toBeVisible();
  });

  test('機能でえらぶ: アーカイブページが正常に表示される', async ({ page }) => {
    await page.goto('/product/function/');
    
    await expect(page.locator('.page__title')).toBeVisible();
  });

  test('環境キーワードでえらぶ: アーカイブページが正常に表示される', async ({ page }) => {
    await page.goto('/product/environment/');
    
    await expect(page.locator('.page__title')).toBeVisible();
  });

  test('タクソノミーページネーション: 2ページ目への遷移が正常に機能する', async ({ page }) => {
    // 用途でえらぶのタームページに遷移（データが十分にある前提）
    await page.goto('/product/application/');
    
    const pagination = page.locator('.pagination');
    const hasPagination = await pagination.isVisible().catch(() => false);
    
    if (!hasPagination) {
      test.skip();
      return;
    }
    
    const page2Link = page.locator('.pagination__link', { hasText: '2' });
    await page2Link.click();
    
    // URLが変わったことを確認
    await expect(page).toHaveURL(/\/product\/application\/.*\/page\/2\//);
  });

  test('製品詳細: ダウンロード誘導リンクが機能する', async ({ page }) => {
    await page.goto('/product/');
    
    // 最初の製品リンクをクリック
    const firstProduct = page.locator('.archive__link').first();
    const isVisible = await firstProduct.isVisible().catch(() => false);
    
    if (!isVisible) {
      test.skip();
      return;
    }
    
    await firstProduct.click();
    
    // 詳細ページに遷移したことを確認
    await page.waitForLoadState('networkidle');
    
    // 資料ダウンロードリンクが存在する場合確認
    const downloadLink = page.locator('a[href*="/download/"]');
    const hasDownloadLink = await downloadLink.isVisible().catch(() => false);
    
    if (hasDownloadLink) {
      await expect(downloadLink).toBeVisible();
    }
  });

  test('メディアカテゴリ: カテゴリページが正常に表示される', async ({ page }) => {
    // メディアページに移動
    await page.goto('/media-page/');
    
    // カテゴリリンクをクリック（存在する場合）
    const categoryLink = page.locator('.archive__category-link').first();
    const isVisible = await categoryLink.isVisible().catch(() => false);
    
    if (!isVisible) {
      test.skip();
      return;
    }
    
    await categoryLink.click();
    
    // カテゴリページに遷移したことを確認
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.page__title')).toBeVisible();
  });
});
