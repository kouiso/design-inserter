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

1. Solutions 一覧から任意の製品を 1 件開く
2. 詳細ページの上部と本文近くを見る

確認ポイント:
- `Back to Product List`
- `Download Technical Information (Features & Performance)`
- 以下のラベルが英語になっているか
  - `Product Name (Trademark):`
  - `Line Number:`
  - `Paint Type:`
  - `Paint Category:`
  - `Resin Type:`
  - `Remarks:`

重要:
- この項目は今回の staging 確認で不具合が見つかっています
- 実際には日本語ラベルが残っている可能性があります

NG 例:
- `製品名（商標）：`
- `ライン番号：`
- その他ラベルが日本語

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

### 製品詳細ラベル

製品詳細は、今回の staging 確認で未達が見つかっている。

現在の既知の問題:
- `Product Name (Trademark):` ではなく日本語ラベルが表示される
- `Line Number:` ではなく日本語ラベルが表示される
- 他の製品ラベルも英語化が実画面に反映されていない

そのため、製品詳細ページは特に重点的に見てほしい。

### Phase A外で今回見つかった現行残課題

今回の live 確認では、実装範囲外の関連ページでも以下を確認している。

- `/story/` は 404
- news 詳細に日本語混在サイドバーが残る
- media 詳細に日本語混在サイドバーが残る
- `/download/` に `製品ページへ戻る` が残る

このため、範囲外であっても同様の残りを見つけたらそのまま記録してほしい。
