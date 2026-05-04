# Design Inserter

WordPress プラグイン — CSS Stock のデザインパーツを Gutenberg エディタからワンクリックで挿入。

## 特徴

- **222種類のCSSパーツ**（見出し、ボタン、ボックス等 28カテゴリ）を即座に利用可能
- **Gutenberg ブロック対応** — エディタ内でリアルタイムプレビュー
- **検索 & カテゴリフィルタ** — 大量パーツから素早く目的のデザインを発見
- **ショートコード対応** — クラシックエディタでも `[designinserter_part id="heading-1"]` で利用可
- **CSS衝突なし** — パーツ固有のクラス名、同一パーツ複数使用時のstyle重複防止

## インストール

### 要件

- WordPress 6.0+
- PHP 7.4+

### 手順

1. `wp-content/plugins/designinserter/` ディレクトリをWordPressにコピー
2. 管理画面 → プラグイン → 「Design Inserter」を有効化

## 使い方

### Gutenberg エディタ

1. 投稿編集画面で「+」ブロック追加ボタンをクリック
2. 「Design Inserter」ブロックを選択
3. サイドバーに表示される検索バーまたはカテゴリボタンでパーツを探す
4. パーツをクリックして選択 → エディタ内にプレビュー表示
5. 公開するとフロントエンドにCSS付きで描画

### ショートコード

```
[designinserter_part id="heading-1"]
```

パーツIDはカタログJSON（`data/css-stock-parts.json`）を参照。

## 開発環境

```bash
# Docker起動
docker compose up -d --build

# WordPress初期設定
docker compose exec wordpress wp core install \
  --url=http://localhost:8080 \
  --title="Design Inserter Dev" \
  --admin_user=admin \
  --admin_password=admin \
  --admin_email=dev@example.com \
  --allow-root

# テーマ・プラグイン有効化
docker compose exec wordpress wp theme activate designinserter-dev --allow-root
docker compose exec wordpress wp plugin activate designinserter --allow-root

# 動作確認
open http://localhost:8080/wp-admin/
```

## カタログ更新

CSS Stock からパーツカタログを再取得：

```bash
node scripts/scrape-css-stock.mjs
```

出力: `wp-content/plugins/designinserter/data/css-stock-parts.json`

## ライセンス

GPL-2.0-or-later

## クレジット

CSSパーツデザイン: [CSS Stock](https://pote-chil.com/css-stock/)
