import { test, expect } from '@playwright/test';

/**
 * フッターレイアウトのE2Eテスト
 * - PCビューでのリンク配置確認
 * - モバイルビューでのレイアウト確認
 * - 「よくある質問」リンクの配置確認
 * - リンクの動作確認
 */

test.describe('フッター - PCレイアウト', () => {

  test('PCビューでPCフッターが表示される', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    // PCフッターナビゲーションが表示されることを確認
    const pcFooterNav = page.locator('.footer__nav--pc');
    await expect(pcFooterNav).toBeVisible();

    // SPフッターが非表示であることを確認
    const spFooterNav = page.locator('.footer__nav--sp');
    const isSpVisible = await spFooterNav.isVisible();
    expect(isSpVisible).toBe(false);
  });

  test('PCビューで「よくある質問」リンクが採用セクションに表示される', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    // PCフッターナビゲーションを確認
    const pcFooterNav = page.locator('.footer__nav--pc');
    await expect(pcFooterNav).toBeVisible();

    // 採用情報セクション（その他セクション）を確認
    const otherSection = pcFooterNav.locator('.footer__nav-pc-other-section');
    await expect(otherSection).toBeVisible();

    // よくある質問リンクが採用セクション内に存在するか
    const faqLink = otherSection.locator('a[href*="/faq"]');
    await expect(faqLink).toBeVisible();

    // リンクのテキストを確認
    const linkText = await faqLink.textContent();
    expect(linkText).toContain('よくあるご質問');
  });

  test('PCビューで「よくある質問」リンクをクリックできる', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    // よくある質問リンクを見つける
    const faqLink = page.locator('.footer__nav--pc a[href*="/faq"]');
    await expect(faqLink).toBeVisible();

    // リンクをクリック
    await faqLink.click();
    await page.waitForLoadState('networkidle');

    // FAQページに遷移することを確認
    await expect(page).toHaveURL(/\/faq/);

    // 404エラーでないことを確認
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).not.toContain('404');
    expect(bodyText).not.toContain('ページが見つかりません');
  });

  test('PCフッターに製品情報セクションが表示される', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const pcFooterNav = page.locator('.footer__nav--pc');

    // 製品情報セクション
    const productSection = pcFooterNav.locator('.footer__nav-pc-section').first();
    await expect(productSection).toBeVisible();

    // 製品についてのタイトル
    const productTitle = productSection.locator('.footer__nav-pc-title');
    const titleText = await productTitle.textContent();
    expect(titleText).toContain('製品');
  });

  test('PCフッターに私たちについてセクションが表示される', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const pcFooterNav = page.locator('.footer__nav--pc');

    // 私たちについてセクション
    const aboutSection = pcFooterNav.locator('.footer__nav-pc-section').nth(1);
    await expect(aboutSection).toBeVisible();

    // 私たちについてのタイトル
    const aboutTitle = aboutSection.locator('.footer__nav-pc-title');
    const titleText = await aboutTitle.textContent();
    expect(titleText).toContain('私たち');
  });

  test('PCフッターに採用情報・ニュース等のリンクが表示される', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const pcFooterNav = page.locator('.footer__nav--pc');
    const otherSection = pcFooterNav.locator('.footer__nav-pc-other-section');

    // ニュースリンク
    const newsLink = otherSection.locator('a[href*="/news"]');
    await expect(newsLink).toBeVisible();

    // 採用情報リンク（末尾一致で絞り込み、フルURL対応）
    const careerLink = otherSection.locator('a[href$="/career/"]');
    await expect(careerLink).toBeVisible();
  });

  test('PCフッターにお問い合わせリンクが表示される', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const pcFooterNav = page.locator('.footer__nav--pc');
    const otherSection = pcFooterNav.locator('.footer__nav-pc-other-section');

    // お問い合わせリンク
    const contactLink = otherSection.locator('a[href*="/contact"]');
    await expect(contactLink).toBeVisible();

    // リンクテキストを確認
    const linkText = await contactLink.textContent();
    expect(linkText).toMatch(/お問い合わせ/);
  });

  test('PCフッターにカタログダウンロードリンクが表示される', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const pcFooterNav = page.locator('.footer__nav--pc');
    const otherSection = pcFooterNav.locator('.footer__nav-pc-other-section');

    // カタログダウンロードリンク
    const downloadLink = otherSection.locator('a[href*="/download"]');
    await expect(downloadLink).toBeVisible();

    // リンクテキストを確認
    const linkText = await downloadLink.textContent();
    expect(linkText).toMatch(/カタログ/);
  });

  test('PCフッターにSNSリンクが表示される', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    // SNSリスト（PC版）
    const snsListPc = page.locator('.footer__sns-list--pc');

    if (await snsListPc.count() > 0) {
      await expect(snsListPc).toBeVisible();

      // LinkedIn
      const linkedinLink = snsListPc.locator('a[href*="linkedin"]');
      await expect(linkedinLink).toBeVisible();

      // Instagram
      const instagramLink = snsListPc.locator('a[href*="instagram"]');
      await expect(instagramLink).toBeVisible();

      // Facebook
      const facebookLink = snsListPc.locator('a[href*="facebook"]');
      await expect(facebookLink).toBeVisible();
    }
  });
});

test.describe('フッター - モバイルレイアウト', () => {

  test('モバイルビューでSPフッターが表示される', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // SPフッターナビゲーションが表示されることを確認
    const spFooterNav = page.locator('.footer__nav--sp');
    await expect(spFooterNav).toBeVisible();

    // PCフッターが非表示であることを確認
    const pcFooterNav = page.locator('.footer__nav--pc');
    const isPcVisible = await pcFooterNav.isVisible();
    expect(isPcVisible).toBe(false);
  });

  test('モバイルビューで「よくある質問」リンクが表示される', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const spFooterNav = page.locator('.footer__nav--sp');
    await expect(spFooterNav).toBeVisible();

    // よくある質問リンクが存在するか（SPフッター内）
    const faqLink = spFooterNav.locator('a[href*="/faq"]');
    await expect(faqLink).toBeVisible();

    // リンクのテキストを確認
    const linkText = await faqLink.textContent();
    expect(linkText).toContain('よくあるご質問');
  });

  test('モバイルビューでフッターアコーディオンが機能する', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const spFooterNav = page.locator('.footer__nav--sp');

    // アコーディオンボタンが存在するか確認
    const accordionButton = spFooterNav.locator('.js-accordion-button').first();

    if (await accordionButton.count() > 0) {
      await expect(accordionButton).toBeVisible();

      // アコーディオンをクリック
      await accordionButton.click();
      await page.waitForTimeout(600); // アニメーション待機（CSSトランジション0.5秒）

      // アコーディオンリストが表示されることを確認
      const accordionList = page.locator('.js-accordion-list').first();
      const isVisible = await accordionList.isVisible();
      expect(isVisible).toBe(true);
    }
  });

  test('モバイルビューでSNSリンクが表示される', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const spFooterNav = page.locator('.footer__nav--sp');

    // SNSリスト（モバイル版）
    const snsList = spFooterNav.locator('.footer__sns-list');
    await expect(snsList).toBeVisible();

    // 各SNSリンクが存在することを確認
    const linkedinLink = snsList.locator('a[href*="linkedin"]');
    await expect(linkedinLink).toBeVisible();

    const instagramLink = snsList.locator('a[href*="instagram"]');
    await expect(instagramLink).toBeVisible();

    const facebookLink = snsList.locator('a[href*="facebook"]');
    await expect(facebookLink).toBeVisible();
  });

  test('モバイルビューでお問い合わせリンクが表示される', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const spFooterNav = page.locator('.footer__nav--sp');

    // お問い合わせリンク
    const contactLink = spFooterNav.locator('a[href*="/contact"]');
    await expect(contactLink).toBeVisible();
  });

  test('モバイルビューでカタログダウンロードリンクが表示される', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const spFooterNav = page.locator('.footer__nav--sp');

    // カタログダウンロードリンク
    const downloadLink = spFooterNav.locator('a[href*="/download"]');
    await expect(downloadLink).toBeVisible();
  });
});

test.describe('フッター - 共通要素', () => {

  test('フッターロゴ（アイコン）が表示される', async ({ page }) => {
    await page.goto('/');

    // フッターアイコン
    const footerIcon = page.locator('.footer__icon');
    await expect(footerIcon).toBeVisible();

    // SVG要素が含まれていることを確認
    const iconSvg = footerIcon.locator('svg');
    await expect(iconSvg).toBeVisible();
  });

  test('フッターにプライバシーポリシーと利用規約のリンクが表示される', async ({ page }) => {
    await page.goto('/');

    // プライバシーポリシー
    const privacyLink = page.locator('a[href*="privacy"]');
    await expect(privacyLink.first()).toBeVisible();

    // 利用規約
    const termsLink = page.locator('a[href*="terms"]');
    await expect(termsLink.first()).toBeVisible();
  });

  test('フッターにコピーライトが表示される', async ({ page }) => {
    await page.goto('/');

    // コピーライト
    const copyright = page.locator('.footer__copyright');
    await expect(copyright).toBeVisible();

    // テキストを確認
    const copyrightText = await copyright.textContent();
    expect(copyrightText).toContain('Musashi Paint');
    expect(copyrightText).toContain('All Rights Reserved');
  });

  test('フッターにウェーブ装飾が表示される', async ({ page }) => {
    await page.goto('/');

    // ウェーブ装飾
    const wave = page.locator('.footer__wave');
    await expect(wave).toBeVisible();

    // SVG要素が含まれていることを確認（デフォルトビューポートはPC幅）
    const waveSvg = wave.locator('.wave__pc svg');
    await expect(waveSvg).toBeVisible();
  });

  test('ページトップボタンが表示される', async ({ page }) => {
    await page.goto('/');

    // ページトップボタン
    const pageTop = page.locator('.p-pageTop');

    // 要素が存在することを確認（初期状態では非表示の可能性あり）
    const pageTopCount = await pageTop.count();
    expect(pageTopCount).toBeGreaterThan(0);
  });
});

test.describe('フッター - レスポンシブ対応', () => {

  test('タブレットサイズでも適切に表示される', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // フッター全体が表示されることを確認
    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();

    // SPまたはPCフッターのいずれかが表示されていることを確認
    const spFooterNav = page.locator('.footer__nav--sp');
    const pcFooterNav = page.locator('.footer__nav--pc');

    const spVisible = await spFooterNav.isVisible();
    const pcVisible = await pcFooterNav.isVisible();

    // 少なくとも一方が表示されていることを確認
    expect(spVisible || pcVisible).toBe(true);
  });

  test('大画面サイズでも適切に表示される', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    // PCフッターが表示されることを確認
    const pcFooterNav = page.locator('.footer__nav--pc');
    await expect(pcFooterNav).toBeVisible();

    // レイアウトが崩れていないか確認
    const footer = page.locator('.footer');
    const footerBox = await footer.boundingBox();

    if (footerBox) {
      // フッターの幅が画面幅と同じであることを確認
      expect(footerBox.width).toBe(1920);
    }
  });
});
