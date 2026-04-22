# Issue #230 Phase A — wpX / xsrv 2 staging 差分記録

**作成日**: 2026-04-22
**対象ブランチ**: `feature/issue-230-en-translation-phase-a`
**最新デプロイ**: wpX-EN run `24774632874` (success)

---

## 1. staging 構成

| Target | ホスト | source theme | dest theme | 用途 |
|---|---|---|---|---|
| **wpx-en** | `xw727268.xwp.jp` | `muashi-en` | `muashi` | 磯貝確認環境（本PR検証用） |
| **xserver-en** | `musashipaint.xsrv.jp/en/` | `muashi-en` | `muashi` | 神野さん作業環境（DB側作業進行中） |

両環境とも **source は `muashi-en` テーマ** で同一。ただし **DB は別物**。

---

## 2. ソースコード差分

Phase A PR #232（コミット範囲 `3576cf39..57b59f78`）を両環境にデプロイすれば **ソース側は完全一致**。
本記録時点での最新コミットは `57b59f78`（JP footer 変更）。

### デプロイ状況

| run id | target | branch | status | 対象コミット |
|---|---|---|---|---|
| 24768964640 | wpx-en | feature/issue-230-en-translation-phase-a | success | `3576cf39`（E16 Paint Type 修正まで） |
| 24774632874 | wpx-en | feature/issue-230-en-translation-phase-a | success | `57b59f78`（Phase A S1-S21 全適用） |
| （未実施） | xserver-en | feature/issue-230-en-translation-phase-a | pending | 神野さん DB 作業完了後に実施予定 |

---

## 3. DB 側差分（想定）

現時点では wpX 側のみソース最新を当てているため、xsrv 側との DB 状態差は以下のように想定される:

| 領域 | wpX EN | xsrv EN |
|---|---|---|
| 固定ページ post_content | 初期 seed（JP 混在） | 神野さん作業中（EN 化進行） |
| wp_nav_menu | 初期 seed | 神野さん作業中 |
| タクソノミー term name | JP | EN 作業中 |
| CF7 フォーム本体 | ソース最新 | ソース最新（同じ） |
| CF7 メールテンプレ (wp_options) | 初期 seed | 神野さん作業中 |
| 製品投稿 post_content | 初期 seed（JP 混在） | 神野さん作業中 |

**注**: wpX 側は磯貝の「ソース側修正の動作確認環境」であり、DB 側コンテンツは EN 初期状態のまま。
**Phase A 完了判定の「ソース側 100%」は wpX で検証可能**。
DB 側の最終確認は xsrv 側で神野さん作業完了後に実施する。

---

## 4. Playwright 検証対象

**Phase A PR 検証は wpX を対象**とする（https://xw727268.xwp.jp）。

xsrv 側は神野さんの DB 作業と磯貝のソース側作業が並行進行しているため、同時比較には適さない。
Phase B（DB 側完了後の最終確認）で xsrv 側も同じシナリオを回す想定。

---

## 5. 差分要因別の期待動作

### ソース由来の差分（wpX / xsrv 両方で EN 表示されるべき）

- CF7 フォーム全文（contact / download）
- ハンバーガーメニュー構造（Group Companies 非表示、Manufacturing Footprint）
- index.php ホーム4セクション H2 / 長文
- 空投稿メッセージ（No posts yet.）
- カテゴリ未設定 → Uncategorized
- 検索ページ
- ページネーション aria-label
- iframe 地図 aria-label
- product / catalog / download / document 系検索 UI

### DB 由来の差分（wpX は未対応、xsrv で段階的に EN 化）

- 固定ページ本文
- ナビメニュー項目ラベル
- タクソノミー term 名
- 製品詳細 E14-E19 ラベル
- CF7 自動返信メール

---

## 6. 次アクション

1. Phase A PR #232 マージ（Playwright wpX 検証完了後）
2. xsrv-en に Phase A コミットをデプロイ（神野さんの DB 作業と時間調整）
3. Phase B で DB 側完了後、両環境に同じシナリオで Playwright 再実行し diff を取る
