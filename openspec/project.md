# Design Inserter — プロジェクトコンテキスト

作成日: 2026-05-03

---

## 目的

CSS Stock（pote-chil.com）が公開する 222 個の CSS パーツを、WordPress の投稿・固定ページに簡単に挿入するプラグインを開発する。

---

## 技術スタック

| レイヤー | 技術 | バージョン |
|---------|------|-----------|
| CMS | WordPress | 6.x |
| サーバー言語 | PHP | 8.x |
| エディタ | Gutenberg（vanilla JS） | WordPress 同梱 |
| スクレイパー | Node.js + fetch | 20+ |
| パッケージ管理 | npm | — |
| コンテナ | Docker + OrbStack | — |

---

## アーキテクチャ

```
[Scraper (Node.js)]
    ↓ JSON catalog
[Plugin (PHP)]
    ├── Dynamic Block (server-side render)
    ├── Shortcode (same renderer)
    ├── Admin Settings Page
    └── Editor UI (vanilla JS)
```

- ブロックとショートコードは同一の `designinserter_render_part()` を使用する
- catalog JSON はビルド済みアセットとしてプラグインに同梱する
- エディタ JS はビルドステップなしで直接読み込む

---

## 制約

| 制約 | 理由 |
|------|------|
| Docker/OrbStack がブロックされている | VM hang により WordPress admin の実機確認が不可 |
| ローカルに PHP CLI がない | コンテナ外での構文チェック不可 |
| ビルドステップなし | `@wordpress/scripts` 未導入、vanilla JS で実装 |
| `wp_kses_post` 不使用 | form/input/SVG パーツが破壊されるため、catalog を信頼済みデータとして扱う |

---

## ドメイン知識

- **CSS Stock**: pote-chil.com が公開する CSS スニペット集
- **カテゴリ数**: 28（heading, button, box, list, table, etc.）
- **パーツ数**: 222
- **SVG-only パーツ**: loading カテゴリ等、CSS が空で SVG のみのパーツが存在する
- **ライセンス**: ウェブサイト/ブログでの使用は許可。コード自体の再掲載時はソースリンクと帰属表示が必要

---

## Git 情報

| 項目 | 値 |
|------|-----|
| ブランチ | develop |
| リモート | なし（削除済み） |
| main ブランチ | main |

---

## ディレクトリ構成（主要）

```
wp-content/plugins/designinserter/
  designinserter.php       # Plugin entry point
  includes/
    data.php               # Catalog loader
    render.php             # Shortcode + render function
    block.php              # Gutenberg block registration
    admin.php              # Settings page
  assets/
    editor.js              # Editor UI (vanilla JS)
    editor.css             # Editor styles
  data/
    css-stock-parts.json   # Scraped catalog (222 parts)
scripts/
  scrape-css-stock.mjs     # Scraper script
```
