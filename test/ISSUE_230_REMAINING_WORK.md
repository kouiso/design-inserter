# Issue #230 Phase A — 残作業ダッシュボード

**最終更新**: 2026-04-23
**対象ブランチ**: `feature/issue-230-en-translation-phase-a`
**PR**: https://github.com/ritmo-inc/musashipaint/pull/232
**次 MTG**: 2026-04-24 (Fri) 13:30

---

## 🎯 残作業 一覧 (優先度順)

| 優先度 | ID | タスク | 担当 | 所要 | 依存 |
|---|---|---|---|---|---|
| 🔴 最優先 | **T-1** | PR #232 を **xsrv-en** にデプロイ(Parse error 解消) | 開発 | 5 分 | 神野さん DB 作業と競合しないか確認 |
| 🔴 最優先 | **T-2** | PR #232 を **wpx-en** にデプロイ + Playwright MCP で目視確認 | 開発 | 15 分 | — |
| 🔴 最優先 | **T-3** | PR #232 を `develop` にマージ | 開発 | 5 分 | T-1/T-2 確認完了後 |
| 🟡 重要 | **T-4** | Phase 3: 孤児ファイル削除 別PR(即発行可) | 開発 | 30 分 | T-3 |
| 🟡 重要 | **T-5** | Phase 2: JP+EN 両テーマのメニュー構造整合 別PR | 開発 | 2〜4h | T-3 / 要 Drive 03 SP フッター仕様再読 |
| 🟢 通常 | **T-6** | 神野さんの DB 側作業進捗確認(13 項目) | 開発→神野さん | — | 別進行 |
| 🟢 通常 | **T-7** | 福田さん 96 記事トンマナ調整の残タスク棚卸し | 開発 | — | 神野さん状況確認後 |
| ⚪ 低 | **T-8** | Phase 4: header/index/CF7/空投稿メッセージ構造整合 別PR | 開発 | 2〜3h | 時間余裕あれば |

---

## ✅ 完了済(2026-04-23 時点)

- [x] muashi-en テーマのハードコード英訳(S1〜S21)
- [x] Parse error fix のソース側コミット (`7134628a`) ※デプロイはまだ
- [x] ブロックパターン JP 残存英訳(内側コンテンツ)
- [x] ハンバーガーメニュー Group Companies リンク削除(ソース側)
- [x] JP muashi フッター 「カタログ・資料請求」 変更
- [x] `Back to list` 全 single-* テンプレートで小文字統一(9 ファイル)
- [x] 管理者専用 JP 戻し(ブロックパターン title/description)
- [x] ISSUE_230_JP_SITE_FIXES.md スコープ整理(B-10/12/14/15 削除)
- [x] ISSUE_230_DB_HANDOFF_KANNO.md 項目9(管理者専用) 削除
- [x] CI 7/7 チェック pass(PR #232)
- [x] レビュースレッド 26/26 resolve

---

## 🚨 即対応が必要な障害

### xsrv-en Parse error(公開環境)
- **状況**: `musashipaint.xsrv.jp/en/document/` と `/en/document-featured/` が Parse error で **致命エラー状態**
- **原因**: `header-download.php` の `<?php endif; ?>` 欠落(既にソース側修正済み = `7134628a`)
- **解消法**: T-1 (xsrv-en デプロイ) 実行で即復旧
- **影響範囲**: xsrv-en staging 環境のみ(本番 `musashi-paint.com` には影響なし)

---

## 📦 Phase 2/3/4 の詳細(別PR で進める作業)

### Phase 3 (T-4) — 孤児ファイル削除 ※低リスク・即発行可

```bash
# 新ブランチ作成 → 削除 → PR
git checkout main
git pull
git checkout -b chore/remove-orphan-contactform-downlad
git rm wp-content/themes/muashi-en/contactform-downlad.php
git commit -m "chore: 未参照孤児ファイル contactform-downlad.php を削除"
git push -u origin chore/remove-orphan-contactform-downlad
gh pr create --title "chore: 未参照孤児ファイル contactform-downlad.php を削除" --body "grep で参照 0 件、ファイル名もタイポ(downlad)のまま放置されていたため削除。"
```

検証: `grep -r "contactform-downlad" wp-content/` が最終 0 件であること。

### Phase 2 (T-5) — JP+EN 両サイトのメニュー構造整合 ⚠️ 本番 JP 影響あり

| # | 項目 | JP 現状 | EN 現状 | 必要対応 |
|---|---|---|---|---|
| D-1 | Group Companies 削除 | ❌ 残存 | ✅ 済 | JP で削除 |
| D-3 | SP フッター改修 | 未調整 | 未調整 | 両テーマで Drive 03 SP フッター仕様準拠 |
| D-4 | サステナ 4 区分化 | ❌ 6 項目残存 | 要確認 | 両テーマで 4 区分 |
| D-5 | ヒストリー 3 項目 | ✅ 済 | ✅ 済 | 対応不要 |
| D-6 | Our Strengths SP 4 項目 | ⚠️ 階層複雑 | ⚠️ 同様 | 両テーマで孫階層をフラット化 |

**対象ファイル**:
- JP: `wp-content/themes/muashi/header.php`, `header-download.php`, `footer.php`, `src/scss/components/_footer.scss`, `_hamburger.scss`, `inc/setup-about-us-menu.php`
- EN: `wp-content/themes/muashi-en/header.php`, `header-download.php`, `footer.php`, 対応 SCSS

**検証**:
```bash
# JP staging にデプロイ(ワークフロー名は .github/workflows/deploy-staging.yml を要確認)
gh workflow run "Deploy Staging" -f deploy_target=xserver
# EN staging にもデプロイ
gh workflow run "Deploy Staging" -f deploy_target=wpx-en
```

### Phase 4 (T-8) — 構造整合(低優先)

- Y-1: `header.php` vs `header-download.php` の構造差分最小化(両テーマ)
- Y-2: `muashi/index.php:322,388` のホーム H2 誤配置修正(「顧客志向のカスタマイズ」に統一)
- Y-3: CF7 JP/EN テンプレ構造揃え(必須マーク方式は JP UX 維持)
- Y-4: 空投稿メッセージ 5 ファイル文言統一

---

## 📁 関連ドキュメント(リポジトリ内)

| ファイル | 役割 |
|---|---|
| `test/ISSUE_230_WPX_STAGING_EN_TEST_SPEC.md` | 仕様書(検証観点) |
| `test/ISSUE_230_WPX_STAGING_EN_TEST_RESULT_2026-04-22.md` | 最新実施結果 |
| `test/ISSUE_230_WPX_STAGING_EN_MANUAL_TEST_GUIDE.md` | 手動手順書 |
| `test/ISSUE_230_DB_HANDOFF_KANNO.md` | 神野さん引き渡し(DB 作業 13 項目) |
| `test/ISSUE_230_JP_SITE_FIXES.md` | JP サイト追従タスク候補 |
| `test/ISSUE_230_WPX_XSRV_DIFF_2026-04-22.md` | 2 staging 環境差分 |
| `test/ISSUE_230_HANDOFF_NEW_WORKER.md` | **新作業者向け引き継ぎガイド** |
| `test/ISSUE_230_REMAINING_WORK.md` | 本ダッシュボード |

---

## 🔗 正典資料(Google Drive)

- **仕様書(最新)**: `英語化修正03.xlsx` (2026-04-22 14:31, 2.44MB)
- ホーム page EN: `トップページ英語化.docx`
- メール文: `やり取り7メール文の英語化.docx`
- タクソノミー: `20260412_グローバルナビ、サイドメニュー英語修正依頼 (1).xlsx`
- 福田さん 96 記事: `1W9_qHqeTfAPhpw-LJ6m0m4iDpEwT6JQF`
- 進捗管理(未権限): `1yUbp-yEl005Vgih0MbN3q__JBQMY2wr3OvTL64xeMpk`
- Drive フォルダ: `1_mZqPr8JR0mdOqb6i4BA5Z6aRKcLWTKk`

---

## 👥 ステークホルダー

| 役割 | 名前 | 主担当 |
|---|---|---|
| 開発(自分) | 磯貝 光佑 | muashi-en テーマのソース修正 |
| シニア開発 | 吉田 善之 | レビュー |
| PM / コンテンツ | 神野 憲明 (KAGURA) | DB 側・wp-admin 作業(13 項目引き渡し済) |
| コンテンツレビュア | 福田 由季子 (webrickhouse / With us) | 96 記事トンマナ校正 |
