/**
 * 現在のサイト表示からスナップショットを取得するスクリプト
 *
 * 使い方:
 *   npm run snapshot:update
 *   npm run snapshot:update:prod
 *
 * 出力:
 *   test/fixtures/content-snapshot.json
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const environments = {
  local: 'http://localhost:10010',
  docker: 'http://localhost:8080',
  'docker-en': 'http://localhost:8081',
  'docker-bogo': 'http://localhost:8082',
  staging: 'https://musashipaint.xsrv.jp',
  production: 'https://musashipaint.xsrv.jp',
};

// コマンドライン引数から環境を取得
const envArg = process.argv.find(arg => arg.startsWith('--env='));
const env = envArg ? envArg.split('=')[1] : 'local';
const baseURL = environments[env] || environments.local;

// スナップショット対象のアーカイブページ
const archivePages = [
  { key: 'career', path: '/career/', title: '採用情報', selector: '.archive__item' },
  { key: 'interview', path: '/career/interview/', title: 'インタビュー', selector: '.archive__item', paginated: true },
  { key: 'globalnetwork', path: '/global-network/', title: 'グローバルネットワーク', selector: '.archive__item' },
  { key: 'product', path: '/product/', title: '製品情報', selector: '.archive__item', paginated: true },
  { key: 'news', path: '/news/', title: 'ニュース', selector: '.archive__item' },
  { key: 'media', path: '/media-page/', title: 'Pick up', selector: '.archive__item' },
  { key: 'featured', path: '/featured/', title: '注目製品', selector: '.archive__item' },
  { key: 'voice', path: '/voice/', title: 'お客様の声', selector: '.archive__item' },
  { key: 'faq', path: '/faq/', title: 'よくある質問', selector: '.faq__item, .archive__item' },
];

// 製品カテゴリページ
const productCategories = [
  { key: 'product_application', path: '/product/application/', title: '用途でえらぶ' },
  { key: 'product_material', path: '/product/material/', title: '基材でえらぶ' },
  { key: 'product_design', path: '/product/design/', title: '意匠性でえらぶ' },
  { key: 'product_function', path: '/product/function/', title: '機能でえらぶ' },
  { key: 'product_environment', path: '/product/environment/', title: '環境キーワードでえらぶ' },
];

// 固定ページ（存在確認用）
const staticPages = [
  { path: '/', title: 'トップページ' },
  { path: '/about-us/', title: '私たちについて' },
  { path: '/company/', title: '会社概要' },
  { path: '/history/', title: 'ヒストリー' },
  { path: '/sustainability/', title: 'サステナビリティ' },
  { path: '/technology/', title: 'テクノロジー' },
  { path: '/customization/', title: 'カスタマイズ' },
  { path: '/contact/', title: 'お問い合わせ' },
  { path: '/download/', title: 'カタログダウンロード' },
  { path: '/privacy-policy/', title: 'プライバシーポリシー' },
  { path: '/terms/', title: '利用規約' },
];

// 外部リンク
const externalLinks = [
  { url: 'https://musashipaint.com/en/', title: '英語サイト' },
  { url: 'https://www.musashipaintchina.com/', title: '中国語サイト' },
  { url: 'https://www.linkedin.com/company/musashi-paint-holdings/', title: 'LinkedIn' },
  { url: 'https://www.instagram.com/musashi_paint_official/', title: 'Instagram' },
  { url: 'https://www.facebook.com/musashipaintholdings/', title: 'Facebook' },
];

async function captureArchivePage(page, archiveConfig) {
  const { key, path: pagePath, title, selector, paginated } = archiveConfig;
  const posts = [];
  let currentPage = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const url = currentPage === 1 ? `${baseURL}${pagePath}` : `${baseURL}${pagePath}page/${currentPage}/`;

    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => null);

    if (!response || response.status() !== 200) {
      if (currentPage === 1) {
        console.log(`    ⚠️ ${pagePath} returned ${response?.status() || 'no response'}`);
        return { path: pagePath, title, totalCount: 0, posts: [], status: response?.status() || 0 };
      }
      break;
    }

    // 記事リンクを取得
    const items = await page.locator(selector).all();

    for (const item of items) {
      try {
        const linkElement = await item.locator('a').first();
        const href = await linkElement.getAttribute('href');

        let itemTitle = '';
        const titleLocator = item.locator('.archive__title');
        if (await titleLocator.count() > 0) {
          itemTitle = await titleLocator.textContent();
        } else {
          const imgLocator = item.locator('img');
          if (await imgLocator.count() > 0) {
            itemTitle = await imgLocator.getAttribute('alt') || '';
          }
          if (!itemTitle) {
            itemTitle = await linkElement.textContent();
          }
        }

        itemTitle = itemTitle.trim().split('\n')[0].trim();

        if (href && itemTitle) {
          posts.push({
            title: itemTitle,
            url: href,
            order: posts.length + 1,
          });
        }
      } catch (e) {
        // skip invalid items
      }
    }

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

  return {
    path: pagePath,
    title,
    totalCount: posts.length,
    posts,
    status: 200,
  };
}

async function captureTopPage(page) {
  console.log(`\n📄 Capturing: トップページ`);
  await page.goto(baseURL, { waitUntil: 'networkidle' });

  // Pick up セクション
  const pickupItems = [];
  const pickupLinks = await page.locator('main a[href*="/media-page/"]').all();
  for (const link of pickupLinks.slice(0, 5)) {
    try {
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      if (href && text && !text.includes('一覧')) {
        pickupItems.push({ title: text.trim().split('\n')[0].trim(), url: href });
      }
    } catch (e) {}
  }

  // News セクション
  const newsItems = [];
  const newsLinks = await page.locator('main a[href*="/news/"]').all();
  for (const link of newsLinks.slice(0, 5)) {
    try {
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      if (href && text && !text.includes('一覧')) {
        newsItems.push({ title: text.trim().split('\n')[0].trim(), url: href });
      }
    } catch (e) {}
  }

  console.log(`    ✅ Pick up: ${pickupItems.length}件, News: ${newsItems.length}件`);

  return {
    pickup: pickupItems,
    news: newsItems,
  };
}

async function captureNavigation(page) {
  console.log(`\n📄 Capturing: ナビゲーションリンク`);
  await page.goto(baseURL, { waitUntil: 'networkidle' });

  const headerLinks = [];
  const footerLinks = [];

  // ヘッダーナビ
  const headerNavLinks = await page.locator('header nav a, .header a').all();
  for (const link of headerNavLinks) {
    try {
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      if (href && text) {
        headerLinks.push({ title: text.trim(), url: href });
      }
    } catch (e) {}
  }

  // フッターナビ
  const footerNavLinks = await page.locator('footer a').all();
  for (const link of footerNavLinks) {
    try {
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      if (href && text) {
        footerLinks.push({ title: text.trim(), url: href });
      }
    } catch (e) {}
  }

  // 重複除去
  const uniqueHeader = [...new Map(headerLinks.map(l => [l.url, l])).values()];
  const uniqueFooter = [...new Map(footerLinks.map(l => [l.url, l])).values()];

  console.log(`    ✅ Header: ${uniqueHeader.length}件, Footer: ${uniqueFooter.length}件`);

  return {
    header: uniqueHeader,
    footer: uniqueFooter,
  };
}

async function checkStaticPages(page) {
  console.log(`\n📄 Checking: 固定ページ (${staticPages.length}件)`);
  const results = [];

  for (const staticPage of staticPages) {
    const url = `${baseURL}${staticPage.path}`;
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => null);
    const status = response?.status() || 0;

    results.push({
      path: staticPage.path,
      title: staticPage.title,
      status,
    });

    const icon = status === 200 ? '✅' : '❌';
    console.log(`    ${icon} ${staticPage.title}: ${status}`);
  }

  return results;
}

async function checkProductCategories(page) {
  console.log(`\n📄 Checking: 製品カテゴリページ (${productCategories.length}件)`);
  const results = [];

  for (const category of productCategories) {
    const url = `${baseURL}${category.path}`;
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => null);
    const status = response?.status() || 0;

    // アイテム数を取得
    let itemCount = 0;
    if (status === 200) {
      const items = await page.locator('.archive__item, .taxonomy__item').all();
      itemCount = items.length;
    }

    results.push({
      path: category.path,
      title: category.title,
      status,
      itemCount,
    });

    const icon = status === 200 ? '✅' : '❌';
    console.log(`    ${icon} ${category.title}: ${itemCount}件`);
  }

  return results;
}

async function captureSEOInfo(page) {
  console.log(`\n📄 Capturing: SEO/OGP情報`);
  const seoData = [];

  const pagesToCheck = [
    { path: '/', title: 'トップページ' },
    { path: '/product/', title: '製品情報' },
    { path: '/career/', title: '採用情報' },
    { path: '/contact/', title: 'お問い合わせ' },
  ];

  for (const pageInfo of pagesToCheck) {
    await page.goto(`${baseURL}${pageInfo.path}`, { waitUntil: 'domcontentloaded' });

    const title = await page.title();
    const description = await page.locator('meta[name="description"]').getAttribute('content').catch(() => '');
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content').catch(() => '');
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content').catch(() => '');

    seoData.push({
      path: pageInfo.path,
      pageTitle: pageInfo.title,
      title,
      description: description || null,
      ogTitle: ogTitle || null,
      ogImage: ogImage || null,
    });

    const hasDescription = description ? '✅' : '⚠️';
    const hasOgImage = ogImage ? '✅' : '⚠️';
    console.log(`    ${pageInfo.title}: desc${hasDescription} og${hasOgImage}`);
  }

  return seoData;
}

async function main() {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`📸 Capturing content snapshot`);
  console.log(`🌐 Environment: ${env}`);
  console.log(`📍 Base URL: ${baseURL}`);
  console.log(`${'='.repeat(50)}`);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const snapshot = {
    capturedAt: new Date().toISOString(),
    environment: env,
    baseURL,
    archives: {},
    topPage: null,
    navigation: null,
    staticPages: [],
    productCategories: [],
    seo: [],
    externalLinks,
  };

  // アーカイブページ
  for (const archiveConfig of archivePages) {
    console.log(`\n📄 Capturing: ${archiveConfig.title} (${archiveConfig.path})`);
    try {
      snapshot.archives[archiveConfig.key] = await captureArchivePage(page, archiveConfig);
      console.log(`    ✅ Found ${snapshot.archives[archiveConfig.key].totalCount} items`);
    } catch (error) {
      console.error(`    ❌ Error: ${error.message}`);
      snapshot.archives[archiveConfig.key] = {
        path: archiveConfig.path,
        title: archiveConfig.title,
        error: error.message,
        posts: [],
        totalCount: 0,
      };
    }
  }

  // トップページ
  snapshot.topPage = await captureTopPage(page);

  // ナビゲーション
  snapshot.navigation = await captureNavigation(page);

  // 固定ページ
  snapshot.staticPages = await checkStaticPages(page);

  // 製品カテゴリ
  snapshot.productCategories = await checkProductCategories(page);

  // SEO情報
  snapshot.seo = await captureSEOInfo(page);

  await browser.close();

  // スナップショットを保存
  const outputFileMap = {
    staging: 'content-snapshot-staging.json',
    production: 'content-snapshot-production.json',
    'docker-en': 'content-snapshot-docker-en.json',
  };
  const outputFile = outputFileMap[env] || 'content-snapshot.json';
  const outputPath = path.join(__dirname, `../test/fixtures/${outputFile}`);
  fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2), 'utf-8');

  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Snapshot saved to: ${outputPath}`);
  console.log(`\n📊 Summary:`);

  let totalArchiveItems = 0;
  for (const [key, data] of Object.entries(snapshot.archives)) {
    console.log(`  - ${data.title}: ${data.totalCount} items`);
    totalArchiveItems += data.totalCount;
  }
  console.log(`  - 固定ページ: ${snapshot.staticPages.filter(p => p.status === 200).length}/${snapshot.staticPages.length} OK`);
  console.log(`  - 製品カテゴリ: ${snapshot.productCategories.length}件`);
  console.log(`\n  📝 Total archive items: ${totalArchiveItems}`);
  console.log(`${'='.repeat(50)}\n`);
}

main().catch(console.error);
