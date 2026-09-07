# Design Inserter

222 のデザインパーツを Gutenberg エディタから検索・選択・挿入できる WordPress プラグイン。

## インストール

1. [Releases](https://github.com/kouiso/wordpress-plugin-designinserter/releases) から最新の `designinserter-x.x.x.zip` をダウンロード
2. WordPress 管理画面 → プラグイン → 新規追加 → 「プラグインのアップロード」
3. zipファイルを選択 → インストール → 有効化

### 要件

- WordPress 6.0+
- PHP 7.4+

## 使い方

### Gutenberg ブロック

1. 投稿編集画面 → 「+」ブロック追加 → 「Design Inserter」を選択
2. サイドバーの検索バーまたはカテゴリボタンでパーツを探す
3. パーツをクリック → エディタ内にプレビュー表示
4. 公開すると CSS 付きでフロントに描画

### ショートコード（クラシックエディタ）

```
[designinserter_part id="heading-1"]
```

## パーツ一覧

28カテゴリ・222パーツ収録:

見出し(39) / ボタン(35) / ボックス(21) / ローディング(16) / リスト(13) / 吹き出し(12) / アコーディオンメニュー(8) / 検索フォーム(7) / セレクトボックス(6) / パンくずリスト(5) / テキストボックス(5) / ツールチップ(5) / Q&Aリスト(4) / 引用ボックス(4) / レーダーチャート(4) / 「続きを読む」ボタン(4) / タブ(4) / トグルボタン(4) / チェックボックス(3) / フッター(3) / 付箋(3) / ページネーション(3) / 円グラフ(3) / ラジオボタン(3) / 目次(3) / 棒グラフ(2) / モーダルウィンドウ(2) / タイムライン(1)

## 開発

```bash
npm test
npm run build
docker compose up -d --build
docker compose exec wordpress wp core install \
  --url=http://localhost:8080 --title="Dev" \
  --admin_user=admin --admin_password=admin \
  --admin_email=dev@example.com --allow-root
docker compose exec wordpress wp theme activate designinserter-dev --allow-root
docker compose exec wordpress wp plugin activate designinserter --allow-root
```

WordPress smoke:

- `npm run smoke:wp`: Docker が使える場合はコンテナ上の WordPress/WP-CLI smoke、使えない場合は portable WordPress smoke、portable も不可の場合は PHP stubs による Docker-free smoke
- `npm run smoke:wp:docker`: Docker コンテナ上で plugin activate / shortcode / dynamic block render を確認
- `npm run smoke:wp:portable`: 一時ディレクトリに WP-CLI + WordPress + SQLite drop-in を作成し、plugin activate / shortcode / dynamic block / REST を実 WordPress で確認
- `npm run smoke:wp:stubs`: Docker なしで plugin load / hooks / shortcode / dynamic block / REST route を PHP stubs で確認

`wp-env` は通常 Docker 前提です。Docker なしでは experimental な Playground runtime が候補ですが、任意コマンド実行の `wp-env run` が未対応のため、このリポジトリの Docker-free 実 WordPress smoke は一時 WordPress + SQLite drop-in を主経路にしています。
portable smoke は既定で WordPress 6.9.4 / WP-CLI 2.12.0 を使います。別バージョン検証は `WP_SMOKE_WP_VERSION=6.8.3 npm run smoke:wp:portable` のように指定できます。
Docker smoke は `WP_PORT` / `MYSQL_PORT` の衝突を起動前に確認し、`WP_PORT` 指定時は smoke 内の `WP_HOME` と WordPress install URL も同じ port に合わせます。

stub smoke の範囲と不足: `docs/testing.md`

カタログ・同梱プレビュー再取得: `node scripts/scrape-css-stock.mjs`

## ライセンスとクレジット

プラグイン本体コード: GPL-2.0-or-later

同梱している HTML/CSS デザインコードとプレビュー画像: [デザインパーツ](https://pote-chil.com/css-stock/ja)

デザインパーツ掲載コードは Web サイト/ブログでの使用が許可され、コード自体を別媒体に掲載する場合は該当ページへのリンクと参照元表記が必要です。本プラグインは各パーツの `sourceUrl` とフロント出力コメントで参照元を保持します。有償プラグインとしての再配布販売は、デザインパーツ提供元の明示許諾を取得してから進めてください。
