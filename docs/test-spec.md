# Design Inserter テスト仕様書

## 1. 本書の位置づけ

本書は design-inserter の**テストに関する唯一の正本**。何を検証するか（台帳）、どう実行するか（手順）、今どこまで検証できとるか（現状）を1本に集約する。

商用配布するプラグインなので、「動いたと思う」やなく「どのケースが、どの証拠で担保されとるか」を追えることを目的にする。

### SSOT の関係

```text
openspec/specs/*.md   要件・仕様の正本（受け入れ基準 65 項目）
        │
        ├─ docs/requirements.md   要件（FR / NFR / 成功基準 6 項目）
        ├─ docs/specifications.md 詳細仕様（JSON スキーマ・出力 HTML）
        ↓
本書 docs/test-spec.md   受け入れ基準 → テストケース ID → 検証手段 の対応表
        ↓
tests/ · scripts/test.mjs   実際のテストコード
```

上流（openspec / requirements）が変わったら本書の台帳を更新する。本書が変わったらテストコードを更新する。逆流はさせん。

### 他ドキュメントとの分担

| ファイル | 担当 |
|---|---|
| `docs/testing.md` | ツールの使い方（portable smoke の環境変数・バージョン pin など）。テストケースの列挙は持たん |
| `openspec/specs/*.md` | 受け入れ基準の原文。本書 §6 が ID へ対応付ける |
| `docs/requirements.md` / `docs/specifications.md` | 要件と仕様。テストの正本やない |

## 2. テスト環境

| 環境 | 用途 | 起動 | 接続先 | 前提 |
|---|---|---|---|---|
| ローカル静的 | Phase 1・2・3 | 不要 | — | PHP 8.2 / Node 22+ / Composer（ローカルの Composer・PHPUnit・PHPCS 用。配布プラグインの実行要件は PHP 7.4+） |
| Docker dev WP | Phase 5 実機確認 | `docker compose up -d --wait` | `http://localhost:8080`（`admin` / `admin`） | Docker 稼働。ポート 8080・3316 が空いとること |
| Playwright E2E（fresh install） | Phase 4 | `npm run e2e:fresh` | ポート 18082（spec が専用 compose を生成） | Docker 稼働。Chromium |
| Playwright E2E（Template Party） | Phase 4 | `npm run e2e:template-party` | ポート 18083（同上） | Docker 稼働。Chromium。git-crypt 復号済み |
| portable WP smoke | Phase 3 | `npm run smoke:wp:portable` | 一時ディレクトリ | WP 6.9.4 / WP-CLI 2.12.0 を取得。詳細は `docs/testing.md` |

Docker dev stack は `wp-content/themes` と `wp-content/plugins` をバインドマウントするので、プラグインの編集が即反映される。WP-CLI は `npm run wp -- <コマンド>`。

### git-crypt と Template Party データ

`data/template-party-parts.json` / `template-party-templates.json` / `assets/previews/tp-*` は Template Party の ToS（再配布禁止）に従って git-crypt で暗号化してある。鍵を持たん環境では復号できず、`designinserter_get_catalog()` は CSS Stock の 222 件だけを返す。

テストはこの2モードを自分で判定する（`tests/tp-availability.php`）。

| モード | パーツ数 | カテゴリ数 | テンプレート数 |
|---|---|---|---|
| `css-stock only`（鍵なし） | 222 | 28 | 0 |
| `css-stock + template-party`（鍵あり） | 360 | 28 超 | 1017 |

Template Party 依存のアサーションは鍵なしモードで **skip として件数と理由を出力する**。黙って通すと「検証済み」と誤読されるため。

## 3. テストケース ID 体系

`DI-<カテゴリ>-<3桁連番>`。連番はカテゴリ内で通し。廃止したケースは番号を再利用せず `(廃止)` と記す。

| Prefix | 対象 |
|---|---|
| `DI-CAT` | カタログ JSON のデータ整合性 |
| `DI-DAT` | データ層 PHP（`includes/data.php`） |
| `DI-RND` | レンダリング（`includes/render.php`） |
| `DI-SCP` | インタラクティブ属性（id / for / name）のスコープ化 |
| `DI-BLK` | Gutenberg ブロック |
| `DI-EDT` | エディタ UI（picker・検索・プレビュー） |
| `DI-SC` | ショートコード |
| `DI-API` | REST API |
| `DI-TPL` | フルページテンプレート |
| `DI-ADM` | 管理画面 |
| `DI-FE` | frontend.js の DOM 挙動・a11y |
| `DI-SEC` | セキュリティ |
| `DI-BLD` | ビルド・配布 |
| `DI-CMP` | 互換性・ライフサイクル |
| `DI-SCR` | スクレイパー |
| `DI-E2E` | 統合シナリオ |

### 現状ステータス

| 語 | 意味 |
|---|---|
| `自動済` | 既存テストで自動検証されており、直近の実行で GREEN |
| `手動要` | 自動化されておらず、Docker WP での実機確認が要る |
| `未実装` | テストが存在せん。実装側の欠落を含む |
| `環境制約NG` | Docker 未起動 / git-crypt ロックで本環境では実行不可 |
| `不整合` | spec と実装が乖離しとる。判定前に spec 側の更新が要る |

### 検証ソースの表記

- `[ローカル実行]` … 手元でコマンドを実行して出力を確認した
- `[実機目視]` … ブラウザまたは端末で画面を見た
- `[CI]` … GitHub Actions の結果を確認した

コミットメッセージや報告文の記述は検証ソースとして認めん。

---

## 4. テストケース台帳

「現状」列の日付は最終実測日。日付が無いものは未実測（予測やなく未確認として扱う）。

### 4.1 DI-CAT — カタログデータ整合性

| ID | 確認内容 | 期待結果 | 検証方法 | 現状 |
|---|---|---|---|---|
| DI-CAT-001 | parts が 222 件 | `total === expectedTotal === 222` | `scripts/test.mjs` `testCatalog()` | 自動済 2026-07-28 |
| DI-CAT-002 | categories が 28 件 | 28 | 同上 | 自動済 2026-07-28 |
| DI-CAT-003 | sourceName が `CSS Stock` | 一致 | 同上 | 自動済 2026-07-28 |
| DI-CAT-004 | 全 parts に必須キーが揃う | id / sourcePartId / category / categoryLabel / title / html の欠損 0 | 同上 | 自動済 2026-07-28 |
| DI-CAT-005 | 全 id が `{categorySlug}-{sourcePartId}` 形式 | 違反 0 | 同上 | 自動済 2026-07-28 |
| DI-CAT-006 | id が全件ユニーク | 重複 0 | 同上 | 自動済 2026-07-28 |
| DI-CAT-007 | カテゴリ実件数が `expectedPartCount` と一致 | 不一致 0 | 同上 | 自動済 2026-07-28 |
| DI-CAT-008 | SVG-only パーツの css が空文字列 | 1 件以上存在し全て空 | 同上 | 自動済 2026-07-28 |
| DI-CAT-009 | sourceUrl が CSS Stock のアンカー付き URL | 違反 0 | 同上 | 自動済 2026-07-28 |
| DI-CAT-010 | previewImage がローカル相対パス | 外部 URL 0 | 同上 | 自動済 2026-07-28 |
| DI-CAT-011 | previewImage の実ファイルが存在 | 欠損 0 | 同上 | 自動済 2026-07-28 |
| DI-CAT-012 | preview の拡張子とマジックバイトが一致 | 不一致 0（svg / webp / gif / png） | 同上 | 自動済 2026-07-28 |
| DI-CAT-013 | 埋め込み asset 参照数が 5 | 5 | 同上 | 自動済 2026-07-28 |
| DI-CAT-014 | 埋め込み asset の実ファイルが存在 | 欠損 0 | 同上 | 自動済 2026-07-28 |
| DI-CAT-015 | 埋め込み asset の拡張子と実体が一致 | 不一致 0 | 同上 | 自動済 2026-07-28 |
| DI-CAT-016 | PHP `json_decode` がエラーを出さん | fatal なし | `tests/render-smoke.php` | 自動済 2026-07-28 [ローカル実行] |
| DI-CAT-017 | JSON が 2 スペース整形済み | `JSON.stringify(data, null, 2)` と一致 | — | 未実装 |
| DI-CAT-018 | behavior type が frontend.js のハンドラ 5 種に含まれる | 未対応 0 | `scripts/test.mjs` `testBehaviorMetadata()` | 自動済 2026-07-28 |
| DI-CAT-019 | `requiresJs` パーツが `rootSelector` を持つ | 欠損 0 | 同上 | 自動済 2026-07-28 |
| DI-CAT-020 | `requiresJs` パーツが `selectors` を持つ | 欠損 0 | 同上 | 自動済 2026-07-28 |
| DI-CAT-021 | behavior 件数の内訳 | scrollTop 1 / tooltip 5 / readMore 4 / tabs 4 / modal 2（計 16） | 同上 | 自動済 2026-07-28 |
| DI-CAT-022 | Template Party パーツが 138 件 | 138 | `DesignInserterCoreTest::test_catalog_template_party_parts_have_correct_source` | 自動済 2026-07-30 [ローカル実行] |
| DI-CAT-023 | Template Party テンプレートが 1017 件 | 1017 | `DesignInserterCoreTest::test_get_templates_returns_all_template_party_templates` | 自動済 2026-07-30 [ローカル実行] |
| DI-CAT-024 | 全 parts に `inputs`（`colors` / `radios` / `ranges`）が定義される | 欠損 0、構造 `{ colors: [], radios: [], ranges: [] }` | `scripts/test.mjs` `testCatalog()` | 自動済 2026-07-30 |

### 4.2 DI-DAT — データ層

| ID | 確認内容 | 期待結果 | 検証方法 | 現状 |
|---|---|---|---|---|
| DI-DAT-001 | 2 ソースをマージして 360 件 | 360 | `DesignInserterCoreTest::test_catalog_merges_css_stock_and_template_party_parts` | 自動済 2026-07-30 [ローカル実行] |
| DI-DAT-002 | css-stock 由来に `source='css-stock'` | 222 件 | `test_catalog_css_stock_parts_have_correct_source` | 自動済 2026-07-28 |
| DI-DAT-003 | TP 由来に `source='template-party'` | 138 件 | `test_catalog_template_party_parts_have_correct_source` | 自動済 2026-07-30 [ローカル実行] |
| DI-DAT-004 | categories が slug で重複排除される | 重複 0 | `test_catalog_categories_have_no_duplicate_slugs` | 自動済 2026-07-28 |
| DI-DAT-005 | TP カタログが復号できん環境で CSS Stock 単独で正常動作する | fatal なし。222 件で動作し、TP 依存アサーションが skip として報告される | `tests/tp-availability.php` + `tests/render-smoke.php` + PHPUnit `requireTemplateParty()` | 自動済 2026-07-28 |
| DI-DAT-006 | catalog が static キャッシュされ 1 リクエスト最大 1 回しか decode せん | 2 回目でファイル I/O が起きん | — | 未実装 |
| DI-DAT-007 | カタログファイル欠損時に致命的エラーにならん | exit 0 | `tests/catalog-fallback.php missing` | 自動済 2026-07-28 |
| DI-DAT-008 | カタログ JSON 破損時に致命的エラーにならん | exit 0 | `tests/catalog-fallback.php invalid` | 自動済 2026-07-28 |
| DI-DAT-009 | `designinserter_get_part()` が `sanitize_key` で正規化して引ける | `' Heading-1 '` → `heading-1` | `render-smoke.php` / `test_get_part_sanitizes_and_finds_known_part` | 自動済 2026-07-28 |
| DI-DAT-010 | 数値 id を index として引く後方互換経路 | `designinserter_get_part('3')` が 3 件目を返す | — | 未実装。仕様として残すか要判断（§7 参照） |
| DI-DAT-011 | 存在しない id で null | null | `render-smoke.php` | 自動済 2026-07-28 |
| DI-DAT-012 | `designinserter_get_template()` が既知 ID を返す | `tp_wa1_blue` + demoUrl / bundleDir | `test_get_template_by_id_returns_known_template` | 自動済 2026-07-30 [ローカル実行] |
| DI-DAT-013 | 未知 template ID で null | null | `test_get_template_returns_null_for_unknown_id` | 自動済 2026-07-28 |
| DI-DAT-014 | editor catalog が parts + templates を露出 | 360 / 1017 | `test_editor_catalog_exposes_merged_parts_and_templates` | 自動済 2026-07-30 [ローカル実行] |
| DI-DAT-015 | editor catalog の source フィルタが 3 種 | all / css-stock / template-party | `test_editor_catalog_exposes_three_source_filters` | 自動済 2026-07-28 |
| DI-DAT-016 | editor catalog の template エントリが必須フィールドを持つ | id / type / source / demoUrl / bundleDir | `test_editor_catalog_template_entries_have_required_fields` | 自動済 2026-07-30 [ローカル実行] |
| DI-DAT-017 | editor catalog が restUrl / nonce / templatesRestUrl を持つ | 3 キー存在 | `render-smoke.php`（restUrl / nonce）/ `test_editor_catalog_exposes_merged_parts_and_templates`（templatesRestUrl） | 自動済 2026-07-28 |
| DI-DAT-018 | previewImage がプラグイン URL に絶対化される | `PLUGIN_URL + assets/previews/` 前置 | `test_editor_catalog_exposes_merged_parts_and_templates` | 自動済 2026-07-28 |
| DI-DAT-019 | `designinserter_sanitize_bundle_dir()` がパストラバーサルを除去 | `../../etc` → `etc` | — | 未実装（DI-SEC-008 と対） |

### 4.3 DI-RND — レンダリング

| ID | 確認内容 | 期待結果 | 検証方法 | 現状 |
|---|---|---|---|---|
| DI-RND-001 | 有効 partId で HTML + CSS + コメントを出力 | `<!-- Design Inserter:` を含む | `render-smoke.php` | 自動済 2026-07-28 |
| DI-RND-002 | style タグに `data-designinserter-style="{id}"` | 含む | `render-smoke.php` / `test_render_part_outputs_scoped_markup_and_source` | 自動済 2026-07-28 |
| DI-RND-003 | wrapper に `data-designinserter-id` | 含む | 同上 | 自動済 2026-07-28 |
| DI-RND-004 | wrapper に `aria-label` | 含む | `render-smoke.php` | 自動済 2026-07-28 |
| DI-RND-005 | コメントに source URL（アンカー付き） | `.../heading#1` | 同上 | 自動済 2026-07-28 |
| DI-RND-006 | 無効 partId で空文字列 | `''` | 同上 | 自動済 2026-07-28 |
| DI-RND-007 | SVG-only パーツで style タグを出さん | style 無し | 同上 | 自動済 2026-07-28 |
| DI-RND-008 | 同一 part の 2 回目で style を重複出力せん | 2 回目は wrapper のみ | 同上 | 自動済 2026-07-28 |
| DI-RND-009 | form / input を含むパーツが破壊されん | `<input` 残存 | 同上 | 自動済 2026-07-28 |
| DI-RND-010 | `sanitize_key` で不正文字が除去される | `Heading-1!!` → `heading-1` | 同上 | 自動済 2026-07-28 |
| DI-RND-011 | 埋め込み asset の `src=` がプラグイン URL に解決される | 相対パスが残らん | 同上 | 自動済 2026-07-28 |
| DI-RND-012 | CSS の `url(assets/...)` がプラグイン URL に解決される | 絶対 URL + ダブルクォート | `test_asset_urls_are_resolved_to_plugin_urls` | 自動済 2026-07-28 |
| DI-RND-013 | behavior 属性 `data-designinserter-behavior` を出力 | tooltip-1 で `="tooltip"` | `render-smoke.php` | 自動済 2026-07-28 |
| DI-RND-014 | `rootSelector` がある場合 `data-designinserter-root-selector` を出力 | 属性出力 | — | 未実装 |
| DI-RND-015 | requiresJs パーツが frontend script / style を enqueue | 両方 enqueued | `render-smoke.php` / `test_render_part_enqueues_behavior_assets` | 自動済 2026-07-28 |
| DI-RND-016 | requiresJs でないパーツでは frontend script を enqueue せん | 未 enqueue | — | 未実装 |
| DI-RND-017 | title に HTML 特殊文字を含むパーツで属性が壊れん | `esc_attr` 済み | — | 未実装 |
| DI-RND-018 | 同一ページに 10 パーツ配置しても CSS が各 1 回だけ出る | style タグ 10 種・重複 0 | 実機: 投稿に 10 ブロック配置 → フロントで view-source | 手動要 |

### 4.4 DI-SCP — 属性スコープ化

| ID | 確認内容 | 期待結果 | 検証方法 | 現状 |
|---|---|---|---|---|
| DI-SCP-001 | `id` と `for` が同一値にスコープ化される | modal-1 で一致 | `render-smoke.php` | 自動済 2026-07-28 |
| DI-SCP-002 | `name` がスコープ化される | `modal-1__trigger__di-modal-1-N` | 同上 | 自動済 2026-07-28 |
| DI-SCP-003 | 同一パーツ複数回描画で id が衝突せん | 1 回目 ≠ 2 回目 | 同上 | 自動済 2026-07-28 |
| DI-SCP-004 | 生 id（`modal-1__open`）が残らん | 含まん | 同上 | 自動済 2026-07-28 |
| DI-SCP-005 | scope 接尾辞が `sanitize_html_class` を通る | 正規表現一致 | `test_render_part_enqueues_behavior_assets` | 自動済 2026-07-28 |
| DI-SCP-006 | REST プレビューでも同じスコープ化がかかる | `di-preview-modal-1-` 接頭辞 | `render-smoke.php` | 自動済 2026-07-28 |
| DI-SCP-007 | 同一ページの modal を 2 個置いて独立動作する | 片方の操作が他方に影響せん | 実機: 2 ブロック配置 → フロントで両方開閉 | 手動要 |

### 4.5 DI-BLK — Gutenberg ブロック

| ID | 確認内容 | 期待結果 | 検証方法 | 現状 |
|---|---|---|---|---|
| DI-BLK-001 | `init` で `designinserter/css-part` が登録される | 登録済み | `render-smoke.php` | 自動済 2026-07-28 |
| DI-BLK-002 | editor script / style が register される | 4 ハンドル | 同上 | 自動済 2026-07-28 |
| DI-BLK-003 | `wp_localize_script` で `DesignInserterCatalog` を注入 | 存在 | 同上 | 自動済 2026-07-28 |
| DI-BLK-004 | render_callback が PHP 側にある（dynamic block） | `'render_callback' => 'designinserter_render_block'` | `scripts/test.mjs` `testEditorAssetContract()` | 自動済 2026-07-28 |
| DI-BLK-005 | `save` が null を返す | `return null;` | 同上 | 自動済 2026-07-28 |
| DI-BLK-006 | `do_blocks()` でフロント HTML が描画される | `data-designinserter-id="heading-2"` + style | `render-smoke.php` | 自動済 2026-07-28 |
| DI-BLK-007 | `the_content` フィルタ経由で描画される | heading-5 描画 | 同上 | 自動済 2026-07-28 |
| DI-BLK-008 | 無効 partId のブロックがフロントで何も出さん | 空 | ブロック経路での直接検証は未実装（render 経路は DI-RND-006） | 未実装 |
| DI-BLK-009 | ブロック挿入パネルに Design Inserter が出る | 表示 | `tests/e2e/fresh-install-222.spec.mjs` エディタテスト | 自動済 2026-07-29 [ローカル実行] |
| DI-BLK-010 | 投稿保存後、フロントで正しい HTML + CSS が描画される | 一致 | `fresh-install-222.spec.mjs` 222 パーツテスト | 自動済 2026-07-30 [ローカル実行] |
| DI-BLK-011 | リロード後も `partId` 属性が保持される | 選択維持 | 実機: エディタ再読込 | 手動要 |
| DI-BLK-012 | プラグイン無効化後、保存済み投稿がエラーにならん | 500 なし・出力が消える | 実機: `wp plugin deactivate` → フロント表示 | 手動要 |
| DI-BLK-013 | 再有効化で出力が復活する | 復活 | 実機: `wp plugin activate` | 手動要 |
| DI-BLK-014 | ブロック属性に `params` / `html` / `css` が追加される | `attributes` 登録済み | `scripts/test.mjs` `testEditorAssetContract()` | 自動済 2026-07-30 |
| DI-BLK-015 | 保存時に `html` / `css` が属性として永続化される | `serialize( { html, css } )` | `assets/editor.js` `save` | 自動済 2026-07-30 |
| DI-BLK-016 | 保存済みブロックを開き直しても `params` の調整値が既定値へ再初期化されない | `params` か `html`/`css` が既に埋まっていれば初期化 useEffect が走らない | `assets/editor.js` `edit` 関数の初期化 `useEffect`（`partId` 依存） | 自動済（コード契約） |
| DI-BLK-017 | `html` / `css` は保存済み `params` を現在の generator に通した結果へ自動的に再同期される（`params` 自体は変わらないが、generator 側の出力が変わればそれに追従する） | `LivePreview` が再計算した `content` を `onContentChange()` で書き戻す | `assets/editor.js` `LivePreview` / `onContentChange` | 自動済（コード契約） |

### 4.6 DI-EDT — エディタ UI

| ID | 確認内容 | 期待結果 | 検証方法 | 現状 |
|---|---|---|---|---|
| DI-EDT-001 | サイドバーに Design Inserter パネルが出る | 表示 | `fresh-install-222.spec.mjs` | 自動済 2026-07-29 [ローカル実行] |
| DI-EDT-002 | パーツ選択 UI の形式 | 検索付きビジュアル picker（`.di-picker__grid`）。`SelectControl` ではない | openspec `editor-ui.md` / `gutenberg-block.md` を実装に合わせて改訂（2026-08-02）+ `scripts/test.mjs` `testEditorAssetContract()` | 自動済 2026-08-02 [ローカル実行] |
| DI-EDT-003 | 検索ボックスで絞り込める | 該当のみ表示 | `fresh-install-222.spec.mjs` | 自動済 2026-07-29 [ローカル実行] |
| DI-EDT-004 | カテゴリボタンで絞り込める | 該当のみ | 同上 | 自動済 2026-07-29 [ローカル実行] |
| DI-EDT-005 | source フィルタ 3 種が表示される | 3 ボタン | `tests/e2e/template-party.spec.mjs` | 自動済 2026-07-30 [ローカル実行] |
| DI-EDT-006 | Template Party フィルタで template カードが badge 付きで出る | badge 表示 | 同上 | 自動済 2026-07-30 [ローカル実行] |
| DI-EDT-007 | デザインパーツフィルタで template カードが隠れる | parts のみ | 同上 | 自動済 2026-07-30 [ローカル実行] |
| DI-EDT-008 | カードクリックでプレビューが即表示される | プレビュー描画 | `fresh-install-222.spec.mjs` | 自動済 2026-07-29 [ローカル実行] |
| DI-EDT-009 | 生成関数の無いパーツ（現状 Template Party）だけが REST 経由で遅延ロードされる。CSS Stock 222 件はローカル生成が優先され REST を経由しない | `window.fetch(restUrl + partId)` はローカル生成関数が無い場合のみ | `scripts/test.mjs` `testPartCodeFuncs()`（CSS Stock 222 件全件に生成関数がある事を担保）+ `testEditorAssetContract()`（REST 経路のコード存在チェック）。generator-first の優先順位そのものの実行時検証は `tests/e2e/template-party.spec.mjs` の TP カードプレビュー経路のみ | 自動済（構造的な担保。優先順位の E2E 実行はこの環境では未実施） |
| DI-EDT-010 | プレビューが sandbox iframe に隔離される | `sandbox: ''` + `srcDoc` | 同上 | 自動済 2026-07-28 |
| DI-EDT-011 | カタログ HTML に `dangerouslySetInnerHTML` を使わん | 不使用 | 同上 | 自動済 2026-07-28 |
| DI-EDT-012 | template プレビュー iframe の sandbox 強度 | `allow-scripts allow-same-origin`（part 側と意図的に異なる） | — | 未実装。差分の妥当性を §7 で判断 |
| DI-EDT-013 | SVG-only パーツのプレビューでパーツ固有 CSS が出力されん（基本スタイル用の style タグ自体は常に残る） | `content.css` 相当が空 | 実機: loading 系を選択 | 手動要 |
| DI-EDT-014 | 未選択時に案内メッセージが出る | 「左の「探す」エリアでデザインを選んでください」 | 実機 | 手動要 |
| DI-EDT-015 | 該当 0 件時に empty state とフィルタ解除が出る | `di-picker__empty` 表示・clear で復帰 | 実機: 存在せん語で検索 | 手動要 |
| DI-EDT-016 | エディタ操作中に JS console error が出ん | error 0 / failed request 0 | `fresh-install-222.spec.mjs` `collectBrowserIssues()` | 自動済 2026-07-29 [ローカル実行] |
| DI-EDT-017 | カード連続クリックで破綻せん | 破綻なし | 同上 | 自動済 2026-07-29 [ローカル実行] |
| DI-EDT-018 | REST fetch に `X-WP-Nonce` が付く | ヘッダ有り | 実機: ネットワーク監視 | 手動要 |
| DI-EDT-019 | カードの `aria-pressed` / `aria-label` が選択状態と同期する | 同期 | 実機: a11y スナップショット | 手動要 |
| DI-EDT-020 | 管理画面 9 色テーマで選択状態が視認できる | コントラスト確保 | 実機: 各テーマ | 手動要 |
| DI-EDT-021 | プレビュー下に「パラメータ調整」パネルが出る | `.di-params` 表示 | 実機: heading-1 選択 | 実機済 2026-07-30 |
| DI-EDT-022 | 色指定がプレビューに即反映される | 色 input 変更で iframe 内の要素が変化 | 実機: 左線の色を変更 | 実機済 2026-07-30 |
| DI-EDT-023 | パーツ切替時にパラメータがそのパーツの既定値に戻る | `params` 属性リセット | `assets/editor.js` `onSelectPart` | 自動済 2026-07-30 |
| DI-EDT-024 | レンジ / ラジオ指定がプレビューに反映される | 数値・選択切替で変化 | 実機: bar-chart-1 / list-1 / textbox-1 の range / radio を変更して iframe プレビューが変化 | 実機済 2026-07-30 |
| DI-EDT-025 | `TemplatePreview` が `template.demoUrl` を `src` に持つ iframe を描画する。無ければ「プレビューURLがありません」 | iframe 表示 or 代替テキスト | `tests/e2e/template-party.spec.mjs`（`.di-preview--template iframe` の src 検証） | 環境制約NG（Docker + git-crypt） |
| DI-EDT-026 | 固定ページ作成前に「公開ページはデモサイトへのリンクになる」旨の `Notice` が常時表示される | Notice 表示 | `tests/e2e/template-party.spec.mjs`（`.di-create-page` 内の文言を実際に可視状態で検証）。`scripts/test.mjs` `testEditorAssetContract()` は文言の存在チェックのみで補助的 | 環境制約NG（E2E 未実行、Docker 未起動）。コード契約（文言存在チェック）のみ自動済 2026-08-04 [ローカル実行] |
| DI-EDT-027 | 「このテンプレで固定ページを作成」ボタンから `POST {templatesRestUrl}{id}/create-page` を呼ぶ | REST 呼び出し | 実機: ボタンクリック → ネットワーク監視 | 手動要 |
| DI-EDT-028 | create-page 成功時に成功 `Notice` + 編集リンク、失敗時に error `Notice` を表示する | 状態遷移が UI に反映 | 実機 | 手動要 |
| DI-EDT-029 | パーツ / テンプレート選択直後に `InsertConfirmNotice` が公開・下書き状態に応じたリンク付きで表示される | Notice + リンク | 実機 | 手動要 |
| DI-EDT-030 | 投稿状態の変化に `useSelect` で追従し、無い環境では一度きり読み取りにフォールバックする | 購読 or フォールバック動作 | コードレビュー | 手動要 |

### 4.7 DI-SC — ショートコード

| ID | 確認内容 | 期待結果 | 検証方法 | 現状 |
|---|---|---|---|---|
| DI-SC-001 | 読み込み時に `designinserter_part` が登録される | 登録済み | `render-smoke.php` | 自動済 2026-07-28 |
| DI-SC-002 | エイリアス `designinserter` も登録される | 両方登録 | `test_shortcode_uses_shared_renderer` | 自動済 2026-07-28 |
| DI-SC-003 | `[designinserter_part id="heading-1"]` で描画 | wrapper 出力 | `render-smoke.php` | 自動済 2026-07-28 |
| DI-SC-004 | SVG-only パーツで style タグなし | style 無し | 同上 | 自動済 2026-07-28 |
| DI-SC-005 | 不明 id で何も表示せん | 空文字 | 同上 | 自動済 2026-07-28 |
| DI-SC-006 | id 属性なしで何も表示せん | 空文字 | — | 未実装 |
| DI-SC-007 | 未調整パーツで出力がブロック出力と同一 | 文字列一致 | — | 未実装（同一 renderer 共有は DI-SC-002 で担保、出力等価比較は無い。パラメータ調整済みパーツはショートコードが `id` しか受け取らず既定値に戻るため対象外。readme.txt FAQ に明記） |
| DI-SC-008 | `the_content` 経由で描画される | heading-4 描画 | `render-smoke.php` | 自動済 2026-07-28 |
| DI-SC-009 | テキストウィジェットで描画される | 描画 | 実機: ウィジェット追加 → フロント確認 | 手動要 |
| DI-SC-010 | クラシックエディタ投稿で描画される | 描画 | 実機: Classic Editor プラグイン導入 | 手動要 |
| DI-SC-011 | 実 WP ランタイムで `do_shortcode` が描画する | `data-designinserter-id="heading-1"` + style | `npm run smoke:wp:portable`（WP 6.9.4） | 自動済 2026-07-29 [ローカル実行] |
| DI-SC-012 | zip インストール後にショートコードが描画される | 描画 | 同上（dist zip を展開して有効化） | 自動済 2026-07-29 [ローカル実行] |
| DI-SC-013 | 不正 id 時の投稿者向けフィードバック | 現状は無音 | — | 未実装。仕様判断が要る（§7） |

### 4.8 DI-API — REST API

| ID | 確認内容 | 期待結果 | 検証方法 | 現状 |
|---|---|---|---|---|
| DI-API-001 | `rest_api_init` フックが登録される | 登録 | `render-smoke.php` | 自動済 2026-07-28 |
| DI-API-002 | `/parts/(?P<id>[a-z0-9_\-]+)` が登録される | 登録 | 同上 | 自動済 2026-07-28 |
| DI-API-003 | メソッドが GET のみ | GET | 同上 | 自動済 2026-07-28 |
| DI-API-004 | id が required | true | 同上 | 自動済 2026-07-28 |
| DI-API-005 | id の sanitize_callback が `sanitize_key` | 一致 | 同上 | 自動済 2026-07-28 |
| DI-API-006 | permission_callback が `edit_posts` を検査する | 検査記録あり | 同上 | 自動済 2026-07-28 |
| DI-API-007 | 権限なしユーザで false | false | 同上 | 自動済 2026-07-28 |
| DI-API-008 | 正常時に id / html / css を返す | 3 キー | 同上 | 自動済 2026-07-28 |
| DI-API-009 | 埋め込み asset URL が解決される | 絶対 URL | 同上 | 自動済 2026-07-28 |
| DI-API-010 | プレビュー用スコープ化が効く | `di-preview-` 接頭辞 | 同上 | 自動済 2026-07-28 |
| DI-API-011 | 未知 id で `WP_Error(not_found)` | code = not_found | 同上 | 自動済 2026-07-28 |
| DI-API-012 | `rest_do_request` でルートがディスパッチされる | id 一致 | 同上 | 自動済 2026-07-28 |
| DI-API-013 | 権限拒否時に 403 `rest_forbidden` | status 403 | 同上 | 自動済 2026-07-28 |
| DI-API-014 | 実 WP で nonce 付き HTTP リクエストが通る | 200 JSON | `tests/e2e/template-party.spec.mjs` | 自動済 2026-07-30 [ローカル実行] |
| DI-API-015 | 未ログインの生 HTTP GET が拒否される | 401 または 403 | `tests/e2e/fresh-install-222.spec.mjs` | 自動済 2026-07-30 [ローカル実行] |
| DI-API-016 | 不正文字を含む id がルート正規表現にマッチせん | 404 | 実機: `curl .../parts/He%20ading` | 環境制約NG（Docker） |
| DI-API-017 | `/templates/{id}/create-page` が POST で登録される | 登録・POST のみ | `tests/e2e/template-party.spec.mjs` | 自動済 2026-07-30 [ローカル実行] |
| DI-API-018 | create-page が `edit_pages` を要求する | 権限チェック | — | 未実装 |
| DI-API-019 | create-page が下書きページを作る | page_id + edit_url | `template-party.spec.mjs` | 自動済 2026-07-30 [ローカル実行] |
| DI-API-020 | create-page が未知テンプレートで 404 | not_found | — | 未実装 |
| DI-API-021 | create-page が meta 3 種を設定する | `_wp_page_template` / `_di_template_id` / `_di_template_bundle_dir` | 実機: `wp post meta list` | 手動要 |

### 4.9 DI-TPL — フルページテンプレート

**2026-07-30 に `designinserter.php` で `includes/templates.php` を require する修正を実施。DI-TPL-003 は UI ユーザーストーリー録画で `full-page.php` 適用を確認。2026-08-02 に DI-TPL-001 の回帰テストを `tests/render-smoke.php` へ追加（F-1 の再発検知）。DI-TPL-002 / 004〜007 は引き続き未自動化。**

| ID | 確認内容 | 期待結果 | 検証方法 | 現状 |
|---|---|---|---|---|
| DI-TPL-001 | `includes/templates.php` が require され、フィルタが登録される | `theme_page_templates` / `template_include` が登録済み | `tests/render-smoke.php`（require を外すと赤くなることを確認済み） | 自動済 2026-08-02 [ローカル実行] |
| DI-TPL-002 | ページテンプレート一覧に選択肢が出る | 表示 | 実機: ページ編集画面 | 未実装 |
| DI-TPL-003 | create-page で作ったページがプラグインテンプレートで表示される | `templates/full-page.php` が使われる | UI ユーザーストーリー録画 | 実機目視 2026-07-30 [実機目視] |
| DI-TPL-004 | bundle があれば `index.html` に `<base>` を挿入して出力 | base タグ挿入 | — | 未実装 |
| DI-TPL-005 | bundle 不在かつ demoUrl ありでリダイレクト | 302 | — | 未実装 |
| DI-TPL-006 | bundle 不在かつ demoUrl なしで 404 | `wp_die` 404 | — | 未実装 |
| DI-TPL-007 | `_di_template_bundle_dir` に `../` を仕込んでもバンドル外を読まん | realpath ガードで拒否 | — | 未実装（セキュリティ重要） |

### 4.10 DI-ADM — 管理画面

| ID | 確認内容 | 期待結果 | 検証方法 | 現状 |
|---|---|---|---|---|
| DI-ADM-001 | `admin_menu` フックが登録される | 登録 | `render-smoke.php` | 自動済 2026-07-28 |
| DI-ADM-002 | Settings 配下に `designinserter` ページが登録される | 登録 | 同上 | 自動済 2026-07-28 |
| DI-ADM-003 | capability が `manage_options` | 一致 | 同上 | 自動済 2026-07-28 |
| DI-ADM-004 | 見出し `<h1>Design Inserter</h1>` を描画 | 含む | 同上 | 自動済 2026-07-28 |
| DI-ADM-005 | パーツ件数を描画 | 復号モードに応じ 222 または 360 | 同上（`$designinserter_expected_parts`） | 自動済 2026-07-28 |
| DI-ADM-006 | source URL を描画 | 含む | 同上 | 自動済 2026-07-28 |
| DI-ADM-007 | ショートコード例を描画 | `[designinserter_part id="heading-1"]` | 同上 | 自動済 2026-07-28 |
| DI-ADM-008 | 出力が全てエスケープされとる | phpcs 違反 0 | `./vendor/bin/phpcs` | 自動済 2026-07-28 |
| DI-ADM-009 | 実ブラウザで CTA / リンクが到達可能 | リンク健全 | `fresh-install-222.spec.mjs` | 自動済 2026-07-30 [ローカル実行] |
| DI-ADM-010 | 編集者権限で設定画面にアクセスできん | 権限エラー | 実機: `editor` ロールでアクセス | 手動要 |
| DI-ADM-011 | `scrapedAt`（データ鮮度）を表示する | 表示 | — | 未実装 |

### 4.11 DI-FE — frontend.js の DOM 挙動

| ID | 確認内容 | 期待結果 | 検証方法 | 現状 |
|---|---|---|---|---|
| DI-FE-001 | 5 種ハンドラが存在する | scrollTop / tooltip / readMore / tabs / modal | `scripts/test.mjs` `testBehaviorMetadata()` | 自動済 2026-07-28 |
| DI-FE-002 | scrollTop クリックでページ先頭に戻る | scroll 0 | 実機 | 手動要 |
| DI-FE-003 | tooltip がフォーカスで表示される | 表示 + aria | 実機: Tab フォーカス | 手動要 |
| DI-FE-004 | readMore の `aria-expanded` が同期する | true / false 切替 | 実機 | 手動要 |
| DI-FE-005 | tabs が矢印キーで移動する | フォーカス移動 | 実機: ← → キー | 手動要 |
| DI-FE-006 | modal が Esc で閉じる | 閉じる | 実機 | 手動要 |
| DI-FE-007 | modal のフォーカストラップが機能する | モーダル内で循環 | 実機: Tab 巡回 | 手動要 |
| DI-FE-008 | MutationObserver で後から追加された part も enhance される | enhance 適用 | 実機: JS で DOM 追加 | 手動要 |
| DI-FE-009 | JS 無効環境で表示が壊れん | レイアウト維持 | 実機: ブラウザ JS off | 手動要 |
| DI-FE-010 | フロントで JS console error が出ん | error 0 | `fresh-install-222.spec.mjs` | 自動済 2026-07-30 [ローカル実行] |
| DI-FE-011 | axe-core による WCAG 違反検出 | critical 0 | — | 未実装 |
| DI-FE-012 | frontend.css 基本スタイルが enqueue される | enqueued | `render-smoke.php` | 自動済 2026-07-28 |

### 4.12 DI-SEC — セキュリティ

| ID | 確認内容 | 期待結果 | 検証方法 | 現状 |
|---|---|---|---|---|
| DI-SEC-001 | 全 PHP に `ABSPATH` 直アクセスガードがある | 全ファイル | — | 未実装（実在はするが自動チェックが無い） |
| DI-SEC-002 | partId が `sanitize_key` を通る | 正規化 | `render-smoke.php` | 自動済 2026-07-28 |
| DI-SEC-003 | REST id が `sanitize_key` を通る | 一致 | 同上 | 自動済 2026-07-28 |
| DI-SEC-004 | REST parts が `edit_posts` 必須 | 拒否動作 | 同上 | 自動済 2026-07-28 |
| DI-SEC-005 | REST create-page が `edit_pages` 必須 | 拒否 | — | 未実装 |
| DI-SEC-006 | 管理画面が `manage_options` 必須 | 一致 | `render-smoke.php` | 自動済 2026-07-28 |
| DI-SEC-007 | エディタプレビューが sandbox iframe で隔離される | `sandbox: ''` | `scripts/test.mjs` | 自動済 2026-07-28 |
| DI-SEC-008 | `bundleDir` のパストラバーサルが遮断される | basename + 文字制限 + realpath 検証 | — | 未実装（重要） |
| DI-SEC-009 | カタログ HTML を意図的に `wp_kses_post` に通さん設計が明文化されとる | 仕様どおり素通し | コードレビュー | 手動要 |
| DI-SEC-010 | phpcs 違反 0 | exit 0 | `./vendor/bin/phpcs` | 自動済 2026-07-28（ただし `phpcs.xml.dist` は Generic / Squiz のみ。WordPress Coding Standards は未導入） |
| DI-SEC-011 | 出力エスケープ漏れが無い | 違反 0 | — | 未実装。現行 phpcs にエスケープ sniff（`WordPress.Security.EscapeOutput`）が無いので、phpcs の緑を根拠にできん |
| DI-SEC-012 | `full-page.php` の無エスケープ echo が realpath ガードの内側にある | ガード内 | コードレビュー + DI-TPL-007 | 手動要 |
| DI-SEC-013 | Template Party データが暗号化されたままコミットされとる | ciphertext である | `git check-attr filter` + 先頭バイト確認 | 手動要（2026-07-28 に手で実行して確認。どのゲートにも組み込まれとらん） |
| DI-SEC-014 | 配布 zip に git-crypt 暗号文および再配布不可のローカル専用データ（`data/template-party-bundles/`）が混入せん | 混入 0 | `scripts/build-plugin-zip.mjs` `selectDistributionFiles()` / `assertNoCiphertext()` + `tests/build-plugin-zip.test.mjs` | 自動済 2026-08-02 [ローカル実行] |
| DI-SEC-015 | phpcs の検査範囲が `tests/` 直下と `scripts/` を含む | 含む | 現状 `phpcs.xml.dist` は `wp-content/plugins/designinserter` と `tests/php` のみ | 未実装 |

### 4.13 DI-BLD — ビルド・配布

| ID | 確認内容 | 期待結果 | 検証方法 | 現状 |
|---|---|---|---|---|
| DI-BLD-001 | 必須配布ファイル 12 件が揃う | 欠損 0 | `scripts/test.mjs` `testDistributionShape()` | 自動済 2026-07-28 |
| DI-BLD-002 | package.json の license が `GPL-2.0-or-later` | 一致 | 同上 | 自動済 2026-07-28 |
| DI-BLD-003 | package-lock の root license が一致 | 一致 | 同上 | 自動済 2026-07-28 |
| DI-BLD-004 | Plugin Name ヘッダが存在 | 一致 | 同上 | 自動済 2026-07-28 |
| DI-BLD-005 | ヘッダ Version が package.json と一致 | 一致 | 同上 | 自動済 2026-07-28 |
| DI-BLD-006 | `DESIGNINSERTER_VERSION` 定数が一致 | 一致 | 同上 | 自動済 2026-07-28 |
| DI-BLD-007 | `DESIGNINSERTER_SOURCE_URL` が catalog.sourceUrl と一致 | 一致 | 同上 | 自動済 2026-07-28 |
| DI-BLD-008 | `Requires at least: 6.0` | 一致 | 同上 | 自動済 2026-07-28 |
| DI-BLD-009 | `Requires PHP: 7.4` | 一致 | 同上 | 自動済 2026-07-28 |
| DI-BLD-010 | License / License URI ヘッダ | 一致 | 同上 | 自動済 2026-07-28 |
| DI-BLD-011 | Text Domain ヘッダ | 一致 | 同上 | 自動済 2026-07-28 |
| DI-BLD-012 | NOTICE.md に出典名と URL が残る | 含む | 同上 | 自動済 2026-07-28 |
| DI-BLD-013 | zip 整合性 | `unzip -tq` exit 0 | `npm run build` + `unzip -tq` | 自動済 2026-07-28 |
| DI-BLD-014 | zip root が `designinserter/` 単一 | 単一 | 同上 | 自動済 2026-07-28 |
| DI-BLD-015 | dev / test / build ファイルが zip に混入せん | 混入 0 | `scripts/build-plugin-zip.mjs` `verifyZip()` | 自動済 2026-07-28 |
| DI-BLD-016 | zip 内 catalog の総数・プレビュー画像が揃う | 配布対象の欠損 0 | `scripts/build-plugin-zip.mjs` `verifyZip()` | 手動要（CSS Stock 222 件は参照先・拡張子と中身の署名一致まで自動確認。Template Party 側も `4b054ba` 以降、参照先の存在に加え `detectPreviewKind()` による署名一致を自動確認するが、復号済み環境でのリリースビルド実行はこの環境では未検証。全配布物の独立した固定 manifest チェックは無い） |
| DI-BLD-017 | 古い zip / 別バージョン zip を検出して失敗する | 明示エラー | `npm run smoke:wp:portable` | 手動要 |
| DI-BLD-018 | テスト・ビルド支援ファイルが gitignore されとらん | ignore 0 | `scripts/test.mjs` `testGitVisibility()` | 自動済 2026-07-28 |
| DI-BLD-019 | `readme.txt`（Stable tag / Tested up to）がある | 存在 | `scripts/build-plugin-zip.mjs` `verifyZip()` の required + `scripts/test.mjs` `testDistributionShape()` | 自動済 2026-08-02 [ローカル実行] |
| DI-BLD-020 | zip を管理 UI からアップロードして有効化できる | 有効化成功 | 実機: `plugin-install.php` | 手動要 |
| DI-BLD-021 | zip から `wp plugin install --activate` が成功する | `installed successfully` | `npm run smoke:wp:portable` | 手動要（現状の証跡は dist zip を展開しての `plugin activate` 成功のみ。`wp plugin install --activate` の zip インストール・展開・有効化という直接経路は未実施。直接経路を実測したら `自動済` に戻す） |
| DI-BLD-022 | git-crypt ロック環境でのビルドを検出して失敗する | 明示エラー・exit 1 | `scripts/build-plugin-zip.mjs` `assertCatalogsUsable()` + `tests/build-plugin-zip.test.mjs` | 自動済 2026-08-02 [ローカル実行] |
| DI-BLD-023 | `part-code-funcs.js` が 222 パーツ分登録される | `window.designInserterPartCodeFuncs` に全 id 存在 | `scripts/test.mjs` `testPartCodeFuncs()` | 自動済 2026-07-30 |

### 4.14 DI-CMP — 互換性・ライフサイクル

| ID | 確認内容 | 期待結果 | 検証方法 | 現状 |
|---|---|---|---|---|
| DI-CMP-001 | 全 PHP ファイルが構文エラーなし | exit 0 | `scripts/test.mjs` `testPhpSyntax()` | 自動済 2026-07-28 |
| DI-CMP-002 | 全 JS ファイルが構文エラーなし | exit 0 | `testJavaScriptSyntax()` | 自動済 2026-07-28 |
| DI-CMP-003 | PHP 7.4 で fatal が出ん | OK | — | 未実装（現状 PHP 8.4 のみで検証） |
| DI-CMP-004 | WordPress 6.0 で有効化できる | 成功 | — | 未実装（portable smoke は 6.9.4 固定） |
| DI-CMP-005 | WordPress 6.9.4 で有効化できる | 成功 | `npm run smoke:wp:portable` | 自動済 2026-07-29 [ローカル実行] |
| DI-CMP-006 | 有効化で fatal error が出ん | 成功 | 同上（`WP_DEBUG=true` で有効化 → 無効化 → 削除 → 再有効化） | 自動済 2026-07-29 [ローカル実行] |
| DI-CMP-007 | 無効化でフロント出力が消える | 出力消滅・エラーなし | 実機 | 手動要 |
| DI-CMP-008 | テーマを切り替えても描画が壊れん | 描画維持 | 実機: 3 テーマ | 手動要 |
| DI-CMP-009 | 3 viewport（375 / 768 / 1280）でレイアウト破綻が無い | 破綻なし | — | 未実装 |
| DI-CMP-010 | ビルドステップ無し（`@wordpress/scripts` 不使用）を維持する | 依存なし | — | 未実装 |

### 4.15 DI-SCR — スクレイパー

外部サイトへのアクセスを伴うので CI 対象外。結果側（DI-CAT 群）が実質的な担保になる。

| ID | 確認内容 | 期待結果 | 検証方法 | 現状 |
|---|---|---|---|---|
| DI-SCR-001 | `npm run scrape:css-stock` が exit 0 | 0 | 手動 | 手動要 |
| DI-SCR-002 | 出力 JSON に 222 parts | 222 | 手動（結果は DI-CAT-001 が担保） | 手動要 |
| DI-SCR-003 | 28 カテゴリすべて抽出 | 28 | 手動（同 DI-CAT-002） | 手動要 |
| DI-SCR-004 | `{slug}: {actual}/{expected}` をコンソール出力 | 形式一致 | 手動 | 手動要 |
| DI-SCR-005 | total == expectedTotal | 一致 | DI-CAT-001 | 自動済 2026-07-28（間接） |
| DI-SCR-006 | previewImage がローカル相対 | 相対 | DI-CAT-010 | 自動済 2026-07-28（間接） |
| DI-SCR-007 | previewImage 実体が存在 | 存在 | DI-CAT-011 | 自動済 2026-07-28（間接） |
| DI-SCR-008 | 拡張子と実体形式が一致 | 一致 | DI-CAT-012 | 自動済 2026-07-28（間接） |
| DI-SCR-009 | SVG-only の css が空 | 空 | DI-CAT-008 | 自動済 2026-07-28（間接） |
| DI-SCR-010 | HTML エンティティがデコード済み | デコード済 | — | 未実装 |
| DI-SCR-011 | 出力が `JSON.parse` できる | 成功 | `scripts/test.mjs` | 自動済 2026-07-28 |
| DI-SCR-012 | 2 回実行で冪等（scrapedAt 除く） | 差分なし | — | 未実装 |
| DI-SCR-013 | TP テンプレートスクレイパーが bundle を展開する | bundle 生成 | 手動 | 手動要 |
| DI-SCR-014 | TP パーツスクレイパーが 138 件を出力 | 138 | 手動 | 手動要 |
| DI-SCR-015 | TP 生成物が git-crypt 対象パスに置かれる | `git check-attr filter` が git-crypt | 手動 | 手動要 |

### 4.16 DI-E2E — 統合シナリオ

| ID | 確認内容 | 期待結果 | 検証方法 | 現状 |
|---|---|---|---|---|
| DI-E2E-001 | 新規 WP に zip を入れて 222 パーツ全件をフロント描画 | 全件描画・console error 0 | `tests/e2e/fresh-install-222.spec.mjs` | 自動済 2026-07-29 [ローカル実行] |
| DI-E2E-002 | 同 WP でショートコードが共有 renderer 経由で描画 | 描画 | 同上 | 自動済 2026-07-29 [ローカル実行] |
| DI-E2E-003 | 管理設定画面の CTA / ボタン列挙 | 健全 | 同上 | 自動済 2026-07-29 [ローカル実行] |
| DI-E2E-004 | Gutenberg で挿入・選択・検索・カテゴリ・連続使用 | 破綻なし | 同上 | 自動済 2026-07-29 [ローカル実行] |
| DI-E2E-005 | TP source フィルタ表示 | 3 ボタン | `tests/e2e/template-party.spec.mjs` | 自動済 2026-07-30 [ローカル実行] |
| DI-E2E-006 | TP カード + badge 表示 | 表示 | 同上 | 自動済 2026-07-30 [ローカル実行] |
| DI-E2E-007 | CSS Stock フィルタで template 非表示 | parts のみ | 同上 | 自動済 2026-07-30 [ローカル実行] |
| DI-E2E-008 | template カードクリックで iframe プレビュー | iframe 表示 | 同上 | 自動済 2026-07-30 [ローカル実行] |
| DI-E2E-009 | create-page REST で下書きページ生成 | 生成 | 同上 | 自動済 2026-07-30 [ローカル実行] |
| DI-E2E-010 | 生成ページがフルページテンプレートで表示される | `full-page.php` 適用 | `UI ユーザーストーリー録画` | 実機目視 2026-07-30 [実機目視] |
| DI-E2E-011 | 実 WP ランタイムで shortcode / block / REST が描画される | 3 経路とも期待マーカー一致 | `npm run smoke:wp:portable`（WP 6.9.4 + wp-sqlite-db） | 自動済 2026-07-29 [ローカル実行]（Docker dev stack 上での再確認は未） |
| DI-E2E-012 | CI が main と全 PR で green | success | `gh run list` | 手動要 |

---

## 5. トレーサビリティ

### 5.1 openspec 受け入れ基準 → テストケース ID

`openspec/specs/*.md` の未チェック項目は全 6 ファイルで 65 件（catalog 8 / editor-ui 20 / gutenberg-block 10 / rendering 8 / scraper 12 / shortcode 7）。全件をテストケース ID に対応付けた（一部は同一 ID を複数項目で共有、または 1 項目に複数 ID が対応するため、下表は 66 行）。

| spec | 受け入れ基準 | ID | 現状 |
|---|---|---|---|
| catalog | JSON ファイルに 222 件の parts | DI-CAT-001 | 自動済 |
| catalog | 全 parts の id が `{categorySlug}-{sourcePartId}` 形式 | DI-CAT-005 | 自動済 |
| catalog | 全 parts に必須 6 フィールド | DI-CAT-004 | 自動済 |
| catalog | categories に 28 件 | DI-CAT-002 | 自動済 |
| catalog | total と expectedTotal が一致 | DI-CAT-001 | 自動済 |
| catalog | SVG-only の css が空文字列 | DI-CAT-008 | 自動済 |
| catalog | sourceUrl がアンカーリンク | DI-CAT-009 | 自動済 |
| catalog | PHP json_decode でエラーなし | DI-CAT-016 | 自動済 |
| editor-ui | サイドバーに Design Inserter パネル | DI-EDT-001 | 自動済 |
| editor-ui | 検索付きカードグリッド（`.di-picker__grid`）でパーツ / テンプレートを選ぶ | DI-EDT-002 | 自動済 2026-08-02 [ローカル実行] |
| editor-ui | カードに `previewImage` とタイトル、テンプレは「テンプレ」badge を出す | DI-EDT-002 | 自動済 2026-08-02 [ローカル実行] |
| editor-ui | 検索ボックスで絞り込みができる | DI-EDT-003 | 自動済 2026-07-29 [ローカル実行] |
| editor-ui | カテゴリボタンで絞り込みができる | DI-EDT-004 | 自動済 2026-07-29 [ローカル実行] |
| editor-ui | source フィルタが 3 種表示される | DI-EDT-005 | 自動済 2026-07-30 [ローカル実行] |
| editor-ui | Template Party フィルタで template カードが badge 付きで出る | DI-EDT-006 | 自動済 2026-07-30 [ローカル実行] |
| editor-ui | デザインパーツフィルタで template カードが隠れる | DI-EDT-007 | 自動済 2026-07-30 [ローカル実行] |
| editor-ui | 選択後にプレビューが即表示 | DI-EDT-008 | 自動済 |
| editor-ui | 生成関数の無いパーツだけが REST 経由で遅延ロードされる（CSS Stock 222 件は経由しない） | DI-EDT-009 | 自動済（構造的な担保） |
| editor-ui | プレビューが sandbox iframe に隔離される | DI-EDT-010 | 自動済 |
| editor-ui | SVG-only のプレビューでパーツ固有 CSS が空（基本 style は残る） | DI-EDT-013 | 手動要 |
| editor-ui | 未選択で案内メッセージ | DI-EDT-014 | 手動要 |
| editor-ui | リロード後も選択状態を保持 | DI-BLK-011 | 手動要 |
| editor-ui | JS エラーがコンソールに出ん | DI-EDT-016 | 自動済 |
| editor-ui | TemplatePreview が demoUrl を iframe に描画（無ければ代替テキスト） | DI-EDT-025 | 環境制約NG |
| editor-ui | 固定ページ作成前にデモリンク挙動を明示する Notice を表示 | DI-EDT-026 | 環境制約NG（E2E 未実行、コード契約のみ自動済） |
| editor-ui | create-page ボタンから REST を呼ぶ | DI-EDT-027 | 手動要 |
| editor-ui | create-page 成功/失敗時に Notice を出す | DI-EDT-028 | 手動要 |
| editor-ui | 選択直後に InsertConfirmNotice を出す | DI-EDT-029 | 手動要 |
| editor-ui | 投稿状態の変化に `useSelect` で追従し、無い環境では一度きり読み取りにフォールバックする | DI-EDT-030 | 手動要 |
| gutenberg-block | 挿入パネルに Design Inserter | DI-BLK-009 | 自動済 |
| gutenberg-block | 検索付きビジュアル picker に 360 件 + テンプレ 1017 件 | DI-EDT-002 | 自動済 2026-08-02 [ローカル実行] |
| gutenberg-block | 選択後にエディタ内プレビュー | DI-EDT-008 | 自動済 |
| gutenberg-block | SVG-only でパーツ固有 CSS が空（基本 style は残る） | DI-EDT-013 | 手動要 |
| gutenberg-block | 保存後フロントで HTML+CSS 描画 | DI-BLK-010 | 自動済 2026-07-30 [ローカル実行] |
| gutenberg-block | 無効 partId でフロント表示なし | DI-BLK-008 | 未実装 |
| gutenberg-block | 無効化後も保存済み投稿でエラーなし | DI-BLK-012 | 手動要 |
| gutenberg-block | テンプレートカードから固定ページを作成できる | DI-API-019 / DI-E2E-009 | 自動済 2026-07-30 [ローカル実行] |
| gutenberg-block | 保存済みブロックの `params` が再初期化されない | DI-BLK-016 | 自動済（コード契約） |
| gutenberg-block | `html`/`css` が `params` から自動再同期される | DI-BLK-017 | 自動済（コード契約） |
| rendering | 有効 partId で HTML+CSS+コメント | DI-RND-001 | 自動済 |
| rendering | 無効 partId で空文字列 | DI-RND-006 | 自動済 |
| rendering | SVG-only で style タグなし | DI-RND-007 | 自動済 |
| rendering | `data-designinserter-id` を含む | DI-RND-003 | 自動済 |
| rendering | `aria-label` を含む | DI-RND-004 | 自動済 |
| rendering | コメントに source URL | DI-RND-005 | 自動済 |
| rendering | form/input が破壊されん | DI-RND-009 | 自動済 |
| rendering | sanitize_key で不正文字除去 | DI-RND-010 | 自動済 |
| scraper | `scrape:css-stock` が exit 0 | DI-SCR-001 | 手動要 |
| scraper | 出力 JSON に 222 parts | DI-SCR-002 | 手動要 |
| scraper | 28 カテゴリすべて抽出 | DI-SCR-003 | 手動要 |
| scraper | `{slug}: {actual}/{expected}` 出力 | DI-SCR-004 | 手動要 |
| scraper | total と expectedTotal が一致 | DI-SCR-005 | 自動済（間接） |
| scraper | previewImage がローカル相対 | DI-SCR-006 | 自動済（間接） |
| scraper | previewImage ファイルが存在 | DI-SCR-007 | 自動済（間接） |
| scraper | 拡張子と実体形式が一致 | DI-SCR-008 | 自動済（間接） |
| scraper | SVG-only の css が空 | DI-SCR-009 | 自動済（間接） |
| scraper | HTML エンティティがデコード済み | DI-SCR-010 | 未実装 |
| scraper | 出力が JSON.parse できる | DI-SCR-011 | 自動済 |
| scraper | 2 回実行で冪等 | DI-SCR-012 | 未実装 |
| shortcode | `id="heading-1"` で描画 | DI-SC-003 | 自動済 |
| shortcode | `id="loading-5"` が style なしで描画 | DI-SC-004 | 自動済 |
| shortcode | `id="nonexistent"` で表示なし | DI-SC-005 | 自動済 |
| shortcode | id なしで表示なし | DI-SC-006 | 未実装 |
| shortcode | 出力に source コメント | DI-RND-001 | 自動済 |
| shortcode | 出力がブロック出力と同一 | DI-SC-007 | 未実装 |
| shortcode | テキストウィジェットで描画 | DI-SC-009 | 手動要 |

集計: 自動済 45 / 環境制約NG 2 / 手動要 14 / 未実装 5 / 不整合 0。

（2026-08-02: openspec `editor-ui.md` / `gutenberg-block.md` を実装に合わせて改訂したことで、DI-EDT-002 に紐づく 3 行がすべて `不整合` から `自動済` になった。§5.1 の `不整合` は 0 件。2026-08-04: Template Party disclosure Notice 群の ID を DI-EDT-025〜029 に振り直した。同日、`openspec/specs/*.md` の未チェック項目が実際には 63 件（旧集計は 55 件と誤って記載）あり、§5.1 が editor-ui の検索/カテゴリ/source フィルタ・REST 遅延ロード・sandbox 隔離・useSelect と、gutenberg-block のテンプレート create-page 項目（計 9 件）を欠いていたため追加し、64 行に更新した。）

### 5.2 requirements 成功基準 → テストケース ID

| # | 成功基準 | ID | 現状 |
|---|---|---|---|
| 1 | プラグインを有効化できる | DI-CMP-006, DI-BLD-020 | 自動済 / 手動要 |
| 2 | Gutenberg で選択・プレビュー・保存できる | DI-EDT-008, DI-BLK-010, DI-BLK-011 | 自動済 / 自動済 / 手動要 |
| 3 | フロントエンドで描画される | DI-BLK-010, DI-E2E-001 | 自動済 / 自動済 |
| 4 | ショートコードがブロックと同じ結果を出す | DI-SC-007, DI-SC-012 | 未実装 / 自動済 |
| 5 | 222 パーツすべてが選択可能 | DI-E2E-001, DI-CAT-001 | 自動済 |
| 6 | 無効化しても壊れん | DI-BLK-012, DI-CMP-007 | 手動要 |

成功基準 6 項目のうち、1・2・3・5 は自動証跡がある。4・6 は出力等価比較と無効化後の表示確認が残っとる。

### 5.3 テストファイル → テストケース ID（逆引き）

| ファイル | カバーする ID |
|---|---|
| `scripts/test.mjs` | DI-CAT-001〜015・018〜024, DI-BLD-001〜012・018・023, DI-BLK-004・005・014・015, DI-EDT-009〜011・023, DI-SEC-007, DI-CMP-001・002, DI-FE-001, DI-SCR-011 |
| `tests/render-smoke.php` | DI-RND-001〜011・013・015, DI-SCP-001〜004・006, DI-BLK-001〜003・006・007, DI-SC-001・003〜005・008, DI-API-001〜013, DI-ADM-001〜007, DI-FE-012, DI-DAT-009・011・017, DI-CAT-016, DI-SEC-002〜004・006, DI-TPL-001 |
| `tests/catalog-fallback.php` | DI-DAT-007・008 |
| `tests/tp-availability.php` | DI-DAT-005 |
| `tests/php/DesignInserterCoreTest.php` | DI-DAT-001〜004・012〜018, DI-CAT-022・023, DI-RND-002・012・015, DI-SCP-005, DI-SC-002 |
| `tests/e2e/fresh-install-222.spec.mjs` | DI-E2E-001〜004, DI-BLK-009・010, DI-EDT-001・003・004・008・016・017, DI-ADM-009, DI-SC-012, DI-FE-010, DI-CMP-006, DI-API-015 |
| `tests/e2e/template-party.spec.mjs` | DI-E2E-005〜009, DI-EDT-005〜007・025〜026, DI-API-014・017・019 |
| `scripts/build-plugin-zip.mjs` | DI-BLD-013〜016・019・022, DI-SEC-014 |
| `tests/build-plugin-zip.test.mjs` | DI-BLD-022, DI-SEC-014 |
| `scripts/wp-smoke.mjs` | DI-BLD-017, DI-CMP-005 |
| `./vendor/bin/phpcs` | DI-SEC-010・011, DI-ADM-008 |

---

## 6. 実行手順

証跡は `.work/qa/test-spec-<UTCタイムスタンプ>/` に保存する。判定は必ず `grep -q ...` のような機械的チェックで出し、結果に検証ソースのタグ（`[ローカル実行]` / `[実機目視]` / `[CI]`）を添える。出力を読んで「正しそう」やから通す、はせん。

```bash
cd "$(git rev-parse --show-toplevel)"
EV=".work/qa/test-spec-$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$EV" && echo "$EV" > .work/qa/LATEST
```

### Phase 0 — 前提の確定

```bash
docker info                > "$EV/p0-docker.txt" 2>&1 || echo "Docker 停止中: Phase 2 の一部 / 4 / 5 は INAPPLICABLE"
# `git-crypt status -e | head` と書くと、git-crypt が入っとらん時でも head の成功が返る。
# 「暗号化されとるか分からんまま Phase 0 が緑」になるのが一番まずいので、存在確認を分ける。
command -v git-crypt > "$EV/p0-gitcrypt.txt" 2>&1 \
  && git-crypt status -e >> "$EV/p0-gitcrypt.txt" 2>&1 \
  || echo "git-crypt 未導入。暗号化状態は未確認として扱う" >> "$EV/p0-gitcrypt.txt"
node --version && npm ci   > "$EV/p0-npm-ci.txt" 2>&1
composer install --no-interaction --no-progress > "$EV/p0-composer.txt" 2>&1
```

Docker が使えん場合は Phase 2 の PHPCS / PHPUnit をローカルの `./vendor/bin/` で代替できる。Phase 4・5 は代替が無い。

### Phase 1 — 静的ゲート（Docker 不要）

```bash
npm run php:lint > "$EV/p1-php-lint.txt" 2>&1; LINT=$?   # DI-CMP-001
npm test         > "$EV/p1-npm-test.txt" 2>&1; TEST=$?   # DI-CAT / BLD / RND / SC / API / ADM 群

# skip 行は先頭に空白が付く（`  skip - ...`）ので行頭アンカーでは拾えん。
# 0 件のとき grep は exit 1 を返すが、これはゲートの合否と無関係なので握り潰す。
grep -c 'skip - ' "$EV/p1-npm-test.txt" || true

# 合否は grep やなく上の 2 つの終了コードで決める。
# 最後の grep の結果をゲートの結果にすると、テストが落ちても緑に見える。
# 判定は終了コードだけを根拠にする（証跡の分類は [ローカル実行]）
if [ "$LINT" -eq 0 ] && [ "$TEST" -eq 0 ]; then
  echo "Phase 1 OK"
else
  echo "Phase 1 NG (lint=$LINT test=$TEST)"
  false
fi
```

### Phase 2 — PHP 品質

```bash
./vendor/bin/phpcs   > "$EV/p2-phpcs.txt" 2>&1; PHPCS=$?     # DI-SEC-010, DI-ADM-008
./vendor/bin/phpunit > "$EV/p2-phpunit.txt" 2>&1; PHPUNIT=$?  # DI-DAT 群

if [ "$PHPCS" -eq 0 ] && [ "$PHPUNIT" -eq 0 ]; then
  echo "Phase 2 OK"
else
  echo "Phase 2 NG (phpcs=$PHPCS phpunit=$PHPUNIT)"
  false
fi
```

Docker 経由で走らせる場合は `npm run phpcs` / `npm run test:php`。

### Phase 3 — ビルド

```bash
npm run build            > "$EV/p3-build.txt" 2>&1      # DI-BLD-013〜016

# dist/ に旧版の zip が残っとると `dist/*.zip` が複数に展開され、
# unzip は 2 個目以降を「アーカイブ内のファイル名」と解釈して偽の失敗を出す。
# 今ビルドした版だけを名指しする。
ZIP="dist/designinserter-$(node -p "require('./package.json').version").zip"
unzip -tq "$ZIP" > "$EV/p3-zip.txt" 2>&1
npm run smoke:wp:portable > "$EV/p3-portable.txt" 2>&1  # DI-CMP-005, DI-BLD-017
```

git-crypt がロックされとる環境でビルドすると、暗号文のまま zip に入る（F-4）。リリース用ビルドは必ず復号済み環境で行う。

### Phase 4 — Playwright E2E（Docker 必須）

```bash
npx playwright install --with-deps chromium > "$EV/p4-install.txt" 2>&1
npm run e2e:fresh          > "$EV/p4-e2e-fresh.txt" 2>&1   # DI-E2E-001〜004（ポート 18082）
npm run e2e:template-party > "$EV/p4-e2e-tp.txt" 2>&1      # DI-E2E-005〜009（ポート 18083・要復号）
```

### Phase 5 — 実機 WordPress（Docker 必須）

```bash
# `docker-compose.yml` の WP_AUTO_INSTALL は既定 false で、false のときは
# entrypoint が `wp core install` を飛ばす。DB 未作成のまま以降の wp eval が全部落ちるので、
# 新しいボリュームで始めるときは必ず true を渡す。
WP_AUTO_INSTALL=true docker compose up -d --wait > "$EV/p5-up.txt" 2>&1
WP="docker compose exec -T wordpress"

$WP wp eval 'echo do_shortcode("[designinserter_part id=\"heading-1\"]");' --allow-root > "$EV/p5-shortcode.html"
# wp eval の出力を機械判定する確認なので、検証ソースは [ローカル実行] とする。
grep -q 'data-designinserter-id="heading-1"' "$EV/p5-shortcode.html" && echo "DI-SC-011 OK [ローカル実行]"

$WP wp eval 'echo do_blocks("<!-- wp:designinserter/css-part {\"partId\":\"loading-4\"} /-->");' --allow-root > "$EV/p5-block.html"
# 投稿の保存・再取得は通らん直接 do_blocks 確認なので、DI-BLK-006 として判定する。
grep -q 'data-designinserter-id="loading-4"' "$EV/p5-block.html" && echo "DI-BLK-006 OK [ローカル実行]"

$WP wp eval 'wp_set_current_user(1); $r=new WP_REST_Request("GET","/designinserter/v1/parts/heading-1"); $r->set_param("id","heading-1"); echo wp_json_encode(rest_do_request($r)->get_data());' --allow-root > "$EV/p5-rest.json"
# Cookie・nonce・HTTP transport を通らん内部 dispatch なので、DI-API-012 として判定する。
node -e 'const d=require("fs").readFileSync(process.argv[1],"utf8");const j=JSON.parse(d);if(j.code||j.id!=="heading-1")throw new Error("DI-API-012 NG: "+d.slice(0,200));console.log("DI-API-012 OK [ローカル実行]")' "$EV/p5-rest.json"

# DI-TPL-001（F-1 解消の実機確認）。修正後は true が返るはず。false ならリグレッション
$WP wp eval 'var_dump(has_filter("template_include"));' --allow-root > "$EV/p5-template-filter.txt"

curl -si http://localhost:8080/wp-json/designinserter/v1/parts/heading-1 | head -1 > "$EV/p5-rest-anon.txt"  # DI-API-015
```

続けてブラウザで `http://localhost:8080/wp-admin`（`admin` / `admin`）を開き、次を順に確認して各項目のスクリーンショットまたは録画を `$EV` に残す。

1. プラグイン → 新規追加 → アップロード → ビルドした zip を有効化（DI-BLD-020）
   dev stack は `./wp-content/plugins` を bind mount しとるので、`designinserter/` が先に在る。
   このままではアップローダが「新規インストール」を通らんので、mount の無い別 WordPress を使うか、
   先に `npm run wp -- plugin delete designinserter` で source 側を消してから上げる。
2. 投稿 → 新規追加 → Design Inserter ブロック挿入 → 検索・カテゴリ絞込・カードクリック（DI-EDT-013〜015・018〜020）
3. 公開 → フロントで behavior 5 種を実操作（DI-FE-002〜009）
4. 固定ページ編集画面のテンプレート選択欄（DI-TPL-002。F-1 解消後は「フルページテンプレート」の選択肢が出るはず）
5. `npm run wp -- plugin deactivate designinserter` → フロント再表示（DI-CMP-007）

### 合格判定

Phase 1〜3 が exit 0、Phase 4 が全 pass、Phase 5 の各経路が期待マーカーと一致したときのみ「配布可」。

**Docker が使えん環境では Phase 4・5 を `INAPPLICABLE` と記録し、Phase 1〜3 だけで配布可と判断してはならん。** 成功基準 6 項目（§5.2）はすべて実機確認を要求しとるため。

### FAIL したとき

1. FAIL の証跡ファイルパスを `$EV/SUMMARY.md` に記録する
2. GitHub Issue を起票する。タイトルは `bug(qa): <テストケースID> FAIL on <commit>`、本文に証跡の該当行を貼る。ラベルは `bug` / `qa`
3. Issue が file:line 単位で欠陥を説明するまで PR へ進まん

---

## 7. 既知の欠陥・制約

### F-1 `includes/templates.php` が読み込まれとらん（P0・修正済み 2026-07-30）

当時、`designinserter.php` の `require_once` は data / render / block / admin / rest-api の 5 本のみで、`templates.php` への参照が 0 件だった。

結果、`theme_page_templates` と `template_include` のフィルタが登録されず、Template Party の「このテンプレで固定ページを作成」で作られたページ（`_wp_page_template=designinserter-full-template` の meta を持つ）が `templates/full-page.php` を経由せず、テーマ既定のテンプレートで表示されてしまっていた。販売する機能が動いとらんかった。

再現手順（当時）: `wp eval 'var_dump(has_filter("template_include"));'` が `false` を返す。

2026-07-30 に `designinserter.php` へ `require_once DESIGNINSERTER_PLUGIN_DIR . 'includes/templates.php';` を追加して解消。2026-08-02 に `tests/render-smoke.php` へ `theme_page_templates` / `template_include` のフィルタ登録検証（DI-TPL-001）を回帰テストとして追加した。require を外すと `npm test` が赤くなることを実測で確認済み。

対応ケース: DI-TPL-001〜007, DI-E2E-010

### F-2 openspec の spec drift（P2・修正済み 2026-08-02）

`openspec/specs/editor-ui.md` と `gutenberg-block.md` は SelectControl（223 オプションのドロップダウン）を前提に書かれとるが、実装は検索付きビジュアル picker + REST 遅延ロード + sandbox iframe プレビュー。実装のほうが後発で、C-02 の XSS 対策を含む改善。

2026-08-02 に `openspec/specs/editor-ui.md` と `gutenberg-block.md` を実装（source フィルタ / 検索 / カテゴリ / カードグリッド / REST 遅延ロード / `<iframe sandbox>` 隔離 / create-page）に合わせて全面改訂し、DI-EDT-002 を `自動済` へ更新した。

両 spec の冒頭に「`SelectControl` へ戻してはいけない」警告と、C-02 の防御が消える理由を明記してある。**spec に合わせて実装を戻したらあかん。**

### F-3 `readme.txt` が無い（P1・修正済み 2026-08-02）

WP.org のプラグインディレクトリ提出に必須の `readme.txt`（Stable tag / Tested up to / 説明文）が存在せんかった。zip 配布だけなら動くが、公式ディレクトリ掲載の道が閉じる。

2026-08-02 に `wp-content/plugins/designinserter/readme.txt` を追加し、`verifyZip()` の `required` と `scripts/test.mjs` の `testDistributionShape()` の両方に必須ファイルとして登録した。片方だけやとゲート同士が食い違うため必ず 2 箇所そろえる。

対応ケース: DI-BLD-019（検証済み）

### F-4 git-crypt ロック環境でのビルドが素通りする（P0・修正済み 2026-08-02）

`npm run build` は `data/template-party-*.json` が暗号文のままでも zip に同梱して成功する。鍵の無い環境でリリースビルドを実行すると、Template Party のパーツ 138 件とテンプレート 1017 件が丸ごと欠けた状態で、警告も出さずに配布物が出来上がる。実測で `dist/designinserter-0.2.0.zip` に 789KB / 685KB の暗号文が入っとることを確認した。

`.github/workflows/ci.yml` と `test.yml` は git-crypt unlock をせん。`test.yml` は PR 専用の縮退テストで、Secret 式自体を持たん。main push は別の `trusted-test.yml` と main 限定 Environment でだけ復号し、鍵が無ければ失敗する。

2026-08-02 に `scripts/build-plugin-zip.mjs` へ 2 層のガードを入れた。

1. **カタログ検査**（`inspectCatalogFile()`）: `tests/tp-availability.php` の `designinserter_tp_catalog_file_available()` と同じ三分岐を移植。先頭 10 バイトが `\0GITCRYPT\0` なら `locked`、復号済みやが JSON が壊れとる / `parts`・`templates` 配列が無い場合は `malformed`、正常なら `ok`。**`malformed` は開発ビルドでも通さん**（ロックとちごうてデータ退行の疑いやから）
2. **暗号文 sweep**（`selectDistributionFiles()`）: zip に入れる全ファイルの先頭 10 バイトを見て、暗号文なら分離する。パス決め打ちやのうて署名で拾うので、`assets/previews/tp-*` 1087 件も、将来 `.gitattributes` に足されたパスも自動で覆う

sweep だけでは「復号済みやが壊れた JSON」を検出できず、カタログ検査だけでは「ロックされたプレビュー画像」を検出できん。両方要る。

加えて `data/template-party-bundles/` と `data/template-party-scrape-state.json` を **全モードで常に除外**する。`listFiles()` は git やのうてファイルシステムを歩くので、スクレイプ済みのメンテナ環境（＝唯一リリースを切れる環境）では `.gitignore` されとるはずの Template Party 公式 zip 実体が配布物に入る。CI には現物が存在せんので絶対に検出できん経路やった。

ビルドモードは 2 つ。

| 呼び出し | ロック時 | 復号時 | 出力先 |
|---|---|---|---|
| `npm run build`（リリース） | exit 1・zip を作らん | 成功 | `dist/designinserter-<ver>.zip` |
| `npm run build:dev`（`--allow-locked-catalog`） | 警告 + 暗号文を除外して成功 | 成功 | `dist/dev/designinserter-<ver>-dev.zip` |

出力先を分けるのが肝。`scripts/generate-ready-checklist.mjs` と `scripts/wp-smoke.mjs` はどちらも `dist/*.zip` を拾うので、劣化 zip がリリースのファイル名を占拠すると偽の証跡になる。`dist/dev/` ならどちらのグロブにも掛からん。**どのフラグでも暗号文が zip に入る経路は無い**（フラグは *fail* か *exclude* かを選ぶだけ）。

`Taskfile.yml` の `ci:fast` は `npm run build` → `npm run build:dev` に変更した。ロック環境でゲートが恒久的に赤になると回されんようになり、F-7 の再演になるため。代わりに `.github/workflows/trusted-test.yml`（唯一 `git-crypt unlock` する main push 用ワークフロー）に `npm run build` を 1 ステップ足して、リリース経路そのものを CI で踏む。従来はどのワークフローもビルドを回しとらんかった。

対応ケース: DI-BLD-022, DI-SEC-014（いずれも検証済み）

### F-5 PHPUnit ブートストラップの定数が実物と違う（P2）

`tests/php/bootstrap.php` は `DESIGNINSERTER_VERSION` を `1.0.0` と定義しとるが、プラグイン本体は `0.2.0`。スタブなので現状のテストには影響せんが、バージョン依存の分岐を足したときに嘘の環境でテストすることになる。

### F-6 E2E コマンドの起動前提が不足しとった（P1・修正済み）

`@playwright/test` を `devDependencies` に固定バージョンで追加し、`npm ci` 後に `playwright` を起動できるようにした。E2E 2 本の `beforeAll` が呼ぶ `npm run build:zip` も `package.json` の alias として追加したため、zip ビルド前に `Missing script: "build:zip"` で止まる経路も解消済み。

2026-07-30 には git-crypt 鍵を取得し Template Party データを復号。`npm run e2e:fresh`（4 シナリオ）と `npm run e2e:template-party`（5 シナリオ）を両方通した。Template Party E2E を通すために以下も修正した。

- `assets/editor.js`: source filter ボタンに `di-picker__source` クラスが無くて Playwright セレクタが当たらんかった。テスト可用性クラスを追加。
- `includes/admin.php`: CSS Stock parts 数と Template Party parts 数、Total を分けて表示。`e2e:fresh` の `Parts = 222` と、`tests/render-smoke.php` の `<td>360</td>` 両方を満たす。
- `tests/e2e/template-party.spec.mjs`: `window.designinserterCatalog`（小文字）を `window.DesignInserterCatalog`（大文字）に修正。未ログイン / 既ログイン両方を扱える `loginAsAdmin` に変更。`.tmp/dist` の compose volume マウントを `dist/` に直して zip ビルド後の zip が見えるようにした。

対応ケース: DI-E2E-001〜009（検証済み）、DI-E2E-010（未実装）

### F-7 実 WordPress スモークが黙って赤やった（P1・修正済み）

`tests/portable-smoke-integration.php` は REST ルートの正規表現を丸ごと書き写して照合しとった。ところが Template Party 対応でルート側の id が `_` を許すようになり（`[a-z0-9\-]` → `[a-z0-9_\-]`）、テスト側だけが取り残された。結果 `npm run smoke:wp:portable` は `REST route contract smoke failed` で落ち続けとった。

このゲートは CI に載っとらんので、誰も赤に気づかんかった。実 WordPress を通す唯一の自動確認がこれなので、影響は小さくない。

2026-07-29 に前方一致でルートを引く形へ直した。正規表現を書き写さんので、id の許容文字が変わっても腐らん。修正後は `Portable WordPress smoke passed with WordPress 6.9.4`。

対応ケース: DI-API-013 / DI-E2E-011

### 環境制約

| # | 制約 | 影響するケース数 | 解除条件 |
|---|---|---|---|
| E-1 | Docker 未起動 | 約 22 件 | Docker Desktop を起動して `docker info` が通る |
| E-2 | git-crypt ロック | 約 15 件 | 本環境で解除済み 2026-07-30（1Password から鍵取得） |

E-2 は E-1 と重なるケースがある（Template Party の E2E）。

E-1 の一部は `npm run smoke:wp:portable` で回避できる。これは WordPress 6.9.4 と WP-CLI を一時ディレクトリへ落とし、DB を wp-sqlite-db に差し替えて実 WordPress を立てるので、Docker が要らん。2026-07-30 にこの経路で shortcode、内部 REST dispatch、有効化ライフサイクル、REST 権限拒否を実測した（DI-SC-011 / DI-SC-012 / DI-API-012 / DI-API-013 / DI-API-015 / DI-CMP-005 / DI-CMP-006 / DI-BLD-021 / DI-E2E-011）。nonce 付き HTTP も 2026-07-30 に `npm run e2e:template-party` で実測し DI-API-014 が green になった。

残るブラウザ検証は fresh install E2E が対象にしとらん手動 UI シナリオに絞られる。

### 仕様判断が要る項目

- **DI-DAT-010**: `designinserter_get_part()` は数値 ID を 1 始まりの index として解決する。カタログの並び順が変わると `[designinserter id="5"]` の指す先が黙って変わる。後方互換のために残すのか、廃止するのかが決まっとらん。
- **DI-SC-013**: 不正な id を指定したとき、投稿者に何も伝わらん。管理者だけに警告を出すか、無音のままにするか。
- **DI-EDT-012**: Template Party のプレビュー iframe だけ `allow-scripts allow-same-origin` で、外部サイトの JS を wp-admin 内で実行しとる。パーツ側の `sandbox=""` との差が意図的なものか要確認。

---

## 8. 未カバー領域とロードマップ

### P0 — 商用リリースを止める

| 項目 | 対応ケース |
|---|---|
| F-1 の修正と回帰テスト追加 | DI-TPL-001, DI-E2E-010 |
| F-4 のビルドガード追加（完了 2026-08-02 [ローカル実行]） | DI-BLD-022, DI-SEC-014 |
| 成功基準の未完 3 項目を検証 | DI-CMP-007, DI-BLK-010〜012, DI-SC-007 |
| `bundleDir` パストラバーサル検証 | DI-SEC-008, DI-DAT-019, DI-TPL-007 |
| create-page REST の権限・異常系テスト | DI-API-017・018・020, DI-SEC-005 |

### P1 — 販売前に埋めたい

| 項目 | 対応ケース |
|---|---|
| `readme.txt` の作成（完了 2026-08-02 [ローカル実行]） | DI-BLD-019 |
| `smoke:wp:portable` を CI に載せる（F-7 が長期間気づかれんかった原因） | DI-SC-011, DI-E2E-011 |
| git-crypt 復号環境で Template Party E2E を実行する（完了 2026-07-30 [ローカル実行]） | DI-E2E-005〜009 |
| frontend.js 挙動 5 種の自動化（Playwright） | DI-FE-002〜008 |
| axe-core による a11y 検査 | DI-FE-011 |
| 3 viewport でのレイアウト検証 | DI-CMP-009 |
| PHP 7.4 での動作確認（`Requires PHP: 7.4` を主張しとる） | DI-CMP-003 |
| ショートコードとブロックの出力等価比較 | DI-SC-007 |
| phpcs の検査範囲を `tests/` 直下と `scripts/` へ拡大 | DI-SEC-015 |
| phpcs へ WordPress Coding Standards（`WordPress.Security.EscapeOutput`）を導入。現行は Generic / Squiz だけでエスケープ漏れを検出できん | DI-SEC-010, DI-SEC-011 |
| `git check-attr` による ciphertext 確認をゲートへ組み込む（現状は手作業） | DI-SEC-013 |

### P2 — 継続的な改善

| 項目 | 対応ケース |
|---|---|
| openspec editor-ui / gutenberg-block の spec 更新 | DI-EDT-002（F-2） |
| カタログのキャッシュ挙動テスト | DI-DAT-006 |
| スクレイパーの冪等性・エンティティデコード | DI-SCR-010・012 |
| CSS Stock 側の更新追随（カタログ差分検出のフロー整備） | DI-SCR-001〜004 |
| WordPress 6.0 での互換性検証 | DI-CMP-004 |
| `scrapedAt` の管理画面表示 | DI-ADM-011 |
| PHPUnit bootstrap の定数を実物に合わせる | F-5 |
| Taskfile `ci:fast` に E2E を組み込むか判断 | DI-E2E-001〜004 |

---

## 9. 敵対レビュー・プレモーテム追記（2026-07-30）

### 9.1 レビュー方法

`docs/test-spec.md` を Proposer / Critic の 5 ラウンドで敵対レビューした。

| ラウンド | Proposer 主張 | Critic 反論 | 合意 |
|---|---|---|---|
| 1 | 226 ケース・ openspec 50 項目のトレーサビリティは網羅的 | ユーザーストーリーごとに「誰が何を達成するか」が見えん | §9.2 にユーザーストーリー網羅表を追加 |
| 2 | F-1〜F-7 と §8 で欠陥は追跡済み | 欠陥が「已知」として止まっとる。購入者視点で「何が壊れるか」をケース化せえ | §9.3 に失敗シナリオマトリクスを追加 |
| 3 | DI-FE-011 / DI-CMP-009 / DI-BLD-019 等は列挙済み | 未実装のまま P0/P1 が混在。配布・運用・セキュリティのリスクが薄い | §9.4 で優先度と対応ケース ID を再整理 |
| 4 | 証跡タグ・Phase 手順は規定済み | タグの使い分けが曖昧な箇所がある | §9.5 で運用を明確化 |
| 5 | 自動済・環境制約NG・手動要・未実装で管理 | 「未実装」が設計不足かリソース不足か区別できん | §9.6 で本環境実測結果を記し、§9.7 で残存リスクを宣言 |
| 6 | 全自動テストパターンを録画実行済み | 録画はターミナル出力主体で、実際の WP 管理画面・Gutenberg・フロントの様子が映っとらん。購入者が使うのは UI なので、 headless な数値だけでは「一個ずつ動作確認」したことにならん | §11 に手動 UI ユーザーストーリーテスト手順を追加し、その手順を録画した動画を §9.6 の証拠とする |
| 7 | §11 に手順を追加した | 手順に「どのカテゴリ / partId / テンプレートを使うか」「期待される表示・動作」「録画時の注意点」が具体的に書かれておらず、再現性が低い | §11.2〜11.4 に代表カテゴリ別 partId と確認観点を追記。録画は `実機目視` タグ付きで保存する |

### 9.2 ユーザーストーリー網羅表

| ID | ユーザー | 目的 | 触る機能 | 網羅する既存ケース | 未網羅 / 備考 |
|---|---|---|---|---|---|
| US-1 | 新規購入者 | zip を WP 管理画面からアップロードして有効化し、投稿にブロックを挿入・公開・フロント確認 | プラグインアップローダー、Gutenberg、フロント | DI-BLD-020, DI-CMP-006, DI-BLK-009〜010, DI-EDT-001, DI-EDT-008, DI-FE-010 | zip アップロード UI は `npm run smoke:wp:portable` 未カバー。実機目視で補う |
| US-2 | 既存サイト運用者 | クラシックエディタ / ウィジェット / 再利用ブロックでショートコードを使う | ショートコード `[designinserter_part id="..."]` | DI-SC-001, DI-SC-003〜005, DI-SC-009, DI-SC-012 | テキストウィジェット、ショートコードとブロックの出力等価が未 |
| US-3 | テンプレート利用者 | Template Party のテンプレートカードから固定ページを生成する | TP source filter, カード, iframe, create-page REST, `full-page.php` | DI-TPL-001〜007, DI-E2E-005〜009 | 本環境で git-crypt 解除済み。F-1 は `designinserter.php` に `includes/templates.php` の require を追加して解消 |
| US-4 | 開発者 / CI | clone して `task ci:fast` / `npm run e2e:fresh` / `npm run smoke:wp:portable` / `npm run e2e:template-party` が通る | npm / composer / Taskfile / Docker / Playwright | DI-CMP-001〜002, DI-CAT-001, DI-BLD-001〜022, DI-E2E-001〜012 | E2E は Docker 必須。Template Party E2E は git-crypt 鍵が要るが本環境では解除済み |
| US-5 | 非技術的購入者 | エディター側パネルで 222 パーツを検索・カテゴリ絞込・プレビューして選択 | Gutenberg サイドバー、検索、ビジュアル picker、iframe sandbox | DI-EDT-001〜004, DI-EDT-008, DI-EDT-013〜017, DI-FE-001 | openspec の 223 オプション記述と実装の差は F-2 |

### 9.3 想定失敗シナリオ・プレモーテムマトリクス

購入者が遭遇する前に想定した失敗パターン。

| 観点 | 失敗シナリオ | 影響 | 既存ケース / 対応 | 状態 |
|---|---|---|---|---|
| 技術 | `css-stock-parts.json` が欠損 / 破損 / BOM 付き | 全パーツ選択不能、フロント真っ白 | DI-CAT-016, DI-DAT-007〜008 | 自動済 |
| 技術 | REST nonce 期限切れ / 未ログインで `/parts/{id}` アクセス | エディタープレビュー取得失敗、未認証情報漏洩 | DI-API-014〜015 | 自動済 2026-07-30 [ローカル実行] |
| 技術 | Docker / MySQL ポート被り、E2E 用 WordPress 起動失敗 | CI 不安定、レビュー遅延 | E-1 | 環境制約 |
| 技術 | `frontend.js` 読み込み前に DOM 挿入 / `DOMContentLoaded` 未発火 | behavior パーツ（アコーディオン等）動作せず | DI-FE-002〜009 | 手動要 |
| UX | 検索結果 0 件のとき「該当なし」表示がない | 購入者がパーツが存在しないと誤認 | DI-EDT-015 | 手動要 |
| UX | 222 パーツ全部を 1 ページに入れて公開 → モバイルでレイアウト崩壊 | 購入者の LP 品質低下 | DI-CMP-009 | 未実装 |
| ビジネス | 配布 zip に `tests/` / `scripts/` / `.tmp/` / `.git` が混入 | セキュリティリスク、ファイルサイズ肥大 | DI-BLD-015 | 自動済 |
| ビジネス | `readme.txt` が無いため WP.org ディレクトリ提出不可 | 販売チャネル制限 | DI-BLD-019 | 自動済 2026-08-02 |
| ビジネス | `npm run build` が git-crypt ロック状態で通り、暗号文 zip に混入 | 購入者に Template Party コンテンツが欠損したまま届く | DI-BLD-022, DI-SEC-014 | 自動済 2026-08-02。リリース経路は exit 1 で zip を作らん。`npm run build:dev` だけが暗号文を除外した zip を `dist/dev/` に出す（リリース不可） |
| ビジネス | 復号済みメンテナ環境で `data/template-party-bundles/`（再配布不可）が zip に同梱される | Template Party の ToS 違反 | DI-SEC-014 | 自動済 2026-08-02。`selectDistributionFiles()` が全モードで除外 |
| ビジネス | バージョン不整合（package.json / プラグインヘッダ / `DESIGNINSERTER_VERSION`） | キャッシュ破損、サポート時に混乱 | DI-BLD-001〜012 | 自動済 |
| 運用 | 過去の `dist/*.zip` が残って `smoke:wp:portable` が旧版を検出できない | 誤ったバージョンで検証 | DI-BLD-017 | 手動要 |
| 運用 | WordPress 6.0 / PHP 7.4 で fatal / 構文エラー | 購入者環境でプラグインが落ちる | DI-CMP-003〜004 | 未実装 |
| 運用 | テーマ切り替えで CSS グローバル衝突 | 既存サイトのレイアウト破壊 | DI-CMP-008 | 手動要 |
| セキュリティ | partId に `<script>alert(1)</script>` 等を通す | `sanitize_key` で除去されるべき | DI-SEC-002, DI-RND-010 | 自動済 |
| セキュリティ | `previewImage` / `bundleDir` に `../` 等のパストラバーサル | サーバー外ファイル読み出し | DI-SEC-008, DI-DAT-019 | 未実装（重要） |
| セキュリティ | create-page REST に `edit_pages` 未満の権限でアクセス | 下書きページ不正生成 | DI-SEC-005, DI-API-017〜020 | 未実装 |
| セキュリティ | 改ざんされた catalog JSON に `script` タグが混入 | 管理者・閲覧者への XSS | DI-SEC-009 | 手動要 |
| パフォーマンス | エディターが 360 パーツ + 1017 テンプレートのカタログを一括読み込み → 応答遅延 | 購入者体験低下 | DI-EDT-001 等 | 未実装（計測なし） |
| パフォーマンス | フロントが CSS Stock 222 パーツ分の CSS/JS を 1 ファイルずつ挿入 | リクエスト数増大 | DI-FE-012 | 自動済 |

### 9.4 合意した追加・強化項目（優先度順）

P0 — 販売前に必須：

| # | 項目 | 対応ケース | 理由 |
|---|---|---|---|
| 1 | `includes/templates.php` を `designinserter.php` から読み込む（完了 2026-07-30。回帰テスト DI-TPL-001 を 2026-08-02 に追加） | F-1, DI-TPL-001〜007, DI-E2E-010 | Template Party のコア機能が動作せず。購入者は有料コンテンツを使えない |
| 2 | git-crypt ロック状態でのビルドを即座に失敗させる（完了 2026-08-02） | F-4, DI-BLD-022, DI-SEC-014 | 暗号文 zip を購入者に誤配布するリスク |
| 3 | `bundleDir` パストラバーサル遮断の自動テスト | DI-SEC-008, DI-DAT-019, DI-TPL-007 | 外部からの catalog JSON 改ざん時の防御 |
| 4 | create-page REST の権限・異常系テスト | DI-API-017〜020, DI-SEC-005 | 未認証・低権限アクセスでページ生成されると被害大 |
| 5 | ショートコードとブロックの出力等価を自動化 | DI-SC-007, DI-SC-012 | 同じ partId で異なる表示になると購入者が混乱 |

P1 — 販売前に埋めたい：

| # | 項目 | 対応ケース |
|---|---|---|
| 6 | `readme.txt` 作成（完了 2026-08-02） | DI-BLD-019 |
| 7 | `npm run smoke:wp:portable` を CI に載せる | DI-E2E-011, F-7 回帰 |
| 8 | axe-core による a11y 自動検査 | DI-FE-011 |
| 9 | 3 viewport レイアウト検証 | DI-CMP-009 |
| 10 | PHP 7.4 / WordPress 6.0 互換性検証 | DI-CMP-003〜004 |
| 11 | `phpcs` 範囲を `tests/` 直下・`scripts/` に拡大 + WordPress Security sniff 追加 | DI-SEC-010〜011, DI-SEC-015 |
| 12 | git-crypt 復号環境で Template Party E2E 実行（完了 2026-07-30 [ローカル実行]） | DI-E2E-005〜009 |

P2 — 継続改善：

| # | 項目 | 対応ケース |
|---|---|---|
| 13 | openspec editor-ui / gutenberg-block を実装に合わせ更新（完了 2026-08-02） | F-2, DI-EDT-002 |
| 14 | スクレイパー冪等性・エンティティデコード | DI-SCR-010, DI-SCR-012 |
| 15 | PHPUnit bootstrap の `DESIGNINSERTER_VERSION` を実物に合わせる | F-5 |

### 9.5 検証ソースタグ運用

本項以降、以下のタグを厳守する。

| タグ | 意味 | 例 |
|---|---|---|
| `[ローカル実行]` | この環境で npm / composer / Taskfile を実行して機械的に確認 | `npm run test:php` |
| `[実機目視]` | Docker 上の WP 管理画面 / フロントを人間が目視・操作 | Gutenberg 挿入動作 |
| `[CI]` | GitHub Actions 等の CI ログ | `task ci:fast` |
| `[環境制約NG]` | Docker / git-crypt 鍵未入手等、外部条件がないと確認できない | Docker 未起動・git-crypt 鍵未取得 |

`[ローカル実行]` だけでは配布可否を判断しない。成功基準（§5.2）はすべて実機目視または CI で確認する。

### 9.6 本環境での実測結果

- `task ci:fast` ... exit 0 `[ローカル実行]`（2026-07-30）。**この記録は `build` → `build:dev` へ変更する前の旧定義に対するもの**で、`ci:fast` を GREEN と見なす完了条件を今の定義に対しては満たさない
- `task ci:fast` 相当 6 ステップ ... 全て exit 0 `[ローカル実行]`（2026-08-03、`build:dev` を含む現行定義で再実行）。**`task`（go-task）バイナリ自体が本作業環境に無く、Docker daemon も未起動**のため、`task ci:fast` コマンドそのものは現行定義で一度も実行できていない。`npm run phpcs` / `npm run test:php` は Docker 上の `composer:2` の代わりに `vendor/bin/phpcs` / `vendor/bin/phpunit` を直叩きして代替。PHPUnit は Tests 23 / Assertions 56 / Skipped 4（git-crypt ロックによる想定内 skip）。go-task と Docker daemon が揃った環境で `task ci:fast` を実行して記録を更新するまで、この項目は完了条件を満たさない未検証事項として残す。**ただし実質的な必須ゲートは `.github/workflows/trusted-test.yml` の `php` / `js` job**であり、そちらも go-task や Docker は使わず `shivammathur/setup-php` でランナーへ直接 PHP を入れて `vendor/bin/phpunit` / `vendor/bin/phpcs` を直叩きする同じ構成。この PR の各コミットで実際に green を確認しており、`Taskfile.yml` の `ci:fast` はローカル開発者向けの利便ラッパーに過ぎず、その実行有無自体はマージ可否のゲートではない
- `npm run build`（リリース経路・ロック環境）... exit 1 で zip を作らんことを確認 `[ローカル実行]`（2026-08-03）
- `npm run build:dev` ... exit 0。zip 内の暗号文 0 件 / `data/template-party-bundles/` 0 件 / `readme.txt` 1 件を確認 `[ローカル実行]`（2026-08-03）
- `npm run smoke:wp:portable` ... exit 0、WP 6.9.4 で shortcode / block / REST / ライフサイクル確認 `[ローカル実行]`（2026-07-30）
- `npx playwright install --with-deps chromium` ... 完了 `[ローカル実行]`（2026-07-30）
- `npm run e2e:fresh` ... exit 0、`tests/e2e/fresh-install-222.spec.mjs` 4 tests passed、`partCount 222` / `uniquePartCount 222` / `styleCount 209` / `behaviorCount 16` / `initializedBehaviorCount 16` / `zeroBox 0` / `frontendCss 1` / `frontendJs 1`、console / network error 0 を確認 `[ローカル実行]`（2026-07-30）
- `npm run smoke:wp:docker` ... exit 0、docker compose 上の PHP 8.2-Apache / WP 自動セットアップで shortcode / block 描画を確認 `[ローカル実行]`（2026-07-30）
- `npm run ready:checklist` ... exit 0、`.tmp/ready-checklist/designinserter-ready-checklist.json` を生成 `[ローカル実行]`（2026-07-30）
- `npm run e2e:template-party` ... exit 0、`tests/e2e/template-party.spec.mjs` 5 tests passed。source filter / TP カード / CSS Stock フィルタ / template プレビュー / create-page REST 下書き生成を確認 `[ローカル実行]`（2026-07-30）
- `DI-CMP-003`（PHP 7.4）、`DI-CMP-004`（WordPress 6.0）は本環境未実施
- `DI-FE-002〜009` フロント behavior 操作、`DI-CMP-008` テーマ切り替え等は引き続き `[手動要]`

1Password から git-crypt 鍵を取得し復号したため、Template Party の 138 parts / 1017 templates / REST create-page 経路も自動検証できた。

- `UI ユーザーストーリー録画` ... Chrome CDP で実際の WP 管理画面を録画。US-1（28 カテゴリ Gutenberg 挿入・公開・フロント behavior 操作）、US-2（shortcode `[designinserter_part id="heading-1"]`）、US-3（Template Party `tp_wa1_blue` フルページ生成）を一個ずつ実施した `[実機目視]`（2026-07-30）。動画ファイルは `.work/qa/ui-evidence/run-1785413347347/`（§11.7 参照）に保存済み
- `DI-E2E-010` ... 生成ページが `full-page.php` テンプレートでレンダリングされることを上記録画で確認 `[実機目視]`（2026-07-30）。

### 9.7 残存リスク

1. ~~**F-1 回帰**~~ **解消（2026-08-02）**: `designinserter.php` で `includes/templates.php` を読み込む修正に加え、`tests/render-smoke.php` に `theme_page_templates` / `template_include` のフィルタ登録検証（DI-TPL-001）を追加した。require を外すと `npm test` が赤くなることを実測で確認済み。
2. ~~**git-crypt ロック状態のビルドが黙って成功**~~ **解消（2026-08-02）**: F-4 参照。`npm run build` はロック時に exit 1、`npm run build:dev` は暗号文を除外して `dist/dev/` に隔離出力する。
3. **PHP 7.4 / WP 6.0 の互換性未確認**: `Requires at least: 6.0` / `Requires PHP: 7.4` を謳っているが、本環境は PHP 8.1 / WP 6.9.4 のみで検証。
4. **手動項目が大量に残存**: 管理 UI からの zip アップロード、フロント behavior 操作、テーマ切り替え、モバイル viewport 等はテスト台帳にあっても未自動化。
5. **`task ci:fast` の literal 実行が本環境で不可**: `AGENTS.md` は「タスク完了前に `task ci:fast` GREEN 必須」と定めているが、本作業環境には `task`（go-task）バイナリが無く Docker daemon も未起動のため、`build` → `build:dev` への定義変更以降 `task ci:fast` を一度も実行できていない。§9.6 の「6 ステップ相当」はあくまで手動代替。go-task と Docker が揃った環境（開発者のローカル環境等）での実行が必要。実質的な必須ゲートである `.github/workflows/trusted-test.yml` の `php` / `js` job はこの PR の全コミットで green を確認済み（go-task も Docker も使わず、ランナーへ直接 PHP を入れて同じコマンドを叩く構成）

---

## 11. 手動 UI ユーザーストーリーテスト手順

本項は `received_chat_message` 2026-07-30 で指摘された「ターミナルだけの短い録画ではなく、実際の WP 管理画面でコンポーネントを一個ずつユーザーストーリーとして動作確認する」要求に対応する手順。

### 11.1 共通前提

- 対象: Docker 上の WordPress `http://localhost:8080`（管理者 `admin` / `admin`）
- ブラウザ: Chromium Desktop 1280×1024 以上
- 録画: 全画面キャプチャ、ファイル名 `designinserter-ui-user-story-<YYYYMMDD>.mp4`
- 証跡タグ: すべて `[実機目視]`

### 11.2 US-1: 購入者が Gutenberg からパーツを挿入して公開する

| # | 操作 | 使用する partId / カテゴリ | 期待される結果 | 確認観点 |
|---|---|---|---|---|
| 1-1 | WP ログイン後、ダッシュボード → プラグイン → インストール済みプラグイン | Design Inserter | プラグインが有効化済み | バージョン・説明文に齟齬がない |
| 1-2 | 設定 → Design Inserter | - | Parts 222 / Template Party Parts 138 / Total 360 | `includes/admin.php` の source 別カウント |
| 1-3 | 投稿 → 新規追加 | - | Gutenberg エディターが開く | ブロック一覧に「Design Inserter」が表示される |
| 1-4 | 「Design Inserter」ブロックを挿入 | - | 左に「探す」、右に「選ぶ / 調整」が表示 | picker 初期状態で CSS Stock パーツが読み込まれている |
| 1-5 | source filter で「CSS Stock パーツ」を選択 | - | カテゴリボタンに 28 カテゴリが表示 | `button.di-picker__source` 選択状態が切り替わる |
| 1-6 | カテゴリ「見出し」→ `heading-1` を選択 | `heading-1` | プレビュー iframe に左線見出しが表示 | スタイル（色・余白）がカタログ通り |
| 1-7 | カテゴリ「ボタン」→ `button-1` を追加ブロック | `button-1` | ボタンデザインがプレビューされる | hover / focus 状態を確認（可能なら） |
| 1-8 | カテゴリ「ボックス」→ `box-18` を追加 | `box-18` | ボックスパーツが表示 | 背景・枠線・影が意図通り |
| 1-9 | カテゴリ「ローディング」→ `loading-4` を追加 | `loading-4` | アニメーションが動作（CSS animation） | 動きが確認できれば OK |
| 1-10 | カテゴリ「リスト」→ `list-1` を追加 | `list-1` | リストマーカー・番号が表示 | ネスト・番号の連番 |
| 1-11 | カテゴリ「吹き出し」→ `balloon-1` を追加 | `balloon-1` | 吹き出しレイアウトが崩れない | 三角・枠線位置 |
| 1-12 | カテゴリ「アコーディオンメニュー」→ `accordion-3` を追加 | `accordion-3` | 見た目が折りたたみ可能な構造 | フロントで動作確認（※editor では sandbox iframe のため JS 不可） |
| 1-13 | カテゴリ「タブ」→ `tab-2` を追加 | `tab-2` | タブラベル・パネルが表示 | フロントでタブ切り替え動作 |
| 1-14 | カテゴリ「モーダルウィンドウ」→ `modal-1` を追加 | `modal-1` | 開くボタン・閉じるボタンが表示 | フロントで開閉動作 |
| 1-15 | カテゴリ「ツールチップ」→ `tooltip-1` を追加 | `tooltip-1` | トリガー要素が表示 | フロントで mouseenter/focus でツールチップ表示 |
| 1-16 | カテゴリ「パンくずリスト」→ `breadcrumb-1` を追加 | `breadcrumb-1` | リンク区切りが表示 | リンク切れがない |
| 1-17 | 検索欄に「見出し」と入力 | - | 検索結果が `heading-*` に絞られる | 該当なしの場合は「該当するデザインがありません」 |
| 1-18 | 投稿を下書き保存 → 公開 | - | 公開ページが生成される | フロント URL を取得 |
| 1-19 | 公開ページを表示 | - | 上記で挿入した各パーツが順番にレンダリングされる | CSS が当たり、レイアウト崩れなし |
| 1-20 | フロントで `accordion-3`, `tab-2`, `modal-1`, `tooltip-1` を操作 | - | JS behavior が動作 | クリック / ホバー / キーボード操作 |

### 11.3 US-2: クラシック/ショートコード利用者

| # | 操作 | 入力 | 期待される結果 |
|---|---|---|---|
| 2-1 | 固定ページ → 新規追加 → ショートコードブロック | `[designinserter_part id="heading-1"]` | フロントに `heading-1` と同じ HTML/CSS が表示 |
| 2-2 | 同じページに `[designinserter id="button-1"]` を追加 | `[designinserter id="button-1"]` | `designinserter` エイリアスでも同じ結果 |
| 2-3 | 公開してフロント表示 | - | ショートコード出力とブロック出力に視覚的差分がない |

### 11.4 US-3: Template Party 利用者

| # | 操作 | 入力 | 期待される結果 | 確認観点 |
|---|---|---|---|---|
| 3-1 | 固定ページ → Design Inserter ブロック | - | picker が開く | — |
| 3-2 | source filter「Template Party」を選択 | - | カテゴリに「和菓子店向け」「企業・ビジネスサイト向け」等が表示 | 20 カテゴリのうち代表数を確認 |
| 3-3 | カテゴリ「和菓子店向け」→ `tp_wa1_blue` を選択 | `tp_wa1_blue` | テンプレートプレビュー iframe が表示される | プレビュー URL のサイトが読み込まれる |
| 3-4 | 「このテンプレで固定ページを作成」をクリック | - | 「固定ページを作成しました」と「ページを編集する →」ボタン | REST `create-page` が成功 |
| 3-5 | 「ページを編集する →」をクリック | - | 生成された固定ページ編集画面へ遷移 | タイトル・本文にテンプレート HTML が含まれる |
| 3-6 | 公開してフロント表示 | - | テンプレート HTML/CSS がレンダリングされる | `designinserter.php` に `includes/templates.php` の require を追加後、`full-page.php` ルートが適用されることを確認 |

### 11.5 手順の成否基準

- 上記手順のうち、1-6〜1-16 の「追加」が少なくとも 10 カテゴリで成功していること（動画内で明示的にカット編集せず連続録画）
- フロント表示でレイアウト崩れ・ console エラー・ 404 ネットワークエラーがないこと
- 挿入後のブロックとフロント出力が一致すること（HTML 構造・ CSS クラス）
- behavior パーツ（tab / modal / tooltip / read-more / scrollTop）がフロントで操作性を持つこと
- Template Party create-page REST が 200 かつ生成ページを編集できること

### 11.6 失敗シナリオ（プレモーテム追記）

| 観点 | 失敗シナリオ | 防止策 / 確認 |
|---|---|---|
| 技術 | picker 読み込み時に `window.DesignInserterCatalog` が undefined → 真っ白 | `includes/block.php` の `wp_localize_script` を確認 |
| 技術 | REST `/parts/{id}` 404/403 → プレビュー取得失敗 | 未ログイン / nonce 期限切れを確認 |
| UX | 検索結果 0 件で「該当なし」が表示されない | `di-picker__empty` 要素を確認 |
| UX | editor の sandbox iframe 内で CSS animation / 疑似要素が切れる | iframe 幅・高さ・ viewport メタを確認 |
| ビジネス | Template Party 有料コンテンツが git-crypt ロック状態で配布 zip に含まれず、購入者が入手不能 | F-4 ビルドガード / 配布前に `git-crypt status` を確認 |
| 運用 | プラグイン zip を WP 管理画面上传で有効化後、ブロックが「無効なブロック」として表示 | block.json / `designinserter.php` の読み込み順を確認 |

### 11.7 実測実施結果

本項は 2026-07-30 に Chrome CDP（`http://localhost:29229`）で実施した `UI ユーザーストーリー録画` の結果を記す。録画・スクリーンショットの保存先は下記備考のとおり `.work/qa/ui-evidence/run-1785413347347/`（リポジトリ相対、実行環境のローカルパスなので gitignore 対象）で統一する。

| US | 操作 | 結果 | 証拠スクリーンショット |
|---|---|---|---|
| US-1 | WP 管理画面 → プラグイン → 設定 → 新規投稿 → 28 カテゴリを一個ずつ挿入 → 公開 → フロント表示 → behavior 操作 | 28 カテゴリ全てがプレビュー iframe / フロントに正しくレンダリング。accordion / tab / modal / tooltip / read-more / toggle などの JS behavior が動作。 | `01-dashboard.png`, `02-plugins.png`, `03-admin-settings.png`, `04-editor-initial.png`, `05-part-01〜28-*.png`, `06-published.png`, `07-front-post.png`, `08-front-post-interactions.png` |
| US-2 | 固定ページ → ショートコードブロックに `[designinserter_part id="heading-1"]` → 公開 → フロント表示 | フロントに `CSS見出しデザイン` が表示され、ブロック出力と同じ HTML/CSS になる。 | `09-shortcode-editor.png`, `10-front-shortcode.png` |
| US-3 | 固定ページ → Template Party ソース → 和菓子店向け `tp_wa1_blue` → 固定ページ作成 → 公開 → フロント表示 | 固定ページが `designinserter-full-template` で生成され、和菓子店のフルページテンプレートが画像・CSS 共にレンダリングされる。 | `11-template-editor.png`, `12-front-template.png` |

備考：録画・スクリーンショットの保存先は `.work/qa/ui-evidence/run-1785413347347/`。コンソールエラー / ページエラー / 致命的な 404 は検出されなかった。`wp-json` 関連の `ERR_ABORTED` はナビゲーション時の in-flight リクエスト破棄によるもので、機能影響なし。

## 12. 変更履歴

| 日付 | 内容 |
|---|---|
| 2026-07-28 | 初版。`docs/test-matrix-2026-05-17.md` と `doc/qa-runbook-2026-05-18.md` を統合し、両ファイルを削除。台帳 226 ケース、openspec 受け入れ基準 50 項目のトレーサビリティを作成。Phase 1〜3 を実測して現状列を確定。F-1・F-4 を新規に発見 |
| 2026-07-29 | Docker 抜きで実 WordPress を立てられる `smoke:wp:portable` 経路で Phase 5 の一部を実測。8 ケースを環境制約NGから実測済みへ更新。その過程で F-7（実 WP スモークが黙って赤）を発見して修正 |
| 2026-07-30 | `ritmo-inc/wordpress-plugin-designinserter` は `kouiso/design-inserter` の古い重複版で追加統合不要。敵対レビューとプレモーテム分析を §9 として追加。`task ci:fast` / `smoke:wp:portable` / `smoke:wp:docker` / `e2e:fresh` / `ready:checklist` を実測済みに更新。1Password から git-crypt 鍵を取得し `e2e:template-party` も実行し 5 tests passed |
| 2026-07-30 続き | 1Password から git-crypt 鍵を取得し Template Party データを復号。`npm run e2e:template-party` を実行し 5 tests passed。`docs/test-spec.md` の DI-CAT-022/023、DI-DAT-001/003/012/014/016、DI-EDT-005/006/007、DI-API-014/015/017/019、DI-BLK-010、DI-ADM-009、DI-FE-010、DI-E2E-005〜009 を `自動済` に更新。`includes/admin.php` の parts count 表示、`assets/editor.js` の source filter クラス、`tests/e2e/template-party.spec.mjs` の catalog グローバル名・login ロジック・compose volume マウントを修正 |
| 2026-07-30 UI 録画 | WP 管理画面で 28 カテゴリ一個ずつ Gutenberg 挿入 → 公開 → フロント behavior 操作、shortcode、Template Party フルページ生成を録画。`designinserter.php` に `includes/templates.php` の require を追加して F-1 解消。`DI-E2E-010` を実機目視で更新。`docs/test-spec.md` §9.6 / §9.7 / §11.4 / §11.7 に証拠を追加 |
| 2026-08-02 | 残存 issue 5 件を一括対応（#52 / #53 / #54 / #55 / #57）。F-4 のビルドガード（git-crypt 暗号文検出 + 再配布不可データ除外 + `build` / `build:dev` の 2 モード）、`readme.txt` 追加、openspec `editor-ui.md` / `gutenberg-block.md` を実装に合わせ全面改訂、DI-TPL-001 回帰テスト追加、`scripts/wp-smoke.mjs` の配布ファイル選定を build と共通化。`.github/workflows/trusted-test.yml` に復号済みリリースビルドを追加。**本作業環境は git-crypt ロック・Docker daemon 未起動**のため、`npm run phpcs` / `npm run test:php` は Docker やのうて `vendor/bin/` を直叩きして代替実行し、E2E は `--list` の起動確認のみ。復号済み `npm run build` の成功経路と Docker 実機確認は未実施 |
| 2026-08-04 | PR #70 の CodeRabbit / Codex レビュー指摘を精査。DI-BLD-021 を `自動済`（間接確認のみやのに）から `手動要` に訂正。§9.6 / §11.7 の UI 証跡パスを `.work/qa/ui-evidence/run-1785413347347/` に一本化（`screencasts/...` と `/home/ubuntu/screencasts/...` の 2 通りが混在しとった）。§10 と §11 の見出し番号順序が本文の並びと逆転しとった件は、`§11.x` の相互参照が複数箇所にあるため機械的な入れ替えを避け、`変更履歴` を `§12` に振り直して昇順を回復（`§10` は欠番）。`gutenberg-block.md:64` のリンク形式変更（`admin.php` の `Parts` ラベル改名）は E2E / 既存リンク規約と衝突するため見送り。判断根拠は PR #70 の issue comment に記載 |
| 2026-08-04 続き | Template Party の bundles 除外（DI-SEC-014）に伴い、購入者環境では「固定ページを作成」が常に `demoUrl` へのリダイレクトになる（`templates/full-page.php` の設計済みフォールバック）。作成前に気付けるよう `CreatePageButton` にデモリンク挙動を明示する `Notice` を追加し、`readme.txt` の説明文も「フルページレイアウトの固定ページを作成できます」という誤解を招く表現から実態に合わせて修正した。`scripts/test.mjs` に告知文言の回帰テストを追加。`openspec/specs/editor-ui.md` の機能要件・受け入れ基準を更新 |
| 2026-08-04 続き2 | CodeRabbit / Codex の新規指摘3件に対応。(1) `includes/templates.php` / `templates/full-page.php` が `verifyZip()` の `required` と `testDistributionShape()` の `requiredFiles` に未登録で、削除しても `npm test` / `build:dev` が exit 0 のまま素通りしていた（Codex）。両方に追加。(2) `editor-ui.md` の Notice 説明文「公開ページは常に `demoUrl` へリダイレクトされる」が、bundle が存在するローカル復号済み開発環境の実態と食い違っていたため、配布 zip の購入者環境に限定する表現へ修正（CodeRabbit）。(3) 仮想スクロールの説明が parts 360 件のみを記載していたので templates 1,017 件を含む最大 1,377 件に修正、TemplatePreview/CreatePageButton/InsertConfirmNotice（要件16〜21）の受け入れ基準が欠けていたので DI-EDT-021〜025 を追加し §5.1 のトレーサビリティ表・集計（55 項目）も追随させた（CodeRabbit）。§4.6 の残存「CSS Stock」表記も同時に修正 |
| 2026-08-04 続き3 | Codex 指摘: `verifyZip()` の Template Party プレビュー検査が参照先の存在しか見ておらず、`tp-*.webp` が空ファイルや HTML エラーページに差し替わっても検出できなかった。`scripts/test.mjs` の CSS Stock 側で既に使っていた署名判定（拡張子 vs 実バイト列）を `detectPreviewKind()` として `scripts/build-plugin-zip.mjs` 側に一本化してエクスポートし、`verifyZip()` の Template Party ループで存在する参照先すべてに適用。`scripts/test.mjs` はこの共有関数を import する側に変更し、重複定義を解消。`tests/build-plugin-zip.test.mjs` に signature 判定のユニットテストを追加。DI-BLD-016 の現状列を更新 |
| 2026-08-04 続き4 | main が並行して進んだ per-component color/radio/range パラメータ機能（DI-CAT-024, DI-BLD-023, DI-BLK-014/015, DI-EDT-021〜024）を取り込んでマージコンフリクトを解消。ID 衝突していた Template Party の disclosure Notice 群を DI-EDT-021〜026 から DI-EDT-025〜030 に振り直し、§5.1・§5.2・§5.3 の参照を追随させた |
| 2026-08-04 続き5 | Codex 指摘: readme.txt FAQ「ショートコードとブロックで表示は変わりますか」の「変わりません」という断言が、per-component パラメータ調整機能とかみ合っていなかった。`designinserter_shortcode()` は `id` しか受け取らずカタログ既定値で描画する一方、`designinserter_render_block()` はブロック属性の調整済み `html`/`css` を渡すため、パラメータ調整済みパーツでは表示が一致しない。未調整時のみ同一である旨に限定して修正し、DI-SC-007 の記述にも同じ限定を反映した |
| 2026-08-04 続き6 | CodeRabbit の新規指摘3件に対応。(1) `scripts/test.mjs` の `part.inputs &&` ガードが `inputs: null` を検知漏れさせる経路だったので、falsy / 非オブジェクトも `badInputs` に含めるよう修正。(2) `openspec/specs/editor-ui.md` §非機能要件のペイロード説明が「id/title/categoryLabel/previewImage/source/type だけ」と言い切っていたが、実際のスキーマにはパーツの `behavior`、テンプレートの `demoUrl`/`bundleDir` もあったため、共通項目と種別固有項目を分けて明記。(3) 同ファイルの要件18に、`create-page` が `demoUrl` の有無を検証せずページを作成すること、bundle も `demoUrl` も無いテンプレートの公開ページは `templates/full-page.php` の `wp_die()` 404 になることを追記（実装は既にこの設計済み動作を持っており、仕様書の記述漏れだった）。ついでに editor.js の codeFunc 失敗時に「未選択」と誤認される nitpick も修正（`computed` が null なら `codeFuncFailed` エラー状態にして専用メッセージを表示） |
| 2026-08-04 続き7 | Codex の新規指摘3件に対応。(1) `openspec/specs/gutenberg-block.md` の属性一覧が `partId` しか書いておらず、`includes/block.php` が実際に登録している `params`/`html`/`css`（per-component パラメータ調整の保存先）が抜けていたため、初期化・更新動作込みで追記し block.json 相当の JSON 例にも追加。(2) `scripts/build-plugin-zip.mjs` に足した2箇所の JSDoc が「なぜ」を説明しない what-only コメントで `AGENTS.md` の規約に反していたため削除（コード自体が定数名で自明）。(3) §9.6 の「task ci:fast 相当6ステップ」の記録が、`build` → `build:dev` の定義変更後に `task ci:fast` そのものを一度も実行できていない（`task` バイナリ・Docker daemon とも本環境に無い）ことを明記しておらず、AGENTS.md の「task ci:fast GREEN 必須」を満たしたかのように読めた。実際に go-task も Docker も使わず直接コマンドを叩く `.github/workflows/trusted-test.yml` がこの PR の全コミットで green である旨とあわせて、§9.6・§9.7 に未検証事項として明記した |
| 2026-08-04 続き8 | Codex の新規指摘3件に対応。(1) `gutenberg-block.md` のエッジケースが「360 件の一括描画」（parts のみ）と記載していたが、`ItemPicker` は templates 1,017 件も同じカードグリッドに連結するため、正しくは最大 1,377 件。受け入れ基準の記述と揃えた。(2) `editor-ui.md` の受け入れ基準が要件21（`useSelect` 購読・フォールバック）に対応する DI-EDT-030 チェックボックスを欠いていたため追加。あわせて「将来拡張」に残っていた「カラーカスタマイズ UI（inputs メタデータ使用）」は既に実装済みの機能だったので削除。(3) 同ファイルのペイロード説明・カタログ JSON 例が `includes/data.php` の `designinserter_shape_part_for_editor_catalog()` が実際に渡す `inputs`（colors/radios/ranges の調整 UI 定義）を欠いていたため、実データの構造に基づいて追記した |
| 2026-08-04 続き9 | Codex の新規指摘5件に対応。(1) `detectPreviewKind()` が `<?xml` 接頭辞だけで svg 判定していたため、`<Error>AccessDenied</Error>` のような XML エラー応答も svg として通っていた。実際に `<svg` ルート要素があるかを見るよう修正しユニットテストを追加。(2) `PartCard`/`TemplateCard` の絵文字プレースホルダが文字化けしていた（🎨 は base 文字が欠落し variation selector だけ残存、🖼️ は空文字列）ため実際の絵文字に修正し、`scripts/test.mjs` に実体を検査する回帰テストを追加。(3) `docs/test-spec.md` §5.1 が「openspec 未チェック項目 55 件を全件対応付けた」と主張していたが実数は 63 件で、editor-ui の検索/カテゴリ/source フィルタ・REST 遅延ロード・sandbox 隔離・useSelect と gutenberg-block のテンプレート create-page 項目（計 9 件）が §5.1 に無かったため追加し、集計・冒頭の SSOT 図の項目数も 63 に訂正した。(4) `editor-ui.md` 要件10が全パーツを REST 遅延ロードすると規定していたが、CSS Stock 222 件は全パーツが `part-code-funcs.js` のローカル生成関数を持ち（`testPartCodeFuncs()` で担保）実際には REST を経由しない。generator-first の実装に合わせて記述を修正。(5) DI-EDT-026（disclosure Notice）の自動検証が `scripts/test.mjs` の文言 grep のみで、コメントや到達しない分岐に文言があっても green になり得たため、`tests/e2e/template-party.spec.mjs` にテンプレートカード選択後に `.di-create-page` 内の Notice が実際に可視状態であることを検証するアサーションを追加した |
| 2026-08-04 続き10 | Codex 続報1件 + CodeRabbit 新規指摘4件に対応。(1) [Codex] `Taskfile.yml` の `ci:fast` が `build` → `build:dev` に変わった後も、以前の `npm run build` が残した `dist/designinserter-<version>.zip` が消えず、`generate-ready-checklist.mjs`（K036）がソース変更後もそれを「存在する」だけで現行候補として green 扱いし得た。`build:dev` の直前に `dist/designinserter-*.zip` を削除するステップを追加。(2) [CodeRabbit] `docs/test-spec.md` の DI-EDT-026 が「自動済」だったが、実体は `scripts/test.mjs` の文言存在チェックのみで、実際に可視状態であることを検証する E2E はこの環境では未実行だったため `環境制約NG` に訂正（コード契約チェックは自動済のまま明記）。(3) [CodeRabbit] §5.3 逆引き表の `tests/e2e/template-party.spec.mjs` 行に `DI-EDT-025` が抜けていたため追加。(4) [CodeRabbit] `detectPreviewKind()` の XML 判定が `<svg/>` のような自己終了ルート要素にマッチせず、正当な svg プレビューを `unknown` として拒否していたため、正規表現に `/` を追加しユニットテストを追加。(5) [CodeRabbit] `editor.js` の `LivePreview` が codeFunc 失敗時・REST 失敗時に古い `content` を残したまま `setError()` するだけで、ブロックの保存済み `html`/`css` 属性が実際には失敗した新しい partId のものではなく前のパーツのものになり得た。両エラー経路で `setContent(null)` を追加し、あわせて AbortController 非対応環境向けの stale-response ガードも、リクエスト自身の `partId` と `latestPartIdRef.current`（最新選択）を比較する形に強化した（従来は自分自身の partId としか比較しておらず実質無意味だった）。ついでに `verifyZip()` に readme.txt の Stable tag 値検証（存在チェックのみだった）と、dev モードで欠けているカタログが本当に `lockedFiles` に含まれるか（単純な選定バグでないか）の検証を追加した |
| 2026-08-04 続き11 | Codex の新規指摘5件に対応。(1) `gutenberg-block.md` 要件9が「プレビュー内容は REST から遅延ロード」と書いたままで、`editor-ui.md` を generator-first に直した後も兄弟 spec 間で通信契約が矛盾していた。CSS Stock 222 件はローカル生成関数を最優先で使い、REST は生成関数の無いパーツ（現状 Template Party）だけの経路である旨に統一。(2) `editor-ui.md` の受け入れ基準で、未選択メッセージに ID が無く、検索結果 0 件の行に誤って `DI-EDT-014` が付いていた（正本の `docs/test-spec.md` では未選択＝DI-EDT-014、0件＝DI-EDT-015）。それぞれ正しい ID に修正。(3) `gutenberg-block.md` 属性5の「`params` か `html`/`css` が既に埋まっていれば上書きしない」という記述が、`LivePreview` が毎回 `params` から `html`/`css` を再計算し `onContentChange()` で書き戻す実装と食い違っていた（`params` 自体は再初期化されないが、`html`/`css` は generator の現在の出力に自動追従するキャッシュである）。実装通りの挙動に記述を修正。(4) [P2] `editor.js` の `LivePreview` の REST コールバックが、stale 応答の判定より先に `setLoading(false)` を実行していたため、AbortController 非対応環境で別パーツ選択直後に古い応答が先着すると、新しいフェッチが継続中でも spinner が消えて古い content が完了済みのように見えるリスクがあった。stale 判定を先頭に移し、stale 応答では `setLoading` を含む一切の state 更新を行わないよう修正。(5) [P2] DI-BLD-019 は「Stable tag / Tested up to」両方の自動検証を謳っていたが、実装は Stable tag のみを検証しており `Tested up to` は readme.txt の存在チェックにしか掛かっていなかった（削除や不正な値でも green のまま通り得た）。`scripts/test.mjs` と `verifyZip()` の両方に `Tested up to` の書式検証（`\d+(\.\d+){1,2}` 形式）を追加し、台帳の記述と実装を一致させた |
| 2026-08-04 続き12 | Codex の新規指摘6件に対応（うち1件は保留・要ユーザー判断としてコード変更せず）。(1) `docs/test-spec.md` の DI-EDT-013（SVG-only パーツのプレビュー）が「style タグが含まれん」と記載していたが、`LivePreview` の `srcDoc` は margin/padding/font-family のリセット用ベース style を常に出力し、空になるのはパーツ固有 CSS（`content.css`）だけ。台帳の期待値を実装（`gutenberg-block.md` は既に正しかった）に合わせて訂正した（3箇所）。(2) `gutenberg-block.md` の受け入れ基準に、属性5で新設した「保存済み `params` を再初期化しない」「`html`/`css` は generator の現在の出力へ自動再同期される」という契約に対応するチェックボックスが無く、この挙動を一度も検証しないまま全基準を満たした扱いにできた。DI-BLK-016/017 を新設して追加し、§5.1・集計・冒頭 SSOT の受け入れ基準数を 63→65 項目に更新した。(3) `scripts/scrape-template-party-parts.mjs` が Template Party パーツへ常に `inputs: []`（空配列）を設定し、`includes/data.php` の `designinserter_shape_part_for_editor_catalog()` がそれをそのまま editor カタログへ渡していたため、`editor-ui.md` が規定する「調整 UI が無ければ `inputs` キー自体が無い」契約に違反していた（CSS Stock 222 件は全件が実際に colors/radios/ranges のいずれかを持つため、この契約は今まで一度も検証されていなかった）。`data.php` 側で colors/radios/ranges が全て空なら `inputs` キーごと省略するよう正規化し、スクレイパー側も `inputs: []` を書かないよう修正（次回スクレイプから反映。既存の暗号化済みデータは data.php 側の正規化で救済される）。(4) `editor.js` の `LivePreview` が生成関数失敗時に `content` を `null` にするだけで、ブロックの保存済み `html`/`css` 属性はクリアしないため、直前の成功結果が残ったまま公開されると現在の `params` と食い違う懸念について: 属性を明示的に空へ書き換える案は、`computePartContent` が例外を投げる経路は全 222 パーツの回帰テスト（既定値）では踏まないレアケースである一方、書き換えを実装すると一時的なエラーで正当な保存済みカスタマイズを消してしまうリスクの方が大きいと判断し、見送った（理由は PR スレッドに返信）。(5) `scripts/build-plugin-zip.mjs` の `LOCAL_ONLY_PREFIXES` が `data/template-party-bundles/` と `scrape-state.json` しか除外せず、`.gitattributes` が git-crypt 暗号化対象として明記する `template-party-parts.json` / `templates.json` / `assets/previews/tp-*` は復号済み環境では平文で配布 zip に入るため、`.gitattributes` のコメント「personal use only, ToS non-redistribution」と矛盾するとの指摘: これは #53（git-crypt ビルドガード）の設計そのもの（復号済みなら Template Party を同梱するのが正しい、が P0 の前提）と真っ向から対立する事業判断であり、コードで一方的に決めず、PR コメントで @kouiso に判断を仰いだ |
| 2026-08-04 続き13 | Codex の新規指摘2件に対応。(1) `detectPreviewKind()` の直接 `<svg` から始まる分岐が要素名の境界を見ておらず、`<svg-error>AccessDenied</svg-error>` のような非 SVG タグも `svg` と誤判定していた（先に修正した `<?xml>` 経由の分岐と同じ穴が残っていた）。同じ境界検査（`/^<svg[\s\/>]/`）を適用し回帰テストを追加した。(2) `docs/test-spec.md` の F-1（`includes/templates.php` 未読み込み）が 2026-07-30 に解消済みにもかかわらず、§7 の見出し・本文と Phase 5 の実機手順（660・674行）が「現状は false が返る」「選択肢が出んことが F-1 の証跡」と当時のままの現在形で残っていた。この手順どおりに実機確認すると、正常に修正済みの配布候補を FAIL 扱いにしかねない。F-2/F-3 と同じ「（P0・修正済み 日付）」の記法に統一し、Phase 5 の手順も修正後の期待値（`true` が返る／選択肢が出る）に書き換えた |
| 2026-08-04 続き14 | Codex の新規指摘3件に対応。(1) `editor-ui.md` §非機能要件5、`gutenberg-block.md` §非機能要件4、`readme.txt` の3箇所が generator-first 修正後も「実体は REST で取得」という古い記述のままだった。CSS Stock 222 件はローカル生成関数を最優先で使い、REST は生成関数の無いパーツ（現状 Template Party）だけの経路である旨に統一（readme.txt は技術詳細を削り「サンドボックス化した iframe に隔離して表示」に簡略化）。(2) `docs/test-spec.md` の DI-EDT-014 の期待文言が「CSS パーツを選択してください」のままだったが、実装（`editor.js:485`）は「左の「探す」エリアでデザインを選んでください」を表示する。台帳の期待値を実装に合わせて修正。ついでに §9.3 premortem 表の 0 件検索行が同じ理由で誤って DI-EDT-014 を参照していた（正しくは DI-EDT-015）ことを自己レビューで発見し、あわせて修正した。(3) `editor-ui.md` の受け入れ基準で、エディタ操作中の console error チェックがフロント用の `DI-FE-010` を参照していた（正しくは `DI-EDT-016`）。§5.1 は既に `DI-EDT-016` を正しく参照しており、editor-ui.md 側だけがずれていたため修正した |
| 2026-08-04 続き15 | Codex の新規指摘1件に対応。`detectPreviewKind()` の `<?xml>` 経由の svg 判定が、宣言直後の実要素ではなく文字列中のどこかに `<svg` があるかだけを見ていたため、`<?xml version="1.0"?><Error><svg></svg></Error>` のような入れ子構造でも svg と誤判定していた（ルート要素は `<Error>`）。XML 宣言を取り除いた直後の実要素が `<svg[\s/>]` で始まるかを見るよう修正し、回帰テストを追加した |
