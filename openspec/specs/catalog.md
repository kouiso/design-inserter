# Catalog — css-stock-parts.json

作成日: 2026-05-03

## 概要

CSS Stock から抽出した 222 パーツのメタデータと HTML/CSS を格納する JSON ファイル。プラグインのデータソースとして、ブロック・ショートコード・管理画面のすべてで参照される。

## 機能要件

1. ファイルパス: `wp-content/plugins/designinserter/data/css-stock-parts.json`
2. scraper が生成し、Git で管理する（ビルド済みアセット扱い）
3. PHP 側は `json_decode` で読み込み、static 変数でキャッシュする
4. エディタ側は `wp_localize_script` で全データを JavaScript に渡す
5. パーツ ID は `{categorySlug}-{sourcePartId}` 形式（例: `heading-1`, `button-3`）
6. カテゴリ情報にはスクレイプ時の期待パーツ数を含み、整合性検証に使用する

## 非機能要件

1. JSON は整形済み（`JSON.stringify(data, null, 2)`）で保存する
2. ファイルサイズは現状約 2-3 MB（222 パーツ分の HTML/CSS を含む）
3. プラグインアップデート時は catalog ごと配布する（動的取得しない）
4. catalog の更新は `npm run scrape:css-stock` で再生成し、diff レビュー後にコミットする

## データ構造

### トップレベル

```json
{
  "sourceName": "CSS Stock",
  "sourceUrl": "https://pote-chil.com/css-stock/ja",
  "sourceNotice": "CSS Stock permits use of listed source code on websites/blogs...",
  "scrapedAt": "2026-05-01T12:00:00.000Z",
  "expectedTotal": 222,
  "total": 222,
  "categories": [...],
  "parts": [...]
}
```

### categories 配列の要素

```json
{
  "slug": "heading",
  "label": "見出し",
  "url": "https://pote-chil.com/css-stock/ja/heading",
  "sectionCount": 4,
  "expectedPartCount": 12
}
```

### parts 配列の要素

```json
{
  "id": "heading-1",
  "sourcePartId": 1,
  "category": "heading",
  "categoryLabel": "見出し",
  "categoryTitle": "CSSで作る見出しデザイン",
  "section": "シンプルな見出し",
  "title": "シンプルな下線の見出し",
  "html": "<h2 class=\"heading01\">見出しテキスト</h2>",
  "css": ".heading01 { border-bottom: 2px solid #333; ... }",
  "inputs": [
    { "label": "メインカラー", "defaultValue": "#333333" }
  ],
  "previewImage": "assets/previews/heading-1.svg",
  "sourceUrl": "https://pote-chil.com/css-stock/ja/heading#1"
}
```

### ID フォーマット規則

- 形式: `{categorySlug}-{sourcePartId}`
- categorySlug: CSS Stock の URL パス末尾（英小文字、ハイフンなし）
- sourcePartId: CSS Stock でのパーツ番号（整数）
- 例: `heading-1`, `button-3`, `loading-5`, `table-2`, `hamburger-4`

### 28 カテゴリ一覧

heading, text, list, box, button, blockquote, table, hr, badge, search, hamburger, toggle, accordion, tab, modal, tooltip, pagination, breadcrumb, step, timeline, card, faq, ranking, cta, form, footer, loading, others

## エッジケース

| ケース | 期待される振る舞い | 備考 |
|--------|-------------------|------|
| JSON ファイルが存在しない | 空の catalog を返す（parts: [], categories: []） | data.php の fallback 処理 |
| JSON が不正（parse エラー） | 空の catalog を返す | json_decode が null を返す場合 |
| parts 配列が空 | エディタの SelectControl が空表示 | scraper 失敗時 |
| css フィールドが空文字列 | SVG-only パーツとして扱う | loading カテゴリ等 |
| inputs 配列が空 | カラー編集 UI を非表示（将来機能） | 現状は無視 |
| previewImage が空文字列 | プレビュー画像なし | 一部パーツで発生しうる |
| previewImage が外部 URL | scraper のローカル同梱化漏れとして扱う | 配布物は外部ホットリンクしない |
| total と expectedTotal が不一致 | scraper がエラーを投げる | データ整合性チェック |

## 受け入れ基準

- [ ] JSON ファイルに 222 件の parts が含まれること
- [ ] 全 parts の id が `{categorySlug}-{sourcePartId}` 形式であること
- [ ] 全 parts に id, sourcePartId, category, categoryLabel, title, html フィールドが存在すること
- [ ] categories 配列に 28 件のカテゴリが含まれること
- [ ] total と expectedTotal が一致すること
- [ ] SVG-only パーツ（loading 等）の css フィールドが空文字列であること
- [ ] sourceUrl が各パーツの CSS Stock 上のアンカーリンクであること
- [ ] PHP で json_decode した際にエラーが発生しないこと

## 関連spec

- [scraper](scraper.md) — catalog を生成するスクリプト
- [rendering](rendering.md) — catalog データを描画に使用する
- [gutenberg-block](gutenberg-block.md) — catalog をエディタに渡す
- [editor-ui](editor-ui.md) — catalog データの UI 表示
