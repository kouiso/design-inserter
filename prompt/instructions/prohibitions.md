# 絶対禁止事項 (Absolute Prohibitions)
<!-- Absolute Prohibitions -->

**Rule violations are immediate task failure. No exceptions allowed.**
<!-- ルール違反は即時タスク失敗。例外一切認めず。 -->

---

## 1. Git操作の禁止事項
<!-- Git Operation Prohibitions -->

### 1.1. `--no-verify`フラグの完全禁止

- **Target**: `git commit --no-verify`, `git push --no-verify`
<!-- 対象: git commit --no-verify, git push --no-verify -->
- **Reason**: pre-commit hook, commit-msg hook, pre-push hook are quality assurance fortresses
<!-- 理由: pre-commit hook、commit-msg hook、pre-push hookは品質保証の砦 -->
- **Solution**: Fix all errors pointed out by hooks
<!-- 対処法: hookが指摘するエラーを全て修正 -->
- **Exception**: None allowed
<!-- 例外: 一切認めず -->
- **Suggestion Also Forbidden**: Presenting the option "Commit with `--no-verify`?" itself is a serious violation
<!-- 提案も禁止: 「`--no-verify`でコミットしますか？」という選択肢の提示自体が重大な違反 -->

### 1.2. `--force`単体の完全禁止

- **Target**: `git push --force`
<!-- 対象: git push --force -->
- **Reason**: Danger of unintentionally overwriting other developers' remote branch changes
<!-- 理由: 他開発者のリモートブランチ変更を意図せず上書きする危険 -->
- **Solution**: Only `git push --force-with-lease` allowed (with safety)
<!-- 対処法: `git push --force-with-lease`のみ許可（安全装置付き） -->
- **Exception**: None allowed
<!-- 例外: 一切認めず -->

---

## 2. WordPress/PHP関連禁止事項
<!-- WordPress/PHP Prohibitions -->

### 2.1. 直接的なSQL操作の禁止

- **Target**: Direct UPDATE/DELETE with `$wpdb->query()`
<!-- 対象: `$wpdb->query()` での直接UPDATE/DELETE -->
- **Solution**: Use WordPress functions (`wp_update_post()`, `update_post_meta()`, etc.)
<!-- 対処法: WordPress関数（`wp_update_post()`, `update_post_meta()`等）を使用 -->

### 2.2. グローバル変数の乱用禁止

- **Target**: Creating custom global variables
<!-- 対象: 独自グローバル変数の作成 -->
- **Solution**: Use WordPress Hooks/Filters, class-based design
<!-- 対処法: WordPress Hooks/Filters、クラスベース設計を使用 -->

### 2.3. エスケープ忘れ禁止

- **Target**: Output without escaping
<!-- 対象: エスケープなしの出力 -->
- **Solution**: Always use `esc_html()`, `esc_attr()`, `esc_url()` for output
<!-- 対処法: 出力時は必ず `esc_html()`, `esc_attr()`, `esc_url()` を使用 -->

### 2.4. Nonce検証スキップ禁止

- **Target**: Form processing without nonce verification
<!-- 対象: Nonce検証なしのフォーム処理 -->
- **Solution**: Always use `wp_verify_nonce()` for form processing
<!-- 対処法: フォーム処理時は必ず `wp_verify_nonce()` を使用 -->

### 2.5. ケイパビリティチェック忘れ禁止

- **Target**: Admin functions without permission check
<!-- 対象: 権限チェックなしの管理機能 -->
- **Solution**: Use `current_user_can()` for admin functions
<!-- 対処法: 管理機能には `current_user_can()` を使用 -->

---

## 3. ファイル管理の禁止事項
<!-- File Management Prohibitions -->

### 3.1. バックアップ/一時ファイル作成の完全禁止

**All the following patterns are prohibited:**
<!-- 以下の全パターンを禁止 -->

- Extension-based backups: `.bak`, `.backup`, `.old`
<!-- 拡張子付きバックアップ: `.bak`, `.backup`, `.old` -->
- Prefix/Suffix: `_backup`, `_temp`, `2`, `_copy`
<!-- プレフィックス/サフィックス: `_backup`, `_temp`, `2`, `_copy` -->
- Work files: `test.php`, `temp.php`, `debug.php`, `work.php`
<!-- 作業用ファイル: `test.php`, `temp.php`, `debug.php`, `work.php` -->
- Date-stamped files: `backup_20240101.php`
<!-- 日付付きファイル: `backup_20240101.php` -->

**Delete immediately when discovered. Perform operation verification within existing test code.**
<!-- 発見時は即座に削除。動作確認は既存テストコード内で実施。 -->

### 3.2. テスト用ファイル作成禁止

- Creating temporary files for testing in the repository is strictly forbidden
<!-- リポジトリ内にテスト用の一時ファイルを作成することは厳禁 -->

---

## 4. コード品質の禁止事項
<!-- Code Quality Prohibitions -->

### 4.1. エラー隠蔽の完全禁止

- **Target**: `// @ts-ignore`, `try { ... } catch {}` (swallowing), `|| true`
<!-- 対象: `// @ts-ignore`, `try { ... } catch {}`（握りつぶし）, `|| true` -->
- **Reason**: Suppressing errors leaves root cause forever
<!-- 理由: エラーを隠蔽すると根本原因が永遠に残る -->
- **Solution**: Fix type definitions, implement error handling, solve fundamentally
<!-- 対処法: 型定義を修正し、エラーハンドリングを実装し、根本解決する -->

### 4.2. 未使用変数の放置禁止

- Underscore (`_`) avoidance forbidden
<!-- アンダースコア（`_`）回避禁止 -->
- **Required**: Resolve by deleting variable
<!-- 必須: 変数削除による解決 -->

### 4.3. コメント規約違反

- **Self-explanatory comments (What) forbidden**: `// ユーザー取得`, `{/* タイトル */}` etc.
<!-- 自明コメント（What）禁止: `// ユーザー取得`, `{/* タイトル */}` 等 -->
- **English comments forbidden**: `// TODO: implement this` → `// TODO: この処理を実装する`
<!-- 英語コメント禁止: `// TODO: implement this` → `// TODO: この処理を実装する` -->
- **JSDoc addition forbidden**: Unless explicitly instructed by user
<!-- JSDoc追加禁止: ユーザーから明示的に指示されない限り追加禁止 -->

---

## 5. 行動規範の禁止事項
<!-- Behavioral Prohibitions -->

### 5.1. ユーザーへの作業依頼（丸投げ）の完全禁止

**The following expressions are immediate task failure:**
<!-- 以下のような表現は即座にタスク失敗 -->

❌ "Please check the CI results and let me know if there are issues"
<!-- ❌ 「CIの結果を確認して、問題があれば教えてください」 -->
❌ "Please run the tests and tell me the results"
<!-- ❌ 「テストを実行して結果を教えてください」 -->
❌ "Please verify the operation"
<!-- ❌ 「動作確認をお願いします」 -->
❌ "Let me know if there are errors"
<!-- ❌ 「エラーが出たら教えてください」 -->
❌ "Please click the ○○ button" or UI operation requests
<!-- ❌ 「○○ボタンを押して」等のUI操作依頼 -->

### 5.2. 丸投げ質問の完全禁止

❌ "What should we do?"
<!-- ❌ 「どうしたらいいですか？」 -->
❌ "What shall we do?"
<!-- ❌ 「どうしましょうか？」 -->
❌ "Which method should we proceed with?"
<!-- ❌ 「どの方法で進めますか？」 -->
❌ "Please decide" or "Please choose"
<!-- ❌ 「決めてください」「選んでください」 -->

✅ Investigate → List options → Analyze pros/cons → Present recommendation → "May I proceed with this approach?"
<!-- ✅ 調査→選択肢洗出→メリデメ分析→推奨案提示→「この方針で進めてよろしいですか？」 -->

### 5.3. 推測・憶測の禁止

❌ "It should probably work"
<!-- ❌ 「おそらく動くはずです」 -->
❌ "The settings seem to be correct"
<!-- ❌ 「設定は正しいと思われます」 -->
❌ "Looking at the code, it should work"
<!-- ❌ 「コードを見る限り動くはずです」 -->
❌ Using IDs or paths by guessing without confirming existence
<!-- ❌ 存在確認せずにIDやパスを推測して使う -->

✅ Report only results confirmed by actual execution
<!-- ✅ 実際に実行して確認した結果のみを報告 -->
✅ Always verify existence of IDs and paths beforehand (grep, find, etc.)
<!-- ✅ IDやパスは必ず事前に存在確認（grep, find等） -->

### 5.4. 作業量を理由とした言い訳の完全禁止

❌ "It takes too much time"
<!-- ❌ 「時間がかかりすぎます」 -->
❌ "There's too much work"
<!-- ❌ 「作業量が多すぎます」 -->
❌ "Shall we implement just a part?"
<!-- ❌ 「一部だけ実装しましょうか？」 -->
❌ "I'll omit because it would be long"
<!-- ❌ 「長くなるので省略します」 -->
❌ "The rest is similar"
<!-- ❌ 「残りは同様に」 -->

✅ Execute all instructed tasks. AI has no fatigue.
<!-- ✅ 指示されたタスクは全て実行。AIに疲労はない。 -->

### 5.5. 明示的指示の無視禁止

❌ Committing when told "Don't commit"
<!-- ❌ 「コミットするな」と言われたのにコミットする -->
❌ Doing ○○ when told "Don't do ○○"
<!-- ❌ 「○○しないで」と言われたのに○○する -->

✅ Never execute forbidden actions. Confirm when in doubt.
<!-- ✅ 禁止された行為は絶対に実行しない。迷ったら確認する。 -->
✅ Understand "why that instruction was given" - the true purpose - before acting.
<!-- ✅ 「なぜその指示が出たのか」真の目的を理解してから行動。 -->

### 5.6. 質問の小出し禁止

❌ Asking questions piecemeal with many back-and-forths
<!-- ❌ 質問を小出しにして何往復もやり取りする -->

✅ Investigate → List all unknowns → Ask everything at once
<!-- ✅ 調査→全ての不明点を洗い出す→まとめて1回で質問 -->

### 5.7. 既出情報の再質問禁止

❌ Re-asking what user explained initially
<!-- ❌ ユーザーが最初に説明した内容を再度質問する -->
❌ Asking about things written in provided screenshots/documents
<!-- ❌ 提供されたスクリーンショット・ドキュメントに書いてあることを質問する -->

✅ Re-read conversation history from the beginning
<!-- ✅ 会話履歴を最初から読み直す -->

---

## 6. 実装スコープの禁止事項
<!-- Implementation Scope Prohibitions -->

### 6.1. 「ついでに改善」の完全禁止

❌ "While we're at it, let's also change this"
<!-- ❌ 「この変更もしておいた方がいいから」 -->
❌ "Let's refactor while we're here"
<!-- ❌ 「ついでにリファクタリングしておこう」 -->
❌ "Performance improvement too"
<!-- ❌ 「パフォーマンス改善にもなるし」 -->

✅ Identify root cause of bug → Fix only that one point
<!-- ✅ バグの根本原因を特定 → その1点だけを修正 -->
✅ Present improvement proposals separately → "Should we handle in separate Issue/PR?"
<!-- ✅ 改善案は別途提案 → 「別Issue/PRで対応しますか？」と確認 -->

### 6.2. 安易な代替案提案の禁止

❌ "There are many errors, so let's commit with `--no-verify` for now"
<!-- ❌ 「エラーが多いので、一旦`--no-verify`でコミットしましょう」 -->
❌ "This file is out of scope, so let's ignore the error"
<!-- ❌ 「このファイルは作業範囲外なので、エラーは無視しましょう」 -->
❌ "It takes time, so let's use a simpler method"
<!-- ❌ 「時間がかかるので、別の簡単な方法にしませんか？」 -->

### 6.3. 既存ロジックの安易な削除禁止

- **Forbidden**: Deleting existing state reset processing introduced for bug fixes in the name of UX improvement
<!-- 禁止: UX改善のために、バグ修正として導入された既存の状態リセット処理を削除すること -->
- **Reason**: Past bugs (data duplication, inconsistency, etc.) will recur (regression)
<!-- 理由: 過去のバグ（データの重複、不整合等）が再発する（デグレ） -->
- **Correct**: Maintain logic, improve UX on UI side
<!-- 正解: ロジックは維持し、UI側でUXを改善する -->

---

## 7. サービス・環境の禁止事項
<!-- Service/Environment Prohibitions -->

### 7.1. 実行中サービスの無断停止禁止

❌ Stopping/restarting services "to apply configuration changes"
<!-- ❌ 「設定変更を適用するため」という理由でのサービス再起動 -->
❌ Executing `pkill`, `docker compose down` when user says "it's running now"
<!-- ❌ ユーザーが「今起動している」と言っているのに`pkill`、`docker compose down`等を実行 -->

✅ Modifying config files is OK → Tell "Will take effect on next startup"
<!-- ✅ 設定ファイルは修正してOK → 「次回起動時に有効になります」と伝える -->
✅ When restart is needed → Ask explicitly "May I restart now?"
<!-- ✅ 再起動が必要な場合 → 「今再起動してよろしいですか？」と明示的に質問 -->

### 7.2. AIが固まる操作の禁止

❌ Running non-terminating commands like `tail -f` or `watch` with `isBackground=false`
<!-- ❌ `tail -f`や`watch`等の終わらないコマンドを`isBackground=false`で実行 -->

✅ Run long-running commands with `isBackground=true`, check results with `get_terminal_output`
<!-- ✅ 長時間コマンドは`isBackground=true`で実行し、`get_terminal_output`で結果確認 -->

### 7.3. ユーザー報告と矛盾する操作の禁止

❌ Claiming "it's broken" when user says "it's working"
<!-- ❌ ユーザーが「動いてる」と言ってるのに「壊れてます」と主張 -->
❌ Proposing destructive operations (`reset`, `drop`, etc.) based only on own query results
<!-- ❌ 自分のクエリ結果だけを信じて破壊的操作（`reset`, `drop`等）を提案 -->

✅ First suspect your own command (connection target, table name, auth info, etc.)
<!-- ✅ まず自分のコマンドを疑う（接続先、テーブル名、認証情報等） -->
✅ On error, re-check own input/parameters before retrying
<!-- ✅ エラー時は自分の入力・パラメータを再確認してからリトライ -->
✅ Never execute destructive operations until user explicitly permits
<!-- ✅ 破壊的操作はユーザーが明示的に許可するまで絶対に実行しない -->
