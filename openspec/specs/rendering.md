# Rendering — designinserter_render_part

作成日: 2026-05-03

## 概要

catalog のパーツ ID を受け取り、HTML + CSS + source コメントを生成する共通レンダリング関数。Gutenberg ブロックとショートコードの両方がこの関数を使用する。

## 機能要件

1. 関数名: `designinserter_render_part( $part_id )`
2. 入力: パーツ ID（string）
3. 出力: レンダリング済み HTML 文字列（または空文字列）
4. 処理フロー:
   - `designinserter_get_part( $part_id )` で catalog からパーツを取得する
   - パーツが見つからない場合は空文字列を返す
   - CSS が空でない場合、`<style data-designinserter-style="{id}">` タグを出力する
   - CSS が空の場合（SVG-only）、style タグを出力しない
   - `<div class="designinserter-part" data-designinserter-id="{id}" aria-label="{title}">` でラップする
   - HTML source コメントにタイトルと sourceUrl を含める
5. `designinserter_get_part()` は `sanitize_key()` で ID をサニタイズする

## 非機能要件

1. **セキュリティ**: catalog は信頼済みローカルデータとして扱い、`wp_kses_post` を適用しない
   - 理由: form/input/SVG 要素が破壊されるため
   - catalog 更新時に diff レビューを行うことで安全性を担保する
2. **CSS 衝突リスク**: デザインパーツのクラス名はグローバルスコープ
   - 現状は衝突を許容する
   - 将来的に衝突が発生した場合は selector prefixer を追加する
3. **placeholder 画像**: 一部パーツが `/css-stock/img/...` パスを含む
   - ホットリンクは行わない（相対パスのまま出力 → 画像は表示されない）
   - 将来的に Media Library 置換 UI を提供する
4. **aria-label**: アクセシビリティのためパーツタイトルを設定する
5. **HTML コメント**: デバッグ・帰属表示用に source 情報を含める

## データ構造

### 入力（catalog パーツ）

```php
$part = [
    'id'        => 'heading-1',
    'title'     => 'シンプルな下線の見出し',
    'html'      => '<h2 class="heading01">見出しテキスト</h2>',
    'css'       => '.heading01 { border-bottom: 2px solid #333; }',
    'sourceUrl' => 'https://pote-chil.com/css-stock/ja/heading#1',
];
```

### 出力 HTML（CSS あり）

```html
<!-- Design Inserter: シンプルな下線の見出し | Source: https://pote-chil.com/css-stock/ja/heading#1 -->
<style data-designinserter-style="heading-1">
.heading01 { border-bottom: 2px solid #333; }
</style>
<div class="designinserter-part" data-designinserter-id="heading-1" aria-label="シンプルな下線の見出し">
<h2 class="heading01">見出しテキスト</h2>
</div>
```

### 出力 HTML（SVG-only、CSS なし）

```html
<!-- Design Inserter: ドットローディング | Source: https://pote-chil.com/css-stock/ja/loading#5 -->
<div class="designinserter-part" data-designinserter-id="loading-5" aria-label="ドットローディング">
<svg>...</svg>
</div>
```

## エッジケース

| ケース | 期待される振る舞い | 備考 |
|--------|-------------------|------|
| part_id が空文字列 | 空文字列を返す | sanitize_key('') → '' → not found |
| part_id が存在しない | 空文字列を返す | designinserter_get_part → null |
| part_id に大文字・特殊文字 | sanitize_key で正規化後に検索 | WordPress 標準サニタイズ |
| css フィールドが空文字列 | style タグを出力しない | SVG-only パーツ |
| css フィールドがスペースのみ | style タグを出力しない | trim() でチェック |
| html フィールドに form/input 要素 | そのまま出力する | wp_kses_post を適用しない |
| html フィールドに SVG 要素 | そのまま出力する | 同上 |
| 同一ページで同じパーツを複数回使用 | 各呼び出しで独立に出力する | style タグも複数回出力される |
| sourceUrl が未設定 | DESIGNINSERTER_SOURCE_URL をフォールバック | プラグイン定数 |

## 受け入れ基準

- [ ] 有効な partId で HTML+CSS+コメントが出力されること
- [ ] 無効な partId で空文字列が返ること
- [ ] SVG-only パーツで style タグが出力されないこと
- [ ] 出力に `data-designinserter-id` 属性が含まれること
- [ ] 出力に `aria-label` 属性が含まれること
- [ ] 出力 HTML コメントに source URL が含まれること
- [ ] form/input 要素を含むパーツが破壊されずに出力されること
- [ ] sanitize_key により不正文字が除去されること

## 関連spec

- [catalog](catalog.md) — レンダリング対象のデータ構造
- [gutenberg-block](gutenberg-block.md) — render_callback から呼び出す
- [shortcode](shortcode.md) — ショートコードハンドラから呼び出す
