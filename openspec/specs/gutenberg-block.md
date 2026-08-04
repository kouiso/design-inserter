# Gutenberg Block — designinserter/css-part

作成日: 2026-05-03

## 概要

WordPress Gutenberg エディタでデザインパーツを挿入するための動的ブロック。ユーザーはサイドバーからパーツを選択し、エディタ内でライブプレビューを確認できる。フロントエンドの描画はサーバーサイドで行う。

## 機能要件

1. ブロック名: `designinserter/css-part`
2. カテゴリ: `widgets`
3. アイコン: `insert`
4. 属性:
   - `partId` (string, default: `""`) — catalog の part id
5. エディタのサイドバー（InspectorControls）に PanelBody を表示する
6. PanelBody 内に SelectControl でパーツ一覧を表示する
7. SelectControl のオプションは `[categoryLabel] title` 形式でカテゴリごとにグループ化する
8. パーツ選択時、エディタ本体にライブプレビュー（HTML + CSS）を表示する
9. パーツ未選択時は Notice コンポーネントで選択を促すメッセージを表示する
10. `save` 関数は `null` を返す（サーバーサイドレンダリング）
11. フロントエンドの描画は `designinserter_render_part()` を使用する

## 非機能要件

1. ビルドステップなし — `assets/editor.js` を直接 `wp_register_script` で読み込む
2. 依存: `wp-blocks`, `wp-element`, `wp-components`, `wp-block-editor`, `wp-i18n`
3. catalog データは `wp_localize_script` で `DesignInserterCatalog` としてエディタに渡す
4. エディタプレビューの CSS は `<style>` タグでインライン出力する
5. SVG-only パーツ（css が空）の場合、`<style>` タグを出力しない
6. プラグイン停止時、保存済みブロックはフロントエンドで何も描画しない（空文字列を返す）

## データ構造

### ブロック属性（block.json 相当）

```json
{
  "apiVersion": 2,
  "name": "designinserter/css-part",
  "attributes": {
    "partId": {
      "type": "string",
      "default": ""
    }
  }
}
```

### wp_localize_script で渡すデータ

```json
{
  "parts": [
    {
      "id": "heading-1",
      "category": "heading",
      "categoryLabel": "見出し",
      "title": "シンプルな見出し",
      "html": "<h2 class=\"...\">...</h2>",
      "css": ".heading { ... }"
    }
  ],
  "categories": [...],
  "sourceUrl": "https://pote-chil.com/css-stock/ja"
}
```

## エッジケース

| ケース | 期待される振る舞い | 備考 |
|--------|-------------------|------|
| catalog JSON が存在しない | SelectControl のオプションが空、Notice を表示 | data.php が空配列を返す |
| catalog JSON が不正な JSON | 同上 | json_decode 失敗時の処理 |
| 無効な partId が保存されている | フロントエンドで空文字列を返す | render.php が null チェック |
| プラグインが無効化された | 保存済みブロックがフロントエンドで非表示になる | dynamic block の仕様 |
| 222 件の一括表示 | SelectControl が全件表示（将来的に検索 UI 追加） | 現状の制限 |
| SVG-only パーツの選択 | プレビューに HTML のみ表示、style タグなし | css フィールドが空文字列 |

## 受け入れ基準

- [ ] ブロック挿入パネルで「Design Inserter」が表示されること
- [ ] サイドバーの SelectControl に 222 件のパーツが表示されること
- [ ] パーツ選択後、エディタ内に HTML+CSS のプレビューが描画されること
- [ ] SVG-only パーツ選択時、style タグが出力されないこと
- [ ] 投稿を保存し、フロントエンドで正しいHTML+CSS が描画されること
- [ ] 無効な partId の場合、フロントエンドで何も表示されないこと
- [ ] プラグイン無効化後、保存済み投稿でエラーが発生しないこと

## 関連spec

- [rendering](rendering.md) — フロントエンドレンダリングの詳細
- [catalog](catalog.md) — SelectControl に渡すデータの構造
- [editor-ui](editor-ui.md) — エディタ UI の実装詳細
