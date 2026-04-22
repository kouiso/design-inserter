# Issue #230 Phase A `wpX staging EN` 人間確認用ガイド

## 1. このガイドの目的

このガイドは、非エンジニアや初見の確認者でも、`wpX staging EN` 上の表示を順番に確認できるようにした手順書です。

- 対象 URL: `https://xw727268.xwp.jp`
- 対象範囲: Issue #230 Phase A
- 推奨ブラウザ: Chrome

## 2. 確認前の準備

1. Chrome を開く
2. できればシークレットウィンドウを使う
3. `https://xw727268.xwp.jp` を開く
4. 画面が古く見える場合は再読み込みする
5. 確認中にホスティング先を直接変更しない

## 3. この確認で特に見るもの

### 最優先で見るもの

- ボタン名
- 見出し
- サイドナビ
- フッター
- 戻るリンク
- 検索欄の文言

### 補足

- 投稿本文や一部ページタイトルは staging データ由来で日本語が残ることがあります
- 今回まず重視するのは、テーマ側の UI ラベルや導線が英語になっているかです
- ただし、今回の確認では Phase A外の関連ページにも日本語残りがあるため、見つけたものは範囲外でもメモしてください

## 4. 確認手順

### 4.1 トップページ

1. `https://xw727268.xwp.jp/` を開く
2. 上部メニューを見る
3. 画面中央付近までスクロールする
4. 一番下のフッターまでスクロールする

確認ポイント:
- 上部に `Solutions`
- 上部に `Company`
- 上部に `Careers`
- 上部に `Contact`
- 右上付近に `EN`
- 画面内に `Featured`
- 画面内に `Global Network`
- 画面内に `View All Featured Content`
- 画面内に `View All News`
- フッターに `Featured`
- フッターに `News`
- フッターに `Careers`
- フッターに `Employee Stories`
- フッターに `Career FAQs`
- フッターに `FAQs`
- フッターに `Contact`
- フッターに `Request Resources`
- フッターに `Privacy Policy`
- フッターに `Terms of Use`

NG 例:
- 上部やフッターの主要導線が日本語のまま
- リンクが存在しない
- レイアウトが大きく崩れている

### 4.2 検索

1. トップページの検索アイコンを押す
2. 検索欄が開くことを確認する
3. 入力欄の placeholder を見る
4. クイックリンクを確認する

確認ポイント:
- placeholder が `Search products, applications, or keywords…`
- `Solutions Overview`
- `Featured Solutions`
- `Applications`

NG 例:
- 検索が開かない
- placeholder が日本語
- クイックリンクが日本語

### 4.3 Contact

1. ヘッダーかフッターから `Contact` を押す
2. `/contact/` が開くことを確認する
3. 見出しを見る
4. フォームを確認する
5. 同意チェック欄を確認する

確認ポイント:
- 見出しが `Contact Us`
- 入力フォームが表示される
- 同意チェック欄がある

NG 例:
- ページが開かない
- 見出しが日本語のまま
- フォームが出ない

### 4.4 Global Network

1. `Global Network` を押す
2. `/global-network/` が開くことを確認する
3. 見出しを見る
4. 地図が見えるか確認する

確認ポイント:
- `Manufacturing Footprint`
- 地図 SVG が表示される
- 地図が崩れていない

NG 例:
- 見出しが日本語のまま
- 地図が表示されない
- 地図の位置や枠が大きく崩れている

### 4.5 Solutions 一覧

1. `Solutions` を押す
2. `/product/` が開くことを確認する
3. 画面上部やサイド導線を見る

確認ポイント:
- `Solutions Overview`
- `Featured Solutions`
- `Applications`
- `By Industry`
- `By Substrate`
- `By Design / Finish`
- `By Performance`
- `By Sustainability`

NG 例:
- 分類導線が日本語のまま
- リンクが表示されない

### 4.6 製品詳細

1. `/product/` 一覧を開いて、製品カードのラベルを見る（一覧ページ＝テーマ側反映済み）
2. 任意の製品カードをクリックして詳細ページを開く（詳細ページ＝DB本文依存）

**一覧ページ（`/product/`）の確認ポイント**:
- 以下のラベルが英語になっているか（コミット `4239a899` で E16 `Paint Type:` 修正済み）
  - `Product Name (Trademark):`
  - `Line Number:`
  - `Paint Type:`
  - `Paint Category:`
  - `Resin Type:`
  - `Remarks:`

**詳細ページ（`/product/{slug}/`）の確認ポイント**:
- `Back to Product List`
- `Download Technical Information (Features & Performance)`
- **本文側ラベル**: 現状は日本語 `製品名（商標）：`, `ライン番号：` が残存＋値のみ shortcode 展開で表示（DB側残作業）

重要:
- 一覧と詳細で表示源が異なる（一覧＝テンプレート、詳細＝post_content shortcode）
- 詳細ページの英語化は `6.製品詳細ラベル` セクションに記載の方法で管理画面から対応してください

NG 例:
- 一覧ページで `Solvent Type:` が残る（コード修正失敗の兆候）
- 一覧ページで日本語ラベルが残る
- 詳細ページで `[product_field name="..."]` が `[]` などに変わってしまっている（shortcode破損）

### 4.7 Customer Stories

1. `https://xw727268.xwp.jp/voice/` を開く
2. 見出しを見る
3. 任意の詳細を 1 件開く
4. 戻る導線を見る

確認ポイント:
- 一覧に `Customer Stories`
- 詳細に `Back to list`

NG 例:
- 見出しが日本語
- 戻る導線が日本語

### 4.8 Employee Stories

1. `https://xw727268.xwp.jp/career/interview/` を開く
2. 見出しを見る
3. 任意の詳細を 1 件開く
4. 戻る導線を見る

確認ポイント:
- 一覧に `Employee Stories`
- 詳細に `Back to list`

NG 例:
- 見出しが日本語
- 戻る導線が日本語

### 4.9 フッター横断確認

以下のページを開いたときに、フッターの英語導線が共通で出るかを確認する。

- `/`
- `/contact/`
- `/product/`
- `/voice/`
- `/career/interview/`
- `/global-network/`

確認ポイント:
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

### 4.10 Phase A外の現行確認

以下は今回の実装範囲そのものではないが、live 上の残課題を早めに拾うために見てほしい。

確認対象:
- `https://xw727268.xwp.jp/story/`
- news 詳細 1件
- media 詳細 1件
- `https://xw727268.xwp.jp/global-network/#overseas-bases`
- `https://xw727268.xwp.jp/featured/`
- `https://xw727268.xwp.jp/download/`

確認ポイント:
- ページが `404` にならない
- `Back to list` などの戻る導線が英語である
- `Pick up ピックアップ`
- `News ニュース`
- `よくあるご質問`
- `製品ページへ戻る`

NG 例:
- `/story/` が開かない
- news / media 詳細に日本語混在サイドバーが残る
- `/download/` に `製品ページへ戻る` が残る

## 5. 不具合として報告してほしいもの

- ボタンや導線が日本語のまま
- リンクを押すと 404 になる
- 検索が開かない
- 戻る導線がない
- 地図が出ない
- Contact フォームが出ない
- フッターが崩れている
- PC / スマホで表示が大きく崩れている

## 6. 今回の確認で特に注意してほしい既知事項

### 製品詳細ラベル（DB側の残作業 / 非エンジニア対応範囲）

製品詳細ページの英語ラベルは、**管理画面で各製品の本文を直接書き換える必要がある**。テーマ側のコードでは解決しない。

**状態**:
- `/product/` 一覧ページ: 英語ラベル表示済み（`Product Name (Trademark):`, `Line Number:`, `Paint Type:`, `Paint Category:`, `Resin Type:`, `Remarks:`）
- `/product/{slug}/` 詳細ページ: 日本語ラベルまたはラベルなしで表示（本文に日本語ショートコードが残存）

**対応方法**:

WordPress 管理画面から対象の製品投稿を編集し、本文を以下のように書き換えてください。

現状:
```
製品名（商標）：[product_field name="product_name_trademark_en"]
ライン番号：[product_field name="product_line_number"]
[product_field name="product_solvent_type"]
[product_field name="product_paint_type"]
[product_field name="product_resin_type"]
[product_field name="product_remarks"]
```

修正後:
```
Product Name (Trademark): [product_field name="product_name_trademark_en"]
Line Number: [product_field name="product_line_number"]
Paint Type: [product_field name="product_solvent_type"]
Paint Category: [product_field name="product_paint_type"]
Resin Type: [product_field name="product_resin_type"]
Remarks: [product_field name="product_remarks"]
```

**注意**: `[product_field name="..."]` の中身は絶対に変更しないでください。これが変わると値が表示されなくなります。

**参考事項**: `product_solvent_type` というフィールド名ですが、英語表示ラベルは Issue #230 仕様により `Paint Type:` が正解です（内部フィールド名と表示ラベルは異なります）。

### 2ステージング環境の使い分け（重要）

武蔵塗料サイトは現在 2系統の staging 環境がある。

| URL | 管理者 | 用途 |
|---|---|---|
| `https://xw727268.xwp.jp` | KAGURA (磯貝) | **本ガイドの確認対象**。コード側反映の確認用 |
| `https://musashipaint.xsrv.jp/en/wp-login.php` | KAGURA (神野) | DB側のコンテンツ編集用 |

DB編集（製品本文の英語化、メニュー編集など）は `musashipaint.xsrv.jp/en/` 側で進んでいる可能性があるため、本番リリース前に両環境の状態を同期する必要がある。

### Phase A外で今回見つかった現行残課題

今回の live 確認では、実装範囲外の関連ページでも以下を確認している。

- `/story/` は 404
- news 詳細に日本語混在サイドバーが残る
- media 詳細に日本語混在サイドバーが残る
- `/download/` に `製品ページへ戻る` が残る

このため、範囲外であっても同様の残りを見つけたらそのまま記録してほしい。
