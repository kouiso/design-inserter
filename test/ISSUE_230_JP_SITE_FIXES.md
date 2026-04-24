# Issue #230 Phase A — 日本語サイト（muashi テーマ）で今後直すべき項目

**作成日**: 2026-04-22
**対象**: `wp-content/themes/muashi/`（日本語サイト・本番 `musashi-paint.com`）
**起因**: Phase A EN 英訳作業中に発見した JP 側の課題

---

## A. Drive 03.xlsx（4/22 最新版）由来の仕様書準拠修正依頼

**今回 PR (#232) で対応を検討すべき項目**。仕様書が EN/JP 両サイト共通方針を示しているため、日本語サイトにも適用が必要。

### A-1. グループ会社メニュー削除

Drive 03 で明示削除。PC/SP ハンバーガー、フッターから「グループ会社」項目を削除する。

### A-2. グローバル生産拠点 MAP 入替

Drive 03 で MAP 画像が差替指示。JP 側も同一の新 MAP に置換する。

- EN: Manufacturing Footprint
- JP: グローバル生産拠点（ラベルは維持、MAP画像のみ差替）

### A-3. SPフッターレイアウト改修

Drive 03 SPフッター追記版準拠。JP 側も同一レイアウトに揃える。

### A-4. サスティナビリティ配下4区分表示

- Environment / 環境
- Social / 社会
- Governance / ガバナンス
- Responsible Supply Chain / 責任ある調達（SCM）

JP メニュー構造を EN と合わせる。

### A-5. ヒストリー下層3項目表示

- 1958- 創業と基盤形成（Foundation）
- 1980- プラスチック加飾へ（Expansion into Plastic Coatings）
- 2000- グローバル展開（Global Expansion）

JP ヒストリー下層メニュー構造を整備。

### A-6. 選ばれる理由（Our Strengths）配下の SP メニュー4項目

- 最先端の開発技術力（R&D Excellence）
- グローバルネットワーク（Global Network）
- サステナブルなビジネス展開（Sustainable Business）
- 顧客志向のカスタマイズ（Custom Engineering）

JP SP メニューも同一構造で整合。

---

## B. Phase A EN 作業中に発見した JP テーマのコード品質課題（Phase B 候補）

**今回 PR では対応しない**。別 Issue/PR として記録のみ。

### B-7. header.php vs header-download.php の構造 diff

福田さんシート Item 78 ② で指摘された PC/SP メニュー不一致。
EN 側では Phase A PR #232 コミット `e52047a4` で header-download.php を header.php と同期済。
**JP 側にも同じ同期作業が必要**。

影響ファイル:
- `wp-content/themes/muashi/header.php`
- `wp-content/themes/muashi/header-download.php`

### B-8. index.php ホーム H2 誤配置疑い

福田さんシート Item 78 ④ 2026年1月追記:
> 「サステナブルなビジネス展開 → 顧客志向のカスタマイズに修正」

`muashi/index.php` 付近で H2 ラベルと配下コンテンツに齟齬がある可能性。Drive 正典と突合して修正。

### B-9. CF7 contact/download 日本語版テンプレとEN版の構造整合性

EN 側は Phase A でフォーム構造を Drive 03 に準拠済（アスタリスク必須マーク、attachment フィールド、subject 等）。
**JP 側 `muashi/cf7-templates/contact.html`, `download.html` も同一構造に揃えるべき**。
ただし「必須」バッジ表記（JP: `<span class="form__required">必須</span>`）は JP UX として維持。

### B-11. 空投稿メッセージ（5ファイル）の文言ゆれ

JP 側でも複数ファイルに文言ゆれあり:
- `投稿はまだありません。`
- `お知らせはまだありません。`
- `Pickupはまだありません。`

統一 or i18n 関数化を検討。

### B-13. contactform-downlad.php 孤児ファイル削除

`muashi/contactform-downlad.php`（タイポのまま）は grep で参照0件。
JP/EN 両方に存在。削除候補。

---

## まとめ

- **A (A-1 〜 A-6)**: 仕様書準拠の修正。Issue #230 の続編 or 別 Issue として計画。
- **B (B-7/B-8/B-9/B-11/B-13)**: コード品質改善。Phase B 候補として棚卸し。

いずれも **今回の Phase A PR (#232) では対応しない**（スコープ外）。
本ドキュメントは Issue #230 の閉じ技として引き継ぎ用に記録。
