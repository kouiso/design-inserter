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

`npm run build` creates `dist/designinserter-<version>.zip` and verifies the archive before reporting success (cases DI-BLD-013 through DI-BLD-016).

## Template Party data and git-crypt

`data/template-party-*.json` and `assets/previews/tp-*` are git-crypt encrypted. Without the key the catalog falls back to the 222 design parts. `tests/tp-availability.php` detects which mode is active; Template Party assertions are reported as skips with a count rather than silently passing. See `docs/test-spec.md` §2.

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
