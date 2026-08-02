# Gutenberg Block — designinserter/css-part

作成日: 2026-05-03
最終更新: 2026-08-02（実装に合わせて改訂 / issue #55）

## 概要

WordPress Gutenberg エディタで CSS Stock パーツと Template Party テンプレートを扱う動的ブロック。利用者はサイドバーの検索付きビジュアル picker からデザインを選び、ブロック本体で隔離されたプレビューを確認する。フロントエンドの描画はサーバーサイドで行う。

> **⚠️ パーツ選択 UI を `SelectControl` へ戻してはいけない。**
> 旧 spec は 223 オプションのドロップダウンを規定していたが、実装は検索付きカードグリッドに置き換わっている。
> 詳細と禁止理由は [editor-ui](editor-ui.md) を参照。

## 機能要件

1. ブロック名: `designinserter/css-part`
2. タイトル: `Design Inserter` / 説明: `CSSデザインパーツを挿入`
3. カテゴリ: `design` / アイコン: `art`
4. キーワード: `css`, `design`, `parts`, `heading`, `button`, `box`
5. 属性:
   - `partId` (string, default: `""`) — catalog の part id
   - 選択中のテンプレートはブロック属性ではなく `useState` のローカル状態で保持する（テンプレートは固定ページ生成に使うだけで、ブロックとしては保存されない）
6. エディタのサイドバー（InspectorControls）に PanelBody「Design Inserter」を表示し、その中に `ItemPicker` を置く
7. `ItemPicker` は source フィルタ・検索ボックス・カテゴリボタン・カードグリッドで構成する（[editor-ui](editor-ui.md) 参照）
8. パーツを選ぶと `partId` を設定し、テンプレート選択を解除する。テンプレートを選ぶと `partId` を空にする（両者は排他）
9. パーツ選択時はブロック本体に `LivePreview` を表示する。プレビュー内容は REST から遅延ロードし、`<iframe sandbox="">` に隔離する
10. テンプレート選択時はブロック本体に `TemplatePreview`（demoUrl の iframe）と「このテンプレで固定ページを作成」ボタンを表示する
11. パーツ未選択時は Notice コンポーネントで選択を促すメッセージを表示する
12. 選択直後に `InsertConfirmNotice` で公開ページ / プレビューへの導線を出す
13. `save` 関数は `null` を返す（サーバーサイドレンダリング）
14. フロントエンドの描画は `designinserter_render_part()` を使用する

## 非機能要件

1. ビルドステップなし — `assets/editor.js` を直接 `wp_register_script` で読み込む
2. 依存: `wp-blocks`, `wp-element`, `wp-components`, `wp-block-editor`, `wp-i18n`, `wp-data`
3. catalog のメタデータは `wp_localize_script` で `DesignInserterCatalog` としてエディタに渡す。**`html` / `css` は渡さない**
4. パーツの HTML / CSS は `GET /designinserter/v1/parts/{id}`（`edit_posts` 必須・`X-WP-Nonce` 付き）で 1 件ずつ取得する
5. エディタプレビューは iframe の `srcDoc` 内に `<style>` としてインライン出力する。編集画面の DOM には挿入しない（C-02）
6. SVG-only パーツ（css が空）の場合、srcDoc の `<style>` が空になる
7. プラグイン停止時、保存済みブロックはフロントエンドで何も描画しない（空文字列を返す）

## データ構造

### ブロック属性（block.json 相当）

```json
{
  "apiVersion": 2,
  "name": "designinserter/css-part",
  "category": "design",
  "icon": "art",
  "attributes": {
    "partId": {
      "type": "string",
      "default": ""
    }
  }
}
```

### wp_localize_script で渡すデータ

`designinserter_get_editor_catalog()` の戻り値。完全な形は [editor-ui](editor-ui.md) の「データ構造」を参照。

```json
{
  "parts": [
    {
      "id": "heading-1",
      "title": "シンプルな見出し",
      "categoryLabel": "見出し",
      "previewImage": "https://example.com/wp-content/plugins/designinserter/assets/previews/heading-1.webp",
      "source": "css-stock",
      "type": "part"
    }
  ],
  "templates": [
    {
      "id": "tp_wa1_blue",
      "title": "和菓子店 ブルー",
      "categoryLabel": "和菓子店向け",
      "source": "template-party",
      "type": "template",
      "demoUrl": "https://template-party.com/...",
      "bundleDir": "wa1_blue"
    }
  ],
  "sources": [
    { "id": "all", "label": "すべて" },
    { "id": "css-stock", "label": "CSS Stock パーツ" },
    { "id": "template-party", "label": "Template Party" }
  ],
  "restUrl": "https://example.com/wp-json/designinserter/v1/parts/",
  "templatesRestUrl": "https://example.com/wp-json/designinserter/v1/templates/",
  "nonce": "abc123"
}
```

## エッジケース

| ケース | 期待される振る舞い | 備考 |
|--------|-------------------|------|
| catalog JSON が存在しない | カードグリッドが空になり `.di-picker__empty` を表示 | data.php が空配列を返す |
| catalog JSON が不正な JSON | 同上 | json_decode 失敗時に読み飛ばす |
| Template Party カタログが git-crypt ロック | CSS Stock 222 件だけで動作。template カードは 0 件 | 有償データが無い環境でも壊れない |
| 無効な partId が保存されている | フロントエンドで空文字列を返す | render.php が null チェック |
| プラグインが無効化された | 保存済みブロックがフロントエンドで非表示になる | dynamic block の仕様 |
| 360 件の一括描画 | カードグリッドが全件描画（仮想スクロールは未実装） | 現状の制限 |
| SVG-only パーツの選択 | プレビューに HTML のみ表示、style は空 | css フィールドが空文字列 |
| パーツとテンプレートを交互に選ぶ | 常にどちらか一方だけが選択状態になる | 相互に解除する |

## 受け入れ基準

- [ ] ブロック挿入パネルで「Design Inserter」が表示されること（DI-BLK-009）
- [ ] サイドバーの picker がカードグリッドで、CSS Stock 222 件 + Template Party 138 件 + テンプレート 1017 件を扱えること（DI-EDT-002）
- [ ] カード選択後、ブロック本体に sandbox iframe のプレビューが描画されること（DI-EDT-008 / DI-EDT-010）
- [ ] SVG-only パーツ選択時、style が空になること（DI-EDT-013）
- [ ] 投稿を保存し、フロントエンドで正しい HTML+CSS が描画されること（DI-BLK-010）
- [ ] 無効な partId の場合、フロントエンドで何も表示されないこと（DI-BLK-008）
- [ ] プラグイン無効化後、保存済み投稿でエラーが発生しないこと（DI-BLK-012）
- [ ] テンプレートカードから固定ページを作成できること（DI-API-019 / DI-E2E-009）

## 関連spec

- [rendering](rendering.md) — フロントエンドレンダリングの詳細
- [catalog](catalog.md) — picker に渡すデータの構造
- [editor-ui](editor-ui.md) — エディタ UI の実装詳細
