# Shortcode — designinserter_part

作成日: 2026-05-03

## 概要

クラシックエディタ、ウィジェット、再利用ブロック等でデザインパーツを挿入するためのショートコード。Gutenberg ブロックと同一のレンダラーを使用し、同じ出力を生成する。

## 機能要件

1. ショートコード名: `designinserter_part`
2. 構文: `[designinserter_part id="<partId>"]`
3. 属性:
   - `id` (string, required) — catalog の part id（例: `heading-1`, `button-3`, `loading-5`）
4. `designinserter_render_part()` を呼び出してHTML を生成する
5. 出力はブロックのフロントエンド出力と完全に同一である
6. 閉じタグなし（self-closing）で使用する

## 非機能要件

1. `shortcode_atts()` でデフォルト値を定義し、未知の属性を無視する
2. id 属性は `sanitize_key()` でサニタイズする
3. 出力に `wp_kses_post` を適用しない（form/SVG パーツが破壊されるため）
4. ショートコードはフロントエンドとエディタの両方で実行される可能性がある

## データ構造

### ショートコード属性

```php
$atts = shortcode_atts(
    array(
        'id' => '',
    ),
    $atts,
    'designinserter_part'
);
```

### 出力例

```html
<!-- Design Inserter: シンプルな見出し | Source: https://pote-chil.com/css-stock/ja/heading#1 -->
<style data-designinserter-style="heading-1">
.heading-class { ... }
</style>
<div class="designinserter-part" data-designinserter-id="heading-1" aria-label="シンプルな見出し">
<h2 class="heading-class">見出し</h2>
</div>
```

## エッジケース

| ケース | 期待される振る舞い | 備考 |
|--------|-------------------|------|
| id 属性が空 | 空文字列を返す（何も描画しない） | `designinserter_render_part('')` → `null` |
| id 属性が未指定 | 空文字列を返す | shortcode_atts のデフォルト値 |
| 存在しない id を指定 | 空文字列を返す | catalog に該当パーツなし |
| id に不正文字を含む | sanitize_key で正規化後、該当なしで空 | `A-Z` → `a-z`, 特殊文字除去 |
| SVG-only パーツの id | HTML のみ描画、style タグなし | css フィールドが空 |
| 同一ページで同じ id を複数使用 | 各ショートコードが独立に描画する | style タグも複数出力される |
| クラシックエディタで使用 | テキストモードで入力し、ビジュアルモードでプレビュー | WordPress 標準動作 |
| ウィジェット（テキスト）で使用 | `do_shortcode` フィルターにより描画される | WordPress 4.9+ で標準対応 |

## 受け入れ基準

- [ ] `[designinserter_part id="heading-1"]` で見出しパーツが描画されること
- [ ] `[designinserter_part id="loading-5"]` で SVG-only パーツが style タグなしで描画されること
- [ ] `[designinserter_part id="nonexistent"]` で何も表示されないこと
- [ ] `[designinserter_part]`（id なし）で何も表示されないこと
- [ ] 出力 HTML に source コメントが含まれること
- [ ] 出力が Gutenberg ブロックのフロントエンド出力と同一であること
- [ ] テキストウィジェットで使用した場合に正しく描画されること

## 関連spec

- [rendering](rendering.md) — 共通レンダリング関数の詳細
- [gutenberg-block](gutenberg-block.md) — ブロック側の仕様（同一レンダラー使用）
- [catalog](catalog.md) — id の形式とデータ構造
