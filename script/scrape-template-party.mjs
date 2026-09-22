/**
 * Template Party full-template scraper.
 *
 * Collects all template variants (≈1102), downloads each ZIP,
 * extracts the bundle, downloads thumbnails, and writes a catalog JSON.
 *
 * Usage:
 *   node scripts/scrape-template-party.mjs            # full run
 *   node scripts/scrape-template-party.mjs --limit 5  # test: process only first N detail IDs
 *   node scripts/scrape-template-party.mjs --skip-zips # metadata only, no ZIP download
 *
 * Outputs (relative to repo root):
 *   wp-content/plugins/designinserter/data/template-party-templates.json
 *   wp-content/plugins/designinserter/data/template-party-scrape-state.json  (progress, git-ignored)
 *   wp-content/plugins/designinserter/data/template-party-bundles/<variantId>/  (git-ignored)
 *   wp-content/plugins/designinserter/assets/previews/tp-<variantId>.webp
 */

import { mkdir, writeFile, readFile, rm, copyFile, readdir, stat } from 'node:fs/promises';
import { existsSync, createWriteStream } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

// ─── paths ────────────────────────────────────────────────────────────────────
const BASE          = 'https://template-party.com';
const PLUGIN_DIR    = path.resolve('wp-content/plugins/designinserter');
const DATA_DIR      = path.join(PLUGIN_DIR, 'data');
const BUNDLES_DIR   = path.join(DATA_DIR, 'template-party-bundles');
const CATALOG_PATH  = path.join(DATA_DIR, 'template-party-templates.json');
const STATE_PATH    = path.join(DATA_DIR, 'template-party-scrape-state.json');
const PREVIEWS_DIR  = path.join(PLUGIN_DIR, 'assets', 'previews');
const TMP_ZIP       = '/tmp/tp-template-download.zip';
const TMP_EXTRACT   = '/tmp/tp-template-extract';

// ─── settings ─────────────────────────────────────────────────────────────────
const SLEEP_MS   = 700;  // polite crawl delay between HTTP requests
const UA         = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 research-scraper/1.0';
const SKIP_EXTS  = new Set(['.psd', '.ai', '.mp4', '.mov', '.avi', '.wmv', '.fig', '.xd', '.sketch']);

// Parse CLI flags
const args       = process.argv.slice(2);
const limitFlag  = (() => { const i = args.indexOf('--limit'); return i >= 0 ? parseInt(args[i + 1], 10) : null; })();
const skipZips   = args.includes('--skip-zips');

// ─── utilities ────────────────────────────────────────────────────────────────
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

async function loadState() {
	if (!existsSync(STATE_PATH)) return { allIds: null, processed: {} };
	try {
		return JSON.parse(await readFile(STATE_PATH, 'utf8'));
	} catch {
		return { allIds: null, processed: {} };
	}
}

async function saveState(state) {
	await mkdir(DATA_DIR, { recursive: true });
	await writeFile(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`);
}

// Derive a URL-safe slug from Japanese category label
function slugify(label) {
	// Ordered by specificity (longer/more specific first to avoid false matches)
	const map = [
		['クリニック', 'clinic'], ['病院', 'clinic'], ['歯科', 'clinic'], ['医院', 'clinic'], ['医療', 'clinic'],
		['ハウスメーカー', 'housing'], ['工務店', 'housing'], ['住宅', 'housing'], ['不動産', 'realestate'], ['賃貸', 'realestate'],
		['飲食店', 'food'], ['レストラン', 'food'], ['カフェ', 'food'], ['居酒屋', 'food'],
		['美容院', 'beauty'], ['美容室', 'beauty'], ['エステ', 'beauty'], ['ネイル', 'beauty'], ['サロン', 'salon'],
		['ホテル', 'hotel'], ['旅館', 'hotel'], ['宿泊', 'hotel'], ['観光', 'tourism'],
		['幼稚園', 'education'], ['保育', 'education'], ['学校', 'education'], ['塾', 'education'], ['教育', 'education'],
		['ポートフォリオ', 'portfolio'], ['ギャラリー', 'portfolio'],
		['ランディング', 'landing'], ['LP向け', 'landing'],
		['採用', 'recruitment'], ['求人', 'recruitment'],
		['ブライダル', 'wedding'], ['結婚', 'wedding'],
		['和風', 'japanese-style'], ['和食', 'japanese-style'],
		['ファッション', 'fashion'],
		['ペット', 'pet'],
		['スポーツ', 'sports'], ['フィットネス', 'sports'],
		['ショップ', 'shop'], ['EC', 'shop'],
		['ビジネス', 'business'], ['企業', 'business'], ['会社', 'business'], ['法人', 'business'],
		['個人', 'personal'], ['趣味', 'personal'],
		['初心者', 'beginner'],
	];
	for (const [ja, en] of map) {
		if (label.includes(ja)) return en;
	}
	return 'general';
}

// ─── Step 1: collect all detail IDs by paginating list ────────────────────────
async function collectAllIds(state) {
	if (state.allIds) {
		console.log(`Loaded ${state.allIds.length} IDs from state (skip re-crawl)`);
		return;
	}

	console.log('=== Collecting all detail IDs from list pages ===');
	const ids = [];
	for (let page = 1; page <= 20; page++) {
		const url = `${BASE}/db_new/list?category=template&page=${page}`;
		const html = await fetchText(url);

		const found = [...html.matchAll(/\/db_new\/detail\?category=template&(?:amp;)?id=(\d+)/g)]
			.map(m => m[1])
			.filter((v, i, a) => a.indexOf(v) === i);

		if (found.length === 0) break;
		for (const id of found) {
			if (!ids.includes(id)) ids.push(id);
		}

		// Detect last page number: href="...page=12">最後</a>
		const lastPageMatch = html.match(/page=(\d+)"[^>]*>最後/);
		// Fallback: take max of all page= values visible in pagination links
		const allPageNums = [...html.matchAll(/page=(\d+)/g)].map(m => parseInt(m[1], 10));
		const lastPage = lastPageMatch
			? parseInt(lastPageMatch[1], 10)
			: (allPageNums.length > 0 ? Math.max(...allPageNums) : page);
		const totalMatch = html.match(/全(\d+)件中/);
		const total = totalMatch ? totalMatch[1] : '?';

		console.log(`  Page ${page}/${lastPage} — found ${found.length} IDs (total: ${ids.length}/${total})`);

		if (page >= lastPage) break;
		await sleep(SLEEP_MS);
	}

	state.allIds = ids;
	state.processed = state.processed || {};
	await saveState(state);
	console.log(`Collected ${ids.length} total detail IDs\n`);
}

// ─── Step 2: fetch each detail page to get ZIP URL + metadata ────────────────
async function processDetailPages(state) {
	const ids = limitFlag ? state.allIds.slice(0, limitFlag) : state.allIds;
	const todo = ids.filter(id => !state.processed[id]?.zipUrl && !state.processed[id]?.skipped);
	if (todo.length === 0) {
		console.log('=== All detail pages already processed ===\n');
		return;
	}

	console.log(`=== Fetching detail pages (${todo.length} remaining) ===`);
	let done = 0;
	for (const detailId of todo) {
		try {
			const html = await fetchText(`${BASE}/db_new/detail?category=template&id=${detailId}`);

			// ZIP URL: absolute href matching template-party.com/template/…
			const zipMatch = html.match(/href="(https?:\/\/(?:www\.)?template-party\.com\/template\/([^/]+)\/([^/]+)\.zip)"/);
			if (!zipMatch) {
				console.warn(`  [skip] id=${detailId}: no ZIP URL found`);
				state.processed[detailId] = { detailId, skipped: true, reason: 'no-zip' };
				await saveState(state);
				await sleep(SLEEP_MS);
				continue;
			}

			const [, zipUrl, baseId, variantId] = zipMatch;
			const demoUrl = `${BASE}/template/${baseId}/${variantId}/`;
			const sourceUrl = `${BASE}/db_new/detail?category=template&id=${detailId}`;

			// Title and category from <title> tag:
			// "ハウスメーカー・工務店向け tp_housebuilder1_blue_grayの詳細・DL｜Template Party"
			const titleMatch = html.match(/<title>([^<]+)<\/title>/);
			const rawTitle = titleMatch
				? titleMatch[1]
					.replace(/の詳細.*$/i, '')
					.replace(/\s*無料ホームページテンプレート\s*/gi, ' ')
					.trim()
				: variantId;
			// categoryLabel = part before the tp_ id in rawTitle
			const categoryLabel = rawTitle.replace(/\s*tp_[a-z0-9_]+$/i, '').trim() || 'テンプレート';
			const category = slugify(categoryLabel);
			// title = full cleaned title (Japanese category + template id)
			const title = rawTitle;

			state.processed[detailId] = {
				id: variantId,
				baseId,
				variantId,
				detailId: String(detailId),
				category,
				categoryLabel,
				title,
				zipUrl,
				demoUrl,
				sourceUrl,
				thumb: `assets/previews/tp-${variantId}.webp`,
				bundleDir: `data/template-party-bundles/${variantId}`,
				entryHtml: 'index.html',
				source: 'template-party',
				bundleDownloaded: false,
				thumbDownloaded: false,
			};

			done += 1;
			if (done % 50 === 0 || done === todo.length) {
				await saveState(state);
				console.log(`  Detail pages: ${done}/${todo.length} processed`);
			}
		} catch (err) {
			console.warn(`  [warn] id=${detailId}: ${err.message}`);
			state.processed[detailId] = { detailId, skipped: true, reason: err.message };
			await saveState(state);
		}
		await sleep(SLEEP_MS);
	}
	await saveState(state);
	console.log('=== Detail pages done ===\n');
}

// ─── Step 3: download ZIPs + extract bundles ─────────────────────────────────
async function downloadBundles(state) {
	if (skipZips) {
		console.log('=== Skipping ZIP downloads (--skip-zips) ===\n');
		return;
	}

	const entries = Object.values(state.processed).filter(e => e.zipUrl && !e.bundleDownloaded);
	if (limitFlag) entries.splice(limitFlag);

	if (entries.length === 0) {
		console.log('=== All bundles already downloaded ===\n');
		return;
	}

	console.log(`=== Downloading bundles (${entries.length} remaining) ===`);
	await mkdir(BUNDLES_DIR, { recursive: true });
	await mkdir(PREVIEWS_DIR, { recursive: true });

	let done = 0;
	for (const entry of entries) {
		const bundlePath = path.join(BUNDLES_DIR, entry.variantId);

		try {
			// Download ZIP
			const zipBytes = await fetchBytes(entry.zipUrl);
			await writeFile(TMP_ZIP, zipBytes);

			// Extract (skip design-source files not needed for rendering)
			await rm(TMP_EXTRACT, { recursive: true, force: true });
			await mkdir(TMP_EXTRACT, { recursive: true });

			// unzip, filter out large/unneeded extensions
			execFileSync('unzip', ['-o', '-q', TMP_ZIP, '-d', TMP_EXTRACT]);

			// Move to final bundle dir (remove old if re-running)
			await rm(bundlePath, { recursive: true, force: true });
			await mkdir(path.dirname(bundlePath), { recursive: true });

			// Copy, skipping unwanted extensions
			const allFiles = [];
			for (const f of await readdir(TMP_EXTRACT, { recursive: true })) {
				const fullPath = path.join(TMP_EXTRACT, f);
				if ((await stat(fullPath)).isFile()) {
					allFiles.push(fullPath);
				}
			}

			let assetCount = 0;
			for (const srcFile of allFiles) {
				const ext = path.extname(srcFile).toLowerCase();
				if (SKIP_EXTS.has(ext)) continue;
				// Preserve relative structure
				const rel = path.relative(TMP_EXTRACT, srcFile);
				const dst = path.join(bundlePath, rel);
				await mkdir(path.dirname(dst), { recursive: true });
				await copyFile(srcFile, dst);
				assetCount += 1;
			}

			entry.assetCount = assetCount;
			entry.bundleDownloaded = true;

			done += 1;
			if (done % 20 === 0 || done === entries.length) {
				await saveState(state);
				console.log(`  Bundles: ${done}/${entries.length} — ${entry.variantId} (${assetCount} files)`);
			}
		} catch (err) {
			console.warn(`  [warn] bundle ${entry.variantId}: ${err.message}`);
			entry.bundleError = err.message;
		}
		await sleep(SLEEP_MS);
	}

	await saveState(state);
	console.log('=== Bundle downloads done ===\n');
}

// ─── Step 4: download thumbnails ─────────────────────────────────────────────
async function downloadThumbnails(state) {
	const entries = Object.values(state.processed).filter(e => e.variantId && !e.thumbDownloaded);
	if (limitFlag) entries.splice(limitFlag);

	if (entries.length === 0) {
		console.log('=== All thumbnails already downloaded ===\n');
		return;
	}

	console.log(`=== Downloading thumbnails (${entries.length} remaining) ===`);
	await mkdir(PREVIEWS_DIR, { recursive: true });

	let done = 0;
	for (const entry of entries) {
		// Thumbnail: images/mini_db/{baseId}/{variantSuffix}.webp
		// variantId = tp_clinic7_blue_LP → suffix = blue_LP (strip "baseId_" prefix)
		const variantSuffix = entry.variantId.replace(`${entry.baseId}_`, '');
		const thumbUrl = `${BASE}/images/mini_db/${entry.baseId}/${variantSuffix}.webp`;
		const thumbDest = path.join(PREVIEWS_DIR, `tp-${entry.variantId}.webp`);

		try {
			const bytes = await fetchBytes(thumbUrl);
			await writeFile(thumbDest, bytes);
			entry.thumbDownloaded = true;
			done += 1;
		} catch {
			// Thumbnail missing — not fatal
			entry.thumbDownloaded = false;
			entry.thumb = '';
		}

		if (done % 100 === 0 && done > 0) {
			await saveState(state);
			console.log(`  Thumbnails: ${done}/${entries.length}`);
		}
		await sleep(SLEEP_MS / 3);  // thumbs are small, faster cadence OK
	}

	await saveState(state);
	console.log(`=== Thumbnail downloads done (${done} downloaded) ===\n`);
}

// ─── Step 5: write catalog JSON ───────────────────────────────────────────────
async function writeCatalog(state) {
	const entries = Object.values(state.processed).filter(e => e.id && !e.skipped);

	// Unique categories
	const categoryMap = new Map();
	for (const e of entries) {
		if (!categoryMap.has(e.category)) {
			categoryMap.set(e.category, { slug: e.category, label: e.categoryLabel, count: 0 });
		}
		categoryMap.get(e.category).count += 1;
	}
	const categories = [...categoryMap.values()].sort((a, b) => b.count - a.count);

	const templates = entries.map(e => ({
		id:            e.id,
		baseId:        e.baseId,
		variantId:     e.variantId,
		category:      e.category,
		categoryLabel: e.categoryLabel,
		title:         e.title,
		thumb:         e.thumb || '',
		demoUrl:       e.demoUrl,
		sourceUrl:     e.sourceUrl,
		bundleDir:     e.bundleDir,
		entryHtml:     e.entryHtml || 'index.html',
		assetCount:    e.assetCount || 0,
		source:        'template-party',
	}));

	const catalog = {
		sourceName:    'Template Party',
		sourceUrl:     `${BASE}/`,
		sourceNotice:  'Web Design:Template-Party (https://template-party.com/) — templates used for personal use only under Template Party terms of service.',
		scrapedAt:     new Date().toISOString(),
		total:         templates.length,
		categories,
		templates,
	};

	await mkdir(DATA_DIR, { recursive: true });
	await writeFile(CATALOG_PATH, `${JSON.stringify(catalog, null, 2)}\n`);
	console.log(`Wrote ${templates.length} templates to ${CATALOG_PATH}`);
	console.log(`Categories (${categories.length}): ${categories.map(c => `${c.slug}(${c.count})`).join(', ')}`);
}

// ─── main ─────────────────────────────────────────────────────────────────────
async function main() {
	console.log(`Template Party scraper — ${new Date().toISOString()}`);
	if (limitFlag) console.log(`[--limit ${limitFlag}] test run`);
	if (skipZips)  console.log(`[--skip-zips] metadata only`);
	console.log();

	const state = await loadState();

	await collectAllIds(state);
	await processDetailPages(state);
	await downloadBundles(state);
	await downloadThumbnails(state);
	await writeCatalog(state);

	console.log('\nDone.');
}

main().catch(err => {
	console.error(err);
	process.exitCode = 1;
});
