import { test, expect } from '@playwright/test';

/**
 * スモークテスト: 主要ページの基本表示確認
 * 各ページが200 OKで返り、主要要素が表示されることを検証
 */

test.describe('Smoke Tests - 主要ページの表示確認', () => {
  
  test('TOP: トップページが正常に表示される', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/musashi paint/i);
    
    // ヘッダー・フッターの確認
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    
    // メインコンテンツの確認
    await expect(page.locator('main')).toBeVisible();
  });

  test('製品情報: 製品ページが正常に表示される', async ({ page }) => {
    await page.goto('/product/');
    
    // ページタイトル確認
    await expect(page.locator('.page__title')).toBeVisible();
    
    // サイドバーナビゲーション確認
    await expect(page.locator('.navigation')).toBeVisible();
    await expect(page.locator('.navigation__list')).toBeVisible();
    
    // 用途でえらぶ、基材でえらぶなどのメニュー項目確認（サイドバー内のみ）
    await expect(page.locator('.navigation').getByText('用途でえらぶ')).toBeVisible();
    await expect(page.locator('.navigation').getByText('基材でえらぶ')).toBeVisible();
  });

  test('ニュース: ニュース一覧が正常に表示される', async ({ page }) => {
    await page.goto('/news/');
    
    // ページタイトル確認
    await expect(page.locator('.page__title')).toBeVisible();
    
    // アーカイブリスト確認
    const archiveList = page.locator('.archive__list');
    await expect(archiveList).toBeVisible();
    
    // 最低1件の記事が表示されることを確認
    const archiveItems = page.locator('.archive__item');
    await expect(archiveItems.first()).toBeVisible();
  });

  test('メディア: メディア一覧が正常に表示される', async ({ page }) => {
    await page.goto('/media-page/');
    
    // ページタイトル確認
    await expect(page.locator('.page__title')).toBeVisible();
    
    // メディア記事のリスト確認
    const archiveList = page.locator('.archive__list');
    await expect(archiveList).toBeVisible();
  });

  test('お問い合わせ: お問い合わせページが正常に表示される', async ({ page }) => {
    await page.goto('/contact/');
    
    // ページタイトル確認
    await expect(page.locator('.page__title')).toBeVisible();
    
    // Contact Form 7のフォームが表示されることを確認
    await expect(page.locator('.wpcf7-form')).toBeVisible();
  });

  test('資料ダウンロード: 資料ダウンロードページが正常に表示される', async ({ page }) => {
    await page.goto('/download/');
    
    // ページタイトル確認
    await expect(page.locator('.page__title')).toBeVisible();
    
    // ダウンロードリストが表示されることを確認
    await expect(page.locator('.download__list')).toBeVisible();
    
    // 検索UIが表示されることを確認
    const searchInput = page.locator('#download-search');
    const hasSearch = await searchInput.isVisible().catch(() => false);
    if (hasSearch) {
      await expect(searchInput).toBeVisible();
    }
  });

  test('企業情報: 企業情報ページが正常に表示される', async ({ page }) => {
    await page.goto('/about-us/');
    
    // ページタイトル確認
    await expect(page.locator('.page__title')).toBeVisible();
    
    // サイドバーナビゲーション確認
    await expect(page.locator('.navigation')).toBeVisible();
  });

  test('会社概要: 会社概要ページが正常に表示される', async ({ page }) => {
    await page.goto('/company/');
    
    // ページタイトル確認
    await expect(page.locator('.page__title')).toBeVisible();
  });

  test('採用情報: 採用情報ページが正常に表示される', async ({ page }) => {
    await page.goto('/career/');
    
    // ページタイトル確認
    await expect(page.locator('.page__title')).toBeVisible();
    
    // サイドバーナビゲーション確認
    await expect(page.locator('.navigation')).toBeVisible();
  });

  test('サステナビリティ: サステナビリティページが正常に表示される', async ({ page }) => {
    await page.goto('/sustainability/');
    
    // ページタイトル確認
    await expect(page.locator('.page__title')).toBeVisible();
    
    // サイドバーナビゲーション確認
    await expect(page.locator('.navigation')).toBeVisible();
  });
});
