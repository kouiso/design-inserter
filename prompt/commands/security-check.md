# /security-check - WordPress Security Audit Command

## Purpose
WordPress固有のセキュリティリスクを排除し、安全なコードを保証する
<!-- Eliminate WordPress-specific security risks and ensure safe code -->

## Trigger
ユーザーが `security-check: [スコープ]` またはPRレビュー時に実行
<!-- User executes security-check: [scope] or during PR review -->

## Workflow

### Step 1: Scope Definition
- 検査対象コードの確認
<!-- Confirm target code -->
- 前提条件・環境の把握
<!-- Understand preconditions and environment -->

### Step 2: WordPress Security Checklist

#### 2.1. 出力エスケープ (Output Escaping)
- [ ] 全ての `echo` 出力がエスケープされている
<!-- All echo outputs are escaped -->
- [ ] `esc_html()`, `esc_attr()`, `esc_url()` が適切に使用されている
<!-- esc_html(), esc_attr(), esc_url() properly used -->
- [ ] `wp_kses_post()` でHTMLが適切にサニタイズされている
<!-- HTML properly sanitized with wp_kses_post() -->

#### 2.2. 入力サニタイゼーション (Input Sanitization)
- [ ] `$_GET`, `$_POST`, `$_REQUEST` が直接使用されていない
<!-- $_GET, $_POST, $_REQUEST not used directly -->
- [ ] `sanitize_text_field()`, `absint()` 等で入力がサニタイズされている
<!-- Input sanitized with sanitize_text_field(), absint(), etc. -->

#### 2.3. データベースセキュリティ (Database Security)
- [ ] `$wpdb->prepare()` が全てのクエリで使用されている
<!-- $wpdb->prepare() used in all queries -->
- [ ] 直接的なSQL文字列結合がない
<!-- No direct SQL string concatenation -->

#### 2.4. Nonce検証 (Nonce Verification)
- [ ] 全てのフォーム処理にNonce検証がある
<!-- Nonce verification in all form processing -->
- [ ] AJAX処理に `check_ajax_referer()` がある
<!-- check_ajax_referer() in AJAX processing -->

#### 2.5. ケイパビリティチェック (Capability Check)
- [ ] 管理機能に `current_user_can()` がある
<!-- current_user_can() in admin functions -->
- [ ] 適切な権限レベルが設定されている
<!-- Appropriate permission levels set -->

#### 2.6. ファイル操作 (File Operations)
- [ ] ファイルアップロードが適切に検証されている
<!-- File uploads properly validated -->
- [ ] ファイルパスが検証されている（パストラバーサル防止）
<!-- File paths validated (prevent path traversal) -->

### Step 3: Code Review
- 疑わしいコードの詳細検査
<!-- Detailed inspection of suspicious code -->
- 脆弱性パターンの検索
<!-- Search for vulnerability patterns -->

### Step 4: Report Generation
セキュリティレポート作成
<!-- Generate security report -->

### Step 5: Remediation
- 優先度付け修正
<!-- Prioritized fixes -->
- 修正実装・テスト
<!-- Implement fixes and test -->

## Output Format

```markdown
# WordPress Security Audit Report

## Scope
- Files checked: [ファイル数]
- Audit date: [日時]

## Executive Summary
- **Critical Issues**: [数]
- **High Issues**: [数]
- **Medium Issues**: [数]
- **Low Issues**: [数]
- **Overall Risk**: [評価]

## Findings

### Critical
#### Issue C1: [脆弱性]
- **Type**: [Escaping/Nonce/SQL Injection/etc.]
- **Location**: [ファイル:行]
- **Description**: [説明]
- **Impact**: [インパクト]
- **Recommendation**: [推奨対策]
- **Code Example**:
\`\`\`php
// Before (脆弱)
echo $variable;

// After (安全)
echo esc_html( $variable );
\`\`\`

### High
#### Issue H1: ...

### Medium & Low
...

## Checklist Results

| Check | Status | Notes |
|-------|--------|-------|
| Output Escaping | ✅/❌ | |
| Input Sanitization | ✅/❌ | |
| Database Security | ✅/❌ | |
| Nonce Verification | ✅/❌ | |
| Capability Check | ✅/❌ | |
| File Operations | ✅/❌ | |

## Remediation Plan
1. [優先度1: Critical修正]
2. [優先度2: High修正]
3. [優先度3: Medium修正]

## Next Steps
- [ ] All critical issues fixed
- [ ] E2E tests pass
- [ ] Code review approved
```

## Related Commands
- `/debug` - バグ根本原因分析
- `/plan` - 詳細作業計画
