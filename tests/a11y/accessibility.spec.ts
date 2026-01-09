import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * アクセシビリティテスト
 * 主要ページでaxeを実行し、アクセシビリティ違反を検出
 */

test.describe('Accessibility Tests - アクセシビリティ確認', () => {
  
  test('TOP: アクセシビリティ違反がない', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    // 重大な違反がないことを確認
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('製品情報: アクセシビリティ違反がない', async ({ page }) => {
    await page.goto('/product/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('ニュース: アクセシビリティ違反がない', async ({ page }) => {
    await page.goto('/news/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('お問い合わせ: アクセシビリティ違反がない', async ({ page }) => {
    await page.goto('/contact/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('資料ダウンロード: アクセシビリティ違反がない', async ({ page }) => {
    await page.goto('/download/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('企業情報: アクセシビリティ違反がない', async ({ page }) => {
    await page.goto('/about-us/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('サステナビリティ: アクセシビリティ違反がない', async ({ page }) => {
    await page.goto('/sustainability/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('採用情報: アクセシビリティ違反がない', async ({ page }) => {
    await page.goto('/career/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  // 特定の要素に対する詳細なアクセシビリティチェック
  test.describe('個別要素の確認', () => {
    
    test('見出し構造: 各ページに単一のh1が存在する', async ({ page }) => {
      await page.goto('/news/');
      
      const h1Elements = page.locator('h1');
      const count = await h1Elements.count();
      
      expect(count).toBe(1);
      
      // h1が表示されていることを確認
      await expect(h1Elements).toBeVisible();
    });

    test('画像: 代替テキストが適切に設定されている', async ({ page }) => {
      await page.goto('/news/');
      
      // 画像要素を取得
      const images = page.locator('img');
      const count = await images.count();
      
      if (count > 0) {
        // すべての画像にalt属性があることを確認
        for (let i = 0; i < count; i++) {
          const img = images.nth(i);
          const alt = await img.getAttribute('alt');
          
          // alt属性が存在することを確認（空文字列でも可）
          expect(alt).not.toBeNull();
        }
      }
    });

    test('ページネーション: ARIAラベルが適切に設定されている', async ({ page }) => {
      await page.goto('/news/');
      
      const pagination = page.locator('.pagination');
      const isVisible = await pagination.isVisible().catch(() => false);
      
      if (isVisible) {
        // paginationにrole="navigation"があることを確認
        const nav = pagination.locator('[role="navigation"]');
        await expect(nav).toBeVisible();
        
        // aria-labelが設定されていることを確認
        const ariaLabel = await nav.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
      }
    });

    test('フォーム: ラベルが適切に関連付けられている', async ({ page }) => {
      await page.goto('/contact/');
      
      // フォーム内の入力フィールドを取得
      const inputs = page.locator('input[type="text"], input[type="email"], textarea');
      const count = await inputs.count();
      
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const input = inputs.nth(i);
          
          // id属性を取得
          const id = await input.getAttribute('id');
          
          if (id) {
            // 対応するlabelが存在することを確認
            const label = page.locator(`label[for="${id}"]`);
            const labelExists = await label.count() > 0;
            
            // labelまたはaria-labelがあることを確認
            if (!labelExists) {
              const ariaLabel = await input.getAttribute('aria-label');
              expect(ariaLabel).toBeTruthy();
            }
          }
        }
      }
    });

    test('サイドバーナビゲーション: キーボード操作が可能', async ({ page }) => {
      await page.goto('/product/');
      
      const accordionButtons = page.locator('.navigation__sub-link[role="button"]');
      const count = await accordionButtons.count();
      
      if (count > 0) {
        const firstButton = accordionButtons.first();
        
        // tabindex属性があることを確認
        const tabindex = await firstButton.getAttribute('tabindex');
        expect(tabindex).toBe('0');
        
        // フォーカス可能であることを確認
        await firstButton.focus();
        await expect(firstButton).toBeFocused();
      }
    });
  });
});
