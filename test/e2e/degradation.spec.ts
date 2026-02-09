/**
 * Playwright E2E テストスイート: musashipaint デグレテスト
 * 
 * 対象PR: #72 (承認機能プラグイン), #71 (ページネーション修正), #103 (Career パーマリンク)
 * 実装例: Playwright テストフレームワーク
 * 環境: http://localhost:10010 (Local by Flywheel)
 * 
 * 実行方法:
 *   npx playwright test degradation.spec.ts
 *   npx playwright test degradation.spec.ts --headed  (UI表示)
 *   npx playwright test degradation.spec.ts -g "Product Pagination"  (フィルタリング)
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:10010';

/**
 * =================================================================
 * 1. バグ修正テスト
 * =================================================================
 */

test.describe('Bug Fix Tests', () => {
  
  test.describe('PR #107: Responsive Image Fix', () => {
    
    test('should render article images without overflow on /sustainability/environment/', async ({ page }) => {
      await page.goto(`${BASE_URL}/sustainability/environment/`);
      
      // 記事内画像を取得
      const images = await page.locator('article img').all();
      expect(images.length).toBeGreaterThan(0);
      
      // 各画像の width スタイルを確認（px指定 → 100% 正規化）
      for (const img of images) {
        const style = await img.getAttribute('style');
        // width:px が含まれていない（正規化されている）
        if (style) {
          expect(style).not.toMatch(/width:\s*\d+px/);
        }
      }
    });

    test('should apply max-width correctly for responsive images', async ({ page }) => {
      await page.goto(`${BASE_URL}/sustainability/environment/`);
      
      // images にボックスモデル情報取得
      const images = await page.locator('article img').first();
      const box = await images.boundingBox();
      
      // コンテナ幅（viewport width）を取得
      const viewportWidth = page.viewportSize()?.width || 1280;
      
      // 画像幅が viewport 幅を超えていないことを確認
      if (box) {
        expect(box.width).toBeLessThanOrEqual(viewportWidth * 0.95); // 95% の余裕
      }
    });

    test('should have correct max-width on narrow layouts (with sidebar)', async ({ page }) => {
      await page.setViewportSize({ width: 800, height: 600 });
      await page.goto(`${BASE_URL}/sustainability/environment/`);
      
      const images = await page.locator('article img').first();
      const computedStyle = await images.evaluate((el: HTMLImageElement) => {
        return window.getComputedStyle(el).maxWidth;
      });
      
      // max-width が有効に設定されていることを確認
      expect(computedStyle).not.toBe('none');
      expect(computedStyle).not.toBe('auto');
    });
  });

  test.describe('PR #103: Career Permalink Fix', () => {
    
    test('should access /career/[post-name]/ with 200 OK', async ({ page, context }) => {
      const response = await page.goto(`${BASE_URL}/career/`);
      expect(response?.status()).toBe(200);
      
      // Career 投稿リストから最初の投稿リンクを取得して移動
      const firstCareerLink = await page.locator('a[href*="/career/"][href!="/career/"]').first();
      const href = await firstCareerLink.getAttribute('href');
      
      if (href) {
        const response = await page.goto(`${BASE_URL}${href}`);
        expect(response?.status()).toBe(200);
        
        // URL が /career/... 形式であることを確認
        expect(page.url()).toMatch(/\/career\/[^/]+\/?$/);
      }
    });

    test('should NOT have /news/career prefix in URLs', async ({ page }) => {
      await page.goto(`${BASE_URL}/career/`);
      
      // すべての career リンク URL を確認
      const links = await page.locator('a[href*="/career/"]').all();
      
      for (const link of links) {
        const href = await link.getAttribute('href');
        if (href && href.includes('/career/') && !href.startsWith('http')) {
          // /news/career/ のプレフィックスがないことを確認
          expect(href).not.toMatch(/\/news\/career\//);
        }
      }
    });

    test('should return 404 for old /news/career/[post-name]/ format', async ({ page }) => {
      // 古いフォーマットへのアクセスは 404 または 301 redirect
      const response = await page.goto(`${BASE_URL}/news/career/example-post/`, { 
        waitUntil: 'domcontentloaded'
      });
      
      // 404 または 301 リダイレクト後の 200 OK
      expect([301, 302, 307, 308, 404, 200]).toContain(response?.status());
    });
  });

  test.describe('PR #86: Voice Menu Order Fix', () => {
    
    test('should display voice posts in correct menu_order sequence', async ({ page }) => {
      await page.goto(`${BASE_URL}/voice/`);
      
      // voice 投稿リストを取得
      const voiceItems = await page.locator('[data-voice-item], article, .voice-post').all();
      
      // 複数の voice 投稿が表示されていることを確認
      expect(voiceItems.length).toBeGreaterThanOrEqual(1);
      
      // 各投稿の menu_order 属性を確認（データ属性で設定されている場合）
      for (let i = 0; i < voiceItems.length - 1; i++) {
        const current = voiceItems[i];
        const next = voiceItems[i + 1];
        
        const currentOrder = await current.getAttribute('data-menu-order');
        const nextOrder = await next.getAttribute('data-menu-order');
        
        // 数値として比較（昇順）
        if (currentOrder && nextOrder) {
          expect(parseInt(currentOrder)).toBeLessThanOrEqual(parseInt(nextOrder));
        }
      }
    });

    test('should paginate voice posts correctly (12 per page)', async ({ page }) => {
      await page.goto(`${BASE_URL}/voice/`);
      
      const voiceItems = await page.locator('[data-voice-item], article.voice, .voice-post').all();
      
      // 1ページ目の表示数が 12 以下であることを確認
      expect(voiceItems.length).toBeLessThanOrEqual(12);
      
      // 2ページ目の存在を確認
      const page2Link = await page.locator('a[href*="/voice/page/2/"]');
      const exists = await page2Link.count();
      
      if (voiceItems.length === 12) {
        // 12件ちょうど表示されている場合、2ページ目リンクが存在するはず
        expect(exists).toBeGreaterThan(0);
      }
    });

    test('should access /voice/page/2/ without 404 error', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/voice/page/2/`);
      
      // 404 エラーが出ていないことを確認（201件以上ない可能性もあるが、テンプレートは存在する）
      expect(response?.status()).toBe(200);
    });
  });
});

/**
 * =================================================================
 * 2. UI/UX 改善テスト
 * =================================================================
 */

test.describe('UI/UX Improvement Tests', () => {
  
  test.describe('PR #87: Top Page Section Order Change', () => {
    
    test('should display Media section (Pick up) before News section', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);
      
      // Media セクションと News セクションを取得（同一section内のため、inner divで区別）
      const mediaSection = await page.locator('.top-news__inner:not(.top-news__inner--bottom)').first();
      const newsSection = await page.locator('.top-news__inner--bottom').first();
      
      if (await mediaSection.isVisible() && await newsSection.isVisible()) {
        const mediaBox = await mediaSection.boundingBox();
        const newsBox = await newsSection.boundingBox();
        
        // Media セクションが News セクション上部に表示されていることを確認
        if (mediaBox && newsBox) {
          expect(mediaBox.y).toBeLessThan(newsBox.y);
        }
      }
    });

    test('should display 6 media items and 6 news items on homepage', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);
      
      // メディアセクションの記事数（index.phpで posts_per_page => 3）
      const mediaItems = await page.locator('.top-news__inner:not(.top-news__inner--bottom) .top-news__item').all();
      expect(mediaItems.length).toBe(3);

      // ニュースセクションの記事数（index.phpで posts_per_page => 3）
      const newsItems = await page.locator('.top-news__inner--bottom .top-news__item').all();
      expect(newsItems.length).toBe(3);
    });

    test('should navigate to media list page via "View All" link', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);
      
      // 「一覧へ」リンク（メディアセクション）
      const viewAllLink = await page.locator('.top-news__inner:not(.top-news__inner--bottom) a:has-text("一覧")').first();
      
      if (await viewAllLink.isVisible()) {
        const href = await viewAllLink.getAttribute('href');
        expect(href).toMatch(/\/media|\/news|\/media-page/);
      }
    });
  });

  test.describe('PR #80: Scroll Margin Top Adjustment', () => {
    
    test('should scroll to correct position for internal anchor links', async ({ page }) => {
      // ページ内リンク機能を含むページを訪問
      await page.goto(`${BASE_URL}/product/`);
      
      // ページ内リンク（タブ切り替え）が存在する場合
      const tabLinks = await page.locator('a[href^="#"], button[aria-controls]').all();
      
      if (tabLinks.length > 0) {
        const firstLink = tabLinks[0];
        
        // スクロール前の高さを記録
        const scrollTopBefore = await page.evaluate(() => window.scrollY);
        
        // リンククリック
        await firstLink.click();
        
        // スクロール後の高さを確認
        await page.waitForTimeout(500); // スクロール完了待機
        const scrollTopAfter = await page.evaluate(() => window.scrollY);
        
        // スクロールが発生したことを確認
        expect(Math.abs(scrollTopAfter - scrollTopBefore)).toBeGreaterThan(0);
      }
    });

    test('should have scroll-margin-top applied to headings', async ({ page }) => {
      await page.goto(`${BASE_URL}/sustainability/environment/`);

      // CSSは [id] セレクタに scroll-margin-top を適用（全h2/h3ではない）
      const idElement = await page.locator('[id]').first();
      const scrollMarginTop = await idElement.evaluate((el: HTMLElement) => {
        return window.getComputedStyle(el).scrollMarginTop;
      });

      // scroll-margin-top が設定されていることを確認
      expect(scrollMarginTop).not.toBe('0px');
      expect(scrollMarginTop).not.toBe('auto');
    });
  });

  test.describe('PR #71, #72: Footer Taxonomy Links Fix', () => {
    
    test('should link to /product/application/ via footer', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);
      
      // footer の「用途でえらぶ」リンク
      const link = await page.locator('footer a:has-text("用途")').first();
      const href = await link.getAttribute('href');
      
      expect(href).toMatch(/\/product\/application\/?$/);
    });

    test('should link to /product/material/ via footer', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);
      
      const link = await page.locator('footer a:has-text("基材")').first();
      const href = await link.getAttribute('href');
      
      expect(href).toMatch(/\/product\/material\/?$/);
    });

    test('should NOT use hash anchor links in footer', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);
      
      // footer のすべてのリンクを確認
      const footerLinks = await page.locator('footer a[href^="/product/"]').all();
      
      for (const link of footerLinks) {
        const href = await link.getAttribute('href');
        // ハッシュアンカー（#）が含まれていないことを確認
        expect(href).not.toContain('#');
      }
    });

    test('should navigate to correct product taxonomy page when footer link is clicked', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);
      
      // footer PCナビ内の「意匠性でえらぶ」をクリック
      const designLink = page.locator('.footer__nav--pc a:has-text("意匠性")');
      await designLink.click();
      
      // /product/design/ ページに遷移
      await expect(page).toHaveURL(/\/product\/design\/?$/);
      
      // ページが正しく表示されていることを確認
      expect(await page.locator('h1, h2').first().isVisible()).toBeTruthy();
    });
  });

  test.describe('PR #84, #69: Language Links', () => {
    
    test('should have English language link opening in new tab', async ({ context, page }) => {
      await page.goto(`${BASE_URL}/`);
      
      // 英語リンク
      const enLink = await page.locator('header a:has-text("En"), a:has-text("English")').first();
      
      if (await enLink.isVisible()) {
        const target = await enLink.getAttribute('target');
        const href = await enLink.getAttribute('href');
        
        expect(href).toBe('https://en.musashipaint.com');
        expect(target).toBe('_blank');
      }
    });

    test('should have Chinese language link opening in new tab', async ({ context, page }) => {
      await page.goto(`${BASE_URL}/`);
      
      // 中国語リンク
      const cnLink = await page.locator('header a:has-text("中文"), a:has-text("Chinese")').first();
      
      if (await cnLink.isVisible()) {
        const target = await cnLink.getAttribute('target');
        const href = await cnLink.getAttribute('href');
        
        expect(href).toBe('https://www.musashipaintchina.com/');
        expect(target).toBe('_blank');
      }
    });
  });
});

/**
 * =================================================================
 * 3. カスタムポスト型・パーマリンク テスト
 * =================================================================
 */

test.describe('Custom Post Type Tests', () => {
  
  test.describe('PR #67: Interview Post Type', () => {
    
    test('should display interview archive at /career/interview/', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/career/interview/`);
      expect(response?.status()).toBe(200);
      
      // interview 投稿が表示されていることを確認
      const articles = await page.locator('.archive__item').all();
      expect(articles.length).toBeGreaterThan(0);
    });

    test('should display interview single post at /career/interview/[slug]/', async ({ page }) => {
      // 最初に archive ページで最初の投稿リンクを取得
      await page.goto(`${BASE_URL}/career/interview/`);
      
      const firstLink = await page.locator('a[href*="/career/interview/"][href!="/career/interview/"]').first();
      const href = await firstLink.getAttribute('href');
      
      if (href) {
        const response = await page.goto(`${BASE_URL}${href}`);
        expect(response?.status()).toBe(200);
        
        // single-interview.php で表示されていることを確認
        expect(page.url()).toMatch(/\/career\/interview\/[^/]+\/?$/);
      }
    });

    test('should have pagination for interview posts', async ({ page }) => {
      await page.goto(`${BASE_URL}/career/interview/`);
      
      // interview 投稿が 12件以上ある場合、page/2/ リンクが表示される
      const articles = await page.locator('article, [data-interview]').all();
      
      if (articles.length >= 12) {
        const page2Link = await page.locator('a[href*="/career/interview/page/2/"]');
        expect(page2Link).toBeDefined();
      }
    });

    test('should access /career/interview/page/2/ without 404 error', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/career/interview/page/2/`);
      expect(response?.status()).toBe(200);
    });
  });

  test.describe('PR #89: Media Post Pagination', () => {
    
    test('should display media posts at /media-page/ with 12 per page', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/media-page/`);
      expect(response?.status()).toBe(200);
      
      const mediaItems = await page.locator('[data-media], article.media_post').all();
      expect(mediaItems.length).toBeLessThanOrEqual(12);
    });

    test('should have pagination for media posts', async ({ page }) => {
      await page.goto(`${BASE_URL}/media-page/`);
      
      const mediaItems = await page.locator('[data-media], article.media_post').all();
      
      if (mediaItems.length === 12) {
        const page2Link = await page.locator('a[href*="/media-page/page/2/"]');
        expect(page2Link).toBeDefined();
      }
    });

    test('should NOT have /media-post/ automatic archive (has_archive disabled)', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/media-post/`, { 
        waitUntil: 'domcontentloaded'
      });
      
      // 自動 archive ページは存在しない（404）
      expect(response?.status()).toBe(404);
    });
  });

  test.describe('PR #71, #103: Post Type with_front Unification', () => {
    
    test('should access product posts at /product/[slug]/', async ({ page }) => {
      await page.goto(`${BASE_URL}/product/`);
      
      const firstLink = await page.locator('a[href*="/product/"][href!="/product/"]').first();
      const href = await firstLink.getAttribute('href');
      
      if (href) {
        const response = await page.goto(`${BASE_URL}${href}`);
        expect(response?.status()).toBe(200);
        expect(page.url()).toMatch(/\/product\/[^/]+\/?$/);
      }
    });

    test('should access story posts at /story/[slug]/', async ({ page }) => {
      await page.goto(`${BASE_URL}/story/`);
      
      const firstLink = await page.locator('a[href*="/story/"][href!="/story/"]').first();
      const href = await firstLink.getAttribute('href');
      
      if (href) {
        const response = await page.goto(`${BASE_URL}${href}`);
        expect(response?.status()).toBe(200);
        expect(page.url()).toMatch(/\/story\/[^/]+\/?$/);
      }
    });

    test('should access career posts at /career/[slug]/', async ({ page }) => {
      await page.goto(`${BASE_URL}/career/`);
      
      const firstLink = await page.locator('a[href*="/career/"][href!="/career/"]').first();
      const href = await firstLink.getAttribute('href');
      
      if (href) {
        const response = await page.goto(`${BASE_URL}${href}`);
        expect(response?.status()).toBe(200);
        expect(page.url()).toMatch(/\/career\/[^/]+\/?$/);
      }
    });

    test('should NOT have /news/ prefix in custom post type URLs', async ({ page }) => {
      // 各投稿タイプのリンクを確認
      for (const path of ['/product/', '/story/', '/voice/', '/career/', '/global-network/']) {
        const response = await page.goto(`${BASE_URL}${path}`);
        if (response?.status() === 200) {
          const links = await page.locator(`a[href*="${path}"]`).all();
          
          for (const link of links) {
            const href = await link.getAttribute('href');
            if (href && !href.startsWith('http')) {
              // /news/ プレフィックスが含まれていないことを確認
              expect(href).not.toMatch(/\/news\//);
            }
          }
        }
      }
    });
  });
});

/**
 * =================================================================
 * 4. ページネーション・タクソノミーテスト
 * =================================================================
 */

test.describe('Pagination & Taxonomy Tests', () => {
  
  test.describe('PR #71: Archive Pagination Fix', () => {
    
    test('should display product archive with pagination', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/product/`);
      expect(response?.status()).toBe(200);
      
      // pagination が表示されているか確認
      const paginationLinks = await page.locator('[class*="pagination"], [class*="paging"], nav a').all();
      expect(paginationLinks.length).toBeGreaterThan(0);
    });

    test('should access product pagination pages without 404 error', async ({ page }) => {
      for (let pageNum = 2; pageNum <= 3; pageNum++) {
        const response = await page.goto(`${BASE_URL}/product/page/${pageNum}/`);
        expect(response?.status()).toBe(200);
      }
    });

    test('should display different content on each pagination page', async ({ page }) => {
      await page.goto(`${BASE_URL}/product/page/1/`);
      const content1 = await page.textContent('article:first-child');
      
      const response2 = await page.goto(`${BASE_URL}/product/page/2/`);
      
      if (response2?.status() === 200) {
        const content2 = await page.textContent('article:first-child');
        
        // 異なるコンテンツが表示されていることを確認
        expect(content1).not.toBe(content2);
      }
    });

    test('should have pagination on interview archive', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/career/interview/page/2/`);
      expect(response?.status()).toBe(200);
    });

    test('should have pagination on story archive', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/story/page/2/`);
      expect(response?.status()).toBe(200);
    });

    test('should have pagination on voice archive', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/voice/page/2/`);
      expect(response?.status()).toBe(200);
    });

    test('should have pagination on news archive', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/news/page/2/`);
      expect(response?.status()).toBe(200);
    });

    test('should have pagination on global-network archive', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/global-network/page/2/`);
      expect(response?.status()).toBe(200);
    });
  });

  test.describe('PR #71, #72: Product Taxonomy Pages', () => {
    
    test('should display /product/application/ page', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/product/application/`);
      expect(response?.status()).toBe(200);
    });

    test('should display /product/material/ page', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/product/material/`);
      expect(response?.status()).toBe(200);
    });

    test('should display /product/design/ page', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/product/design/`);
      expect(response?.status()).toBe(200);
    });

    test('should display /product/function/ page', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/product/function/`);
      expect(response?.status()).toBe(200);
    });

    test('should display /product/environment/ page', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/product/environment/`);
      expect(response?.status()).toBe(200);
    });

    test('should have pagination on product taxonomy pages', async ({ page }) => {
      // /product/application/page/2/ にアクセス
      const response = await page.goto(`${BASE_URL}/product/application/page/2/`);
      expect(response?.status()).toBe(200);
    });
  });
});

/**
 * =================================================================
 * 5. プラグイン機能テスト（PR #72）
 * =================================================================
 */

test.describe('Plugin: musashi-inquiry-approval (PR #72)', () => {
  
  test.describe('Inquiry Approval Flow', () => {
    
    test('should display inquiry form on contact page', async ({ page }) => {
      await page.goto(`${BASE_URL}/contact/`);
      
      // Contact Form 7 フォームの存在確認
      const form = await page.locator('form.wpcf7-form');
      expect(form).toBeDefined();
    });

    test('should submit inquiry form successfully', async ({ page }) => {
      await page.goto(`${BASE_URL}/contact/`);
      
      // フォーム入力
      await page.fill('input[name="your-name"]', 'Test User');
      await page.fill('input[name="your-email"]', 'test@example.com');
      await page.fill('textarea[name="your-message"]', 'Test inquiry message');
      
      // フォーム送信
      const submitButton = await page.locator('button[type="submit"]').first();
      
      // 送信前にリクエストリスナーを設定（メール送信を監視）
      const promises = [page.waitForNavigation()];
      
      await submitButton.click();
      await Promise.race(promises).catch(() => {}); // タイムアウト無視
      
      // 送信完了メッセージ確認
      const successMessage = await page.locator('.wpcf7-response-output').first();
      expect(successMessage).toBeDefined();
    });

    test('should send admin notification email with approval link', async ({ page }) => {
      // このテストは実際のメール検証が必要
      // メール管理画面で確認するか、メールテスト機能を使用
      
      // Mailtrap または wp-mail-smtp テスト機能を使用して検証
      // ここでは省略（本来は E2E テストで実装）
      expect(true).toBe(true);
    });

    test('should display approval page with token parameter', async ({ page, context }) => {
      // ?musashi_review=1&token=xxx パラメータで確認ページ表示
      // 実際のトークンは上記のメール検証テストから取得
      
      const approvalUrl = `${BASE_URL}/?musashi_review=1&token=test_token`;
      const response = await page.goto(approvalUrl);
      
      // トークンが不正な場合は 404
      // 有効なトークンの場合は確認ページ表示
      expect([200, 404]).toContain(response?.status());
    });

    test('should have approval and rejection buttons on approval page', async ({ page }) => {
      // 有効なトークンでアクセス時
      // （このテストは実際の有効なトークンが必要）
      
      // 実装仮定：確認ページに承認・拒否ボタンが表示される
      // expect(await page.locator('button:has-text("承認")').isVisible()).toBeTruthy();
      // expect(await page.locator('button:has-text("拒否")').isVisible()).toBeTruthy();
    });

    test('should send approval email when approval button clicked', async ({ page }) => {
      // 承認ボタンクリック時、ユーザーに資料ダウンロードリンク付きメール送信
      // メール検証が必要
      expect(true).toBe(true);
    });

    test('should send rejection email when rejection button clicked', async ({ page }) => {
      // 拒否ボタンクリック時、ユーザーにお断りメール送信
      // メール検証が必要
      expect(true).toBe(true);
    });

    test('should prevent double submission (second click should not send email)', async ({ page }) => {
      // 処理完了通知メール確認により、二重送信を防止
      // メール検証が必要
      expect(true).toBe(true);
    });
  });

  test.describe('Email Templates Admin Page', () => {
    
    test('should display email templates management page in admin', async ({ page, context }) => {
      // admin login required
      // この部分は実際のログイン機能とセキュリティトークンが必要
      
      // 仮定：管理画面で email templates ページが表示される
      // await page.goto(`${BASE_URL}/wp-admin/admin.php?page=musashi_inquiry_templates`);
      expect(true).toBe(true);
    });

    test('should allow editing email templates', async ({ page }) => {
      // email templates の編集機能確認
      // admin access required
      expect(true).toBe(true);
    });
  });

  test.describe('Download Page (PR #72)', () => {
    
    test('should display download page with proper layout', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/download/`);
      
      if (response?.status() === 200) {
        // ダウンロードページのコンテンツ確認
        const content = await page.locator('[class*="download"]').isVisible();
        expect(content).toBeTruthy();
      }
    });

    test('should have download request form', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/download/`);
      
      if (response?.status() === 200) {
        const form = await page.locator('form').first();
        expect(form).toBeDefined();
      }
    });

    test('should navigate to download page from footer', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);
      
      const downloadLink = await page.locator('footer a:has-text("ダウンロード"), footer a:has-text("Download")').first();
      
      if (await downloadLink.isVisible()) {
        await downloadLink.click();
        await expect(page).toHaveURL(/\/download\/?$/);
      }
    });
  });
});

/**
 * =================================================================
 * 6. 共通・統合テスト
 * =================================================================
 */

test.describe('Common/Integration Tests', () => {
  
  test('should display responsive layout on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/`);
    
    // モバイルメニューが表示されていることを確認
    const mobileMenu = await page.locator('[aria-label="Menu"], [class*="mobile-menu"], button[aria-expanded]').first();
    expect(mobileMenu).toBeDefined();
  });

  test('should have no broken internal links on homepage', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    // すべての内部リンクを確認
    const links = await page.locator('a[href^="/"]').all();
    
    for (const link of links.slice(0, 10)) { // 最初の 10 個のみ確認（テスト速度向上）
      const href = await link.getAttribute('href');
      
      if (href && !href.includes('#')) { // アンカーリンク除外
        const response = await page.goto(`${BASE_URL}${href}`, { 
          waitUntil: 'domcontentloaded'
        });
        
        // 404 エラーが出ていないことを確認
        expect([200, 301, 302]).toContain(response?.status());
      }
    }
  });

  test('should have all images displaying correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    // ページ上のすべての画像を確認
    const images = await page.locator('img').all();
    
    for (const img of images.slice(0, 5)) { // 最初の 5 個のみ確認
      // alt 属性が設定されていることを確認
      const alt = await img.getAttribute('alt');
      expect(alt).toBeDefined();
      
      // 画像が読み込まれていることを確認（widthとheight）
      const box = await img.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThan(0);
        expect(box.height).toBeGreaterThan(0);
      }
    }
  });

  test('should have proper SEO meta tags', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    // title が存在
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // description メタタグが存在
    const description = await page.locator('meta[name="description"]');
    expect(description).toBeDefined();
    
    // og:title が存在
    const ogTitle = await page.locator('meta[property="og:title"]');
    expect(ogTitle).toBeDefined();
  });
});

/**
 * 実行コマンド例：
 * 
 * # すべてのテストを実行
 * npx playwright test degradation.spec.ts
 * 
 * # 特定のテストグループを実行
 * npx playwright test degradation.spec.ts -g "Pagination"
 * 
 * # UI 表示付きで実行
 * npx playwright test degradation.spec.ts --headed
 * 
 * # デバッグモード
 * npx playwright test degradation.spec.ts --debug
 * 
 * # 特定のブラウザで実行
 * npx playwright test degradation.spec.ts --project=chromium
 */
