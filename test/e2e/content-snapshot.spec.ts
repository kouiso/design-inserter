import { readFileSync } from 'fs';
import { join } from 'path';

import { test, expect } from '@playwright/test';

function loadSnapshotFixture() {
  const testEnv = process.env.TEST_ENV || 'local';

  if (testEnv === 'docker-en') {
    return JSON.parse(
      readFileSync(join(__dirname, '../fixtures/content-snapshot-docker-en.json'), 'utf-8')
    );
  }

  if (testEnv === 'staging') {
    return JSON.parse(
      readFileSync(join(__dirname, '../fixtures/content-snapshot-staging.json'), 'utf-8')
    );
  }

  if (testEnv === 'production') {
    return JSON.parse(
      readFileSync(join(__dirname, '../fixtures/content-snapshot-production.json'), 'utf-8')
    );
  }

  return JSON.parse(
    readFileSync(join(__dirname, '../fixtures/content-snapshot.json'), 'utf-8')
  );
}

const snapshot = loadSnapshotFixture();

/**
 * コンテンツスナップショットテスト
 *
 * 目的:
 *   サイトに表示されているコンテンツが、スナップショット取得時から
 *   変更されていないことを検証する。
 *
 * スナップショットの更新:
 *   npm run snapshot:update
 */

// URLからパス部分を抽出
function extractPath(url: string): string {
  try {
    const parsed = new URL(url);
    return decodeURIComponent(parsed.pathname);
  } catch {
    return url;
  }
}

// 記事リストを取得する共通関数
async function getArticlesFromPage(page: any, selector: string): Promise<Array<{ title: string; url: string }>> {
  const articles: Array<{ title: string; url: string }> = [];
  const items = await page.locator(selector).all();

  for (const item of items) {
    try {
      const linkElement = await item.locator('a').first();
      const href = await linkElement.getAttribute('href');

      let title = '';
      const titleLocator = item.locator('.archive__title');
      if (await titleLocator.count() > 0) {
        title = await titleLocator.textContent();
      } else {
        const imgLocator = item.locator('img');
        if (await imgLocator.count() > 0) {
          title = await imgLocator.getAttribute('alt') || '';
        }
        if (!title) {
          title = await linkElement.textContent();
        }
      }

      title = title.trim().split('\n')[0].trim();

      if (href && title) {
        articles.push({ title, url: href });
      }
    } catch (e) {
      // skip
    }
  }

  return articles;
}

// 全ページの記事を取得（ページネーション対応）
async function getAllArticles(
  page: any,
  basePath: string,
  selector: string,
  paginated: boolean = false
): Promise<Array<{ title: string; url: string }>> {
  const allArticles: Array<{ title: string; url: string }> = [];
  let currentPage = 1;
  let hasNextPage = true;
  const maxPages = 10;

  while (hasNextPage && currentPage <= maxPages) {
    const url = currentPage === 1 ? basePath : `${basePath}page/${currentPage}/`;
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

    if (!response || response.status() !== 200) {
      break;
    }

    const articles = await getArticlesFromPage(page, selector);
    allArticles.push(...articles);

    if (paginated) {
      const nextPageLink = page.locator('.pagination__link--next, a:has-text("次のページ")');
      hasNextPage = await nextPageLink.count() > 0;
      if (hasNextPage) {
        currentPage++;
      }
    } else {
      hasNextPage = false;
    }
  }

  return allArticles;
}

// アーカイブページのテスト生成
function createArchiveTest(archiveKey: string, archiveData: any, paginated: boolean = false) {
  if (!archiveData || archiveData.totalCount === 0) {
    test.skip(`${archiveData?.title || archiveKey} - スキップ（コンテンツなし）`, () => {});
    return;
  }

  test(`${archiveData.title} (${archiveData.path}) の記事リストがスナップショットと一致する`, async ({ page }) => {
    const selector = '.archive__item, .faq__item';
    const actual = await getAllArticles(page, archiveData.path, selector, paginated);

    expect(actual.length, `記事数が一致しません。期待: ${archiveData.totalCount}, 実際: ${actual.length}`).toBe(archiveData.totalCount);

    for (let i = 0; i < archiveData.posts.length; i++) {
      const expectedPost = archiveData.posts[i];
      const actualPost = actual[i];

      expect(actualPost, `${i + 1}番目の記事が見つかりません: "${expectedPost.title}"`).toBeDefined();

      if (actualPost) {
        expect(actualPost.title, `${i + 1}番目の記事タイトルが異なります`).toBe(expectedPost.title);
        expect(extractPath(actualPost.url), `${i + 1}番目の記事URLが異なります`).toBe(extractPath(expectedPost.url));
      }
    }

    console.log(`✅ ${archiveData.title}: ${actual.length}件の記事が正しく表示されています`);
  });
}

// =============================================================================
// アーカイブページテスト
// =============================================================================
test.describe('アーカイブページ - コンテンツ検証', () => {
  test.describe.configure({ mode: 'serial' });

  // 動的にテスト生成
  const paginatedArchives = ['interview', 'product'];

  for (const [key, data] of Object.entries(snapshot.archives)) {
    const archiveData = data as any;
    if (archiveData.totalCount > 0) {
      createArchiveTest(key, archiveData, paginatedArchives.includes(key));
    }
  }
});

// =============================================================================
// 固定ページテスト
// =============================================================================
test.describe('固定ページ - 存在確認', () => {
  for (const staticPage of snapshot.staticPages) {
    test(`${staticPage.title} (${staticPage.path}) が200 OKを返す`, async ({ page }) => {
      const response = await page.goto(staticPage.path);
      expect(response?.status(), `${staticPage.title}が${response?.status()}を返しました`).toBe(200);
    });
  }
});

// =============================================================================
// 製品カテゴリテスト
// =============================================================================
test.describe('製品カテゴリページ - コンテンツ検証', () => {
  for (const category of snapshot.productCategories) {
    test(`${category.title} (${category.path}) のアイテム数が一致する`, async ({ page }) => {
      const response = await page.goto(category.path);
      expect(response?.status()).toBe(200);

      const items = await page.locator('.archive__item, .taxonomy__item').all();
      expect(items.length, `${category.title}のアイテム数が異なります`).toBe(category.itemCount);

      console.log(`✅ ${category.title}: ${items.length}件`);
    });
  }
});

// =============================================================================
// トップページテスト
// =============================================================================
test.describe('トップページ - コンテンツ検証', () => {
  test('Pick upセクションの記事が正しく表示されている', async ({ page }) => {
    await page.goto('/');

    const pickupLinks = await page.locator('main a[href*="/media-page/"]').all();
    const pickupItems = [];

    for (const link of pickupLinks) {
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      if (href && text && !text.includes('一覧')) {
        pickupItems.push({ title: text.trim().split('\n')[0].trim(), url: href });
      }
    }

    expect(pickupItems.length, 'Pick upの件数が異なります').toBeGreaterThanOrEqual(snapshot.topPage.pickup.length);

    // 最初の記事が一致するか確認
    if (snapshot.topPage.pickup.length > 0 && pickupItems.length > 0) {
      expect(pickupItems[0].title).toBe(snapshot.topPage.pickup[0].title);
    }

    console.log(`✅ トップページ Pick up: ${pickupItems.length}件`);
  });

  test('Newsセクションの記事が正しく表示されている', async ({ page }) => {
    await page.goto('/');

    const newsLinks = await page.locator('main a[href*="/news/"]').all();
    const newsItems = [];

    for (const link of newsLinks) {
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      if (href && text && !text.includes('一覧')) {
        newsItems.push({ title: text.trim().split('\n')[0].trim(), url: href });
      }
    }

    expect(newsItems.length, 'Newsの件数が異なります').toBeGreaterThanOrEqual(snapshot.topPage.news.length);

    console.log(`✅ トップページ News: ${newsItems.length}件`);
  });
});

// =============================================================================
// ナビゲーションテスト
// =============================================================================
test.describe('ナビゲーション - リンク検証', () => {
  test('フッターの内部リンクがすべて有効', async ({ page }) => {
    await page.goto('/');

    const brokenLinks: string[] = [];

    const snapshotHost = new URL(snapshot.baseURL).hostname;

    for (const link of snapshot.navigation.footer) {
      // 外部リンクはスキップ（スナップショットのbaseURL以外のホスト）
      try {
        const linkUrl = new URL(link.url);
        if (linkUrl.hostname !== snapshotHost) {
          continue;
        }
      } catch {
        // 相対URLはそのまま処理
      }

      // スナップショットURLのパス部分をローカル環境で検証
      const linkPath = link.url.startsWith('http') ? new URL(link.url).pathname : link.url;
      const response = await page.goto(linkPath, { waitUntil: 'domcontentloaded' }).catch(() => null);
      if (!response || response.status() !== 200) {
        brokenLinks.push(`${link.title}: ${link.url} (${response?.status() || 'error'})`);
      }
    }

    if (brokenLinks.length > 0) {
      console.error('❌ リンク切れ:', brokenLinks);
    }

    expect(brokenLinks.length, `${brokenLinks.length}件のリンク切れがあります`).toBe(0);
    console.log(`✅ フッターリンク: すべて有効`);
  });
});

// =============================================================================
// 外部リンクテスト
// =============================================================================
test.describe('外部リンク - 到達確認', () => {
  for (const extLink of snapshot.externalLinks) {
    test(`${extLink.title} (${extLink.url}) にアクセス可能`, async ({ request }) => {
      const response = await request.get(extLink.url, { timeout: 15000 }).catch(() => null);

      const status = response?.status() ?? 0;

      // 外部サイトはBot判定や認証導線により一部の 4xx を返すことがあるため、
      // 正常系の 2xx/3xx に加え、認証・Bot 判定由来の代表的なステータスのみ許容する。
      const allowedExternalStatuses = [401, 403, 429];
      const allowedStatusByHost: Record<string, number[]> = {
        'www.facebook.com': [400],
      };
      const host = new URL(extLink.url).hostname;
      const hostSpecificStatuses = allowedStatusByHost[host] ?? [];
      expect((status >= 200 && status < 400) || allowedExternalStatuses.includes(status) || hostSpecificStatuses.includes(status),
        `${extLink.title}にアクセスできません`).toBeTruthy();

      console.log(`✅ ${extLink.title}: ${status}`);
    });
  }
});

// =============================================================================
// SEO テスト
// =============================================================================
test.describe('SEO/OGP - メタ情報検証', () => {
  for (const seoData of snapshot.seo) {
    test(`${seoData.pageTitle} (${seoData.path}) のメタ情報が設定されている`, async ({ page }) => {
      await page.goto(seoData.path);

      const title = await page.title();
      expect(title, 'titleが空です').toBeTruthy();

      // OGP画像が設定されているか（重要ページのみ必須とする）
      if (seoData.ogImage) {
        const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content').catch(() => '');
        expect(ogImage, 'og:imageが設定されていません').toBeTruthy();
      }

      console.log(`✅ ${seoData.pageTitle}: title="${title.substring(0, 30)}..."`);
    });
  }
});

// =============================================================================
// 削除検知テスト（総合）
// =============================================================================
test.describe('削除検知テスト', () => {
  test('全アーカイブページで記事が減っていないことを確認', async ({ page }) => {
    test.setTimeout(120000);

    const results: Array<{ archive: string; expected: number; actual: number; missing: string[] }> = [];
    const paginatedArchives = ['interview', 'product'];

    for (const [key, archiveData] of Object.entries(snapshot.archives)) {
      const data = archiveData as any;
      if (data.totalCount === 0) continue;

      const paginated = paginatedArchives.includes(key);
      const actual = await getAllArticles(page, data.path, '.archive__item, .faq__item', paginated);

      const actualUrls = new Set(actual.map(a => extractPath(a.url)));
      const missing = data.posts
        .filter((p: any) => !actualUrls.has(extractPath(p.url)))
        .map((p: any) => p.title);

      results.push({
        archive: data.title,
        expected: data.totalCount,
        actual: actual.length,
        missing,
      });

      if (missing.length > 0) {
        console.error(`❌ ${data.title}: ${missing.length}件の記事が見つかりません`);
        missing.forEach((title: string) => console.error(`   - ${title}`));
      }
    }

    console.log('\n📊 検証結果サマリー:');
    for (const result of results) {
      const status = result.missing.length === 0 ? '✅' : '❌';
      console.log(`${status} ${result.archive}: ${result.actual}/${result.expected}件`);
    }

    const totalMissing = results.reduce((sum, r) => sum + r.missing.length, 0);
    expect(totalMissing, `${totalMissing}件の記事が見つかりません`).toBe(0);
  });
});
