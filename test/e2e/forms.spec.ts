import { test, expect } from '@playwright/test';

/**
 * フォームテスト
 * お問い合わせと資料ダウンロードのバリデーション・成功UIを検証
 * 注: 実際のメール送信は行わず、フロント側の挙動のみ確認
 */

test.describe('Form Tests - フォーム機能確認', () => {
  
  test.describe('お問い合わせフォーム', () => {
    
    test('必須項目未入力でエラーが表示される', async ({ page }) => {
      await page.goto('/contact/');
      
      // フォームが表示されることを確認
      // data-testid="contact-form" は `<section class="contact">` に付与されるため、内側 form を取得
      const form = page.locator('[data-testid="contact-form"] form');
      await expect(form).toBeVisible();
      
      await page.check('input[name="agree"]');

      const submitButton = page.locator('input[type="submit"]');
      await submitButton.click();
      
      // エラーメッセージが表示されることを確認
      await page.waitForTimeout(1000); // CF7のバリデーション待機
      
      const errorMessage = page.locator('.wpcf7-not-valid-tip');
      await expect(errorMessage.first()).toBeVisible();
    });

    test('不正なメール形式でエラーが表示される', async ({ page }) => {
      await page.goto('/contact/');
      
      await page.fill('input[name="your-name"]', 'Test User');
      await page.fill('input[name="your-company"]', 'Musashi Paint QA');
      await page.fill('input[name="your-subject"]', 'Validation test');
      await page.fill('textarea[name="your-message"]', 'Validation test message');

      const emailField = page.locator('input[name="your-email"]').first();
      await emailField.fill('invalid-email');
      await page.check('input[name="agree"]');
      
      // 送信ボタンをクリック
      const submitButton = page.locator('input[type="submit"]');
      await submitButton.click();
      
      await page.waitForTimeout(1000);
      
      // エラーメッセージが表示されることを確認
      const errorMessage = page.locator('.wpcf7-not-valid-tip');
      await expect(errorMessage.first()).toBeVisible();
    });

    test('メール確認欄の不一致でエラーが表示される', async ({ page }) => {
      await page.goto('/contact/');
      
      // メールフィールドに入力
      const emailFields = page.locator('input[name*="email"]');
      const emailCount = await emailFields.count();
      
      if (emailCount >= 2) {
        await emailFields.nth(0).fill('test@example.com');
        await emailFields.nth(1).fill('different@example.com');
        
        // 送信ボタンをクリック
        const submitButton = page.locator('input[type="submit"]');
        await submitButton.click();
        
        await page.waitForTimeout(1000);
        
        // エラーメッセージが表示されることを確認
        const errorMessage = page.locator('.wpcf7-not-valid-tip, .wpcf7-response-output');
        await expect(errorMessage.first()).toBeVisible();
      } else {
        test.skip();
      }
    });
  });

  test.describe('資料ダウンロードフォーム', () => {
    
    test('ページが正常に表示され、製品リストが読み込まれる', async ({ page }) => {
      await page.goto('/document/');
      
      // ダウンロードリストが表示されることを確認
      await expect(page.locator('.download__list')).toBeVisible();
      
      // 製品アイテムが存在することを確認
      const productItems = page.locator('.download__item');
      const count = await productItems.count();
      expect(count).toBeGreaterThan(0);
    });

    test('製品カードから詳細ページとカタログ導線が利用できる', async ({ page }) => {
      await page.goto('/document/');
      
      const firstDetailLink = page.locator('.download__link--detail').first();
      await expect(firstDetailLink).toBeVisible();
      await expect(firstDetailLink).toHaveAttribute('href', /\/product\//);

      const firstCatalogLink = page.locator('.download__link--catalog').first();
      await expect(firstCatalogLink).toBeVisible();
      await expect(firstCatalogLink).toHaveAttribute('href', /\.pdf$/);
    });

    test.skip('選択上限（5件）を超えるとエラーが表示される', async ({ page }) => {
      await page.goto('/document/');
      
      // 6件の製品を選択
      const checkboxes = page.locator('.download__checkbox');
      const count = await checkboxes.count();
      
      if (count >= 6) {
        for (let i = 0; i < 6; i++) {
          await checkboxes.nth(i).check();
          await page.waitForTimeout(100);
        }
        
        // エラーメッセージが表示されることを確認
        const errorMessage = page.locator('.download__error, .wpcf7-not-valid-tip');
        const isVisible = await errorMessage.isVisible().catch(() => false);
        
        // エラーまたは6件目が選択できないことを確認
        if (isVisible) {
          await expect(errorMessage).toBeVisible();
        } else {
          // 6件目が自動的に選択解除される場合
          const sixthCheckbox = checkboxes.nth(5);
          const isChecked = await sixthCheckbox.isChecked();
          expect(isChecked).toBe(false);
        }
      } else {
        test.skip();
      }
    });

    test('未入力のダウンロードフォームは送信できない', async ({ page }) => {
      await page.goto('/download/');

      const submitButton = page.locator('input[type="submit"]').first();
      await expect(submitButton).toBeDisabled();

      await page.fill('input[name="your-name"]', 'Test User');
      await page.fill('input[name="your-company"]', 'Musashi Paint QA');
      await page.fill('input[name="your-email"]', 'test@example.com');
      await page.fill('input[name="your-subject"]', 'Download form test');
      await page.fill('textarea[name="your-message"]', 'Download form validation');

      await expect(submitButton).toBeDisabled();
    });
  });
});
