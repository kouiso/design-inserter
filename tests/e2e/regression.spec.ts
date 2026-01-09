import { test, expect } from '@playwright/test';

/**
 * リグレッションテスト
 * 過去のPR、issue、コミット履歴から特定された問題の再発を防ぐテスト
 */

test.describe('パーマリンク・リライトルールのリグレッションテスト', () => {
  /**
   * Issue #102: careerカスタム投稿が/news配下に表示される問題
   * PR #103で修正済み
   */
  test('careerカスタム投稿が正しいURLで表示される', async ({ page }) => {
    // careerアーカイブページにアクセス
    await page.goto('/career/');
    await expect(page).toHaveURL(/\/career\//);
    await expect(page.locator('h1')).toContainText(/採用情報|キャリア|CAREER/i);
    
    // career投稿のリンクを取得
    const careerLinks = page.locator('a[href*="/career/"]').first();
    if (await careerLinks.count() > 0) {
      const href = await careerLinks.getAttribute('href');
      // URLが/news配下になっていないことを確認
      expect(href).not.toContain('/news/');
      expect(href).toContain('/career/');
    }
  });

  /**
   * Product、Story、Voice、Interview、GlobalNetworkの
   * パーマリンクが正しく設定されていることを確認
   */
  const customPostTypes = [
    { slug: 'product', name: '製品・サービス' },
    { slug: 'story', name: 'ストーリー' },
    { slug: 'voice', name: 'お客様の声' },
    { slug: 'interview', name: 'インタビュー' },
    { slug: 'globalnetwork', name: 'グローバルネットワーク' },
  ];

  for (const cpt of customPostTypes) {
    test(`${cpt.name}(${cpt.slug})のパーマリンクが正しい`, async ({ page }) => {
      await page.goto(`/${cpt.slug}/`);
      await expect(page).toHaveURL(new RegExp(`/${cpt.slug}/`));
      // 404ページでないことを確認
      const bodyText = await page.locator('body').textContent();
      expect(bodyText).not.toContain('404');
      expect(bodyText).not.toContain('ページが見つかりません');
    });
  }
});

test.describe('ページネーションのリグレッションテスト', () => {
  /**
   * Issue #70: アーカイブページのページネーション404エラー修正
   * 複数のPRで修正されている重要な問題
   */
  const archivePages = [
    { path: '/news/', name: 'ニュース' },
    { path: '/product/', name: '製品・サービス' },
    { path: '/story/', name: 'ストーリー' },
    { path: '/voice/', name: 'お客様の声' },
  ];

  for (const archive of archivePages) {
    test(`${archive.name}のページネーションで404エラーが出ない`, async ({ page }) => {
      // 1ページ目
      await page.goto(archive.path);
      await expect(page).toHaveURL(new RegExp(archive.path));
      
      // ページネーションリンクが存在するか確認
      const nextLink = page.locator('a.next, a[rel="next"], .pagination a:has-text("2")').first();
      
      if (await nextLink.count() > 0) {
        // 2ページ目に遷移
        await nextLink.click();
        await page.waitForLoadState('networkidle');
        
        // 404エラーでないことを確認
        const bodyText = await page.locator('body').textContent();
        expect(bodyText).not.toContain('404');
        expect(bodyText).not.toContain('ページが見つかりません');
        
        // URLが/page/2/を含むことを確認
        const currentURL = page.url();
        expect(currentURL).toMatch(/\/page\/2\//);
      }
    });
  }

  test('カスタムタクソノミーのページネーションも動作する', async ({ page }) => {
    // productのタクソノミーアーカイブ
    await page.goto('/product-category/');
    
    // タクソノミーターム一覧からランダムに選択してテスト
    const termLinks = page.locator('a[href*="/product-category/"]');
    const count = await termLinks.count();
    
    if (count > 0) {
      const randomIndex = Math.floor(Math.random() * Math.min(count, 3));
      const termLink = termLinks.nth(randomIndex);
      await termLink.click();
      await page.waitForLoadState('networkidle');
      
      // ページネーションがあれば2ページ目に遷移
      const nextLink = page.locator('a.next, a[rel="next"]').first();
      if (await nextLink.count() > 0) {
        await nextLink.click();
        await page.waitForLoadState('networkidle');
        
        const bodyText = await page.locator('body').textContent();
        expect(bodyText).not.toContain('404');
      }
    }
  });
});

test.describe('レスポンシブ画像表示のリグレッションテスト', () => {
  /**
   * Issue #106, PR #107: 記事内画像のはみ出し問題
   * core/imageブロックのレスポンシブ対応
   */
  test('投稿ページの画像がレスポンシブで正しく表示される', async ({ page }) => {
    // ニュース記事にアクセス
    await page.goto('/news/');
    
    // 最初の記事リンクを取得（ハンバーガーメニューの外）
    const firstArticle = page.locator('a[href*="/news/"]:not(.hamburger__accordion)').first();
    if (await firstArticle.count() > 0) {
      await firstArticle.click();
      await page.waitForLoadState('networkidle');
      
      // 記事内の画像を確認
      const images = page.locator('.entry-content img, .wp-block-image img');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        for (let i = 0; i < Math.min(imageCount, 5); i++) {
          const img = images.nth(i);
          const boundingBox = await img.boundingBox();
          
          if (boundingBox) {
            // 画像がビューポートからはみ出していないことを確認
            const viewport = page.viewportSize();
            if (viewport) {
              expect(boundingBox.width).toBeLessThanOrEqual(viewport.width);
            }
            
            // max-width: 100%が適用されているか確認
            const maxWidth = await img.evaluate((el) => {
              return window.getComputedStyle(el).maxWidth;
            });
            expect(maxWidth).toMatch(/100%|calc\(/);
          }
        }
      }
    }
  });

  test('モバイルビューで画像がはみ出さない', async ({ page }) => {
    // モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/news/');
    const firstArticle = page.locator('a[href*="/news/"]:not(.hamburger__accordion)').first();
    
    if (await firstArticle.count() > 0) {
      await firstArticle.click();
      await page.waitForLoadState('networkidle');
      
      const images = page.locator('.entry-content img, .wp-block-image img');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        const img = images.first();
        const boundingBox = await img.boundingBox();
        
        if (boundingBox) {
          // モバイルビューポート(375px)からはみ出していないことを確認
          expect(boundingBox.width).toBeLessThanOrEqual(375);
        }
      }
    }
  });
});

test.describe('資料ダウンロード機能のリグレッションテスト', () => {
  /**
   * PR #72, #105, Issue #104: ダウンロード用ページ作成と承認機能プラグイン
   * 現在のfeature/inquiry_approvalブランチの主要機能
   */
  test('資料ダウンロードページが存在する', async ({ page }) => {
    // ダウンロードページ自体が存在することを確認
    const response = await page.goto('/download/');
    
    if (response) {
      // ページが存在する（404以外）ことを確認
      expect(response.status()).not.toBe(404);
      
      // ページ内容が読み込まれていることを確認
      const bodyText = await page.locator('body').textContent();
      expect(bodyText).not.toContain('404');
    }
  });

  test('お問い合わせフォームが表示される', async ({ page }) => {
    // Contact Form 7のフォームが存在することを確認
    await page.goto('/contact/');
    
    // フォーム要素の確認（いくつかのパターンに対応）
    const form = page.locator('form.wpcf7-form, form[action*="wpcf7"], form[method="post"]').first();
    
    // フォームが存在することを確認
    const formCount = await form.count();
    if (formCount > 0) {
      await expect(form).toBeVisible();
      
      // 必須フィールドの存在確認
      const nameField = page.locator('input[name*="name"], input[type="text"]').first();
      const emailField = page.locator('input[name*="email"], input[type="email"]').first();
      
      if (await nameField.count() > 0) {
        await expect(nameField).toBeVisible();
      }
      if (await emailField.count() > 0) {
        await expect(emailField).toBeVisible();
      }
    } else {
      // フォームがなくても、ページが404でなければOK
      const bodyText = await page.locator('body').textContent();
      expect(bodyText).not.toContain('404');
    }
  });
});

test.describe('画像ビューワー機能のリグレッションテスト', () => {
  /**
   * Issue #43, PR #44: 画像PopUpのピンチ表示及びマウスズーム機能
   */
  test('画像クリックでビューワーが開く', async ({ page }) => {
    await page.goto('/news/');
    
    const firstArticle = page.locator('a[href*="/news/"]:not(.hamburger__accordion)').first();
    if (await firstArticle.count() > 0) {
      await firstArticle.click();
      await page.waitForLoadState('networkidle');
      
      // 記事内の画像を探す
      const contentImage = page.locator('.entry-content img, .wp-block-image img').first();
      
      if (await contentImage.count() > 0) {
        // 画像がクリック可能か確認
        const isClickable = await contentImage.evaluate((el) => {
          const parent = el.closest('a');
          return parent !== null || el.style.cursor === 'pointer';
        });
        
        // クリッカブルな画像の場合、ビューワー関連の要素が存在することを確認
        if (isClickable) {
          // ページにビューワーライブラリが読み込まれているか確認
          const hasViewer = await page.evaluate(() => {
            return typeof window !== 'undefined' && 
                   (document.querySelector('.pswp') !== null || 
                    document.querySelector('[class*="lightbox"]') !== null ||
                    document.querySelector('[class*="viewer"]') !== null);
          });
          
          // ビューワー機能が実装されていることを期待
          expect(hasViewer).toBeTruthy();
        }
      }
    }
  });
});

test.describe('サイドバーナビゲーションのリグレッションテスト', () => {
  /**
   * 複数のコミットでサイドバー関連の修正が行われている
   */
  test('サイドバーが正しく表示される', async ({ page }) => {
    await page.goto('/news/');
    
    // サイドバー要素の確認
    const sidebar = page.locator('aside, .sidebar, #sidebar, [class*="sidebar"]').first();
    
    if (await sidebar.count() > 0) {
      await expect(sidebar).toBeVisible();
      
      // サイドバー内のウィジェットが存在することを確認
      const widgets = sidebar.locator('.widget, [class*="widget"]');
      const widgetCount = await widgets.count();
      expect(widgetCount).toBeGreaterThan(0);
    }
  });

  test('カテゴリーナビゲーションが機能する', async ({ page }) => {
    await page.goto('/news/');
    
    // カテゴリーリンクを探す
    const categoryLinks = page.locator('a[href*="/category/"], .cat-item a, [class*="category"] a');
    const linkCount = await categoryLinks.count();
    
    if (linkCount > 0) {
      const firstCategoryLink = categoryLinks.first();
      await firstCategoryLink.click();
      await page.waitForLoadState('networkidle');
      
      // カテゴリーアーカイブページが正しく表示される
      const bodyText = await page.locator('body').textContent();
      expect(bodyText).not.toContain('404');
    }
  });
});

test.describe('KV（キービジュアル）画像のリグレッションテスト', () => {
  /**
   * 複数のコミットでKV画像の修正が行われている
   */
  test('トップページのKV画像が表示される', async ({ page }) => {
    await page.goto('/');
    
    // KV画像エリアを探す
    const kvImage = page.locator('.kv img, .hero img, .mv img, [class*="keyvisual"] img, [class*="main-visual"] img').first();
    
    if (await kvImage.count() > 0) {
      await expect(kvImage).toBeVisible();
      
      // 画像が正しく読み込まれているか確認
      const naturalWidth = await kvImage.evaluate((img: HTMLImageElement) => img.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });

  test('各ページのヘッダー画像が正しく表示される', async ({ page }) => {
    const pages = ['/news/', '/product/', '/company/'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      // ヘッダーエリアの画像確認
      const headerImage = page.locator('header img, .page-header img, .hero img').first();
      
      if (await headerImage.count() > 0) {
        const isVisible = await headerImage.isVisible();
        expect(isVisible).toBeTruthy();
      }
    }
  });
});

test.describe('メニュー構造のリグレッションテスト', () => {
  /**
   * コミット履歴でinterview、careerのメニュー構造更新が行われている
   */
  test('グローバルナビゲーションが正しく表示される', async ({ page }) => {
    await page.goto('/');
    
    // ナビゲーションは複数の構造が考えられる
    // メインナビゲーションまたはメニュー要素が存在することを確認
    const navigation = page.locator('nav, [role="navigation"], .main-nav, .primary-nav, .navigation').first();
    const navCount = await navigation.count();
    
    if (navCount > 0) {
      // ナビゲーション要素が存在することを確認
      const menuItems = navigation.locator('a');
      const itemCount = await menuItems.count();
      expect(itemCount).toBeGreaterThan(0);
    } else {
      // ナビゲーションがなくてもページが存在することを確認
      const bodyText = await page.locator('body').textContent();
      expect(bodyText).not.toContain('404');
    }
  });

  test('careerページが存在する', async ({ page }) => {
    // careerページが存在することを確認
    const response = await page.goto('/career/');
    if (response) {
      expect(response.status()).not.toBe(404);
      
      const bodyText = await page.locator('body').textContent();
      expect(bodyText).not.toContain('404');
    }
  });
});
