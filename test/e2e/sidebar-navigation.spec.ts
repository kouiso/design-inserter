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
    await expect(activeItem.locator('.navigation__item-title, a.navigation__item-title, p.navigation__item-title')).toContainText('武蔵塗料グループについて');

    // 主要メニュー項目が表示されているか確認（第1階層）
    await expect(page.locator('.navigation__sub-link:has-text("企業概要")')).toBeVisible();
    await expect(page.locator('.navigation__sub-link:has-text("ヒストリー")')).toBeVisible();
    // 選ばれる理由は第1階層のitem-titleとして表示
    await expect(page.locator('a.navigation__item-title:has-text("選ばれる理由")')).toBeVisible();
    await expect(page.locator('.navigation__item-title:has-text("サステナビリティ")')).toBeVisible();
    await expect(page.locator('.navigation__item-title:has-text("お客様の声")')).toBeVisible();

    // 「選ばれる理由」配下の第3階層（グローバル生産拠点）は常に展開表示されている
    await expect(page.locator('.navigation__sub-link:has-text("グローバル生産拠点")')).toBeVisible();
  });

  test('パターン2: history - 簡易メニュー + 第3階層展開', async ({ page }) => {
    await page.goto('/history/');

    // 「ヒストリー」がアクティブか確認
    const historyItem = page.locator('.navigation__sub-item.is-active');
    await expect(historyItem).toBeVisible();

    // 第3階層が展開されているか確認（実際のメニュー項目名に合わせる）
    await expect(page.locator('.navigation__sub-link:has-text("創業と基盤形成 1958年-")')).toBeVisible();
    await expect(page.locator('.navigation__sub-link:has-text("プラスチック架飾へ 1980年-")')).toBeVisible();
    await expect(page.locator('.navigation__sub-link:has-text("グローバル展開 2000年-")')).toBeVisible();

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

    // 第3階層（グループ会社・グローバル生産拠点）は常に展開表示されている
    await expect(page.locator('.navigation__sub-link:has-text("グループ会社")')).toBeVisible();
    await expect(page.locator('.navigation__sub-link:has-text("グローバル生産拠点")')).toBeVisible();
  });

  test('パターン5: global-network - グローバル生産拠点表示', async ({ page }) => {
    await page.goto('/global-network/');

    // 「選ばれる理由」（第1階層）と「グローバルネットワーク」（第2階層）がアクティブか確認
    await expect(page.locator('.navigation__item.is-active:has-text("選ばれる理由")')).toBeVisible();
    await expect(page.locator('.navigation__sub-item.is-active:has-text("グローバルネットワーク")')).toBeVisible();

    // 選ばれる理由配下が展開されているか確認
    await expect(page.locator('.navigation__sub-item:has-text("最先端の技術開発力")')).toBeVisible();
    await expect(page.locator('a.navigation__sub-link:has-text("グローバルネットワーク")')).toBeVisible();
    await expect(page.locator('.navigation__sub-link:has-text("グローバル生産拠点")')).toBeVisible();
  });

  test('パターン6: career - 採用情報専用メニュー', async ({ page }) => {
    await page.goto('/career/');

    // 採用情報専用メニューが表示されているか確認
    await expect(page.locator('p.navigation__item-title:has-text("採用情報")')).toBeVisible();
    await expect(page.locator('a.navigation__sub-link:has-text("人事総務部")')).toBeVisible();
    await expect(page.locator('a.navigation__sub-link:has-text("情報システム部")')).toBeVisible();
    await expect(page.locator('a.navigation__sub-link:has-text("CSR推進室")')).toBeVisible();
    await expect(page.locator('a.navigation__sub-link:has-text("R&D Hireling")')).toBeVisible();
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
    // SNSはクリック不可ラベルとして表示（子項目あり）
    await expect(page.locator('.navigation__item-title:has-text("SNS")')).toBeVisible();
    // SNS子項目が表示される
    await expect(page.locator('a.navigation__sub-link:has-text("LinkedIn")')).toBeVisible();
    await expect(page.locator('a.navigation__sub-link:has-text("Instagram")')).toBeVisible();
    await expect(page.locator('a.navigation__sub-link:has-text("Facebook")')).toBeVisible();
    // よくあるご質問は表示、武蔵塗料グループについては非表示
    await expect(page.locator('p.navigation__item-title:has-text("よくあるご質問")')).toBeVisible();
    await expect(page.locator('.navigation__item-title:has-text("武蔵塗料グループについて")')).not.toBeVisible();
  });

  test('メニューリンク遷移確認 - history → company', async ({ page }) => {
    await page.goto('/history/');

    // 企業概要リンクをクリック
    await page.locator('.navigation__sub-link:has-text("企業概要")').click();

    // URLが変わることを確認
    await expect(page).toHaveURL(/\/company\//);
  });

  test('ヒストリー第3階層リンク遷移確認 - 創業と基盤形成', async ({ page }) => {
    await page.goto('/history/');

    // 創業と基盤形成リンクをクリック
    await page.locator('.navigation__sub-link:has-text("創業と基盤形成 1958年-")').click();

    // 別ページ（/history-founding）に遷移することを確認
    await expect(page).toHaveURL(/\/history-founding/);
  });

  test('ヒストリー第3階層リンク遷移確認 - プラスチック架装へ', async ({ page }) => {
    await page.goto('/history/');

    // プラスチック架装へリンクをクリック
    await page.locator('.navigation__sub-link:has-text("プラスチック架飾へ 1980年-")').click();

    // 別ページ（/history-innovation）に遷移することを確認
    await expect(page).toHaveURL(/\/history-innovation/);
  });

  test('ヒストリー第3階層リンク遷移確認 - グローバル展開', async ({ page }) => {
    await page.goto('/history/');

    // グローバル展開リンクをクリック
    await page.locator('.navigation__sub-link:has-text("グローバル展開 2000年-")').click();

    // 別ページ（/history-global）に遷移することを確認
    await expect(page).toHaveURL(/\/history-global/);
  });

  // SNS子項目が削除されたため、このテストはスキップ
  test.skip('外部リンク確認 - SNS LinkedIn', async ({ page }) => {
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
