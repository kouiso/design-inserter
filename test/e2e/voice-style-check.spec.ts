/**
 * お客様の声 詳細ページのスタイル確認テスト
 * 全voice投稿を巡回し、著者情報セクションと本文の状態を確認する
 */
import { test, expect } from '@playwright/test';

test.describe('お客様の声 詳細ページスタイル確認', () => {
  test('全voice投稿の著者情報と本文構造を確認', async ({ page }) => {
    // 一覧ページから全投稿のリンクを取得
    await page.goto('/voice/');
    await page.waitForLoadState('networkidle');

    const voiceLinks = await page.$$eval('.archive__link', (links) =>
      links.map((a) => ({
        href: (a as HTMLAnchorElement).href,
        title: a.querySelector('.archive__title')?.textContent?.trim() || '',
      }))
    );

    console.log(`\n=== voice投稿数: ${voiceLinks.length} ===\n`);

    // 各投稿を巡回して内容を確認
    for (const link of voiceLinks) {
      console.log(`\n--- ${link.title} ---`);
      console.log(`URL: ${link.href}`);

      await page.goto(link.href);
      await page.waitForLoadState('networkidle');

      // voice-metaブロックの有無
      const hasVoiceMeta = await page.$('.voice-meta');
      console.log(`voice-meta: ${hasVoiceMeta ? '✅ あり' : '❌ なし'}`);

      if (hasVoiceMeta) {
        const company = await page.$eval('.voice-meta__company', (el) => el.textContent?.trim()).catch(() => '(なし)');
        const position = await page.$eval('.voice-meta__position', (el) => el.innerHTML?.trim()).catch(() => '(なし)');
        const person = await page.$eval('.voice-meta__person', (el) => el.textContent?.trim()).catch(() => '(なし)');
        console.log(`  会社: ${company}`);
        console.log(`  役職: ${position}`);
        console.log(`  氏名: ${person}`);
      }

      // the_content()の中身を確認
      const contentHtml = await page.$eval('.single__contents', (el) => el.innerHTML?.trim()).catch(() => '(なし)');

      // ショートコード残留チェック
      const hasShortcodeResidue = contentHtml?.includes('[voice_field') || false;
      console.log(`ショートコード残留: ${hasShortcodeResidue ? '⚠️ あり' : '✅ なし'}`);

      // voice_field出力（プレーンテキスト）が本文先頭に残っているかチェック  
      // ショートコードが空を返す場合、テキストノードとして残らないはず
      const firstChildType = await page.$eval('.single__contents', (el) => {
        const firstChild = el.firstChild;
        if (!firstChild) return 'empty';
        if (firstChild.nodeType === 3) return `text: "${firstChild.textContent?.trim().substring(0, 50)}"`;
        return `element: <${(firstChild as Element).tagName?.toLowerCase()}> class="${(firstChild as Element).className}"`;
      }).catch(() => '(取得失敗)');
      console.log(`本文先頭: ${firstChildType}`);

      // h2見出しの一覧
      const headings = await page.$$eval('.single__contents h2', (els) =>
        els.map((el) => el.textContent?.trim() || '')
      );
      console.log(`見出し(h2): ${headings.length > 0 ? headings.join(' / ') : '(なし)'}`);

      // ページタイトル（h1）
      const pageTitle = await page.$eval('.page__title', (el) => el.textContent?.trim()).catch(() => '(なし)');
      console.log(`h1タイトル: ${pageTitle}`);

      // voice-metaのスタイル確認
      if (hasVoiceMeta) {
        const metaStyles = await page.$eval('.voice-meta', (el) => {
          const cs = window.getComputedStyle(el);
          return {
            bgColor: cs.backgroundColor,
            padding: cs.padding,
            borderRadius: cs.borderRadius,
            marginBottom: cs.marginBottom,
          };
        });
        console.log(`  meta styles: bg=${metaStyles.bgColor}, padding=${metaStyles.padding}, radius=${metaStyles.borderRadius}, mb=${metaStyles.marginBottom}`);
      }

      // ページ全体のスクリーンショット（上部のみ）
      await page.screenshot({
        path: `test/screenshots/voice-detail-${link.title.substring(0, 20).replace(/[\/\\:*?"<>|]/g, '_')}.png`,
        clip: { x: 0, y: 0, width: 1280, height: 900 },
      });
    }
  });
});
