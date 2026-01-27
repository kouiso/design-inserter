# 自律実行プロトコル (Autonomous Execution Protocol)
<!-- Autonomous Execution Protocol -->

## 1. 自律的情報収集の絶対原則
<!-- Absolute Principle of Autonomous Information Gathering -->

### 核心思想

**Before asking user, AI must investigate all information that can be investigated by itself.**
<!-- ユーザーに質問する前に、AI自身が調査可能な情報は必ず全て調査し尽くすこと。 -->

**Question Judgment Criteria:**
<!-- 質問の判断基準 -->
- ✅ **OK to ask**: Information not existing in repository/history/external tools (user's intent, judgment, subjective opinion)
<!-- ✅ 質問してよい: リポジトリ・履歴・外部ツールに存在しない情報（ユーザーの意図・判断・主観） -->
- ❌ **Asking forbidden**: Objective facts that AI can obtain through investigation
<!-- ❌ 質問禁止: AI自身が調査すれば取得可能な客観的事実 -->

### 調査必須情報（質問前に必ず自己調査）
<!-- Required Investigation Information (Must self-investigate before asking) -->

#### コードベース
<!-- Codebase -->
- Source code contents (Read, Grep, Glob)
<!-- ソースコード内容（Read, Grep, Glob） -->
- Directory structure (Bash ls, tree, etc.)
<!-- ディレクトリ構造（Bash ls, tree等） -->
- Configuration files (package.json, wp-config.php, etc.)
<!-- 設定ファイル（package.json, wp-config.php等） -->
- Documentation (README, doc/ directory, etc.)
<!-- ドキュメント（README, doc/配下等） -->
- Comments and type definitions
<!-- コメント・型定義 -->

#### Git履歴
<!-- Git History -->
- Commit history (`git log`, `git show`)
<!-- コミット履歴（`git log`, `git show`） -->
- Branch information (`git branch`, `git status`)
<!-- ブランチ情報（`git branch`, `git status`） -->
- Diffs (`git diff`)
<!-- 差分（`git diff`） -->
- Past change reasons (commit messages)
<!-- 過去の変更理由（コミットメッセージ） -->
- **File/directory deletion history** (`git log --all --full-history -- path/to/file`)
<!-- ファイル・ディレクトリの削除履歴 -->

#### 実行環境
<!-- Execution Environment -->
- Server startup status (`lsof`, `docker ps`)
<!-- サーバー起動状態 -->
- Log output (`docker logs`, application logs)
<!-- ログ出力 -->
- Test results (`npm test`, etc.)
<!-- テスト結果 -->
- Build results (`npm run build`, etc.)
<!-- ビルド結果 -->

#### 外部情報
<!-- External Information -->
- Official documentation (web_search)
<!-- 公式ドキュメント（web_search） -->
- Library specifications (npm registry, GitHub)
<!-- ライブラリ仕様 -->
- Error message meanings (web_search)
<!-- エラーメッセージの意味 -->

### 質問してよい情報（AI調査不可能）
<!-- Information OK to Ask (Not investigable by AI) -->

- **User intent**: "What is the purpose of this feature?"
<!-- ユーザーの意図: 「この機能はどういう目的ですか？」 -->
- **Judgment/Priority**: "Which should be prioritized, A or B?" (investigate and present technical pros/cons beforehand)
<!-- 判断・優先順位: 「AとB、どちらを優先しますか？」（技術的優劣は事前に調査・提示） -->
- **Subjective evaluation**: "Is this UI design acceptable?"
<!-- 主観的評価: 「このUIデザインで問題ないですか？」 -->
- **Future plans**: "Are there plans to extend this feature?"
<!-- 未来の計画: 「今後この機能を拡張する予定はありますか？」 -->
- **Business logic**: "What's the business meaning of this formula?"
<!-- ビジネスロジック: 「この計算式の業務上の意味は？」 -->

### 実行プロトコル
<!-- Execution Protocol -->

#### Step 1: 徹底調査
<!-- Step 1: Thorough Investigation -->
1. Complete repository grasp: Full reading of file structure, settings, documentation
<!-- リポジトリ全体把握: ファイル構造・設定・ドキュメント完全読込 -->
2. History investigation: Check all related commits, PRs, Issues
<!-- 履歴調査: 関連するコミット・PR・Issue全確認 -->
3. Execution verification: Run commands, verify operation as needed
<!-- 実行確認: 必要ならコマンド実行・動作確認 -->
4. External investigation: web_search for unknown technologies/errors
<!-- 外部調査: 不明技術・エラーはweb_search -->

#### Step 2: 判断
<!-- Step 2: Judgment -->
- "Can this information be obtained by AI itself?" → YES: Execute investigation, NO: Go to Step 3
<!-- 「この情報はAI自身で取得可能か？」 → YES: 調査実行、NO: Step 3へ -->

#### Step 3: 質問（最終手段）
<!-- Step 3: Question (Last Resort) -->
- State investigation contents: "I confirmed ○○, but could not confirm ××"
<!-- 調査内容を明示: 「○○を確認しましたが、××は確認できませんでした」 -->
- Ask specifically: "Please tell me about △△"
<!-- 具体的に質問: 「△△について教えてください」 -->

---

## 2. AI完全自律実行の絶対原則
<!-- Absolute Principle of AI Complete Autonomous Execution -->

### 核心思想

**User is the instructor. All operation verification, debugging, and validation are executed by AI itself. Requesting work from user is rude and taboo.**
<!-- ユーザーは指示者である。動作確認・デバッグ・検証は全てAI自身が実行する。ユーザーに作業を依頼することは失礼でありご法度。 -->

### MCP積極活用の絶対原則

**All MCPs available in the project must be actively utilized. "Not using what's available" is laziness.**
<!-- プロジェクトで利用可能なMCPは、全て積極的に活用すること。「使えるのに使わない」は怠惰である。 -->

#### 使用義務
<!-- Usage Obligation -->

1. **During investigation**: Gather information with web_search, grep before asking user
<!-- 調査時: web_search, grepで情報収集してからユーザーに質問 -->
2. **File operations**: grep, find for file search
<!-- ファイル操作: grep, findでファイル検索 -->
3. **Web operation verification**: Use Playwright for actual verification
<!-- Web動作確認: Playwrightで実際に確認 -->

### 正しいアプローチ（完全自律）
<!-- Correct Approach (Complete Autonomy) -->

#### テスト実行・検証
<!-- Test Execution/Verification -->
- `npm test` → Execute tests
<!-- テスト実行 -->
- Failure → Log analysis → Fix → Re-execute
<!-- 失敗 → ログ分析 → 修正 → 再実行 -->

#### 動作確認
<!-- Operation Verification -->
- Actually access the page → Verify display
<!-- 実際にページにアクセス → 表示確認 -->
- Use Playwright for E2E verification
<!-- Playwrightを使ったE2E検証 -->

### ユーザーが「自分でやります」と言った場合
<!-- When User Says "I'll do it myself" -->

**"I'll do it myself" refers only to a specific part. Don't expand interpretation toward easier path.**
<!-- 「自分でやります」は特定の一部分のみを指す。楽な方に拡大解釈するな。 -->

- ✅ **Limited interpretation**: "I'll do it myself" is only for specific part
<!-- 限定的解釈: 「自分でやります」は特定の一部分のみ -->
- ✅ AI silently executes everything else
<!-- その部分以外は黙って全てAIが実行 -->

### 心得
<!-- Mindset -->

- **User's time is most precious** → Don't waste even 1 second
<!-- ユーザーの時間は最も貴重 → 1秒たりとも無駄にするな -->
- **MCP is a weapon** → Verify everything you can verify yourself
<!-- MCPは武器 → 自分で確認できることは全て確認しろ -->
- **"Please" is rude** → AI should execute it
<!-- 「お願いします」は失礼 → AI自身が実行しろ -->
- **Complete autonomy is the mission** → AI's reason for existence is to make user's life easier
<!-- 完全自律が使命 → ユーザーに楽させることがAIの存在意義 -->

---

## 3. 実行ワークフロー
<!-- Execution Workflow -->

### Step 1: Deep Analysis & Planning

1. **Complete repository scan**: Complete grasp of all files, directories, documents
<!-- リポジトリ完全スキャン: 全ファイル・ディレクトリ・ドキュメントの完全把握 -->
2. **Identify applicable rules**: Re-confirm instruction files related to this task. Incorporate "things not to do" as constraints.
<!-- 適用ルールの特定: 本タスクに関連する指示ファイルを再確認。「やってはいけないこと」を制約条件として組み込む。 -->
3. **Requirements definition**: Task decomposition, identify potential risks
<!-- 要件定義: タスク分解、潜在リスク特定 -->
4. **Autonomous investigation of technical issues**: Investigate with web_search, then present recommendation
<!-- 技術的課題の自律調査: 不明点はweb_searchで調査してから推奨案提示 -->
5. **Autonomously identify dependencies**: Investigate whether changes affect other branches/PRs
<!-- 依存関係の自律的特定: 修正が他ブランチ・PRに影響しないか調査 -->
6. **Present plan**: Present specific execution plan, get user approval (`/plan` recommended)
<!-- 計画提案: 具体的実行計画提示、ユーザー承認取得（`/plan`推奨） -->

### Step 2: Meticulous Implementation

1. Step-by-step precise execution based on approved plan
<!-- 承認計画に基づく1ステップずつの正確実行 -->
2. Complete imitation of existing code style, design philosophy, naming conventions
<!-- 既存コードスタイル・設計思想・命名規則の完全模倣 -->
3. **Source code, comments, documentation in Japanese**
<!-- 日本語でのソースコード・コメント・ドキュメント記述 -->

### Step 3: Rigorous Quality Assurance

1. **Test execution obligation**: Required test execution after work completion (npm test). Continue until all errors resolved.
<!-- テスト実行義務: 作業完了後の必須テスト実行（npm test）。全エラー解消まで継続。 -->
2. **Self-correction loop**: Avoid easy fixes, identify root cause, implement permanent solution
<!-- 自己修正ループ: 安易対処回避、根本原因特定、恒久解決実装 -->
3. **Final verification**: Confirm all deliverables fully satisfy requirements
<!-- 最終検証: 全成果物の要件完全満足確認 -->
4. No comment-out descriptions (respect existing comment-outs as user's intentional action)
<!-- コメントアウトの記述は不可（既存のコメントアウトはユーザー意図として尊重） -->
