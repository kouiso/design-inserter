# Design Inserter テスト仕様書

## 1. 本書の位置づけ

本書は design-inserter の**テストに関する唯一の正本**。何を検証するか（台帳）、どう実行するか（手順）、今どこまで検証できとるか（現状）を1本に集約する。

商用配布するプラグインなので、「動いたと思う」やなく「どのケースが、どの証拠で担保されとるか」を追えることを目的にする。

### SSOT の関係

```text
openspec/specs/*.md   要件・仕様の正本（受け入れ基準 50 項目）
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
| ローカル静的 | Phase 1・2・3 | 不要 | — | PHP 7.4+ / Node 22+ / composer |
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
| DI-CAT-022 | Template Party パーツが 138 件 | 138 | `DesignInserterCoreTest::test_catalog_template_party_parts_have_correct_source` | 環境制約NG（git-crypt） |
| DI-CAT-023 | Template Party テンプレートが 1017 件 | 1017 | `DesignInserterCoreTest::test_get_templates_returns_all_template_party_templates` | 環境制約NG（git-crypt） |

### 4.2 DI-DAT — データ層

| ID | 確認内容 | 期待結果 | 検証方法 | 現状 |
|---|---|---|---|---|
| DI-DAT-001 | 2 ソースをマージして 360 件 | 360 | `DesignInserterCoreTest::test_catalog_merges_css_stock_and_template_party_parts` | 環境制約NG |
| DI-DAT-002 | css-stock 由来に `source='css-stock'` | 222 件 | `test_catalog_css_stock_parts_have_correct_source` | 自動済 2026-07-28 |
| DI-DAT-003 | TP 由来に `source='template-party'` | 138 件 | `test_catalog_template_party_parts_have_correct_source` | 環境制約NG |
| DI-DAT-004 | categories が slug で重複排除される | 重複 0 | `test_catalog_categories_have_no_duplicate_slugs` | 自動済 2026-07-28 |
| DI-DAT-005 | TP カタログが復号できん環境で CSS Stock 単独で正常動作する | fatal なし。222 件で動作し、TP 依存アサーションが skip として報告される | `tests/tp-availability.php` + `tests/render-smoke.php` + PHPUnit `requireTemplateParty()` | 自動済 2026-07-28 |
| DI-DAT-006 | catalog が static キャッシュされ 1 リクエスト最大 1 回しか decode せん | 2 回目でファイル I/O が起きん | — | 未実装 |
| DI-DAT-007 | カタログファイル欠損時に致命的エラーにならん | exit 0 | `tests/catalog-fallback.php missing` | 自動済 2026-07-28 |
| DI-DAT-008 | カタログ JSON 破損時に致命的エラーにならん | exit 0 | `tests/catalog-fallback.php invalid` | 自動済 2026-07-28 |
| DI-DAT-009 | `designinserter_get_part()` が `sanitize_key` で正規化して引ける | `' Heading-1 '` → `heading-1` | `render-smoke.php` / `test_get_part_sanitizes_and_finds_known_part` | 自動済 2026-07-28 |
| DI-DAT-010 | 数値 id を index として引く後方互換経路 | `designinserter_get_part('3')` が 3 件目を返す | — | 未実装。仕様として残すか要判断（§7 参照） |
| DI-DAT-011 | 存在しない id で null | null | `render-smoke.php` | 自動済 2026-07-28 |
| DI-DAT-012 | `designinserter_get_template()` が既知 ID を返す | `tp_wa1_blue` + demoUrl / bundleDir | `test_get_template_by_id_returns_known_template` | 環境制約NG |
| DI-DAT-013 | 未知 template ID で null | null | `test_get_template_returns_null_for_unknown_id` | 自動済 2026-07-28 |
| DI-DAT-014 | editor catalog が parts + templates を露出 | 360 / 1017 | `test_editor_catalog_exposes_merged_parts_and_templates` | 環境制約NG（parts 側 222 は検証済み） |
| DI-DAT-015 | editor catalog の source フィルタが 3 種 | all / css-stock / template-party | `test_editor_catalog_exposes_three_source_filters` | 自動済 2026-07-28 |
| DI-DAT-016 | editor catalog の template エントリが必須フィールドを持つ | id / type / source / demoUrl / bundleDir | `test_editor_catalog_template_entries_have_required_fields` | 環境制約NG |
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
| DI-BLK-009 | ブロック挿入パネルに Design Inserter が出る | 表示 | `tests/e2e/fresh-install-222.spec.mjs` エディタテスト | 環境制約NG（Docker） |
| DI-BLK-010 | 投稿保存後、フロントで正しい HTML + CSS が描画される | 一致 | `fresh-install-222.spec.mjs` 222 パーツテスト | 環境制約NG（Docker） |
| DI-BLK-011 | リロード後も `partId` 属性が保持される | 選択維持 | 実機: エディタ再読込 | 手動要 |
| DI-BLK-012 | プラグイン無効化後、保存済み投稿がエラーにならん | 500 なし・出力が消える | 実機: `wp plugin deactivate` → フロント表示 | 手動要 |
| DI-BLK-013 | 再有効化で出力が復活する | 復活 | 実機: `wp plugin activate` | 手動要 |

### 4.6 DI-EDT — エディタ UI

| ID | 確認内容 | 期待結果 | 検証方法 | 現状 |
|---|---|---|---|---|
| DI-EDT-001 | サイドバーに Design Inserter パネルが出る | 表示 | `fresh-install-222.spec.mjs` | 環境制約NG（Docker） |
| DI-EDT-002 | パーツ選択 UI の形式 | — | openspec は SelectControl 223 オプション、実装は検索付きビジュアル picker | 不整合（§7 F-2） |
| DI-EDT-003 | 検索ボックスで絞り込める | 該当のみ表示 | `fresh-install-222.spec.mjs` | 環境制約NG（Docker） |
| DI-EDT-004 | カテゴリボタンで絞り込める | 該当のみ | 同上 | 環境制約NG（Docker） |
| DI-EDT-005 | source フィルタ 3 種が表示される | 3 ボタン | `tests/e2e/template-party.spec.mjs` | 環境制約NG（Docker + git-crypt） |
| DI-EDT-006 | Template Party フィルタで template カードが badge 付きで出る | badge 表示 | 同上 | 環境制約NG（Docker + git-crypt） |
| DI-EDT-007 | CSS Stock フィルタで template カードが隠れる | parts のみ | 同上 | 環境制約NG（Docker + git-crypt） |
| DI-EDT-008 | カードクリックでプレビューが即表示される | プレビュー描画 | `fresh-install-222.spec.mjs` | 環境制約NG（Docker） |
| DI-EDT-009 | プレビューが REST 経由で遅延ロードされる | `window.fetch(restUrl + partId)` | `scripts/test.mjs` `testEditorAssetContract()` | 自動済 2026-07-28 |
| DI-EDT-010 | プレビューが sandbox iframe に隔離される | `sandbox: ''` + `srcDoc` | 同上 | 自動済 2026-07-28 |
| DI-EDT-011 | カタログ HTML に `dangerouslySetInnerHTML` を使わん | 不使用 | 同上 | 自動済 2026-07-28 |
| DI-EDT-012 | template プレビュー iframe の sandbox 強度 | `allow-scripts allow-same-origin`（part 側と意図的に異なる） | — | 未実装。差分の妥当性を §7 で判断 |
| DI-EDT-013 | SVG-only パーツのプレビューに style タグが含まれん | style 無し | 実機: loading 系を選択 | 手動要 |
| DI-EDT-014 | 未選択時に案内メッセージが出る | 「CSS パーツを選択してください」 | 実機 | 手動要 |
| DI-EDT-015 | 該当 0 件時に empty state とフィルタ解除が出る | `di-picker__empty` 表示・clear で復帰 | 実機: 存在せん語で検索 | 手動要 |
| DI-EDT-016 | エディタ操作中に JS console error が出ん | error 0 / failed request 0 | `fresh-install-222.spec.mjs` `collectBrowserIssues()` | 環境制約NG（Docker） |
| DI-EDT-017 | カード連続クリックで破綻せん | 破綻なし | 同上 | 環境制約NG（Docker） |
| DI-EDT-018 | REST fetch に `X-WP-Nonce` が付く | ヘッダ有り | 実機: ネットワーク監視 | 手動要 |
| DI-EDT-019 | カードの `aria-pressed` / `aria-label` が選択状態と同期する | 同期 | 実機: a11y スナップショット | 手動要 |
| DI-EDT-020 | 管理画面 9 色テーマで選択状態が視認できる | コントラスト確保 | 実機: 各テーマ | 手動要 |

### 4.7 DI-SC — ショートコード

| ID | 確認内容 | 期待結果 | 検証方法 | 現状 |
|---|---|---|---|---|
| DI-SC-001 | 読み込み時に `designinserter_part` が登録される | 登録済み | `render-smoke.php` | 自動済 2026-07-28 |
| DI-SC-002 | エイリアス `designinserter` も登録される | 両方登録 | `test_shortcode_uses_shared_renderer` | 自動済 2026-07-28 |
| DI-SC-003 | `[designinserter_part id="heading-1"]` で描画 | wrapper 出力 | `render-smoke.php` | 自動済 2026-07-28 |
| DI-SC-004 | SVG-only パーツで style タグなし | style 無し | 同上 | 自動済 2026-07-28 |
| DI-SC-005 | 不明 id で何も表示せん | 空文字 | 同上 | 自動済 2026-07-28 |
| DI-SC-006 | id 属性なしで何も表示せん | 空文字 | — | 未実装 |
| DI-SC-007 | 出力がブロック出力と同一 | 文字列一致 | — | 未実装（同一 renderer 共有は DI-SC-002 で担保、出力等価比較は無い） |
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
| DI-API-014 | 実 WP で nonce 付き HTTP リクエストが通る | 200 JSON | — | 手動要。portable smoke は PHP 内で `rest_do_request` を叩くだけで、Cookie も `X-WP-Nonce` も送っとらん。nonce 経路は未検証 |
| DI-API-015 | 未ログインの生 HTTP GET が拒否される | 401 または 403 | — | 手動要。同上。内部ディスパッチで 401/403 になることは 2026-07-29 に確認したが、HTTP 経路は未検証 |
| DI-API-016 | 不正文字を含む id がルート正規表現にマッチせん | 404 | 実機: `curl .../parts/He%20ading` | 環境制約NG（Docker） |
| DI-API-017 | `/templates/{id}/create-page` が POST で登録される | 登録・POST のみ | — | 未実装 |
| DI-API-018 | create-page が `edit_pages` を要求する | 権限チェック | — | 未実装 |
| DI-API-019 | create-page が下書きページを作る | page_id + edit_url | `template-party.spec.mjs` | 環境制約NG（Docker + git-crypt） |
| DI-API-020 | create-page が未知テンプレートで 404 | not_found | — | 未実装 |
| DI-API-021 | create-page が meta 3 種を設定する | `_wp_page_template` / `_di_template_id` / `_di_template_bundle_dir` | 実機: `wp post meta list` | 手動要 |

### 4.9 DI-TPL — フルページテンプレート

**この節は全件が F-1（`includes/templates.php` 未読み込み）でブロックされとる。§7 参照。**

| ID | 確認内容 | 期待結果 | 検証方法 | 現状 |
|---|---|---|---|---|
| DI-TPL-001 | `includes/templates.php` が require され、フィルタが登録される | `theme_page_templates` / `template_include` が登録済み | `render-smoke.php` に `isset($state['filters']['template_include'])` を追加 | 未実装（F-1） |
| DI-TPL-002 | ページテンプレート一覧に選択肢が出る | 表示 | 実機: ページ編集画面 | 未実装（F-1 でブロック） |
| DI-TPL-003 | create-page で作ったページがプラグインテンプレートで表示される | `templates/full-page.php` が使われる | 実機: 下書きプレビュー | 未実装（F-1 によりテーマ既定へフォールバック） |
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
| DI-ADM-009 | 実ブラウザで CTA / リンクが到達可能 | リンク健全 | `fresh-install-222.spec.mjs` | 環境制約NG（Docker） |
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
| DI-FE-010 | フロントで JS console error が出ん | error 0 | `fresh-install-222.spec.mjs` | 環境制約NG（Docker） |
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
| DI-SEC-014 | 配布 zip に Template Party の平文データが混入せん | 混入 0 | — | 未実装（F-4 と対） |
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
| DI-BLD-016 | zip 内 catalog の総数・プレビュー画像が揃う | 一致（1329 ファイル） | 同上 | 自動済 2026-07-28 |
| DI-BLD-017 | 古い zip / 別バージョン zip を検出して失敗する | 明示エラー | `npm run smoke:wp:portable` | 手動要 |
| DI-BLD-018 | テスト・ビルド支援ファイルが gitignore されとらん | ignore 0 | `scripts/test.mjs` `testGitVisibility()` | 自動済 2026-07-28 |
| DI-BLD-019 | `readme.txt`（Stable tag / Tested up to）がある | 存在 | — | 未実装（F-3） |
| DI-BLD-020 | zip を管理 UI からアップロードして有効化できる | 有効化成功 | 実機: `plugin-install.php` | 手動要 |
| DI-BLD-021 | zip から `wp plugin install --activate` が成功する | `installed successfully` | `npm run smoke:wp:portable` | 自動済 2026-07-29（間接。dist zip を展開して `plugin activate` は成功。`plugin install` 経路自体は未） |
| DI-BLD-022 | git-crypt ロック環境でのビルドを検出して失敗する | 明示エラー | — | 未実装（F-4） |

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
| DI-E2E-001 | 新規 WP に zip を入れて 222 パーツ全件をフロント描画 | 全件描画・console error 0 | `tests/e2e/fresh-install-222.spec.mjs` | 環境制約NG（Docker） |
| DI-E2E-002 | 同 WP でショートコードが共有 renderer 経由で描画 | 描画 | 同上 | 環境制約NG（Docker） |
| DI-E2E-003 | 管理設定画面の CTA / ボタン列挙 | 健全 | 同上 | 環境制約NG（Docker） |
| DI-E2E-004 | Gutenberg で挿入・選択・検索・カテゴリ・連続使用 | 破綻なし | 同上 | 環境制約NG（Docker） |
| DI-E2E-005 | TP source フィルタ表示 | 3 ボタン | `tests/e2e/template-party.spec.mjs` | 環境制約NG（Docker + git-crypt） |
| DI-E2E-006 | TP カード + badge 表示 | 表示 | 同上 | 環境制約NG（Docker + git-crypt） |
| DI-E2E-007 | CSS Stock フィルタで template 非表示 | parts のみ | 同上 | 環境制約NG（Docker + git-crypt） |
| DI-E2E-008 | template カードクリックで iframe プレビュー | iframe 表示 | 同上 | 環境制約NG（Docker + git-crypt） |
| DI-E2E-009 | create-page REST で下書きページ生成 | 生成 | 同上 | 環境制約NG（Docker + git-crypt） |
| DI-E2E-010 | 生成ページがフルページテンプレートで表示される | `full-page.php` 適用 | — | 未実装（F-1 の回帰テストとして最優先） |
| DI-E2E-011 | 実 WP ランタイムで shortcode / block / REST が描画される | 3 経路とも期待マーカー一致 | `npm run smoke:wp:portable`（WP 6.9.4 + wp-sqlite-db） | 自動済 2026-07-29 [ローカル実行]（Docker dev stack 上での再確認は未） |
| DI-E2E-012 | CI が main と全 PR で green | success | `gh run list` | 手動要 |

---

## 5. トレーサビリティ

### 5.1 openspec 受け入れ基準 → テストケース ID

`openspec/specs/*.md` の未チェック項目 50 件を全件対応付けた。

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
| editor-ui | サイドバーに Design Inserter パネル | DI-EDT-001 | 環境制約NG |
| editor-ui | SelectControl に 223 オプション | DI-EDT-002 | 不整合（F-2） |
| editor-ui | オプションラベルが `[カテゴリ名] パーツ名` 形式 | DI-EDT-002 | 不整合（F-2） |
| editor-ui | 選択後にプレビューが即表示 | DI-EDT-008 | 環境制約NG |
| editor-ui | SVG-only のプレビューに style タグなし | DI-EDT-013 | 手動要 |
| editor-ui | 未選択で案内メッセージ | DI-EDT-014 | 手動要 |
| editor-ui | リロード後も選択状態を保持 | DI-BLK-011 | 手動要 |
| editor-ui | JS エラーがコンソールに出ん | DI-EDT-016 | 環境制約NG |
| gutenberg-block | 挿入パネルに Design Inserter | DI-BLK-009 | 環境制約NG |
| gutenberg-block | SelectControl に 222 件 | DI-EDT-002 | 不整合（F-2） |
| gutenberg-block | 選択後にエディタ内プレビュー | DI-EDT-008 | 環境制約NG |
| gutenberg-block | SVG-only で style タグ出力なし | DI-EDT-013 | 手動要 |
| gutenberg-block | 保存後フロントで HTML+CSS 描画 | DI-BLK-010 | 環境制約NG |
| gutenberg-block | 無効 partId でフロント表示なし | DI-BLK-008 | 未実装 |
| gutenberg-block | 無効化後も保存済み投稿でエラーなし | DI-BLK-012 | 手動要 |
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

集計: 自動済 27 / 環境制約NG 8 / 手動要 8 / 未実装 4 / 不整合 3。

### 5.2 requirements 成功基準 → テストケース ID

| # | 成功基準 | ID | 現状 |
|---|---|---|---|
| 1 | プラグインを有効化できる | DI-CMP-006, DI-BLD-020 | 環境制約NG / 手動要 |
| 2 | Gutenberg で選択・プレビュー・保存できる | DI-EDT-008, DI-BLK-010, DI-BLK-011 | 環境制約NG / 手動要 |
| 3 | フロントエンドで描画される | DI-BLK-010, DI-E2E-001 | 環境制約NG |
| 4 | ショートコードがブロックと同じ結果を出す | DI-SC-007, DI-SC-012 | 未実装 / 環境制約NG |
| 5 | 222 パーツすべてが選択可能 | DI-E2E-001, DI-CAT-001 | 環境制約NG / 自動済 |
| 6 | 無効化しても壊れん | DI-BLK-012, DI-CMP-007 | 手動要 |

**成功基準 6 項目のうち、現時点で完全に自動検証できとるものは 0 件。** すべて Docker 実機か手動確認が要る。

### 5.3 テストファイル → テストケース ID（逆引き）

| ファイル | カバーする ID |
|---|---|
| `scripts/test.mjs` | DI-CAT-001〜015・018〜021, DI-BLD-001〜012・018, DI-BLK-004・005, DI-EDT-009〜011, DI-SEC-007, DI-CMP-001・002, DI-FE-001, DI-SCR-011 |
| `tests/render-smoke.php` | DI-RND-001〜011・013・015, DI-SCP-001〜004・006, DI-BLK-001〜003・006・007, DI-SC-001・003〜005・008, DI-API-001〜013, DI-ADM-001〜007, DI-FE-012, DI-DAT-009・011・017, DI-CAT-016, DI-SEC-002〜004・006 |
| `tests/catalog-fallback.php` | DI-DAT-007・008 |
| `tests/tp-availability.php` | DI-DAT-005 |
| `tests/php/DesignInserterCoreTest.php` | DI-DAT-001〜004・012〜018, DI-CAT-022・023, DI-RND-002・012・015, DI-SCP-005, DI-SC-002 |
| `tests/e2e/fresh-install-222.spec.mjs` | DI-E2E-001〜004, DI-BLK-009・010, DI-EDT-001・003・004・008・016・017, DI-ADM-009, DI-SC-012, DI-FE-010, DI-CMP-006 |
| `tests/e2e/template-party.spec.mjs` | DI-E2E-005〜009, DI-EDT-005〜007, DI-API-019 |
| `scripts/build-plugin-zip.mjs` | DI-BLD-013〜016 |
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
[ "$LINT" -eq 0 ] && [ "$TEST" -eq 0 ] && echo "Phase 1 OK" || echo "Phase 1 NG (lint=$LINT test=$TEST)"
```

### Phase 2 — PHP 品質

```bash
./vendor/bin/phpcs   > "$EV/p2-phpcs.txt" 2>&1     # DI-SEC-010, DI-ADM-008
./vendor/bin/phpunit > "$EV/p2-phpunit.txt" 2>&1   # DI-DAT 群
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
# 実機の WordPress ランタイムで判定するので、結果には [実機目視] を添える
grep -q 'data-designinserter-id="heading-1"' "$EV/p5-shortcode.html" && echo "DI-SC-011 OK [実機目視]"

$WP wp eval 'echo do_blocks("<!-- wp:designinserter/css-part {\"partId\":\"loading-4\"} /-->");' --allow-root > "$EV/p5-block.html"
# wp eval は目印が出んでも成功で返る。保存するだけでは判定にならんので必ず突き合わせる。
grep -q 'data-designinserter-id="loading-4"' "$EV/p5-block.html" && echo "DI-BLK-010 OK [実機目視]"

$WP wp eval 'wp_set_current_user(1); $r=new WP_REST_Request("GET","/designinserter/v1/parts/heading-1"); $r->set_param("id","heading-1"); echo wp_json_encode(rest_do_request($r)->get_data());' --allow-root > "$EV/p5-rest.json"
# REST はエラー本文でも 0 で返るので、id が入っとることと code が無いことを両方見る。
node -e 'const d=require("fs").readFileSync(process.argv[1],"utf8");const j=JSON.parse(d);if(j.code||j.id!=="heading-1")throw new Error("DI-API-014 NG: "+d.slice(0,200));console.log("DI-API-014 OK [実機目視]")' "$EV/p5-rest.json"

# F-1 の再現証跡。現状は false が返る（フィルタが登録されとらん）
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
4. 固定ページ編集画面のテンプレート選択欄（DI-TPL-002。**現状は選択肢が出んことが F-1 の証跡**）
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

### F-1 `includes/templates.php` が読み込まれとらん（P0）

`designinserter.php` の `require_once` は data / render / block / admin / rest-api の 5 本のみ。リポジトリ全体を検索しても `templates.php` への参照が 0 件。

結果、`theme_page_templates` と `template_include` のフィルタが登録されん。Template Party の「このテンプレで固定ページを作成」で作られたページは `_wp_page_template=designinserter-full-template` の meta を持つが、`templates/full-page.php` が読み込まれず、テーマ既定のテンプレートで表示される。販売する機能が動いとらん。

再現: `wp eval 'var_dump(has_filter("template_include"));'` が `false` を返す。

対応ケース: DI-TPL-001〜007, DI-E2E-010

### F-2 openspec の spec drift（P2）

`openspec/specs/editor-ui.md` と `gutenberg-block.md` は SelectControl（223 オプションのドロップダウン）を前提に書かれとるが、実装は検索付きビジュアル picker + REST 遅延ロード + sandbox iframe プレビュー。実装のほうが後発で、C-02 の XSS 対策を含む改善。

spec を実装に合わせて更新するまで DI-EDT-002 は `不整合` に据え置く。**spec に合わせて実装を戻したらあかん。**

### F-3 `readme.txt` が無い（P1）

WP.org のプラグインディレクトリ提出に必須の `readme.txt`（Stable tag / Tested up to / 説明文）が存在せん。zip 配布だけなら動くが、公式ディレクトリ掲載の道が閉じる。

対応ケース: DI-BLD-019

### F-4 git-crypt ロック環境でのビルドが素通りする（P0）

`npm run build` は `data/template-party-*.json` が暗号文のままでも zip に同梱して成功する。鍵の無い環境でリリースビルドを実行すると、Template Party のパーツ 138 件とテンプレート 1017 件が丸ごと欠けた状態で、警告も出さずに配布物が出来上がる。実測で `dist/designinserter-0.2.0.zip` に 789KB / 685KB の暗号文が入っとることを確認した。

`.github/workflows/ci.yml`（push to main）は git-crypt unlock をせん。`test.yml`（PR）だけがする。

対応ケース: DI-BLD-022, DI-SEC-014

### F-5 PHPUnit ブートストラップの定数が実物と違う（P2）

`tests/php/bootstrap.php` は `DESIGNINSERTER_VERSION` を `1.0.0` と定義しとるが、プラグイン本体は `0.2.0`。スタブなので現状のテストには影響せんが、バージョン依存の分岐を足したときに嘘の環境でテストすることになる。

### F-6 E2E コマンドが clean install 後に起動できん（P1）

`package.json` の `e2e:fresh` / `e2e:template-party` は `playwright` を直接呼ぶが、`@playwright/test` がどの依存にも宣言されとらん（`dependencies` も `devDependencies` も無い）。`npm ci` の直後は `playwright: not found` で即終了する。Docker が起動しても Phase 4 はこのままでは走らん。

依存に足すと CI の全ジョブがブラウザ込みで数十MBを取得することになるので、CI 時間との釣り合いを決めてから直す。

対応ケース: DI-E2E 群全件（実行前提）

### F-7 実 WordPress スモークが黙って赤やった（P1・修正済み）

`tests/portable-smoke-integration.php` は REST ルートの正規表現を丸ごと書き写して照合しとった。ところが Template Party 対応でルート側の id が `_` を許すようになり（`[a-z0-9\-]` → `[a-z0-9_\-]`）、テスト側だけが取り残された。結果 `npm run smoke:wp:portable` は `REST route contract smoke failed` で落ち続けとった。

このゲートは CI に載っとらんので、誰も赤に気づかんかった。実 WordPress を通す唯一の自動確認がこれなので、影響は小さくない。

2026-07-29 に前方一致でルートを引く形へ直した。正規表現を書き写さんので、id の許容文字が変わっても腐らん。修正後は `Portable WordPress smoke passed with WordPress 6.9.4`。

対応ケース: DI-API-013 / DI-E2E-011

### 環境制約

| # | 制約 | 影響するケース数 | 解除条件 |
|---|---|---|---|
| E-1 | Docker 未起動 | 約 22 件 | Docker Desktop を起動して `docker info` が通る |
| E-2 | git-crypt ロック | 約 15 件 | `git-crypt unlock` 用の鍵を入手する |

E-2 は E-1 と重なるケースがある（Template Party の E2E）。

E-1 の一部は `npm run smoke:wp:portable` で回避できる。これは WordPress 6.9.4 と WP-CLI を一時ディレクトリへ落とし、DB を wp-sqlite-db に差し替えて実 WordPress を立てるので、Docker が要らん。2026-07-29 にこの経路で shortcode / block / REST の 3 経路、有効化ライフサイクル、REST 権限拒否を実測した（DI-SC-011 / DI-SC-012 / DI-API-014 / DI-API-015 / DI-CMP-005 / DI-CMP-006 / DI-BLD-021 / DI-E2E-011）。

残る E-1 は実ブラウザが要るもの（Playwright E2E、エディタ UI の目視）に絞られる。

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
| F-4 のビルドガード追加 | DI-BLD-022, DI-SEC-014 |
| 成功基準 6 項目の実機検証（§5.2 が現状 0/6） | DI-CMP-006・007, DI-BLK-010〜012, DI-SC-007 |
| `bundleDir` パストラバーサル検証 | DI-SEC-008, DI-DAT-019, DI-TPL-007 |
| create-page REST の権限・異常系テスト | DI-API-017・018・020, DI-SEC-005 |

### P1 — 販売前に埋めたい

| 項目 | 対応ケース |
|---|---|
| `readme.txt` の作成 | DI-BLD-019 |
| `smoke:wp:portable` を CI に載せる（F-7 が長期間気づかれんかった原因） | DI-SC-011, DI-E2E-011 |
| `@playwright/test` の依存宣言（F-6。CI 時間との釣り合いを決めてから） | DI-E2E 群全件 |
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

## 9. 変更履歴

| 日付 | 内容 |
|---|---|
| 2026-07-28 | 初版。`docs/test-matrix-2026-05-17.md` と `doc/qa-runbook-2026-05-18.md` を統合し、両ファイルを削除。台帳 226 ケース、openspec 受け入れ基準 50 項目のトレーサビリティを作成。Phase 1〜3 を実測して現状列を確定。F-1・F-4 を新規に発見 |
| 2026-07-29 | Docker 抜きで実 WordPress を立てられる `smoke:wp:portable` 経路で Phase 5 の一部を実測。8 ケースを環境制約NGから実測済みへ更新。その過程で F-7（実 WP スモークが黙って赤）を発見して修正 |
