<!-- AUTO-GENERATED from AGENTS.md by script/sync-ai-rules.sh -->
<!-- DO NOT HAND-EDIT — changes will be overwritten on next sync -->
<!-- To update: edit AGENTS.md, then run: bash script/sync-ai-rules.sh -->

# design-inserter — Gemini Code Assist スタイルガイド

## レビュー言語

- すべてのレビューコメントは **日本語** で記述してください
- 内部の思考プロセス（think）のみ英語で行い、出力は日本語にしてください

## PR サマリー

- PR の要約はポエティックで読みやすい形式で記述してください（CodeRabbit 風）
- 変更内容の本質を捉えた、わかりやすく印象的な表現を使用してください

---

<!-- ===== AGENTS.md CONTENT (auto-synced) ===== -->

# design-inserter

デザインパーツ（222件）＆テンプレートを Gutenberg エディターに挿入できる WordPress プラグイン。販売プロダクトとして商用品質が必須。

- **配布形式**: WordPress プラグイン（admin から zip インストール）
- **本番 URL**: なし（プラグインは WP サイトに直接インストール）

> ⚠️ `.gemini/styleguide.md` と `.github/copilot-instructions.md` はこのファイルから
> `script/sync-ai-rules.sh` で自動生成される。直接編集禁止。

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| プラグイン言語 | PHP 7.4+ |
| フロントエンド | JavaScript (Node.js) |
| CMS | WordPress 6.0+ |
| テスト (JS) | Node.js テストスクリプト |
| テスト (PHP) | PHPUnit（Docker 経由） |
| Linter (PHP) | PHPCS（Docker 経由） |
| E2E | Playwright |
| パッケージ管理 | pnpm |
| タスクランナー | Taskfile |
| 配布 | プラグイン zip ビルド |

## コマンド

```bash
pnpm install --frozen-lockfile  # 依存インストール（CI）
pnpm install                    # 依存インストール（開発）
pnpm run build        # リリース zip ビルド（git-crypt ロック時は失敗する）
pnpm run build:dev    # 開発 zip ビルド（暗号文を除外して dist/dev/ に出力）
pnpm test             # JS ユニットテスト
pnpm run phpcs        # PHP コーディング規約チェック（Docker）
pnpm run test:php     # PHP ユニットテスト（Docker）
pnpm run php:lint     # PHP 構文チェック（Docker）
pnpm run e2e:fresh    # 新規インストール E2E（Playwright）

# Taskfile
task ci:fast         # pnpm install --frozen-lockfile + phpcs + php:lint + build:dev + test + test:php
task ci              # ci:fast のエイリアス
```

## テスト

テストケース台帳・実行手順・現状は `doc/test-spec.md` が正本。テストを足す前にそこを読む。
ツールの使い方（portable smoke の環境変数など）は `doc/testing.md`。

## コーディング規約

- **コメント**: 日本語、「なぜ」のみ
- **PHP**: WordPress Coding Standards 準拠（PHPCS で強制）
- **JavaScript**: 既存スタイルに従う
- タスク完了前に `task ci:fast` GREEN 必須（販売プロダクトのため品質厳守）
- `git reset --hard/--soft/--mixed` 禁止
- `--no-verify` 禁止・`--force`（`--force-with-lease` 以外）禁止

## GitHub Project での作業管理

- この repo の作業は GitHub Project（`.github/scrum-board.yml` の番号）で管理する
- 次にやる物を決める・課題を起票する・Status を動かす・繰り越す時は必ず先に `.agents/skills/scrum-board/SKILL.md`（`.claude/skills/scrum-board/`）を読んでから手を付ける
- 読めない・見つからない場合の要点: 次にやる物=盤の「今週の Iteration」で Wait 空の先頭（無ければ「無し」と答える・issue一覧や open PR から選ばない）・課題は題の頭に `[PBI]`/`[SBI]` を付け sub-issue と盤登録と項目（Iteration・Priority・Estimate・Size）までやる・繰り越しは `kouiso/.github` の `scripts/scrum_keeper/scrum_keeper.py --job carryover|okawari` を使う
- Status は Backlog / In progress / In review / Done の 4 つ。Todo は作らん
