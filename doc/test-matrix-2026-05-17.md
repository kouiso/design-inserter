# Design Inserter — テスト仕様マトリクス + 動作確認結果 (2026-05-17)

## 目的

既存の `docs/testing.md` (実行手順 + smoke gate notes) と `scripts/test.mjs` (467 行・50 アサーション) を補完する **機能別 × 観点別 マトリクス** と、その時点の **動作確認結果ログ**。

`docs/testing.md` が「何をテストしているか」を自然文で説明する文書であるのに対し、本ドキュメントは「機能 × 正常系 / 異常系 / エッジケース」のマトリクスでカバレッジ可視化を行い、未カバー領域を明示する。

## 検証ソース表記 (verification-source-mandate)

| 項目 | ソース | コマンド |
|---|---|---|
| §B 動作確認結果 | **[ローカル実行 (npm test)]** | `npm test` 2026-05-17 ローカル WSL で実行、exit code 0 |
| §A マトリクス分類 | **[コード解析]** | `scripts/test.mjs` + `tests/render-smoke.php` の中身から再構成 |
| §C 未カバー領域 | **[コード解析]** | `docs/testing.md` の "Stub Smoke Gaps" 記述 + コードレビュー判断 |

実機ブラウザ巡回 (Playwright) は本ドキュメント時点で未実行。次フェーズで実施推奨。

---

## §A. 機能 × 観点 マトリクス

凡例:
- ✅ = 自動テストで覆われている
- 🟡 = 部分的 (smoke では検出可能だが gold path のみ)
- ❌ = 未カバー
- n/a = 該当しない

### 1. プラグイン読み込み / 初期化

| 機能 | 正常系 | 異常系 | エッジケース | テスト箇所 |
|---|---|---|---|---|
| プラグインメインファイル load | ✅ | ❌ ABSPATH 未定義時 exit | n/a | `render-smoke.php:14` |
| `init` hook 登録 | ✅ | n/a | n/a | `render-smoke.php:15` |
| `rest_api_init` hook 登録 | ✅ | n/a | n/a | `render-smoke.php:16` |
| `admin_menu` hook 登録 | ✅ | n/a | n/a | `render-smoke.php:17` |
| `wp_enqueue_scripts` base style enqueue | ✅ | n/a | n/a | `render-smoke.php:42-44` |

### 2. カタログ読み込み (data.php)

| 機能 | 正常系 | 異常系 | エッジケース | テスト箇所 |
|---|---|---|---|---|
| 222 パーツ JSON 読込 | ✅ | n/a | n/a | `render-smoke.php:51-52` / `test.mjs:229` |
| カタログ JSON 不在時 fallback | ✅ | ✅ 空 array 返却 | ✅ sourceUrl 維持 | `catalog-fallback.php missing` |
| カタログ JSON 不正時 fallback | ✅ | ✅ 空 array 返却 | n/a | `catalog-fallback.php invalid` |
| 28 カテゴリ件数一致 | ✅ | n/a | n/a | `test.mjs:230` |
| 各パーツ必須キー (id/sourcePartId/category/categoryLabel/title/html) | ✅ | ✅ 欠損検出 | n/a | `test.mjs:231` |
| パーツ id 形式 `slug-number` 検証 | ✅ | ✅ 不正 id 検出 | n/a | `test.mjs:232` |
| パーツ id 一意性 | ✅ | ✅ 重複検出 | n/a | `test.mjs:233` |
| カテゴリ別期待件数一致 | ✅ | ✅ 件数不一致検出 | n/a | `test.mjs:234` |
| `sanitize_key` 経由の id 正規化 | ✅ | n/a | ✅ `Heading-1!!` → `heading-1` | `render-smoke.php:65` |

### 3. レンダリング (render.php)

| 機能 | 正常系 | 異常系 | エッジケース | テスト箇所 |
|---|---|---|---|---|
| 通常パーツ HTML 出力 | ✅ | n/a | n/a | `render-smoke.php:54-59` |
| CSS `<style>` タグ出力 | ✅ | n/a | ✅ SVG-only パーツは style 省略 | `render-smoke.php:56, 94-96` |
| 同一 id 連続レンダ時の style 重複防止 | ✅ | n/a | ✅ 2 回目は style 省略 | `render-smoke.php:60-62` |
| 存在しない id 時の空文字返却 | ✅ | ✅ 空文字 | n/a | `render-smoke.php:64` |
| `aria-label` 出力 | ✅ | n/a | n/a | `render-smoke.php:58` |
| sourceUrl コメント出力 | ✅ | n/a | n/a | `render-smoke.php:55, 59` |
| 埋め込み asset URL 解決 (`src=assets/embedded/...`) | ✅ | n/a | ✅ url(...) 形式も対応 | `render-smoke.php:78-80` |
| 埋め込み asset 参照数 5 件固定 | ✅ | ✅ 件数変動検出 | n/a | `test.mjs:238` |
| 埋め込み asset ファイル存在 | ✅ | ✅ 不在検出 | n/a | `test.mjs:239` |
| 埋め込み asset 拡張子と中身一致 (magic byte) | ✅ | ✅ 不一致検出 | n/a | `test.mjs:240` |
| プレビュー画像 ローカル化 | ✅ | ✅ 外部 URL 検出 | n/a | `test.mjs:235-237` |

### 4. インタラクティブパーツの id/for/name スコープ化

| 機能 | 正常系 | 異常系 | エッジケース | テスト箇所 |
|---|---|---|---|---|
| modal の id/for 一致 | ✅ | n/a | n/a | `render-smoke.php:72-73` |
| modal の name 接頭辞 | ✅ | n/a | n/a | `render-smoke.php:74` |
| 複数 instance の id 衝突回避 | ✅ | n/a | ✅ 連続 render で別 scope | `render-smoke.php:75` |
| 生 id `modal-1__open` の残存禁止 | ✅ | ✅ 残存検出 | n/a | `render-smoke.php:76` |
| REST 経由の preview でも同じ scope ルール | ✅ | n/a | n/a | `render-smoke.php:136-142` |

### 5. ショートコード (`[designinserter_part]`)

| 機能 | 正常系 | 異常系 | エッジケース | テスト箇所 |
|---|---|---|---|---|
| ショートコード登録 | ✅ | n/a | n/a | `render-smoke.php:14` |
| `do_shortcode()` 経由レンダ | ✅ | n/a | ✅ SVG-only でも style 省略 | `render-smoke.php:102-104` |
| `the_content` filter 経由レンダ | ✅ | n/a | n/a | `render-smoke.php:110-112` |
| id 未指定時の挙動 | ❌ 未カバー (実装は空文字返却) | ❌ | ❌ | — |
| id="存在しない値" 時のフィードバック | ❌ 未カバー (実装は無音で空文字) | ❌ | ❌ | — (audit H-10 で指摘) |

### 6. 動的ブロック (Gutenberg)

| 機能 | 正常系 | 異常系 | エッジケース | テスト箇所 |
|---|---|---|---|---|
| ブロック type 登録 | ✅ | n/a | n/a | `render-smoke.php:28` |
| `do_blocks()` 経由レンダ | ✅ | n/a | n/a | `render-smoke.php:106-108` |
| editor script / style 登録 | ✅ | n/a | n/a | `render-smoke.php:26-27` |
| editor 用 catalog localize | ✅ | n/a | n/a | `render-smoke.php:29` |
| localized catalog の 222 件 / restUrl / nonce | ✅ | n/a | n/a | `render-smoke.php:46-49` |
| ブロック属性 `partId` の保持 | 🟡 do_blocks で間接的に確認 | ❌ | ❌ | `render-smoke.php:106-108` |
| editor.js の React 挙動 (Picker / LivePreview) | ❌ 未カバー (ブラウザ実行が必要) | ❌ | ❌ | — (audit C-01〜C-06 関連) |

### 7. REST API (`/designinserter/v1/parts/{id}`)

| 機能 | 正常系 | 異常系 | エッジケース | テスト箇所 |
|---|---|---|---|---|
| route 登録 + methods=GET | ✅ | n/a | n/a | `render-smoke.php:30, 121` |
| `id` 引数 required + sanitize | ✅ | ✅ 不正 id sanitize | n/a | `render-smoke.php:122-123` |
| permission_callback (`edit_posts` ある時 allow) | ✅ | n/a | n/a | `render-smoke.php:124-126` |
| permission_callback (`edit_posts` 無い時 deny) | n/a | ✅ false 返却 | n/a | `render-smoke.php:127-128` |
| dispatch (`rest_do_request`) | ✅ | ✅ `rest_forbidden` 403 | n/a | `render-smoke.php:146-152` |
| callback 成功時 html + css 返却 | ✅ | n/a | n/a | `render-smoke.php:130-132` |
| callback 存在しない id 時 `WP_Error not_found` | n/a | ✅ | n/a | `render-smoke.php:143-144` |
| callback の埋め込み asset URL 解決 | ✅ | n/a | n/a | `render-smoke.php:133-135` |
| callback のインタラクティブ scope (preview prefix) | ✅ | n/a | n/a | `render-smoke.php:136-142` |
| nonce 検証 | 🟡 wp-stubs で `test-nonce` 固定 | ❌ 無効 nonce | ❌ | — |

### 8. 管理画面設定ページ

| 機能 | 正常系 | 異常系 | エッジケース | テスト箇所 |
|---|---|---|---|---|
| `manage_options` capability 要求 | ✅ | n/a | n/a | `render-smoke.php:32` |
| ページ heading 出力 | ✅ | n/a | n/a | `render-smoke.php:37` |
| パーツ件数 222 出力 | ✅ | n/a | n/a | `render-smoke.php:38` |
| ソース URL 出力 | ✅ | n/a | n/a | `render-smoke.php:39` |
| ショートコード例出力 | ✅ | n/a | n/a | `render-smoke.php:40` |
| `scrapedAt` 表示 | ❌ 未実装 (audit H-09 で指摘) | n/a | n/a | — |

### 9. フロントエンド a11y enhancement (frontend.js)

| 機能 | 正常系 | 異常系 | エッジケース | テスト箇所 |
|---|---|---|---|---|
| 5 種 behavior handler 存在 (scrollTop/tooltip/readMore/tabs/modal) | ✅ | n/a | n/a | `test.mjs:275-279` |
| catalog 内 behavior type が frontend handler に存在 | ✅ | ✅ 不一致検出 | n/a | `test.mjs:289-291, 311` |
| `requiresJs` パーツの `rootSelector` 必須 | ✅ | ✅ 欠損検出 | n/a | `test.mjs:293-295, 312` |
| `requiresJs` パーツの `selectors` metadata 必須 | ✅ | ✅ 欠損検出 | n/a | `test.mjs:297-299, 313` |
| 期待 behavior 件数 (scrollTop=1/tooltip=5/readMore=4/tabs=4/modal=2) | ✅ | ✅ 件数変動検出 | n/a | `test.mjs:262-269, 314` |
| 実際の DOM 上での behavior 動作 | ❌ 未カバー (ブラウザ実行が必要) | ❌ | ❌ | — |
| Esc キーで modal 閉じる | ❌ 未カバー (ブラウザ実行が必要) | ❌ | ❌ | — |
| Arrow キーで tabs 移動 | ❌ 未カバー (ブラウザ実行が必要) | ❌ | ❌ | — |
| MutationObserver による動的追加 part への enhance | ❌ 未カバー | ❌ | ❌ | — |

### 10. ビルド配布 (`npm run build`)

| 機能 | 正常系 | 異常系 | エッジケース | テスト箇所 |
|---|---|---|---|---|
| zip 整合性 (`unzip -tq`) | ✅ | ✅ 破損検出 | n/a | `test.mjs:425` |
| zip 内の plugin 単一 root | ✅ | n/a | n/a | (`build-plugin-zip.mjs` 内) |
| 必須 source ファイル一式存在 | ✅ | ✅ 欠損検出 | n/a | `test.mjs:426` |
| dev/test/build ファイル除外 | ✅ | ✅ 混入検出 | n/a | `test.mjs:427` |
| catalog プレビュー画像存在 | ✅ | ✅ 欠損検出 | n/a | `test.mjs:428` |
| catalog 埋め込み asset 参照数固定 | ✅ | ✅ 件数変動検出 | n/a | `test.mjs:429` |
| catalog 埋め込み asset ファイル存在 | ✅ | ✅ 欠損検出 | n/a | `test.mjs:430` |
| Plugin header (Name/Version/WP/PHP/License) | ✅ | ✅ 欠損検出 | n/a | `test.mjs:431-436` |
| `DESIGNINSERTER_VERSION` 定数一致 | ✅ | ✅ 不一致検出 | n/a | `test.mjs:432` |
| `DESIGNINSERTER_SOURCE_URL` 定数一致 | ✅ | ✅ 不一致検出 | n/a | `test.mjs:433` |
| catalog 222 件 / 28 カテゴリ | ✅ | ✅ 件数変動検出 | n/a | `test.mjs:437-438` |

### 11. WordPress 実 ranite smoke (`npm run smoke:wp:portable`)

| 機能 | カバレッジ | テスト箇所 |
|---|---|---|
| 実 WP-CLI で plugin activate | ✅ | `scripts/wp-smoke.mjs` (assertion in test.mjs:392) |
| 実 WP marks plugin active | ✅ | `test.mjs:392` |
| 実 shortcode / hook 登録検証 | ✅ | `test.mjs:395` |
| 実 editor catalog 形 contract | ✅ | `test.mjs:396` |
| 実 REST route contract | ✅ | `test.mjs:398-400` |
| 実 admin page callback 出力 | ✅ | `test.mjs:401` |
| 実 CSS style 重複防止 | ✅ | `test.mjs:402` |
| 実 埋め込み asset URL 解決 | ✅ | `test.mjs:403, 406` |
| 実 interactive render scope | ✅ | `test.mjs:404-405` |
| 実 frontend base style 自動 enqueue | ✅ | `test.mjs:397` |
| 実 zip → 展開 → activate → shortcode 検証 | ✅ | `test.mjs:382-394` |

---

## §B. 動作確認結果 — 2026-05-17 ローカル実行

ローカル WSL (Linux 6.6.87.2) で `npm test` 実行。検証ソース: **[ローカル実行 (npm test)]**。

```
$ npm test
PASS: 50 / 50 assertions

Coverage areas confirmed:
- PHP syntax (plugin + theme + tests)
- JavaScript syntax (scripts + assets)
- Catalog shape (222 parts × 28 categories × required keys × id format × source URL)
- Catalog asset references (5 embedded refs, file existence, magic byte check)
- Catalog fallback (missing / invalid JSON)
- Behavior metadata coverage (scrollTop=1, tooltip=5, readMore=4, tabs=4, modal=2)
- Distribution shape (header, version constants, license, headers, totals)
- Editor asset contract (catalog localization, dynamic block save=null, dangerouslySetInnerHTML)
- Smoke script contract (portable smoke, Docker smoke, zip smoke)
- Build script contract (zip integrity, missing files, dev file exclusion)
- PHP WordPress stub smoke (54 assertions in render-smoke.php)

All local quality checks passed
```

| 項目 | 結果 |
|---|---|
| 終了 exit code | **0** |
| 失敗 assertion | **0** |
| 成功 assertion | **50** (test.mjs) + **54** (render-smoke.php 内部) |
| docker smoke (`npm run smoke:wp:docker`) | 未実行 (Docker daemon 起動要、本ターン skip) |
| portable smoke (`npm run smoke:wp:portable`) | 未実行 (php-sqlite3 / curl / unzip / network access 要、本ターン skip) |

### §B 補足 — smoke スイートの選択論

`npm test` (今回実行) = stub WordPress + 静的 contract test。これは Docker 不要で軽量。  
`npm run smoke:wp:portable` = WP-CLI + 実 WordPress 6.9.4 を `/tmp` に展開して plugin activate + shortcode/REST 等の実 ramine 検証。  
`npm run smoke:wp:docker` = `docker compose` で WordPress + MySQL を立てて実 ramine 検証 + admin UI の手動確認の準備までできる。

商用配布フローでは **3 段階** (`npm test` → `smoke:wp:portable` → `smoke:wp:docker`) を release 前に全 PASS にするのが理想。本ドキュメント時点で 1 段目のみ実行確認、2-3 段目は実行環境準備が必要。

---

## §C. 未カバー領域 (Gap)

`docs/testing.md` の "Stub Smoke Gaps" 節 + マトリクス §A の ❌ 行を統合:

| 領域 | 未カバーの内容 | 推奨補完手段 |
|---|---|---|
| **Gutenberg ブラウザ UI** | Picker での検索 / カテゴリ選択 / カード選択 / LivePreview の表示 / `dangerouslySetInnerHTML` レンダリング | Playwright E2E (新規導入)、または Docker smoke + 手動 QA |
| **editor.js 実行時 error** | ブラウザでの JS runtime error 検出 | Playwright + console error capture |
| **frontend.js の DOM 動作** | tabs Arrow キー操作、modal Esc キー、tooltip focus、readMore aria-expanded sync、scrollTop click、MutationObserver の動的 enhance | Playwright + interaction script |
| **REST nonce 実環境** | 実 WP の `wp_create_nonce` + `X-WP-Nonce` header の validate path | portable smoke 経由実 WP で確認、または手動 cURL |
| **WP.org 提出 metadata** | `readme.txt`, Stable tag, Tested up to | `npm run build` の verification 拡張 + WP.org 提出フロー時に確認 |
| **shortcode 不正 id 時のフィードバック** | 投稿者向けエラー表示 (現実装は無音で空文字) | audit H-10 で指摘、修正 PR 提案中 |
| **`scrapedAt` 表示** | 設定ページでのデータ鮮度表示 | audit H-09 で指摘 |
| **a11y 自動テスト** | axe-core 等での WCAG 違反検出 | Playwright + @axe-core/playwright |
| **CSS Stock side 更新追随** | catalog JSON の更新フロー、差分検出 | scrape スクリプトの整備 (別 issue) |
| **テーマカラー連動** | WP admin の 9 色テーマで selected 状態が適切表示されるか | audit M-01 で指摘 |

## §D. 次フェーズ提案

1. **Playwright 導入** (PR 別建て)
   - SP 375 / tablet 768 / desktop 1280 の 3 viewport
   - Docker compose 起動 → WP install → plugin activate → editor 巡回
   - Picker C-01〜C-06 シナリオを自動化
   - `@axe-core/playwright` で a11y 違反を機械検出

2. **CI workflow 化** (PR 別建て)
   - `.github/workflows/test.yml` で `npm test` を PR ごと自動実行
   - `smoke:wp:portable` は heavy だが nightly cron 推奨

3. **`docs/test-strategy.md` 体系化** (本ドキュメントを発展)
   - 本ドキュメント §A を「テスト戦略の正本」として `docs/test-strategy.md` に昇格
   - test.mjs の各 testFn と本 doc の§A 行を双方向リンク

---

## メモ

- 監査対象に含めなかった: WP.org 提出フロー、`scripts/wp-smoke.mjs` の 700+ LOC の Docker smoke 部分の詳細
- 本ドキュメントは 2026-05-17 時点の snapshot。test.mjs / render-smoke.php の追加に伴い更新が必要
- Cross-reference: `doc/ux-audit-2026-05-16.md` (前日マージ PR #4) と本ドキュメントは姉妹関係。UX audit は「品質ギャップ発見」、本ドキュメントは「品質測定の網羅性確認」
