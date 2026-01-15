# スタイルガイド

## プロジェクト概要

このプロジェクトは武蔵野ペイント株式会社のコーポレートサイトです。
PHP / WordPress を使用したカスタムテーマで構築されています。

## コーディング規約

### 基本方針

- WordPress コーディング規約に従う
- PHPは WordPress PHP Coding Standards を遵守
- JavaScriptは WordPress JavaScript Coding Standards を遵守
- CSSは WordPress CSS Coding Standards を遵守

### ファイル構成

- テーマファイルは `wp-content/themes/` 配下に配置
- プラグインは `wp-content/plugins/` 配下に配置

### 言語

- コードコメントは日本語で記述
- 変数名・関数名は英語で記述

## レビュー時の注意点

### セキュリティ

- SQLインジェクション対策（`$wpdb->prepare()` の使用）
- XSS対策（`esc_html()`, `esc_attr()`, `wp_kses()` 等の使用）
- CSRF対策（nonce の使用）
- ユーザー入力の適切なサニタイズ・バリデーション

### WordPress ベストプラクティス

- 直接的なグローバル変数の使用を避ける
- WordPress 関数を優先的に使用する
- フックとフィルターを適切に活用する
- 国際化対応（`__()`, `_e()` 等）を考慮する

### パフォーマンス

- 不要なデータベースクエリを避ける
- 適切なキャッシュ戦略を使用する
- アセットの最適化（圧縮、結合等）
