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
❌ Reusing previous query results after DB state has changed (e.g., after All-in-One Migration import). Always re-query.
<!-- ❌ DB状態が変わった後（例: All-in-One Migration取り込み後）に以前のクエリ結果を流用する。必ず再クエリすること。 -->
❌ Saying "probably correct by coincidence" without verifying actual data
<!-- ❌ 実データを検証せずに「たまたま正しい」と推測で報告する -->

✅ Report only results confirmed by actual execution
<!-- ✅ 実際に実行して確認した結果のみを報告 -->
✅ Always verify existence of IDs and paths beforehand (grep, find, etc.)
<!-- ✅ IDやパスは必ず事前に存在確認（grep, find等） -->
✅ After any DB-altering operation (migration, import, script execution), always re-query to confirm current state
<!-- ✅ DB変更操作（マイグレーション、インポート、スクリプト実行）の後は、必ず再クエリして最新状態を確認 -->

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

### 5.5. データ問題のコード回避禁止

❌ 投稿コンテンツ（post_content）の問題をテンプレートの条件分岐で回避する
<!-- ❌ Solving post_content issues by adding conditional logic to templates -->
❌ データの重複・不備をコード側で吸収しようとする
<!-- ❌ Absorbing data duplication/defects on the code side -->

✅ データの問題はデータで直す（投稿内容の修正、ACFフィールドの更新等）
<!-- ✅ Fix data problems with data (edit post content, update ACF fields, etc.) -->
✅ テンプレートコードはデータが正しい前提で書く
<!-- ✅ Write template code assuming data is correct -->

### 5.6. 明示的指示の無視禁止

❌ Committing when told "Don't commit"
<!-- ❌ 「コミットするな」と言われたのにコミットする -->
❌ Doing ○○ when told "Don't do ○○"
<!-- ❌ 「○○しないで」と言われたのに○○する -->

✅ Never execute forbidden actions. Confirm when in doubt.
<!-- ✅ 禁止された行為は絶対に実行しない。迷ったら確認する。 -->
✅ Understand "why that instruction was given" - the true purpose - before acting.
<!-- ✅ 「なぜその指示が出たのか」真の目的を理解してから行動。 -->

### 5.7. 質問の小出し禁止

❌ Asking questions piecemeal with many back-and-forths
<!-- ❌ 質問を小出しにして何往復もやり取りする -->

✅ Investigate → List all unknowns → Ask everything at once
<!-- ✅ 調査→全ての不明点を洗い出す→まとめて1回で質問 -->

### 5.8. 既出情報の再質問禁止

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

---

## 8. WordPress特有の禁止事項
<!-- WordPress-Specific Prohibitions -->

### 8.1. フックの誤用禁止

**Wrong Hook Selection (誤ったフック選択)**:
<!-- 誤ったフック選択 -->

❌ Using `init` for processing that should be in `wp_loaded`
<!-- ❌ `wp_loaded`で完結すべき処理を`init`で実行 -->
❌ Registering custom post types/taxonomies in hooks other than `init`
<!-- ❌ カスタム投稿タイプ・タクソノミーを`init`以外のフックで登録 -->
❌ Enqueuing scripts/styles in hooks other than `wp_enqueue_scripts` (frontend) or `admin_enqueue_scripts` (admin)
<!-- ❌ スクリプト・スタイルを`wp_enqueue_scripts`（フロントエンド）や`admin_enqueue_scripts`（管理画面）以外で読み込む -->

✅ Use correct hooks at appropriate timing
<!-- ✅ 適切なタイミングで正しいフックを使用 -->
✅ Reference WordPress Hook Execution Order: `init` → `wp_loaded` → `template_redirect` → `wp_enqueue_scripts`
<!-- ✅ WordPressフック実行順序を参照: `init` → `wp_loaded` → `template_redirect` → `wp_enqueue_scripts` -->

**Hook Priority Misuse (フック優先度の誤用)**:
<!-- フック優先度の誤用 -->

❌ Using extremely high priority (e.g., 999) without reason
<!-- ❌ 理由なく極端に高い優先度（例: 999）を使用 -->
❌ Using priority 10 (default) when order matters
<!-- ❌ 順序が重要なのにデフォルト優先度10を使用 -->

✅ Use priority 10 (default) when order doesn't matter
<!-- ✅ 順序が重要でない場合はデフォルト優先度10を使用 -->
✅ Adjust priority only when you need to run before/after specific other functions
<!-- ✅ 特定の他の関数の前後で実行する必要がある場合のみ優先度を調整 -->

**Duplicate Hook Registration (フックの重複登録)**:
<!-- フックの重複登録 -->

❌ Registering the same `add_action`/`add_filter` multiple times
<!-- ❌ 同じ`add_action`/`add_filter`を複数回登録 -->

✅ Check if hook is already registered before adding
<!-- ✅ フック登録前に既に登録されているか確認 -->
✅ Use `has_action()` or `has_filter()` to check
<!-- ✅ `has_action()`や`has_filter()`で確認 -->

---

### 8.2. グローバル変数の直接操作禁止

❌ Directly manipulating `$wpdb` without WordPress functions
<!-- ❌ WordPress関数を使わずに`$wpdb`を直接操作 -->
❌ Directly manipulating `$post` without using `get_post()`, etc.
<!-- ❌ `get_post()`等を使わずに`$post`を直接操作 -->
❌ Modifying WordPress core global variables
<!-- ❌ WordPressコアのグローバル変数を変更 -->

✅ Use WordPress wrapper functions (`get_post()`, `wp_update_post()`, etc.)
<!-- ✅ WordPressラッパー関数（`get_post()`, `wp_update_post()`等）を使用 -->
✅ Use `$wpdb->prepare()` for SQL queries
<!-- ✅ SQLクエリには`$wpdb->prepare()`を使用 -->

**Example - Wrong**:
```php
// ❌ Direct global variable manipulation
global $post;
$post->post_title = 'New Title';

// ❌ Direct SQL without prepare()
global $wpdb;
$wpdb->query("UPDATE wp_posts SET post_title = '{$_POST['title']}' WHERE ID = {$_POST['id']}");
```

**Example - Correct**:
```php
// ✅ Use WordPress functions
$post_id = get_the_ID();
wp_update_post([
	'ID' => $post_id,
	'post_title' => sanitize_text_field($_POST['title'])
]);

// ✅ Use $wpdb->prepare()
global $wpdb;
$wpdb->query($wpdb->prepare(
	"UPDATE {$wpdb->posts} SET post_title = %s WHERE ID = %d",
	sanitize_text_field($_POST['title']),
	intval($_POST['id'])
));
```

---

### 8.3. パフォーマンス阻害禁止

**Loop Inefficiency (ループ内の非効率な処理)**:
<!-- ループ内の非効率な処理 -->

❌ Calling `get_post_meta()` inside a loop for each post
<!-- ❌ ループ内で各投稿に対して`get_post_meta()`を呼び出す -->
❌ Running separate SQL query for each item in a loop
<!-- ❌ ループ内で各アイテムに対して個別のSQLクエリを実行 -->

✅ Use `update_meta_cache()` before loop to batch-load metadata
<!-- ✅ ループ前に`update_meta_cache()`で一括メタデータ読み込み -->
✅ Use `WP_Query` with proper arguments to minimize queries
<!-- ✅ `WP_Query`を適切な引数で使用してクエリを最小化 -->

**Unnecessary Global Loading (不要なグローバル読み込み)**:
<!-- 不要なグローバル読み込み -->

❌ Enqueuing scripts/styles on all pages when only needed on specific pages
<!-- ❌ 特定ページでのみ必要なスクリプト・スタイルを全ページで読み込む -->

✅ Conditionally enqueue scripts/styles only where needed
<!-- ✅ 必要な場所でのみスクリプト・スタイルを条件付き読み込み -->

**Example - Wrong**:
```php
// ❌ Unconditional global loading
function my_enqueue_scripts() {
	wp_enqueue_script('my-admin-script', get_template_directory_uri() . '/js/admin.js');
}
add_action('wp_enqueue_scripts', 'my_enqueue_scripts');
```

**Example - Correct**:
```php
// ✅ Conditional loading
function my_enqueue_scripts() {
	// Only load on product pages
	if (is_singular('product')) {
		wp_enqueue_script('product-script', get_template_directory_uri() . '/js/product.js');
	}
}
add_action('wp_enqueue_scripts', 'my_enqueue_scripts');
```

**Inefficient WP_Query (非効率なWP_Query)**:
<!-- 非効率なWP_Query -->

❌ Using `posts_per_page => -1` to get all posts
<!-- ❌ `posts_per_page => -1`で全投稿を取得 -->
❌ Not specifying `fields => 'ids'` when only IDs are needed
<!-- ❌ IDのみ必要なのに`fields => 'ids'`を指定しない -->

✅ Limit `posts_per_page` to necessary amount
<!-- ✅ `posts_per_page`を必要な数に制限 -->
✅ Use `fields => 'ids'` when only IDs are needed
<!-- ✅ IDのみ必要な場合は`fields => 'ids'`を使用 -->

---

### 8.4. テーマ/プラグインの境界侵犯禁止

**Theme Overreach (テーマの越権行為)**:
<!-- テーマの越権行為 -->

❌ Creating custom database tables from theme
<!-- ❌ テーマからカスタムデータベーステーブルを作成 -->
❌ Implementing business logic in theme that should be in plugin
<!-- ❌ プラグインに実装すべきビジネスロジックをテーマに実装 -->
❌ Modifying `wp_options` table from theme
<!-- ❌ テーマから`wp_options`テーブルを変更 -->

✅ Themes handle presentation only (templates, styles, scripts)
<!-- ✅ テーマはプレゼンテーションのみ担当（テンプレート、スタイル、スクリプト） -->
✅ Plugins handle functionality and business logic
<!-- ✅ プラグインが機能・ビジネスロジックを担当 -->

**Plugin Overreach (プラグインの越権行為)**:
<!-- プラグインの越権行為 -->

❌ Directly modifying theme files from plugin
<!-- ❌ プラグインからテーマファイルを直接変更 -->
❌ Hard-coding theme-specific markup in plugin
<!-- ❌ プラグインでテーマ固有のマークアップをハードコード -->

✅ Provide hooks/filters for theme customization
<!-- ✅ テーマカスタマイズ用のフック・フィルターを提供 -->
✅ Use template loading pattern for markup (`locate_template()`)
<!-- ✅ マークアップにはテンプレート読み込みパターン（`locate_template()`）を使用 -->

---

### 8.5. データベース直接変更禁止（テーマから）

❌ Creating custom tables from theme (use plugin instead)
<!-- ❌ テーマからカスタムテーブルを作成（プラグインを使用すること） -->
❌ Running `ALTER TABLE` from theme
<!-- ❌ テーマから`ALTER TABLE`を実行 -->
❌ Modifying core WordPress tables' structure
<!-- ❌ WordPressコアテーブルの構造を変更 -->

✅ Use WordPress post meta, user meta, or term meta for custom data
<!-- ✅ カスタムデータにはWordPressのpost meta、user meta、term metaを使用 -->
✅ If custom tables are needed, implement in plugin
<!-- ✅ カスタムテーブルが必要な場合はプラグインで実装 -->

---

### 8.6. WordPress Coding Standards違反禁止

❌ Using `camelCase` for function names (use `snake_case`)
<!-- ❌ 関数名に`camelCase`を使用（`snake_case`を使用すること） -->
❌ Not prefixing custom functions with theme/plugin name
<!-- ❌ カスタム関数にテーマ・プラグイン名のプレフィックスを付けない -->
❌ Using `UPPERCASE` for constants that aren't truly constant
<!-- ❌ 真に定数でないものに`UPPERCASE`を使用 -->

✅ Follow WordPress PHP Coding Standards
<!-- ✅ WordPress PHP Coding Standardsに従う -->
✅ Prefix all custom functions: `muashi_function_name()`, `musashi_inquiry_function()`
<!-- ✅ 全てのカスタム関数にプレフィックスを付ける: `muashi_function_name()`, `musashi_inquiry_function()` -->
✅ Use `snake_case` for functions and variables
<!-- ✅ 関数と変数には`snake_case`を使用 -->

**Example - Wrong**:
```php
// ❌ No prefix, camelCase
function getProductData() {
	// ...
}
```

**Example - Correct**:
```php
// ✅ Prefixed, snake_case
function muashi_get_product_data() {
	// ...
}
```

---

### 8.7. セキュリティ機能のバイパス禁止

❌ Using `ALLOW_UNFILTERED_UPLOADS` constant
<!-- ❌ `ALLOW_UNFILTERED_UPLOADS`定数の使用 -->
❌ Using `DISALLOW_FILE_EDIT` to disable file editing, then editing files via FTP
<!-- ❌ `DISALLOW_FILE_EDIT`でファイル編集を無効化しておきながら、FTP経由でファイルを編集 -->
❌ Bypassing `wp_safe_redirect()` with direct header redirects
<!-- ❌ `wp_safe_redirect()`をバイパスして直接headerリダイレクト -->

✅ Use WordPress security functions as intended
<!-- ✅ WordPressセキュリティ関数を意図通りに使用 -->
✅ Follow WordPress security best practices
<!-- ✅ WordPressセキュリティベストプラクティスに従う -->

---

### 8.8. ショートコード・ブロック命名規則違反禁止

❌ Creating shortcodes without prefix: `[gallery]` (conflicts with core)
<!-- ❌ プレフィックスなしでショートコード作成: `[gallery]`（コアと競合） -->
❌ Creating Gutenberg blocks without namespace: `core/heading` (conflicts with core)
<!-- ❌ 名前空間なしでGutenbergブロック作成: `core/heading`（コアと競合） -->

✅ Prefix all shortcodes: `[muashi_gallery]`, `[musashi_product]`
<!-- ✅ 全てのショートコードにプレフィックスを付ける: `[muashi_gallery]`, `[musashi_product]` -->
✅ Namespace all Gutenberg blocks: `muashi/product-card`, `musashi-inquiry/approval-form`
<!-- ✅ 全てのGutenbergブロックに名前空間を付ける: `muashi/product-card`, `musashi-inquiry/approval-form` -->

---

**These WordPress-specific prohibitions are in addition to general prohibitions in sections 1-7.**
<!-- これらのWordPress特有の禁止事項は、セクション1-7の一般的な禁止事項に追加されるものです。 -->
