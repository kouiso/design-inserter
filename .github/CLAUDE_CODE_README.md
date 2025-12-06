# Claude Code GitHub Actions

このリポジトリには、Claude Code（Anthropic API）を使用してコードレビューや実装支援を自動化するGitHub Actionsが含まれています。

## 機能

### 1. コードレビュー (`claude-code-review.yml`)

Pull Requestに対して自動的にAIによるコードレビューを実行します。

**トリガー:**
- Pull Requestが作成・更新された時
- PRコメントで `@claude-code` と呼び出された時

**レビュー内容:**
- 変更内容の概要
- コードの良い点
- 改善提案
- セキュリティ上の懸念
- 総合評価

### 2. 実装支援 (`claude-code-implementation.yml`)

Issueに対して実装提案や分析を提供します。

**トリガー:**
- Issueに `claude-code` ラベルが付けられた時
- Issueコメントで `@claude-code` コマンドを使用した時

**利用可能なコマンド:**
- `@claude-code suggest` - 実装の提案を取得
- `@claude-code implement` - 完全な実装コードを取得
- `@claude-code analyze` - Issueの詳細な分析を取得

## セットアップ

### 1. Anthropic APIキーの取得

1. [Anthropic Console](https://console.anthropic.com/)にアクセス
2. アカウントを作成またはログイン
3. APIキーを生成

### 2. リポジトリシークレットの設定

1. GitHubリポジトリの **Settings** > **Secrets and variables** > **Actions** に移動
2. **New repository secret** をクリック
3. 名前を `ANTHROPIC_API_KEY` に設定
4. 値にAnthropicのAPIキーを入力
5. **Add secret** をクリック

## 使用方法

### コードレビュー

Pull Requestを作成すると、自動的にClaude Codeがレビューコメントを投稿します。

追加のレビューが必要な場合は、PRコメントで以下のように呼び出せます：

```
@claude-code このPRをレビューしてください
```

### 実装支援

#### 方法1: ラベルを使用

1. 新しいIssueを作成
2. `claude-code` ラベルを追加
3. Claude Codeが自動的に応答

#### 方法2: コメントを使用

Issueのコメントで以下のコマンドを使用：

```
@claude-code suggest
```

## 料金について

この機能はAnthropic APIを使用しています。APIの使用には料金が発生します。

- [Anthropic API Pricing](https://www.anthropic.com/pricing)

使用量に応じた課金が行われるため、APIキーの管理には十分ご注意ください。

## セキュリティ

- APIキーは絶対にコード内にハードコードしないでください
- リポジトリシークレットを使用してAPIキーを安全に管理してください
- APIキーが漏洩した場合は、即座にAnthropicダッシュボードから無効化してください

## トラブルシューティング

### Claude Codeが応答しない

1. `ANTHROPIC_API_KEY` が正しく設定されているか確認
2. APIキーが有効で、残高があるか確認
3. GitHub Actionsのログでエラーを確認

### レビューが途中で切れる

大きな差分の場合、APIの制限により一部のみが処理される場合があります。
PRを小さく分割することを検討してください。

## ライセンス

このプロジェクトのライセンスに従います。
