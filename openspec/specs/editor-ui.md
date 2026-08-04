# Editor UI — Gutenberg エディタ UI

作成日: 2026-05-03

## 概要

Gutenberg エディタ内でデザインパーツを選択・プレビューするための UI コンポーネント。vanilla JS で実装し、ビルドステップなしで動作する。

## 機能要件

1. ファイルパス: `wp-content/plugins/designinserter/assets/editor.js`
2. IIFE パターンで WordPress グローバル変数を注入する
3. InspectorControls（サイドバー）内に PanelBody「Design Inserter」を表示する
4. PanelBody 内に SelectControl でパーツ一覧を表示する
5. SelectControl のオプション形式: `[{categoryLabel}] {title}`（例: `[見出し] シンプルな下線の見出し`）
6. 先頭オプション: `パーツを選択`（value: `""`）
7. パーツ選択時、エディタ本体（edit 関数の戻り値）にライブプレビューを表示する
8. ライブプレビューの構造:
   - `div.designinserter-editor-preview` でラップ
   - CSS がある場合は `<style>` タグをインライン出力
   - `div.designinserter-part` に `dangerouslySetInnerHTML` で HTML を描画
9. パーツ未選択時は Notice（status: info）で「Design Inserter の CSS パーツを選択してください。」を表示する

## 非機能要件

1. **ビルドステップなし**: `@wordpress/scripts` を使用せず、`wp_register_script` で直接読み込む
2. **依存パッケージ**: `wp-blocks`, `wp-element`, `wp-components`, `wp-block-editor`, `wp-i18n`
3. **データ供給**: `wp_localize_script` で `window.DesignInserterCatalog` にカタログデータを設定する
4. **222 件の表示**: 現状は全件を単一 SelectControl に表示する（パフォーマンス上問題なし）
5. **国際化**: `__()` 関数と `designinserter` テキストドメインを使用する
6. **CSS スコープ**: エディタプレビュー内の style タグはページ全体に影響する可能性がある（現状の制限）

## データ構造

### window.DesignInserterCatalog

```javascript
{
  parts: [
    {
      id: "heading-1",
      category: "heading",
      categoryLabel: "見出し",
      title: "シンプルな下線の見出し",
      html: "<h2 class=\"heading01\">見出しテキスト</h2>",
      css: ".heading01 { border-bottom: 2px solid #333; }"
    },
    // ... 222 件
  ],
  categories: [...],
  sourceUrl: "https://pote-chil.com/css-stock/ja"
}
```

### SelectControl オプション配列

```javascript
[
  { label: "パーツを選択", value: "" },
  { label: "[見出し] シンプルな下線の見出し", value: "heading-1" },
  { label: "[見出し] 左線の見出し", value: "heading-2" },
  // ...
  { label: "[ボタン] シンプルなボタン", value: "button-1" },
  // ... 全 222 件
]
```

## エッジケース

| ケース | 期待される振る舞い | 備考 |
|--------|-------------------|------|
| DesignInserterCatalog が未定義 | 空の parts 配列として処理 | `window.DesignInserterCatalog \|\| {}` |
| parts 配列が空 | SelectControl に「パーツを選択」のみ表示 | catalog JSON なし |
| 選択済み partId が catalog に存在しない | Notice（未選択状態）を表示 | getPart() が undefined を返す |
| CSS が空のパーツを選択 | プレビューに HTML のみ表示、style なし | `part.css ? el('style', ...) : null` |
| 非常に長い HTML のパーツ | プレビューがスクロール可能に表示 | editor.css で overflow 制御 |
| dangerouslySetInnerHTML で script 実行 | ブラウザの DOM 挿入では script は実行されない | React/DOM の仕様 |

## 受け入れ基準

- [ ] ブロック挿入後、サイドバーに「Design Inserter」パネルが表示されること
- [ ] SelectControl に 222 件 + 1（先頭の空オプション）= 223 オプションが表示されること
- [ ] オプションのラベルが `[カテゴリ名] パーツ名` 形式であること
- [ ] パーツ選択後、エディタ本体にプレビューが即座に表示されること
- [ ] SVG-only パーツのプレビューに style タグが含まれないこと
- [ ] 未選択状態で「CSS パーツを選択してください」メッセージが表示されること
- [ ] ページリロード後も選択状態が保持されること（属性として保存）
- [ ] JavaScript エラーがコンソールに出力されないこと

## 将来拡張（未実装）

以下は現在の spec に含まれないが、将来追加を検討する機能:

- テキスト検索フィルター
- カテゴリ別タブ/フィルター UI
- `@wordpress/scripts` によるビルドステップ導入
- プレビュー画像の表示
- カラーカスタマイズ UI（inputs メタデータ使用）

## 関連spec

- [gutenberg-block](gutenberg-block.md) — ブロック登録と属性定義
- [catalog](catalog.md) — エディタに渡すデータの構造
- [rendering](rendering.md) — フロントエンドレンダリング（save: null）
