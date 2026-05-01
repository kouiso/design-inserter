---
applyTo: "**"
---

# Core Mission

## Project

**MusashiPaint (武蔵塗料株式会社) Corporate Website**

- Stack: WordPress + custom theme (muashi)
- Local env: Local by Flywheel
- Testing: Playwright E2E
- Production: https://musashi-paint.com/

## Critical Checklist (Self-scan before every output)

**Check every item before responding. Fix any violation before outputting.**

1. **[No Delegation]** Am I asking the user to do work? → Do it myself via tools/commands.
2. **[No Guessing]** Am I guessing? → Verify with `grep`, `read_file`, terminal commands.
3. **[No Error Suppression]** Am I hiding errors? → Fix the root cause.
4. **[No Partial Work]** Am I ignoring similar files or impact scope? → Search and fix all.
5. **[No Lazy Git]** Am I breaking Git rules? → Fix all hook errors properly.
6. **[No Instruction Ignore]** Am I ignoring an explicit prohibition? → Re-read the rule file.
7. **[Understand Purpose]** Do I understand the true purpose? → Clarify before acting.

## Ultimate Goal

Execute user instructions 100% faithfully, producing deliverables at the highest industry-standard quality.

## Absolute Principles

1. **Complete all work**: Never skip due to volume. 5 Issues = do all 5. 100 files = fix all 100. Only completion is success.
2. **Autonomous investigation**: Before asking, exhaust codebase (Grep/Read/Glob), Git history, and external sources. Only ask about user intent, judgment, subjectivity, or business logic.
3. **Full impact analysis**: When modifying files, search all similar files and related code (`find`, `grep`), fix everything. Don't ask "should I check?" — just check.
4. **Zero user burden**: AI executes all verification, debugging, and validation. Delegating work to user is taboo.
5. **Obey all prompts**: "Too many prompts" is never an excuse to ignore rules. Output solutions satisfying all constraints simultaneously. When in doubt, re-read rule files.
6. **Fact-based only**: No guessing. Report only results confirmed by actual execution. Always verify existence of IDs and paths beforehand.
7. **Root cause resolution**: No error suppression. After fixes, re-verify from clean state.

## Autonomous Execution Protocol

### Research-First Rule

**Exhaust all self-researchable information before asking the user any question.**

- **Allowed to ask**: User intent, judgment, preferences, business logic (info that does not exist in the codebase)
- **Prohibited from asking**: Objective facts the AI can retrieve through investigation

### Required Self-Research (before any question)

1. **Codebase**: Source code (Grep/Read/Glob), directory structure, config files, documentation
2. **Git history**: `git log`, `git show`, `git diff`, branch info, past change reasons
3. **Runtime**: Server status, log output, test/build results, DB queries
4. **External**: Official documentation (web search), library specs, error message meanings

### Execution Workflow

1. **Deep Analysis**: Full repo scan → identify applicable rules → decompose tasks → identify risks
2. **Plan**: Present concrete execution plan for user approval
3. **Implement**: Execute each step precisely, imitating existing code style
4. **Verify**: Run tests, resolve all errors at root cause, confirm deliverables satisfy requirements

### When User Says "I'll Do It Myself"

That applies only to the specific part mentioned. Continue executing everything else silently.

## Full Impact Analysis — WordPress Thinking Patterns

**The moment you are told to modify a specific file, suspect that similar files exist elsewhere.**

| When you touch... | Immediately suspect... |
|---|---|
| `functions.php` | `inc/*.php`, all files using related hooks/functions |
| A `template-parts/*.php` file | Other template-parts referencing the same variables or CSS classes |
| `header.php` or `footer.php` | Every template that uses `get_header()` / `get_footer()` |
| A SCSS file in `src/scss/` | The compiled `assets/css/style.css`, other SCSS partials importing the same variables |
| `page-*.php` (page template) | Similar page templates, `single-*.php`, archive templates sharing the same layout |
| A custom post type registration | Archive template, single template, permalink settings, menu items |
| `wp_enqueue_scripts` hook | Conditional loading — is this asset needed on all pages or specific ones? |
| `add_action` / `add_filter` | Duplicate registrations, priority conflicts, other hooks in the same flow |
| `get_post_meta()` | Whether it's inside a loop (performance), whether similar meta queries exist elsewhere |
| CSS class names | `grep -r "classname"` across all PHP templates and SCSS files |

**Required procedure**: Before starting any modification, run `grep` / `find` to discover all related files. Fix all affected locations. Verify with tests.

## Constraint Renegotiation Protocol

When constraints are technically unsolvable:

1. First, search exhaustively for a way to honor the constraint
2. If impossible, present **technical evidence**
3. Offer option: "Can solve if constraint is relaxed"
4. Execute only after user permission (AI breaking constraints unilaterally is forbidden)

## Output Language Rules

1. **Japanese required**: All source code comments, documentation, and commit messages in Japanese
2. **Comment standard**: "Why" only. Self-explanatory "What" comments forbidden
3. **JSDoc addition forbidden**: Unless explicitly instructed by user
