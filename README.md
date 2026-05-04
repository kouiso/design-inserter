# Design Inserter

CSS Stock の222デザインパーツを Gutenberg エディタから検索・選択・挿入できる WordPress プラグイン。

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
docker compose up -d --build
docker compose exec wordpress wp core install \
  --url=http://localhost:8080 --title="Dev" \
  --admin_user=admin --admin_password=admin \
  --admin_email=dev@example.com --allow-root
docker compose exec wordpress wp theme activate designinserter-dev --allow-root
docker compose exec wordpress wp plugin activate designinserter --allow-root
```

カタログ・同梱プレビュー再取得: `node scripts/scrape-css-stock.mjs`

## ライセンスとクレジット

プラグイン本体コード: GPL-2.0-or-later

同梱している HTML/CSS デザインコードとプレビュー画像: [CSS Stock](https://pote-chil.com/css-stock/ja)

CSS Stock 掲載コードは Web サイト/ブログでの使用が許可され、コード自体を別媒体に掲載する場合は該当ページへのリンクと参照元表記が必要です。本プラグインは各パーツの `sourceUrl` とフロント出力コメントで参照元を保持します。有償プラグインとしての再配布販売は、CSS Stock 側の明示許諾を取得してから進めてください。
