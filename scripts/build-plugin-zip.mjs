import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = process.cwd();
const pluginSlug = 'designinserter';
const pluginDir = path.join(root, 'wp-content/plugins', pluginSlug);
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const distDir = path.join(root, 'dist');
const zipPath = path.join(distDir, `${pluginSlug}-${packageJson.version}.zip`);

function listFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.DS_Store') {
      continue;
    }

    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(abs));
    } else {
      files.push(abs);
    }
  }
  return files;
}

const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i += 1) {
  let c = i;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[i] = c >>> 0;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date) {
  const year = Math.max(date.getFullYear(), 1980);
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = (year - 1980) << 9 | (date.getMonth() + 1) << 5 | date.getDate();
  return { time, day };
}

function u16(value) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value);
  return buffer;
}

function u32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value >>> 0);
  return buffer;
}

function createZip(files, outPath) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const file of files) {
    const relative = path.relative(pluginDir, file).split(path.sep).join('/');
    const name = `${pluginSlug}/${relative}`;
    const nameBuffer = Buffer.from(name, 'utf8');
    const source = fs.readFileSync(file);
    const compressed = zlib.deflateRawSync(source, { level: 9 });
    const stat = fs.statSync(file);
    const { time, day } = dosDateTime(stat.mtime);
    const crc = crc32(source);

    const localHeader = Buffer.concat([
      u32(0x04034b50),
      u16(20),
      u16(0x0800),
      u16(8),
      u16(time),
      u16(day),
      u32(crc),
      u32(compressed.length),
      u32(source.length),
      u16(nameBuffer.length),
      u16(0),
      nameBuffer,
    ]);

    localParts.push(localHeader, compressed);

    const centralHeader = Buffer.concat([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0x0800),
      u16(8),
      u16(time),
      u16(day),
      u32(crc),
      u32(compressed.length),
      u32(source.length),
      u16(nameBuffer.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0o100644 << 16),
      u32(offset),
      nameBuffer,
    ]);

    centralParts.push(centralHeader);
    offset += localHeader.length + compressed.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const localData = Buffer.concat(localParts);
  const end = Buffer.concat([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(files.length),
    u16(files.length),
    u32(centralDirectory.length),
    u32(localData.length),
    u16(0),
  ]);

  fs.writeFileSync(outPath, Buffer.concat([localData, centralDirectory, end]));
}

function readZipEntry(outPath, entry) {
  const result = spawnSync('unzip', ['-p', outPath, entry], { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`unzip read failed for ${entry}:\n${result.stderr || result.stdout}`);
  }

  return result.stdout;
}

function extractCatalogAssetReferences(part) {
  const refs = [];
  const pattern = /\b(?:src|href)=(['"])(assets\/(?:embedded|previews)\/[^'"]+)\1|url\(\s*(['"]?)(assets\/(?:embedded|previews)\/[^)'" \t\r\n]+)\3\s*\)/g;

  for (const field of ['html', 'css']) {
    const text = typeof part[field] === 'string' ? part[field] : '';
    for (const match of text.matchAll(pattern)) {
      refs.push(match[2] || match[4]);
    }
  }

  return refs;
}

function verifyZip(outPath, sourceFiles) {
  const unzip = spawnSync('unzip', ['-tq', outPath], { encoding: 'utf8' });
  if (unzip.status !== 0) {
    throw new Error(`unzip verification failed:\n${unzip.stderr || unzip.stdout}`);
  }

  const listing = spawnSync('unzip', ['-Z1', outPath], { encoding: 'utf8' });
  if (listing.status !== 0) {
    throw new Error(`unzip listing failed:\n${listing.stderr || listing.stdout}`);
  }

  const entries = listing.stdout.trim().split(/\r?\n/).filter(Boolean);
  const entrySet = new Set(entries);
  const required = [
    `${pluginSlug}/designinserter.php`,
    `${pluginSlug}/index.php`,
    `${pluginSlug}/NOTICE.md`,
    `${pluginSlug}/assets/editor.js`,
    `${pluginSlug}/assets/editor.css`,
    `${pluginSlug}/assets/frontend.js`,
    `${pluginSlug}/assets/frontend.css`,
    `${pluginSlug}/data/css-stock-parts.json`,
    `${pluginSlug}/includes/admin.php`,
    `${pluginSlug}/includes/block.php`,
    `${pluginSlug}/includes/data.php`,
    `${pluginSlug}/includes/render.php`,
    `${pluginSlug}/includes/rest-api.php`,
  ];
  const expectedEntries = sourceFiles.map((file) => `${pluginSlug}/${path.relative(pluginDir, file).split(path.sep).join('/')}`);
  const missing = required.filter((entry) => !entrySet.has(entry));
  const wrongRoot = entries.filter((entry) => !entry.startsWith(`${pluginSlug}/`));
  const missingSourceFiles = expectedEntries.filter((entry) => !entrySet.has(entry));
  const unexpectedDevFiles = entries.filter((entry) => {
    const relative = entry.slice(`${pluginSlug}/`.length);
    return /^(?:tests|docs|scripts|dist|node_modules|\.git|\.github)\//.test(relative) ||
      /(?:^|\/)(?:package(?:-lock)?\.json|docker-compose\.yml|SETUP_STATUS\.md|README\.md)$/.test(relative);
  });

  const main = readZipEntry(outPath, `${pluginSlug}/designinserter.php`);
  const catalog = JSON.parse(readZipEntry(outPath, `${pluginSlug}/data/css-stock-parts.json`));
  const parts = Array.isArray(catalog.parts) ? catalog.parts : [];
  const missingPreviewEntries = parts
    .map((part) => part.previewImage)
    .filter(Boolean)
    .map((previewImage) => `${pluginSlug}/${previewImage}`)
    .filter((entry) => !entrySet.has(entry));
  const catalogAssetReferences = parts.flatMap((part) => extractCatalogAssetReferences(part));
  const expectedCatalogAssetReferenceCount = 5;
  const missingCatalogAssetEntries = catalogAssetReferences
    .map((assetPath) => `${pluginSlug}/${assetPath}`)
    .filter((entry) => !entrySet.has(entry));

  const headerFailures = [
    main.includes('Plugin Name: Design Inserter') ? '' : 'missing plugin name',
    main.includes(`Version: ${packageJson.version}`) ? '' : 'version mismatch',
    main.includes(`define( 'DESIGNINSERTER_VERSION', '${packageJson.version}' );`) ? '' : 'version constant mismatch',
    main.includes(`define( 'DESIGNINSERTER_SOURCE_URL', '${catalog.sourceUrl}' );`) ? '' : 'source URL constant mismatch',
    main.includes('Requires at least: 6.0') ? '' : 'missing minimum WordPress header',
    main.includes('Requires PHP: 7.4') ? '' : 'missing minimum PHP header',
    main.includes('License: GPL-2.0-or-later') ? '' : 'missing GPL header',
    main.includes('License URI: https://www.gnu.org/licenses/gpl-2.0.html') ? '' : 'missing GPL license URI header',
    main.includes('Text Domain: designinserter') ? '' : 'missing text domain',
  ].filter(Boolean);

  const catalogFailures = [
    catalog.total === 222 && catalog.expectedTotal === 222 && parts.length === 222 ? '' : 'catalog does not contain 222 expected parts',
    Array.isArray(catalog.categories) && catalog.categories.length === 28 ? '' : 'catalog does not contain 28 categories',
    catalogAssetReferences.length === expectedCatalogAssetReferenceCount ? '' : `catalog embedded asset reference count mismatch: ${catalogAssetReferences.length}/${expectedCatalogAssetReferenceCount}`,
  ].filter(Boolean);

  if (
    missing.length ||
    wrongRoot.length ||
    missingSourceFiles.length ||
    unexpectedDevFiles.length ||
    missingPreviewEntries.length ||
    missingCatalogAssetEntries.length ||
    headerFailures.length ||
    catalogFailures.length
  ) {
    throw new Error([
      missing.length ? `missing entries: ${missing.join(', ')}` : '',
      wrongRoot.length ? `entries outside plugin root: ${wrongRoot.join(', ')}` : '',
      missingSourceFiles.length ? `source files missing from zip: ${missingSourceFiles.slice(0, 10).join(', ')}` : '',
      unexpectedDevFiles.length ? `unexpected dev files in zip: ${unexpectedDevFiles.join(', ')}` : '',
      missingPreviewEntries.length ? `catalog preview files missing from zip: ${missingPreviewEntries.slice(0, 10).join(', ')}` : '',
      missingCatalogAssetEntries.length ? `catalog embedded asset files missing from zip: ${missingCatalogAssetEntries.slice(0, 10).join(', ')}` : '',
      headerFailures.length ? `plugin header failures: ${headerFailures.join(', ')}` : '',
      catalogFailures.length ? `catalog failures: ${catalogFailures.join(', ')}` : '',
    ].filter(Boolean).join('\n'));
  }

  return entries.length;
}

if (!fs.existsSync(pluginDir)) {
  throw new Error(`Plugin directory not found: ${pluginDir}`);
}

fs.mkdirSync(distDir, { recursive: true });

const files = listFiles(pluginDir).sort();
createZip(files, zipPath);
const entryCount = verifyZip(zipPath, files);
const size = fs.statSync(zipPath).size;

console.log(`Built ${path.relative(root, zipPath)} (${entryCount} files, ${size} bytes)`);
