# Design Inserter Purpose and Evidence Gate

## True Purpose

Design Inserter exists to sell CSS Stock design parts as a WordPress plugin: a buyer should be able to search, choose, insert, and publish CSS Stock parts from WordPress without hand-copying HTML/CSS, and the plugin must be reliable enough for a newsletter and landing-page sales flow.

## Primary Customer

The primary customer is the product owner selling the plugin. The secondary customer is a WordPress producer or site operator who wants to use CSS Stock parts quickly inside posts and pages.

## Sales-Quality Success Conditions

Before a release or sales-facing PR is treated as ready, it must provide evidence for these conditions:

| Area | Required result |
|---|---|
| Activation | The plugin installs and activates in WordPress without fatal errors. |
| Gutenberg insertion | A user can add the Design Inserter block from the editor and select a part. |
| Frontend rendering | The selected part renders with its CSS on a published page. |
| Shortcode rendering | `[designinserter_part id="heading-1"]` renders through the shared renderer. |
| Admin screen | The settings screen is visible and shows catalog/source information. |
| Distribution zip | A plugin zip is generated with a versioned filename and hash. |
| Attribution | CSS Stock source URLs and attribution notes remain available in output or documentation. |

## PR Evidence Template

Use this table in PR descriptions when a change affects release readiness, insertion behavior, rendering, catalog data, packaging, or sales documentation.

| Gate | Evidence |
|---|---|
| QA result | Command log, screenshot, or explicit blocker note. |
| Evidence path | Path to generated screenshots, JSON reports, build logs, or markdown notes. |
| Expected vs actual | Expected behavior and measured behavior in one line each. |
| Nearby regression | The closest behavior that could have been broken, and how it was checked. |
| Rollback | The commit, previous zip, or release branch that can be restored. |

## Minimum Evidence Examples

- Activation: `wp plugin activate designinserter` log or admin plugin screen screenshot.
- Gutenberg: editor screenshot showing the Design Inserter block and selected part.
- Frontend: published-page screenshot showing one rendered CSS Stock part.
- Shortcode: page or test output showing `[designinserter_part id="heading-1"]`.
- Admin: settings screen screenshot or DOM enumeration.
- Distribution: `npm run build:zip` log with zip path and SHA256.
- Attribution: source URL in README, catalog data, or rendered output comment.

## Do Not Mark Ready If

- The change only creates or closes a PR without test or evidence.
- The plugin can render in one environment but fresh WordPress activation is untested.
- Search, category, or preview changes make the shortcode path regress.
- CSS Stock attribution, source URL, or license caution text is removed.
- A bot or reviewer has an unresolved actionable objection.
