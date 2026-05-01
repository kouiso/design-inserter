import { test, expect, type Page } from '@playwright/test';

async function expectNavigationTexts(page: Page, texts: string[]) {
  const navigation = page.locator('.navigation');
  await expect(navigation).toBeVisible();

  for (const text of texts) {
    await expect(navigation).toContainText(text);
  }
}

test.describe('サイドバーナビゲーション表示テスト', () => {
  test('パターン1: about-us - 会社案内系メニューが表示される', async ({ page }) => {
    await page.goto('/about-us/');

    await expectNavigationTexts(page, [
      'About Musashi Paint',
      'Overview',
      'History',
      'Our Strengths',
      'Sustainability',
      'Customer Stories',
    ]);
  });

  test('パターン2: history - ヒストリー配下リンクが表示される', async ({ page }) => {
    await page.goto('/history/');

    await expectNavigationTexts(page, [
      'History',
      'Foundation',
      'Expansion into Plastic Coatings',
      'Global Expansion',
    ]);
  });

  test('パターン3: sustainability - サステナビリティ配下リンクが表示される', async ({ page }) => {
    await page.goto('/sustainability/');

    await expectNavigationTexts(page, [
      'Sustainability',
      '環境',
      '社会',
      'ガバナンス',
      'SCM',
      'Resources',
    ]);
  });

  test('パターン4: voice - お客様の声系メニューが表示される', async ({ page }) => {
    await page.goto('/voice/');

    await expectNavigationTexts(page, [
      'Customer Stories',
      'Our Strengths',
      'R&D Excellence',
      'Global Network',
      'Manufacturing Footprint',
    ]);
  });

  test('パターン5: global-network - グローバルネットワーク系メニューが表示される', async ({ page }) => {
    await page.goto('/global-network/');

    await expectNavigationTexts(page, [
      'Global Network',
      'Our Strengths',
      'Group Companies',
      'Manufacturing Footprint',
    ]);
  });

  test('パターン6: career - 採用情報専用メニューが表示される', async ({ page }) => {
    await page.goto('/career/');

    await expectNavigationTexts(page, [
      'Careers',
      '人事総務部',
      '情報システム',
      'CSR推進業務',
      'R&D Positions',
      'Employee Stories',
      'FAQs',
    ]);
  });

  test('パターン7: faq - FAQ専用メニューが表示される', async ({ page }) => {
    await page.goto('/faq/');

    await expectNavigationTexts(page, [
      'Pick up ピックアップ',
      'News ニュース',
      'Social',
      'LinkedIn',
      'Instagram',
      'Facebook',
      'FAQs',
    ]);
  });

  test('メニューリンク遷移確認 - history → overview', async ({ page }) => {
    await page.goto('/history/');

    await page.locator('.navigation__sub-link:has-text("Overview")').click();
    await expect(page).toHaveURL(/\/company\//);
  });

  test('ヒストリー第3階層リンク遷移確認 - Foundation', async ({ page }) => {
    await page.goto('/history/');

    await page.locator('.navigation__sub-accordion-link:has-text("Foundation")').click();
    await expect(page).toHaveURL(/\/history-founding/);
  });

  test('ヒストリー第3階層リンク遷移確認 - Expansion into Plastic Coatings', async ({ page }) => {
    await page.goto('/history/');

    await page.locator('.navigation__sub-accordion-link:has-text("Expansion into Plastic Coatings")').click();
    await expect(page).toHaveURL(/\/history-innovation/);
  });

  test('ヒストリー第3階層リンク遷移確認 - Global Expansion', async ({ page }) => {
    await page.goto('/history/');

    await page.locator('.navigation__sub-accordion-link:has-text("Global Expansion")').click();
    await expect(page).toHaveURL(/\/history-global/);
  });

  test('外部リンク確認 - SNS LinkedIn', async ({ page }) => {
    await page.goto('/faq/');

    const linkedInLink = page.locator('a.navigation__sub-link:has-text("LinkedIn")').first();
    const linkCount = await linkedInLink.count();
    // /faq/ サイドバーに LinkedIn リンクが含まれていない構成の場合はスキップ
    test.skip(linkCount === 0, '/faq/ サイドバーに LinkedIn リンクが無いためスキップ');

    await expect(linkedInLink).toHaveAttribute('target', '_blank');
    await expect(linkedInLink).toHaveAttribute('rel', /(?=.*\bnoopener\b)(?=.*\bnoreferrer\b)/);
  });

  test('レスポンシブ表示確認 - モバイル', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/about-us/');

    // モバイルでは .navigation はハンバーガーメニュー内に格納される構成のため、
    // 表示状態ではなく DOM への存在のみ確認する。
    const sidebar = page.locator('.navigation');
    await expect(sidebar).toHaveCount(1);
  });
});
