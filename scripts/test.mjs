import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

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
    fail('php CLI is not available');
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
    'tests/portable-smoke-integration.php',
    'tests/generate-ready-checklist.test.mjs',
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
  assert(editor.includes("sandbox: ''"), 'editor preview isolates catalog HTML in sandboxed iframe (C-02 XSS hardening)');
  assert(editor.includes('srcDoc:'), 'editor preview uses srcDoc inline document (no separate URL fetch)');
  assert(!editor.includes('dangerouslySetInnerHTML'), 'editor preview does NOT use dangerouslySetInnerHTML on catalog HTML (replaced by iframe sandbox)');
  assert(block.includes("'wp-block-editor'"), 'block registration declares wp-block-editor dependency');
  assert(block.includes("'DesignInserterCatalog'"), 'block registration localizes editor catalog');
  assert(block.includes("'render_callback' => 'designinserter_render_block'"), 'block registration uses PHP render callback');
}

// NOTE: testSmokeScriptContract / testBuildScriptContract removed (Issue #7).
// They grepped script source strings, which is brittle (Gemini PR #6 review).
// Smoke and build behavior is verified by running them directly
// (`npm run smoke:wp:portable` / `npm run build`); contract drift will surface
// there as a real failure instead of a string-includes false positive.


function testRenderSmoke() {
  const result = run('php', ['tests/render-smoke.php']);
  if (result.status === 0) {
    // スキップを黙らせると「検証済み」と誤読されるので、件数と理由をそのまま出す
    for (const line of (result.stdout || '').split('\n')) {
      if (line.includes('skip')) {
        console.log(line.trimEnd());
      }
    }
    pass('PHP WordPress stub smoke passed');
  } else {
    fail(`PHP WordPress stub smoke failed\n${result.stderr || result.stdout}`);
  }
}

function testPartCodeFuncs() {
  const src = fs.readFileSync(path.join(pluginDir, 'assets/part-code-funcs.js'), 'utf8');
  const ctx = { window: {}, console };
  vm.createContext(ctx);
  vm.runInContext(src, ctx);
  const funcs = ctx.window.designInserterPartCodeFuncs;

  assert(Object.keys(funcs).length === 222, 'part-code-funcs.js registers all 222 parts');

  const heading = funcs['heading-1']({ colors: ['#ff0000', '#333333'] });
  assert(heading && heading.css.includes('#ff0000'), 'heading-1 color param changes border color');

  const list = funcs['list-1']({ colors: ['#2589d0'], radios: ['ol', false] });
  assert(list && list.html.startsWith('<ol'), 'list-1 radio tag switches to ol');

  const bar = funcs['bar-chart-1']({ colors: ['#2589d0'], radios: [true], ranges: [80] });
  assert(bar && bar.html.includes('80%'), 'bar-chart-1 range param updates first bar width');

  const button = funcs['button-37']({ colors: ['#123456'], radios: ['25px', false] });
  assert(button && button.css.includes('#123456'), 'button-37 color param changes border color');

  const radar = funcs['radar-chart-4']({ colors: ['#ff0000'], ranges: [8, 5, 6, 7, 6, 5, 4] });
  assert(radar && radar.html.includes('<svg'), 'radar-chart-4 generates svg from range params');

  const loading = funcs['loading-16']({ colors: ['#123456'], ranges: [5] });
  assert(loading && loading.css.includes('#123456'), 'loading-16 color param updates gradient color');
}

function testReadyChecklistArtifactSelection() {
  const result = run('node', ['--test', 'tests/generate-ready-checklist.test.mjs']);
  if (result.status === 0) {
    pass('Ready checklist selects the exact current-version artifact');
  } else {
    fail(`Ready checklist artifact selection failed\n${result.stderr || result.stdout}`);
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
testRenderSmoke();
testPartCodeFuncs();
testReadyChecklistArtifactSelection();

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}

console.log('\nAll local quality checks passed');
