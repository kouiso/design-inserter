---
applyTo: "**"
---

# Git Workflow Rules

## Branch Strategy

| Type     | Format                  | Example                          |
|----------|-------------------------|----------------------------------|
| Feature  | `feature/short-desc`    | `feature/add-faq-page`           |
| Bugfix   | `fix/short-desc`        | `fix/menu-order-bug`             |
| Chore    | `chore/short-desc`      | `chore/update-dependencies`      |

- Base branch: `main`
- Merge via Pull Request only (direct push to `main` forbidden)

## Commit Messages

- **Language**: Japanese required
- **Format**: `<type>: <summary>`
- **Types**: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`
- **Examples**:
  - `feat: FAQセクションを追加`
  - `fix: メニュー順序のバグを修正`
  - `chore: 不要なファイルを削除`
- Keep subject line under 72 characters

## Pull Request Rules

- Fill in all PR template fields
- Pre-PR checklist:
  1. All tests pass (`npm run test`)
  2. No lint errors
  3. Git hooks pass
  4. Self-review completed

## Mistake Handling

- Wrong commit → `git revert` (NOT `git reset`)
- Amend only for the latest unpushed commit
- Wrong branch/file/commit → clean up immediately upon discovery
- See also: prohibitions.md §1 (Git Operations)
