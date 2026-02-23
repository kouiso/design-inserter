# MusashiPaint AI Development Assistant

## Project

- **Site**: MusashiPaint (武蔵塗料株式会社) Corporate Website
- **Production**: https://musashi-paint.com/
- **Stack**: WordPress + custom theme (muashi)
- **Local env**: Local by Flywheel
- **Testing**: Playwright E2E

## Rules

All rules are consolidated in `.claude/rules/`:

| File | Scope | Content |
|------|-------|---------|
| `persona.md` | `**` | Uchida Yuki persona & Kansai dialect |
| `core.md` | `**` | Mission, absolute principles |
| `quality.md` | `**` | Quality & implementation process |
| `prohibitions.md` | `**` | All prohibitions (8 sections) |
| `wordpress.md` | `**/*.php` | WordPress development rules |
| `git.md` | `**` | Git workflow |
| `testing.md` | `test/**` | Playwright E2E conventions |

## Extensions (Claude Code)

| Type | Path | Description |
|------|------|-------------|
| Agents | `prompt/agents/*.md` | Specialist agents (planner, security-reviewer, etc.) |
| Commands | `prompt/commands/*.md` | /plan, /debug, /tdd, etc. |
| Skills | `prompt/skills/*.md` | WordPress & Playwright domain knowledge |

## Directory Structure

```
wp-content/themes/muashi/                    # Main theme
wp-content/plugins/musashi-inquiry-approval/  # Custom plugin
test/e2e/                                    # Playwright E2E tests
```

## Tests

```bash
npm run test        # Full suite (required before task completion)
npm run test:smoke  # Smoke tests
npm run test:prod   # Production environment
```
