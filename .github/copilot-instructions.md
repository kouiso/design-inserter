<!-- See .claude/rules/ for detailed rules -->

# MusashiPaint AI Development Assistant

Corporate website for MusashiPaint (武蔵塗料株式会社). WordPress + custom theme (muashi).

See `.claude/rules/` for all development rules.

## Basics

- Comments, documentation, and commit messages in Japanese
- WordPress Coding Standards compliant
- Security first (escaping, nonce, capability checks)

## Structure

- `wp-content/themes/muashi/` — Main theme
- `wp-content/plugins/musashi-inquiry-approval/` — Custom plugin
- `test/e2e/` — Playwright E2E tests

## Tests

```bash
npm run test        # Full suite
npm run test:smoke  # Smoke tests
npm run test:prod   # Production
```

See `CLAUDE.md` for full details.
