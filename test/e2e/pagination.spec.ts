import { test, expect } from '@playwright/test';

/**
 * ページネーションテスト
 * 各アーカイブページで2ページ目への遷移と前後リンクの動作を検証
 * 注: データが13件以上必要（12件/ページ設定のため）
 */

test.describe('Pagination Tests - ページネーション機能確認', () => {
  
  test('ニュース: 2ページ目への遷移が正常に機能する', async ({ page }) => {
    await page.goto('/news/');
    
    // ページネーションが存在する場合のみテスト実行
    const pagination = page.locator('.pagination');
    const hasPagination = await pagination.isVisible().catch(() => false);
    
    if (!hasPagination) {
      test.skip();
      return;
    }
    
    // 2ページ目へのリンクをクリック
    const page2Link = page.locator('.pagination__link', { hasText: '2' });
    await page2Link.click();
    
    // URLが変わったことを確認
    await expect(page).toHaveURL(/\/news\/page\/2\//);
    
    // 前へリンクが表示されることを確認
    await expect(page.locator('.pagination__link--prev')).toBeVisible();
  });

  test('採用情報: 2ページ目への遷移が正常に機能する', async ({ page }) => {
    await page.goto('/career/');
    
    const pagination = page.locator('.pagination');
    const hasPagination = await pagination.isVisible().catch(() => false);
    
    if (!hasPagination) {
      test.skip();
      return;
    }
    
    const page2Link = page.locator('.pagination__link', { hasText: '2' });
    await page2Link.click();
    
    await expect(page).toHaveURL(/\/career\/page\/2\//);
  });

  test('インタビュー: 2ページ目への遷移が正常に機能する', async ({ page }) => {
    await page.goto('/career/interview/');
    
    const pagination = page.locator('.pagination');
    const hasPagination = await pagination.isVisible().catch(() => false);
    
    if (!hasPagination) {
      test.skip();
      return;
    }
    
    const page2Link = page.locator('.pagination__link', { hasText: '2' });
    await page2Link.click();
    
    await expect(page).toHaveURL(/\/career\/interview\/page\/2\//);
  });

  test('ストーリー: 2ページ目への遷移が正常に機能する', async ({ page }) => {
    await page.goto('/story/');
    
    const pagination = page.locator('.pagination');
    const hasPagination = await pagination.isVisible().catch(() => false);
    
    if (!hasPagination) {
      test.skip();
      return;
    }
    
    const page2Link = page.locator('.pagination__link', { hasText: '2' });
    await page2Link.click();
    
    await expect(page).toHaveURL(/\/story\/page\/2\//);
  });

  test('グローバルネットワーク: 2ページ目への遷移が正常に機能する', async ({ page }) => {
    await page.goto('/global-network/');
    
    const pagination = page.locator('.pagination');
    const hasPagination = await pagination.isVisible().catch(() => false);
    
    if (!hasPagination) {
      test.skip();
      return;
    }
    
    const page2Link = page.locator('.pagination__link', { hasText: '2' });
    await page2Link.click();
    
    await expect(page).toHaveURL(/\/global-network\/page\/2\//);
  });

  test('ニュース詳細: 一覧に戻るリンクが正常に機能する', async ({ page }) => {
    await page.goto('/news/');
    
    // 最初の記事リンクをクリック
    const firstArticle = page.locator('.archive__link').first();
    const isVisible = await firstArticle.isVisible().catch(() => false);
    
    if (!isVisible) {
      test.skip();
      return;
    }
    
    await firstArticle.click();
    
    // 詳細ページに遷移したことを確認
    await page.waitForLoadState('networkidle');
    
    // 戻るボタンが表示されることを確認
    const backButton = page.locator('.single__back-button');
    await expect(backButton).toBeVisible();
    
    // 戻るボタンをクリック
    await backButton.click();
    
    // ニュース一覧に戻ったことを確認
    await expect(page).toHaveURL(/\/news\//);
  });

  test('メディア詳細: 一覧に戻るリンクが正常に機能する', async ({ page }) => {
    await page.goto('/media-page/');
    
    // 最初の記事リンクをクリック
    const firstArticle = page.locator('.archive__link').first();
    const isVisible = await firstArticle.isVisible().catch(() => false);
    
    if (!isVisible) {
      test.skip();
      return;
    }
    
    await firstArticle.click();
    
    // 詳細ページに遷移したことを確認
    await page.waitForLoadState('networkidle');
    
    // 戻るボタンが表示されることを確認
    const backButton = page.locator('.single__back-button');
    await expect(backButton).toBeVisible();
  });
});
