# Design Inserter QA Runbook (2026-05-18)

> AI-self-testable verification procedure for the post-v1.0.0-release codebase.
> A future AI can follow this runbook step-by-step and produce PASS/FAIL evidence
> without human intervention.

## Mission scope

Verify the top 5 critical paths after the v1.0.0 release + audit Critical 6
remediation merged:

1. Static-analysis gate (PHPUnit + PHPCS + JS syntax + npm catalog smoke)
2. Build gate (release zip generation + verification)
3. E2E full install gate (Playwright fresh-install-222.spec.mjs)
4. CI gate (GitHub Actions on PR + main push)
5. Production-side rendering gate (shortcode + dynamic block render via WP runtime)

Evidence destination: `.work/qa/runbook-2026-05-18-evidence/<ISO timestamp>/`
(create the directory before starting; every PASS/FAIL artifact lands here).

---

## Prerequisites

### Branch / repo state

- Repo: `git@github.com:kouiso/design-inserter.git`
- Target branch: `main` at commit ≥ `d511cecc` (or any descendant — must include v1.0.0 release + Issue #13 fix)
- Verify: `git fetch origin main && git log origin/main --oneline -1 | grep -E "v1.0.0|fix.*#13|fix.*#18"` should match.

### Environment

- macOS (Darwin) or Linux. Paths: `/Users/<user>/...` (macOS) or `/home/<user>/...` (Linux).
- Docker daemon running. `docker ps` must not error.
- Node 22+ (mise / nvm). `node --version | grep -E "^v(22|23|24)"` must succeed.
- npm 10+.
- `composer:2` docker image pullable (no local composer required).
- Free ports: 18082 (Playwright e2e), 8080 (dev WP), 3316 (dev MySQL).
- Outbound network: github.com, docker hub, npmjs.com, packagist.org.

### Credentials

- **None required for verification gates 1–4**.
- WP admin (only for manual gate 5 visual verification): `admin / admin` (auto-created by docker compose).

### Optional tools

- Playwright browsers: `npx playwright install chromium` (gate 3 only).
- `gh` CLI authenticated (gate 4 only).

### Setup commands (run once before gates)

```bash
# Working directory
cd /Users/$USER/ghq/kouiso/design-inserter   # adjust for your host

# Evidence directory
EVIDENCE_DIR=".work/qa/runbook-2026-05-18-evidence/$(date -u +%Y-%m-%dT%H-%M-%SZ)"
mkdir -p "$EVIDENCE_DIR"
echo "$EVIDENCE_DIR" > /tmp/di-runbook-evidence-dir.txt

# Sync to main
git fetch origin main
git checkout main 2>/dev/null || git checkout -B main origin/main
git pull --ff-only origin main
git log -1 --oneline > "$EVIDENCE_DIR/head-commit.txt"

# Install dev deps (composer + npm)
npm install --no-audit --no-fund >> "$EVIDENCE_DIR/npm-install.log" 2>&1
docker run --rm -v "$PWD":/app -w /app composer:2 install --no-interaction --prefer-dist \
  >> "$EVIDENCE_DIR/composer-install.log" 2>&1
```

PASS condition: every command exits 0.
FAIL handling: capture stderr to `$EVIDENCE_DIR/setup-FAIL.log`, abort runbook, escalate.

---

## Gate 1 — Static analysis (PHPUnit + PHPCS + JS syntax + npm smoke)

### Steps

```bash
EVIDENCE_DIR=$(cat /tmp/di-runbook-evidence-dir.txt)

# Step 1.1 — PHPUnit
docker run --rm -v "$PWD":/app -w /app composer:2 \
  php vendor/bin/phpunit --configuration phpunit.xml.dist \
  > "$EVIDENCE_DIR/gate1-phpunit.txt" 2>&1
PHPUNIT_EXIT=$?

# Step 1.2 — PHPCS
docker run --rm -v "$PWD":/app -w /app composer:2 \
  php vendor/bin/phpcs --standard=phpcs.xml.dist \
  > "$EVIDENCE_DIR/gate1-phpcs.txt" 2>&1
PHPCS_EXIT=$?

# Step 1.3 — JS syntax
{
  for f in scripts/*.mjs wp-content/plugins/designinserter/assets/*.js; do
    echo "=== $f ==="
    node --check "$f"
  done
} > "$EVIDENCE_DIR/gate1-js-syntax.txt" 2>&1
JS_EXIT=$?

# Step 1.4 — npm test (catalog + contract + stub WP smoke)
npm test > "$EVIDENCE_DIR/gate1-npm-test.txt" 2>&1
NPM_TEST_EXIT=$?

echo "phpunit=$PHPUNIT_EXIT phpcs=$PHPCS_EXIT js=$JS_EXIT npm=$NPM_TEST_EXIT" \
  > "$EVIDENCE_DIR/gate1-exit-codes.txt"
```

### Expected output (PASS conditions)

| Step | PASS marker | FAIL marker |
|---|---|---|
| 1.1 PHPUnit | `OK (7 tests, 24 assertions)` in stdout, exit 0 | non-zero exit OR `FAILURES!` OR `Errors:` |
| 1.2 PHPCS | exit 0, empty or `0 ERRORS AND 0 WARNINGS` | non-zero exit OR `ERROR FOUND` |
| 1.3 JS syntax | all files print path with no error, exit 0 | `SyntaxError:` OR non-zero exit |
| 1.4 npm test | `All local quality checks passed`, exit 0 | `n check(s) failed` OR non-zero exit |

### Verification

```bash
grep -q "OK (7 tests, 24 assertions)" "$EVIDENCE_DIR/gate1-phpunit.txt" && echo "1.1 PASS" || echo "1.1 FAIL"
[ "$PHPCS_EXIT" = "0" ] && echo "1.2 PASS" || echo "1.2 FAIL"
[ "$JS_EXIT" = "0" ] && echo "1.3 PASS" || echo "1.3 FAIL"
grep -q "All local quality checks passed" "$EVIDENCE_DIR/gate1-npm-test.txt" && echo "1.4 PASS" || echo "1.4 FAIL"
```

### Known acceptable variances

- npm test step "PHP WordPress stub smoke" fails only on hosts without local `php` CLI. If gate 1.1 PHPUnit already PASSED, document `php` absence and treat as conditional PASS only when running on macOS without mise php install. CI environment always has PHP.

---

## Gate 2 — Build (release zip)

### Steps

```bash
EVIDENCE_DIR=$(cat /tmp/di-runbook-evidence-dir.txt)

# Step 2.1 — build zip
npm run build > "$EVIDENCE_DIR/gate2-build.txt" 2>&1
BUILD_EXIT=$?

# Step 2.2 — locate + inspect
ZIP_PATH=$(find dist .tmp/dist -name "designinserter-*.zip" 2>/dev/null | head -1)
echo "ZIP: $ZIP_PATH" > "$EVIDENCE_DIR/gate2-zip-path.txt"
unzip -l "$ZIP_PATH" > "$EVIDENCE_DIR/gate2-zip-contents.txt" 2>&1
unzip -tq "$ZIP_PATH" > "$EVIDENCE_DIR/gate2-zip-integrity.txt" 2>&1
ZIP_INTEGRITY_EXIT=$?

# Step 2.3 — sha256
shasum -a 256 "$ZIP_PATH" > "$EVIDENCE_DIR/gate2-sha256.txt"
```

### Expected output (PASS conditions)

| Step | PASS marker | FAIL marker |
|---|---|---|
| 2.1 build | `Built dist/designinserter-1.0.0.zip` (or `.tmp/dist/...`) and exit 0 | non-zero exit OR `Error:` |
| 2.2 inspect | zip exists, `238 files`-ish entry count, unzip -tq exit 0 | zip missing OR `bad zip file` |
| 2.3 sha256 | non-empty digest | empty output |

### Verification

```bash
[ "$BUILD_EXIT" = "0" ] && echo "2.1 PASS" || echo "2.1 FAIL"
[ -f "$ZIP_PATH" ] && [ "$ZIP_INTEGRITY_EXIT" = "0" ] && echo "2.2 PASS" || echo "2.2 FAIL"
[ -s "$EVIDENCE_DIR/gate2-sha256.txt" ] && echo "2.3 PASS" || echo "2.3 FAIL"
```

### Cross-check

Compare sha256 against the published GitHub release asset:

```bash
gh release view v1.0.0 -R kouiso/design-inserter --json assets \
  --jq '.assets[] | select(.name=="designinserter-1.0.0.zip") | .digest' \
  > "$EVIDENCE_DIR/gate2-release-sha256.txt"
diff "$EVIDENCE_DIR/gate2-sha256.txt" "$EVIDENCE_DIR/gate2-release-sha256.txt" || \
  echo "NOTE: local build sha256 differs from released asset — expected if main has commits past v1.0.0 tag" \
  >> "$EVIDENCE_DIR/gate2-sha256-note.txt"
```

---

## Gate 3 — Playwright E2E (fresh-install-222)

### Steps

```bash
EVIDENCE_DIR=$(cat /tmp/di-runbook-evidence-dir.txt)

# Step 3.1 — install Playwright + browsers (idempotent)
npx playwright install chromium > "$EVIDENCE_DIR/gate3-playwright-install.log" 2>&1
PW_INSTALL_EXIT=$?

# Step 3.2 — port preflight
if lsof -i :18082 > /dev/null 2>&1; then
  echo "FAIL: port 18082 in use" > "$EVIDENCE_DIR/gate3-port-FAIL.txt"
  exit 1
fi

# Step 3.3 — run spec (timeout 10 min)
npm run e2e:fresh > "$EVIDENCE_DIR/gate3-e2e-out.txt" 2> "$EVIDENCE_DIR/gate3-e2e-err.txt"
E2E_EXIT=$?

# Step 3.4 — copy spec-generated evidence
SPEC_EVIDENCE="$PWD/.tmp/e2e-fresh-wp/evidence"
[ -d "$SPEC_EVIDENCE" ] && cp -r "$SPEC_EVIDENCE" "$EVIDENCE_DIR/gate3-spec-evidence/"

echo "exit=$E2E_EXIT" > "$EVIDENCE_DIR/gate3-exit.txt"
```

### Expected output (PASS conditions)

| Step | PASS marker | FAIL marker |
|---|---|---|
| 3.1 install | exit 0 | non-zero exit |
| 3.2 port | port free | port in use |
| 3.3 run | `4 passed` in output, exit 0 | `failed` OR non-zero exit OR `Error response from daemon` |
| 3.4 evidence | screenshots / *.txt under gate3-spec-evidence/ exist | directory missing |

### Verification

```bash
grep -E "^\s*[0-9]+ passed" "$EVIDENCE_DIR/gate3-e2e-out.txt" && echo "3.3 PASS" || echo "3.3 FAIL"
[ -d "$EVIDENCE_DIR/gate3-spec-evidence" ] && echo "3.4 PASS" || echo "3.4 FAIL"
```

### Known issues

- Spec generates its own db + wordpress services (Issue #13 fix, PR #18). No external dependency on the main dev stack.
- If Docker is unavailable, gate 3 is INAPPLICABLE — skip with note `"Docker required"` in evidence dir.

---

## Gate 4 — CI green on main + every PR

### Steps

```bash
EVIDENCE_DIR=$(cat /tmp/di-runbook-evidence-dir.txt)

# Step 4.1 — last 5 main-branch CI runs
gh run list -R kouiso/design-inserter --branch main --workflow=test.yml --limit 5 \
  --json status,conclusion,headBranch,createdAt,databaseId \
  > "$EVIDENCE_DIR/gate4-main-runs.json"

# Step 4.2 — last 5 PR-branch CI runs (any open PR)
gh run list -R kouiso/design-inserter --workflow=test.yml --limit 10 \
  --json status,conclusion,headBranch,event,createdAt \
  > "$EVIDENCE_DIR/gate4-all-runs.json"

# Step 4.3 — release artifact integrity
gh release view v1.0.0 -R kouiso/design-inserter --json assets,tagName,publishedAt \
  > "$EVIDENCE_DIR/gate4-release.json"
```

### Expected output (PASS conditions)

| Step | PASS marker | FAIL marker |
|---|---|---|
| 4.1 main runs | every recent main run `conclusion=success` | any `failure` / `cancelled` |
| 4.2 PR runs | non-completed PR runs allowed (in_progress); completed runs must be `success` | any completed `failure` |
| 4.3 release | `tagName=v1.0.0`, `assets[].size > 1000000`, `digest` starts with `sha256:` | missing release OR asset truncated |

### Verification

```bash
python3 - <<'EOF'
import json
runs = json.load(open(f"{__import__('os').environ.get('EVIDENCE_DIR','/tmp')}/gate4-main-runs.json")) if False else None
EOF
# Simpler shell:
FAILED=$(python3 -c "
import json
d=json.load(open('$EVIDENCE_DIR/gate4-main-runs.json'))
print(sum(1 for r in d if r.get('status')=='completed' and r.get('conclusion')!='success'))")
[ "$FAILED" = "0" ] && echo "4.1 PASS" || echo "4.1 FAIL ($FAILED runs failed)"
python3 -c "
import json
d=json.load(open('$EVIDENCE_DIR/gate4-release.json'))
assert d['tagName']=='v1.0.0', d
assert any(a['size']>1000000 for a in d['assets']), d['assets']
print('4.3 PASS')"
```

---

## Gate 5 — Production-side runtime render (shortcode + dynamic block)

### Steps

```bash
EVIDENCE_DIR=$(cat /tmp/di-runbook-evidence-dir.txt)

# Step 5.1 — bring up the dev stack (read-only verification of zip behavior)
docker compose up -d --wait > "$EVIDENCE_DIR/gate5-up.log" 2>&1
UP_EXIT=$?

# Step 5.2 — install plugin from the freshly built zip
ZIP_PATH=$(find dist .tmp/dist -name "designinserter-*.zip" 2>/dev/null | head -1)
ZIP_HOST_PATH=$(realpath "$ZIP_PATH")
docker cp "$ZIP_HOST_PATH" designinserter-wp:/tmp/plugin.zip 2>&1 | tee "$EVIDENCE_DIR/gate5-cp.log"
docker compose exec -T wordpress wp plugin install /tmp/plugin.zip --activate --force --allow-root \
  > "$EVIDENCE_DIR/gate5-install.txt" 2>&1
INSTALL_EXIT=$?

# Step 5.3 — render shortcode via wp eval
docker compose exec -T wordpress wp eval 'echo do_shortcode("[designinserter_part id=\"heading-1\"]");' --allow-root \
  > "$EVIDENCE_DIR/gate5-shortcode.html" 2>&1

# Step 5.4 — render dynamic block via wp eval
docker compose exec -T wordpress wp eval 'echo do_blocks("<!-- wp:designinserter/css-part {\"partId\":\"loading-4\"} /-->");' --allow-root \
  > "$EVIDENCE_DIR/gate5-block.html" 2>&1

# Step 5.5 — REST API smoke (as admin)
docker compose exec -T wordpress wp eval 'wp_set_current_user(1); $r=new WP_REST_Request("GET","/designinserter/v1/parts/heading-1"); $r->set_param("id","heading-1"); $resp=rest_do_request($r); echo wp_json_encode($resp->get_data());' --allow-root \
  > "$EVIDENCE_DIR/gate5-rest.json" 2>&1

# Step 5.6 — teardown (if DI_QA_KEEP_DOCKER not set)
[ -z "$DI_QA_KEEP_DOCKER" ] && docker compose down -v > "$EVIDENCE_DIR/gate5-down.log" 2>&1
```

### Expected output (PASS conditions)

| Step | PASS marker | FAIL marker |
|---|---|---|
| 5.1 up | exit 0, `wordpress` + `db` healthy | non-zero OR `unhealthy` |
| 5.2 install | `Plugin installed successfully` OR `is already activated` | `Error:` |
| 5.3 shortcode | output contains `data-designinserter-id="heading-1"` AND `<style data-designinserter-style="heading-1"` | missing markers OR empty |
| 5.4 block | output contains `data-designinserter-id="loading-4"` | missing OR empty |
| 5.5 REST | output is valid JSON with `id:"heading-1"` and `html` + `css` keys | invalid JSON OR `WP_Error` |

### Verification

```bash
grep -q 'data-designinserter-id="heading-1"' "$EVIDENCE_DIR/gate5-shortcode.html" && echo "5.3 PASS" || echo "5.3 FAIL"
grep -q 'data-designinserter-id="loading-4"' "$EVIDENCE_DIR/gate5-block.html"     && echo "5.4 PASS" || echo "5.4 FAIL"
python3 -c "
import json
d=json.load(open('$EVIDENCE_DIR/gate5-rest.json'))
assert d.get('id')=='heading-1', d
assert 'html' in d and 'css' in d, list(d.keys())
print('5.5 PASS')"
```

---

## Completion gate

### All-PASS condition

ALL gates 1-5 must report PASS (or documented INAPPLICABLE for gate 3 if Docker unavailable in the host).

### Evidence aggregation

```bash
EVIDENCE_DIR=$(cat /tmp/di-runbook-evidence-dir.txt)

cat > "$EVIDENCE_DIR/SUMMARY.md" <<EOF
# Runbook execution summary

- Runbook: doc/qa-runbook-2026-05-18.md
- Executed at: $(date -u +%Y-%m-%dT%H:%M:%SZ)
- Repo HEAD: $(git -C $PWD log -1 --oneline)
- Host: $(uname -s) $(uname -r)

## Per-gate results

| Gate | Result | Evidence file |
|---|---|---|
| 1 Static (PHPUnit + PHPCS + JS + npm) | <FILL> | gate1-*.txt |
| 2 Build (zip generation) | <FILL> | gate2-*.txt |
| 3 E2E (Playwright fresh-install) | <FILL> | gate3-*.txt |
| 4 CI green (main + releases) | <FILL> | gate4-*.json |
| 5 Runtime render (shortcode + block + REST) | <FILL> | gate5-*.html/.json |

## Source attribution

All gates run on host: [実機目視]
CI cross-check: [CI] gate4-main-runs.json

EOF
```

### FAIL handling

For each FAIL gate:

1. Capture the FAIL evidence file path in `SUMMARY.md`.
2. Open a GitHub Issue per the universal pipeline (§B in kyokucho mandate):
   - Title format: `bug(qa): <gate-id> FAIL on <commit>` e.g., `bug(qa): gate3 FAIL on d511cecc`
   - Body: paste relevant lines from FAIL evidence, link to runbook
   - Label: `bug`, `qa`
3. Do NOT proceed to PR until the Issue describes the gap with file:line evidence.

### After all-PASS

```bash
# Stamp PASS marker
EVIDENCE_DIR=$(cat /tmp/di-runbook-evidence-dir.txt)
echo "PASS at $(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$EVIDENCE_DIR/PASS.txt"
# Optionally commit evidence dir as a release-snapshot doc
git -C $PWD add -f "$EVIDENCE_DIR"
git -C $PWD commit -m "qa: runbook 2026-05-18 PASS on $(git -C $PWD rev-parse --short origin/main)"
```

---

## AI execution protocol

A future AI running this runbook MUST:

1. Read `Prerequisites` first. If any prerequisite cannot be satisfied autonomously, output `BLOCKED: <reason>` and HALT — do NOT skip or pretend.
2. Run gates 1 → 5 sequentially. Do NOT skip ahead.
3. After each gate, write a one-line `<gate-id>:<PASS|FAIL>:<short-reason>` to a running tally.
4. After all gates, produce the `SUMMARY.md` and `PASS.txt` (or open Issues per FAIL handling).
5. Verification source tagging per `verification-source-mandate`:
   - `[実機目視]` = direct host execution (gates 1-5 default)
   - `[CI]` = GitHub Actions cross-check (gate 4.1, 4.2)
   - `[コミットメッセージ主張]` = explicitly forbidden as a PASS source
6. NEVER mark a gate PASS based on "looks correct from reading the output" — every PASS must come from a `grep -q ... && echo PASS` or equivalent mechanical check.

## Cross-references

- Test infrastructure: `docs/testing.md`
- Test coverage matrix: `docs/test-matrix-2026-05-17.md`
- 5-phase audit doc: `doc/comprehensive-audit-2026-05-18.md`
- E2E spec source: `tests/e2e/fresh-install-222.spec.mjs`
- PHPUnit suite: `tests/php/DesignInserterCoreTest.php`
- CI workflow: `.github/workflows/test.yml`
- Universal post-audit PR pipeline: kyokucho directive 2026-05-18 (B)

## Maintenance

Re-author this runbook when:
- A new top-5 critical path is added (e.g., admin UI gets new actions)
- An existing gate's tooling changes (e.g., PHPUnit 10 migration)
- The release version bumps past v1.0.0

Last reviewed: 2026-05-18
