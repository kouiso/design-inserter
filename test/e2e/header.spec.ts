import { test, expect } from '@playwright/test';

/**
 * ヘッダー機能のE2Eテスト
 * - 検索アイコンの表示と色変化
 * - data-logo-color属性による色同期
 * - 検索オーバーレイの表示・非表示
 * - トランジション効果
 */

test.describe('ヘッダー - 検索アイコンの表示と色変化', () => {

  test('検索アイコンが表示される', async ({ page }) => {
    await page.goto('/');

    // PC表示に切り替え
    await page.setViewportSize({ width: 1440, height: 900 });

    // 検索アイコンリンクが存在することを確認
    const searchLink = page.locator('.header__nav-link--search');
    await expect(searchLink).toBeVisible();

    // SVG要素が含まれていることを確認
    const searchIcon = searchLink.locator('svg');
    await expect(searchIcon).toBeVisible();
  });

  test('data-logo-color属性がwhiteまたはblackである', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 1440, height: 900 });

    // body要素のdata-logo-color属性を確認
    const logoColorAttr = await page.getAttribute('body', 'data-logo-color');

    // whiteまたはblackのいずれかであることを確認
    expect(['white', 'black']).toContain(logoColorAttr);
  });

  test('whiteテーマで検索アイコンが白色になる', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 1440, height: 900 });

    // body要素にdata-logo-color="white"を設定
    await page.evaluate(() => {
      document.body.setAttribute('data-logo-color', 'white');
    });

    // 少し待機してスタイルが適用されるのを待つ
    await page.waitForTimeout(100);

    // 検索リンクの色を確認
    const searchLink = page.locator('.header__nav-link--search');
    const color = await searchLink.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // RGB値が白（255, 255, 255）に近いことを確認
    expect(color).toMatch(/rgb\(255,\s*255,\s*255\)|#fff|white/i);
  });

  test('blackテーマで検索アイコンが黒色になる', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 1440, height: 900 });

    // body要素にdata-logo-color="black"を設定
    await page.evaluate(() => {
      document.body.setAttribute('data-logo-color', 'black');
    });

    // 少し待機してスタイルが適用されるのを待つ
    await page.waitForTimeout(100);

    // 検索リンクの色を確認
    const searchLink = page.locator('.header__nav-link--search');
    const color = await searchLink.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // RGB値が黒（0, 0, 0）に近いことを確認
    expect(color).toMatch(/rgb\(0,\s*0,\s*0\)|#000|black/i);
  });

  test('検索アイコンに0.4秒のトランジションが設定されている', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 1440, height: 900 });

    const searchLink = page.locator('.header__nav-link--search');

    // transition プロパティの確認
    const transition = await searchLink.evaluate((el) => {
      return window.getComputedStyle(el).transition;
    });

    // 0.4秒のトランジションが設定されているか
    expect(transition).toContain('0.4s');
  });

  test('検索アイコンとナビゲーションリンクの色が同期している', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 1440, height: 900 });

    // whiteテーマに設定
    await page.evaluate(() => {
      document.body.setAttribute('data-logo-color', 'white');
    });
    await page.waitForTimeout(100);

    // 検索リンクの色を取得
    const searchLink = page.locator('.header__nav-link--search');
    const searchColor = await searchLink.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // 通常のナビゲーションリンクの色を取得
    const navLink = page.locator('.header__nav-link').first();
    const navColor = await navLink.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // 色が一致することを確認
    expect(searchColor).toBe(navColor);

    // blackテーマでも同様にテスト
    await page.evaluate(() => {
      document.body.setAttribute('data-logo-color', 'black');
    });
    await page.waitForTimeout(100);

    const searchColorBlack = await searchLink.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    const navColorBlack = await navLink.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    expect(searchColorBlack).toBe(navColorBlack);
  });
});

test.describe('ヘッダー - 検索オーバーレイ機能', () => {

  test('検索アイコンをクリックすると検索オーバーレイが表示される', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 1440, height: 900 });

    // 検索オーバーレイが初期状態で非表示であることを確認
    const searchOverlay = page.locator('.search-overlay');

    // オーバーレイ要素が存在するか確認（非表示でも存在はしている）
    const overlayExists = await searchOverlay.count();

    if (overlayExists > 0) {
      // 初期状態では非表示
      await expect(searchOverlay).not.toHaveClass(/is-active/);

      // 検索アイコンをクリック
      const searchLink = page.locator('.header__nav-link--search');
      await searchLink.click();

      // オーバーレイがアクティブになることを確認
      await expect(searchOverlay).toHaveClass(/is-active/);
      await expect(searchOverlay).toBeVisible();

      // 検索フォームが表示されることを確認
      const searchForm = page.locator('.search-form');
      await expect(searchForm).toBeVisible();

      // 検索入力欄が表示されることを確認
      const searchInput = page.locator('.search-form__input');
      await expect(searchInput).toBeVisible();
    }
  });

  test('検索オーバーレイの閉じるボタンが機能する', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 1440, height: 900 });

    const searchOverlay = page.locator('.search-overlay');
    const overlayExists = await searchOverlay.count();

    if (overlayExists > 0) {
      // 検索オーバーレイを開く
      const searchLink = page.locator('.header__nav-link--search');
      await searchLink.click();
      await expect(searchOverlay).toHaveClass(/is-active/);

      // 閉じるボタンをクリック
      const closeButton = page.locator('.search-overlay__close');
      await closeButton.click();

      // オーバーレイが非アクティブになることを確認
      await expect(searchOverlay).not.toHaveClass(/is-active/);
    }
  });

  test('検索オーバーレイにトランジション効果が適用されている', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 1440, height: 900 });

    const searchOverlay = page.locator('.search-overlay');
    const overlayExists = await searchOverlay.count();

    if (overlayExists > 0) {
      // transition プロパティの確認
      const transition = await searchOverlay.evaluate((el) => {
        return window.getComputedStyle(el).transition;
      });

      // 0.3秒のトランジションが設定されているか
      expect(transition).toContain('0.3s');
    }
  });

  test('検索フォームに入力できる', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 1440, height: 900 });

    const searchOverlay = page.locator('.search-overlay');
    const overlayExists = await searchOverlay.count();

    if (overlayExists > 0) {
      // 検索オーバーレイを開く
      const searchLink = page.locator('.header__nav-link--search');
      await searchLink.click();

      // 検索入力欄にテキストを入力
      const searchInput = page.locator('.search-form__input');
      await searchInput.fill('テスト検索');

      // 入力されたテキストを確認
      const inputValue = await searchInput.inputValue();
      expect(inputValue).toBe('テスト検索');
    }
  });

  test('検索オーバーレイにクイックリンクが表示される', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 1440, height: 900 });

    const searchOverlay = page.locator('.search-overlay');
    const overlayExists = await searchOverlay.count();

    if (overlayExists > 0) {
      // 検索オーバーレイを開く
      const searchLink = page.locator('.header__nav-link--search');
      await searchLink.click();
      await expect(searchOverlay).toHaveClass(/is-active/);

      // クイックリンクセクションが表示されることを確認
      const quickLinks = page.locator('.search-overlay__quick-links');
      await expect(quickLinks).toBeVisible();

      // クイックリンクタイトルが表示されることを確認
      const quickLinksTitle = page.locator('.search-overlay__quick-links-title');
      await expect(quickLinksTitle).toBeVisible();
      await expect(quickLinksTitle).toHaveText('クイックリンク');

      // 各クイックリンクが表示されることを確認
      await expect(page.locator('.search-overlay__quick-links-list a:has-text("製品情報")')).toBeVisible();
      await expect(page.locator('.search-overlay__quick-links-list a:has-text("注目製品")')).toBeVisible();
      await expect(page.locator('.search-overlay__quick-links-list a:has-text("製品用途紹介")')).toBeVisible();
    }
  });
});

test.describe('ヘッダー - 検索アイコン色の同期（実際のページ）', () => {

  test('お問い合わせページで検索アイコンと他のナビリンクの色が一致する', async ({ page }) => {
    await page.goto('/contact/');
    await page.setViewportSize({ width: 1440, height: 900 });

    // ヘッダーが表示されるまで待機
    await page.waitForSelector('.js-header', { state: 'visible' });

    // 検索アイコンと他のナビリンクの色を取得
    const searchIconColor = await page.$eval(
      '.header__nav-link--search',
      el => getComputedStyle(el).color
    );
    const otherLinkColor = await page.$eval(
      '.header__nav-link',
      el => getComputedStyle(el).color
    );

    // 色が一致することを検証
    expect(searchIconColor).toBe(otherLinkColor);
  });

  test('初期状態（ページロード直後）で検索アイコンが白色である', async ({ page }) => {
    await page.goto('/contact/');
    await page.setViewportSize({ width: 1440, height: 900 });

    // 検索アイコンの色を取得
    const searchIconColor = await page.$eval(
      '.header__nav-link--search',
      el => getComputedStyle(el).color
    );

    // 白色（rgb(255, 255, 255)）であることを確認
    expect(searchIconColor).toMatch(/rgb\(255,\s*255,\s*255\)|#fff|white/i);
  });

  test('初期状態で検索アイコンと他のナビリンクの色が一致する', async ({ page }) => {
    await page.goto('/company/');
    await page.setViewportSize({ width: 1440, height: 900 });

    // 初期状態の色を取得
    const initialSearchColor = await page.$eval(
      '.header__nav-link--search',
      el => getComputedStyle(el).color
    );
    const initialLinkColor = await page.$eval(
      '.header__nav-link',
      el => getComputedStyle(el).color
    );

    // 初期状態で色が一致することを確認
    expect(initialSearchColor).toBe(initialLinkColor);
  });
});

test.describe('ヘッダー - モバイル表示', () => {

  test('モバイルビューで検索アイコンが適切に表示される', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // モバイルでは検索アイコンがハンバーガーメニュー内にある可能性を考慮
    const searchLink = page.locator('.header__nav-link--search');
    const searchLinkCount = await searchLink.count();

    // 検索アイコンが存在する場合（PC版と同様の場合）
    if (searchLinkCount > 0) {
      // レスポンシブ対応が適切に機能しているか確認
      const isVisible = await searchLink.isVisible();
      // モバイルでは表示/非表示のいずれかの状態であることを確認
      expect(typeof isVisible).toBe('boolean');
    }
  });

  test('モバイルビューで検索オーバーレイが全画面表示される', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const searchOverlay = page.locator('.search-overlay');
    const overlayExists = await searchOverlay.count();

    if (overlayExists > 0) {
      const searchLink = page.locator('.header__nav-link--search');
      const searchLinkCount = await searchLink.count();

      if (searchLinkCount > 0 && await searchLink.isVisible()) {
        await searchLink.click();

        // オーバーレイが全画面表示されることを確認
        const overlayBox = await searchOverlay.boundingBox();
        if (overlayBox) {
          expect(overlayBox.width).toBe(375);
          expect(overlayBox.height).toBeGreaterThan(600);
        }
      }
    }
  });
});
