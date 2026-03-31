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
    const linkCount = await careerLinks.count();
    
    // career記事リンクが必ず存在することを確認
    expect(linkCount).toBeGreaterThan(0);
    
    const href = await careerLinks.getAttribute('href');
    // URLが/news配下になっていないことを確認
    expect(href).not.toContain('/news/');
    expect(href).toContain('/career/');
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
      const nextLink = page.locator('a.pagination__link--next, a[rel="next"]').first();
      const linkCount = await nextLink.count();
      
      // ページネーションがあれば動作確認する（データ量によっては1ページのみ）
      
      if (linkCount > 0) {
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
    
    // サイドバーのナビリンク誤マッチを防ぐため、アーカイブ固有のセレクタを使用
    const firstArticle = page.locator('.archive__link').first();
    const articleCount = await firstArticle.count();

    // ニュース記事が必ず存在することを確認
    expect(articleCount).toBeGreaterThan(0);
    
    await firstArticle.click();
    await page.waitForLoadState('networkidle');
    
    // 記事内の画像を確認
    const images = page.locator('.single__contents img, .wp-block-image img');
    const imageCount = await images.count();

    // 記事内に画像がない場合はテスト対象外（テキストのみの記事）
    test.skip(imageCount === 0, '記事内に画像が含まれていないためスキップ');

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
  });

  test('モバイルビューで画像がはみ出さない', async ({ page }) => {
    // モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/news/');
    // サイドバーのナビリンク誤マッチを防ぐため、アーカイブ固有のセレクタを使用
    const firstArticle = page.locator('.archive__link').first();
    const articleCount = await firstArticle.count();

    // ニュース記事が必ず存在することを確認
    expect(articleCount).toBeGreaterThan(0);

    await firstArticle.click();
    await page.waitForLoadState('networkidle');

    const images = page.locator('.single__contents img, .wp-block-image img');
    const imageCount = await images.count();

    // 記事内に画像がない場合はテスト対象外（テキストのみの記事）
    test.skip(imageCount === 0, '記事内に画像が含まれていないためスキップ');

    const img = images.first();
    const boundingBox = await img.boundingBox();
    
    if (boundingBox) {
      // モバイルビューポート(375px)からはみ出していないことを確認
      expect(boundingBox.width).toBeLessThanOrEqual(375);
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
    const formCount = await form.count();
    
    // /contact/にはフォームが必ず存在することを確認
    expect(formCount).toBeGreaterThan(0);
    await expect(form).toBeVisible();
    
    // 必須フィールドの存在確認
    const nameField = page.locator('input[name*="name"], input[type="text"]').first();
    const emailField = page.locator('input[name*="email"], input[type="email"]').first();
    const nameCount = await nameField.count();
    const emailCount = await emailField.count();
    
    // 名前とメールフィールドが必ず存在することを確認
    expect(nameCount).toBeGreaterThan(0);
    expect(emailCount).toBeGreaterThan(0);
    
    await expect(nameField).toBeVisible();
    await expect(emailField).toBeVisible();
  });
});

test.describe('画像ビューワー機能のリグレッションテスト', () => {
  /**
   * Issue #43, PR #44: 画像PopUpのピンチ表示及びマウスズーム機能
   */
  test('画像クリックでビューワーが開く', async ({ page }) => {
    await page.goto('/news/');
    
    // サイドバーのナビリンク誤マッチを防ぐため、アーカイブ固有のセレクタを使用
    const firstArticle = page.locator('.archive__link').first();
    const articleCount = await firstArticle.count();

    // ニュース記事が必ず存在することを確認
    expect(articleCount).toBeGreaterThan(0);

    await firstArticle.click();
    await page.waitForLoadState('networkidle');

    // 記事内の画像を探す
    const contentImage = page.locator('.single__contents img, .wp-block-image img').first();
    const imageCount = await contentImage.count();

    // 記事内に画像がない場合はテスト対象外（テキストのみの記事）
    test.skip(imageCount === 0, '記事内に画像が含まれていないためスキップ');

    // 画像がクリック可能か確認
        const isClickable = await contentImage.evaluate((el) => {
          const parent = el.closest('a');
          const isViewerTarget = el.closest('.is-style-image-viewer') !== null;
          return parent !== null || isViewerTarget || window.getComputedStyle(el).cursor === 'pointer';
        });
        
        // クリッカブルな画像の場合、ビューワー関連の要素が存在することを確認
        if (isClickable) {
          // ページにビューワーライブラリが読み込まれているか確認
          const hasViewer = await page.evaluate(() => {
            return typeof window !== 'undefined' &&
                   (document.querySelector('.is-style-image-viewer') !== null ||
                    document.querySelector('.image-viewer-overlay') !== null);
          });
          
          // ビューワー機能が実装されていることを期待
          expect(hasViewer).toBeTruthy();
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
    const sidebar = page.locator('.navigation').first();
    const sidebarCount = await sidebar.count();
    
    // サイドバーが必ず存在することを確認
    expect(sidebarCount).toBeGreaterThan(0);
    await expect(sidebar).toBeVisible();
    
    // サイドバー内のウィジェットが存在することを確認
    const navItems = sidebar.locator('.navigation__item');
    const navItemCount = await navItems.count();
    expect(navItemCount).toBeGreaterThan(0);
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
    const kvImage = page.locator('.top-kv__pic img').first();
    const imageCount = await kvImage.count();
    
    // KV画像が必ず存在することを確認
    expect(imageCount).toBeGreaterThan(0);
    await expect(kvImage).toBeVisible();
    
    // 画像が正しく読み込まれているか確認
    const naturalWidth = await kvImage.evaluate((img: HTMLImageElement) => img.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
  });

  test('各ページのヘッダー画像が正しく表示される', async ({ page }) => {
    const pages = ['/news/', '/product/'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      // ヘッダーエリアの画像確認
      const headerImage = page.locator('.page__kv-pic img').first();
      const imageCount = await headerImage.count();
      
      // ヘッダー画像が必ず存在することを確認
      expect(imageCount).toBeGreaterThan(0);
      
      const isVisible = await headerImage.isVisible();
      expect(isVisible).toBeTruthy();
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

test.describe('グローバルネットワーク SVGマップのリグレッションテスト', () => {
  test('韓国マーカーのリンク先が韓国武蔵塗料のページであること', async ({ page }) => {
    await page.goto('/wp-content/themes/muashi/assets/img/global-network/world-map.svg');
    const koreaLink = page.locator('a[data-location="korea"]');
    await expect(koreaLink).toBeVisible();
    const href = await koreaLink.getAttribute('href');
    expect(decodeURIComponent(href!)).toContain('韓国武蔵塗料');
  });

  test('埼玉マーカーのリンク先が武蔵塗料ホールディングスのページであること', async ({ page }) => {
    await page.goto('/wp-content/themes/muashi/assets/img/global-network/world-map.svg');
    const saitamaLink = page.locator('a[data-location="saitama"]');
    await expect(saitamaLink).toBeVisible();
    const href = await saitamaLink.getAttribute('href');
    expect(decodeURIComponent(href!)).toContain('武蔵塗料ホールディングス');
  });

  test('韓国マーカーのピンが埼玉マーカーより左（西）にあること', async ({ page }) => {
    await page.goto('/wp-content/themes/muashi/assets/img/global-network/world-map.svg');
    const koreaPin = page.locator('a[data-location="korea"] g[clip-path] path:first-child');
    const saitamaPin = page.locator('a[data-location="saitama"] g[clip-path] path:first-child');

    const koreaBBox = await koreaPin.boundingBox();
    const saitamaBBox = await saitamaPin.boundingBox();

    expect(koreaBBox).not.toBeNull();
    expect(saitamaBBox).not.toBeNull();
    expect(koreaBBox!.x).toBeLessThan(saitamaBBox!.x);
  });

  test('グローバルネットワークページにSVGマップが表示されること', async ({ page }) => {
    await page.goto('/global-network/');
    const mapContainer = page.locator('[data-testid="global-network-map"]');
    await expect(mapContainer).toBeVisible();
    const svgObject = mapContainer.locator('object.global-map__object');
    await expect(svgObject).toBeVisible();
  });
});

test.describe('ハンバーガーメニュー サステナビリティリンクのリグレッションテスト', () => {
  test('サステナビリティ配下のリンクが正しいURLを持つこと', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // ハンバーガーボタンをクリック（固定ポジション要素のためevaluateで実行）
    await page.evaluate(() => {
      const btns = document.querySelectorAll<HTMLElement>('.header__hamburger.js-header-hamburger');
      for (const btn of btns) {
        if (btn.offsetParent !== null && !btn.closest('.hamburger')) {
          btn.click();
          break;
        }
      }
    });
    await page.waitForTimeout(500);

    // 「武蔵塗料グループについて」アコーディオンを開く
    await page.evaluate(() => {
      const btns = document.querySelectorAll<HTMLElement>('.js-accordion-button');
      for (const btn of btns) {
        if (btn.textContent?.includes('武蔵塗料グループについて')) {
          btn.click();
          break;
        }
      }
    });
    await page.waitForTimeout(300);

    // 「サステナビリティ」アコーディオンを開く
    await page.evaluate(() => {
      const btns = document.querySelectorAll<HTMLElement>('.js-accordion-button');
      for (const btn of btns) {
        if (btn.textContent?.trim() === 'サステナビリティ') {
          btn.click();
          break;
        }
      }
    });
    await page.waitForTimeout(300);

    // 各リンクのhrefを検証
    const expectedLinks = [
      { text: '環境', path: '/sustainability/environment/' },
      { text: '社会', path: '/sustainability/society/' },
      { text: 'ガバナンス', path: '/sustainability/governance/' },
      { text: 'SCM', path: '/sustainability/scm/' },
      { text: 'ライブラリー', path: '/sustainability/value-creation-process/' },
    ];

    for (const { text, path } of expectedLinks) {
      const link = page.locator('.hamburger__accordion-link').filter({
        has: page.locator(`.hamburger__accordion-link-text:text("${text}")`),
      }).first();
      const href = await link.getAttribute('href');
      expect(href, `「${text}」のリンク先が ${path} であること`).toContain(path);
    }
  });

  test('サステナビリティ各ページが404にならないこと', async ({ page }) => {
    const paths = [
      '/sustainability/environment/',
      '/sustainability/society/',
      '/sustainability/governance/',
      '/sustainability/scm/',
      '/sustainability/value-creation-process/',
    ];

    for (const path of paths) {
      const response = await page.goto(path);
      expect(response?.status(), `${path} が200を返すこと`).toBe(200);
    }
  });
});
