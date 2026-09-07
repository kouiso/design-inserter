# Testing Notes

Tool-level notes only. What is verified, by which test case, and its current status all live in `docs/test-spec.md` — do not duplicate the case list here.

## Local Gate

```bash
npm test
npm run build
npm run php:lint
npm run smoke:wp
```

`npm run smoke:wp` uses Docker when Docker is available. If Docker is unavailable, it tries the portable WordPress smoke first, then falls back to the Docker-free WordPress stub smoke in `tests/render-smoke.php`.

`npm run build` creates `dist/designinserter-<version>.zip` and verifies the archive before reporting success (cases DI-BLD-013 through DI-BLD-016, DI-BLD-019).

## Build modes

There are two build modes. They differ in what happens when the Template Party catalog is still git-crypt encrypted, and they never write to the same path.

| Command | Locked catalog | Decrypted catalog | Output |
|---|---|---|---|
| `npm run build` (`build:zip`) | fails with exit 1 and prints the `git-crypt unlock` recovery steps; no zip is produced | full release zip | `dist/designinserter-<version>.zip` |
| `npm run build:dev` (`--allow-locked-catalog`) | warns, drops every git-crypt ciphertext file, and succeeds | full zip, still quarantined | `dist/dev/designinserter-<version>-dev.zip` |

Neither mode can put ciphertext into a zip — the flag chooses between *fail* and *exclude*, never *include* (DI-BLD-022, DI-SEC-014). The dev output lives in `dist/dev/` on purpose: `scripts/generate-ready-checklist.mjs` and `scripts/wp-smoke.mjs` both glob `dist/*.zip`, so a degraded artifact must never be able to occupy the release filename.

`data/template-party-bundles/` and `data/template-party-scrape-state.json` are excluded in *both* modes. They only exist on a machine that has run the scraper, and redistributing the bundles violates Template Party's terms — no CI run can catch that, so the build itself has to.

`task ci:fast` runs `build:dev` so the gate stays green without the key. The release path is exercised by `.github/workflows/trusted-test.yml`, which is the only workflow that runs `git-crypt unlock`. Before running `build:dev`, `ci:fast` removes any `dist/designinserter-*.zip` left over from an earlier `npm run build` — otherwise that stale release zip keeps matching the expected filename and `scripts/generate-ready-checklist.mjs` (K036) would report it as the current candidate without ever re-verifying it against the now-changed sources.

## Template Party data and git-crypt

`data/template-party-*.json` and `assets/previews/tp-*` are git-crypt encrypted. Without the key the catalog falls back to the 222 design parts. `tests/tp-availability.php` detects which mode is active; Template Party assertions are reported as skips with a count rather than silently passing. See `docs/test-spec.md` §2.

`scripts/build-plugin-zip.mjs` mirrors that three-way judgement in JavaScript (`inspectCatalogFile()`): locked → skip or fail depending on the build mode, decrypted-but-broken → always fail, valid → proceed. A malformed catalog is never downgraded to "locked", because that would let a data regression pass as a missing key. `tests/build-plugin-zip.test.mjs` covers the classification with fixtures, so it runs without the key.

## Portable WordPress Smoke

```bash
npm run smoke:wp:portable
```

Downloads WP-CLI and WordPress into a unique `/tmp/designinserter-real-wp-smoke-*` directory, installs the SQLite drop-in, and activates the plugin. If `dist/designinserter-<version>.zip` exists, it first verifies the zip entries match the current plugin source tree, unpacks that zip into the portable WordPress plugin directory, activates it through WP-CLI, then deletes it and runs the source-tree activation smoke. A stale zip or a zip from another package version fails with an instruction to run `npm run build`.

The zip is unpacked directly instead of using `wp plugin install` because the WP-CLI upgrader path can trigger noisy `information_schema` queries with the SQLite drop-in.

### Environment variables

| Variable | Effect |
|---|---|
| `WP_SMOKE_PORTABLE_DIR` | Use a stable path instead of a unique temp directory |
| `WP_SMOKE_KEEP_PORTABLE=1` | Keep the temporary runtime after the run |
| `WP_SMOKE_WP_VERSION` | Override the pinned WordPress version (default `6.9.4`) |
| `WP_SMOKE_WP_CLI_VERSION` / `WP_SMOKE_WP_CLI_URL` | Override the pinned WP-CLI (default `2.12.0`) |
| `WP_SMOKE_TIMEOUT_MS` | Per-command timeout (default 180000) |

Versions are pinned to avoid surprise breakage from moving `latest` targets.

### Requirements

- `php`, `curl`, and `unzip` (the latter when the built distribution zip exists)
- PHP extensions: `sqlite3`, `pdo_sqlite`, `mysqli`
- Network access to download WP-CLI, WordPress, and the SQLite drop-in

WP-CLI runs with PHP deprecation notices disabled so dependency deprecations from the phar do not turn a passing smoke into noisy output. Plugin failures and explicit smoke assertions still fail the run.

## Docker Smoke

The Docker smoke checks both `WP_PORT` and `MYSQL_PORT` before startup, aligns `WP_HOME` and `wp core install --url` with the selected WordPress port, and rechecks the `db`/`wordpress` services after a short delay so port conflicts and quickly exiting runtimes fail before handoff. Docker availability and WP-CLI install probes use the smoke command timeout so a stuck Docker daemon does not leave the task idle indefinitely.
