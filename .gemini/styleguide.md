<!-- AUTO-GENERATED from AGENTS.md by scripts/sync-ai-rules.sh -->
<!-- DO NOT HAND-EDIT — changes will be overwritten on next sync -->
<!-- To update: edit AGENTS.md, then run: bash scripts/sync-ai-rules.sh -->

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

CSS Stock のデザインパーツ（222件）＆テンプレートを Gutenberg エディターに挿入できる WordPress プラグイン。販売プロダクトとして商用品質が必須。

- **配布形式**: WordPress プラグイン（admin から zip インストール）
- **本番 URL**: なし（プラグインは WP サイトに直接インストール）

> ⚠️ `.gemini/styleguide.md` と `.github/copilot-instructions.md` はこのファイルから
> `scripts/sync-ai-rules.sh` で自動生成される。直接編集禁止。

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
| タスクランナー | Taskfile |
| 配布 | プラグイン zip ビルド |

## コマンド

```bash
npm ci               # 依存インストール（CI）
npm install          # 依存インストール（開発）
npm run build        # リリース zip ビルド（git-crypt ロック時は失敗する）
npm run build:dev    # 開発 zip ビルド（暗号文を除外して dist/dev/ に出力）
npm test             # JS ユニットテスト
npm run phpcs        # PHP コーディング規約チェック（Docker）
npm run test:php     # PHP ユニットテスト（Docker）
npm run php:lint     # PHP 構文チェック（Docker）
npm run e2e:fresh    # 新規インストール E2E（Playwright）

# Taskfile
task ci:fast         # npm ci + phpcs + php:lint + build:dev + test + test:php
task ci              # ci:fast のエイリアス
```

## テスト

テストケース台帳・実行手順・現状は `docs/test-spec.md` が正本。テストを足す前にそこを読む。
ツールの使い方（portable smoke の環境変数など）は `docs/testing.md`。

## コーディング規約

- **コメント**: 日本語、「なぜ」のみ
- **PHP**: WordPress Coding Standards 準拠（PHPCS で強制）
- **JavaScript**: 既存スタイルに従う
- タスク完了前に `task ci:fast` GREEN 必須（販売プロダクトのため品質厳守）
- `git reset --hard/--soft/--mixed` 禁止
- `--no-verify` 禁止・`--force`（`--force-with-lease` 以外）禁止
