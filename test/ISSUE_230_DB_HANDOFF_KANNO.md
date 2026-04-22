# Issue #230 Phase A — 神野さん引き渡しタスク（DB / 管理画面作業一覧）

**作成日**: 2026-04-22
**対象ブランチ**: `feature/issue-230-en-translation-phase-a`
**Phase A ソース側修正 PR**: #232
**対象環境**: `musashipaint.xsrv.jp/en/`（xserver-en staging） / 本番 `musashi-paint.com/en/`

---

## 前提

Phase A は **muashi-en テーマ内のハードコード英訳** のみを対象とした。
以下は **DB / wp-admin 側の作業** のため、神野さんに引き渡す。

Drive 正典:
- `英語化修正03.xlsx`（2026-04-22 14:31 最新版、2.44MB）
- `トップページ英語化.docx`
- `やり取り7メール文の英語化.docx`
- `20260412_グローバルナビ、サイドメニュー英語修正依頼 (1).xlsx`
- 福田さんシート `1W9_qHqeTfAPhpw-LJ6m0m4iDpEwT6JQF`（96記事トンマナ校正）

---

## 1. 製品詳細 post_content（E14-E19 詳細ラベル差替）

**対象 CPT**: `product`（全投稿）

EN 側投稿の本文に残っている日本語ラベルを英訳する。

| JP ラベル | EN ラベル（Drive 03 準拠） |
|---|---|
| 塗料分類 | Paint Type |
| 用途 | Applications |
| 特徴 | Features |
| 主な製品 | Typical Products |
| 関連資料 | Related Resources |
| 試験・認証 | Testing & Certification |

**注**: E16 の `Paint Type:` は既にソース側 PR #232 で修正デプロイ済（run `24768964640`）。DB 側のラベル残存は post_content を全件確認して差替が必要。

---

## 2. ナビゲーションメニュー（wp_nav_menu）

### 2-1. PC版グローバルナビ（ヘッダー）

Drive 03 最新版に完全準拠する。

- **Group Companies は削除**（項目ごと非表示）
- **グローバル生産拠点 → Manufacturing Footprint**（ラベル変更 + MAP画像入替）
- Solutions / Company / Our Strengths / Sustainability / Resources / Customer Stories の6枠構成
- サブメニュー構造は muashi-en/header-download.php を参照

### 2-2. SP版ハンバーガー（`muashi-en-main-sp-menu` など）

項目不一致が福田さんシート Item 78 ② で指摘済。PC版と同一構造に揃える。
ソース側 PR #232 で header-download.php の PC/SP 両方を統一済のため、DB 側メニュー項目も再登録が必要。

### 2-3. フッターメニュー

Drive 03 SPフッター追記版準拠でレイアウト再構成。

---

## 3. CF7 確認メール / 自動返信メール（wp_options 3通）

**正典**: `やり取り7メール文の英語化.docx`

### 3-1. 送信者への自動返信（お問い合わせ）
件名 / 本文すべて EN に差替（docx 参照）。

### 3-2. 送信者への自動返信（カタログ請求）
ダウンロード URL 動的差込を維持したまま EN 化。

### 3-3. 管理者への通知
管理者宛てのため内部運用に合わせて判断。

**注意**: smart quote 化されないようプレーンテキストで貼り付けること。

---

## 4. タクソノミー term 名（製品分類）

**正典**: `20260412_グローバルナビ、サイドメニュー英語修正依頼 (1).xlsx`

製品タクソノミー（industry / substrate / design / finish / performance / sustainability）の term name を xlsx 正典で全件差替。
slug は変更禁止（URL・リダイレクト影響）。

---

## 5. 固定ページ post_content（CPT 以外）

福田さんシート 96 記事で指摘された箇所を適用。

対象の代表例:
- `/company/`（会社概要本文）
- `/history/`（沿革本文）
- `/sustainability/*`（サステナビリティ系全ページ）
- `/our-strengths/*`（選ばれる理由配下）
- `/global-network/*`（拠点ページ）
- `/resources/`（旧 ライブラリー）

---

## 6. 言語スイッチャー「中文」リンク先

ヘッダーの言語切替「中文」リンク先が未確定（ソース grep 0件 = DB or プラグイン設定由来）。
Drive 03 に中国語版の扱いは明記なし。以下どちらかを選択:

- 非表示にする
- リンク先 URL を設定する

→ 神野さん・クライアント判断。

---

## 7. 国内拠点 business data（`blocks/domestic-locations.php:11-60`）

会社名・住所などの固有名詞は JP のまま維持（Phase A スコープ外）。
EN 化が必要であれば Drive 側で正典が作成され次第対応。

---

## 8. Phase A 外残項目（次 Phase 候補）

- `/story/` 404（ソース側 page-story.php 存在。DB 側固定ページなし？要確認）
- news / media サイドバー
- `/download/` 内「製品ページへ戻る」→ Go Overview（ソース側は対応済、DB 連動あるか要確認）

---

## 9. seed ファイル再実行リスク注意喚起

以下のファイルは **本番で再実行すると既存メニューを上書きする可能性** がある:
- `wp-content/themes/muashi-en/inc/setup-*-menu.php`
- `wp-content/themes/muashi-en/inc/cleanup-unused-menus.php`

wp-admin → メニュー編集の前に、これらのファイルが実行トリガーを持っていないか確認すること。

---

## 10. 進捗管理シート 権限付与依頼

以下のシートへのアクセス権限を AI/磯貝 に付与してもらえると、今後の差分確認が自動化できる:

- `1yUbp-yEl005Vgih0MbN3q__JBQMY2wr3OvTL64xeMpk`（進捗管理）
- `1OzOFnwqh4wtWXP9so3l1gzaoopunJ-VGsLbvDUnrhzg`（福田さん記載・旧ID 404）

福田さんシート `1W9_qHqeTfAPhpw-LJ6m0m4iDpEwT6JQF` は既にアクセス可・確認済。

---

## 11. 福田さんシート 96 記事トンマナ調整メモ

福田さんシートには記事別のトンマナ調整メモが 96 件含まれる。
神野さん側で既に作業進行中の可能性があるため、状態を確認した上で残タスクを洗い出すこと。

---

## 12. 固定ページ post_content 内のブロックパターン挿入済み JP 文言

`muashi-en/functions.php` の block pattern (`muashi/domestic-locations` / `muashi/download-button`) を PR #232 commit `99660ddc` で EN 化した。

**ただし、ブロックパターンはパターンを新規挿入した時点の HTML が post_content にコピーされるため、既に挿入済みの固定ページでは JP 文言が残る**。該当想定ページ:

| ページ | 該当パターン | 残存 JP 文言 |
|---|---|---|
| `/company/` | `muashi/domestic-locations` | `住所: 〒xxx` × 6 拠点 |
| `/global-network/` | iframe aria-label (domestic-locations) | `iframe aria-label="武蔵塗料... 地図"` |

作業: wp-admin の Gutenberg エディタで該当固定ページを開き、`住所:` → `Address:`、iframe aria-label の `地図` 部分を `Map` に手動書き換え。もしくはパターンブロックを削除して再挿入 (EN 化済みパターンが復元される)。

---

## 13. Parse error 修正 (7134628a) の xsrv-en デプロイ

PR #232 にマージ/cherry-pick 後、`deploy_target=xsrv-en --ref feature/issue-230-en-translation-phase-a` で **最優先デプロイ**。

現状 xsrv-en には `header-download.php` の `endif` 欠落 (Parse error) が残存し、`/document/` `/document-featured/` が致命エラー状態。

---

## 引き渡し確認チェックリスト

- [ ] 1. 製品詳細 post_content E14-E19 差替
- [ ] 2-1. PC グローバルナビ（Group Companies 削除 + Manufacturing Footprint）
- [ ] 2-2. SP ハンバーガー PC 同期
- [ ] 2-3. フッターメニュー Drive 03 準拠
- [ ] 3-1. CF7 自動返信（問い合わせ）
- [ ] 3-2. CF7 自動返信（カタログ請求）
- [ ] 3-3. CF7 管理者通知
- [ ] 4. タクソノミー term 名差替
- [ ] 5. 固定ページ post_content 福田さんシート適用
- [ ] 6. 中文リンク先判断
- [ ] 7. 国内拠点 business data 判断
- [ ] 8. /story/ 404 調査・news/media サイドバー対応
- [ ] 9. seed ファイル実行ガード
- [ ] 10. 進捗シート権限付与
- [ ] 11. 福田さんシート 96 件残タスク棚卸し
- [ ] 12. 既存固定ページ内のブロックパターン挿入済み JP 文言 (住所: / iframe 地図 aria-label)
- [ ] 13. xsrv-en への Parse error fix デプロイ (`/document/` `/document-featured/` 復旧)
