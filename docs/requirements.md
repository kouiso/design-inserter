# 要件定義書

## プロジェクト概要

Design Inserter は、[CSS Stock](https://pote-chil.com/css-stock/ja) が提供する 222 個の CSS デザインパーツを WordPress の投稿・固定ページにワンクリックで挿入するプラグインである。

CSS Stock は見出し・ボタン・ボックス・ローディングアニメーションなど 28 カテゴリのピュア CSS スニペットを公開しており、本プラグインはそれらを WordPress エディタ内で直接選択・プレビュー・挿入できる体験を提供する。

---

## 機能要件

### FR-1: Gutenberg ブロック (`designinserter/css-part`)

| 項目 | 仕様 |
|------|------|
| ブロック種別 | Dynamic block（サーバーサイドレンダリング） |
| エディタ UI | InspectorControls 内のセレクトボックスでパーツ選択 |
| プレビュー | 選択パーツの HTML + CSS をエディタ内でライブ表示 |
| 保存形式 | `save: null`（属性 `partId` のみ保存） |
| フロントエンド | `render_callback` でサーバーサイド HTML 出力 |

### FR-2: ショートコード (`[designinserter_part id="..."]`)

| 項目 | 仕様 |
|------|------|
| 書式 | `[designinserter_part id="heading-1"]` |
| 対象 | クラシックエディタ、ウィジェット、再利用ブロック |
| レンダラー | Gutenberg ブロックと同一の `designinserter_render_part()` |

### FR-3: 管理画面 (Settings > Design Inserter)

| 項目 | 仕様 |
|------|------|
| 表示情報 | カタログパーツ数、ソース URL、ショートコード例 |
| 権限 | `manage_options` |
| 将来拡張 | カテゴリ別一覧、検索、プレビュー |

### FR-4: カタログ管理

| 項目 | 仕様 |
|------|------|
| データ形式 | JSON ファイル (`data/css-stock-parts.json`) |
| 格納場所 | プラグインディレクトリ内（リポジトリ管理） |
| 更新方法 | `npm run scrape:css-stock` で再生成 |
| 件数 | 28 カテゴリ / 222 パーツ |

### FR-5: スクレイパー (`scripts/scrape-css-stock.mjs`)

| 項目 | 仕様 |
|------|------|
| 実行方法 | `npm run scrape:css-stock` |
| 処理 | ガイドページ → カテゴリページ → パーツ抽出 → JSON 書き出し |
| バリデーション | ソースページ記載のパーツ数と抽出数の一致を検証 |
| 出力 | `wp-content/plugins/designinserter/data/css-stock-parts.json` |

---

## 非機能要件

### NFR-1: パフォーマンス

- カタログ読み込みは `static` 変数でリクエスト内キャッシュする
- JSON デコードは 1 リクエストにつき最大 1 回
- フロントエンドの CSS 出力はパーツ単位（使用パーツのみ）

### NFR-2: セキュリティ

- カタログはローカル信頼データとして扱い、`wp_kses_post` は適用しない
  - 理由: form/input/svg 系パーツが破壊されるため
- パーツ ID は `sanitize_key()` でバリデーション
- カタログ更新時は diff レビューを必須とする
- 管理画面は `manage_options` capability で制限

### NFR-3: 互換性

- WordPress 6.0 以上（Block API v2）
- PHP 7.4 以上
- クラシックエディタ対応（ショートコードで代替）
- テーマ非依存（グローバル CSS 出力）

### NFR-4: 保守性

- ビルドステップ不要（Plain JS / PHP のみ）
- 単一カタログファイルでデータ管理
- 各モジュールは単一責務（data / render / block / admin）

---

## 制約事項

### C-1: Docker/OrbStack ブロッカー

- OrbStack VM が hang しており、WordPress 管理画面での実機検証ができない
- `docker compose up` / `docker info` が応答しない状態
- PHP がローカルにインストールされていないため、構文検査も未実行
- ブロック挿入・ショートコード表示・プラグイン有効化は Docker 復旧後に検証予定

### C-2: ビルドステップなし

- `@wordpress/scripts` は未導入
- `editor.js` は IIFE 形式の Plain JavaScript
- 将来、コントロールが複雑化した場合に導入を検討

### C-3: ライセンス

- CSS Stock のソースコードはウェブサイト/ブログでの使用を許可
- コード自体を他所に再掲載する場合はソースリンクと帰属表示が必要
- レンダリング時に HTML コメントでソース URL を出力して対応

---

## スコープ外（v1.0）

### 明示的に除外する機能

| 機能 | 除外理由 |
|------|----------|
| Block Patterns 生成 | 222 パターン一括生成は Inserter を汚染し保守困難 |
| 画像管理 / Media Library 連携 | placeholder 画像パスは存在するが、直リンク回避のため将来対応 |
| CSS プレフィクサー / スコープ分離 | 衝突が報告されるまでは不要 |
| カラーカスタマイズ UI | カタログに `inputs` フィールドはあるが v1.0 では未活用 |
| 多言語対応 | CSS Stock は日本語版のみスクレイプ |
| 自動カタログ更新 | 手動 `npm run scrape:css-stock` + diff review で運用 |
| REST API | ブロックエディタは `wp_localize_script` でカタログを注入 |

---

## 用語集

| 用語 | 定義 |
|------|------|
| パーツ (Part) | CSS Stock の 1 スニペット（HTML + CSS のペア） |
| カタログ (Catalog) | 全パーツを格納した JSON ファイル |
| カテゴリ (Category) | CSS Stock のスニペット分類（見出し、ボタン等） |
| セクション (Section) | カテゴリ内のサブ分類（シンプルな見出し、背景付き見出し等） |
| Dynamic Block | フロントエンドを PHP でサーバーサイドレンダリングするブロック |

---

## 成功基準

1. WordPress 管理画面でプラグインを有効化できる
2. Gutenberg エディタで任意のパーツを選択・プレビュー・保存できる
3. フロントエンドで選択パーツの HTML/CSS が正しく表示される
4. ショートコードで同一パーツを挿入・表示できる
5. 222 パーツ全てが選択可能である
6. プラグイン停止時にフロントエンド出力が消える（期待通りの graceful degradation）
