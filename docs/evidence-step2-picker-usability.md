# Step 2 Picker Usability Evidence

Issue: #29
Date: 2026-05-26

## Result

PASS. The Gutenberg picker has evidence for search, category filtering, visual preview, card selection, and continuous use without browser errors.

## Evidence Summary

| Requirement | Evidence |
|---|---|
| Search | `npm run e2e:fresh` fills the picker search with `button-54`, verifies the matching card text, then repeats with `heading-1` during continuous use. |
| Category filtering | `npm run e2e:fresh` selects the `ボタン` category before choosing `button-54`, then alternates category/all filters during the continuous-use loop. |
| Preview or visual cue | The selected part renders a visible `.di-preview__render .button-54` preview in the editor. |
| Typical part discovery | The test selects button part `button-54` and repeatedly verifies heading part `heading-1` is discoverable. |
| Shortcode regression | Step 1 e2e evidence confirms `[designinserter_part id="heading-1"]` still renders through the shared renderer. |
| Browser errors | Continuous-use evidence recorded 0 failed requests, 0 console errors, and 0 page errors. |

## Gutenberg Evidence Metrics

From `.tmp/e2e-fresh-wp/evidence/gutenberg-cta-report.json` and `.tmp/e2e-fresh-wp/evidence/continuous-use-audit.json`:

| Metric | Value |
|---|---:|
| Design Inserter blocks | 1 |
| Selected block | `designinserter/css-part` |
| Selected part | `button-54` |
| Continuous-use duration | 60,263 ms |
| Continuous-use loop steps | 56 |
| Failed requests | 0 |
| Console errors | 0 |
| Page errors | 0 |

## Screenshots

The fresh e2e run writes these screenshots under `.tmp/e2e-fresh-wp/evidence/`:

- `gutenberg-inserter-search.png`
- `gutenberg-part-picker-selected.png`
- `continuous-use-audit.png`

## Expected vs Actual

- Expected: A buyer can find heading/button parts quickly with search, category filtering, and visual cues.
- Actual: The e2e found `button-54` by category and search, kept the selected part stable, and repeatedly found `heading-1` during 60 seconds of continuous use.

## Nearby Regression

- Shortcode rendering remained covered by step 1 evidence.
- The editor kept exactly one Design Inserter block selected during the continuous-use loop.
- Browser failed requests, console errors, and page errors remained at 0.

## Reproduction Commands

```bash
MYSQL_PORT=3317 docker compose up -d db
npm run e2e:fresh
jq '.' .tmp/e2e-fresh-wp/evidence/gutenberg-cta-report.json
jq '{durationMs, stepCount:(.steps|length), issueCounts:{failedRequests:(.issues.failedRequests|length), consoleErrors:(.issues.consoleErrors|length), pageErrors:(.issues.pageErrors|length)}}' .tmp/e2e-fresh-wp/evidence/continuous-use-audit.json
```
