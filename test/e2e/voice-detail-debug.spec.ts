/**
 * voice詳細ページの空段落と幅問題を詳細確認
 */
import { test } from '@playwright/test';

test('voice詳細ページの空段落と幅問題を確認', async ({ page }) => {
  // 1つ目のvoice投稿で確認
  await page.goto('/voice/%e5%86%85%e8%a3%85%e5%8a%a0%e9%a3%be%e8%89%b2%e9%96%8b%e7%99%ba%e3%81%ae%e6%9c%80%e9%87%8d%e8%a6%81%e3%83%91%e3%83%bc%e3%83%88%e3%83%8a%e3%83%bc/');
  await page.waitForLoadState('networkidle');

  // single__contentsの全HTMLを取得（空段落の確認）
  const contentHtml = await page.$eval('.single__contents', (el) => el.innerHTML);
  console.log('\n=== single__contents HTML（先頭500文字） ===');
  console.log(contentHtml.substring(0, 500));

  // 空の<p>タグを数える
  const emptyParagraphs = contentHtml.match(/<p>\s*<\/p>/g);
  console.log(`\n空の<p>タグ数: ${emptyParagraphs ? emptyParagraphs.length : 0}`);
  if (emptyParagraphs) {
    console.log('空の<p>タグ:', emptyParagraphs);
  }

  // 全<p>タグの内容を確認
  const allParagraphs = await page.$$eval('.single__contents > p', (ps) =>
    ps.map((p, i) => ({
      index: i,
      text: p.textContent?.trim().substring(0, 80) || '',
      html: p.innerHTML?.trim().substring(0, 80) || '',
      isEmpty: p.textContent?.trim() === '',
    }))
  );
  console.log('\n=== 全段落 ===');
  allParagraphs.forEach((p) => {
    console.log(`[${p.index}] ${p.isEmpty ? '⚠️空' : '✅'} text="${p.text}" html="${p.html}"`);
  });

  // page__containerの実際のサイズ
  const containerInfo = await page.$eval('.page__container', (el) => {
    const rect = el.getBoundingClientRect();
    const cs = window.getComputedStyle(el);
    return {
      width: rect.width,
      left: rect.left,
      right: rect.right,
      bgColor: cs.backgroundColor,
      paddingLeft: cs.paddingLeft,
      maxWidth: cs.maxWidth,
      computedWidth: cs.width,
    };
  });
  console.log('\n=== page__container ===');
  console.log(JSON.stringify(containerInfo, null, 2));

  // page__wrapperのサイズ
  const wrapperInfo = await page.$eval('.page__wrapper', (el) => {
    const rect = el.getBoundingClientRect();
    return {
      width: rect.width,
      left: rect.left,
      right: rect.right,
    };
  });
  console.log('\n=== page__wrapper ===');
  console.log(JSON.stringify(wrapperInfo, null, 2));

  // ビューポートサイズ
  const viewport = page.viewportSize();
  console.log(`\nViewport: ${viewport?.width}x${viewport?.height}`);

  // 右端の緑背景が見える範囲
  const bgMainInfo = await page.$eval('.page__bg-main', (el) => {
    const rect = el.getBoundingClientRect();
    const cs = window.getComputedStyle(el);
    return {
      width: rect.width,
      left: rect.left,
      right: rect.right,
      bgColor: cs.backgroundColor,
    };
  });
  console.log('\n=== page__bg-main（緑背景） ===');
  console.log(JSON.stringify(bgMainInfo, null, 2));

  // 2つ目のvoice投稿でも本文の空段落を確認
  await page.goto('/voice/%e6%9c%ac%e5%bd%93%e3%81%ae%e3%83%97%e3%83%ad%e3%83%95%e3%82%a7%e3%83%83%e3%82%b7%e3%83%a7%e3%83%8a%e3%83%ab/');
  await page.waitForLoadState('networkidle');
  const content2 = await page.$eval('.single__contents', (el) => el.innerHTML);
  console.log('\n=== 「本当のプロフェッショナル」の先頭500文字 ===');
  console.log(content2.substring(0, 500));

  const emptyP2 = content2.match(/<p>\s*<\/p>/g);
  console.log(`\n空の<p>タグ数: ${emptyP2 ? emptyP2.length : 0}`);
});
