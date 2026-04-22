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
| E14 | `Product Name (Trademark):` | FAIL | 実画面は日本語ラベル |
| E15 | `Line Number:` | FAIL | 実画面は日本語ラベル |
| E16 | `Paint Type:` | FAIL | 実画面未達。remote file は `Solvent Type:` |
| E17 | `Paint Category:` | FAIL | 実画面未達 |
| E18 | `Resin Type:` | FAIL | 実画面未達 |
| E19 | `Remarks:` | FAIL | 実画面未達 |
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

### E14-E19

製品詳細の実画面は、テーマ側の `template-parts/product-info-display.php` がそのまま効いているのではなく、投稿本文側のラベル付き shortcode がそのまま表示されている。

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

また、remote テーマファイル側でも E16 の期待値とズレがある。

- 現在の remote file: `Solvent Type:`
- issue 期待値: `Paint Type:`

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

### 現時点の判定

- デプロイ: 成功
- Phase A の staging 実画面反映: **部分成功**
- 未達: **E14-E19**

### 次にやるべきこと

1. 製品詳細ラベルの実表示経路を修正する
2. `Paint Type:` / `Paint Category:` / `Resin Type:` / `Remarks:` の期待表示を issue と揃える
3. 再デプロイする
4. 本ファイルの同じ観点で再度全件確認する
5. Phase A外で確認した日本語残り / 404 / 導線不足も別枠で継続確認する
