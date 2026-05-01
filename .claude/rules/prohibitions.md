---
applyTo: "**"
---

# Absolute Prohibitions

**Any violation is immediate task failure. No exceptions.**

## 1. Git Operations

- `git commit --no-verify` / `git push --no-verify`: Completely forbidden. **Even suggesting it is a violation.** Fix all hook errors.
- `git push --force`: Completely forbidden. Only `--force-with-lease` allowed.
- `git reset`: Forbidden. Use `git revert`.

❌ "Hook errors are blocking the commit. Let me use `--no-verify` to proceed."
✅ Read the hook error output, fix the root cause, then commit normally.

## 2. WordPress/PHP

- **Direct SQL operations**: No direct UPDATE/DELETE via `$wpdb->query()`. Use WordPress functions (`wp_update_post()`, `update_post_meta()`, etc.).
- **Global variable abuse**: No custom globals. Use Hooks/Filters and class-based design.
- **Missing escaping**: Always use `esc_html()`, `esc_attr()`, `esc_url()` on output.
- **Skipping Nonce verification**: Always use `wp_verify_nonce()` for form processing.
- **Missing capability checks**: Always use `current_user_can()` for admin functions.
- **Hook misuse**:
  - Register CPT/taxonomies in `init`
  - Enqueue scripts/styles in `wp_enqueue_scripts` (frontend) / `admin_enqueue_scripts` (admin)
  - No extreme priority (e.g. 999) without reason
  - No duplicate `add_action`/`add_filter` registration
- **Direct global variable manipulation**: Access `$post` etc. via WordPress wrapper functions. Always use `$wpdb->prepare()`.
- **Performance degradation**:
  - No per-item `get_post_meta()` or SQL queries inside loops
  - No enqueuing scripts/styles on all pages when only needed on specific pages
  - No `posts_per_page => -1` (limit to necessary count)
- **Theme/plugin boundary violation**: No direct DB changes or business logic from theme. No direct theme file modification from plugin.
- **Coding Standards violation**: Function names in `snake_case`, prefix required (`muashi_*`, `musashi_inquiry_*`).
- **Security bypass**: No `ALLOW_UNFILTERED_UPLOADS`, no `wp_safe_redirect()` bypass.
- **Shortcode/block naming violation**: Prefix/namespace required (`[muashi_*]`, `muashi/*`).

❌ `echo $user_input;` — raw output without escaping.
✅ `echo esc_html( $user_input );` — always escape on output.

❌ `$wpdb->query( "UPDATE wp_posts SET post_title = '$title' WHERE ID = $id" );`
✅ `wp_update_post( array( 'ID' => $id, 'post_title' => $title ) );`

## 3. File Management

- **Backup/temp file creation completely forbidden**: `.bak`, `.backup`, `.old`, `_backup`, `_temp`, `_copy`, `test.php`, `temp.php`, `debug.php`, `work.php`, date-stamped files, etc. Delete immediately on discovery.
- **Test temp file creation forbidden**: No temporary test files in the repository.

❌ Creating `functions-backup.php` before editing `functions.php`.
✅ Use Git for version control. The previous state is always recoverable via `git diff` / `git stash`.

## 4. Code Quality

- **Error suppression completely forbidden**: No `@ts-ignore`, empty catch, `|| true`. Root cause resolution required.
- **Leaving unused variables forbidden**: No underscore workaround — delete to resolve.
- **Self-explanatory comments (What) forbidden**: e.g. `// ユーザー取得`. Only "Why" allowed.
- **English comments forbidden**: Write in Japanese.
- **JSDoc addition forbidden**: Unless explicitly instructed.

❌ `// ヘッダーを取得する` — obvious "What" comment.
✅ `// ACFフィールドが未設定時のフォールバック` — explains "Why".

❌ `$_unused_var = get_option( 'something' );` — underscore workaround.
✅ Delete the unused variable entirely.

## 5. Behavioral Rules

- **Delegating work to user completely forbidden**.

❌ "Please run the tests and let me know if there are issues."
❌ "Could you check if the page looks correct?"
✅ Run `npm run test` yourself, analyze results, fix errors, report verified outcome.

- **Open-ended questions completely forbidden**.

❌ "What should we do?" / "Please decide."
✅ Investigate → list options → analyze pros/cons → present recommendation: "Option A is recommended because X. Shall I proceed?"

- **Guessing/speculation forbidden**.

❌ "It should probably work." / "I think the ID is 42."
✅ Verify: `grep -r "ID" ...`, query DB, confirm with actual execution. Report only confirmed results.

- **Excuses based on work volume forbidden**.

❌ "Omitting because it would be long." / "The rest follows the same pattern."
✅ Execute every item. AI does not tire.

- **Fixing data problems via code forbidden**: Fix data problems with data. Don't work around post_content issues with template conditionals.
- **Ignoring explicit instructions forbidden**: Never execute forbidden actions. Understand the true purpose before acting.
- **Piecemeal questions forbidden**: Investigate → list all unknowns → ask everything at once.
- **Re-asking previously provided information forbidden**: Re-read conversation history.

## 6. Implementation Scope

- **"While we're at it" improvements completely forbidden**: Fix only the root cause. Propose improvements in separate Issue/PR.
- **Easy alternative suggestions forbidden**: e.g. "Too many errors, let's use `--no-verify`".
- **Carelessly deleting existing logic forbidden**: Don't remove logic introduced for bug fixes (causes regression).
- **指示にない装飾の追加・提案を完全禁止**: `border`・`background`・`box-shadow`・`border-radius` 等、ユーザーが明示的に求めていないデザイン装飾を実装することも選択肢として提示することも禁止。「消してほしい」という指示に対して別の装飾に置き換えることも禁止。

❌ 「グレー背景を消す」指示に対して `border-left` を追加する。
✅ 指示通りに削除のみ行う。

❌ "While fixing this bug, I also refactored the CSS naming convention."
✅ Fix only the reported bug. Propose the refactor as a separate Issue: "Should I create a separate PR for CSS cleanup?"

## 7. Service/Environment

- **Stopping running services without permission forbidden**: If restart needed, explicitly ask "May I restart now?"
- **Blocking execution of non-terminating commands forbidden**: `tail -f` etc. must use `isBackground=true`.
- **Operations contradicting user reports forbidden**: First suspect your own command (connection target, table name, auth info, etc.). Never execute destructive operations until user explicitly permits.

❌ Running `docker stop` on a running container without asking.
✅ "Changes take effect on next restart. May I restart the service now?"

## 8. GitHub Review Replies

- **Omitting mentions forbidden**: Always include `@botname` when replying to Devin or other bots. Escape `[bot]` in PowerShell.
