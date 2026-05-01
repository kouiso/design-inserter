import { test } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * VRT（ビジュアルリグレッションテスト）用スクリーンショットキャプチャ
 *
 * 使い方:
 *   1. ベースライン取得（本番）: npm run vrt:baseline
 *   2. 比較対象取得（ローカル）: npm run vrt:capture
 *   3. 差分レポート生成:         npm run vrt:report
 *   4. 全部まとめて:             npm run vrt
 *
 * 環境変数:
 *   VRT_DIR   - スクリーンショット保存先サブディレクトリ（expected / actual）
 *   TEST_ENV  - テスト対象環境（local / staging / production）
 */

const vrtDir = process.env.VRT_DIR || 'actual';
const screenshotDir = path.join(process.cwd(), 'test', 'vrt', 'screenshots', vrtDir);

const pages = [
  // === メインページ ===
  { name: 'top', path: '/' },
  { name: 'product', path: '/product/' },
  { name: 'news', path: '/news/' },
  { name: 'media', path: '/media-page/' },
  { name: 'contact', path: '/contact/' },
  { name: 'document', path: '/document/' },
  { name: 'about-us', path: '/about-us/' },
  { name: 'company', path: '/company/' },
  { name: 'career', path: '/career/' },
  { name: 'sustainability', path: '/sustainability/' },

  // === 製品・技術 ===
  { name: 'featured', path: '/featured/' },
  { name: 'applications', path: '/applications/' },
  { name: 'technology', path: '/technology/' },
  { name: 'customization', path: '/customization/' },

  // === グローバル ===
  { name: 'global-network', path: '/global-network/' },

  // === ストーリー・お客様の声 ===
  { name: 'story', path: '/story/' },
  { name: 'voice', path: '/voice/' },

  // === 採用 ===
  { name: 'career-interview', path: '/career/interview/' },
  { name: 'career-faq', path: '/career-faq/' },

  // === 沿革 ===
  { name: 'history', path: '/history/' },
  { name: 'history-founding', path: '/history-founding/' },
  { name: 'history-innovation', path: '/history-innovation/' },
  { name: 'history-global', path: '/history-global/' },

  // === サステナビリティ子ページ ===
  { name: 'environment', path: '/environment/' },
  { name: 'society', path: '/society/' },
  { name: 'governance', path: '/governance/' },
  { name: 'scm', path: '/scm/' },
  { name: 'library', path: '/library/' },
  { name: 'value-creation-process', path: '/value-creation-process/' },
  { name: 'sustainable-business', path: '/sustainable-business/' },

  // === その他 ===
  { name: 'faq', path: '/faq/' },
  { name: 'privacy-policy', path: '/privacy-policy/' },
  { name: 'terms', path: '/terms/' },
  { name: 'catalog', path: '/catalog/' },
  { name: 'document-featured', path: '/document-featured/' },
];

test.describe('VRT スクリーンショットキャプチャ', () => {
  test.beforeAll(() => {
    fs.mkdirSync(screenshotDir, { recursive: true });
  });

  for (const p of pages) {
    test(`${p.name} (${p.path})`, async ({ page }) => {
      const response = await page.goto(p.path, { waitUntil: 'networkidle' });

      // 404ページはスキップ（存在しないページを差分対象にしない）
      if (response && response.status() === 404) {
        test.skip(true, `${p.path} は404のためスキップ`);
        return;
      }

      // アニメーション・トランジション無効化（差分ノイズ防止）
      await page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
            scroll-behavior: auto !important;
          }
        `,
      });

      // 遅延読み込み画像をトリガーするため全体スクロール
      await page.evaluate(async () => {
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        const height = document.body.scrollHeight;
        for (let i = 0; i < height; i += window.innerHeight) {
          window.scrollTo(0, i);
          await delay(100);
        }
        window.scrollTo(0, 0);
      });

      // GSAP delayedCallで遅延追加されるis-inviewクラスを強制的に確定させる
      // （アニメーションを待つのではなく、最終状態に倒すことで VRT を安定化）
      await page.evaluate(() => {
        document.querySelectorAll('[data-inview]').forEach(el => {
          el.classList.add('is-inview');
        });
        // GSAPのdelayedCallやtweenが残っていれば強制終了
        if (typeof gsap !== 'undefined') {
          gsap.globalTimeline.clear();
        }
      });
      // 強制付与の結果が反映されるまで auto-retry で確認
      await page.waitForFunction(() => {
        const targets = document.querySelectorAll('[data-inview]');
        return targets.length === 0 || Array.from(targets).every(el => el.classList.contains('is-inview'));
      }, { timeout: 2000 });

      // スクロールで発生した画像・アセット読み込み完了待ち
      await page.waitForLoadState('networkidle');

      await page.screenshot({
        path: path.join(screenshotDir, `${p.name}.png`),
        fullPage: true,
      });
    });
  }
});
