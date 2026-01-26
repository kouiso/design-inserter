# Performance & Context Management Rules
<!-- パフォーマンス・コンテキスト管理ルール -->

## Context Window Management
<!-- コンテキストウィンドウ管理 -->

### Problem
<!-- 問題 -->

**Large context consumption reduces available thinking space.**
<!-- 大量のコンテキスト消費により、利用可能な思考スペースが減少する。 -->

```
Base Context Window: 200,000 tokens
─────────────────────────────────────

Impact of large file reading:
<!-- 大量ファイル読み込みの影響 -->
- Read all PHP files at once (+30,000) → Remaining 170k
<!-- 全PHPファイル一度に読み込み / 残り -->
- Read all JavaScript/CSS (+20,000) → Remaining 150k
<!-- 全JavaScript/CSS読み込み / 残り -->
- Read test files (+15,000) → Remaining 135k
<!-- テストファイル読み込み / 残り -->

Danger zone:
<!-- 危険ゾーン -->
- Excessive file reading → Remaining < 100k (50% reduction) ⚠️
<!-- 過度なファイル読み込み / 削減 -->
```

### Rules
<!-- ルール -->

**Read only necessary files, not all at once.**
<!-- 必要なファイルのみを読み込み、一度に全て読み込まない。 -->

Recommended:
<!-- 推奨 -->
- Read specific files one at a time
<!-- 特定のファイルを1つずつ読む -->
- Use Grep/Glob to identify target files first
<!-- まずGrep/Globでターゲットファイルを特定 -->
- Total context usage ≤ 100k tokens per task
<!-- タスクごとの総コンテキスト使用量 -->

### Context Monitoring
<!-- コンテキスト監視 -->

Periodically check context usage to avoid excessive consumption.
<!-- 定期的にコンテキスト使用量を確認し、過度な消費を避ける。 -->

Target: **Maintain 140k+ tokens available** (allow up to 30% reduction)
<!-- 目標：140k tokens以上を維持（30%削減まで許容） -->

## Agent Design Principles
<!-- エージェント設計原則 -->

### Minimize Tools
<!-- ツール最小化 -->

**Give each agent only the minimal necessary tools.**
<!-- 各エージェントには必要最小限のツールだけを与える。 -->

```yaml
# ❌ Bad: Agent with all available tools
<!-- すべての利用可能ツールを持つエージェント -->
tools: [Read, Write, Edit, Grep, Glob, Bash, WebFetch, WebSearch, ...]

# ✅ Good: Only necessary tools for the task
<!-- タスクに必要なツールのみ -->
tools: [Read, Grep, Glob, Edit]
```

**Reasons:**
<!-- 理由 -->
- Fewer tools = faster execution and clearer focus
<!-- ツール数が少ない = 実行が高速で焦点が明確 -->
- Maintains focus on the specific task
<!-- 特定のタスクにフォーカスが維持される -->
- Saves context window
<!-- コンテキストウィンドウ節約 -->

### Efficient Agent Delegation
<!-- エージェント委任の効率化 -->

Use the Task tool to delegate to specialized agents for complex, multi-step tasks.
<!-- 複雑で複数ステップのタスクには、Task toolを使用して専門エージェントに委任する。 -->

```typescript
// ✅ Good: Delegate to specialized agent
<!-- 専門エージェントに委任 -->
Task({
  subagent_type: 'Explore',
  prompt: 'Find all WordPress template files that use custom post types',
  description: 'Find CPT template files'
});

// ❌ Bad: Main agent does everything (slow and unfocused)
<!-- メインエージェントで全部実行（遅くて焦点がぼやける） -->
// Execute search yourself using all tools
<!-- すべてのツールを使って自分で検索 -->
```

## Performance Optimization
<!-- パフォーマンス最適化 -->

### Task Execution Time
<!-- タスク実行時間 -->

**Targets:**
<!-- 目標 -->
- File reading: **< 5 seconds** per file
<!-- ファイル読み込み / ファイルあたり -->
- Code search: **< 10 seconds**
<!-- コード検索 -->
- Test execution: **< 30 seconds**
<!-- テスト実行 -->
- Build/Deployment: **< 60 seconds**
<!-- ビルド/デプロイ -->

### Parallel Execution
<!-- 並列実行 -->

**Execute independent tasks in parallel.**
<!-- 独立したタスクは並列実行すること。 -->

```typescript
// ✅ Good: Parallel file reading
<!-- 並列ファイル読み込み -->
// Read multiple files in parallel
Read('functions.php');
Read('header.php');
Read('footer.php');
// All executed in parallel

// ❌ Bad: Sequential reading (3x slower)
<!-- 逐次読み込み（3倍遅い） -->
// Wait for each file before reading next
```

### Cache Utilization
<!-- キャッシング活用 -->

**Avoid re-reading the same information.**
<!-- 同じ情報の再読み込みを避ける。 -->

```typescript
// ✅ Good: Read once and reference multiple times
<!-- 一度読んで複数回参照 -->
const code = Read('functions.php');
// Use same code for multiple analyses
<!-- 複数の分析で同じcodeを使用 -->

// ❌ Bad: Read multiple times
<!-- 何度も読み込み -->
const code1 = Read('functions.php');  // Analysis 1
<!-- 分析1 -->
const code2 = Read('functions.php');  // Analysis 2 (wasteful)
<!-- 分析2（無駄） -->
```

## Resource Efficiency
<!-- リソース効率化 -->

### File Reading Strategy
<!-- ファイル読み込み戦略 -->

```typescript
// ✅ Good: Read specific section
<!-- 特定セクションを読む -->
Read('functions.php', { offset: 100, limit: 50 });

// ✅ Good: Use Grep first to identify location
<!-- まずGrepで場所を特定 -->
Grep('function custom_post_type', { output_mode: 'content', '-n': true });
// Then read that specific section
<!-- その後、特定セクションを読む -->

// ❌ Bad: Read entire large file repeatedly
<!-- 大きなファイル全体を繰り返し読む -->
Read('functions.php'); // 5000+ lines
```

### Efficient Searching
<!-- 検索効率化 -->

```typescript
// ✅ Good: Specific pattern with file type filter
<!-- 具体的なパターンとファイルタイプフィルター -->
Grep('register_post_type', { glob: '**/*.php', output_mode: 'content' });

// ❌ Bad: Ambiguous search without filter (too many results)
<!-- フィルターなしの曖昧な検索（結果が多すぎる） -->
Grep('post');
```

### Bash Execution
<!-- Bash実行 -->

```bash
# ✅ Good: Narrow down test execution
<!-- テスト実行を絞る -->
npm test -- --testPathPattern="UserService"

# ❌ Bad: Run all tests every time (slow)
<!-- 毎回全テストを実行（遅い） -->
npm test
```

## Model Selection Strategy
<!-- モデル選択戦略 -->

### Model Selection by Task
<!-- タスク別モデル選択 -->

| Task | Model | Reason |
<!-- タスク / モデル / 理由 -->
|--------|--------|------|
| Architecture design | opus | Complex decisions required |
<!-- アーキテクチャ設計 / 複雑な判断が必要 -->
| Security review | opus | Strict analysis required |
<!-- セキュリティレビュー / 厳密な分析が必要 -->
| Code review | sonnet | Good balance |
<!-- コードレビュー / バランスが良い -->
| Test implementation | sonnet | Fast, sufficient quality |
<!-- テスト実装 / 高速・十分な品質 -->
| Bug fixing | sonnet | Fast, sufficient quality |
<!-- バグ修正 / 高速・十分な品質 -->
| Code cleanup | sonnet | Fast, sufficient quality |
<!-- コードクリーンアップ / 高速・十分な品質 -->
| Simple edits | haiku | Very fast, low cost |
<!-- 簡単な編集 / 非常に高速・低コスト -->

### Cost Optimization
<!-- コスト最適化 -->

```
Low complexity  → haiku/sonnet (fast, low cost)
<!-- 複雑度低 / 高速・低コスト -->
High complexity → opus (high quality, slightly slower)
<!-- 複雑度高 / 高品質・やや遅い -->

Basic policy: Use sonnet/haiku when sufficient, opus for critical decisions
<!-- 基本方針：十分な場合はsonnet/haikuを使い、重要な判断にはopus -->
```

## Performance Metrics
<!-- パフォーマンスメトリクス -->

### Metrics to Measure
<!-- 測定項目 -->

| Metric | Target | Measurement Method |
<!-- メトリクス / 目標値 / 測定方法 -->
|-----------|--------|---------|
| Context efficiency | ≥ 140k tokens available | Session monitoring |
<!-- コンテキスト効率 / 利用可能 / セッション監視 -->
| File read time | < 5 sec per file | Tool execution log |
<!-- ファイル読み込み時間 / ファイルあたり / ツール実行ログ -->
| Search time | < 10 sec | Tool execution log |
<!-- 検索時間 / ツール実行ログ -->
| Test execution time | < 30 sec | npm test output |
<!-- テスト実行時間 -->
| Build time | < 60 sec | Build log |
<!-- ビルド時間 / ビルドログ -->

### Regular Monitoring
<!-- 定期監視 -->

**Weekly checks:**
<!-- 週次チェック -->
- [ ] Context window usage patterns
<!-- コンテキストウィンドウ使用パターン -->
- [ ] Average task execution time
<!-- 平均タスク実行時間 -->
- [ ] Test execution speed
<!-- テスト実行速度 -->
- [ ] Build time trends
<!-- ビルド時間のトレンド -->

When improvement is needed:
<!-- 改善が必要な場合 -->
1. Reduce number of files read simultaneously
<!-- 同時に読み込むファイル数を削減 -->
2. Optimize search patterns (more specific)
<!-- 検索パターンを最適化（より具体的に） -->
3. Use agent delegation for complex tasks
<!-- 複雑なタスクにはエージェント委任を使用 -->
4. Enable test caching and parallel execution
<!-- テストキャッシングと並列実行を有効化 -->

## WordPress-Specific Optimization
<!-- WordPress固有の最適化 -->

### File Reading Strategy
<!-- ファイル読み込み戦略 -->

**WordPress files can be large. Read strategically.**
<!-- WordPressファイルは大きい場合がある。戦略的に読み込む。 -->

```bash
# ✅ Good: Search first, then read
<!-- まず検索、その後読み込み -->
Grep('add_action', { glob: 'functions.php', output_mode: 'content', '-n': true });
# Then read specific lines based on results
<!-- 結果に基づいて特定行を読む -->

# ❌ Bad: Read entire functions.php blindly
<!-- functions.php全体を盲目的に読む -->
Read('functions.php'); // Could be 5000+ lines
```

### Theme File Organization
<!-- テーマファイルの構成 -->

**Understand which files are likely to contain what you need.**
<!-- 必要なものがどのファイルにある可能性が高いかを理解する。 -->

- `functions.php` - Main logic, hooks, custom functions
<!-- メインロジック、フック、カスタム関数 -->
- `template-parts/` - Reusable template components
<!-- 再利用可能なテンプレートコンポーネント -->
- `inc/` - Organized function includes
<!-- 整理された関数インクルード -->

## Best Practices
<!-- ベストプラクティス -->

- **Measure First**: Measure current state before optimization
<!-- 最適化前に現状を測定 -->
- **Optimize Bottlenecks**: Improve bottlenecks first
<!-- ボトルネックから優先的に改善 -->
- **Keep It Simple**: Avoid excessive optimization
<!-- 過度な最適化は避ける -->
- **Monitor Continuously**: Regularly check metrics
<!-- 定期的にメトリクスを確認 -->
- **Balance Quality & Speed**: Optimize within limits that don't sacrifice quality
<!-- 品質を犠牲にしない範囲で高速化 -->

## Related
<!-- 関連 -->

- `prompt/instructions/autonomous-execution.md` - Agent delegation rules
<!-- エージェント委任ルール -->
- `prompt/instructions/core.md` - Core work principles
<!-- コア作業原則 -->
