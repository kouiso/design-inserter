# Issue #230 Phase A — 新作業者向け引き継ぎガイド

**作成日**: 2026-04-23
**作成者**: 磯貝 光佑(前任・体調不良により離席中)
**引き継ぎ先**: 新作業者(あなた)
**次 MTG**: 2026-04-24 (Fri) 13:30 — ここまでに T-1 / T-2 / T-3 は終わらせたい

---

## 0. まず読んでほしい順

1. **本ファイル**(全体像)
2. **`test/ISSUE_230_REMAINING_WORK.md`**(残作業ダッシュボード。優先度順タスク)
3. **`test/ISSUE_230_WPX_STAGING_EN_TEST_SPEC.md`**(英訳仕様書)
4. **`test/ISSUE_230_DB_HANDOFF_KANNO.md`**(神野さん DB 作業の 13 項目)
5. **`test/ISSUE_230_JP_SITE_FIXES.md`**(JP 側追従タスク候補)

---

## 1. 何のプロジェクトか

- **サイト**: 武蔵塗料株式会社 コーポレートサイト(`musashi-paint.com`)
- **Issue**: [#230 英語サイト化 Phase A](https://github.com/ritmo-inc/musashipaint/issues/230)
- **PR**: [#232](https://github.com/ritmo-inc/musashipaint/pull/232) ← **本PRに追加 commit する形で進行中**
- **ブランチ**: `feature/issue-230-en-translation-phase-a`
- **ベース**: `develop`(`main` ではない)
- **スタック**: WordPress + カスタムテーマ(`muashi` = JP / `muashi-en` = EN / 別テーマ構成。Polylang や WPML は **使っていない**)

---

## 2. 現在の状況(スナップショット)

### ✅ 終わっていること

- muashi-en テーマのハードコード英訳(S1〜S21、21 観点)
- ブロックパターン英訳(内側コンテンツ)・管理画面用ラベル2つだけ JP 戻し
- ハンバーガーメニュー「Group Companies」リンク削除(ソース側)
- JP muashi フッター「カタログダウンロード」→「カタログ・資料請求」
- `Back to list` 全 single-* テンプレート 8 ファイルで小文字統一
- Parse error 原因ファイル(`header-download.php` の `<?php endif; ?>` 欠落)ソース側修正済(コミット `7134628a`)
- CI 7/7 pass / レビュースレッド 26/26 resolve

### 🔴 まだ終わっていない(= あなたに引き継ぐ作業)

`test/ISSUE_230_REMAINING_WORK.md` の **T-1 / T-2 / T-3** が最優先です。
要点だけ先に書くと:

1. **T-1**: 既に修正済みの PR を **xsrv-en staging にデプロイ** → Parse error(`musashipaint.xsrv.jp/en/document/` の致命エラー)を即解消する
2. **T-2**: 同 PR を **wpx-en staging にもデプロイ** → Playwright MCP で目視確認
3. **T-3**: PR #232 を `develop` にマージする

それ以降(T-4〜T-8)は別 PR 進行で、神野さん DB 作業完了待ちや別ブランチ進行が混ざるので T-3 後に着手。

---

## 3. 最優先 3 ステップを具体的にどう進めるか

### T-1. xsrv-en にデプロイ

```bash
cd "C:/Users/suker/Local Sites/musashipaint/app/public"
gh workflow run "Deploy Staging" -f deploy_target=xserver-en --ref feature/issue-230-en-translation-phase-a
# 実行 ID を確認
gh run list --workflow="Deploy Staging" --limit 3
# watch
gh run watch <run-id>
```

確認観点:
- `https://musashipaint.xsrv.jp/en/document/` が Parse error を出さず正常表示されること
- `https://musashipaint.xsrv.jp/en/document-featured/` も同様

**注意**: `xserver-en` デプロイは神野さんが DB 側を直接触っている環境。神野さんが作業中でないか Slack 等で確認してから実施する。競合したらファイルだけ上書きされるのでメニュー構造が壊れる可能性あり。

### T-2. wpx-en にデプロイ + 目視

```bash
gh workflow run "Deploy Staging" -f deploy_target=wpx-en --ref feature/issue-230-en-translation-phase-a
```

確認観点(Playwright MCP で `https://xw727268.xwp.jp/en/` を開く):
- ハンバーガーメニューに `Group Companies` が **無い**
- 各種 `Back to list` が **小文字** `list` になっている(ニュース詳細 / 製品詳細 / キャリア詳細 / メディア詳細 で確認)
- フッターが崩れていない
- `/en/document/` ページが Parse error を出さない

### T-3. マージ

```bash
# CI 全緑 + レビュー resolve 状態を確認
gh pr view 232 --json mergeable,mergeStateStatus,statusCheckRollup
# OK ならマージ
gh pr merge 232 --squash --delete-branch
```

**注意**: `--delete-branch` を付けるとブランチが消える。付けなくても OK。吉田さん(シニア)承認待ちルールが社内であれば、そちら優先。

---

## 4. T-3 以降(メモ程度)

- **T-4 (Phase 3)**: 孤児ファイル `wp-content/themes/muashi-en/contactform-downlad.php`(grep 参照 0 件・ファイル名タイポ)を削除する別 PR。即発行可。手順は `ISSUE_230_REMAINING_WORK.md` に bash コマンドあり
- **T-5 (Phase 2)**: JP+EN 両テーマのメニュー構造整合。SP フッター改修など。**JP 本番に影響する** ため慎重に
- **T-6**: 神野さんの DB 作業(13 項目)進捗確認
- **T-7**: 福田さんの 96 記事トンマナ調整棚卸し
- **T-8 (Phase 4)**: 構造整合(header/index/CF7/空投稿メッセージ)。低優先

---

## 5. 環境セットアップ

### ローカル開発環境

- **Local by Flywheel** に `musashipaint` サイトが登録されている前提
- WP 管理画面: `http://musashipaint.local/wp-admin/`(magical ID はパスワードマネージャ)

### npm / Playwright

```bash
cd "C:/Users/suker/Local Sites/musashipaint/app/public"
npm install      # 初回のみ
npm run test     # E2E 全件(全件 pass が課題完了条件)
npm run test -- --project=wpx-en  # wpx-en 環境向けのみ
```

### gh CLI

- GitHub 認証済みであること(`gh auth status` で確認)
- 組織: `ritmo-inc`、リポジトリ: `musashipaint`

---

## 6. 作業時の絶対ルール(.claude/rules から抜粋)

- コミットメッセージは **日本語**、`feat:` / `fix:` / `chore:` / `docs:` / `refactor:` / `test:` / `style:` のいずれかで始める
- `git commit --no-verify` / `git push --force` は **完全禁止**。Hook エラーは根本対応
- `git reset` 禁止(`git revert` を使う)
- PHP の出力エスケープ(`esc_html`, `esc_attr`, `esc_url`)必須
- 既存コードスタイルを完全模倣(muashi-en と muashi の命名規則を踏襲)
- 管理者専用の機能追加は **Phase A スコープ外**(= やらない)

---

## 7. 触ってはいけないもの(スコープ外)

- `inc/setup-*-menu.php`(seed 投入スクリプト。再実行すると DB 壊れる)
- `inc/cleanup-unused-menus.php`(CLI 専用)
- `blocks/domestic-locations.php:11-60`(拠点住所。神野さん担当)
- `wp-content/plugins/musashi-inquiry-approval/*`(JP/EN 共有プラグイン)
- `wp_nav_menu` 直接操作(神野さん担当)
- 固定ページ本文(`/company/`, `/history/` 等の post_content は神野さん担当)
- 商品投稿の `post_content`(E14-E19、神野さん担当)
- メールテンプレート `wp_options`(神野さん担当)
- 中文切替リンク(神野さん担当)

---

## 8. 困ったときの連絡先

| 相手 | 役割 | 聞くべきこと |
|---|---|---|
| **吉田 善之(シニア開発)** | レビュア | 技術判断・PR マージ承認・本番デプロイ判断 |
| **神野 憲明(KAGURA)** | PM・コンテンツ | 仕様書解釈・DB 側進捗・staging xsrv-en 作業調整 |
| **福田 由季子(webrickhouse / With us)** | コンテンツレビュア | 英訳トンマナ校正・96 記事整備 |
| **磯貝 光佑(前任)** | 元担当 | 体調回復後に技術的詳細を確認したい場合のみ。無理させない |

---

## 9. 正典資料(Google Drive)

- **仕様書(最新)**: `英語化修正03.xlsx`(2026-04-22 14:31 版、2.44MB)
- ホーム page EN 本文: `トップページ英語化.docx`(※「stably consistent」というタイポは **意図的に残す**)
- メール文: `やり取り7メール文の英語化.docx`
- タクソノミー: `20260412_グローバルナビ、サイドメニュー英語修正依頼 (1).xlsx`
- 福田さん 96 記事シート: ID `1W9_qHqeTfAPhpw-LJ6m0m4iDpEwT6JQF`
- Drive フォルダ: ID `1_mZqPr8JR0mdOqb6i4BA5Z6aRKcLWTKk`

---

## 10. よくあるトラブルと対処

| 症状 | 原因 | 対処 |
|---|---|---|
| `gh workflow run` が「workflow not found」 | ワークフロー名不一致 | `gh workflow list` で正式名を取る |
| デプロイ後も Parse error が消えない | デプロイ先が古いコミット | `gh run view` で実行 SHA を確認し `7134628a` 以降か確認 |
| `npm run test` が Windows パスで失敗 | 絶対パス区切り | bash シェルで実行。PowerShell で動かないテストあり |
| コミット時に husky / pre-commit 失敗 | lint/format ルール違反 | エラー全文を読み根本修正。**絶対に `--no-verify` 使わない** |

---

## 11. 引き継ぎチェックリスト(新作業者が最初にやる)

- [ ] 本ファイルを読み終えた
- [ ] `test/ISSUE_230_REMAINING_WORK.md` を読み終えた
- [ ] GitHub アクセス権確認(`gh auth status`・PR #232 が見える)
- [ ] ローカルで `git pull origin feature/issue-230-en-translation-phase-a`
- [ ] `npm install` が通る
- [ ] `npm run test` の現状結果を把握
- [ ] 吉田さん・神野さんに「引き継ぎました」と一報
- [ ] T-1(xsrv-en デプロイ)着手可否を神野さんに確認してから実施

---

頑張ってください。分からないことは吉田さんに聞けば大抵解決します。
