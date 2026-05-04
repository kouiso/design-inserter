# Scraper — scrape-css-stock.mjs

作成日: 2026-05-03

## 概要

CSS Stock（pote-chil.com/css-stock/ja）から全カテゴリ・全パーツの HTML/CSS を抽出し、プラグイン用の catalog JSON を生成する Node.js スクリプト。

## 機能要件

1. スクリプトパス: `scripts/scrape-css-stock.mjs`
2. 実行コマンド: `npm run scrape:css-stock`
3. 出力先: `wp-content/plugins/designinserter/data/css-stock-parts.json`
4. 処理フロー:
   - guide ページ（`/css-stock/ja`）を取得する
   - カテゴリ一覧（slug, label, URL, sectionCount, expectedPartCount）を抽出する
   - 各カテゴリページを順次取得する
   - Astro レンダリングされた `<snippet-card>` + `<template>` ブロックからパーツを抽出する
   - HTML は `HTMLをコピペする` セクション、CSS は `CSSをコピペする` セクションから取得する
5. カラー入力メタデータ（`<output>` タグ内のカラーコード）を抽出する
6. 抽出完了後、total と expectedTotal の一致を検証する
7. 不一致の場合は非ゼロ exit code で終了する

## 非機能要件

1. Node.js 組み込みの `fetch` を使用する（外部依存なし）
2. カテゴリページは順次（直列）に取得する（サーバー負荷軽減）
3. HTML エンティティ（`&amp;`, `&#x27;` 等）をデコードする
4. コードブロックの先頭インデント（10 スペース）を除去する
5. 出力 JSON は `JSON.stringify(data, null, 2)` で整形する
6. エラー時は `process.exitCode = 1` を設定する

## データ構造

### 入力（CSS Stock のHTML構造）

```html
<!-- guide ページのカテゴリカード -->
<a href="/css-stock/ja/heading">
  <div class="..._title_1oov1_35...">見出し</div>
  <span data-count="4" aria-label="セクション数：4">
  <span data-count="12" aria-label="スニペット数：12">
</a>

<!-- カテゴリページのパーツ -->
<snippet-card>
  <a href="#1">
  <h3>シンプルな下線の見出し</h3>
  <img src="/css-stock/img/heading/1.webp">
</snippet-card>
<template>
  <h4>HTMLをコピペする</h4>
  <code>...</code>
  <h4>CSSをコピペする</h4>
  <code>...</code>
</template>
```

### 出力

[catalog spec](catalog.md) のデータ構造を参照。

## エッジケース

| ケース | 期待される振る舞い | 備考 |
|--------|-------------------|------|
| ネットワークエラー（fetch 失敗） | エラーメッセージを表示し、exit code 1 で終了 | `response.ok` チェック |
| guide ページの構造変更 | カテゴリ抽出が 0 件 → エラー終了 | regex 不一致 |
| カテゴリページの構造変更 | 該当カテゴリのパーツが 0 件 → total 不一致 → エラー | snippet-card/template パターン不一致 |
| CSS が存在しないパーツ（SVG-only） | css フィールドを空文字列で格納 | `CSSをコピペする` セクションが見つからない |
| HTML にエンティティが含まれる | デコードして格納 | `decodeHtml()` 関数で処理 |
| 同一カテゴリ内で ID が重複 | 後勝ち（実際には発生しない） | CSS Stock 側で一意 |
| expectedTotal と scraped total が不一致 | Error を throw し、exit code 1 | ソース側の変更を検知 |
| 出力ディレクトリが存在しない | `mkdir` で再帰作成 | `{ recursive: true }` |

## 受け入れ基準

- [ ] `npm run scrape:css-stock` が正常終了すること（exit code 0）
- [ ] 出力 JSON に 222 件の parts が含まれること
- [ ] 28 カテゴリすべてのパーツが抽出されること
- [ ] 各カテゴリの抽出数がコンソールに `{slug}: {actual}/{expected}` 形式で出力されること
- [ ] total と expectedTotal が一致すること
- [ ] SVG-only パーツの css が空文字列であること
- [ ] HTML エンティティがデコード済みであること
- [ ] 出力 JSON が `JSON.parse` で正常に読み込めること
- [ ] 2回連続実行しても同一の出力が得られること（冪等性、scrapedAt 除く）

## 関連spec

- [catalog](catalog.md) — 出力データの構造定義
- [rendering](rendering.md) — 生成された catalog を使用する
