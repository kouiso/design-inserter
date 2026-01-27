# /plan - Implementation Planning Command

## Purpose
詳細な実装計画を立案し、タスク分解・リスク分析を行う
<!-- Create detailed implementation plans, task decomposition, and risk analysis -->

## Trigger
ユーザーが `plan: [タスク説明]` またはコマンドボタンから実行
<!-- User executes plan: [task description] or from command button -->

## Workflow

### Step 1: Context Gathering
1. 既存コードベースの確認
<!-- Check existing codebase -->
2. 関連する機能・パターンの調査
<!-- Investigate related features and patterns -->
3. 技術的な制約・依存関係の洗い出し
<!-- Identify technical constraints and dependencies -->

### Step 2: Requirement Analysis
- 曖昧な要件を明確化
<!-- Clarify ambiguous requirements -->
- 必要な情報を整理
<!-- Organize necessary information -->
- 成功基準を定義
<!-- Define success criteria -->

### Step 3: Task Decomposition
- 大きなタスクを実装可能な単位に分解
<!-- Break large tasks into implementable units -->
- 依存関係の可視化（DAG形式）
<!-- Visualize dependencies (DAG format) -->
- 優先度付け
<!-- Prioritization -->

### Step 4: Implementation Planning
- マイルストーン定義
<!-- Define milestones -->
- 実装順序の決定
<!-- Determine implementation order -->
- リスク特定と対策案
<!-- Identify risks and countermeasures -->

### Step 5: User Confirmation
計画案をマークダウン形式で提示し、ユーザー確認を待つ
<!-- Present plan in markdown format and wait for user confirmation -->

## Output Format

```markdown
# Implementation Plan: [Task Name]

## Overview
- **Objective**: [目的]
- **Complexity**: [Low/Medium/High]
- **Estimated Duration**: [期間]

## Requirements Analysis
- **Functional Requirements**: [要件]
- **Non-Functional Requirements**: [品質要件]
- **Success Criteria**: [成功基準]

## Task Decomposition

### Phase 1: [Phase Name]
- Task 1.1: [タスク]
  - Related files: [ファイル]
  - Dependencies: [依存]
  - Effort: [見積時間]
- Task 1.2: ...

### Phase 2: ...

## Dependency Graph
\`\`\`
Task 1 → Task 2 → Task 3
       ↘          ↗
         Task 4
\`\`\`

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| [リスク] | High/Medium/Low | High/Medium/Low | [対策] |

## Approval
- [ ] Requirements approved
- [ ] Task decomposition approved
- [ ] Risk mitigation approved

**Ready to proceed**: [Yes/No]
```

## Related Commands
- `/debug` - バグ根本原因分析
- `/security-check` - セキュリティ監査
