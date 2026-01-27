---
applyTo: "**"
---

# Auto Agent Trigger Rules (自動エージェント起動ルール)

## Purpose (目的)
<!-- タスクの複雑さに応じて、自動的に専門エージェントを起動し、効率的なタスク処理を実現する。 -->
Automatically launch specialized agents based on task complexity to achieve efficient task processing.

---

## Core Principle (核心原則)

**Complex tasks should be delegated to specialized agents WITHOUT requiring explicit user permission.**
<!-- 複雑なタスクは、明示的なユーザー許可なしで専門エージェントに委任すること。 -->

**CRITICAL**: When trigger keywords are detected, **automatically launch agents WITHOUT asking user confirmation**.
<!-- 重要: Triggerキーワードが検出された場合、ユーザー確認なしで自動的にエージェントを起動すること。 -->

---

## Trigger Conditions (起動条件)

### 1. Planning Agent (`planner.md`)

**Trigger Keywords (起動キーワード)**:
- 「計画」「設計」「アーキテクチャ」
- 「実装計画」「タスク分解」
- "plan", "planning", "architecture", "design"

**Auto-invoke when**:
<!-- 以下の場合に自動起動 -->
- User mentions "実装計画を立てて" / "how to implement..."
- User requests "/plan" command
- 3+ steps required for task completion
<!-- 3ステップ以上必要なタスク -->
- Multiple files/modules need to be modified
<!-- 複数ファイル・モジュールの修正が必要 -->

**WordPress-specific triggers**:
<!-- WordPress特化の起動条件 -->
- New custom post type implementation
<!-- カスタム投稿タイプの実装 -->
- Theme customization planning
<!-- テーマカスタマイズの計画 -->
- Plugin architecture design
<!-- プラグインアーキテクチャ設計 -->

**Example**:
```
User: 「製品カタログ機能の実装計画を立てて」
→ Planner agent auto-launches
```

---

### 2. Security Reviewer (`security-reviewer.md`)

**Trigger Keywords (起動キーワード)**:
- 「フォーム」「送信」「AJAX」「REST API」
- 「セキュリティ」「脆弱性」「OWASP」
- "form", "security", "vulnerability", "AJAX", "REST"

**Auto-invoke when**:
<!-- 以下の場合に自動起動 -->
- Form processing implementation (Contact Form 7, custom forms)
<!-- フォーム処理の実装 -->
- AJAX handler creation
<!-- AJAXハンドラーの作成 -->
- REST API endpoint creation
<!-- REST APIエンドポイントの作成 -->
- Database operations with user input
<!-- ユーザー入力を伴うデータベース操作 -->
- Admin panel functionality
<!-- 管理画面機能 -->
- "/security-check" command
<!-- /security-checkコマンド -->

**WordPress-specific triggers**:
<!-- WordPress特化の起動条件 -->
- Nonce verification required
<!-- Nonce検証が必要 -->
- Capability checks required
<!-- ケイパビリティチェックが必要 -->
- Escaping functions needed (esc_html, esc_attr, esc_url)
<!-- エスケープ関数が必要 -->
- SQL query with user input ($wpdb->prepare())
<!-- ユーザー入力を伴うSQLクエリ -->

**Example**:
```
User: 「お問い合わせフォームにAJAX処理を追加して」
→ Security Reviewer agent auto-launches
→ Checks: Nonce verification, escaping, capability check
```

---

### 3. TDD Guide (`tdd-guide.md`)

**Trigger Keywords (起動キーワード)**:
- 「テスト」「E2E」「Playwright」
- 「TDD」「テスト駆動」「テストファースト」
- "test", "TDD", "E2E", "Playwright"

**Auto-invoke when**:
<!-- 以下の場合に自動起動 -->
- New feature implementation (tests required)
<!-- 新機能実装（テスト必須） -->
- Bug fix (reproduction test required)
<!-- バグ修正（再現テスト必須） -->
- "/tdd" command
<!-- /tddコマンド -->
- Test-first development instruction
<!-- テストファースト開発の指示 -->

**WordPress-specific triggers**:
<!-- WordPress特化の起動条件 -->
- Public-facing page implementation (E2E test required)
<!-- 公開ページの実装（E2Eテスト必須） -->
- Form submission flow (E2E test required)
<!-- フォーム送信フロー（E2Eテスト必須） -->
- Navigation/menu modification (E2E test required)
<!-- ナビゲーション・メニュー修正（E2Eテスト必須） -->

**Example**:
```
User: 「製品詳細ページのテンプレートを作成して」
→ TDD Guide agent auto-launches
→ Creates: Playwright E2E test for product detail page
```

---

### 4. Code Reviewer (`code-reviewer.md`)

**Trigger Keywords (起動キーワード)**:
- 「レビュー」「振り返り」「自己レビュー」
- 「品質チェック」「コードレビュー」
- "review", "quality check", "code review"

**Auto-invoke when**:
<!-- 以下の場合に自動起動 -->
- Code modification completed
<!-- コード変更完了後 -->
- PR creation requested
<!-- PR作成の要求 -->
- "/multi-review" command
<!-- /multi-reviewコマンド -->
- Quality verification needed
<!-- 品質確認が必要 -->

**WordPress-specific triggers**:
<!-- WordPress特化の起動条件 -->
- functions.php modification
<!-- functions.phpの修正 -->
- Template file creation/modification
<!-- テンプレートファイルの作成・修正 -->
- Custom plugin development
<!-- カスタムプラグイン開発 -->

**Example**:
```
User: 「functions.phpにフックを追加したので、レビューして」
→ Code Reviewer agent auto-launches
→ Checks: Hook usage, performance, security, WordPress Coding Standards
```

---

### 5. Refactor Cleaner (`refactor-cleaner.md`)

**Trigger Keywords (起動キーワード)**:
- 「クリーンアップ」「リファクタリング」「整理」
- 「不要コード」「デッドコード」「削除」
- "cleanup", "refactor", "dead code", "remove unused"

**Auto-invoke when**:
<!-- 以下の場合に自動起動 -->
- Dead code or unused code exists
<!-- デッドコード・不要コードの存在 -->
- Code organization needed
<!-- コード整理の必要性 -->
- "/refactor-clean" command
<!-- /refactor-cleanコマンド -->

**WordPress-specific triggers**:
<!-- WordPress特化の起動条件 -->
- Unused template parts
<!-- 未使用のテンプレートパーツ -->
- Unused functions in functions.php
<!-- functions.php内の未使用関数 -->
- Unused CSS classes in SCSS
<!-- SCSS内の未使用CSSクラス -->

**Example**:
```
User: 「未使用のテンプレートファイルを削除して」
→ Refactor Cleaner agent auto-launches
→ Analyzes: Template hierarchy, get_template_part() usage
```

---

### 6. Build Error Resolver (`build-error-resolver.md`)

**Trigger Keywords (起動キーワード)**:
- 「エラー」「ビルドエラー」「失敗」
- 「動かない」「エラーが出る」
- "error", "build error", "failure", "doesn't work"

**Auto-invoke when**:
<!-- 以下の場合に自動起動 -->
- Build command fails
<!-- ビルドコマンドの失敗 -->
- Test execution fails
<!-- テスト実行の失敗 -->
- Fatal error occurs
<!-- 致命的エラーの発生 -->

**WordPress-specific triggers**:
<!-- WordPress特化の起動条件 -->
- PHP fatal error
<!-- PHP致命的エラー -->
- WordPress hook execution error
<!-- WordPressフック実行エラー -->
- Template file not found error
<!-- テンプレートファイルが見つからないエラー -->

**Example**:
```
User: 「テストが失敗してる」
→ Build Error Resolver agent auto-launches
→ Analyzes: Test logs, identifies root cause, proposes fix
```

---

### 7. Architect (`architect.md`)

**Trigger Keywords (起動キーワード)**:
- 「アーキテクチャ」「設計判断」「技術選定」
- 「どう実装すべきか」「ベストプラクティス」
- "architecture", "design decision", "best practice"

**Auto-invoke when**:
<!-- 以下の場合に自動起動 -->
- Architectural decision required
<!-- アーキテクチャ判断が必要 -->
- Multiple implementation approaches exist
<!-- 複数の実装アプローチが存在 -->
- Best practice consultation needed
<!-- ベストプラクティスの相談が必要 -->

**WordPress-specific triggers**:
<!-- WordPress特化の起動条件 -->
- Custom post type vs Taxonomy decision
<!-- カスタム投稿タイプ vs タクソノミーの判断 -->
- Theme vs Plugin implementation decision
<!-- テーマ vs プラグイン実装の判断 -->
- Shortcode vs Gutenberg block decision
<!-- ショートコード vs Gutenbergブロックの判断 -->

**Example**:
```
User: 「製品をカスタム投稿タイプにすべきか、通常の投稿でタクソノミー管理すべきか？」
→ Architect agent auto-launches
→ Analyzes: Requirements, provides pros/cons, recommends approach
```

---

## Implementation Rules (実装ルール)

### 1. Silent Invocation (無言起動)
<!-- エージェント起動は自動・無言で実行 -->
Agent invocation should be automatic and silent. No need to announce "I'm launching X agent".

**Instead**:
- ❌ "I'm going to launch the Security Reviewer agent to check for vulnerabilities."
- ✅ (Just launch the agent silently and report results)

### 2. Context Passing (コンテキスト渡し)
<!-- 必要な情報を全てエージェントに渡す -->
Pass all necessary information to the agent:
- User's original request
<!-- ユーザーの元のリクエスト -->
- Current task context
<!-- 現在のタスクコンテキスト -->
- Related files/code
<!-- 関連ファイル・コード -->
- Constraints/requirements
<!-- 制約・要件 -->

### 3. Result Integration (結果統合)
<!-- エージェントの結果を統合し、ユーザーに報告 -->
Integrate agent results and report to user:
- Summarize agent findings
<!-- エージェントの発見内容を要約 -->
- Highlight critical issues
<!-- 重大な問題を強調 -->
- Provide actionable next steps
<!-- 実行可能な次のステップを提供 -->

### 4. User Override (ユーザー優先)
<!-- ユーザー指示を最優先 -->
User instructions always override auto-trigger:
- If user explicitly says "Don't use agents", respect that
<!-- ユーザーが明示的に「エージェントを使うな」と言った場合、それを尊重 -->
- If user wants to do something manually, allow it
<!-- ユーザーが手動で何かをしたい場合、許可 -->

---

## WordPress-Specific Agent Trigger Matrix (WordPress特化エージェント起動マトリクス)

| User Request (ユーザーリクエスト) | Auto-Launched Agent | Reason (理由) |
|-----------------------------------|---------------------|---------------|
| 「お問い合わせフォームのカスタマイズ」 | Security Reviewer | Form handling requires Nonce, escaping |
| 「製品カタログ機能の追加」 | Planner | Multi-step feature, needs planning |
| 「検索機能の実装」 | Planner + Security Reviewer | Complex feature + user input handling |
| 「テーマのfunctions.php修正」 | Code Reviewer | functions.php is critical, needs review |
| 「REST APIエンドポイント追加」 | Security Reviewer | API requires authentication, validation |
| 「カスタム投稿タイプ作成」 | Architect | Design decision: post type vs taxonomy |
| 「E2Eテスト追加」 | TDD Guide | Test implementation |
| 「未使用テンプレート削除」 | Refactor Cleaner | Dead code removal |
| 「PHPエラーが出る」 | Build Error Resolver | Error resolution |

---

## Exclusions (除外条件)

**Do NOT auto-launch agents when**:
<!-- 以下の場合はエージェントを自動起動しない -->
- User explicitly requests manual work
<!-- ユーザーが明示的に手動作業を要求 -->
- Simple, single-step tasks (e.g., "Fix typo in header.php")
<!-- シンプルな単一ステップタスク -->
- User is already working with an agent
<!-- ユーザーが既にエージェントと作業中 -->
- Task is trivial (< 2 steps)
<!-- タスクが些細（2ステップ未満） -->

---

## Best Practices (ベストプラクティス)

1. **Anticipate needs**: Launch agents proactively based on task complexity
<!-- ニーズを予測: タスクの複雑さに基づいて積極的にエージェントを起動 -->
2. **Multiple agents**: For complex tasks, launch multiple agents in parallel
<!-- 複数エージェント: 複雑なタスクでは複数エージェントを並列起動 -->
3. **Summarize results**: Don't dump raw agent output; summarize and integrate
<!-- 結果を要約: エージェントの生出力を投げるのではなく、要約・統合 -->
4. **Trust agent output**: Agents are specialized; trust their expertise
<!-- エージェント出力を信頼: エージェントは専門化されている、専門性を信頼 -->

---

## Examples (実例)

### Example 1: Auto Security Review
```
User: 「お問い合わせフォームにカスタムフィールドを追加して」

→ Auto-launches Security Reviewer agent
→ Agent checks:
  - Nonce verification: wp_nonce_field()
  - Capability check: current_user_can()
  - Escaping: esc_html(), esc_attr()
  - SQL injection: $wpdb->prepare()
→ Reports findings + implements secure code
```

### Example 2: Auto Planning
```
User: 「製品検索機能を実装して」

→ Auto-launches Planner agent
→ Agent breaks down:
  1. Create search form template
  2. Implement AJAX handler
  3. Add search query logic
  4. Create results template
  5. Add Playwright E2E test
→ Provides detailed implementation plan
```

### Example 3: Multi-Agent Collaboration
```
User: 「新しいカスタム投稿タイプ『製品』を作成して、E2Eテストも追加」

→ Auto-launches:
  - Planner: Implementation planning
  - Architect: Design decisions (post type structure)
  - Security Reviewer: Capability checks, escaping
  - TDD Guide: E2E test implementation
→ Agents collaborate, provide comprehensive solution
```

---

## Related Files (関連ファイル)

- `prompt/agents/planner.md` - Planning Agent definition
- `prompt/agents/security-reviewer.md` - Security Reviewer Agent definition
- `prompt/agents/tdd-guide.md` - TDD Guide Agent definition
- `prompt/agents/code-reviewer.md` - Code Reviewer Agent definition
- `prompt/agents/refactor-cleaner.md` - Refactor Cleaner Agent definition
- `prompt/agents/build-error-resolver.md` - Build Error Resolver Agent definition
- `prompt/agents/architect.md` - Architect Agent definition
- `prompt/instructions/autonomous-execution.md` - Autonomous Execution Protocol
