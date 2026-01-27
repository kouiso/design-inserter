---
applyTo: "**"
---

# OpenSpec Integration (OpenSpec統合)

## Purpose (目的)
<!-- 仕様書を一元管理し、常に最新の仕様に基づいた実装を保証する。 -->
Centrally manage specifications and guarantee implementation always based on the latest specs.

---

## Core Principles (核心原則)

1. **Spec is the Source of Truth** - Specifications are authoritative, not code
   <!-- 仕様が真実の源 - コードではなく仕様が権威 -->
2. **Spec-First Development** - Write/update specs before implementing
   <!-- 仕様ファースト開発 - 実装前に仕様を作成・更新 -->
3. **Spec-Code Consistency** - Specs and code must always match
   <!-- 仕様コード一貫性 - 仕様とコードは常に一致 -->

---

## Spec File Location (仕様ファイル配置)

### Directory Structure (ディレクトリ構造)

```
spec/
├── features/          # Feature specifications (機能仕様)
│   ├── product-catalog.md
│   ├── contact-form.md
│   └── search.md
├── api/              # API specifications (API仕様)
│   ├── rest-api.md
│   └── ajax-endpoints.md
├── database/         # Database specifications (データベース仕様)
│   ├── custom-post-types.md
│   ├── taxonomies.md
│   └── meta-fields.md
├── security/         # Security specifications (セキュリティ仕様)
│   ├── authentication.md
│   ├── authorization.md
│   └── data-validation.md
├── performance/      # Performance specifications (パフォーマンス仕様)
│   ├── caching-strategy.md
│   └── query-optimization.md
└── ui/               # UI/UX specifications (UI/UX仕様)
    ├── theme-structure.md
    ├── responsive-design.md
    └── accessibility.md
```

---

## Spec-First Development Workflow (仕様ファースト開発ワークフロー)

### Phase 1: Spec Creation/Update (仕様作成・更新)

**Before writing code, always create or update the spec.**
<!-- コードを書く前に、必ず仕様を作成・更新する。 -->

**Steps**:
1. Analyze requirements
   <!-- 要件分析 -->
2. Create/update spec file in `spec/` directory
   <!-- `spec/`ディレクトリに仕様ファイルを作成・更新 -->
3. Get user approval for spec
   <!-- ユーザーから仕様の承認を得る -->
4. Only then start implementation
   <!-- その後で初めて実装開始 -->

### Phase 2: Implementation (実装)

**Implement strictly according to approved spec.**
<!-- 承認された仕様に厳密に従って実装する。 -->

**Rules**:
- Read spec file before every implementation session
  <!-- 実装セッションごとに仕様ファイルを読む -->
- If spec is ambiguous, clarify spec first (don't guess)
  <!-- 仕様が曖昧な場合、仕様を明確化（推測しない） -->
- If requirements change during implementation, update spec first
  <!-- 実装中に要件が変わったら、まず仕様を更新 -->

### Phase 3: Verification (検証)

**After implementation, verify spec-code consistency.**
<!-- 実装後、仕様コード一貫性を検証する。 -->

**Verification Steps**:
1. Read spec file
   <!-- 仕様ファイルを読む -->
2. Check if implementation matches every requirement
   <!-- 実装が全ての要件に合致しているか確認 -->
3. Update spec if implementation revealed new details
   <!-- 実装で新しい詳細が明らかになった場合、仕様を更新 -->

---

## Spec File Format (仕様ファイルフォーマット)

### Standard Spec Template (標準仕様テンプレート)

```markdown
# [Feature Name] Specification

## Overview (概要)
Brief description of the feature.

## Requirements (要件)

### Functional Requirements (機能要件)
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

### Non-Functional Requirements (非機能要件)
- [ ] Performance: [Target metrics]
- [ ] Security: [Security requirements]
- [ ] Accessibility: [A11y requirements]

## Design (設計)

### Data Model (データモデル)
- Custom Post Type: `product`
- Taxonomies: `product_category`, `product_tag`
- Meta Fields:
  - `_product_price`: Price in yen
  - `_product_stock`: Stock quantity

### API Endpoints (APIエンドポイント)
- `GET /wp-json/muashi/v1/products` - Get product list
- `POST /wp-json/muashi/v1/products` - Create product

### Templates (テンプレート)
- `single-product.php` - Product detail page
- `archive-product.php` - Product catalog page
- `parts/product-card.php` - Product card component

### Security (セキュリティ)
- Nonce verification: `muashi_product_nonce`
- Capability check: `edit_posts`
- Escaping: `esc_html()`, `esc_attr()`, `esc_url()`

## Implementation Files (実装ファイル)
- `wp-content/themes/muashi/functions.php` - Register custom post type
- `wp-content/themes/muashi/single-product.php` - Product detail template
- `wp-content/themes/muashi/archive-product.php` - Product catalog template
- `wp-content/themes/muashi/parts/product-card.php` - Product card component
- `test/e2e/product.spec.ts` - E2E test

## Test Cases (テストケース)

### E2E Tests (E2Eテスト)
- [ ] Product detail page displays correctly
- [ ] Product catalog page shows all products
- [ ] Product search works
- [ ] Product filtering by category works

### Security Tests (セキュリティテスト)
- [ ] Nonce verification works
- [ ] Unauthorized users cannot create products
- [ ] XSS prevention works

## Success Criteria (成功基準)
- [ ] All functional requirements implemented
- [ ] All E2E tests pass
- [ ] Security audit passed
- [ ] Performance targets met

## Status (ステータス)
- **Created**: 2026-01-27
- **Last Updated**: 2026-01-27
- **Status**: Draft / In Progress / Implemented / Archived
- **Assigned**: [Developer name]

## Change History (変更履歴)
- 2026-01-27: Initial spec created
```

---

## Spec Consistency Enforcement (仕様一貫性の強制)

### Mandatory Spec Review Before Implementation (実装前の仕様レビュー必須)

**Before implementing any feature, ALWAYS:**
<!-- いかなる機能を実装する前にも、必ず: -->

1. Check if spec exists in `spec/features/`
   <!-- `spec/features/`に仕様が存在するか確認 -->
2. If exists, read it thoroughly
   <!-- 存在する場合、徹底的に読む -->
3. If doesn't exist, create it first
   <!-- 存在しない場合、まず作成 -->
4. Get user approval for spec before coding
   <!-- コーディング前にユーザーから仕様の承認を得る -->

### Detecting Spec-Code Inconsistency (仕様コード不一致の検出)

**If you notice spec-code inconsistency during implementation:**
<!-- 実装中に仕様コード不一致に気付いた場合: -->

❌ **Don't silently fix code to match old spec**
<!-- 古い仕様に合わせて黙ってコードを修正しない -->
❌ **Don't implement based on code, ignoring spec**
<!-- 仕様を無視してコードベースで実装しない -->

✅ **Report inconsistency to user immediately**
<!-- 不一致を即座にユーザーに報告 -->
✅ **Ask: "Should I update spec or revert code?"**
<!-- 尋ねる: 「仕様を更新すべきか、コードを戻すべきか？」 -->

---

## Spec Update Rules (仕様更新ルール)

### When to Update Spec (仕様を更新すべき時)

**Update spec when:**
<!-- 以下の場合に仕様を更新: -->

1. Requirements change (user requests new feature/change)
   <!-- 要件が変わった（ユーザーが新機能・変更を要求） -->
2. Implementation reveals missing details
   <!-- 実装で詳細が欠けていることが判明 -->
3. Security vulnerability discovered
   <!-- セキュリティ脆弱性が発見された -->
4. Performance improvement needed
   <!-- パフォーマンス改善が必要 -->

### How to Update Spec (仕様を更新する方法)

**Spec Update Process:**
<!-- 仕様更新プロセス: -->

1. Create new section in Change History
   <!-- 変更履歴に新しいセクションを作成 -->
2. Update relevant sections (Requirements, Design, etc.)
   <!-- 関連セクションを更新（要件、設計等） -->
3. Update "Last Updated" date
   <!-- "Last Updated"日付を更新 -->
4. Notify user of spec changes
   <!-- ユーザーに仕様変更を通知 -->
5. Get approval before implementing changes
   <!-- 変更実装前に承認を得る -->

---

## WordPress-Specific Spec Categories (WordPress特化仕様カテゴリ)

### 1. Custom Post Types Spec (カスタム投稿タイプ仕様)

**Location**: `spec/database/custom-post-types.md`

**Contents**:
- Post type slug
- Labels (singular, plural, menu name)
- Supports (title, editor, thumbnail, etc.)
- Taxonomies
- Meta fields (name, type, validation)
- Capabilities
- REST API enabled/disabled

### 2. Taxonomy Spec (タクソノミー仕様)

**Location**: `spec/database/taxonomies.md`

**Contents**:
- Taxonomy slug
- Labels
- Hierarchical or not
- Associated post types
- Capabilities

### 3. REST API Spec (REST API仕様)

**Location**: `spec/api/rest-api.md`

**Contents**:
- Endpoint URL
- HTTP method (GET, POST, PUT, DELETE)
- Parameters (name, type, required/optional)
- Response format (JSON schema)
- Authentication (Nonce, OAuth, etc.)
- Authorization (Capability check)
- Error responses

### 4. AJAX Handler Spec (AJAXハンドラー仕様)

**Location**: `spec/api/ajax-endpoints.md`

**Contents**:
- Action name
- Hook (`wp_ajax_*`, `wp_ajax_nopriv_*`)
- Parameters
- Response format
- Security (Nonce, capability check)
- Error handling

### 5. Template Hierarchy Spec (テンプレート階層仕様)

**Location**: `spec/ui/theme-structure.md`

**Contents**:
- Template files (single.php, archive.php, etc.)
- Template parts (header, footer, sidebar)
- Template tags used
- get_template_part() calls
- CSS classes (BEM naming)

---

## Integration with Development Workflow (開発ワークフローとの統合)

### New Feature Development (新機能開発)

**Workflow**:
1. User requests feature
   <!-- ユーザーが機能を要求 -->
2. Create spec file in `spec/features/[feature-name].md`
   <!-- `spec/features/[feature-name].md`に仕様ファイルを作成 -->
3. Get user approval for spec
   <!-- ユーザーから仕様の承認を得る -->
4. Implement according to spec
   <!-- 仕様に従って実装 -->
5. Create E2E test according to spec
   <!-- 仕様に従ってE2Eテストを作成 -->
6. Verify spec-code consistency
   <!-- 仕様コード一貫性を検証 -->
7. Update spec with any implementation details
   <!-- 実装詳細で仕様を更新 -->

### Bug Fix (バグ修正)

**Workflow**:
1. Read spec to understand intended behavior
   <!-- 仕様を読んで意図された動作を理解 -->
2. Identify bug as deviation from spec
   <!-- バグを仕様からの逸脱として特定 -->
3. Fix code to match spec
   <!-- 仕様に合わせてコードを修正 -->
4. If spec was wrong, update spec first
   <!-- 仕様が間違っていた場合、まず仕様を更新 -->

### Refactoring (リファクタリング)

**Workflow**:
1. Read spec to understand functional requirements
   <!-- 仕様を読んで機能要件を理解 -->
2. Refactor code while maintaining spec compliance
   <!-- 仕様準拠を維持しながらコードをリファクタリング -->
3. Verify all requirements still met
   <!-- 全要件が依然として満たされているか検証 -->
4. Update spec if refactoring revealed better approach
   <!-- リファクタリングでより良いアプローチが判明した場合、仕様を更新 -->

---

## Spec-Driven Quality Assurance (仕様駆動品質保証)

### Spec as Test Basis (テスト基盤としての仕様)

**All E2E tests should be derived from spec.**
<!-- 全てのE2Eテストは仕様から導出されるべき。 -->

**Mapping**:
- Spec Requirements → Test Cases
- Spec Success Criteria → Test Assertions
- Spec Error Handling → Negative Test Cases

### Spec Review Checklist (仕様レビューチェックリスト)

**Before approving spec:**
<!-- 仕様承認前に: -->

- [ ] All functional requirements are clear and testable
  <!-- 全機能要件が明確でテスト可能 -->
- [ ] Security requirements specified (Nonce, escaping, capability)
  <!-- セキュリティ要件が指定されている（Nonce、エスケープ、権限） -->
- [ ] Performance targets defined
  <!-- パフォーマンス目標が定義されている -->
- [ ] Implementation files identified
  <!-- 実装ファイルが特定されている -->
- [ ] Test cases defined
  <!-- テストケースが定義されている -->
- [ ] No ambiguity (can implement directly from spec)
  <!-- 曖昧さがない（仕様から直接実装可能） -->

---

## WordPress-Specific Spec Examples (WordPress特化仕様例)

### Example 1: Custom Post Type Spec (カスタム投稿タイプ仕様の例)

**File**: `spec/database/custom-post-type-product.md`

```markdown
# Product Custom Post Type Specification

## Overview
Custom post type for product catalog management.

## Post Type Configuration
- **Slug**: `product`
- **Labels**:
  - Singular: 製品
  - Plural: 製品
  - Menu Name: 製品一覧
- **Supports**: title, editor, thumbnail, excerpt, custom-fields
- **Public**: true
- **Has Archive**: true
- **Rewrite**: `{ 'slug': 'products' }`
- **Show in REST**: true
- **Menu Icon**: dashicons-products

## Taxonomies
- `product_category` (hierarchical)
- `product_tag` (non-hierarchical)

## Meta Fields
| Field Name | Type | Validation | Description |
|-----------|------|------------|-------------|
| `_product_price` | integer | >= 0 | Price in yen |
| `_product_stock` | integer | >= 0 | Stock quantity |
| `_product_sku` | string | alphanumeric | Product SKU |

## Capabilities
- `edit_post` → `edit_product`
- `read_post` → `read_product`
- `delete_post` → `delete_product`

## Implementation File
- `wp-content/themes/muashi/functions.php` (register_post_type)

## Test Cases
- [ ] Product can be created in admin
- [ ] Product displays on frontend
- [ ] Product archive page works
- [ ] Product meta fields save correctly
```

---

## Best Practices (ベストプラクティス)

1. **Spec First, Code Second** - Never code before spec
   <!-- 仕様が先、コードが後 - 仕様より先にコードを書かない -->
2. **Keep Spec Updated** - Spec is living document, update regularly
   <!-- 仕様を最新に保つ - 仕様は生きた文書、定期的に更新 -->
3. **One Feature, One Spec** - Don't combine multiple features in one spec
   <!-- 1機能、1仕様 - 複数機能を1つの仕様にまとめない -->
4. **Testable Requirements** - Write requirements that can be verified
   <!-- テスト可能な要件 - 検証可能な要件を書く -->
5. **Spec as Communication Tool** - Use spec to align with user before coding
   <!-- コミュニケーションツールとしての仕様 - コーディング前にユーザーと仕様で認識を合わせる -->

---

## Related Files (関連ファイル)

- `prompt/instructions/quality-implementation.md` - Implementation quality rules
- `prompt/instructions/testing.md` - Testing protocols
- `prompt/instructions/autonomous-execution.md` - Autonomous execution protocols
