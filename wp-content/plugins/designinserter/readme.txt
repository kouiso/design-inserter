=== Design Inserter ===
Contributors: kouiso
Tags: design, gutenberg, block, css, template
Requires at least: 6.0
Tested up to: 6.9
Requires PHP: 7.4
Stable tag: 0.2.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Design Inserter は 222 種類の CSS Stock デザインパーツと、Template Party テンプレートを Gutenberg エディタから直接挿入できる WordPress プラグインです。

== Description ==

見出し、ボタン、FAQ、チャート、アコーディオンなど 222 の CSS Stock パーツを、検索・カテゴリ絞り込み・プレビュー付きで Gutenberg に挿入できます。
Template Party テンプレートからはフルページレイアウトの固定ページを作成できます。

主な機能:

* 検索ボックスとカテゴリ絞り込み付きのビジュアルパーツピッカー
* CSS Stock / Template Party のソース切り替え
* プレビューは REST 経由で遅延ロードし、サンドボックス化した iframe に隔離して表示
* ショートコード `[designinserter_part id="heading-1"]` でクラシックエディタやウィジェットからも利用可能
* Template Party テンプレートからフルページ固定ページを作成

== Installation ==

1. `designinserter.zip` を WordPress 管理画面の「プラグイン > 新規追加 > プラグインのアップロード」からインストールしてください
2. 「Design Inserter」を有効化してください

== Frequently Asked Questions ==

= Template Party のテンプレートが表示されません =

`data/template-party-*.json` が git-crypt により暗号化されている場合は、鍵を持っている環境でビルドした zip を使用してください。

= ショートコードとブロックで表示は変わりますか =

変わりません。どちらも同じレンダラーを通るため、出力される HTML と CSS は同一です。

== Changelog ==

= 0.2.0 =
* Initial release.

== Screenshots ==

1. Gutenberg からのパーツ挿入画面
2. フロント表示例
