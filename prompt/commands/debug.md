# /debug - Root Cause Analysis Command

## Purpose
バグの根本原因を徹底的に分析し、修正方針を提示する
<!-- Thoroughly analyze root cause of bugs and present fix strategy -->

## Trigger
ユーザーが `debug: [エラー説明]` またはコマンドボタンから実行
<!-- User executes debug: [error description] or from command button -->

## Workflow

### Step 1: Error Localization
- エラーメッセージから問題箇所を特定
<!-- Identify problem location from error message -->
- ログ・スタックトレースの解析
<!-- Analyze logs and stack traces -->
- 再現条件の確認
<!-- Confirm reproduction conditions -->

### Step 2: Hypothesis Generation
複数の仮説を立てる：
<!-- Generate multiple hypotheses -->
1. [仮説A]
2. [仮説B]
3. [仮説C]

### Step 3: Evidence Collection
各仮説に対する証拠を集める：
<!-- Collect evidence for each hypothesis -->
- コード検査（grep, semantic search）
<!-- Code inspection -->
- ファイル読み込み
<!-- File reading -->
- コンテキスト分析
<!-- Context analysis -->

### Step 4: Root Cause Identification
- 最も可能性の高い原因を特定
<!-- Identify most likely cause -->
- 根本原因を説明
<!-- Explain root cause -->
- 類似バグの有無を確認
<!-- Check for similar bugs -->

### Step 5: Fix & Verification
- 修正コードを実装
<!-- Implement fix code -->
- テストで動作確認
<!-- Verify with tests -->
- リグレッション検査
<!-- Regression check -->

## Output Format

```markdown
# Bug Analysis Report: [Bug Title]

## Error Summary
\`\`\`
[エラーメッセージ]
[スタックトレース]
\`\`\`

## Initial Investigation
- **When**: [いつ発生したか]
- **Where**: [どこで発生したか]
- **Impact**: [どの程度のインパクト]

## Hypothesis Analysis

### Hypothesis 1: [仮説]
- Evidence: [証拠]
- Likelihood: [可能性]
- Related Code: [関連コード]

### Hypothesis 2: [仮説]
...

## Root Cause
**Identified**: [根本原因]

### Explanation
[詳細説明]

### Related Code Snippet
\`\`\`php
// 問題のコード
\`\`\`

## Fix Strategy
1. [修正ステップ1]
2. [修正ステップ2]
3. [修正ステップ3]

## Implementation
\`\`\`php
// 修正後のコード
\`\`\`

## Verification
- [ ] Fix implemented
- [ ] E2E tests pass
- [ ] Regression checks complete

## Related Issues
- Similar bugs: [関連バグ]
- Prevention: [今後の対策]
```

## Related Commands
- `/plan` - 詳細作業計画
- `/security-check` - セキュリティ監査
