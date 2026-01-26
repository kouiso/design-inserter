# /debug - Root Cause Analysis Command

## Purpose
バグの根本原因を徹底的に分析し、修正方針を提示する

## Trigger
ユーザーが `debug: [エラー説明]` またはコマンドボタンから実行

## Workflow

### Step 1: Error Localization
- エラーメッセージから問題箇所を特定
- ログ・スタックトレースの解析
- 再現条件の確認

### Step 2: Hypothesis Generation
複数の仮説を立てる：
1. [仮説A]
2. [仮説B]
3. [仮説C]

### Step 3: Evidence Collection
各仮説に対する証拠を集める：
- コード検査（grep, semantic search）
- ファイル読み込み
- コンテキスト分析

### Step 4: Root Cause Identification
- 最も可能性の高い原因を特定
- 根本原因を説明
- 類似バグの有無を確認

### Step 5: Fix & Verification
- 修正コードを実装
- テストで動作確認
- リグレッション検査

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
\`\`\`typescript
// 問題のコード
\`\`\`

## Fix Strategy
1. [修正ステップ1]
2. [修正ステップ2]
3. [修正ステップ3]

## Implementation
\`\`\`typescript
// 修正後のコード
\`\`\`

## Verification
- [ ] Fix implemented
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Regression checks complete

## Related Issues
- Similar bugs: [関連バグ]
- Prevention: [今後の対策]
```

## Agent Used
`build-error-resolver` agent with following settings:
- tools: Read, Grep, SemanticSearch, Write, Replace
- model: claude-3-5-sonnet
- focus: Error Analysis, Root Cause, Systematic Debugging

## Related Commands
- `/tdd` - Add tests after fix
- `/security-check` - Security implications
