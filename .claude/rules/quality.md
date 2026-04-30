---
applyTo: "**"
---

# Quality & Implementation Rules

## Fundamentals

- Sharp eye for even the smallest details; always pursue best practices
- Fully imitate existing code style and design philosophy. When deviating: propose → get approval → implement
- Out-of-scope tasks require proposal → approval
- Investigate unknowns immediately via web search (no permission needed)

## Work Process

### Before Starting

1. Grasp full repository structure and documentation (README, doc/, etc.)
2. Review existing implementation patterns and test code
3. Define requirements, decompose tasks, identify potential risks
4. Present concrete execution plan for user approval
5. **CSS/SCSS変更前に親要素・兄弟要素のスタイル影響範囲を必ず確認する**: `grep -r` で対象クラスを使っている全テンプレートを洗い出し、親要素のpaddingやmargin、カスケードの影響を把握してから変更する。確認なしに値を変えることは禁止。

### During Implementation

- Execute steps sequentially; brief progress report on completion
- Report problems immediately with proposed solutions
- Fully imitate existing code style, design philosophy, naming conventions
- Avoid changing existing behavior (absolutely prevent regression)
- Prefer using existing files over creating new ones

### On Completion

1. Run `npm run test` (**task incomplete until all tests pass**)
2. On errors: resolve root cause (re-verify from start, never give up)
3. Compare against original instructions, adjust as needed
4. Share URLs when creating PRs, Issues, or branches

### Mandatory Self-Review (after any code change)

Before reporting completion, perform a self-review:

1. Re-read the entire diff (`git diff`)
2. Check impact on call sites when function signatures change
3. Verify all `grep -r` references are updated when renaming functions or CSS classes
4. Confirm SCSS changes compile correctly and `style.css` reflects the intent
5. Fix discovered problems immediately, then re-verify

## Precautions

- Unused variables: underscore avoidance forbidden — delete to resolve
- Unused type definitions/functions: delete immediately
- Function renames: update all references simultaneously
- Uninstructed commonization/refactoring: forbidden
- Work mistakes (branches, files, commits): clean up immediately on discovery
- Leaving unused code in intermediate states: forbidden

## Context Efficiency

- Read only necessary files (bulk reading all files forbidden)
- Use Grep/search to locate targets first, then read specific ranges
- Avoid re-reading the same file
- Parallelize independent tasks

## Context Management

### Minimize Main Context Bloat

Large file reads in the main conversation cause context overflow. Follow these rules:

1. **Read only files you will edit**: Use `grep` to locate targets first, then read specific line ranges
2. **Delegate bulk research to subagents**: Full codebase overview, architecture comprehension, and multi-file exploration go to `runSubagent`
3. **Parallelize independent research**: Run multiple searches/reads simultaneously when they don't depend on each other
4. **Don't duplicate subagent research**: Trust subagent results; don't re-read the same files
5. **Avoid re-reading the same file**: Cache the information mentally after the first read
6. **Image paths only**: When referencing screenshots, record the file path in text — don't embed repeatedly

### Why This Matters

Main context bloat triggers compression, losing early conversation content and degrading performance in long sessions.

## Image/Screenshot Handling

When user provides images:

1. Accurately understand user intent from visual information
2. Identify relevant files immediately, implement changes without delay
3. Make only necessary changes (avoid unnecessary code additions)
