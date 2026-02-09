import { test, expect } from '@playwright/test';

/**
 * 製品情報カスタムフィールドのE2Eテスト
 * Issue #132: 製品一覧に製品詳細情報を表示する
 */

test.describe('製品情報カスタムフィールド', () => {

  test('製品一覧ページで製品情報が表示される', async ({ page }) => {
    await page.goto('/product/');

    // ページが正常に表示される
    await expect(page.locator('.page__title')).toBeVisible();

    // 製品リストが表示される
    const archiveList = page.locator('.archive__list');
    await expect(archiveList).toBeVisible();

    // 製品リストアイテムが存在する
    const productItems = page.locator('[data-testid="product-list-item"]');
    const itemCount = await productItems.count();
    expect(itemCount).toBeGreaterThan(0);

    // 製品情報コンポーネントが表示される
    const productInfo = page.locator('[data-testid="product-info"]').first();
    await expect(productInfo).toBeVisible();

    // 製品情報のリストが表示される
    const productInfoList = productInfo.locator('.product-info__details');
    await expect(productInfoList).toBeVisible();

    // 少なくとも1つのフィールドが表示される（日本語品名は必ず表示）
    const productInfoItems = productInfo.locator('.product-info__item');
    const fieldCount = await productInfoItems.count();
    expect(fieldCount).toBeGreaterThan(0);
  });

  test('製品一覧ページから画像が削除されている', async ({ page }) => {
    await page.goto('/product/');

    // 画像ラッパーが存在しないことを確認
    const imageWrapper = page.locator('.archive__image-wrapper');
    await expect(imageWrapper).toHaveCount(0);

    // archive__image も存在しないことを確認
    const archiveImage = page.locator('.archive__image');
    await expect(archiveImage).toHaveCount(0);
  });

  test('製品情報のラベルと値が正しい構造で表示される', async ({ page }) => {
    await page.goto('/product/');

    // 最初の製品情報を取得
    const productInfo = page.locator('[data-testid="product-info"]').first();
    await expect(productInfo).toBeVisible();

    // 各フィールドにラベルと値が含まれることを確認
    const items = productInfo.locator('.product-info__item');
    const count = await items.count();

    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      const label = item.locator('.product-info__label');
      const value = item.locator('.product-info__value');

      // ラベルが存在し、空でないことを確認
      await expect(label).toBeVisible();
      const labelText = await label.textContent();
      expect(labelText?.trim().length).toBeGreaterThan(0);

      // 値が存在し、空でないことを確認
      await expect(value).toBeVisible();
      const valueText = await value.textContent();
      expect(valueText?.trim().length).toBeGreaterThan(0);
    }
  });

  test('製品一覧の各アイテムがリンクになっている', async ({ page }) => {
    await page.goto('/product/');

    // 製品リストアイテムを取得
    const productItems = page.locator('[data-testid="product-list-item"]');
    const itemCount = await productItems.count();
    expect(itemCount).toBeGreaterThan(0);

    // 各アイテムにリンクが含まれることを確認
    for (let i = 0; i < Math.min(itemCount, 3); i++) {
      const item = productItems.nth(i);
      const link = item.locator('.archive__link');
      await expect(link).toBeVisible();

      // リンクにhref属性があることを確認
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).toContain('/product/');
    }
  });

  test('レスポンシブ: モバイルサイズでも製品情報が表示される', async ({ page }) => {
    // モバイルサイズに設定
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/product/');

    // 製品情報が表示される
    const productInfo = page.locator('[data-testid="product-info"]').first();
    await expect(productInfo).toBeVisible();

    // 製品情報のリストが表示される
    const productInfoList = productInfo.locator('.product-info__details');
    await expect(productInfoList).toBeVisible();
  });
});
