import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pluginDir = 'wp-content/plugins/designinserter';
const themeDir = 'wp-content/themes/designinserter-dev';
const catalogPath = path.join(pluginDir, 'data/css-stock-parts.json');

let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`not ok - ${message}`);
}

function pass(message) {
  console.log(`ok - ${message}`);
}

function assert(condition, message) {
  if (condition) {
    pass(message);
  } else {
    fail(message);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function listFiles(dir, predicate = () => true) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listFiles(abs, predicate));
    } else if (predicate(abs)) {
      out.push(abs);
    }
  }
  return out;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    ...options,
  });

  return result;
}

function testPhpSyntax() {
  const phpFiles = [
    ...listFiles(pluginDir, (file) => file.endsWith('.php')),
    ...listFiles(themeDir, (file) => file.endsWith('.php')),
    ...listFiles('tests', (file) => file.endsWith('.php')),
  ].sort();

  const missingPhp = run('php', ['-v']);
  if (missingPhp.status !== 0) {
    fail('php CLI is available');
    return;
  }

  for (const file of phpFiles) {
    const result = run('php', ['-l', file]);
    if (result.status !== 0) {
      fail(`PHP syntax: ${file}\n${result.stderr || result.stdout}`);
      return;
    }
  }

  pass(`PHP syntax passed for ${phpFiles.length} files`);
}

function testGitVisibility() {
  const requiredUnignored = [
    'tests/wp-stubs.php',
    'tests/render-smoke.php',
    'tests/catalog-fallback.php',
    'scripts/test.mjs',
    'scripts/wp-smoke.mjs',
    'scripts/build-plugin-zip.mjs',
    'docs/testing.md',
  ];
  const ignored = [];

  for (const file of requiredUnignored) {
    const result = run('git', ['check-ignore', '-q', file]);
    if (result.status === 0) {
      ignored.push(file);
    }
  }

  assert(ignored.length === 0, `test/build/smoke support files are not git-ignored${ignored.length ? `: ${ignored.join(', ')}` : ''}`);
}

function testJavaScriptSyntax() {
  const jsFiles = [
    ...listFiles('scripts', (file) => file.endsWith('.mjs') || file.endsWith('.js')),
    ...listFiles(path.join(pluginDir, 'assets'), (file) => file.endsWith('.js')),
  ].sort();

  for (const file of jsFiles) {
    const result = run('node', ['--check', file]);
    if (result.status !== 0) {
      fail(`JavaScript syntax: ${file}\n${result.stderr || result.stdout}`);
      return;
    }
  }

  pass(`JavaScript syntax passed for ${jsFiles.length} files`);
}

function getPreviewKind(buffer) {
  const textStart = buffer.subarray(0, 128).toString('utf8').trimStart();

  if (textStart.startsWith('<svg') || textStart.startsWith('<?xml')) return 'svg';
  if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') return 'webp';
  if (buffer.subarray(0, 3).toString('ascii') === 'GIF') return 'gif';
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';

  return 'unknown';
}

function extractCatalogAssetReferences(part) {
  const refs = [];
  const pattern = /\b(?:src|href)=(['"])(assets\/(?:embedded|previews)\/[^'"]+)\1|url\(\s*(['"]?)(assets\/(?:embedded|previews)\/[^)'" \t\r\n]+)\3\s*\)/g;

  for (const field of ['html', 'css']) {
    const text = typeof part[field] === 'string' ? part[field] : '';
    for (const match of text.matchAll(pattern)) {
      refs.push({
        field,
        path: match[2] || match[4],
      });
    }
  }

  return refs;
}

function testCatalog() {
  const catalog = readJson(catalogPath);
  const parts = Array.isArray(catalog.parts) ? catalog.parts : [];
  const categories = Array.isArray(catalog.categories) ? catalog.categories : [];
  const ids = new Set();
  const categoryCounts = new Map();
  const requiredKeys = ['id', 'sourcePartId', 'category', 'categoryLabel', 'title', 'html'];
  const badRequired = [];
  const badIds = [];
  const duplicateIds = [];
  const externalPreview = [];
  const missingPreview = [];
  const badPreviewKind = [];
  let assetRefCount = 0;
  const missingAssetRefs = [];
  const badAssetRefKind = [];
  const badSource = [];

  for (const category of categories) {
    categoryCounts.set(category.slug, 0);
  }

  for (const part of parts) {
    if (!requiredKeys.every((key) => Object.hasOwn(part, key))) {
      badRequired.push(part.id || '<missing id>');
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9]+$/.test(part.id)) {
      badIds.push(part.id);
    }

    if (ids.has(part.id)) {
      duplicateIds.push(part.id);
    }
    ids.add(part.id);

    if (categoryCounts.has(part.category)) {
      categoryCounts.set(part.category, categoryCounts.get(part.category) + 1);
    }

    if (!part.sourceUrl || !part.sourceUrl.startsWith(`${catalog.sourceUrl}/${part.category}#`)) {
      badSource.push(part.id);
    }

    if (part.previewImage) {
      if (/^https?:\/\//.test(part.previewImage)) {
        externalPreview.push(part.id);
      }

      const previewPath = path.join(pluginDir, part.previewImage);
      if (!fs.existsSync(previewPath)) {
        missingPreview.push(part.id);
      } else {
        const ext = path.extname(previewPath).slice(1);
        const kind = getPreviewKind(fs.readFileSync(previewPath));
        if (kind !== ext) {
          badPreviewKind.push(`${part.id}: .${ext} contains ${kind}`);
        }
      }
    }

    const assetRefs = extractCatalogAssetReferences(part);
    assetRefCount += assetRefs.length;

    for (const assetRef of assetRefs) {
      const assetPath = path.join(pluginDir, assetRef.path);
      if (!fs.existsSync(assetPath)) {
        missingAssetRefs.push(`${part.id}:${assetRef.field}:${assetRef.path}`);
      } else {
        const ext = path.extname(assetPath).slice(1);
        const kind = getPreviewKind(fs.readFileSync(assetPath));
        if (kind !== ext) {
          badAssetRefKind.push(`${part.id}: ${assetRef.path} contains ${kind}`);
        }
      }
    }
  }

  const badCategoryCounts = categories.filter((category) => categoryCounts.get(category.slug) !== category.expectedPartCount);
  const svgOnly = parts.filter((part) => part.category === 'loading' && typeof part.css === 'string' && part.css.trim() === '');

  assert(catalog.sourceName === 'CSS Stock', 'catalog sourceName is CSS Stock');
  assert(catalog.total === 222 && catalog.expectedTotal === 222 && parts.length === 222, 'catalog has 222 expected parts');
  assert(categories.length === 28, 'catalog has 28 categories');
  assert(badRequired.length === 0, `all parts include required keys${badRequired.length ? `: ${badRequired.slice(0, 5).join(', ')}` : ''}`);
  assert(badIds.length === 0, `all part ids use slug-number format${badIds.length ? `: ${badIds.slice(0, 5).join(', ')}` : ''}`);
  assert(duplicateIds.length === 0, `all part ids are unique${duplicateIds.length ? `: ${duplicateIds.slice(0, 5).join(', ')}` : ''}`);
  assert(badCategoryCounts.length === 0, `category expected counts match${badCategoryCounts.length ? `: ${badCategoryCounts.map((c) => c.slug).join(', ')}` : ''}`);
  assert(externalPreview.length === 0, `previewImage values are local${externalPreview.length ? `: ${externalPreview.slice(0, 5).join(', ')}` : ''}`);
  assert(missingPreview.length === 0, `all preview files exist${missingPreview.length ? `: ${missingPreview.slice(0, 5).join(', ')}` : ''}`);
  assert(badPreviewKind.length === 0, `preview extensions match file signatures${badPreviewKind.length ? `: ${badPreviewKind.slice(0, 5).join(', ')}` : ''}`);
  assert(assetRefCount === 5, `catalog embedded asset reference count is stable${assetRefCount !== 5 ? `: ${assetRefCount}/5` : ''}`);
  assert(missingAssetRefs.length === 0, `all catalog embedded asset references exist${missingAssetRefs.length ? `: ${missingAssetRefs.slice(0, 5).join(', ')}` : ''}`);
  assert(badAssetRefKind.length === 0, `catalog embedded asset extensions match file signatures${badAssetRefKind.length ? `: ${badAssetRefKind.slice(0, 5).join(', ')}` : ''}`);
  assert(badSource.length === 0, `part sourceUrl values point to CSS Stock anchors${badSource.length ? `: ${badSource.slice(0, 5).join(', ')}` : ''}`);
  assert(svgOnly.length > 0, 'catalog includes SVG-only loading parts with empty CSS');
}

function testCatalogFallbacks() {
  for (const mode of ['missing', 'invalid']) {
    const result = run('php', ['tests/catalog-fallback.php', mode]);
    if (result.status !== 0) {
      fail(`catalog ${mode} fallback failed\n${result.stderr || result.stdout}`);
      return;
    }
  }

  pass('catalog missing/invalid JSON fallbacks passed');
}

function testBehaviorMetadata() {
  const catalog = readJson(catalogPath);
  const parts = Array.isArray(catalog.parts) ? catalog.parts : [];
  const frontend = fs.readFileSync(path.join(pluginDir, 'assets/frontend.js'), 'utf8');
  const supportedTypes = ['scrollTop', 'tooltip', 'readMore', 'tabs', 'modal'];
  const expectedCounts = new Map([
    ['scrollTop', 1],
    ['tooltip', 5],
    ['readMore', 4],
    ['tabs', 4],
    ['modal', 2],
  ]);
  const behaviorCounts = new Map();
  const unsupported = [];
  const missingRootSelector = [];
  const missingSelectors = [];
  const missingFrontendHandler = [];

  for (const type of supportedTypes) {
    if (!frontend.includes(`behavior === '${type}'`)) {
      missingFrontendHandler.push(type);
    }
  }

  for (const part of parts) {
    if (!part.behavior) {
      continue;
    }

    const behavior = part.behavior;
    behaviorCounts.set(behavior.type, (behaviorCounts.get(behavior.type) || 0) + 1);

    if (!supportedTypes.includes(behavior.type)) {
      unsupported.push(`${part.id}:${behavior.type}`);
    }

    if (behavior.requiresJs && (typeof behavior.rootSelector !== 'string' || behavior.rootSelector.trim() === '')) {
      missingRootSelector.push(part.id);
    }

    if (behavior.requiresJs && (!Array.isArray(behavior.selectors) || behavior.selectors.length === 0)) {
      missingSelectors.push(part.id);
    }
  }

  const badCounts = [];
  for (const [type, expectedCount] of expectedCounts) {
    const actualCount = behaviorCounts.get(type) || 0;
    if (actualCount !== expectedCount) {
      badCounts.push(`${type}: ${actualCount}/${expectedCount}`);
    }
  }

  assert(missingFrontendHandler.length === 0, `frontend.js handles every catalog behavior type${missingFrontendHandler.length ? `: ${missingFrontendHandler.join(', ')}` : ''}`);
  assert(unsupported.length === 0, `catalog behavior types are supported by frontend.js${unsupported.length ? `: ${unsupported.slice(0, 5).join(', ')}` : ''}`);
  assert(missingRootSelector.length === 0, `JS-required behavior parts declare rootSelector${missingRootSelector.length ? `: ${missingRootSelector.slice(0, 5).join(', ')}` : ''}`);
  assert(missingSelectors.length === 0, `JS-required behavior parts declare selectors metadata${missingSelectors.length ? `: ${missingSelectors.slice(0, 5).join(', ')}` : ''}`);
  assert(badCounts.length === 0, `behavior metadata counts match expected catalog coverage${badCounts.length ? `: ${badCounts.join(', ')}` : ''}`);
}

function testDistributionShape() {
  const packageJson = readJson('package.json');
  const packageLock = readJson('package-lock.json');
  const catalog = readJson(catalogPath);
  const mainFile = path.join(pluginDir, 'designinserter.php');
  const main = fs.readFileSync(mainFile, 'utf8');
  const notice = fs.readFileSync(path.join(pluginDir, 'NOTICE.md'), 'utf8');
  const requiredFiles = [
    'designinserter.php',
    'NOTICE.md',
    'assets/editor.js',
    'assets/editor.css',
    'assets/frontend.js',
    'assets/frontend.css',
    'data/css-stock-parts.json',
    'includes/data.php',
    'includes/render.php',
    'includes/block.php',
    'includes/admin.php',
    'includes/rest-api.php',
  ];
  const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(pluginDir, file)));

  assert(missing.length === 0, `plugin distribution files exist${missing.length ? `: ${missing.join(', ')}` : ''}`);
  assert(packageJson.license === 'GPL-2.0-or-later', 'package.json license matches plugin distribution license');
  assert(packageLock.packages && packageLock.packages[''] && packageLock.packages[''].license === packageJson.license, 'package-lock root license matches package.json');
  assert(main.includes('Plugin Name: Design Inserter'), 'plugin header has Plugin Name');
  assert(main.includes(`Version: ${packageJson.version}`), 'plugin header version matches package.json');
  assert(main.includes(`define( 'DESIGNINSERTER_VERSION', '${packageJson.version}' );`), 'plugin version constant matches package.json');
  assert(main.includes(`define( 'DESIGNINSERTER_SOURCE_URL', '${catalog.sourceUrl}' );`), 'plugin source URL constant matches catalog sourceUrl');
  assert(/Requires at least:\s+6\.0/.test(main), 'plugin header declares minimum WordPress version');
  assert(/Requires PHP:\s+7\.4/.test(main), 'plugin header declares minimum PHP version');
  assert(/License:\s+GPL-2\.0-or-later/.test(main), 'plugin header declares GPL-2.0-or-later');
  assert(/License URI:\s+https:\/\/www\.gnu\.org\/licenses\/gpl-2\.0\.html/.test(main), 'plugin header declares GPL license URI');
  assert(/Text Domain:\s+designinserter/.test(main), 'plugin header declares text domain');
  assert(notice.includes(catalog.sourceName) && notice.includes(catalog.sourceUrl), 'NOTICE keeps catalog source attribution and URL');
}

function testEditorAssetContract() {
  const editor = fs.readFileSync(path.join(pluginDir, 'assets/editor.js'), 'utf8');
  const block = fs.readFileSync(path.join(pluginDir, 'includes/block.php'), 'utf8');

  assert(editor.includes("window.DesignInserterCatalog || {}"), 'editor reads localized DesignInserterCatalog');
  assert(editor.includes("blocks.registerBlockType( 'designinserter/css-part'"), 'editor registers designinserter/css-part block');
  assert(editor.includes("return null;"), 'editor save function is dynamic-block only');
  assert(editor.includes('window.fetch( restUrl + partId'), 'editor fetches selected part content through REST');
  assert(editor.includes('dangerouslySetInnerHTML'), 'editor preview renders catalog HTML');
  assert(block.includes("'wp-block-editor'"), 'block registration declares wp-block-editor dependency');
  assert(block.includes("'DesignInserterCatalog'"), 'block registration localizes editor catalog');
  assert(block.includes("'render_callback' => 'designinserter_render_block'"), 'block registration uses PHP render callback');
}

function testSmokeScriptContract() {
  const smoke = fs.readFileSync('scripts/wp-smoke.mjs', 'utf8');

  assert(smoke.includes("process.env.WP_SMOKE_WP_VERSION || '6.9.4'"), 'portable smoke pins WordPress version by default');
  assert(smoke.includes("process.env.WP_SMOKE_WP_CLI_VERSION || '2.12.0'"), 'portable smoke pins WP-CLI version by default');
  assert(smoke.includes('WP_SMOKE_TIMEOUT_MS'), 'smoke commands have a configurable timeout');
  assert(smoke.includes('error_reporting=6143'), 'portable smoke suppresses WP-CLI dependency deprecation noise');
  assert(smoke.includes('class SmokeEnvironmentError extends Error'), 'portable smoke separates environment failures from plugin failures');
  assert(smoke.includes("fs.mkdtempSync(path.join(os.tmpdir(), 'designinserter-real-wp-smoke-'))"), 'portable smoke uses unique temp directories by default');
  assert(smoke.includes('WP_SMOKE_PORTABLE_DIR'), 'portable smoke allows explicit inspection directory override');
  assert(smoke.includes('WP_SMOKE_KEEP_PORTABLE'), 'portable smoke can keep temp runtime for inspection');
  assert(smoke.includes('Unsafe WP_SMOKE_PORTABLE_DIR'), 'portable smoke rejects unsafe explicit directories');
  assert(smoke.includes('cleanupPortableRoot'), 'portable smoke cleans unique temp runtimes by default');
  assert(smoke.includes('unpackDistributionZipIntoPortableWp'), 'portable smoke unpacks built zip when available');
  assert(smoke.includes("requireCommand('unzip')"), 'portable zip smoke requires unzip before unpacking');
  assert(smoke.includes('assertDistributionZipFresh'), 'portable zip smoke verifies the built zip matches current plugin source');
  assert(smoke.includes('crc32Hex'), 'portable zip smoke compares zip entry CRCs to current source files');
  assert(smoke.includes('Distribution zip is stale; run npm run build before portable zip smoke.'), 'portable zip smoke fails stale distribution archives');
  assert(smoke.includes('zip content differs from plugin source'), 'portable zip smoke reports changed source files when the zip is stale');
  assert(smoke.includes('Distribution zip version mismatch'), 'portable zip smoke fails when only another version zip is present');
  assert(smoke.includes('expectedName'), 'portable zip smoke derives the expected zip from package.json version');
  assert(smoke.includes('Distribution zip did not unpack designinserter.php'), 'portable zip smoke verifies the unpacked plugin root');
  assert(!smoke.includes("plugin', 'install'") && !smoke.includes('wp plugin install'), 'portable zip smoke avoids the WP-CLI plugin installer under SQLite');
  assert(smoke.includes("plugin', 'is-active', 'designinserter'"), 'portable smoke verifies WordPress marks the plugin active');
  assert(smoke.includes('Portable zip-installed shortcode smoke'), 'portable smoke renders shortcode from zip-installed plugin');
  assert(smoke.includes("plugin', 'delete', 'designinserter'"), 'portable smoke removes zip-installed plugin before source smoke');
  assert(smoke.includes('hook registration smoke failed'), 'portable smoke verifies real shortcode and hook registration');
  assert(smoke.includes('editor catalog contract smoke failed'), 'portable smoke verifies real localized editor catalog shape');
  assert(smoke.includes('frontend base style smoke failed'), 'portable smoke verifies real wp_enqueue_scripts base style enqueue');
  assert(smoke.includes('REST route contract smoke failed'), 'portable smoke verifies real REST route method and argument contract');
  assert(smoke.includes('REST permission smoke failed'), 'portable smoke verifies real REST permission denial');
  assert(smoke.includes('REST not-found smoke failed'), 'portable smoke verifies real REST missing-part errors');
  assert(smoke.includes('admin page smoke failed'), 'portable smoke verifies the real admin page callback output');
  assert(smoke.includes('style dedupe smoke failed'), 'portable smoke verifies real CSS style de-duplication');
  assert(smoke.includes('embedded asset render smoke failed'), 'portable smoke verifies real embedded asset URL resolution');
  assert(smoke.includes('interactive render scoping smoke failed'), 'portable smoke verifies real interactive render scoping');
  assert(smoke.includes('REST interactive scoping smoke failed'), 'portable smoke verifies real REST interactive preview scoping');
  assert(smoke.includes('REST embedded asset smoke failed'), 'portable smoke verifies real REST embedded asset URL resolution');
  assert(!smoke.includes('runPortableSmokeOld'), 'portable smoke has no dead duplicate implementation');
  assert(smoke.includes('assertDockerPortIsSafe'), 'Docker smoke checks host port before startup');
  assert(smoke.includes("readPortEnv('WP_PORT', 8080)"), 'Docker smoke honors WP_PORT override');
  assert(smoke.includes("envName: 'MYSQL_PORT', defaultPort: 3316"), 'Docker smoke checks MYSQL_PORT conflicts');
  assert(smoke.includes('process.env.WP_HOME = getDockerWpUrl()'), 'Docker smoke aligns WP_HOME with the selected WordPress port');
  assert(smoke.includes('`--url=${getDockerWpUrl()}`'), 'Docker smoke installs WordPress with the selected WordPress URL');
  assert(smoke.includes('${getDockerWpUrl()}/wp-admin/'), 'Docker smoke reports the selected WordPress admin URL');
  assert(smoke.includes('isHostPortAvailable'), 'Docker smoke can detect occupied host ports');
  assert(smoke.includes("timeout: 5000"), 'Docker port probe has a short timeout');
  assert(smoke.includes("timeout: commandTimeoutMs"), 'Docker availability probe has timeout protection');
  assert(smoke.includes('assertComposeRuntimeStable'), 'Docker smoke checks compose runtime stability');
  assert(smoke.includes('waitMs(3000)'), 'Docker smoke rechecks for short-lived runtime exits');
  assert(smoke.includes("['compose', 'exec', '-T', 'wordpress', 'wp', 'core', 'is-installed', '--allow-root']"), 'Docker install probe uses the timeout-wrapped runner');
}

function testBuildScriptContract() {
  const build = fs.readFileSync('scripts/build-plugin-zip.mjs', 'utf8');

  assert(build.includes("spawnSync('unzip', ['-tq', outPath]"), 'build verifies zip integrity with unzip');
  assert(build.includes('missingSourceFiles'), 'build verifies all plugin source files are present in zip');
  assert(build.includes('unexpectedDevFiles'), 'build rejects repo-level dev/test/build files in zip');
  assert(build.includes('missingPreviewEntries'), 'build verifies catalog preview files are present in zip');
  assert(build.includes('expectedCatalogAssetReferenceCount'), 'build verifies the catalog embedded asset reference count');
  assert(build.includes('missingCatalogAssetEntries'), 'build verifies catalog embedded asset references are present in zip');
  assert(build.includes('headerFailures'), 'build verifies plugin headers inside zip');
  assert(build.includes('DESIGNINSERTER_VERSION'), 'build verifies plugin version constant inside zip');
  assert(build.includes('DESIGNINSERTER_SOURCE_URL'), 'build verifies plugin source URL constant inside zip');
  assert(build.includes('Requires at least: 6.0'), 'build verifies minimum WordPress header inside zip');
  assert(build.includes('Requires PHP: 7.4'), 'build verifies minimum PHP header inside zip');
  assert(build.includes('License URI: https://www.gnu.org/licenses/gpl-2.0.html'), 'build verifies license URI header inside zip');
  assert(build.includes('catalog.total === 222'), 'build verifies catalog totals inside zip');
  assert(build.includes('catalog.categories.length === 28'), 'build verifies category totals inside zip');
}

function testRenderSmoke() {
  const result = run('php', ['tests/render-smoke.php']);
  if (result.status === 0) {
    pass('PHP WordPress stub smoke passed');
  } else {
    fail(`PHP WordPress stub smoke failed\n${result.stderr || result.stdout}`);
  }
}

testPhpSyntax();
testGitVisibility();
testJavaScriptSyntax();
testCatalog();
testCatalogFallbacks();
testBehaviorMetadata();
testDistributionShape();
testEditorAssetContract();
testSmokeScriptContract();
testBuildScriptContract();
testRenderSmoke();

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}

console.log('\nAll local quality checks passed');
