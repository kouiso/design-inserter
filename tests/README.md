# E2E & Accessibility Test Suite

武蔵塗料ウェブサイトの自動テストスイート（Playwright + axe-core）

## 📋 概要

このテストスイートは以下をカバーします：

- **Smoke Tests**: 主要ページの基本表示確認
- **Pagination Tests**: ページネーション機能の動作確認
- **Taxonomy Tests**: 製品タクソノミー（5分類）の遷移確認
- **Form Tests**: お問い合わせ・資料ダウンロードフォームのバリデーション確認
- **Accessibility Tests**: axe-core による自動アクセシビリティチェック

## 🚀 セットアップ

### 前提条件

- Node.js LTS（18以上推奨）
- ローカル環境が `http://localhost:10010` で起動していること

### インストール

```powershell
# 依存パッケージのインストール
npm install

# Playwrightブラウザのインストール
npx playwright install
```

## 🧪 テスト実行

### 全テスト実行

```powershell
npm test
```

### スイート別実行

```powershell
# スモークテストのみ
npm run test:smoke

# ページネーションテストのみ
npm run test:pagination

# アクセシビリティテストのみ
npm run test:a11y
```

### UI モードで実行（デバッグ用）

```powershell
npm run test:ui
```

### ヘッドモードで実行（ブラウザを表示）

```powershell
npm run test:headed
```

### 特定のテストファイルを実行

```powershell
npx playwright test tests/e2e/smoke.spec.ts
```

### 特定のブラウザのみで実行

```powershell
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## 📊 レポート

テスト実行後、HTMLレポートが自動的に生成されます：

```powershell
npx playwright show-report
```

レポートは `playwright-report/` フォルダに保存されます。

## 🗂️ テストファイル構成

```
tests/
├── e2e/                      # E2Eテスト
│   ├── smoke.spec.ts         # スモークテスト（主要ページ表示確認）
│   ├── pagination.spec.ts    # ページネーションテスト
│   ├── taxonomy.spec.ts      # タクソノミーテスト
│   └── forms.spec.ts         # フォームテスト
└── a11y/                     # アクセシビリティテスト
    └── accessibility.spec.ts # axe-core 自動スキャン
```

## 📝 テストケース一覧

### Smoke Tests (10件)
- TOP表示
- 製品情報表示
- ニュース一覧表示
- メディア一覧表示
- お問い合わせページ表示
- 資料ダウンロードページ表示
- 企業情報表示
- 会社概要表示
- 採用情報表示
- サステナビリティ表示

### Pagination Tests (7件)
- ニュース2ページ目遷移
- 採用情報2ページ目遷移
- インタビュー2ページ目遷移
- ストーリー2ページ目遷移
- グローバルネットワーク2ページ目遷移
- ニュース詳細→一覧戻る
- メディア詳細→一覧戻る

### Taxonomy Tests (9件)
- 製品情報サイドバー表示
- 用途でえらぶページ表示
- 基材でえらぶページ表示
- 意匠性でえらぶページ表示
- 機能でえらぶページ表示
- 環境キーワードでえらぶページ表示
- タクソノミーページネーション
- 製品詳細→ダウンロード誘導
- メディアカテゴリページ表示

### Form Tests (11件)
- お問い合わせ必須エラー
- お問い合わせメール形式エラー
- お問い合わせメール確認不一致エラー
- ダウンロードページ表示・製品読込
- ダウンロード検索機能
- ダウンロード製品選択・解除
- ダウンロード選択上限エラー
- ダウンロード未選択エラー
- タクソノミーフィルター動作
- フィルターリセット機能

### Accessibility Tests (13件)
- TOP アクセシビリティ
- 製品情報 アクセシビリティ
- ニュース アクセシビリティ
- お問い合わせ アクセシビリティ
- 資料ダウンロード アクセシビリティ
- 企業情報 アクセシビリティ
- サステナビリティ アクセシビリティ
- 採用情報 アクセシビリティ
- 見出し構造（h1単一性）
- 画像代替テキスト
- ページネーション ARIA
- フォームラベル関連付け
- サイドバーキーボード操作

**合計: 50件**

## 🔍 デバッグ

### スクリーンショットとビデオ

失敗したテストのスクリーンショットとビデオは自動的に保存されます：

- スクリーンショット: `test-results/` フォルダ
- ビデオ: `test-results/` フォルダ

### トレース

失敗時のトレースは `playwright-report/` で確認できます：

```powershell
npx playwright show-trace test-results/.../trace.zip
```

## ⚙️ 設定

テスト設定は `playwright.config.ts` で管理されています：

- **baseURL**: `http://localhost:10010`
- **タイムアウト**: デフォルト30秒
- **リトライ**: CI環境で2回
- **並列実行**: ローカルは自動、CIは1ワーカー
- **ブラウザ**: Chromium, Firefox, WebKit

## 📌 注意事項

### データ前提条件

一部のテストは以下のデータが必要です：

- **ページネーションテスト**: 各投稿タイプが13件以上（12件/ページ設定）
- **タクソノミーテスト**: 製品タクソノミー（`product_*`）に最低1ターム
- **ダウンロードテスト**: 製品（`product`）が6件以上（上限検証用）

データが不足している場合、該当テストは自動的にスキップされます。

### フォーム送信

フォームテストは**送信UIの動作のみ**を検証し、実際のメール送信は行いません。
本番環境での検証時は別途手動テストを推奨します。

## 🛠️ トラブルシューティング

### テストが失敗する

1. ローカル環境が起動しているか確認
2. `http://localhost:10010` でサイトにアクセスできるか確認
3. ブラウザを再インストール: `npx playwright install --force`

### タイムアウトエラー

ページの読み込みが遅い場合、`playwright.config.ts` でタイムアウトを延長：

```typescript
use: {
  navigationTimeout: 60000, // 60秒
}
```

### CI/CD での実行

GitHub Actions 等で実行する場合のサンプル：

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run tests
  run: npm test
```

## 📚 参考資料

- [Playwright Documentation](https://playwright.dev/)
- [axe-core Playwright Integration](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright)
- [テスト仕様書](./test-specs/TEST_SPECIFICATION.html)

## 📄 ライセンス

ISC
