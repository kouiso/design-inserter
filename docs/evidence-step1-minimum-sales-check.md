# Step 1 Minimum Sales Check Evidence

Issue: #28
Date: 2026-05-26

## Result

PASS. The minimum sales-readiness path has evidence for activation, Gutenberg insertion, frontend rendering, shortcode rendering, admin visibility, PHP checks, and a nearby regression check.

## Evidence Summary

| Requirement | Evidence |
|---|---|
| WordPress environment | Fresh WordPress e2e started from Docker after starting `designinserter-db` on alternate host port `3317` to avoid an existing local port collision. |
| Plugin activation | `npm run e2e:fresh` installs `.tmp/dist/designinserter-1.0.0.zip` with `wp plugin install ... --activate`. |
| Gutenberg insertion | `npm run e2e:fresh` passed the editor test that inserts the Design Inserter block, opens the inspector picker, filters by category, searches, and selects `button-54`. |
| Frontend rendering | `npm run e2e:fresh` rendered all 222 catalog parts on a published page. |
| Shortcode rendering | `npm run e2e:fresh` rendered `[designinserter_part id="heading-1"]` through the shared renderer. |
| Admin screen | `npm run e2e:fresh` visited `options-general.php?page=designinserter` and enumerated the settings screen. |
| PHP/static checks | `npm run phpcs` passed. `npm run test:php` passed with 7 tests and 24 assertions. |
| Distribution zip | `npm run build:zip` built `.tmp/dist/designinserter-1.0.0.zip`. |

## Fresh E2E Metrics

From `.tmp/e2e-fresh-wp/evidence/fresh-report.json`:

| Metric | Value |
|---|---:|
| Rendered parts | 222 |
| Unique rendered parts | 222 |
| Style tags | 209 |
| Behavior parts | 16 |
| Initialized behavior parts | 16 |
| Zero-size parts | 0 |
| Failed requests | 0 |
| Console warnings/errors | 0 |
| Unauthenticated REST status | 401 |

## Expected vs Actual

- Expected: After activation, at least one CSS Stock part can be inserted and rendered with CSS.
- Actual: Fresh e2e activated the plugin, rendered 222 parts, rendered shortcode output, verified the admin screen, and exercised Gutenberg insertion.

## Nearby Regression

- Shortcode rendering did not regress: `[designinserter_part id="heading-1"]` produced a visible `.designinserter-part[data-designinserter-id="heading-1"]`.
- Existing README usage and CSS Stock license/credit caution were preserved.
- Unauthenticated REST access remained protected with status `401`.

## Reproduction Commands

```bash
npm run build:zip
npm run ready:checklist
npm run phpcs
npm run test:php
MYSQL_PORT=3317 docker compose up -d db
npm run e2e:fresh
```

## Notes

The first e2e attempt exposed an environment reproducibility issue: the floating `php:8.2-apache` Docker tag resolved to Debian trixie and made apt package resolution unstable. PR #30 pinned the e2e image to `php:8.2-apache-bookworm`; the final `npm run e2e:fresh` then passed 4/4.
