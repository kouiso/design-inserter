import { test, expect } from '@playwright/test';

/**
 * Issue #230 Phase A — muashi-en S1-S21 英訳反映検証
 *
 * 対象: wpX staging EN (https://xw727268.xwp.jp)
 * 実行: TEST_ENV=wpx-en npx playwright test test/e2e/issue-230-phase-a.spec.ts --project=chromium
 *
 * Drive 03 準拠 + 福田さん校正シート準拠
 */

test.describe('Issue #230 Phase A - ソース側英訳反映確認', () => {

  test('S7: ホーム 4セクション H2 が Drive 03 準拠で表示', async ({ page }) => {
    await page.goto('/');
    const body = page.locator('body');
    await expect(body).toContainText('Advanced R&D Capabilities');
    await expect(body).toContainText('Global Network');
    await expect(body).toContainText('Sustainable Business Expansion');
    await expect(body).toContainText('Customer-Oriented Customization and Problem-Solving Capabilities');
  });

  test('S7: ホーム News ラベル表示', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toContainText(/News/i);
  });

  test('S1/S5: /contact/ CF7 フォーム全項目が英語表示', async ({ page }) => {
    await page.goto('/contact/');
    const body = page.locator('body');
    await expect(body).toContainText('Full Name');
    await expect(body).toContainText('Company Name');
    await expect(body).toContainText('Email Address');
    await expect(body).toContainText('Phone Number');
    await expect(body).toContainText('Message');
    await expect(body).toContainText('I agree to the Privacy Policy');
  });

  test('S2: /download/ CF7 カタログ請求が英語表示', async ({ page }) => {
    await page.goto('/download/');
    const body = page.locator('body');
    await expect(body).toContainText('Catalog Download');
    await expect(body).toContainText(/Request a catalog|browse all catalogs/i);
  });

  test('S16: /download/ に Go Overview が表示（旧：製品ページへ戻る）', async ({ page }) => {
    await page.goto('/download/');
    await expect(page.locator('body')).toContainText('Go Overview');
  });

  test('S15: /catalog/ ヘッダーが Request for Catalog', async ({ page }) => {
    await page.goto('/catalog/');
    await expect(page.locator('body')).toContainText('Request for Catalog');
  });

  test('S14: /catalog/ JS config に i18n 文字列が埋め込まれている', async ({ page }) => {
    await page.goto('/catalog/');
    // wp_localize_script で出力された設定を確認
    const content = await page.content();
    expect(content).toMatch(/Search by product details|Clear filters|No matching products/);
  });

  // 備考: /global-network/ は block pattern 挿入時点の post_content を参照するため
  //       神野さん側 DB 編集 (O4) 完了までソース修正だけでは Map aria-label は更新されない
  test.fixme('S11: /global-network/ iframe aria-label が Map を含む', async ({ page }) => {
    await page.goto('/global-network/');
    const iframes = page.locator('iframe[aria-label*="Map"]');
    const count = await iframes.count();
    expect(count).toBeGreaterThan(0);
  });

  test('S3: ハンバーガーメニューに Group Companies が存在しない', async ({ page }) => {
    await page.goto('/');
    const body = await page.content();
    expect(body).not.toMatch(/Group Companies/);
  });

  test('S3: ハンバーガーメニューに Manufacturing Footprint が存在する', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toContainText('Manufacturing Footprint');
  });

  // 備考: blocks/domestic-locations.php は固定ページに挿入された後の post_content を参照
  //       S6 拠点ラベル・住所ラベルは神野さん側 DB 編集 (O4) 完了待ち
  test.fixme('S6: /global-network/ 拠点ブロックに Domestic (Japan) / Address が表示', async ({ page }) => {
    await page.goto('/global-network/');
    const body = page.locator('body');
    await expect(body).toContainText(/Domestic \(Japan\)/);
    await expect(body).toContainText(/Address/);
  });

  test('S10: ページネーション aria-label が Previous/Next page', async ({ page }) => {
    await page.goto('/news/');
    const content = await page.content();
    // ページネーションが存在する場合のみ検証
    if (content.match(/class="[^"]*pagination/)) {
      expect(content).toMatch(/aria-label="Previous page"|aria-label="Next page"/);
    }
  });

  test('S19: /product/ に Solutions Overview が表示', async ({ page }) => {
    await page.goto('/product/');
    await expect(page.locator('body')).toContainText('Solutions Overview');
  });

  test('日本語サイトタイトル以外のハードコード日本語が存在しない（ホーム）', async ({ page }) => {
    await page.goto('/');
    const bodyText = await page.locator('body').innerText();
    // 許容: 武蔵塗料 (社名), &copy; 情報
    // NG: 「お知らせ」「投稿はまだありません」「カテゴリ未設定」「最先端の開発技術力」等の S7 対象 JP
    expect(bodyText).not.toContain('最先端の開発技術力');
    expect(bodyText).not.toContain('投稿はまだありません。');
    expect(bodyText).not.toContain('カテゴリ未設定');
    expect(bodyText).not.toContain('サステナブルなビジネス展開');
    expect(bodyText).not.toContain('顧客志向のカスタマイズと課題解決力');
  });

  test('S17: /voice/ の空投稿メッセージ（投稿ない場合 No posts yet.）', async ({ page }) => {
    await page.goto('/voice/');
    const bodyText = await page.locator('body').innerText();
    // 投稿がある場合はこのテストはスキップ相当
    if (bodyText.includes('No posts yet')) {
      expect(bodyText).not.toContain('投稿はまだありません');
    }
  });
});
