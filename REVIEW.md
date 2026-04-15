# Review Guide

This document captures review expectations for this repository based on three inputs:

- merged PR trends documented in test/MERGED_PR_SUMMARY.md and test/DEGRADATION_TEST_CASES.md
- existing repository rules under .claude/rules and the PR checklist in .github/pull_request_template.md
- repeated implementation patterns in the current WordPress theme, plugin, SCSS, and Playwright code

Use this guide when reviewing pull requests, AI-generated changes, or manual fixes.

## 1. Review Priorities

Review in this order. If an item fails in a higher section, do not spend time polishing lower-priority topics first.

1. Security and data safety
2. WordPress correctness and permalink behavior
3. Regression risk across JP and EN themes
4. Frontend behavior and responsive output
5. Test coverage and deployment readiness
6. Maintainability and consistency with existing patterns

## 2. Recurring Findings From Past Reviews

### Findings commonly raised by AI reviews

- Missing output escaping in templates, admin screens, or generated HTML
- Missing nonce verification or capability checks in admin actions and form handling
- Wrong hook timing for post types, taxonomies, or asset loading
- Rewrite and pagination logic changed without validating actual URL behavior
- Tests added without covering edge cases or regressions from previous fixes
- Playwright tests relying on fixed waits instead of state-based waiting

### Findings commonly raised by human reviews

- URL behavior matters more than internal intent. Reviewers expect the final permalink to match production expectations.
- Data ordering changes must include both code and existing data migration strategy.
- UI fixes must be validated on real pages, not just in isolated markup.
- A change in one theme often needs the equivalent change in the sibling theme.
- Staging and production impact must be considered before merge because main deployment is automatic.

## 3. Codebase Tendencies Reviewers Should Assume

### 3.1 Dual-theme parity is a real risk

The repository contains both muashi and muashi-en themes. Similar logic exists in both. When a review finds a bug or pattern issue in one theme, check the sibling theme before approving.

Typical examples:

- custom post type and taxonomy registration
- admin asset loading
- archive and single template behavior
- navigation and header/footer link logic

When only one theme changes, the PR should include a short sibling-theme note in one of these forms:

- Same logic exists in the sibling theme and was updated there too.
- Sibling theme checked; no equivalent logic exists.
- Sibling theme checked; equivalent logic exists but intentionally differs for product or language reasons.

### 3.2 Permalink and pagination logic is fragile

Recent merged PRs repeatedly touched pagination, archive routing, and with_front behavior. Reviewers should explicitly test whether URLs resolve correctly instead of assuming WordPress defaults will handle it.

Pay close attention to:

- custom post types using with_front => false
- fixed-page based archives
- taxonomy routes under /product/
- /page/2/ style pagination on custom templates
- redirects from old permalink shapes

### 3.3 Security checks are expected even for internal admin tools

This codebase includes custom admin workflows and a CF7 approval plugin. Reviewers should treat internal tools as production features.

Reject or request changes when you see:

- raw output without esc_html, esc_attr, esc_url, or wp_kses_post where appropriate
- POST handlers without wp_verify_nonce
- admin features without current_user_can
- direct SQL without prepare
- secret or token handling without integrity validation

### 3.4 Frontend fixes often need real-content verification

Recent regressions came from real page content, not synthetic fixtures. Gutenberg image rendering, anchor offsets, taxonomy links, and section order are all examples where page-level verification mattered.

Reviewers should check:

- responsive behavior on real pages
- rendered content from WordPress blocks and post content
- anchor and navigation destinations
- sidebar layouts and narrow-width content behavior

Treat real-page verification as incomplete unless the PR shows concrete evidence such as:

- the affected URL or URLs
- the device or viewport used
- what was checked, for example anchor position, image containment, sidebar layout, or rendered CMS content
- at least one replayable artifact:
	- a screenshot tied to a named URL and viewport for visual issues
	- a test result for behavior that can be automated
	- a short written result only when the check is trivial and the path is explicitly named

Use this minimum evidence format for Level B and Level C changes:

- environment: local or staging
- URL or route
- viewport or device
- item checked
- artifact: screenshot, test name, or output reference
- result: pass, fail, or observed behavior

Treat these six fields as the required evidence record for Level B and Level C changes.

For this guide, content-driven or environment-sensitive changes include cases such as:

- WordPress post content or Gutenberg rendering changes
- responsive layout issues that depend on real content volume
- routing, pagination, redirect, or cache-sensitive behavior
- mail, plugin dependency, or approval-flow behavior that varies by environment

Use these evidence levels:

- Level A: static visual-only changes with no real-content dependency
	- minimum: URL, viewport, and screenshot
	- examples: spacing-only CSS tweaks, color-only changes, static copy updates not driven by CMS data
- Level B: content-driven changes
	- minimum: Level A plus either a real-content route note or an automated test
	- examples: Gutenberg rendering, taxonomy-driven page output, sidebar content depending on stored posts or terms
- Level C: environment-sensitive changes
	- minimum: local verification plus one additional method from Section 3.6
	- examples: routing and cache behavior, mail delivery paths, plugin-dependent approval flows

If a change matches more than one level, apply the highest level.

Quick level chooser:

- If behavior can change by environment, plugin state, cache, routing, or mail path, use Level C.
- Else if output changes based on stored content, Gutenberg output, taxonomy data, or real content volume, use Level B.
- Else use Level A.

Reviewers should classify the change with this chooser before deciding what evidence is required.

For Level B and Level C changes, screenshot-only evidence is not enough by itself.

Minimum expectation:

- visual or content-driven changes require real-page evidence
- if the change is also environment-sensitive, require real-page evidence plus either staging verification or an automated test

### 3.5 Test quality is mixed and needs active review

The repository has meaningful Playwright coverage, but some tests still rely on waitForTimeout. Reviewers should not accept brittle tests as sufficient evidence.

Prefer:

- data-testid selectors when available
- role-based selectors before CSS-only selectors
- waitForLoadState, waitForSelector, or response-based waiting
- user-visible Japanese test names
- targeted regression coverage for the bug being fixed

Judge test waiting logic using these tiers:

- Reject: the assertion is only made after a fixed delay and no expected state is checked
- Caution: fixed delays exist, but they are not the primary readiness signal, a meaningful state check exists, and the delay is clearly justified by animation or third-party behavior
- Good: the test waits for a DOM, network, URL, or response condition that proves readiness

Do not judge fixed waits by seconds alone. A 100ms delay with no state check is still weak, and a longer delay is acceptable only when it is secondary to a verifiable readiness condition.

For this guide, a fixed delay is secondary only if both are true:

- a deterministic readiness check already proves the page or component reached the expected state
- removing the fixed delay would not change what condition proves correctness, only visual smoothness or animation settling

Caution means comment-level concern by default, not immediate rejection. If removing the fixed delay would make the assertion fail or leave readiness unproven, treat it as Reject instead.

Question changes that:

- add only happy-path tests
- skip data migration validation
- avoid checking sibling pages or equivalent themes
- use hardcoded delays without strong reason

### 3.6 Environment parity and release-path checks matter

This repository is sensitive to differences between local, staging, and production behavior, especially for routing, mail, and cache-related changes.

Reviewers should ask whether the PR shows evidence for:

- local verification plus at least one environment-aware check for production-sensitive behavior
- cache and permalink refresh assumptions when rewrite logic changes
- mail and approval-flow behavior when environment configuration differs
- behavior after plugin activation, deactivation, or missing dependency conditions

Minimum expectation for environment-sensitive changes:

- local verification is required
- plus at least one of the following:
	- staging verification on the affected path
	- local verification with the relevant dependency intentionally missing, disabled, or reconfigured
	- an automated test that exercises the environment-sensitive branch

Acceptable environment-aware verification patterns therefore include combinations such as:

- local plus staging
- local plus dependency-variation check
- local plus automated test

Examples of dependency-variation checks:

- verify behavior with the relevant plugin disabled or not configured in a safe local environment
- verify the branch that runs when mail or cache assumptions are missing
- verify the affected path after changing the local configuration that the PR depends on

For this guide, evidence means something another reviewer can inspect or replay, such as:

- a tested URL list with expected and actual outcomes
- a screenshot or test output tied to a named page or route
- a brief note describing cache, permalink, or dependency assumptions
- a staging or local verification note that names the exact path and result

If a routing change may require manual permalink flush, cache purge, or similar operational action, the PR must state:

- whether the action is required
- when it must happen
- which role, team, or release handoff step is expected to handle it

### 3.7 Premortem prompts for high-risk changes

Before approving a risky PR, ask what would fail first after merge.

Useful prompts:

- If this routing change is wrong, which URL will 404 first?
- If this admin flow is incomplete, what happens with deleted or missing referenced data?
- If this test is flaky, what exact state is it pretending to wait for?
- If this change is copied to the sibling theme, is the logic truly shared or only superficially similar?
- If this feature depends on mail, cache, or plugin configuration, what happens when that dependency is absent or stale?

## 4. Approval Checklist

### Security

- All user-controlled output is escaped correctly.
- Form or action handlers verify nonce before processing.
- Admin-only features enforce capability checks.
- Database queries use safe APIs and prepared statements.
- Escaping matches output context:
	- text nodes use esc_html
	- attribute values use esc_attr
	- href and src style URLs use esc_url
	- trusted rich text output uses wp_kses_post
- Post-submit handlers validate referenced data and failure paths, not only nonce and capability checks.

### WordPress behavior

- Hooks match the intended lifecycle.
- CPT and taxonomy registration follows existing patterns.
- Permalinks and rewrite rules are validated with actual URLs.
- Changes do not bypass WordPress functions with ad hoc logic.
- Routing changes show verification evidence, ideally including:
	- affected canonical URL
	- old or alternate URL shape if one exists
	- page 2 style pagination route when relevant
	- cache or permalink refresh assumptions
	- release handoff for any manual step such as permalink flush or cache purge

### Data and content integrity

- Ordering changes account for existing stored data.
- Template output still matches real CMS content.
- JP and EN themes stay aligned where behavior should match.
- When sibling-theme parity is questioned, the PR explains one of these outcomes:
	- both themes updated
	- sibling theme checked and intentionally not changed
	- logic differs and the difference is documented

### Frontend and CSS

- Class changes were checked across all template usages.
- Responsive behavior was verified on affected pages.
- No fix introduces a cosmetic workaround that hides a data issue.
- Real-page verification is shown for content-driven fixes, not only isolated markup inspection.
- The PR provides replayable verification evidence, not only a claim that it was checked.

### Tests and release readiness

- The change includes the smallest regression test that proves the fix.
- Existing regression-sensitive routes were rechecked.
- Deployment impact on main, staging, cache, and DB behavior was considered.
- Wait logic is judged by outcome quality, not by whether a test happens to pass locally.
- If existing brittle tests remain nearby, the PR should either improve them or note a follow-up issue clearly.
- Fixed delays are acceptable only as secondary support, never as the main proof that the page is ready.
- If the delay is required to make the assertion meaningful, it is not secondary and should be challenged.

## 5. What Strong Review Comments Look Like

Strong comments in this repository are concrete and operational.

Good:

- This output path still prints a term name without escaping, which leaves an XSS path in admin-rendered HTML.
- This CPT rewrite update changes code, but the PR does not show permalink validation for existing content or page 2 routes.
- The fix was applied in muashi only. The equivalent logic still exists in muashi-en.
- The test passes because of a fixed timeout, not because the page reached the expected state.

Weak:

- Please improve security.
- This feels fragile.
- Maybe add more tests.

## 6. Repository-Specific Default Questions

Use these questions before approving a PR:

1. Does this change affect both muashi and muashi-en?
2. Does this change alter URLs, rewrite rules, or pagination?
3. Does this change touch stored ordering, taxonomy structure, or existing post data?
4. Does any rendered output now depend on escaping or sanitization that is missing?
5. Does the test prove behavior, or only wait long enough to pass?
6. Does the PR include deployment-facing validation for staging or production-sensitive paths?
7. If a sibling-theme difference exists, is it a real product difference or an accidental omission?
8. If dependencies such as mail, cache, or plugin state differ by environment, what is the failure mode?
9. If referenced content, taxonomy, or related data is missing, does the new logic fail safely?

## 7. Review Outcome Guidance

### Request changes immediately when

- a security control is missing
- permalink behavior is unverified after routing changes
- one theme was updated and the sibling theme was ignored without reason
- a regression-prone area changed without targeted validation
- the implementation hides a data issue with presentation logic
- a test relies on fixed delay as the only proof of readiness
- a production-sensitive change has no evidence for cache, dependency, or environment-specific behavior

### Approve with comments when

- the change is correct but a follow-up cleanup is worth tracking separately
- test coverage is acceptable but could be made less brittle later
- consistency improvements exist but are clearly out of scope for the current fix
- fixed delays remain, but they are not the only readiness signal and the justification is explicit

## 8. Sources Behind This Guide

- test/MERGED_PR_SUMMARY.md
- test/DEGRADATION_TEST_CASES.md
- .github/pull_request_template.md
- .claude/rules/core.md
- .claude/rules/prohibitions.md
- .claude/rules/quality.md
- .claude/rules/wordpress.md
