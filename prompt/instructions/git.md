# Git & GitHub Rules
<!-- Git & GitHub ルール -->

## 1. Gitブランチ運用ルール
<!-- Git Branch Operation Rules -->

### ブランチ戦略概要
<!-- Branch Strategy Overview -->

- **main**: Development main branch. All feature branches branch from here.
<!-- main: 開発用メインブランチ。全ての開発ブランチはここから切る。 -->
- **feature/xxx**: Feature development
<!-- feature/xxx: 機能開発 -->
- **fix/xxx**: Bug fixes
<!-- fix/xxx: バグ修正 -->
- **chore/xxx**: Maintenance tasks
<!-- chore/xxx: メンテナンスタスク -->

### 開発時のブランチ運用ルール
<!-- Branch Operation Rules During Development -->

#### 新機能開発・バグ修正時
<!-- For new feature development/bug fixes -->

1. **Always create new branch from `main` branch**
<!-- 必ず`main`ブランチから新しいブランチを切る -->

```bash
git checkout main
git pull origin main
git checkout -b feature/xxx  # or fix/xxx, chore/xxx
```

### 心得
<!-- Mindset -->

- **Development always from `main`** → Don't branch from production
<!-- 開発は常に`main`から → productionから切るな -->

## 2. コミットメッセージルール
<!-- Commit Message Rules -->

### 日本語で記述
<!-- Write in Japanese -->

```bash
# ✅ Correct
git commit -m "ヘッダーのナビゲーションを修正"

# ❌ Avoid
git commit -m "Fix header navigation"
```

### 明確な変更内容
<!-- Clear change description -->

- What was changed
<!-- 何を変更したか -->
- Why it was changed (if necessary)
<!-- なぜ変更したか（必要に応じて） -->

## 3. Pull Requestのルール
<!-- Pull Request Rules -->

### テンプレート準拠
<!-- Template Compliance -->

- When `.github/pull_request_template.md` exists: Strictly follow template (can add details, cannot change/omit items)
<!-- `.github/pull_request_template.md` 存在時：テンプレート厳密従来（肉づけ可、項目変更・省略禁止） -->
- When not exists: No constraints applied
<!-- 不存在時：制約適用なし -->

### PR作成前チェックリスト
<!-- Pre-PR Checklist -->

- [ ] Playwright E2E tests all pass
<!-- Playwright E2Eテスト全件パス -->
- [ ] Local environment operation verification complete
<!-- ローカル環境での動作確認完了 -->
- [ ] Security check complete (escaping, Nonce, etc.)
<!-- セキュリティチェック完了（エスケープ、Nonce等） -->
- [ ] Coding standards compliance confirmed
<!-- コーディング規約準拠確認 -->

### PR作業前のブランチ確認義務
<!-- Branch Confirmation Obligation Before PR Work -->

**Before working on PR, always confirm branch name.**
<!-- PR関連作業を行う前に、必ずブランチ名を確認すること。 -->

```bash
git branch
git status
```

## 4. 禁止事項（再掲）
<!-- Prohibitions (Reiteration) -->

### `--no-verify` 完全禁止
<!-- --no-verify Completely Forbidden -->

- **Never** use `git commit --no-verify` or `git push --no-verify`
<!-- `git commit --no-verify` や `git push --no-verify` は絶対に使用しない -->
- Fix all hook errors
<!-- フックのエラーは全て修正する -->

### `--force` 単体禁止
<!-- --force Alone Forbidden -->

- Use `--force-with-lease` instead
<!-- 代わりに `--force-with-lease` を使用 -->

```bash
# ✅ Correct
git push --force-with-lease

# ❌ Forbidden
git push --force
```

## 5. 作業ミス時の対応
<!-- Handling Work Mistakes -->

### 間違ったコミット
<!-- Wrong Commit -->

- Use `git revert` to undo
<!-- `git revert` で取り消す -->
- `git reset` is forbidden
<!-- `git reset` は禁止 -->

```bash
git revert HEAD
```

### コミットメッセージ修正（最新のみ）
<!-- Commit Message Fix (Latest Only) -->

```bash
git commit --amend -m "新しいメッセージ"
```

## 6. GitHub操作
<!-- GitHub Operations -->

### PR作成
<!-- PR Creation -->

```bash
gh pr create --title "タイトル" --body "本文"
```

### Issue参照
<!-- Issue Reference -->

- Use full format for cross-repository references
<!-- クロスリポジトリ参照には完全形式を使用 -->

```bash
# ✅ Correct
organization/repo#123

# ❌ Forbidden (ambiguous)
#123
```
