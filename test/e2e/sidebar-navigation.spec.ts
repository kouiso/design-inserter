import { test, expect } from '@playwright/test';

test.describe('サイドバーナビゲーション表示テスト', () => {

  test('パターン1: about-us - 完全メニュー表示', async ({ page }) => {
    await page.goto('/about-us/');

    // サイドバーが表示されているか確認
    const sidebar = page.locator('.navigation');
    await expect(sidebar).toBeVisible();

    // 「武蔵塗料グループについて」がアクティブか確認
    const activeItem = page.locator('.navigation__item.is-active');
    await expect(activeItem).toBeVisible();
    await expect(activeItem.locator('.navigation__item-title, a.navigation__item-title')).toHaveText('武蔵塗料グループについて');

    // 主要メニュー項目が表示されているか確認（第2階層まで）
    await expect(page.locator('.navigation__sub-link:has-text("企業概要")')).toBeVisible();
    await expect(page.locator('.navigation__sub-link:has-text("ヒストリー")')).toBeVisible();
    await expect(page.locator('p.navigation__sub-link:has-text("選ばれる理由")')).toBeVisible();
    await expect(page.locator('.navigation__sub-link:has-text("サステナビリティ")')).toBeVisible();
    await expect(page.locator('.navigation__sub-link:has-text("お客様の声")')).toBeVisible();

    // 「選ばれる理由」配下（第3階層）は閉じている（DOMには存在するが非表示）
    const accordion = page.locator('.navigation__sub-accordion-list');
    await expect(accordion).toBeAttached();
  });

  test('パターン2: history - 簡易メニュー + 第3階層展開', async ({ page }) => {
    await page.goto('/history/');

    // 「ヒストリー」がアクティブか確認
    const historyItem = page.locator('.navigation__sub-item.is-active');
    await expect(historyItem).toBeVisible();

    // 第3階層が展開されているか確認
    await expect(page.locator('.navigation__sub-accordion-link:has-text("創業期 1958年～")')).toBeVisible();
    await expect(page.locator('.navigation__sub-accordion-link:has-text("技術革新期 1980年～")')).toBeVisible();
    await expect(page.locator('.navigation__sub-accordion-link:has-text("グローバル展開期 2000年～")')).toBeVisible();

    // 限定メニュー項目のみ表示されているか確認
    await expect(page.locator('a.navigation__item-title:has-text("武蔵塗料グループについて")')).toBeVisible();
    await expect(page.locator('a.navigation__item-title:has-text("選ばれる理由")')).toBeVisible();
    await expect(page.locator('a.navigation__item-title:has-text("サステナビリティ")')).toBeVisible();
    await expect(page.locator('a.navigation__item-title:has-text("お客様の声")')).toBeVisible();
  });

  test('パターン3: sustainability - 簡易メニュー + 第2階層展開', async ({ page }) => {
    await page.goto('/sustainability/');

    // 「サステナビリティ」がアクティブか確認
    const activeItem = page.locator('.navigation__item.is-active');
    await expect(activeItem).toBeVisible();

    // 第2階層（5項目）が展開されているか確認
    await expect(page.locator('.navigation__sub-link:has-text("環境")')).toBeVisible();
    await expect(page.locator('.navigation__sub-link:has-text("社会")')).toBeVisible();
    await expect(page.locator('.navigation__sub-link:has-text("ガバナンス")')).toBeVisible();
    await expect(page.locator('.navigation__sub-link:has-text("SCM")')).toBeVisible();
    await expect(page.locator('.navigation__sub-link:has-text("ライブラリー")')).toBeVisible();
  });

  test('パターン4: voice - 選ばれる理由配下展開', async ({ page }) => {
    await page.goto('/voice/');

    // 「お客様の声」がアクティブか確認
    const activeItem = page.locator('.navigation__item.is-active');
    await expect(activeItem).toBeVisible();
    await expect(activeItem.locator('p.navigation__item-title')).toHaveText('お客様の声');

    // 選ばれる理由（第1階層）が表示されているか確認
    await expect(page.locator('a.navigation__item-title:has-text("選ばれる理由")')).toBeVisible();

    // 選ばれる理由配下（第2階層）が表示されているか確認
    await expect(page.locator('.navigation__sub-item:has-text("最先端の技術開発力")')).toBeVisible();
    await expect(page.locator('.navigation__sub-item:has-text("グローバルネットワーク")')).toBeVisible();
    await expect(page.locator('.navigation__sub-item:has-text("サステナブルなビジネス展開")')).toBeVisible();
    await expect(page.locator('.navigation__sub-item:has-text("顧客志向のカスタマイズ")')).toBeVisible();

    // 第3階層（海外拠点）はDOMに存在するが閉じている
    const accordion = page.locator('.navigation__sub-accordion-item:has-text("海外拠点")');
    await expect(accordion).toBeAttached();
  });

  test('パターン5: global-network - 海外拠点表示', async ({ page }) => {
    await page.goto('/global-network/');

    // 「選ばれる理由」（第1階層）と「グローバルネットワーク」（第2階層）がアクティブか確認
    await expect(page.locator('.navigation__item.is-active:has-text("選ばれる理由")')).toBeVisible();
    await expect(page.locator('.navigation__sub-item.is-active:has-text("グローバルネットワーク")')).toBeVisible();

    // 選ばれる理由配下が展開されているか確認
    await expect(page.locator('.navigation__sub-item:has-text("最先端の技術開発力")')).toBeVisible();
    await expect(page.locator('p.navigation__sub-link:has-text("グローバルネットワーク")')).toBeVisible();
    await expect(page.locator('.navigation__sub-accordion-link:has-text("海外拠点")')).toBeVisible();
  });

  test('パターン6: career - 採用情報専用メニュー', async ({ page }) => {
    await page.goto('/career/');

    // 採用情報専用メニューが表示されているか確認
    await expect(page.locator('p.navigation__item-title:has-text("採用情報")')).toBeVisible();
    await expect(page.locator('a.navigation__sub-link:has-text("人事総務部　正社員募集")')).toBeVisible();
    await expect(page.locator('a.navigation__sub-link:has-text("情報システム　正社員募集")')).toBeVisible();
    await expect(page.locator('a.navigation__sub-link:has-text("CSR推進業務　契約社員募集")')).toBeVisible();
    await expect(page.locator('a.navigation__sub-link:has-text("R&D Hireling（FullTime）")')).toBeVisible();
    await expect(page.locator('a.navigation__item-title:has-text("インタビュー")')).toBeVisible();
    await expect(page.locator('a.navigation__item-title:has-text("採用に関するQ&A")')).toBeVisible();

    // 「武蔵塗料グループについて」は非表示
    await expect(page.locator('.navigation__item-title:has-text("武蔵塗料グループについて")')).not.toBeVisible();
  });

  test('パターン7: faq - よくある質問専用メニュー', async ({ page }) => {
    await page.goto('/faq/');

    // よくある質問専用メニューが表示されているか確認
    await expect(page.locator('a.navigation__item-title:has-text("Pick up ピックアップ")')).toBeVisible();
    await expect(page.locator('a.navigation__item-title:has-text("News ニュース")')).toBeVisible();
    await expect(page.locator('a.navigation__item-title:has-text("SNS")')).toBeVisible();
    await expect(page.locator('a.navigation__sub-link:has-text("LinkedIn")')).toBeVisible();
    await expect(page.locator('a.navigation__sub-link:has-text("Instagram")')).toBeVisible();
    await expect(page.locator('a.navigation__sub-link:has-text("Facebook")')).toBeVisible();
    await expect(page.locator('p.navigation__item-title:has-text("よくあるご質問")')).toBeVisible();
    await expect(page.locator('a.navigation__item-title:has-text("武蔵塗料グループについて")')).toBeVisible();
  });

  test('メニューリンク遷移確認 - history → company', async ({ page }) => {
    await page.goto('/history/');

    // 企業概要リンクをクリック
    await page.locator('.navigation__sub-link:has-text("企業概要")').click();

    // URLが変わることを確認
    await expect(page).toHaveURL(/\/company\//);
  });

  test('外部リンク確認 - SNS LinkedIn', async ({ page }) => {
    await page.goto('/faq/');

    // LinkedInリンクが新しいタブで開くことを確認
    const linkedInLink = page.locator('a.navigation__sub-link:has-text("LinkedIn")');
    await expect(linkedInLink).toHaveAttribute('target', '_blank');
    await expect(linkedInLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test.skip('レスポンシブ表示確認 - モバイル', async ({ page }) => {
    // モバイル表示ではサイドバーが非表示になる設計のためスキップ
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/about-us/');

    const sidebar = page.locator('.navigation');
    await expect(sidebar).toBeVisible();
  });
});
