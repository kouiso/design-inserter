# 品質・実装ルール (Quality & Implementation Rules)
<!-- Quality & Implementation Rules -->

## 1. 基本方針
<!-- Basic Policy -->

- **No compromise**: Sharp eye for even smallest details, always pursue best practices
<!-- 妥協禁止: 最小の詳細にも鋭い目、常にベストプラクティス追求 -->
- **Respect existing code**: Completely imitate style and design philosophy, propose→get approval→implement when deviating
<!-- 既存コード尊重: スタイル・設計思想を完全模倣、逸脱時は提案→許可→実装 -->
- **Out-of-scope tasks**: Proposal→get approval required for work outside approver's instructions
<!-- 範囲外タスク: 承認者の指示外作業は提案→許可取得必須 -->
- **Active investigation**: Actively use web_search, avoid assumptions and guessing
<!-- 積極的調査: web_search積極活用、思い込み・推測禁止 -->

## 2. リポジトリ調査
<!-- Repository Investigation -->

- **Required before work**: Complete grasp of all files, directories, documentation (including linked content)
<!-- 作業前必須: 全ファイル・ディレクトリ・ドキュメント（リンク先含む）完全把握 -->
- **Question restriction**: Only unknowns remaining after source code investigation
<!-- 質問制限: ソースコード調査後の不明点のみ -->
- **Immediate investigation of unknowns**: Investigate immediately with web_search without asking permission
<!-- 不明点即調査: 許可を求めずweb_searchで即座調査 -->

## 3. 基本記述ルール
<!-- Basic Writing Rules -->

1. **Japanese required**: All source code, comments, documentation
<!-- 日本語記述必須: ソースコード・コメント・ドキュメント全て -->
2. **Comment standard**: Only explain implementation reasons ("Why" only, "What" forbidden)
<!-- コメント基準: 実装理由説明のみ（「Why」のみ、「What」禁止） -->
3. **Self-explanatory code**: Avoid adding comments
<!-- 自明コード: コメント追加回避 -->
4. **Complex parts**: Focus on explaining intent and reasons
<!-- 複雑部分: 意図・理由説明集中 -->
5. **Comments/JSDoc addition forbidden**: Unless explicitly instructed by user
<!-- コメント・JSDoc追加禁止: ユーザーから明示的に指示されない限り追加禁止 -->

## 4. 品質基準
<!-- Quality Standards -->

- Always adhere to WordPress best practices
<!-- WordPressベストプラクティス常時遵守 -->
- No compromise on quality and security
<!-- 品質・セキュリティ妥協なし -->
- Avoid hallucinations and false information, fact-based answers
<!-- 幻覚・虚偽情報回避、事実ベース回答 -->
- Understand user intent, exceed expectations
<!-- ユーザー意図理解、期待を超える成果 -->

## 5. 作業プロセス
<!-- Work Process -->

### 指示分析・計画
<!-- Instruction Analysis/Planning -->

- Summarize main tasks, confirm techniques within constraints
<!-- 主要タスク要約、制約内技術確認 -->
- Identify main requirements and potential problems, list specific steps
<!-- 主要要件・潜在問題特定、具体ステップリストアップ -->
- Determine optimal order, consider necessary tools and resources
<!-- 最適順序決定、必要ツール・リソース検討 -->

### タスク実行
<!-- Task Execution -->

- Execute each step sequentially, provide brief progress upon completion
<!-- 各ステップ順次実行、完了時簡潔進捗提供 -->
- Report problems/questions immediately, propose solutions
<!-- 問題・質問即時報告、解決策提案 -->
- **Unknowns/suspicious implementations**: Required confirmation with web_search (no permission needed, execute proactively)
<!-- 不明点・怪しい実装: web_search必須確認（許可不要、積極実行） -->

### 品質管理
<!-- Quality Management -->

- Quickly verify each task result, immediately fix errors/inconsistencies
<!-- 各タスク結果迅速検証、エラー・不整合即修正 -->
- Confirm and share command execution standard output
<!-- コマンド実行標準出力確認・共有 -->
- **On work completion**: Execute tests (when test code exists)
<!-- 作業完了時: テスト実行（テストコード存在時） -->
- **Required execution of test commands**: Continue until all errors resolved
<!-- テストコマンド必須実行: 全エラー解消まで継続 -->
- **Error resolution**: Don't give up, solve fundamentally
<!-- エラー解決: 諦めず根本解決 -->

### 最終確認
<!-- Final Confirmation -->

- Evaluate overall deliverables when all tasks completed
<!-- 全タスク完了時成果物全体評価 -->
- Compare with original instructions, adjust as needed
<!-- 元指示比較、必要時調整 -->

## 6. テストヘルスチェック（必須実行）
<!-- Test Health Check (Required Execution) -->

**Definition**: `npm run test`

**Required self-execution after task completion**:
<!-- タスク完了後必須自主実行 -->

- `npm run test`: Execute all E2E tests
<!-- 全E2Eテスト実行 -->

**Task incomplete until all succeed. When errors occur, solve root cause and pass all checks.**
<!-- 全成功までタスク未完了。エラー発生時根本原因解決、全チェック通過必須。 -->

## 7. 作業時注意事項
<!-- Work Precautions -->

1. **Structure/naming convention organization**: Only when functional changes unnecessary
<!-- 構造・命名規則整理: 機能変更不要時限定 -->
2. **Avoid changing existing behavior**: Absolutely prevent regression
<!-- 既存振舞変更回避: デグレ絶対防止 -->
3. **Import path fixes**: Execute carefully
<!-- インポートパス修正: 慎重実施 -->
4. **Prioritize design patterns**: Reference original directory structure, naming conventions, module division
<!-- 設計パターン優先: 参照元ディレクトリ構造・命名規則・モジュール分割 -->
5. **Prioritize existing file utilization**: Use existing rather than create new
<!-- 既存ファイル活用優先: 新規作成より既存活用 -->
6. **Error resolution**: Prioritize reference design patterns
<!-- エラー解決: 参照元設計パターン優先 -->
7. **Unused variable errors**: Underscore forbidden, resolve by deletion
<!-- 未使用変数エラー: アンダーバー禁止、削除解決 -->
8. **Test code**: Proactively add where missing (part of original task, don't add independent tasks without permission)
<!-- テストコード: 不存在箇所積極追加（本来タスク一部、独立タスク勝手追加禁止） -->
9. **Unauthorized commonization**: Forbidden
<!-- 指示外共通化: 実施禁止 -->
10. **Unknown implementations/errors**: Required investigation with web_search
<!-- 不明実装・エラー: web_search必須調査 -->
11. **Gradual refactoring cautions**:
<!-- 段階的リファクタリング注意 -->
    - Delete unused type definitions/functions immediately
<!-- 未使用型定義・関数即削除 -->
    - Update all reference locations simultaneously when changing function names
<!-- 関数名変更時全参照箇所同時更新 -->
    - Delete duplicate function definitions immediately upon discovery
<!-- 重複関数定義発見次第削除 -->
    - No leaving unused code in intermediate states
<!-- 中間状態未使用コード残存禁止 -->

## 8. 成果物URLの即時共有義務
<!-- Obligation to Immediately Share Deliverable URLs -->

**When PR, Issue, branch, etc. is created, always share URL along with completion report.**
<!-- PR・Issue・ブランチ等を作成したら、完了報告と同時にURLを必ず共有すること。 -->

## 9. 作業ミス時の即座クリーンアップ義務
<!-- Obligation for Immediate Cleanup on Work Mistakes -->

**Branches, files, commits created by mistake should be deleted/fixed immediately when the mistake is noticed.**
<!-- 間違えて作成したブランチ・ファイル・コミットは、ミスに気づいた時点で即座に削除・修正すること。 -->

## 10. 完全動作検証の絶対義務
<!-- Absolute Obligation of Complete Operation Verification -->

### 作業開始前の必須調査
<!-- Required Investigation Before Starting Work -->

1. **Complete grasp of entire repository**: Read all directory structure, all source code, all documentation
<!-- リポジトリ全体の完全把握: 全ディレクトリ構造、全ソースコード、全ドキュメント熟読 -->
2. **Absolute principle of documentation priority**: Complete understanding of README, CONTRIBUTING, ARCHITECTURE, all files under doc. Implementation ignoring what's written in documentation is dereliction of duty.
<!-- ドキュメント優先の絶対原則: README, CONTRIBUTING, ARCHITECTURE, doc配下の全ファイル完全理解。ドキュメントに書かれていることを無視した実装は職務放棄。 -->
3. **Complete understanding of existing implementation patterns**: Check implementation methods of similar features, check test code
<!-- 既存実装パターンの完全理解: 類似機能の実装方法確認、テストコード確認 -->

### 完全検証の定義
<!-- Definition of Complete Verification -->

**"Verified operation" is only allowed when all of the following are executed:**
<!-- 「動作確認しました」は以下の全てを実行した場合のみ許される -->

1. Normal case complete confirmation
<!-- 正常系の完全確認 -->
2. Actual response confirmation
<!-- 実際のレスポンス確認 -->
3. Log confirmation
<!-- ログ確認 -->
4. Abnormal case/error handling confirmation
<!-- 異常系・エラーハンドリング確認 -->
5. Complete execution of tests
<!-- テストの完全実行 -->

## 11. 画像・スクリーンショット分析の原則
<!-- Principles for Image/Screenshot Analysis -->

**When users provide screenshots or images**, follow these principles:
<!-- ユーザーがスクリーンショット・画像を提供した場合、以下の原則に従う -->

1. **Accurate visual comprehension**: Understand user intent precisely from visual information
<!-- 視覚的情報の正確な理解: 視覚情報からユーザー意図を正確に把握 -->
2. **Swift implementation**: Identify relevant files immediately, implement changes without delay
<!-- 迅速な実装: 該当ファイルを即座に特定、遅延なく変更実施 -->
3. **Minimal changes**: Only implement necessary changes, avoid unnecessary code additions
<!-- 最小限の変更: 必要な変更のみ実施、不要なコード追加回避 -->
4. **Complete execution**: Automatically execute commit & push after implementation
<!-- 完全実行: 実装後のコミット＆プッシュを自動実行 -->
5. **Structure understanding**: Understand existing code structure (e.g., PC vs mobile differences), implement appropriate changes
<!-- 構造理解: 既存コード構造（例: PC・スマホの違い）を理解、適切な変更実施 -->
