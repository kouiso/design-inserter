import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

// cwd 依存だとテストから import したときに解決先がぶれるので、スクリプト位置から引く。
const root = fileURLToPath(new URL('..', import.meta.url));
const pluginSlug = 'designinserter';
const pluginDir = path.join(root, 'wp-content/plugins', pluginSlug);
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const distDir = path.join(root, 'dist');

/** git-crypt v0 が暗号文の先頭に置く 10 バイトの署名。 */
export const GIT_CRYPT_MAGIC = Buffer.from([0x00, 0x47, 0x49, 0x54, 0x43, 0x52, 0x59, 0x50, 0x54, 0x00]);

/** Template Party カタログ: プラグイン相対パスと、中に必ず配列で入っとるべきキー。 */
export const TEMPLATE_PARTY_CATALOGS = [
  { relative: 'data/template-party-parts.json', key: 'parts' },
  { relative: 'data/template-party-templates.json', key: 'templates' },
];

// ToS 上 再配布できん / スクレイパーのローカル状態。復号済みのメンテナ環境にだけ存在するため、
// .gitignore では守れても zip では守れん。ここで常に落とす（DI-SEC-014）。
const LOCAL_ONLY_PREFIXES = [
  'data/template-party-bundles/',
  'data/template-party-scrape-state.json',
];

/** 先頭 10 バイトだけ読む。1300 ファイル舐めるので全読みはせん。 */
export function isGitCryptCiphertext(filePath) {
  let fd;
  try {
    fd = fs.openSync(filePath, 'r');
    const head = Buffer.alloc(GIT_CRYPT_MAGIC.length);
    const read = fs.readSync(fd, head, 0, GIT_CRYPT_MAGIC.length, 0);
    return read === GIT_CRYPT_MAGIC.length && head.equals(GIT_CRYPT_MAGIC);
  } catch {
    return false;
  } finally {
    if (fd !== undefined) {
      fs.closeSync(fd);
    }
  }
}

/**
 * tests/tp-availability.php の designinserter_tp_catalog_file_available() と同じ三分岐。
 * locked（暗号文）/ malformed（復号済みやが壊れとる）/ ok を区別する。
 * 壊れとるものを locked 扱いにするとデータ退行が黙って通るので、ここは必ず分ける。
 * @returns {{status:'ok'|'locked'|'missing'|'malformed', path:string, reason?:string, count?:number}}
 */
export function inspectCatalogFile(filePath, requiredKey) {
  let raw;
  try {
    raw = fs.readFileSync(filePath);
  } catch (error) {
    return { status: 'missing', path: filePath, reason: error.code === 'ENOENT' ? 'ファイルが無い' : error.message };
  }

  if (raw.subarray(0, GIT_CRYPT_MAGIC.length).equals(GIT_CRYPT_MAGIC)) {
    return { status: 'locked', path: filePath };
  }

  let decoded;
  try {
    decoded = JSON.parse(raw.toString('utf8'));
  } catch (error) {
    return { status: 'malformed', path: filePath, reason: `JSON パース失敗: ${error.message}` };
  }

  if (decoded === null || typeof decoded !== 'object' || Array.isArray(decoded) || !Array.isArray(decoded[requiredKey])) {
    return { status: 'malformed', path: filePath, reason: `配列キー "${requiredKey}" が無い` };
  }

  // 件数 0 でも復号は出来とるので ok。件数の退行検出は PHPUnit（DI-CAT-022/023）の担当。
  return { status: 'ok', path: filePath, count: decoded[requiredKey].length };
}

export function inspectTemplatePartyCatalogs(dir = pluginDir) {
  return TEMPLATE_PARTY_CATALOGS.map((catalog) => ({
    ...catalog,
    ...inspectCatalogFile(path.join(dir, catalog.relative), catalog.key),
  }));
}

/**
 * zip に入れるファイルを 3 つに分類する。
 * 暗号文はパス決め打ちではなく署名で拾う。.gitattributes が増えても勝手に追随するため。
 * @returns {{included:string[], lockedFiles:string[], localOnlyFiles:string[]}}
 */
export function selectDistributionFiles(dir = pluginDir) {
  const included = [];
  const lockedFiles = [];
  const localOnlyFiles = [];

  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name === '.DS_Store') {
        continue;
      }

      const abs = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(abs);
        continue;
      }

      const relative = path.relative(dir, abs).split(path.sep).join('/');
      if (LOCAL_ONLY_PREFIXES.some((prefix) => relative === prefix || relative.startsWith(prefix))) {
        localOnlyFiles.push(abs);
      } else if (isGitCryptCiphertext(abs)) {
        lockedFiles.push(abs);
      } else {
        included.push(abs);
      }
    }
  };

  walk(dir);

  return {
    included: included.sort(),
    lockedFiles: lockedFiles.sort(),
    localOnlyFiles: localOnlyFiles.sort(),
  };
}

export function resolveOutputPath(version = packageJson.version, { allowLocked = false } = {}) {
  return allowLocked
    ? path.join(distDir, 'dev', `${pluginSlug}-${version}-dev.zip`)
    : path.join(distDir, `${pluginSlug}-${version}.zip`);
}

/** 一覧が長くなりすぎんように 10 件で打ち切る（verifyZip の既存慣習に合わせる）。 */
function formatPathList(paths) {
  const head = paths.slice(0, 10).map((abs) => `  ${path.relative(root, abs)}`);
  if (paths.length > head.length) {
    head.push(`  ... 他 ${paths.length - head.length} 件`);
  }
  return head.join('\n');
}

/**
 * dev モードが大目に見るんは locked だけ。
 * malformed（データ退行）と missing（ファイル消失）は git-crypt のロックとは別物なので、
 * どっちのモードでも落とす。ここを緩めると ci:fast がカタログ削除を素通しして、
 * マージ後の trusted release build まで気づかれん。
 */
export function assertCatalogsUsable(states, { allowLocked = false } = {}) {
  const malformed = states.filter((state) => state.status === 'malformed');
  if (malformed.length) {
    throw new Error([
      'ビルド中止: Template Party カタログが壊れています。復号は出来ているのでデータ退行の可能性が高いです。',
      malformed.map((state) => `  ${path.relative(root, state.path)}: ${state.reason}`).join('\n'),
      'git-crypt のロックではないので --allow-locked-catalog では回避できません。scraper の出力を確認してください。',
    ].join('\n'));
  }

  const missing = states.filter((state) => state.status === 'missing');
  if (missing.length) {
    throw new Error([
      'ビルド中止: Template Party カタログが見つかりません。これらは git 管理下のファイルなので、消えとるんはリポジトリの退行です。',
      missing.map((state) => `  ${path.relative(root, state.path)}: ${state.reason}`).join('\n'),
      'git-crypt のロックではないので --allow-locked-catalog では回避できません。',
    ].join('\n'));
  }

  // 復号済みで 0 件になっとるのも scraper の退行。locked には count が無いのでここには掛からん。
  const empty = states.filter((state) => state.count === 0);
  if (empty.length) {
    throw new Error([
      'ビルド中止: Template Party カタログが空です。復号は出来ているので scraper の退行の可能性が高いです。',
      empty.map((state) => `  ${path.relative(root, state.path)}: ${state.key} が 0 件`).join('\n'),
      'git-crypt のロックではないので --allow-locked-catalog では回避できません。scraper の出力を確認してください。',
    ].join('\n'));
  }

  if (allowLocked) {
    return;
  }

  const unusable = states.filter((state) => state.status !== 'ok');
  if (unusable.length) {
    throw new Error([
      'リリースビルド中止: Template Party カタログが git-crypt で暗号化されたままです。',
      unusable.map((state) => `  ${path.relative(root, state.path)} (git-crypt 暗号文)`).join('\n'),
      'このまま zip を作ると Template Party のパーツ / テンプレートが丸ごと欠けた配布物になります (F-4 / DI-BLD-022)。',
      '対処: git-crypt unlock <keyfile> を実行してから npm run build をやり直してください。',
      '鍵の無い環境で zip 生成だけ確認したい場合は npm run build:dev（dist/dev/ に出力。リリースには使えません）。',
    ].join('\n'));
  }
}

// 絶対 URL や空文字は配布物の中身と対応せんので落とす（誤検知でリリースを止めんため）。
export function collectPreviewReferences(catalog) {
  if (catalog === null || typeof catalog !== 'object') {
    return [];
  }

  const refs = [];
  for (const [collection, field] of [['parts', 'previewImage'], ['templates', 'thumb']]) {
    const items = Array.isArray(catalog[collection]) ? catalog[collection] : [];
    for (const item of items) {
      const value = item && typeof item[field] === 'string' ? item[field] : '';
      if (value.startsWith('assets/')) {
        refs.push(value);
      }
    }
  }

  return [...new Set(refs)];
}

export function assertNoCiphertext(lockedFiles, { allowLocked = false } = {}) {
  if (allowLocked || !lockedFiles.length) {
    return;
  }

  throw new Error([
    `リリースビルド中止: git-crypt 暗号文のファイルが配布対象に ${lockedFiles.length} 件あります (DI-SEC-014)。`,
    formatPathList(lockedFiles),
    '対処: git-crypt unlock <keyfile> を実行してから npm run build をやり直してください。',
  ].join('\n'));
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

// 復号済みカタログは 1MB を超えるので maxBuffer を上げておく。
const UNZIP_MAX_BUFFER = 64 * 1024 * 1024;

function readZipEntryBuffer(outPath, entry) {
  const result = spawnSync('unzip', ['-p', outPath, entry], { maxBuffer: UNZIP_MAX_BUFFER });
  if (result.status !== 0) {
    throw new Error(`unzip read failed for ${entry}:\n${result.stderr || result.stdout}`);
  }

  return result.stdout;
}

function readZipEntry(outPath, entry) {
  return readZipEntryBuffer(outPath, entry).toString('utf8');
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

function verifyZip(outPath, sourceFiles, { allowLocked = false, lockedFiles = [] } = {}) {
  const lockedEntries = new Set(
    lockedFiles.map((file) => `${pluginSlug}/${path.relative(pluginDir, file).split(path.sep).join('/')}`),
  );
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
    `${pluginSlug}/readme.txt`,
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
    `${pluginSlug}/includes/templates.php`,
    `${pluginSlug}/templates/full-page.php`,
  ];
  const expectedEntries = sourceFiles.map((file) => `${pluginSlug}/${path.relative(pluginDir, file).split(path.sep).join('/')}`);
  const missing = required.filter((entry) => !entrySet.has(entry));
  const wrongRoot = entries.filter((entry) => !entry.startsWith(`${pluginSlug}/`));
  const missingSourceFiles = expectedEntries.filter((entry) => !entrySet.has(entry));
  const unexpectedDevFiles = entries.filter((entry) => {
    const relative = entry.slice(`${pluginSlug}/`.length);
    return /^(?:tests|docs|scripts|dist|node_modules|\.git|\.github|data\/template-party-bundles)\//.test(relative) ||
      /(?:^|\/)(?:package(?:-lock)?\.json|docker-compose\.yml|SETUP_STATUS\.md|README\.md|template-party-scrape-state\.json)$/.test(relative);
  });

  // リリース zip は Template Party を必ず平文で含む。sweep 済みやが、実際に固めた中身でも押さえる。
  // dev でもカタログが zip に居るなら参照は検証する。ロックで除外された分だけ大目に見る。
  // ここを allowLocked で丸ごと飛ばすと、ci:fast が通る経路でプレビュー削除を検出できん。
  const templatePartyFailures = [];
  for (const catalog of TEMPLATE_PARTY_CATALOGS) {
    const entry = `${pluginSlug}/${catalog.relative}`;
    if (!entrySet.has(entry)) {
      if (!allowLocked) {
        templatePartyFailures.push(`${entry} が zip に無い`);
      }
      continue;
    }
    const raw = readZipEntryBuffer(outPath, entry);
    if (raw.subarray(0, GIT_CRYPT_MAGIC.length).equals(GIT_CRYPT_MAGIC)) {
      templatePartyFailures.push(`${entry} が git-crypt 暗号文のまま`);
      continue;
    }

    // 下の missingPreviewEntries は css-stock-parts.json しか見んので、
    // tp-* プレビューが欠けても素通りしてエディタのカードだけ画像切れになる。
    let decoded;
    try {
      decoded = JSON.parse(raw.toString('utf8'));
    } catch (error) {
      templatePartyFailures.push(`${entry} が JSON として読めん: ${error.message}`);
      continue;
    }

    const missingRefs = collectPreviewReferences(decoded)
      .map((reference) => `${pluginSlug}/${reference}`)
      // dev では暗号文として外された分だけ許す。単に消えとる参照は退行なので落とす。
      .filter((candidate) => !entrySet.has(candidate) && !lockedEntries.has(candidate));
    if (missingRefs.length) {
      templatePartyFailures.push(`${entry} が参照するプレビューが zip に無い (${missingRefs.length} 件): ${missingRefs.slice(0, 10).join(', ')}`);
    }
  }

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
    catalogFailures.length ||
    templatePartyFailures.length
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
      templatePartyFailures.length ? `Template Party failures: ${templatePartyFailures.join(', ')}` : '',
    ].filter(Boolean).join('\n'));
  }

  return entries.length;
}

export function main(argv = process.argv.slice(2)) {
  const allowLocked = argv.includes('--allow-locked-catalog');

  if (!fs.existsSync(pluginDir)) {
    throw new Error(`Plugin directory not found: ${pluginDir}`);
  }

  const outPath = resolveOutputPath(packageJson.version, { allowLocked });

  // ガードで落ちたときに前回ビルドの同バージョン zip が残ると、
  // generate-ready-checklist.mjs がそれを鮮度チェックせずハッシュして「リリース可能」に見せる。
  // 検査より先に消して、失敗したビルドが成果物を残さんようにする。
  fs.rmSync(outPath, { force: true });

  // カタログ検査を sweep より先に回す。ロック時に「暗号文 1089 件」やのうて
  // 「git-crypt unlock せえ」という具体的な指示を出したいから。
  assertCatalogsUsable(inspectTemplatePartyCatalogs(), { allowLocked });

  const { included, lockedFiles, localOnlyFiles } = selectDistributionFiles();
  assertNoCiphertext(lockedFiles, { allowLocked });

  if (localOnlyFiles.length) {
    console.warn(`注記: ローカル専用ファイル ${localOnlyFiles.length} 件を zip から除外しました (再配布不可 / DI-SEC-014)。`);
    console.warn(formatPathList(localOnlyFiles));
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  // 一時ファイルに作って検証が通ってから rename する。
  // outPath に直接書くと、書き込み途中の失敗（ディスク満杯など）や検証失敗で
  // 壊れた zip が残り、generate-ready-checklist.mjs がそれを拾ってハッシュしてまう。
  const tempPath = `${outPath}.tmp`;
  let entryCount;
  try {
    createZip(included, tempPath);
    entryCount = verifyZip(tempPath, included, { allowLocked, lockedFiles });
  } catch (error) {
    fs.rmSync(tempPath, { force: true });
    throw error;
  }

  fs.renameSync(tempPath, outPath);
  const size = fs.statSync(outPath).size;

  if (allowLocked && lockedFiles.length) {
    console.warn(`警告: git-crypt ロック環境の開発ビルドです。Template Party データ ${lockedFiles.length} 件を zip から除外しました。`);
    console.warn(`  出力: ${path.relative(root, outPath)}`);
    console.warn('  この zip はリリースに使えません。リリースは復号済み環境で npm run build を実行してください。');
  }

  console.log(`Built ${path.relative(root, outPath)} (${entryCount} files, ${size} bytes)`);
  return outPath;
}

const invokedDirectly = process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (invokedDirectly) {
  try {
    main();
  } catch (error) {
    // スタックトレースを出すと復旧手順が埋もれるので、メッセージだけ出す。
    console.error(error.message);
    process.exitCode = 1;
  }
}
