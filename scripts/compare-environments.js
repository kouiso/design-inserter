/**
 * ステージングと本番のコンテンツ差分比較スクリプト
 *
 * 使い方:
 *   node scripts/compare-environments.js --user=<ユーザー名> --pass=<パスワード>
 *
 * 出力:
 *   test/fixtures/content-snapshot-production.json
 *   test/fixtures/content-snapshot-staging.json
 *   コンソールに差分レポート
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const PROD_URL = 'https://musashipaint.xsrv.jp';
const STAGING_URL = 'https://musashipaint.xsrv.jp/staging';

// Basic認証（--user=xxx --pass=xxx）
const userArg = process.argv.find(arg => arg.startsWith('--user='));
const passArg = process.argv.find(arg => arg.startsWith('--pass='));
const authUser = userArg ? userArg.split('=').slice(1).join('=') : null;
const authPass = passArg ? passArg.split('=').slice(1).join('=') : null;

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

// 固定ページ
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

async function captureArchivePage(page, baseURL, archiveConfig) {
  const { key, path: pagePath, title, selector, paginated } = archiveConfig;
  const posts = [];
  let currentPage = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const url = currentPage === 1 ? `${baseURL}${pagePath}` : `${baseURL}${pagePath}page/${currentPage}/`;
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => null);

    if (!response || response.status() !== 200) {
      if (currentPage === 1) {
        return { path: pagePath, title, totalCount: 0, posts: [], status: response?.status() || 0 };
      }
      break;
    }

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
        console.error(`captureArchivePage: ${e.message}`);
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

  return { path: pagePath, title, totalCount: posts.length, posts, status: 200 };
}

async function captureTopPage(page, baseURL) {
  await page.goto(baseURL, { waitUntil: 'networkidle' });

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

  return { pickup: pickupItems, news: newsItems };
}

async function captureNavigation(page, baseURL) {
  await page.goto(baseURL, { waitUntil: 'networkidle' });

  const headerLinks = [];
  const footerLinks = [];

  const headerNavLinks = await page.locator('header nav a, .header a').all();
  for (const link of headerNavLinks) {
    try {
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      if (href && text) headerLinks.push({ title: text.trim(), url: href });
    } catch (e) {}
  }

  const footerNavLinks = await page.locator('footer a').all();
  for (const link of footerNavLinks) {
    try {
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      if (href && text) footerLinks.push({ title: text.trim(), url: href });
    } catch (e) {}
  }

  return {
    header: [...new Map(headerLinks.map(l => [l.url, l])).values()],
    footer: [...new Map(footerLinks.map(l => [l.url, l])).values()],
  };
}

async function checkStaticPages(page, baseURL) {
  const results = [];
  for (const staticPage of staticPages) {
    const url = `${baseURL}${staticPage.path}`;
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => null);
    results.push({ path: staticPage.path, title: staticPage.title, status: response?.status() || 0 });
  }
  return results;
}

async function checkProductCategories(page, baseURL) {
  const results = [];
  for (const category of productCategories) {
    const url = `${baseURL}${category.path}`;
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => null);
    const status = response?.status() || 0;
    let itemCount = 0;
    if (status === 200) {
      const items = await page.locator('.archive__item, .taxonomy__item').all();
      itemCount = items.length;
    }
    results.push({ path: category.path, title: category.title, status, itemCount });
  }
  return results;
}

async function captureSEOInfo(page, baseURL) {
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
  }
  return seoData;
}

async function captureSnapshot(envName, baseURL, contextOptions) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`📸 Capturing: ${envName}`);
  console.log(`📍 URL: ${baseURL}`);
  console.log(`${'='.repeat(50)}`);

  const browser = await chromium.launch();
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  const snapshot = {
    capturedAt: new Date().toISOString(),
    environment: envName,
    baseURL,
    archives: {},
    topPage: null,
    navigation: null,
    staticPages: [],
    productCategories: [],
    seo: [],
    externalLinks,
  };

  for (const archiveConfig of archivePages) {
    console.log(`  📄 ${archiveConfig.title} (${archiveConfig.path})`);
    try {
      snapshot.archives[archiveConfig.key] = await captureArchivePage(page, baseURL, archiveConfig);
      console.log(`     ✅ ${snapshot.archives[archiveConfig.key].totalCount} items`);
    } catch (error) {
      console.error(`     ❌ ${error.message}`);
      snapshot.archives[archiveConfig.key] = {
        path: archiveConfig.path, title: archiveConfig.title,
        error: error.message, posts: [], totalCount: 0,
      };
    }
  }

  console.log(`  📄 トップページ`);
  snapshot.topPage = await captureTopPage(page, baseURL);
  console.log(`     ✅ Pickup: ${snapshot.topPage.pickup.length}, News: ${snapshot.topPage.news.length}`);

  console.log(`  📄 ナビゲーション`);
  snapshot.navigation = await captureNavigation(page, baseURL);

  console.log(`  📄 固定ページ`);
  snapshot.staticPages = await checkStaticPages(page, baseURL);
  console.log(`     ✅ ${snapshot.staticPages.filter(p => p.status === 200).length}/${snapshot.staticPages.length} OK`);

  console.log(`  📄 製品カテゴリ`);
  snapshot.productCategories = await checkProductCategories(page, baseURL);

  console.log(`  📄 SEO/OGP`);
  snapshot.seo = await captureSEOInfo(page, baseURL);

  await browser.close();
  return snapshot;
}

// URLからパスを抽出（比較用に正規化、/staging/ プレフィックスを除去）
function extractPath(url) {
  try {
    const parsed = new URL(url);
    let pathname = decodeURIComponent(parsed.pathname);
    // /staging/ プレフィックスを除去して比較可能にする
    pathname = pathname.replace(/^\/staging\//, '/').replace(/^\/staging$/, '/');
    return pathname;
  } catch {
    let p = url;
    p = p.replace(/^\/staging\//, '/').replace(/^\/staging$/, '/');
    return p;
  }
}

function compareSnapshots(prod, staging) {
  const diffs = [];

  // アーカイブページ比較
  for (const [key, prodData] of Object.entries(prod.archives)) {
    const stagingData = staging.archives[key];
    if (!stagingData) {
      diffs.push({ section: 'archives', key, type: 'missing_in_staging', detail: `${prodData.title}がstagingに存在しません` });
      continue;
    }

    // 記事数の比較
    if (prodData.totalCount !== stagingData.totalCount) {
      diffs.push({
        section: 'archives', key, type: 'count_mismatch',
        detail: `${prodData.title}: prod=${prodData.totalCount}件, staging=${stagingData.totalCount}件`,
      });
    }

    // 個別記事の比較
    const prodUrls = new Set(prodData.posts.map(p => extractPath(p.url)));
    const stagingUrls = new Set(stagingData.posts.map(p => extractPath(p.url)));

    // prodにあってstagingにない
    for (const post of prodData.posts) {
      const postPath = extractPath(post.url);
      if (!stagingUrls.has(postPath)) {
        diffs.push({
          section: 'archives', key, type: 'missing_in_staging',
          detail: `${prodData.title}: 「${post.title}」がstagingにありません (${postPath})`,
        });
      }
    }

    // stagingにあってprodにない
    for (const post of stagingData.posts) {
      const postPath = extractPath(post.url);
      if (!prodUrls.has(postPath)) {
        diffs.push({
          section: 'archives', key, type: 'missing_in_prod',
          detail: `${stagingData.title}: 「${post.title}」がprodにありません (${postPath})`,
        });
      }
    }

    // タイトルの比較（同じURLの記事）
    for (const prodPost of prodData.posts) {
      const prodPath = extractPath(prodPost.url);
      const stagingPost = stagingData.posts.find(p => extractPath(p.url) === prodPath);
      if (stagingPost && prodPost.title !== stagingPost.title) {
        diffs.push({
          section: 'archives', key, type: 'title_mismatch',
          detail: `${prodData.title}: タイトル不一致\n    prod:    「${prodPost.title}」\n    staging: 「${stagingPost.title}」`,
        });
      }
    }

    // 順序の比較
    const prodOrderedUrls = prodData.posts.map(p => extractPath(p.url));
    const stagingOrderedUrls = stagingData.posts.map(p => extractPath(p.url));
    if (prodOrderedUrls.length === stagingOrderedUrls.length) {
      for (let i = 0; i < prodOrderedUrls.length; i++) {
        if (prodOrderedUrls[i] !== stagingOrderedUrls[i]) {
          diffs.push({
            section: 'archives', key, type: 'order_mismatch',
            detail: `${prodData.title}: ${i + 1}番目が異なります\n    prod:    ${prodOrderedUrls[i]}\n    staging: ${stagingOrderedUrls[i]}`,
          });
          break;
        }
      }
    }
  }

  // stagingにあってprodにないアーカイブ
  for (const key of Object.keys(staging.archives)) {
    if (!prod.archives[key]) {
      diffs.push({ section: 'archives', key, type: 'missing_in_prod', detail: `${staging.archives[key].title}がprodに存在しません` });
    }
  }

  // 固定ページ比較
  for (const prodPage of prod.staticPages) {
    const stagingPage = staging.staticPages.find(p => p.path === prodPage.path);
    if (!stagingPage) {
      diffs.push({ section: 'staticPages', type: 'missing_in_staging', detail: `${prodPage.title} (${prodPage.path})` });
    } else if (prodPage.status !== stagingPage.status) {
      diffs.push({
        section: 'staticPages', type: 'status_mismatch',
        detail: `${prodPage.title}: prod=${prodPage.status}, staging=${stagingPage.status}`,
      });
    }
  }

  // 製品カテゴリ比較
  for (const prodCat of prod.productCategories) {
    const stagingCat = staging.productCategories.find(c => c.path === prodCat.path);
    if (!stagingCat) {
      diffs.push({ section: 'productCategories', type: 'missing_in_staging', detail: `${prodCat.title} (${prodCat.path})` });
    } else if (prodCat.itemCount !== stagingCat.itemCount) {
      diffs.push({
        section: 'productCategories', type: 'count_mismatch',
        detail: `${prodCat.title}: prod=${prodCat.itemCount}件, staging=${stagingCat.itemCount}件`,
      });
    }
  }

  // トップページ比較
  if (prod.topPage && staging.topPage) {
    if (prod.topPage.pickup.length !== staging.topPage.pickup.length) {
      diffs.push({
        section: 'topPage', type: 'pickup_count_mismatch',
        detail: `Pick up: prod=${prod.topPage.pickup.length}件, staging=${staging.topPage.pickup.length}件`,
      });
    }
    if (prod.topPage.news.length !== staging.topPage.news.length) {
      diffs.push({
        section: 'topPage', type: 'news_count_mismatch',
        detail: `News: prod=${prod.topPage.news.length}件, staging=${staging.topPage.news.length}件`,
      });
    }

    // Pickup記事の比較
    for (let i = 0; i < Math.max(prod.topPage.pickup.length, staging.topPage.pickup.length); i++) {
      const p = prod.topPage.pickup[i];
      const s = staging.topPage.pickup[i];
      if (p && !s) {
        diffs.push({ section: 'topPage', type: 'pickup_missing_staging', detail: `Pickup ${i + 1}: 「${p.title}」がstagingにない` });
      } else if (!p && s) {
        diffs.push({ section: 'topPage', type: 'pickup_missing_prod', detail: `Pickup ${i + 1}: 「${s.title}」がprodにない` });
      } else if (p && s && p.title !== s.title) {
        diffs.push({ section: 'topPage', type: 'pickup_title_mismatch', detail: `Pickup ${i + 1}: prod「${p.title}」 vs staging「${s.title}」` });
      }
    }

    // News記事の比較
    for (let i = 0; i < Math.max(prod.topPage.news.length, staging.topPage.news.length); i++) {
      const p = prod.topPage.news[i];
      const s = staging.topPage.news[i];
      if (p && !s) {
        diffs.push({ section: 'topPage', type: 'news_missing_staging', detail: `News ${i + 1}: 「${p.title}」がstagingにない` });
      } else if (!p && s) {
        diffs.push({ section: 'topPage', type: 'news_missing_prod', detail: `News ${i + 1}: 「${s.title}」がprodにない` });
      } else if (p && s && p.title !== s.title) {
        diffs.push({ section: 'topPage', type: 'news_title_mismatch', detail: `News ${i + 1}: prod「${p.title}」 vs staging「${s.title}」` });
      }
    }
  }

  // SEO比較
  for (const prodSeo of prod.seo) {
    const stagingSeo = staging.seo.find(s => s.path === prodSeo.path);
    if (!stagingSeo) {
      diffs.push({ section: 'seo', type: 'missing_in_staging', detail: `${prodSeo.pageTitle} (${prodSeo.path})` });
    } else {
      if (prodSeo.title !== stagingSeo.title) {
        diffs.push({
          section: 'seo', type: 'title_mismatch',
          detail: `${prodSeo.pageTitle}: title\n    prod:    「${prodSeo.title}」\n    staging: 「${stagingSeo.title}」`,
        });
      }
      if (prodSeo.description !== stagingSeo.description) {
        diffs.push({
          section: 'seo', type: 'description_mismatch',
          detail: `${prodSeo.pageTitle}: description が異なります`,
        });
      }
    }
  }

  return diffs;
}

async function main() {
  console.log('\n🔍 ステージング vs 本番 コンテンツ比較');
  console.log(`   Production: ${PROD_URL}`);
  console.log(`   Staging:    ${STAGING_URL}`);
  if (authUser) console.log(`   🔑 Basic auth: ${authUser}`);

  // 本番スナップショット取得
  const prodSnapshot = await captureSnapshot('production', PROD_URL, {});

  // ステージングスナップショット取得（Basic認証付き）
  const stagingContextOptions = {};
  if (authUser && authPass) {
    stagingContextOptions.httpCredentials = { username: authUser, password: authPass };
  }
  const stagingSnapshot = await captureSnapshot('staging', STAGING_URL, stagingContextOptions);

  // スナップショット保存
  const fixturesDir = path.join(__dirname, '../test/fixtures');
  fs.writeFileSync(path.join(fixturesDir, 'content-snapshot-production.json'), JSON.stringify(prodSnapshot, null, 2), 'utf-8');
  fs.writeFileSync(path.join(fixturesDir, 'content-snapshot-staging.json'), JSON.stringify(stagingSnapshot, null, 2), 'utf-8');

  // 差分比較
  const diffs = compareSnapshots(prodSnapshot, stagingSnapshot);

  // レポート出力
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 差分レポート');
  console.log(`${'='.repeat(60)}`);

  if (diffs.length === 0) {
    console.log('\n✅ 差分なし！ステージングと本番は完全に一致しています。');
  } else {
    console.log(`\n❌ ${diffs.length}件の差分を検出しました:\n`);

    // セクション別にグループ化
    const grouped = {};
    for (const diff of diffs) {
      const section = diff.section;
      if (!grouped[section]) grouped[section] = [];
      grouped[section].push(diff);
    }

    for (const [section, sectionDiffs] of Object.entries(grouped)) {
      console.log(`\n--- ${section} (${sectionDiffs.length}件) ---`);
      for (const diff of sectionDiffs) {
        console.log(`  [${diff.type}] ${diff.detail}`);
      }
    }
  }

  // サマリー
  console.log(`\n${'='.repeat(60)}`);
  console.log('📋 サマリー');
  console.log(`${'='.repeat(60)}`);

  let prodTotal = 0, stagingTotal = 0;
  for (const [key, data] of Object.entries(prodSnapshot.archives)) {
    const sData = stagingSnapshot.archives[key];
    const pCount = data.totalCount;
    const sCount = sData ? sData.totalCount : 0;
    const mark = pCount === sCount ? '✅' : '❌';
    console.log(`  ${mark} ${data.title}: prod=${pCount}, staging=${sCount}`);
    prodTotal += pCount;
    stagingTotal += sCount;
  }
  console.log(`  📝 合計: prod=${prodTotal}, staging=${stagingTotal}`);

  const prodStaticOK = prodSnapshot.staticPages.filter(p => p.status === 200).length;
  const stagingStaticOK = stagingSnapshot.staticPages.filter(p => p.status === 200).length;
  const staticMark = prodStaticOK === stagingStaticOK ? '✅' : '❌';
  console.log(`  ${staticMark} 固定ページ: prod=${prodStaticOK}/${prodSnapshot.staticPages.length}, staging=${stagingStaticOK}/${stagingSnapshot.staticPages.length}`);

  console.log(`\n  差分総数: ${diffs.length}件`);
  console.log(`${'='.repeat(60)}\n`);

  // 差分レポートをJSONファイルにも保存
  const reportPath = path.join(fixturesDir, 'environment-diff-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    comparedAt: new Date().toISOString(),
    productionURL: PROD_URL,
    stagingURL: STAGING_URL,
    totalDiffs: diffs.length,
    diffs,
    summary: {
      prodArchiveTotal: prodTotal,
      stagingArchiveTotal: stagingTotal,
      prodStaticOK,
      stagingStaticOK,
    },
  }, null, 2), 'utf-8');
  console.log(`📄 差分レポート保存: ${reportPath}`);
}

main().catch(console.error);
