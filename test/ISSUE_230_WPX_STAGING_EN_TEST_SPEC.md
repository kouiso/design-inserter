# Issue #230 Phase A `wpX staging EN` テスト仕様書

## 1. 目的

Issue #230 Phase A で実装した英語サイト反映内容が、`wpX staging EN` 上で実際に表示・動作しているかを確認する。

- 対象 PR: `#232`
- 対象ブランチ: `feature/issue-230-en-translation-phase-a`
- 確認環境: `https://xw727268.xwp.jp`
- 確認日: `2026-04-22`

## 2. この仕様書の使い方

この仕様書は、非エンジニアや初見の確認者でもそのまま辿れるように、以下の 3 層で構成する。

1. まず「簡易シナリオ」で全体を目視確認する
2. 次に「詳細シナリオ」でページごとの表示を確認する
3. 最後に「E タスク別結果一覧」で実装項目ごとの合否を見る

## 3. 前提条件

- PC ブラウザは Chrome 推奨
- できればシークレットウィンドウで確認する
- キャッシュの影響を避けるため、画面が古いと感じたら再読み込みする
- この確認では「テーマコード由来の UI ラベル」を優先して見る
- 投稿本文や一部ページタイトルは staging データ由来で日本語が残る場合がある
- ホスティング先のファイルを直接変更して確認することは禁止
- 配信確認は、今回の作業ブランチからデプロイされた状態のみを対象にする

## 4. 5分で見る簡易シナリオ

### 4.1 トップページ

1. `https://xw727268.xwp.jp/` を開く
2. 上部メニューに `Solutions` `Company` `Careers` `Contact` があることを確認する
3. 画面内に `Featured` `Global Network` `View All Featured Content` `View All News` があることを確認する
4. フッターに `FAQs` `Contact` `Request Resources` `Privacy Policy` `Terms of Use` があることを確認する

### 4.2 検索

1. 右上の検索アイコンを押す
2. 入力欄の placeholder が `Search products, applications, or keywords…` になっていることを確認する
3. クイックリンクに `Solutions Overview` `Featured Solutions` `Applications` があることを確認する

### 4.3 Contact

1. `https://xw727268.xwp.jp/contact/` を開く
2. 見出しが `Contact Us` であることを確認する
3. フォームが表示されることを確認する
4. 個人情報同意チェックボックスがあることを確認する

### 4.4 Product 詳細

1. `https://xw727268.xwp.jp/product/` を開く
2. 分類導線に `By Industry` `By Substrate` `By Design / Finish` `By Performance` `By Sustainability` `Featured Solutions` があることを確認する
3. 任意の製品詳細を開く
4. `Back to Product List` があることを確認する
5. 製品ラベルが英語になっているか確認する

### 4.5 Voice / Interview

1. `https://xw727268.xwp.jp/voice/` を開く
2. `Customer Stories` があることを確認する
3. 任意の詳細を開き `Back to list` があることを確認する
4. `https://xw727268.xwp.jp/career/interview/` を開く
5. `Employee Stories` があることを確認する
6. 任意の詳細を開き `Back to list` があることを確認する

### 4.6 Global Network

1. `https://xw727268.xwp.jp/global-network/` を開く
2. `Manufacturing Footprint` があることを確認する
3. 地図 SVG が崩れず表示されることを確認する

## 5. 詳細シナリオ

### 5.1 ヘッダー / 言語スイッチャー

確認 URL:
- `/`

確認内容:
- `EN` が大文字で表示される
- `Featured` が英語で表示される
- 検索ボタンの aria-label が `Search`

### 5.2 検索フォーム

確認 URL:
- `/`

確認内容:
- placeholder が `Search products, applications, or keywords…`
- ラベルが `Search:`
- submit ボタン aria-label が `Search`
- クイックリンクが `Solutions Overview / Featured Solutions / Applications`

### 5.3 トップページ

確認 URL:
- `/`

確認内容:
- `Featured`
- `View All Featured Content`
- `View All News`

### 5.4 戻る導線

確認 URL:
- 製品詳細 1件
- Voice 詳細 1件
- Interview 詳細 1件

確認内容:
- 製品詳細: `Back to Product List`
- Voice 詳細: `Back to list`
- Interview 詳細: `Back to list`

### 5.5 製品詳細ラベル

確認 URL:
- 任意の製品詳細 1件

確認内容:
- `Product Name (Trademark):`
- `Line Number:`
- `Paint Type:`
- `Paint Category:`
- `Resin Type:`
- `Remarks:`

### 5.6 製品詳細下部リンク / サイドナビ

確認 URL:
- 製品詳細 1件
- `/product/`

確認内容:
- 製品詳細に `Download Technical Information (Features & Performance)`
- サイドナビに `Solutions Overview`
- サイドナビに `Featured Solutions`
- サイドナビに `Applications`

### 5.7 Contact

確認 URL:
- `/contact/`

確認内容:
- 見出しが `Contact Us`
- フォーム表示
- 同意チェックボックス表示

### 5.8 蛇腹ブロック

確認対象:
- `wp-content/themes/muashi/assets/css/style.css`

確認内容:
- CSS に `Show More`
- CSS に `Show Less`

補足:
- staging 上で対象コンテンツの展開 UI が確実に出るページを今回固定できなかったため、実配信 CSS 文字列で確認する

### 5.9 Global Network

確認 URL:
- `/global-network/`

確認内容:
- `Manufacturing Footprint`
- map SVG / object が存在する

### 5.10 メニュー登録スクリプト

確認対象:
- `inc/setup-faq-menu.php`
- `inc/setup-pickup-menu.php`

確認内容:
- `Featured`
- `News`
- `FAQs`

補足:
- 画面側でも `/featured/` `/faq/` `/media-page/` `/career/` `/voice/` で英語メニュー文言が見えることを確認する

### 5.11 フッター

確認 URL:
- `/`

確認内容:
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

### 5.12 残存表示ラベル

確認 URL:
- `/voice/`
- `/career/`
- `/career/interview/`
- `/`

確認内容:
- `Customer Stories`
- `Careers`
- `Employee Stories`

### 5.13 Phase A外の現行確認

確認 URL:
- `/story/`
- news 詳細 1件
- media 詳細 1件
- `/global-network/#overseas-bases`
- `/featured/`
- `/download/`

確認内容:
- `404` にならないか
- `Back to list` 系導線が存在するか
- `Pick up ピックアップ` `News ニュース` `よくあるご質問` などの日本語混在が残っていないか
- `製品ページへ戻る` が残っていないか

補足:
- ここは Phase A 合否ではなく、関連ページを含めた live 現状把握の確認項目
- 実装範囲外でも、今回の確認で日本語残りや導線不足があれば結果に残す

## 6. 実施結果

### 6.1 実施方法

- Playwright による実 URL 直接アクセス
- ブラウザ目視相当の本文確認
- `curl` による配信 HTML / CSS 確認
- `ssh` による remote ファイル確認
- `wp-cli` による active theme / post content 確認

確認根拠として使う事実:
- 配信 HTML 上の文言
- 配信 CSS 上の文言
- active theme の値
- 投稿本文 `post_content`
- remote テンプレート定義

### 6.2 総評

- デプロイ自体は成功
- ヘッダー / 検索 / トップ導線 / Contact / Global Network / 戻る導線 / フッター / CSS は概ね反映
- ただし **A5 製品詳細ラベルは staging 実画面上で未達**

### 6.3 Eタスク別結果一覧

| ID | 内容 | 結果 | 確認方法 | メモ |
|---|---|---|---|---|
| E1 | `En` → `EN` | PASS | 実画面 `/` | `EN` 表示確認 |
| E2 | `ピックアップ` → `Featured` | PASS | 実画面 `/` | 表示確認 |
| E3 | 検索 placeholder | PASS | 実画面 + HTML source | `Search products, applications, or keywords…` |
| E4 | 検索クイックリンク 3件 | PASS | 実画面 | 3件表示確認 |
| E5 | `検索:` → `Search:` | PASS | 実画面 + HTML source | 表示確認 |
| E6 | 検索 submit aria-label | PASS | 実画面 + HTML source | `Search` |
| E7 | header 検索 aria-label | PASS | 実画面 | `Search` |
| E8 | `Pick up` → `Featured` | PASS | 実画面 `/` | 表示確認 |
| E9 | `Pick up一覧はこちら` | PASS | 実画面 `/` | `View All Featured Content` |
| E10 | `ニュース一覧はこちら` | PASS | 実画面 `/` | `View All News` |
| E11 | product 戻る導線 | PASS | 実画面 product 詳細 | `Back to Product List` |
| E12 | voice 戻る導線 | PASS | 実画面 voice 詳細 | `Back to list` |
| E13 | interview 戻る導線 | PASS | 実画面 interview 詳細 | `Back to list` |
| E14 | Product Name label | FAIL | 実画面 product 詳細 | 実画面は `製品名（商標）：` |
| E15 | Line Number label | FAIL | 実画面 product 詳細 | 実画面は `ライン番号：` |
| E16 | Paint Type label | FAIL | 実画面 product 詳細 + remote file | 実画面未達。remote file も `Solvent Type:` |
| E17 | Paint Category label | FAIL | 実画面 product 詳細 | post content 側が支配 |
| E18 | Resin Type label | FAIL | 実画面 product 詳細 | post content 側が支配 |
| E19 | Remarks label | FAIL | 実画面 product 詳細 | post content 側が支配 |
| E20 | product 下部 CTA | PASS | 実画面 product 詳細 | 表示確認 |
| E21 | `Contact Us` | PASS | 実画面 `/contact/` | 表示確認 |
| E22 | `Show More` | PASS | 配信 CSS | `style.css` に存在 |
| E23 | `Show Less` | PASS | 配信 CSS | `style.css` に存在 |
| E24 | Global Network MAP | PASS | 実画面 `/global-network/` | `Manufacturing Footprint` + SVG |
| E25 | FAQ menu `Featured` | PASS | remote file + 実画面 | 反映確認 |
| E26 | Pickup menu `Featured` | PASS | remote file + 実画面 | 反映確認 |
| E27 | footer `Featured` | PASS | 実画面 `/` | 表示確認 |
| E28 | footer `News` | PASS | 実画面 `/` | 表示確認 |
| E29 | footer `Careers` | PASS | 実画面 `/` | 表示確認 |
| E30 | footer `Employee Stories` | PASS | 実画面 `/` | 表示確認 |
| E31 | footer `Career FAQs` | PASS | 実画面 `/` | 表示確認 |
| E32 | footer `FAQs` | PASS | 実画面 `/` | 表示確認 |
| E33 | footer `Contact` | PASS | 実画面 `/` | 表示確認 |
| E34 | footer `Request Resources` | PASS | 実画面 `/` | 表示確認 |
| E35 | footer `Privacy Policy` | PASS | 実画面 `/` | 表示確認 |
| E36 | footer `Terms of Use` | PASS | 実画面 `/` | 表示確認 |
| E37 | `Customer Stories` | PASS | 実画面 `/voice/` 他 | 表示確認 |
| E38 | `Careers` | PASS | 実画面 `/` `/career/` | 表示確認 |
| E39 | `Employee Stories` | PASS | 実画面 `/career/interview/` 他 | 表示確認 |
| E41 | `Solutions Overview` | PASS | 実画面 `/product/` | 表示確認 |
| E42 | `Featured Solutions` | PASS | 実画面 `/product/` | 表示確認 |
| E43 | `Applications` | PASS | 実画面 `/product/` | 表示確認 |

## 7. 失敗の原因メモ

### 7.1 E14-E19

実画面で product 詳細に出ているラベルは、テーマの `template-parts/product-info-display.php` ではなく、製品投稿の `post_content` に埋め込まれた shortcode 付き日本語ラベルが起点になっている。

確認した `post_content`:

```text
製品名（商標）：[product_field name="product_name_trademark_en"]
ライン番号：[product_field name="product_line_number"]
[product_field name="product_solvent_type"]
[product_field name="product_paint_type"]
[product_field name="product_resin_type"]
[product_field name="product_remarks"]
```

そのため、

- E14 / E15 は DB コンテンツ側の日本語ラベルが実画面に残る
- E16 は実装コードでも `Paint Type:` ではなく `Solvent Type:` になっている
- E17 / E18 / E19 はラベル定義が実画面経路に乗っていない

## 8. 現時点の判定

- Phase A 全体のうち、**製品詳細ラベル群（E14-E19）が未完了** → `ISSUE_230_DB_HANDOFF_KANNO.md` 第1項で神野さん引き渡し
- それ以外の確認対象は、今回の staging 実画面確認では通過
- ただし Phase A外の関連ページには、日本語残り / 404 / 戻る導線不足が現時点で残る

## 9. S1-S21 追加スコープ（2026-04-22 コミット `57b59f78` で全適用）

Issue #230 Phase A 完了版として、E 項目に加えて以下 S1-S21 を muashi-en テーマ内で英訳済。wpX staging EN 反映は run `24774632874` にて適用済。

| # | ファイル | 概要 | 検証ステータス |
|---|---------|------|---------------|
| S1 | `cf7-templates/contact.html` | フォーム全文 Drive 03 準拠 | WebFetch PASS |
| S2 | `cf7-templates/download.html` | フォーム全文 + h1 + リード文 | WebFetch PASS |
| S3 | `header-download.php` | ハンバーガー全項目 header.php と同期 | 要目視確認 |
| S4 | `archive.php` | ニュース・お知らせ / 空投稿 | 要目視確認 |
| S5 | `functions.php:328-375` | CF7 バリデーションエラー | 要目視確認（送信エラー再現） |
| S6 | `blocks/domestic-locations.php` | 日本国内 / 住所: / 地図 aria-label | 要目視確認 |
| S7 | `index.php` | ホーム4セクション + News + 空投稿 + Uncategorized | WebFetch PASS |
| S8 | `page-news.php` | お知らせはまだありません。 | 要目視確認（投稿0件時） |
| S9 | `page-global-network.php` | お知らせはまだありません。 | 要目視確認 |
| S10 | `functions.php:610/657` | ページネーション aria-label | 要目視確認 |
| S11 | `functions.php:1884-1957` | iframe aria-label「地図」×6 → Map | DOM inspection |
| S12 | `page-document.php` | カタログダウンロード / 検索説明 | 要目視確認 |
| S13 | `page-document-featured.php` | 製品詳細 / 検索説明 | 要目視確認 |
| S14 | `inc/featured-product-data.php:127-136` | JS config i18n | WebFetch PASS |
| S15 | `page-catalog.php:205` | Request for Catalog | WebFetch PASS |
| S16 | `page-download.php` | Catalog Download / Go Overview | WebFetch PASS |
| S17 | 5ファイル | 投稿はまだありません。 → No posts yet. | 要目視確認 |
| S18 | `page-story.php:56` | Stories | 要目視確認 |
| S19 | `page-product.php:78` | Solutions Overview | 要目視確認 |
| S20 | `page-applications.php`, `page-featured.php` | タブ3項目×2ファイル | 要目視確認 |
| S21 | `page-media.php:93` | No featured posts yet. | 要目視確認 |

### 9.1 追加：JP footer 変更（muashi テーマ）

| # | ファイル | 変更内容 |
|---|---------|---------|
| F1 | `muashi/footer.php:380` (SP) | カタログをダウンロードする → カタログ・資料請求 |
| F2 | `muashi/footer.php:494` (PC) | カタログダウンロード → カタログ・資料請求 |

本件は 2026-04-21 17:26 神野さん追加依頼由来。JP サイト側のみ変更。

## 10. Playwright MCP 実機検証（手動再実施）

当セッションでは Playwright MCP ツールが利用不可のため、WebFetch によるソース DOM レベルの検証で代替実施した。
ビジュアル検証（スクショ取得、クリック操作、送信テスト）は `ISSUE_230_WPX_STAGING_EN_MANUAL_TEST_GUIDE.md` の手順で追って実施する。
