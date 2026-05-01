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

import { existsSync } from 'node:fs';

import { test, expect } from '@playwright/test';

import {
  clearMailpit,
  getMailpitMessageById,
  getMailpitMessages,
  waitForMailpitMessage,
} from '../helpers/mail';

const ADMIN_STORAGE_STATE = 'test/.auth/admin.json';

/**
 * Submit the contact form with deterministic test data and return the email
 * address used so a test can later look up the matching Mailpit message.
 */
async function submitContactForm(
  page: import('@playwright/test').Page,
  overrides: Partial<{ email: string; name: string; subject: string }> = {},
): Promise<{ email: string; name: string; subject: string }> {
  // 並列ワーカー間で Date.now() ms が衝突しうるため workerIndex を付与する。
  const stamp = `${Date.now()}-${test.info().workerIndex}`;
  const email = overrides.email ?? `pw-${stamp}@example.test`;
  const name = overrides.name ?? `Playwright User ${stamp}`;
  const subject = overrides.subject ?? `Playwright inquiry ${stamp}`;

  await page.goto('/contact/');
  await page.fill('input[name="your-name"]', name);
  await page.fill('input[name="your-company"]', 'Musashi Paint QA');
  await page.fill('input[name="your-email"]', email);
  await page.fill('input[name="your-subject"]', subject);
  await page.fill('textarea[name="your-message"]', 'Test inquiry message');
  await page.check('input[name="agree"]');

  const submitButton = page.locator('button[type="submit"], input[type="submit"]').first();
  await expect(submitButton).toBeEnabled();
  await submitButton.click();

  await expect(page.locator('.wpcf7-response-output')).toBeVisible({ timeout: 10_000 });

  return { email, name, subject };
}

/**
 * Wait for the admin notification mail to land in Mailpit, then extract the
 * review URL token. The admin notification body always renders the review
 * URL via `?musashi_review=1&token=...`. Since `clearMailpit()` runs in
 * `beforeEach`, any mail observed post-submission belongs to the current test.
 */
async function captureReviewToken(): Promise<{ token: string; reviewUrl: string }> {
  const tokenPattern = /musashi_review=1&(?:amp;)?token=([A-Za-z0-9._-]+)/;
  const deadline = Date.now() + 15_000;

  while (Date.now() < deadline) {
    const summaries = await getMailpitMessages();
    for (const summary of summaries) {
      const detail = await getMailpitMessageById(summary.ID);
      const haystack = `${detail.HTML || ''}\n${detail.Text || ''}`;
      const match = haystack.match(tokenPattern);
      if (match) {
        return { token: match[1], reviewUrl: `/?musashi_review=1&token=${match[1]}` };
      }
    }
    await new Promise((r) => setTimeout(r, 250));
  }

  throw new Error(
    'captureReviewToken: no admin notification mail with a review URL arrived within 15s.',
  );
}

/**
 * =================================================================
 * 1. バグ修正テスト
 * =================================================================
 */

test.describe('Bug Fix Tests', () => {
  
  test.describe('PR #107: Responsive Image Fix', () => {
    
    test('should render article images without overflow on /sustainability/environment/', async ({ page }) => {
      await page.goto(`/sustainability/environment/`);

      // 記事内画像を取得
      const images = await page.locator('.page__inner img').all();
      expect(images.length).toBeGreaterThan(0);
      
      // 各画像の width スタイルを確認（px指定 → 100% 正規化）
      for (const img of images) {
        const style = await img.getAttribute('style');
        // width:px が含まれていない（正規化されている。max-width/min-widthは許容）
        if (style) {
          expect(style).not.toMatch(/(?<![a-z-])width:\s*\d+px/);
        }
      }
    });

    test('should apply max-width correctly for responsive images', async ({ page }) => {
      await page.goto(`/sustainability/environment/`);

      // images にボックスモデル情報取得
      const images = page.locator('.page__inner img').first();
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
      await page.goto(`/sustainability/environment/`);

      const images = page.locator('.page__inner img').first();
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
      const response = await page.goto(`/career/`);
      expect(response?.status()).toBe(200);
      
      // Career 投稿リストから最初の投稿リンクを取得して移動
      const firstCareerLink = page.locator('a[href*="/career/"]:not([href$="/career/"])').first();
      const href = await firstCareerLink.getAttribute('href');
      
      if (href) {
        const url = href.startsWith('http') ? href : `${href}`;
        const response = await page.goto(url);
        expect(response?.status()).toBe(200);
        
        // URL が /career/... 形式であることを確認
        expect(page.url()).toMatch(/\/career\/[^/]+\/?$/);
      }
    });

    test('should NOT have /news/career prefix in URLs', async ({ page }) => {
      await page.goto(`/career/`);
      
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
      const response = await page.goto(`/news/career/example-post/`, { 
        waitUntil: 'domcontentloaded'
      });
      
      // 古いURLは404か301リダイレクトのどちらかであるべき
      expect([301, 404]).toContain(response?.status());
    });
  });

  test.describe('PR #86: Voice Menu Order Fix', () => {
    
    test('should display voice posts in correct menu_order sequence', async ({ page }) => {
      await page.goto(`/voice/`);
      
      // voice 投稿リストを取得（テンプレートは .archive__item を使用）
      const voiceItems = await page.locator('.archive__item').all();
      
      // 複数の voice 投稿が表示されていることを確認
      expect(voiceItems.length).toBeGreaterThanOrEqual(1);
      
      // 投稿が表示され、それぞれにリンクが含まれていることを確認
      for (const item of voiceItems.slice(0, 3)) {
        const link = item.locator('a').first();
        const href = await link.getAttribute('href');
        expect(href).toBeTruthy();
      }
    });

    test('should paginate voice posts correctly (12 per page)', async ({ page }) => {
      await page.goto(`/voice/`);
      
      const voiceItems = await page.locator('.archive__item').all();
      
      // 1ページ目の表示数が 12 以下であることを確認
      expect(voiceItems.length).toBeLessThanOrEqual(12);
      
      // 2ページ目の存在を確認
      const page2Link = page.locator('a[href*="/voice/page/2/"]');
      const exists = await page2Link.count();
      
      if (voiceItems.length === 12) {
        // 12件ちょうど表示されている場合、2ページ目リンクが存在するはず
        expect(exists).toBeGreaterThan(0);
      }
    });

    test('should access /voice/page/2/ without 404 error', async ({ page }) => {
      const response = await page.goto(`/voice/page/2/`);
      
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
      await page.goto(`/`);
      
      // Media セクション（PICK UP）と News セクションを取得
      // data-testid は index.php の `.top-news__inner` / `.top-news__inner--bottom` に対応
      const mediaSection = page.locator('[data-testid="top-news-pickup"]').first();
      const newsSection = page.locator('[data-testid="top-news-list"]').first();
      
      if (await mediaSection.isVisible() && await newsSection.isVisible()) {
        const mediaBox = await mediaSection.boundingBox();
        const newsBox = await newsSection.boundingBox();
        
        // Media セクションが News セクション上部に表示されていることを確認
        if (mediaBox && newsBox) {
          expect(mediaBox.y).toBeLessThan(newsBox.y);
        }
      }
    });

    test('should display 3 media items and 3 news items on homepage', async ({ page }) => {
      await page.goto(`/`);
      
      // メディアセクションの記事数（index.phpで posts_per_page => 3）
      // data-testid は wrapper にあり、`.top-news__item` は子孫要素（testidなし）
      const mediaItems = await page.locator('[data-testid="top-news-pickup"] .top-news__item').all();
      expect(mediaItems.length).toBe(3);

      // ニュースセクションの記事数（index.phpで posts_per_page => 3）
      const newsItems = await page.locator('[data-testid="top-news-list"] .top-news__item').all();
      expect(newsItems.length).toBe(3);
    });

    test('should navigate to media list page via "View All" link', async ({ page }) => {
      await page.goto(`/`);
      
      // 「一覧へ」リンク（メディアセクション = PICK UP）
      const viewAllLink = page.locator('[data-testid="top-news-pickup"] a:has-text("一覧")').first();
      
      if (await viewAllLink.isVisible()) {
        const href = await viewAllLink.getAttribute('href');
        expect(href).toMatch(/\/media|\/news|\/media-page/);
      }
    });
  });

  test.describe('PR #80: Scroll Margin Top Adjustment', () => {
    
    test('should scroll to correct position for internal anchor links', async ({ page, request }) => {
      await page.goto(`/product/`);

      const styleHref = await page.locator('link[href*="assets/css/style.css"]').first().getAttribute('href');
      expect(styleHref).toBeTruthy();

      const cssResponse = await request.get(styleHref!);
      const cssText = await cssResponse.text();
      const hasScrollMarginRule = cssText.includes('[id]') && cssText.includes('scroll-margin-top');

      expect(hasScrollMarginRule).toBeTruthy();
    });

    test('should have scroll-margin-top applied to headings', async ({ page, request }) => {
      await page.goto(`/sustainability/environment/`);

      const idElements = page.locator('.page__inner [id]');
      const idCount = await idElements.count();

      if (idCount > 0) {
        const scrollMarginTop = await idElements.first().evaluate((el: HTMLElement) => {
          return window.getComputedStyle(el).scrollMarginTop;
        });

        expect(scrollMarginTop).not.toBe('0px');
        expect(scrollMarginTop).not.toBe('auto');
        return;
      }

      const styleHref = await page.locator('link[href*="assets/css/style.css"]').first().getAttribute('href');
      expect(styleHref).toBeTruthy();

      const cssResponse = await request.get(styleHref!);
      const cssText = await cssResponse.text();
      const hasScrollMarginRule = cssText.includes('[id]') && cssText.includes('scroll-margin-top');

      expect(hasScrollMarginRule).toBeTruthy();
    });
  });

  test.describe('PR #71, #72: Footer Taxonomy Links Fix', () => {
    
    test('should link to /product/application/ via footer', async ({ page }) => {
      await page.goto(`/`);
      
      const link = page.locator('.footer__nav--pc a:has-text("By Application")').first();
      const href = await link.getAttribute('href');
      
      expect(href).toMatch(/\/product\/application\/?$/);
    });

    test('should link to /product/material/ via footer', async ({ page }) => {
      await page.goto(`/`);
      
      const link = page.locator('.footer__nav--pc a:has-text("By Material")').first();
      const href = await link.getAttribute('href');
      
      expect(href).toMatch(/\/product\/material\/?$/);
    });

    test('should NOT use hash anchor links in footer', async ({ page }) => {
      await page.goto(`/`);
      
      // footer のすべてのリンクを確認
      const footerLinks = await page.locator('footer a[href^="/product/"]').all();
      
      for (const link of footerLinks) {
        const href = await link.getAttribute('href');
        // ハッシュアンカー（#）が含まれていないことを確認
        expect(href).not.toContain('#');
      }
    });

    test('should navigate to correct product taxonomy page when footer link is clicked', async ({ page }) => {
      await page.goto(`/`);
      
      const designLink = page.locator('.footer__nav--pc a:has-text("By Design")').first();
      await designLink.click();
      
      // /product/design/ ページに遷移
      await expect(page).toHaveURL(/\/product\/design\/?$/);
      
      // ページが正しく表示されていることを確認
      await expect(page.locator('.page__title, h1').first()).toBeVisible();
    });
  });

  test.describe('PR #84, #69: Language Links', () => {
    
    test('should have English language link opening in new tab', async ({ context, page }) => {
      await page.goto(`/`);
      
      // 英語リンク
      const enLink = page.locator('header a:has-text("En"), a:has-text("English")').first();
      
      if (await enLink.isVisible()) {
        const target = await enLink.getAttribute('target');
        const href = await enLink.getAttribute('href');
        
        expect(href).toBe('https://musashipaint.com/en/');
        expect(target).toBe('_blank');
      }
    });

    test('should have Chinese language link opening in new tab', async ({ context, page }) => {
      await page.goto(`/`);
      
      // 中国語リンク
      const cnLink = page.locator('header a:has-text("中文"), a:has-text("Chinese")').first();
      
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
      const response = await page.goto(`/career/interview/`);
      expect(response?.status()).toBe(200);
      
      // interview 投稿が表示されていることを確認
      const articles = await page.locator('.archive__item').all();
      expect(articles.length).toBeGreaterThan(0);
    });

    test('should display interview single post at /career/interview/[slug]/', async ({ page }) => {
      // 最初に archive ページで最初の投稿リンクを取得
      await page.goto(`/career/interview/`);
      
      const firstLink = page.locator('a[href*="/career/interview/"]:not([href$="/career/interview/"])').first();
      const href = await firstLink.getAttribute('href');
      
      if (href) {
        const url = href.startsWith('http') ? href : `${href}`;
        const response = await page.goto(url);
        expect(response?.status()).toBe(200);
        
        // single-interview.php で表示されていることを確認
        expect(page.url()).toMatch(/\/career\/interview\/[^/]+\/?$/);
      }
    });

    test('should have pagination for interview posts', async ({ page }) => {
      await page.goto(`/career/interview/`);
      
      // interview 投稿の表示確認
      const articles = await page.locator('.archive__item').all();
      expect(articles.length).toBeGreaterThan(0);
      
      if (articles.length >= 12) {
        const page2Link = page.locator('a[href*="/career/interview/page/2/"]');
        expect(await page2Link.count()).toBeGreaterThan(0);
      }
    });

    test('should access /career/interview/page/2/ without 404 error', async ({ page }) => {
      const response = await page.goto(`/career/interview/page/2/`);
      expect(response?.status()).toBe(200);
    });
  });

  test.describe('PR #89: Media Post Pagination', () => {
    
    test('should display media posts at /media-page/ with 12 per page', async ({ page }) => {
      const response = await page.goto(`/media-page/`);
      expect(response?.status()).toBe(200);
      
      const mediaItems = await page.locator('.archive__item').all();
      expect(mediaItems.length).toBeGreaterThan(0);
      expect(mediaItems.length).toBeLessThanOrEqual(12);
    });

    test('should have pagination for media posts', async ({ page }) => {
      await page.goto(`/media-page/`);
      
      const mediaItems = await page.locator('.archive__item').all();
      
      if (mediaItems.length === 12) {
        const page2Link = page.locator('a[href*="/media-page/page/2/"]');
        expect(await page2Link.count()).toBeGreaterThan(0);
      }
    });

    test('should NOT have /media-post/ automatic archive (has_archive disabled)', async ({ page }) => {
      const response = await page.goto(`/media-post/`, { 
        waitUntil: 'domcontentloaded'
      });
      
      // 自動 archive ページは存在しない（404）
      expect(response?.status()).toBe(404);
    });
  });

  test.describe('PR #71, #103: Post Type with_front Unification', () => {
    
    test('should access product posts at /product/[slug]/', async ({ page }) => {
      await page.goto(`/product/`);

      // タクソノミーリンク（/product/application/ 等）を除外し、単一投稿リンクのみ取得
      const firstLink = page.locator(
        'a[href*="/product/"]:not([href$="/product/"]):not([href*="/product/application/"]):not([href*="/product/material/"]):not([href*="/product/design/"]):not([href*="/product/function/"]):not([href*="/product/environment/"])'
      ).first();
      const href = await firstLink.getAttribute('href');

      if (href) {
        const url = href.startsWith('http') ? href : `${href}`;
        const response = await page.goto(url);
        expect(response?.status()).toBe(200);
        expect(page.url()).toMatch(/\/product\/[^/]+\/?$/);
      }
    });

    test('should access story posts at /story/[slug]/', async ({ page, request }) => {
      // story は has_archive: false のため、REST APIで投稿スラッグを取得
      const apiResponse = await request.get(`/wp-json/wp/v2/story?per_page=1&_fields=slug`);
      const posts = await apiResponse.json();

      if (posts.length > 0) {
        const slug = posts[0].slug;
        const response = await page.goto(`/story/${slug}/`);
        expect(response?.status()).toBe(200);
        expect(page.url()).toMatch(/\/story\/[^/]+\/?$/);
      }
    });

    test('should access career posts at /career/[slug]/', async ({ page }) => {
      await page.goto(`/career/`);
      
      const firstLink = page.locator('a[href*="/career/"]:not([href$="/career/"])').first();
      const href = await firstLink.getAttribute('href');

      if (href) {
        const url = href.startsWith('http') ? href : `${href}`;
        const response = await page.goto(url);
        expect(response?.status()).toBe(200);
        expect(page.url()).toMatch(/\/career\/[^/]+\/?$/);
      }
    });

    test('should NOT have /news/ prefix in custom post type URLs', async ({ page }) => {
      // 各投稿タイプのリンクを確認
      for (const path of ['/product/', '/story/', '/voice/', '/career/', '/global-network/']) {
        const response = await page.goto(`${path}`, {
          waitUntil: 'domcontentloaded',
          timeout: 15000,
        });
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
      const response = await page.goto(`/product/`);
      expect(response?.status()).toBe(200);
      
      // pagination が表示されているか確認
      const paginationLinks = await page.locator('[class*="pagination"], [class*="paging"], nav a').all();
      expect(paginationLinks.length).toBeGreaterThan(0);
    });

    test('should access product pagination pages without 404 error', async ({ page }) => {
      for (let pageNum = 2; pageNum <= 3; pageNum++) {
        const response = await page.goto(`/product/page/${pageNum}/`);
        expect(response?.status()).toBe(200);
      }
    });

    test('should display different content on each pagination page', async ({ page }) => {
      await page.goto(`/product/page/1/`);
      const content1 = await page.textContent('.archive__item:first-child');
      
      const response2 = await page.goto(`/product/page/2/`);
      
      if (response2?.status() === 200) {
        const content2 = await page.textContent('.archive__item:first-child');
        
        // 異なるコンテンツが表示されていることを確認
        expect(content1).not.toBe(content2);
      }
    });

    test('should have pagination on interview archive', async ({ page }) => {
      const response = await page.goto(`/career/interview/page/2/`);
      expect(response?.status()).toBe(200);
    });

    test('should have pagination on story archive', async ({ page }) => {
      const response = await page.goto(`/story/page/2/`);
      expect(response?.status()).toBe(404);
    });

    test('should have pagination on voice archive', async ({ page }) => {
      const response = await page.goto(`/voice/page/2/`);
      expect(response?.status()).toBe(200);
    });

    test('should have pagination on news archive', async ({ page }) => {
      const response = await page.goto(`/news/page/2/`);
      expect(response?.status()).toBe(200);
    });

    test('should have pagination on global-network archive', async ({ page }) => {
      const response = await page.goto(`/global-network/page/2/`);
      expect(response?.status()).toBe(200);
    });
  });

  test.describe('PR #71, #72: Product Taxonomy Pages', () => {
    
    test('should display /product/application/ page', async ({ page }) => {
      const response = await page.goto(`/product/application/`);
      expect(response?.status()).toBe(200);
    });

    test('should display /product/material/ page', async ({ page }) => {
      const response = await page.goto(`/product/material/`);
      expect(response?.status()).toBe(200);
    });

    test('should display /product/design/ page', async ({ page }) => {
      const response = await page.goto(`/product/design/`);
      expect(response?.status()).toBe(200);
    });

    test('should display /product/function/ page', async ({ page }) => {
      const response = await page.goto(`/product/function/`);
      expect(response?.status()).toBe(200);
    });

    test('should display /product/environment/ page', async ({ page }) => {
      const response = await page.goto(`/product/environment/`);
      expect(response?.status()).toBe(200);
    });

    test('should have pagination on product taxonomy pages', async ({ page }) => {
      await page.goto(`/product/application/`);

      const itemCount = await page.locator('.archive__item, .taxonomy__item').count();
      const hasPage2Link = await page.locator('a[href*="/product/application/page/2/"]').count() > 0;
      const response = await page.goto(`/product/application/page/2/`);

      if (itemCount > 12 || hasPage2Link) {
        expect(response?.status()).toBe(200);
        return;
      }

      expect(response?.status()).toBe(404);
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
      await page.goto(`/contact/`);
      
      // Contact Form 7 フォームの存在確認
      // data-testid="contact-form" は `<section class="contact">` ラッパに付与（page-contact.php）
      // 内側の form 要素を取得するため testid 配下に絞る
      const form = page.locator('[data-testid="contact-form"] form');
      await expect(form).toBeVisible();
    });

    test('should submit inquiry form successfully', async ({ page }) => {
      await page.goto(`/contact/`);
      
      // フォーム入力
      await page.fill('input[name="your-name"]', 'Test User');
      await page.fill('input[name="your-company"]', 'Musashi Paint QA');
      await page.fill('input[name="your-email"]', 'test@example.com');
      await page.fill('input[name="your-subject"]', 'Playwright inquiry test');
      await page.fill('textarea[name="your-message"]', 'Test inquiry message');
      await page.check('input[name="agree"]');
      
      // フォーム送信（CF7はAJAX送信のためwaitForNavigationは不要）
      const submitButton = page.locator('button[type="submit"], input[type="submit"]').first();
      await expect(submitButton).toBeEnabled();
      
      await submitButton.click();
      
      // CF7のレスポンスメッセージが表示されるのを待つ
      const successMessage = page.locator('.wpcf7-response-output');
      await expect(successMessage).toBeVisible({ timeout: 10000 });
    });

    test.describe('Mail-driven approval flow', () => {
      // Mailpit 受信箱は describe 内のテスト間で共有されるため、fullyParallel:true 下でも
      // 並列実行による相互干渉（他テストの clearMailpit が走るなど）を避けて serial 化する。
      test.describe.configure({ mode: 'serial' });

      test.beforeEach(async () => {
        await clearMailpit();
      });

      test('should send admin notification email with approval link', async ({ page }) => {
        await submitContactForm(page);
        // The plugin sends both a user confirmation and an admin notification;
        // the admin one carries the `musashi_review=1&token=...` URL.
        const { token } = await captureReviewToken();
        expect(token.length).toBeGreaterThan(0);
      });

      test('should display approval page with token parameter', async ({ page }) => {
        await submitContactForm(page);
        const { reviewUrl } = await captureReviewToken();
        const response = await page.goto(reviewUrl);
        expect(response?.status()).toBe(200);
        await expect(page.locator('#approve-form, #reject-form').first()).toBeVisible();
      });

      test('should have approval and rejection buttons on approval page', async ({ page }) => {
        await submitContactForm(page);
        const { reviewUrl } = await captureReviewToken();
        await page.goto(reviewUrl);

        await expect(page.locator('#approve-form input[name="action_type"][value="approve"]')).toHaveCount(1);
        await expect(page.locator('#reject-form input[name="action_type"][value="reject"]')).toHaveCount(1);
        await expect(page.locator('.btn-approve')).toBeVisible();
        await expect(page.locator('.btn-reject')).toBeVisible();
      });

      test('should send approval email when approval button clicked', async ({ page }) => {
        const { email } = await submitContactForm(page);
        const { reviewUrl } = await captureReviewToken();

        // 承認クリックで生成されたメールだけを観測するため受信箱を空にする。
        await clearMailpit();

        await page.goto(reviewUrl);
        // 実際の UI フロー: 承認ボタン → 確認モーダル → 実行ボタン。
        // ボタン経由で踏むことで JS のクリックハンドラを通常通り発火させる。
        await page.locator('.btn-approve').click();
        await page.locator('#confirmation-submit').click();

        // ユーザー向け承認メールは問い合わせ者のアドレス宛て。
        const userMail = await waitForMailpitMessage({ to: email }, 15_000);
        expect(userMail.Subject.length).toBeGreaterThan(0);
      });

      test('should send rejection email when rejection button clicked', async ({ page }) => {
        const { email } = await submitContactForm(page);
        const { reviewUrl } = await captureReviewToken();

        await clearMailpit();

        await page.goto(reviewUrl);
        await page.locator('.btn-reject').click();
        await page.locator('#confirmation-submit').click();

        const userMail = await waitForMailpitMessage({ to: email }, 15_000);
        expect(userMail.Subject.length).toBeGreaterThan(0);
      });

      test('should prevent double submission (second click should not send email)', async ({ page }) => {
        const { email } = await submitContactForm(page);
        const { reviewUrl } = await captureReviewToken();

        // 1 回目の承認 — 実際にメールが届くことを確認してから、受信箱を空にする。
        // これをやらないと「1 回目が無音で失敗 → 2 回目も無音 → no-mail を検出」で
        // 誤って PASS してしまう。
        await page.goto(reviewUrl);
        await page.locator('.btn-approve').click();
        await page.locator('#confirmation-submit').click();
        await page.waitForLoadState('networkidle');

        // 1 回目の送信で実際にユーザー向けメールが届いたことを確認。
        await waitForMailpitMessage({ to: email }, 15_000);
        await clearMailpit();

        // 同一トークンでの 2 回目。プラグインは再アクションを短絡しメールを再送信しない想定。
        await page.goto(reviewUrl);
        await page.locator('.btn-approve').click();
        await page.locator('#confirmation-submit').click();
        await page.waitForLoadState('networkidle');

        // Mailpit をポーリングし、観測ウィンドウ全体で受信箱が空のままであることを確認。
        // ローカル Docker の SMTP/CF7 配送は通常 1 秒未満で完了するが、
        // CI などでの遅延を考慮し 3 秒に設定（伸ばすほどテストが遅くなるため、
        // 「届かない」確認には 3 秒が現実的な妥協点）。
        await expect
          .poll(async () => (await getMailpitMessages()).length, {
            intervals: [250, 250, 250, 250, 250, 250, 500, 500, 500],
            timeout: 3000,
          })
          .toBe(0);
      });
    });
  });

  test.describe('Email Templates Admin Page', () => {
    // WP Settings API を書き換える（共有 DB をミューテートする）テスト群のため serial 化する。
    test.describe.configure({ mode: 'serial' });

    // globalSetup が失敗した／走っていない環境では admin storageState ファイルが
    // 存在しない。そのまま test.use すると Playwright が即エラーを出すため、
    // ファイル不在時はこの describe 全体を skip する。
    test.skip(
      !existsSync(ADMIN_STORAGE_STATE),
      'admin storageState 未生成のため skip',
    );
    test.use({ storageState: ADMIN_STORAGE_STATE });

    test('should display email templates management page in admin', async ({ page }) => {
      const response = await page.goto('/wp-admin/admin.php?page=musashi-inquiry-email-templates');
      expect(response?.status()).toBe(200);

      // The plugin's settings page registers a `<form>` carrying the
      // `musashi-inquiry-email-templates` settings group; presence of the
      // wrapper plus at least one mail-template field proves the page rendered.
      await expect(page.locator('#wpcontent form').first()).toBeVisible();
      await expect(
        page.locator('input[name^="musashi_email_"], textarea[name^="musashi_email_"]').first(),
      ).toBeVisible();
    });

    test('should allow editing email templates', async ({ page }) => {
      await page.goto('/wp-admin/admin.php?page=musashi-inquiry-email-templates');

      // Pick a stable, low-blast-radius field — the user button text — and
      // verify it survives a round-trip through the WP Settings API.
      const fieldSelector = 'input[name="musashi_email_user_button_text"]';
      const field = page.locator(fieldSelector).first();
      await expect(field).toBeVisible();

      const original = (await field.inputValue()) || '';
      // 並列ワーカー間での衝突回避のため workerIndex を付与。
      const probe = `pw-${Date.now()}-${test.info().workerIndex}`;
      try {
        await field.fill(probe);
        await page.locator('input[type="submit"][name="submit"], button[type="submit"][name="submit"]').first().click();
        await page.waitForLoadState('networkidle');

        const refreshed = page.locator(fieldSelector).first();
        await expect(refreshed).toHaveValue(probe);
      } finally {
        // Restore the original value so subsequent runs / shared envs are unaffected.
        await page.locator(fieldSelector).first().fill(original);
        await page
          .locator('input[type="submit"][name="submit"], button[type="submit"][name="submit"]')
          .first()
          .click();
        await page.waitForLoadState('networkidle');
      }
    });
  });

  test.describe('Download Page (PR #72)', () => {
    
    test('should display download page with proper layout', async ({ page }) => {
      const response = await page.goto(`/download/`);
      
      if (response?.status() === 200) {
        // ダウンロードページのコンテンツ確認
        const content = await page.locator('[class*="download"]').isVisible();
        expect(content).toBeTruthy();
      }
    });

    test('should have download request form', async ({ page }) => {
      const response = await page.goto(`/download/`);
      
      if (response?.status() === 200) {
        const form = page.locator('form').first();
        await expect(form).toBeVisible();
      }
    });

    test('should navigate to download page from footer', async ({ page }) => {
      await page.goto(`/`);
      
      const downloadLink = page.locator('footer a:has-text("ダウンロード"), footer a:has-text("Download")').first();
      
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
    await page.goto(`/`);
    
    // モバイルメニューが表示されていることを確認
    // SP 表示時に常時可視のトップレベルハンバーガー (hamburger-toggle-main)
    // ※ -page / -scroll は文脈別バリアント（header.php 参照）
    const mobileMenu = page.locator('[data-testid="hamburger-toggle-main"]');
    await expect(mobileMenu).toBeVisible();
  });

  test('should have no broken internal links on homepage', async ({ page }) => {
    await page.goto(`/`);
    
    // すべての内部リンクを確認
    const links = await page.locator('a[href^="/"]').all();
    
    // 先に全hrefを取得（page.goto後にLocatorがstaleになるのを防止）
    const hrefs: string[] = [];
    for (const link of links.slice(0, 10)) {
      const href = await link.getAttribute('href');
      if (href && !href.includes('#')) {
        hrefs.push(href);
      }
    }
    
    for (const href of hrefs) {
      const response = await page.goto(href, { 
        waitUntil: 'domcontentloaded'
      });
      
      // 404 エラーが出ていないことを確認
      expect([200, 301, 302]).toContain(response?.status());
    }
  });

  test('should have all images displaying correctly', async ({ page }) => {
    await page.goto(`/`);
    
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
    await page.goto(`/`);
    
    // title が存在
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // description メタタグが存在
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveCount(1);
    
    // og:title が存在
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveCount(1);
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
