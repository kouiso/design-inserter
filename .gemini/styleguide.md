# Gemini Code Assist スタイルガイド

## 基本方針

### 言語
- 日本語でレビューコメント・提案を記述する
- コード内のコメントも日本語を推奨

### コードスタイル
- 既存のコードスタイル・設計パターンに従う
- プロジェクトのリンター・フォーマッター設定を尊重する
- TypeScript のベストプラクティスに従う

### レビュー方針
- バグ・セキュリティ問題を最優先で指摘
- パフォーマンス改善の提案
- 可読性・保守性の向上提案

## プロジェクト固有 (design-inserter)

- WordPress プラグイン (PHP) と Figma plugin (TypeScript) 双方を含むため、両言語の慣習を尊重
- WP側は nonce / capability / sanitize / escape を必須レビュー
- DB クエリは `$wpdb->prepare()` 必須、SQL injection を最優先で検出
