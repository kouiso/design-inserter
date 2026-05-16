# Testing Notes

## Local Gate

Run these before distributing a zip:

```bash
npm test
npm run build
npm run php:lint
npm run smoke:wp
```

`npm run smoke:wp` uses Docker when Docker is available. If Docker is unavailable, it tries the portable WordPress smoke first, then falls back to the Docker-free WordPress stub smoke in `tests/render-smoke.php`.

`npm run build` creates `dist/designinserter-<version>.zip` and verifies the archive before reporting success. The verification checks archive integrity, single `designinserter/` root, required plugin files, plugin header metadata including version/WordPress/PHP/license/license-URI/text-domain headers, the PHP `DESIGNINSERTER_VERSION` constant, the PHP `DESIGNINSERTER_SOURCE_URL` constant against the catalog `sourceUrl`, catalog totals, all catalog preview images, all catalog embedded asset references, and absence of repo-level dev/test/build files.

## Portable WordPress Smoke

Run explicitly with:

```bash
npm run smoke:wp:portable
```

This downloads WP-CLI and WordPress into a unique `/tmp/designinserter-real-wp-smoke-*` directory, installs the SQLite drop-in, activates the local plugin, verifies WordPress marks it active, and verifies shortcode/hook registration, shortcode, dynamic block, editor localization and catalog shape, admin page callback output, CSS style de-duplication, embedded asset URL resolution, interactive render/REST preview scoping, frontend base style and behavior enqueueing, REST route contract, REST allow/deny/not-found behavior, and `the_content` integration. If `dist/designinserter-<version>.zip` exists, it first verifies that the zip entries match the current plugin source tree, unpacks that zip into the portable WordPress plugin directory, verifies the plugin root, activates it through WP-CLI, verifies WordPress marks it active, verifies shortcode/block rendering from the zip-installed plugin, then deletes it and runs the source-tree activation smoke. A stale zip or a zip from another package version fails with an instruction to run `npm run build`. The zip path is unpacked directly instead of using `wp plugin install` because the WP-CLI upgrader path can trigger noisy `information_schema` queries with the SQLite drop-in.

Set `WP_SMOKE_PORTABLE_DIR=/path/to/tmp` when a stable path is needed for inspection. The default unique directory avoids concurrent smoke runs deleting each other's WordPress runtime.
Default unique directories are cleaned after the run. Set `WP_SMOKE_KEEP_PORTABLE=1` to keep the temporary runtime for inspection.

It requires:

- `php`
- `curl`
- `unzip` when the built distribution zip exists
- PHP extensions: `sqlite3`, `pdo_sqlite`, `mysqli`
- network access to download WP-CLI, WordPress, and the SQLite drop-in

By default the portable smoke pins WordPress to `6.9.4` and WP-CLI to `2.12.0` to avoid surprise breakage from moving `latest` targets. Override with `WP_SMOKE_WP_VERSION=<version>`, `WP_SMOKE_WP_CLI_VERSION=<version>`, or `WP_SMOKE_WP_CLI_URL=<url>` when intentionally testing another release. Each spawned command has a timeout controlled by `WP_SMOKE_TIMEOUT_MS` and defaults to 180 seconds.
WP-CLI is invoked with PHP deprecation notices disabled so dependency deprecations from the phar do not turn a passing smoke into noisy, unstable output; plugin failures and explicit smoke assertions still fail the run.

## Stub Smoke Coverage

The stub smoke covers:

- Catalog behavior metadata support for frontend behavior types, JS-required `rootSelector` / selector metadata, and expected behavior coverage counts.
- Catalog embedded asset references exist locally, have stable expected reference counts, and have file signatures matching their extensions.
- Plugin load without a fatal error.
- WordPress hook registration for shortcode, block init, REST route, and admin menu.
- Admin settings page capability contract (`manage_options`).
- Admin settings page callback output for heading, catalog count, source URL, and shortcode example.
- `wp_register_script`, `wp_register_style`, `wp_localize_script`, and dynamic block registration.
- `wp_enqueue_scripts` frontend base style enqueue.
- `do_shortcode()` rendering through the registered shortcode callback.
- `do_blocks()` rendering through the registered dynamic block callback.
- CSS style tag de-duplication when the same part renders more than once.
- Interactive `id` / `for` / `name` scoping for repeated modal/form renders.
- Embedded asset URL resolution in normal render and REST preview output.
- REST preview scoping for interactive `id` / `for` / `name` attributes.
- REST route method/argument contract, including required sanitized `id`.
- REST permission callback allow/deny behavior and `edit_posts` capability check.
- REST dispatch forbidden response shape.
- REST callback success and not-found behavior.
- Behavior metadata enqueueing frontend script/style.
- Missing and invalid catalog JSON fallback is covered by `tests/catalog-fallback.php`.

## Stub Smoke Gaps

The stub smoke does not prove:

- WordPress admin plugin upload/install/activation UI works.
- Gutenberg inserter/sidebar interactions work in a real browser.
- Browser execution of `assets/editor.js` and `assets/frontend.js` has no runtime errors.
- Real REST nonce and capability handling behave exactly as production WordPress.
- Theme/front-end CSS interactions are visually correct.
- WordPress.org submission metadata such as `readme.txt`, `Stable tag`, and `Tested up to`; the current gate targets the built release zip from `wp-content/plugins/designinserter`.

The portable smoke covers much of the real WordPress runtime gap, but admin upload UI, real Gutenberg browser interactions, and visual CSS checks still require `npm run smoke:wp:docker` plus browser/admin verification after Docker or another WordPress runtime is available.

The Docker smoke checks both `WP_PORT` and `MYSQL_PORT` before startup, aligns `WP_HOME` and `wp core install --url` with the selected WordPress port, and rechecks the `db`/`wordpress` services after a short delay so port conflicts and quickly exiting runtimes fail before handoff.
Docker availability and WP-CLI install probes also use the smoke command timeout so a stuck Docker daemon does not leave the task idle indefinitely.

## Spec Drift Note

Some OpenSpec editor UI text still describes the original SelectControl implementation. The current implementation, README, and later commit history use a searchable visual picker with REST lazy loading. Do not regress the implementation back to SelectControl solely for tests; update the spec through the proposal workflow if strict OpenSpec alignment is required.
