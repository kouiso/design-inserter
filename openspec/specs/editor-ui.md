# Editor UI — Gutenberg エディタ UI

作成日: 2026-05-03
最終更新: 2026-08-02（実装に合わせて全面改訂 / issue #55）

## 概要

Gutenberg エディタ内で CSS Stock パーツと Template Party テンプレートを検索・選択・プレビューするための UI コンポーネント。vanilla JS で実装し、ビルドステップなしで動作する。

エディタ画面は 2 つの領域からなる:

- **探す（`ItemPicker`）** — InspectorControls（サイドバー）内。source フィルタ / 検索ボックス / カテゴリボタン / カードグリッド
- **選ぶ・調整（`LivePreview` / `TemplatePreview` + `CreatePageButton`）** — ブロック本体。選択中のデザインを隔離した iframe で表示する

> **⚠️ ドロップダウン（`SelectControl`）へ戻してはいけない。**
> 2026-05 時点の旧 spec は 223 オプションの `SelectControl` を規定していたが、実装はビジュアル picker に置き換わっている。
> プレビューの `<iframe sandbox>` 隔離（C-02）はカタログ HTML を編集画面へ直挿ししないための XSS 対策であり、
> `SelectControl` + `dangerouslySetInnerHTML` に戻すとこの防御が消える。

## 機能要件

### 共通

1. ファイルパス: `wp-content/plugins/designinserter/assets/editor.js`
2. IIFE パターンで WordPress グローバル変数（`wp.blocks` / `wp.element` / `wp.blockEditor` / `wp.components` / `wp.i18n` / `wp.data`）を注入する
3. InspectorControls 内に PanelBody「Design Inserter」を表示し、その中に `ItemPicker` を置く

### ItemPicker（探す）

4. ヘッダに `div.di-picker__guide`「探す — キーワードやカテゴリで候補を絞り込みます。」を表示する
5. **source フィルタ**: `div.di-picker__sources`（`role="group"`）に `catalog.sources` のボタンを描画する。各ボタンは `button.di-picker__source` で `aria-pressed` を持ち、選択中は `variant: primary`
   - `all`（すべて）/ `css-stock`（CSS Stock パーツ）/ `template-party`（Template Party）の 3 種
   - source を切り替えるとカテゴリ選択はリセットされる
   - `css-stock` を選ぶと template カードは 0 件になる
6. **検索**: `TextControl.di-picker__search`（placeholder `デザインを検索...`）。`title` / `categoryLabel` / `id` の大文字小文字を無視した部分一致で絞り込む
7. **カテゴリ**: `div.di-picker__cats`（`role="group"`）に「全て (件数)」＋現在の source に存在する `categoryLabel` のボタンを件数付きで描画する。`aria-pressed` を持つ
8. **カードグリッド**: `div.di-picker__grid`（`role="list"`）に絞り込み結果を描画する。パーツが先、テンプレートが後
   - `PartCard` = `button.di-card`。`previewImage` があれば `img.di-card__img`（`loading="lazy"` / `alt=""`）、無ければ `div.di-card__placeholder`（🎨）
   - `TemplateCard` = `button.di-card.di-card--template`。プレースホルダは 🖼️、加えて `span.di-card__badge`「テンプレ」を持つ
   - 選択中のカードは `.is-selected` と `span.di-card__selected-badge`「選択中」を持つ
   - 各カードは `aria-pressed` / `aria-label`（タイトル）/ `title` を持つ
9. **0 件時**: `div.di-picker__empty` に「該当するデザインがありません」を表示する。検索語かカテゴリが有効なときは「検索 / カテゴリをクリア」ボタンを併せて出す

### LivePreview（パーツを選んだとき）

10. `partId` の変化を `useEffect` で監視する。**`window.designInserterPartCodeFuncs[partId]`（`assets/part-code-funcs.js`）にローカル生成関数があれば、それを最優先で同期的に呼んで `html`/`css` を得る**。CSS Stock 222 件は全パーツがこの生成関数を持つ（`testPartCodeFuncs()` で担保）ため、主要カタログは REST を経由しない。生成関数が無いパーツ（現状は Template Party）のときだけ `window.fetch( restUrl + partId, { headers: { 'X-WP-Nonce': nonce } } )` で **REST から遅延ロード**する。カタログ全件の `html` / `css` は最初から配らない
11. REST 経路のみ: `AbortController` があれば前回のリクエストを中断する。到着したレスポンスの `data.id` が現在の `partId` と違えば捨てる（競合状態対策）
12. REST 経路のみ: 取得中は `div.di-preview--loading` に `Spinner`。再取得中は前のプレビューを残したまま `div.di-preview--refreshing` + `aria-busy="true"` + `div.di-preview__overlay` を重ねる。ローカル生成は同期的なのでローディング状態を経ない
13. 取得失敗時は `Notice`（status: error）に失敗理由（REST は HTTP ステータス併記の「プレビュー取得に失敗しました」、ローカル生成関数が例外を投げた場合は「プレビューの生成に失敗しました」）と「再試行」ボタンを出す
14. 取得成功時は `div.di-selection` にガイド「選ぶ / 調整」と `iframe.di-preview__iframe` を描画する
15. パーツ未選択時は `Notice`（status: info）で「左の「探す」エリアでデザインを選んでください」を表示する

### TemplatePreview / CreatePageButton（テンプレートを選んだとき）

16. `template.demoUrl` を `src` に持つ `iframe.di-preview__iframe`（高さ 480px）を描画する。`demoUrl` が無ければ「プレビューURLがありません」
17. ボタンの上に常時 `Notice`（status: info）「このテンプレートで固定ページを作成すると、公開ページはテンプレートのデモサイトへのリンクになります（テンプレート本体の HTML はこのプラグインに同梱されていません）。」を表示する。テンプレート本体（`data/template-party-bundles/`）は ToS 上再配布不可で配布 zip に常に含まれず、配布 zip の購入者環境では公開ページは `demoUrl` へリダイレクトされる（`templates/full-page.php`）ため、作成前に必ず案内する。ローカル bundle が存在する復号済み開発環境ではこの限りでない
18. 「このテンプレで固定ページを作成」ボタンから `POST {templatesRestUrl}{id}/create-page`（`X-WP-Nonce` 付き）を呼ぶ。`create-page` は `demoUrl` の有無を検証せずページを作成する。bundle も `demoUrl` も無いテンプレートを公開すると、公開ページは `wp_die()` による 404（「Template bundle not found. Please run the scraper to download template files.」）になる（`templates/full-page.php`）
19. 成功時は `div.di-create-page-result` に `Notice`（success）「固定ページを作成しました」と「ページを編集する →」リンクを出す。失敗時は `Notice`（error）

### InsertConfirmNotice

20. パーツ / テンプレートを選んだ直後に、公開済みなら「公開ページで確認」、下書きなら「プレビューで確認」リンク付きの `Notice`（success）を出す
21. `wp.data.useSelect( select => select('core/editor') )` で投稿状態を購読する。`useSelect` が無い環境では一度きりの読み取りにフォールバックする

## 非機能要件

1. **ビルドステップなし**: `@wordpress/scripts` を使用せず、`wp_register_script` で直接読み込む
2. **依存パッケージ**: `wp-blocks`, `wp-element`, `wp-components`, `wp-block-editor`, `wp-i18n`, `wp-data`
3. **データ供給**: `wp_localize_script` で `window.DesignInserterCatalog` にカタログのメタデータを設定する
4. **セキュリティ（C-02）**: パーツプレビューは `<iframe sandbox="" srcDoc=...>` に隔離する。
   - `sandbox` は空文字。script / form / popup / plugin / top-level navigation をすべて禁止する
   - **`allow-same-origin` は意図的に付与しない**。iframe を不透明オリジンに閉じ込めるため
   - カタログ HTML に `dangerouslySetInnerHTML` を使わない。改ざんされたカタログ JSON が編集画面で実行されるのを防ぐ
   - Template Party プレビューだけは外部サイトを読むため `sandbox="allow-scripts allow-same-origin"`
5. **ペイロード**: カタログには `html` / `css` を含めない。エディタに渡すのは表示に要る最小限の metadata で、実体は REST で 1 件ずつ取る。共通項目は id / title / categoryLabel / previewImage / source / type、パーツには `behavior` と `inputs`（色/ラジオ/レンジの調整 UI 定義。無いパーツには含まれない）、テンプレートには `demoUrl` / `bundleDir` を追加で含める
6. **権限**: `/parts/{id}` は `edit_posts`、`/templates/{id}/create-page` は `edit_pages` を要求する。プレビュー取得には `X-WP-Nonce` を付ける
7. **国際化**: `__()` 関数と `designinserter` テキストドメインを使用する（UI 文言には直書きの日本語も混在する）
8. **CSS スコープ**: パーツプレビューは iframe 内なので、パーツ CSS が編集画面へ漏れない

## データ構造

### window.DesignInserterCatalog

`designinserter_get_editor_catalog()`（`includes/data.php`）が生成する。

```javascript
{
  // CSS Stock 222 件 + Template Party 138 件
  parts: [ { id, title, categoryLabel, previewImage, source, type: "part",
             behavior?: { type, requiresJs, enhancementLevel },
             // 色/ラジオ/レンジの調整 UI を持つパーツにだけ付く。無ければキー自体が無い
             inputs?: {
               colors: [ { key, legend: { ja, en }, defaultValue } ],
               radios: [ { key, legend: { ja, en }, defaultValue, choices: [ { label: { ja, en }, value } ] } ],
               ranges: [ { key, legend: { ja, en }, defaultValue, min, max, step, unit: { ja, en } } ]
             } } ],
  // 1017 件
  templates: [ { id, title, categoryLabel, previewImage, source, type: "template", demoUrl, bundleDir } ],
  sources: [ { id: "all", label: "すべて" },
             { id: "css-stock", label: "CSS Stock パーツ" },
             { id: "template-party", label: "Template Party" } ],
  restUrl: "https://example.com/wp-json/designinserter/v1/parts/",
  templatesRestUrl: "https://example.com/wp-json/designinserter/v1/templates/",
  nonce: "abc123"
}
```

`source` は `"css-stock"` か `"template-party"`。`previewImage` は `DESIGNINSERTER_PLUGIN_URL` で絶対化済み。`behavior` は JS 挙動を持つパーツにだけ付く。

`html` と `css` はここに**入らない**。`GET {restUrl}{id}` が `{ id, html, css }` を返す。

## エッジケース

| ケース | 期待される振る舞い | 備考 |
|--------|-------------------|------|
| DesignInserterCatalog が未定義 | 空の parts / templates / sources として処理 | `window.DesignInserterCatalog \|\| {}` |
| parts / templates が空 | グリッドが空になり `.di-picker__empty` を表示 | catalog JSON なし |
| Template Party カタログが git-crypt ロック | CSS Stock 222 件だけで動作。template カードは 0 件 | `designinserter_get_catalog()` が復号できんファイルを読み飛ばす |
| `catalog.sources` が空 | source フィルタ行そのものを描画しない | `sources.length > 0` |
| 検索 / カテゴリで 0 件 | 「該当するデザインがありません」＋クリアボタン | `.di-picker__empty` |
| 選択済み partId が catalog に存在しない | REST が 404 → error Notice ＋再試行ボタン | `designinserter_get_part()` が null |
| REST が 401 / 403（nonce 期限切れ・未ログイン） | 「プレビュー取得に失敗しました (HTTP 403)」＋再試行 | `err.status` |
| 連打して partId が次々変わる | 古いレスポンスは `data.id !== partId` で捨てる | `AbortController` + id 照合 |
| CSS が空のパーツ | srcDoc の `<style>` にはプレビュー用の基本スタイル（`html,body` の margin / padding / font）だけが残り、パーツ固有 CSS の部分が空になる | `content.css \|\| ''` |
| カタログ HTML に `<script>` が混入 | `sandbox=""` により実行されない | C-02 |
| テンプレートに demoUrl が無い | 「プレビューURLがありません」 | — |
| create-page が権限不足 | error Notice に「ページ作成に失敗しました: HTTP 403」を表示する。現実装は REST の JSON ボディを読まず HTTP ステータスだけを出す | `edit_pages` |

## 受け入れ基準

- [ ] ブロック挿入後、サイドバーに「Design Inserter」パネルと picker が表示されること（DI-EDT-001）
- [ ] パーツ選択 UI がカードグリッド（`.di-picker__grid`）であり、`SelectControl` でないこと（DI-EDT-002）
- [ ] 検索ボックスで `title` / `categoryLabel` / `id` の部分一致絞り込みができること（DI-EDT-003）
- [ ] カテゴリボタンで絞り込みができ、件数が併記されること（DI-EDT-004）
- [ ] source フィルタが 3 種表示されること（DI-EDT-005）
- [ ] Template Party フィルタで template カードが「テンプレ」badge 付きで出ること（DI-EDT-006）
- [ ] デザインパーツフィルタで template カードが隠れること（DI-EDT-007）
- [ ] カードクリックでプレビューが表示されること（DI-EDT-008）
- [ ] 生成関数を持たないパーツ（現状 Template Party）は `window.fetch(restUrl + partId)` で遅延ロードされること。CSS Stock 222 件は `part-code-funcs.js` のローカル生成が優先され REST を経由しないこと（DI-EDT-009）
- [ ] プレビューが `sandbox=''` + `srcDoc` の iframe に隔離され、`dangerouslySetInnerHTML` を使わないこと（DI-EDT-010）
- [ ] 未選択状態で「左の「探す」エリアでデザインを選んでください」が表示されること
- [ ] 検索結果 0 件で「該当するデザインがありません」が表示されること（DI-EDT-014）
- [ ] ページリロード後も `partId` 属性が保持されること（DI-BLK-011）
- [ ] JavaScript エラーがコンソールに出力されないこと（DI-FE-010）
- [ ] `TemplatePreview` が `demoUrl` を iframe に描画すること。無ければ「プレビューURLがありません」が表示されること（DI-EDT-025）
- [ ] 固定ページ作成前に、公開ページがデモサイトへのリンクになる旨の `Notice` が常時表示されること（DI-EDT-026）
- [ ] 「このテンプレで固定ページを作成」ボタンから create-page REST が呼ばれること（DI-EDT-027）
- [ ] create-page 成功時に成功 `Notice` + 編集リンク、失敗時に error `Notice` が表示されること（DI-EDT-028）
- [ ] パーツ / テンプレート選択直後に `InsertConfirmNotice` が公開・下書き状態に応じたリンク付きで表示されること（DI-EDT-029）
- [ ] 投稿状態の変化に `useSelect` で追従すること。`wp.data.useSelect` が無い環境では一度きりの読み取りにフォールバックし、`InsertConfirmNotice` のリンク先が破綻しないこと（DI-EDT-030）

## 将来拡張（未実装）

- `@wordpress/scripts` によるビルドステップ導入
- カードグリッドの仮想スクロール（現状は parts 360 件 + templates 1,017 件、最大 1,377 件を一括描画）
- プレビュー iframe の高さ自動調整

## 関連spec

- [gutenberg-block](gutenberg-block.md) — ブロック登録と属性定義
- [catalog](catalog.md) — エディタに渡すデータの構造
- [rendering](rendering.md) — フロントエンドレンダリング（save: null）
