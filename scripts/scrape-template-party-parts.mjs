/**
 * Template Party copy-paste parts scraper.
 *
 * Reads /parts/build/data/catalog.json (138 parts), fetches each part's
 * html.txt and css.txt, downloads one representative thumbnail per part,
 * and writes a catalog JSON in css-stock-compatible schema.
 *
 * Usage:
 *   node scripts/scrape-template-party-parts.mjs
 */

import { mkdir, writeFile, rm, readdir, copyFile } from 'node:fs/promises';
import path from 'node:path';

// ─── paths ────────────────────────────────────────────────────────────────────
const BASE          = 'https://template-party.com';
const PARTS_BASE    = `${BASE}/parts`;
const PLUGIN_DIR    = path.resolve('wp-content/plugins/designinserter');
const DATA_DIR      = path.join(PLUGIN_DIR, 'data');
const CATALOG_PATH  = path.join(DATA_DIR, 'template-party-parts.json');
const PREVIEWS_DIR  = path.join(PLUGIN_DIR, 'assets', 'previews');
const PREVIEWS_TMP  = path.join(PLUGIN_DIR, 'assets', '.previews-tp-parts-tmp');

const SLEEP_MS = 400;
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) research-scraper/1.0';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchText(url) {
	const res = await fetch(url, { headers: { 'User-Agent': UA } });
	if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
	return res.text();
}

async function fetchBytes(url) {
	const res = await fetch(url, { headers: { 'User-Agent': UA } });
	if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
	return Buffer.from(await res.arrayBuffer());
}

// Detect image extension from magic bytes
function detectExt(bytes, fallback = '.webp') {
	if (bytes.slice(0, 4).toString('ascii') === 'GIF8') return '.gif';
	if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return '.png';
	if (bytes.slice(0, 4).toString('ascii') === 'RIFF') return '.webp';
	if (bytes.slice(0, 300).toString('utf8').includes('<svg')) return '.svg';
	return fallback;
}

// Category slug → Japanese label mapping
const CATEGORY_LABELS = {
	list:       '一覧・リスト',
	background: '背景',
	effects:    'エフェクト',
	form:       'フォーム',
	news:       'ニュース',
	button:     'ボタン',
	footer:     'フッター',
	'ui-tools': 'UIパーツ（タブ・アコーディオン等）',
	table:      'テーブル',
	title:      '見出し',
};

async function main() {
	console.log(`Template Party parts scraper — ${new Date().toISOString()}`);

	// ── 1. Fetch catalog.json ────────────────────────────────────────────────
	console.log('\nFetching catalog.json…');
	const catalog = await fetchText(`${PARTS_BASE}/build/data/catalog.json`).then(t => JSON.parse(t));
	const rawParts = catalog.parts || [];
	console.log(`Found ${rawParts.length} parts`);

	// ── 2. For each part, fetch html.txt + css.txt ───────────────────────────
	await mkdir(PREVIEWS_TMP, { recursive: true });
	await mkdir(PREVIEWS_DIR, { recursive: true });

	const parts = [];
	let previewCount = 0;

	for (let i = 0; i < rawParts.length; i++) {
		const raw = rawParts[i];
		const { id, title, categories, description, code, thumbs } = raw;

		// code paths are relative to /parts/
		const htmlPath = code?.html;
		const cssPath  = code?.css;

		let html = '';
		let css  = '';

		if (htmlPath) {
			try {
				html = await fetchText(`${PARTS_BASE}/${htmlPath}`);
				await sleep(SLEEP_MS / 2);
			} catch (e) {
				console.warn(`  [warn] ${id} html: ${e.message}`);
			}
		}

		if (cssPath) {
			try {
				css = await fetchText(`${PARTS_BASE}/${cssPath}`);
				await sleep(SLEEP_MS / 2);
			} catch (e) {
				console.warn(`  [warn] ${id} css: ${e.message}`);
			}
		}

		if (!html && !css) {
			console.warn(`  [skip] ${id}: no code`);
			continue;
		}

		// Download first available thumbnail
		let previewImagePath = '';
		const thumbEntries = Object.entries(thumbs || {});
		if (thumbEntries.length > 0) {
			const [, thumbRelPath] = thumbEntries[0];
			const thumbUrl = `${PARTS_BASE}/${thumbRelPath}`;
			try {
				const bytes = await fetchBytes(thumbUrl);
				const ext = detectExt(bytes);
				const filename = `tp-parts-${id}${ext}`;
				await writeFile(path.join(PREVIEWS_TMP, filename), bytes);
				previewImagePath = `assets/previews/${filename}`;
				previewCount += 1;
			} catch {
				// not fatal
			}
			await sleep(SLEEP_MS / 3);
		}

		const primaryCategory = categories?.[0] || 'general';
		const part = {
			id:            `tp-parts-${id}`,
			sourcePartId:  id,
			category:      primaryCategory,
			categoryLabel: CATEGORY_LABELS[primaryCategory] || primaryCategory,
			title,
			description:   description || '',
			html:          html.trim(),
			css:           css.trim(),
			inputs:        [],
			previewImage:  previewImagePath,
			sourceUrl:     `${PARTS_BASE}/catalog.php#${id}`,
			source:        'template-party',
		};

		parts.push(part);

		if ((i + 1) % 20 === 0 || i + 1 === rawParts.length) {
			console.log(`  Parts: ${i + 1}/${rawParts.length}`);
		}

		await sleep(SLEEP_MS);
	}

	// ── 3. Move previews from tmp to final ───────────────────────────────────
	try {
		const files = await readdir(PREVIEWS_TMP);
		for (const f of files) {
			const src = path.join(PREVIEWS_TMP, f);
			const dst = path.join(PREVIEWS_DIR, f);
			await copyFile(src, dst);
		}
		await rm(PREVIEWS_TMP, { recursive: true, force: true });
		console.log(`\nMoved ${files.length} preview images to ${PREVIEWS_DIR}`);
	} catch (e) {
		console.warn(`Preview move failed: ${e.message}`);
	}

	// ── 4. Build unique categories list ──────────────────────────────────────
	const catMap = new Map();
	for (const p of parts) {
		if (!catMap.has(p.category)) {
			catMap.set(p.category, { slug: p.category, label: p.categoryLabel, partCount: 0 });
		}
		catMap.get(p.category).partCount += 1;
	}
	const categories = [...catMap.values()].sort((a, b) => b.partCount - a.partCount);

	// ── 5. Write catalog JSON (css-stock-compatible schema + source field) ───
	const output = {
		sourceName:   'Template Party Parts',
		sourceUrl:    `${PARTS_BASE}/catalog.php`,
		sourceNotice: 'Web Design:Template-Party (https://template-party.com/) — copy-paste parts used for personal use only under Template Party terms of service.',
		scrapedAt:    new Date().toISOString(),
		total:        parts.length,
		categories,
		parts,
	};

	await mkdir(DATA_DIR, { recursive: true });
	await writeFile(CATALOG_PATH, `${JSON.stringify(output, null, 2)}\n`);

	console.log(`\nWrote ${parts.length} parts to ${CATALOG_PATH}`);
	console.log(`Categories: ${categories.map(c => `${c.slug}(${c.partCount})`).join(', ')}`);
	console.log('Done.');
}

main().catch(err => {
	console.error(err);
	process.exitCode = 1;
});
