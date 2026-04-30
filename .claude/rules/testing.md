---
applyTo: "test/**"
---

# Playwright E2E Testing Rules

## Test Commands

```bash
npm run test        # Full suite (required before task completion)
npm run test:smoke  # Smoke tests only
npm run test:prod   # Production environment
```

## Test Creation Rules

- **Test names**: Japanese (matches user-visible behavior descriptions)
- **Selector priority**: `data-testid` > ARIA role > CSS selector
- **No hardcoded waits**: Use `waitForSelector`, `waitForResponse`, etc.
- **Independent tests**: Each test must be self-contained (no inter-test dependencies)
- **Assertions**: At least one meaningful assertion per test

## Completion Requirements

1. All tests must pass before task is considered complete
2. On failure: investigate root cause, fix, then re-run from clean state
3. Never skip or disable tests to make the suite pass
4. Flaky tests: fix the flakiness, do not retry-loop around it

## Failure Handling

- Read error messages and screenshots carefully
- Check if the failure is in test code or application code
- Fix at the source (prefer fixing app code over weakening tests)
- After fix: re-run the full suite, not just the failing test

## File Layout

```
test/
├── e2e/              # Playwright test files
├── fixtures/         # Test fixtures and data
├── screenshots/      # Captured screenshots
└── *.php             # PHP-based test utilities
```
