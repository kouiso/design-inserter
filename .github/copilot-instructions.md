<!-- このファイルは GitHub Copilot および他のAIツール向けの指示ファイルです -->
<!-- 詳細な指示は CLAUDE.md または prompt/prompt.md を参照してください -->

# MusashiPaint AI開発アシスタント

このリポジトリは**武蔵塗料株式会社のコーポレートサイト（WordPress）**です。

## 基本ルール

1. **日本語で記述**: コメント、ドキュメント、コミットメッセージは全て日本語
2. **WordPress Coding Standards準拠**: PHPはタブインデント、関数名はスネークケース
3. **セキュリティ最優先**: エスケープ、Nonce検証、ケイパビリティチェックを必ず実装
4. **テスト必須**: 変更後は `npm run test` でPlaywright E2Eテストを実行

## ディレクトリ構造

- `wp-content/themes/muashi/` - メインテーマ
- `wp-content/plugins/musashi-inquiry-approval/` - カスタムプラグイン
- `test/e2e/` - Playwright E2Eテスト

## 禁止事項

- バックアップファイル作成禁止（`.bak`, `_backup`, etc.）
- 直接SQL操作禁止（WordPress関数を使用）
- 英語コメント禁止（日本語で記述）
- `any`型禁止（TypeScript）

## テストコマンド

```bash
npm run test        # 全テスト
npm run test:smoke  # スモークテスト
npm run test:prod   # 本番環境テスト
```

詳細は `CLAUDE.md` または `prompt/prompt.md` を参照してください。
