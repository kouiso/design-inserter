# Musashi Paint テストスイート

このテストスイートは、リポジトリの過去のPR、issue、コミット履歴から特定された問題の再発を防ぐためのリグレッションテストです。

## 📋 概要

このテストスイートは以下をカバーします：

- **Smoke Tests**: 主要ページの基本表示確認
- **Pagination Tests**: ページネーション機能の動作確認（Issue #70対応）
- **Regression Tests**: プロジェクト固有の問題に基づくリグレッションテスト

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

# リグレッションテストのみ（重要）
npm run test:regression
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
npx playwright test tests/e2e/regression.spec.ts
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
└── e2e/                         # E2Eテスト
    ├── smoke.spec.ts            # スモークテスト（主要ページ表示確認）
    ├── pagination.spec.ts       # ページネーションテスト
    └── regression.spec.ts       # リグレッションテスト（プロジェクト固有）
```

## 📝 リグレッションテストケース一覧

### パーマリンク・リライトルールテスト
**背景**: Issue #102, PR #103 - careerカスタム投稿が/news配下に表示される問題

- careerカスタム投稿が正しいURLで表示される
- productのパーマリンクが正しい
- storyのパーマリンクが正しい
- voiceのパーマリンクが正しい
- interviewのパーマリンクが正しい
- globalnetworkのパーマリンクが正しい

### ページネーションテスト
**背景**: Issue #70 - アーカイブページのページネーション404エラー修正

- ニュースのページネーションで404エラーが出ない
- 製品・サービスのページネーションで404エラーが出ない
- ストーリーのページネーションで404エラーが出ない
- お客様の声のページネーションで404エラーが出ない
- カスタムタクソノミーのページネーションも動作する

### レスポンシブ画像表示テスト
**背景**: Issue #106, PR #107 - 記事内画像のはみ出し問題

- 投稿ページの画像がレスポンシブで正しく表示される
- モバイルビューで画像がはみ出さない

### 資料ダウンロード機能テスト
**背景**: PR #72, #105, Issue #104 - ダウンロード用ページ作成と承認機能プラグイン

- 資料ダウンロードページが存在する
- お問い合わせフォームが表示される

### 画像ビューワー機能テスト
**背景**: Issue #43, PR #44 - 画像PopUpのピンチ表示及びマウスズーム機能

- 画像クリックでビューワーが開く

### サイドバーナビゲーションテスト
**背景**: 複数のコミットでサイドバー関連の修正

- サイドバーが正しく表示される
- カテゴリーナビゲーションが機能する

### KV（キービジュアル）画像テスト
**背景**: 複数のコミットでKV画像の修正

- トップページのKV画像が表示される
- 各ページのヘッダー画像が正しく表示される

### メニュー構造テスト
**背景**: interview、careerのメニュー構造更新

- グローバルナビゲーションが正しく表示される
- interviewとcareerへのリンクが機能する

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
- **リグレッションテスト**: 実際のコンテンツ（投稿、ページ）が存在することが前提

データが不足している場合、該当テストは自動的にスキップされます。

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

## 🔄 テストのメンテナンス

新しい機能追加や問題修正があった場合、対応するリグレッションテストを追加してください：

1. 問題を特定（issue、PR）
2. 修正内容を確認
3. `regression.spec.ts`に新しいテストケースを追加
4. テストが通ることを確認
5. コミット

## 📚 参考資料

- [Playwright Documentation](https://playwright.dev/)
- [GitHub Repository](https://github.com/ritmo-inc/musashipaint)

## 🗑️ 削除された機能

- **アクセシビリティテスト**: プロジェクトの要件に合わないため削除されました
- `@axe-core/playwright`パッケージは依存関係から削除されています

## 📄 ライセンス

ISC

