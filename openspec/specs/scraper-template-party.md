# Scraper — Template Party（scrape-template-party.mjs / scrape-template-party-parts.mjs）

作成日: 2026-05-30

## 概要

Template Party（template-party.com）からフルページテンプレートのメタデータ/サムネ/ZIPバンドルと、コピペパーツの HTML/CSS を抽出する Node.js スクリプト群。自分用途のみ。著作表示「Web Design:Template-Party」は必ず保持。バンドル実体は Git 非管理（`.gitignore`）。

## スクリプト一覧

| スクリプト | npm script | 出力 |
|---|---|---|
| `scripts/scrape-template-party.mjs` | `scrape:template-party` | `data/template-party-templates.json` + thumbnails + bundles |
| `scripts/scrape-template-party.mjs --skip-zips` | `scrape:template-party:meta` | メタデータ + thumbnails のみ（ZIPなし） |
| `scripts/scrape-template-party-parts.mjs` | `scrape:template-party:parts` | `data/template-party-parts.json` + thumbnails |

## フルテンプレートスクレイパー（scrape-template-party.mjs）

### 機能要件

1. `/db_new/list?category=template&page=1〜12`（100件/頁）から全テンプレ一覧を取得
2. 各 detail ページ（`/db_new/detail?category=template&id=NNNN`）から全 variant の ZIP URL を収集
3. ZIP URL パターン: `https://template-party.com/template/<baseId>/<variantId>.zip`
4. `--skip-zips` フラグ指定時はメタデータとサムネのみ取得（ZIP DL スキップ）
5. ZIP DL → 展開 → `index.html` 内の相対 asset/CSS パスを `bundleDir` 基準にリライト
6. 著作権表示行（`Web Design:Template-Party`）は**必ず保持**（削除・変更禁止）
7. サムネ DL → `assets/previews/tp-<variantId>.webp`
8. 進捗を `data/template-party-scrape-state.json` に書き込む（resumable）
9. 既取得 variant は skip（idempotent）
10. rate-limit: 逐次処理 + sleep（サーバー負荷軽減）
11. scrape-state.json は .gitignore で Git 非管理

### 出力 JSON スキーマ（template-party-templates.json）

```json
{
  "sourceName": "Template Party",
  "sourceUrl": "https://template-party.com/",
  "scrapedAt": "2026-05-30T00:00:00.000Z",
  "total": 1017,
  "categories": [{ "slug": "...", "label": "...", "count": 0 }],
  "templates": [{
    "id": "tp_wa1_blue",
    "baseId": "tp_wa1",
    "variant": "blue",
    "category": "japanese-food",
    "categoryLabel": "和食・寿司・うどん",
    "title": "和菓子店向け tp_wa1_blue",
    "thumb": "assets/previews/tp-wa1_blue.webp",
    "demoUrl": "https://template-party.com/template/tp_wa1/tp_wa1_blue/",
    "sourceUrl": "https://template-party.com/db_new/detail?category=template&id=...",
    "bundleDir": "data/template-party-bundles/tp_wa1_blue",
    "entryHtml": "index.html",
    "source": "template-party"
  }]
}
```

### Git 管理方針

| アーティファクト | Git |
|---|---|
| `data/template-party-templates.json` | 管理 |
| `assets/previews/tp-*.webp` | 管理 |
| `data/template-party-bundles/` | **非管理**（.gitignore） |
| `data/template-party-scrape-state.json` | **非管理**（.gitignore） |

## コピペパーツスクレイパー（scrape-template-party-parts.mjs）

### 機能要件

1. `/parts/catalog.php` から全カテゴリ（見出し・ボタン・タブ・アコーディオン等）のパーツ一覧を取得
2. 各パーツの HTML/CSS をスクレイプして `template-party-parts.json` に格納
3. `source: "template-party"` を全パーツに付与
4. サムネ DL → `assets/previews/tp-parts-<partId>.webp`
5. CSS Stock と同一スキーマ: `{id, category, categoryLabel, title, html, css, inputs, previewImage, sourceUrl, source}`

### 出力 JSON スキーマ（template-party-parts.json）

```json
{
  "sourceName": "Template Party Parts",
  "sourceUrl": "https://template-party.com/parts/",
  "scrapedAt": "2026-05-30T00:00:00.000Z",
  "total": 138,
  "categories": [{ "slug": "...", "label": "...", "count": 0 }],
  "parts": [{
    "id": "tp-parts-list-voice1",
    "category": "list",
    "categoryLabel": "リスト",
    "title": "...",
    "html": "...",
    "css": "...",
    "inputs": [],
    "previewImage": "assets/previews/tp-parts-list-voice1.webp",
    "sourceUrl": "https://template-party.com/parts/...",
    "source": "template-party"
  }]
}
```

## 著作権・利用条件

- **自分用途のみ**（不特定多数への配布・販売は規約違反）
- `Web Design:Template-Party` 著作権表示はすべての配信経路で保持
- バンドル実体（`data/template-party-bundles/`）は公開リポ・販売物に含めない
- Template Party 公式の ZIP 再配布にあたるため Git push 対象外とする
