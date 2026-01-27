# /refactor-clean - Cleanup & Refactoring Command

## Purpose
不要コードの削除とリファクタリングを実施し、コードベースをクリーンに保つ
<!-- Delete unnecessary code and perform refactoring to keep codebase clean -->

## Trigger
ユーザーが `refactor-clean: [対象]` またはコマンドボタンから実行
<!-- User executes refactor-clean: [target] or from command button -->

## Workflow

### Step 1: Current State Analysis
1. 対象ファイル・ディレクトリの確認
<!-- Confirm target files/directories -->
2. 依存関係の把握
<!-- Understand dependencies -->
3. テストカバレッジの確認
<!-- Confirm test coverage -->

### Step 2: Dead Code Detection
- 未使用関数の検出
<!-- Detect unused functions -->
- 未使用変数の検出
<!-- Detect unused variables -->
- 未使用インポートの検出
<!-- Detect unused imports -->
- 到達不能コードの検出
<!-- Detect unreachable code -->

### Step 3: Refactoring Opportunities
- 重複コードの特定
<!-- Identify duplicate code -->
- 複雑度の高い関数の特定
<!-- Identify high complexity functions -->
- 命名の改善箇所
<!-- Areas for naming improvements -->

### Step 4: Safe Cleanup
- 変更前にテスト実行（GREEN確認）
<!-- Run tests before changes (confirm GREEN) -->
- 段階的に削除・修正
<!-- Delete/modify incrementally -->
- 各段階でテスト実行
<!-- Run tests at each stage -->

### Step 5: Verification
- 全テストがパスすることを確認
<!-- Confirm all tests pass -->
- 動作確認
<!-- Verify operation -->

## Output Format

```markdown
# Refactoring Report: [Target]

## Analysis Summary

### Dead Code Found
| Type | Location | Description |
|------|----------|-------------|
| Unused function | file.php:123 | `unused_function()` |
| Unused variable | file.php:45 | `$unused_var` |

### Refactoring Opportunities
| Type | Location | Description | Priority |
|------|----------|-------------|----------|
| Duplicate code | file1.php, file2.php | Similar logic | High |
| High complexity | file.php:100 | Cyclomatic complexity: 15 | Medium |

## Changes Made

### Deleted
- `wp-content/themes/muashi/inc/unused.php` - 全体削除
- `function_name()` in `functions.php:123-145` - 未使用関数削除

### Refactored
- `complex_function()` - 3つの小さな関数に分割
- Duplicate logic extracted to `shared_helper()`

## Before/After

### Before
\`\`\`php
// 複雑なコード
\`\`\`

### After
\`\`\`php
// クリーンなコード
\`\`\`

## Verification
- [ ] All tests pass
- [ ] No functionality changes
- [ ] Code coverage maintained

## Statistics
- Lines deleted: [数]
- Functions removed: [数]
- Files removed: [数]
- Complexity reduced: [%]
```

## Important Notes

### やってはいけないこと
<!-- Things NOT to do -->

- 機能変更を伴うリファクタリング
<!-- Refactoring that changes functionality -->
- テストなしでの削除
<!-- Deletion without tests -->
- 既存のバグ修正ロジックの削除
<!-- Deleting existing bug fix logic -->

### 必ずやること
<!-- Things MUST do -->

- 変更前にテスト実行
<!-- Run tests before changes -->
- 小さな単位で変更・コミット
<!-- Change and commit in small units -->
- 変更後にテスト実行
<!-- Run tests after changes -->

## Related Commands
- `/debug` - バグ根本原因分析
- `/security-check` - セキュリティ監査
