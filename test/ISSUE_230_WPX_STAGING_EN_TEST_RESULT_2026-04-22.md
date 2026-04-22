# Issue #230 Phase A `wpX staging EN` テスト結果

## 概要

- 対象 Issue: `#230`
- 対象 PR: `#232`
- 対象ブランチ: `feature/issue-230-en-translation-phase-a`
- 確認環境: `https://xw727268.xwp.jp`
- 確認日: `2026-04-22`

## 実施内容

以下の 4 系統で確認した。

1. Playwright による実 URL の画面確認
2. `curl` による配信 HTML / CSS 確認
3. `ssh` による remote テーマファイル確認
4. `wp-cli` による active theme / post content / option 確認

補足:
- ホスティング先での直接ファイル変更は行っていない
- 変更は今回の作業ブランチ経由でデプロイされた配信物のみを確認対象にしている
- remote 確認は読み取り専用で実施した

## 事実確認

### デプロイ

- `wpX staging EN` へのデプロイは成功
- 実行 run: `24763417734`
- 実行 job: `Deploy wpX Staging (EN)` のみ成功
- 他 3 job は未実行

### URL / active theme

- site URL: `https://xw727268.xwp.jp`
- `home`: `https://xw727268.xwp.jp`
- `siteurl`: `https://xw727268.xwp.jp`
- active theme:
  - `stylesheet = muashi`
  - `template = muashi`

補足:
- 運用として `muashi-en` の内容を `muashi` にデプロイしている状態

## 確認根拠

今回の判定は、以下の事実を組み合わせて出している。

1. 実 URL の表示文言を Playwright で取得
2. `curl` で配信 HTML / CSS の実文字列を取得
3. `wp option get home` `wp option get siteurl` で接続先を確認
4. `wp option get stylesheet` `wp option get template` で active theme を確認
5. `wp post get <id> --field=post_content` で製品詳細の表示起点を確認
6. `ssh` で remote テーマファイルを読み取り、テンプレート定義を確認

今回の重要な根拠:
- `style.css` 配信内容に `Show More` / `Show Less` が存在した
- `/global-network/` の配信画面で `Manufacturing Footprint` と地図要素を確認した
- 製品詳細ページの `post_content` に日本語ラベル付き shortcode が残っていた
- remote テンプレートでは E16 相当が `Paint Type:` ではなく `Solvent Type:` だった

## 実画面で確認できた項目

### ヘッダー / 検索

- `EN`
- `Featured`
- placeholder `Search products, applications, or keywords…`
- `Search:`
- aria-label `Search`
- 検索クイックリンク
  - `Solutions Overview`
  - `Featured Solutions`
  - `Applications`

### トップページ

- `Featured`
- `View All Featured Content`
- `View All News`

### Contact

- `Contact Us`
- フォーム表示
- 同意チェックボックス表示

### Global Network

- `Manufacturing Footprint`
- SVG / object 表示

### 製品ページ / 製品詳細

- `/product/` に以下が表示
  - `Solutions Overview`
  - `Featured Solutions`
  - `Applications`
  - `By Industry`
  - `By Substrate`
  - `By Design / Finish`
  - `By Performance`
  - `By Sustainability`
- 製品詳細に以下が表示
  - `Download Technical Information (Features & Performance)`
  - `Back to Product List`

### Voice / Interview

- `/voice/` に `Customer Stories`
- Voice 詳細に `Back to list`
- `/career/interview/` に `Employee Stories`
- Interview 詳細に `Back to list`

### フッター

- `Featured`
- `News`
- `Careers`
- `Employee Stories`
- `Career FAQs`
- `FAQs`
- `Contact`
- `Request Resources`
- `Privacy Policy`
- `Terms of Use`

### CSS

配信 CSS で以下を確認。

- `Show More`
- `Show Less`

## E タスク別結果

| ID | 内容 | 結果 | 備考 |
|---|---|---|---|
| E1 | `En` → `EN` | PASS | 実画面確認 |
| E2 | `ピックアップ` → `Featured` | PASS | 実画面確認 |
| E3 | 検索 placeholder | PASS | 実画面 / HTML source |
| E4 | 検索クイックリンク | PASS | 実画面確認 |
| E5 | `検索:` → `Search:` | PASS | 実画面 / HTML source |
| E6 | 検索 submit aria-label | PASS | 実画面確認 |
| E7 | header 検索 aria-label | PASS | 実画面確認 |
| E8 | `Pick up` → `Featured` | PASS | 実画面確認 |
| E9 | `Pick up一覧はこちら` | PASS | 実画面確認 |
| E10 | `ニュース一覧はこちら` | PASS | 実画面確認 |
| E11 | product 戻る導線 | PASS | 実画面確認 |
| E12 | voice 戻る導線 | PASS | 実画面確認 |
| E13 | interview 戻る導線 | PASS | 実画面確認 |
| E14 | `Product Name (Trademark):` | **一覧PASS/詳細FAIL** | `/product/` 一覧は英語。`/product/{slug}/` 詳細は post_content shortcode に日本語ラベル直書きのためDBタスク |
| E15 | `Line Number:` | **一覧PASS/詳細FAIL** | 同上 |
| E16 | `Paint Type:` | **一覧PASS/詳細FAIL** | 修正コミット `4239a899` デプロイ後、`/product/` 一覧で `Paint Type:` 確認済み。`/product/{slug}/` 詳細はshortcodeの値のみ表示（ラベル無し）のためDB側で `[product_field]` shortcodeをラベル付きに修正する必要 |
| E17 | `Paint Category:` | **一覧PASS/詳細FAIL** | 同上 |
| E18 | `Resin Type:` | **一覧PASS/詳細FAIL** | 同上 |
| E19 | `Remarks:` | **一覧PASS/詳細FAIL** | 同上 |
| E20 | product 下部 CTA | PASS | 実画面確認 |
| E21 | `Contact Us` | PASS | 実画面確認 |
| E22 | `Show More` | PASS | 配信 CSS 確認 |
| E23 | `Show Less` | PASS | 配信 CSS 確認 |
| E24 | Global Network MAP | PASS | 実画面確認 |
| E25 | FAQ menu `Featured` | PASS | remote file / 実画面確認 |
| E26 | Pickup menu `Featured` | PASS | remote file / 実画面確認 |
| E27 | footer `Featured` | PASS | 実画面確認 |
| E28 | footer `News` | PASS | 実画面確認 |
| E29 | footer `Careers` | PASS | 実画面確認 |
| E30 | footer `Employee Stories` | PASS | 実画面確認 |
| E31 | footer `Career FAQs` | PASS | 実画面確認 |
| E32 | footer `FAQs` | PASS | 実画面確認 |
| E33 | footer `Contact` | PASS | 実画面確認 |
| E34 | footer `Request Resources` | PASS | 実画面確認 |
| E35 | footer `Privacy Policy` | PASS | 実画面確認 |
| E36 | footer `Terms of Use` | PASS | 実画面確認 |
| E37 | `Customer Stories` | PASS | 実画面確認 |
| E38 | `Careers` | PASS | 実画面確認 |
| E39 | `Employee Stories` | PASS | 実画面確認 |
| E41 | `Solutions Overview` | PASS | 実画面確認 |
| E42 | `Featured Solutions` | PASS | 実画面確認 |
| E43 | `Applications` | PASS | 実画面確認 |

## 不合格項目の原因

### E14-E19（詳細ページDBタスク）

製品詳細ページ `/product/{slug}/` の実画面は、テーマ側の `template-parts/product-info-display.php` がそのまま効いているのではなく、投稿本文（post_content）側のラベル付き shortcode がそのまま表示されている。

確認した `post_content`:

```text
製品名（商標）：[product_field name="product_name_trademark_en"]
ライン番号：[product_field name="product_line_number"]
[product_field name="product_solvent_type"]
[product_field name="product_paint_type"]
[product_field name="product_resin_type"]
[product_field name="product_remarks"]
```

このため、実画面は以下の状態。

- `製品名（商標）：`
- `ライン番号：`
- 値部分は shortcode 展開

### E16 remote file 修正完了（コミット `4239a899`）

- 以前の remote file: `Solvent Type:`（Copilotレビューでfield命名 `product_solvent_type` に合わせて semantic revert されていた）
- Issue #230 E16 仕様: `Paint Type:`（Drive仕様書・Issueどちらも `Paint Type:` 指定）
- 今回修正: `template-parts/product-info-display.php` の `Solvent Type:` → `Paint Type:` に戻した
- wpX staging EN 再デプロイ後、`https://xw727268.xwp.jp/product/` で `Paint Type:` 確認済み

### E14-E19 詳細ページの残作業（DB側）

`/product/{slug}/` 詳細で E14-E19 の英語ラベルを表示するためには、**全製品の `post_content` を DB 側で修正**する必要がある。

期待形式:

```text
Product Name (Trademark): [product_field name="product_name_trademark_en"]
Line Number: [product_field name="product_line_number"]
Paint Type: [product_field name="product_solvent_type"]
Paint Category: [product_field name="product_paint_type"]
Resin Type: [product_field name="product_resin_type"]
Remarks: [product_field name="product_remarks"]
```

これはコード修正では解決しない（テンプレート側の英語ラベルは既に正しい）。DB の `post_content` 側を非エンジニアが WordPress 管理画面から直接編集するか、エンジニア側で `wp-cli` による一括置換を行う必要がある。

## Phase A外も含めた現行挙動確認

「Phase A ではないので見ない」という扱いはせず、関連ページの現行 live 挙動も確認した。ここは未実装領域の現状把握であり、今回の合否判定とは別に整理する。

### 確認したページ

- `/story/`
- news 詳細 1件
- media 詳細 1件
- `/global-network/#overseas-bases`
- `/featured/`
- `/career/interview/` の周辺導線
- `/download/`

### 現行の確認結果

- `/story/` はこの環境で `404`
- news 詳細では `Back to list` がなく、本文周辺に `Pick up ピックアップ` `News ニュース` `よくあるご質問` が残存
- media 詳細でも同様に日本語混在が残存
- `/global-network/#overseas-bases` では期待する戻る導線を確認できず
- `/featured/` は確認時点で単体詳細への安定した導線を取得できず
- `/career/interview/` 周辺には日本語の採用系導線が残存
- `/download/` では `製品ページへ戻る` が残存

補足:
- これらは「今回の配信確認時点の live 現状」であり、Phase A の完了判定とは分けて記録している
- つまり、Phase A の主要 UI は多く反映している一方で、Phase A外の関連ページにはまだ日本語残りが複数ある

## 結論

### 現時点の判定（2026-04-22 コミット `57b59f78` デプロイ後 = S1-S21 全適用）

- デプロイ: 成功（run `24774632874`）
- Phase A テーマ側コード実装: **S1-S21 全 PASS**
- Phase A staging 実画面反映（WebFetch によるソース DOM 確認、Playwright MCP はセッション利用不可につき次回実機検証予定）:
  - `/` ホーム: **Advanced R&D Capabilities / Global Network / Sustainable Business Expansion / Customer-Oriented Customization / NEWS すべて反映確認**
  - `/contact/`: CF7 フォーム全項目 EN 反映（Full Name / Company Name / Email Address / Phone Number / Message / I agree to the Privacy Policy）
  - `/download/`: Catalog Download / Request a catalog or browse all catalogs / Go Overview 反映確認
  - `/catalog/`: Request for Catalog 見出し反映、S14 JS config（Selected / Clear filters / No matching products / All）反映確認
  - `/product/` 一覧ページ: **E1-E43 全PASS**（前回デプロイ時に確認済）
  - `/product/{slug}/` 詳細ページ: E14-E19 は DB 側残作業

### 残作業（DB / 管理画面側 = 神野さん引き渡し）

詳細は `test/ISSUE_230_DB_HANDOFF_KANNO.md` を参照。

- 製品詳細 post_content の E14-E19 ラベル差替
- wp_nav_menu（PC グロナビ / SP ハンバーガー / フッター）
- CF7 自動返信メール 3通（wp_options）
- タクソノミー term 名
- 固定ページ post_content（/contact/, /company/, /history/ など）
- 言語スイッチャー「中文」リンク先
- /story/ 404 調査 / news・media サイドバー

### 2 staging 差分

`test/ISSUE_230_WPX_XSRV_DIFF_2026-04-22.md` に記録。

- wpX staging EN: ソース最新 `57b59f78` 適用済。DB はデフォルト（JP 混在）
- xsrv staging EN: 神野さん DB 作業進行中。ソース側は PR マージ後に別途デプロイ

### 次 Phase 候補

`test/ISSUE_230_JP_SITE_FIXES.md` に JP サイト側の追従タスクを記録。Phase B として扱う。

### Playwright MCP 実機検証について

当セッションでは Playwright MCP ツールが利用不可だったため、WebFetch によるソース DOM 検証で代替。
ビジュアル検証（スクショ取得）は次回作業時に `test/ISSUE_230_WPX_STAGING_EN_MANUAL_TEST_GUIDE.md` 手順で実施する。

---

## 2026-04-22 後半セッション追記 (Playwright MCP 実機検証 + 追加修正)

### 追加デプロイ / 修正コミット

| commit | 内容 |
|---|---|
| `d9ca78a0` | ハンバーガーメニュー Group Companies リンク削除 |
| `21a31566` | task pull を Docker 環境向けに変更 (pull:legacy / pull:diff 削除) |
| `bf2ec77d` | wpx-en / xsrv-en 環境と Phase A 検証スペックを追加 |
| `7134628a` | **Parse error 解消**: header-download.php の欠落 `endif` を復元 |
| `99660ddc` | functions.php ブロックパターン内 JP 残存を英訳 + Taskfile EN同期後テーマ有効化 |
| `0daf921e` | /global-network/ の S6 / S11 を DB 待ちで test.fixme マーク |

### デプロイ run

- `24777143794`: d9ca78a0 〜 bf2ec77d → wpx-en (success)
- `24777487397`: 7134628a → wpx-en (success、Parse error 解消)
- 99660ddc / 0daf921e: **未デプロイ** (ユーザー指示により保留)

### 重大バグ発見・修正: header-download.php Parse error

事前セッションの commit `e52047a4` で `if ( ! is_page_template('page-document.php') ) :` を閉じる `<?php endif; ?>` が削除されていた。結果として `/document/` `/document-featured/` で WordPress 致命エラー:

```
Parse error: syntax error, unexpected end of file, expecting "elseif" or "else" or "endif"
in header-download.php on line 575
```

commit `7134628a` で line 539 に `endif` を追加して復元。Docker コンテナ内 `php -l` で構文チェック PASS 確認、デプロイ後 `/document/` `/document-featured/` 正常表示を Playwright MCP で確認。

### 重大スコープ漏れ発見・修正: functions.php ブロックパターン JP 残存

ソース側 JP grep 再監査で以下を発見（元プラン S1-S21 に含まれず）:

| 位置 | 修正内容 |
|---|---|
| `functions.php:1738` | `ダウンロード` → `Download` (download-button ブロックパターン button 文言) |
| `functions.php:1742` | 発行日/期間 → `Published: June 2024 / Reporting Period: January–December 2023` |
| `functions.php:1882/1896/1910/1924/1938/1952` | `住所: 〒xxx` → `Address: 〒xxx` (国内6拠点分、domestic-locations ブロックパターン) |
| `functions.php:1733-1734` | `ダウンロードボタン` / 説明 → `Download Button` / `Button with download icon` (Gutenberg 管理 UI) |
| `functions.php:1871-1872` | `国内拠点情報` / 説明 → `Domestic Locations` / `List of domestic offices in Japan (Google Map iframe embed)` (Gutenberg 管理 UI) |

**注意点**: これらのブロックパターン文言は、Gutenberg でパターンを**新規挿入**したときのみ反映される。既存の固定ページ post_content に挿入済みのブロックには反映されない (post_content がスナップショットであるため)。したがって `/global-network/` `/company/` など既存ページには 99660ddc デプロイ後も `住所:` 等が残る可能性がある。該当は O4 (神野さん側 DB 編集) で対応。

### Taskfile.yml db:sync:en 修正

staging DB の `template=muashi` 値がローカル EN コンテナで参照されると、実体の `muashi-en` テーマが読み込めず `localhost:8081` がほぼ空レスポンスになる問題を修正。`db:sync:en` の最後に以下を追加:

```yaml
{{.DC}} exec -T musashi-wp-en wp theme activate muashi-en --allow-root
```

### Playwright MCP 実機検証 (2026-04-22 後半)

| ページ | 結果 | 備考 |
|---|---|---|
| `/` ホーム | ✅ | Group Companies 不在、Advanced R&D Capabilities / Global Network / Manufacturing Footprint 表示 |
| `/contact/` | ✅ | CF7 全 EN、Submit Inquiry、I agree to the Privacy Policy |
| `/catalog/` | ✅ | H1 Request for Catalog、S14 JS localize (Selected / Clear filters / All 等) EN |
| `/download/` | ✅ | H1 Catalog Download、Go Overview、CF7 全 EN |
| `/document/` | ✅ | Parse error 解消後、H1 Catalog Download、Katakana フィルタ EN、placeholder EN |
| `/document-featured/` | ✅ | H1 Product Details、placeholder Search by product details |
| `/product/` | ✅ | H1 Solutions Overview、サイドバーナビ By Industry / By Material 等 EN、Paint Type (E16 回帰) |
| `/applications/` | ✅ | タブ Solutions Overview / Featured Solutions / Applications EN |
| `/featured/` | ✅ | タブ EN |
| `/voice/` | ✅ | 投稿あり表示 (空投稿メッセージは未レンダー) |
| `/news/` | ✅ | News 表示、ページネーション EN |
| `/career/interview/` | ✅ | 179記事 EN アーカイブ |
| `/company/` | ✅ | H1 Company Profile、CEO Message、拠点名 JP は O11 保持、住所ラベル JP は O4 DB 待ち |
| `/global-network/` | 🟡 | ソース側 OK、post_content 内 iframe aria-label / 住所: は O4 DB 待ち (S6/S11 test.fixme) |
| `/story/` | ❌ | 404 (DB 固定ページ欠落、O4) |
| `/media/` | ❌ | 404 (DB 固定ページ欠落、O4) |

### Playwright 自動テスト結果 (TEST_ENV=wpx-en)

`test/e2e/issue-230-phase-a.spec.ts`:

```
✓ 13 passed
~ 2 skipped (S6/S11 DB待ち test.fixme)
  0 failed
```

`test/e2e/smoke.spec.ts` (TEST_ENV=docker-en):

```
✓ 10 passed
  0 failed
```

### スクショ

`test/screenshots/issue-230-wpx-en-phase-a-v3/` 配下:

- `home.png` — ホーム
- `contact.png` — /contact/ CF7 EN 全項目
- `catalog.png` — /catalog/ Request for Catalog + 商品一覧
- `download.png` — /download/ Catalog Download CF7
- `company.png` — /company/ Company Profile + CEO Message
- `product.png` — /product/ Solutions Overview + サイドバーナビ EN

### CF7 5件超過テスト

S14 JS localize データに `limitReached` = "You can select up to 5 items. Please contact us if you need more." が埋め込まれていることをソース (`inc/featured-product-data.php`) と `/catalog/` 配信 HTML 両方で確認済 (`test/e2e/issue-230-phase-a.spec.ts` S14 test PASS)。実 UI 相互作用は `/catalog/` から 6件以上選択 → `/download/` 遷移時に alert されるフローで、次回手動確認対象 (スクショ省略)。

### xsrv-en デプロイ

ユーザー指示により本セッションでは保留。次回セッションで `deploy_target=xsrv-en --ref feature/issue-230-en-translation-phase-a` 実行予定。**ただし xsrv-en には現状 Parse error fix (7134628a) も未適用のため `/document/` `/document-featured/` が致命エラー状態**。優先度高。
