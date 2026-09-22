/**
 * Phase 0 spike: probe Template Party site structure.
 * Determines:
 *   1. How to extract all variant ZIP URLs from a detail page.
 *   2. The ZIP bundle contents (index.html / css / images structure).
 *   3. How copy-paste part HTML/CSS is exposed on /parts/catalog.php.
 *
 * Run from worktree root:
 *   node scripts/scrape-tp-spike.mjs
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import path from 'node:path';

const BASE = 'https://template-party.com';
const TMP = '/tmp/tp-spike';

async function fetchText(url) {
	const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (research-bot/1.0)' } });
	if (!res.ok) throw new Error(`${res.status} ${url}`);
	return res.text();
}

async function fetchBytes(url) {
	const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (research-bot/1.0)' } });
	if (!res.ok) throw new Error(`${res.status} ${url}`);
	return Buffer.from(await res.arrayBuffer());
}

// ─── 1. List page ────────────────────────────────────────────────────────────
async function probeListPage() {
	console.log('\n=== LIST PAGE ===');
	const html = await fetchText(`${BASE}/db_new/list?category=template&page=1`);

	// Extract detail links like /db_new/detail?category=template&id=NNN
	const detailIds = [];
	for (const m of html.matchAll(/\/db_new\/detail\?category=template&(?:amp;)?id=(\d+)/g)) {
		if (!detailIds.includes(m[1])) detailIds.push(m[1]);
	}
	console.log(`Detail IDs found on page 1 (first 5): ${detailIds.slice(0, 5).join(', ')}`);

	// Count total items
	const totalMatch = html.match(/全(\d+)件中/);
	if (totalMatch) console.log(`Total templates: ${totalMatch[1]}`);

	// Extract page count
	const lastPageMatch = html.match(/page=(\d+)[^"]*?>[^<]*?最後/);
	if (lastPageMatch) console.log(`Last page number: ${lastPageMatch[1]}`);

	return detailIds.slice(0, 3);
}

// ─── 2. Detail page ───────────────────────────────────────────────────────────
async function probeDetailPage(id) {
	console.log(`\n=== DETAIL PAGE (id=${id}) ===`);
	const html = await fetchText(`${BASE}/db_new/detail?category=template&id=${id}`);

	// Find all ZIP hrefs
	const zips = [];
	for (const m of html.matchAll(/href="(https?:\/\/[^"]+\.zip)"/g)) {
		if (!zips.includes(m[1])) zips.push(m[1]);
	}
	// Also look for relative /template/ zips
	for (const m of html.matchAll(/href="(\/template\/[^"]+\.zip)"/g)) {
		const url = `${BASE}${m[1]}`;
		if (!zips.includes(url)) zips.push(url);
	}
	console.log(`ZIP URLs (${zips.length}):`);
	zips.slice(0, 8).forEach(z => console.log('  ' + z));

	// Demo page URLs
	const demos = [];
	for (const m of html.matchAll(/href="((?:https?:\/\/template-party\.com)?\/template\/[^"]+)\/?"/g)) {
		const url = m[1].startsWith('http') ? m[1] : `${BASE}${m[1]}`;
		if (!url.endsWith('.zip') && !demos.includes(url)) demos.push(url);
	}
	console.log(`Demo URLs (${demos.length}): first → ${demos[0] || 'none'}`);

	// Thumbnails
	const thumbs = [];
	for (const m of html.matchAll(/src="(\/images\/mini_db\/[^"]+)"/g)) {
		if (!thumbs.includes(m[1])) thumbs.push(m[1]);
	}
	console.log(`Thumb images (${thumbs.length}): first → ${thumbs[0] || 'none'}`);

	// Category labels
	const catMatch = html.match(/<title>([^<]+)<\/title>/);
	if (catMatch) console.log(`Page title: ${catMatch[1].trim()}`);

	// Template name pattern (tp_xxx)
	const tpMatch = html.match(/\b(tp_[a-z0-9_]+)\b/i);
	if (tpMatch) console.log(`Template ID hint: ${tpMatch[1]}`);

	return { id, zips, demos, thumbs };
}

// ─── 3. ZIP probe ─────────────────────────────────────────────────────────────
async function probeZip(zipUrl) {
	console.log(`\n=== ZIP PROBE: ${zipUrl} ===`);
	await mkdir(TMP, { recursive: true });
	const zipFile = path.join(TMP, 'sample.zip');
	const bytes = await fetchBytes(zipUrl);
	await writeFile(zipFile, bytes);
	console.log(`Downloaded ${bytes.length} bytes → ${zipFile}`);

	// List ZIP contents
	try {
		const listing = execSync(`unzip -l "${zipFile}" | head -40`, { encoding: 'utf8' });
		console.log('ZIP contents:\n' + listing);
	} catch (e) {
		console.log('unzip failed:', e.message);
	}

	// Peek at index.html
	try {
		execSync(`unzip -o "${zipFile}" "*.html" -d "${TMP}/extracted/" 2>/dev/null || true`, { encoding: 'utf8' });
		const indexFiles = execSync(`find "${TMP}/extracted" -name "index.html" | head -5`, { encoding: 'utf8' }).trim();
		if (indexFiles) {
			const firstIdx = indexFiles.split('\n')[0];
			const head = execSync(`head -30 "${firstIdx}"`, { encoding: 'utf8' });
			console.log(`\nindex.html head:\n${head}`);
			// Check for image/css asset references
			const full = execSync(`cat "${firstIdx}"`, { encoding: 'utf8' });
			const cssRefs = [...full.matchAll(/href="([^"]*\.css)"/g)].map(m => m[1]);
			const imgRefs = [...new Set([...full.matchAll(/src="([^"]*\.(png|jpg|gif|webp|svg))"/gi)].map(m => m[1]))];
			console.log(`CSS refs: ${JSON.stringify(cssRefs)}`);
			console.log(`Image refs (first 5): ${JSON.stringify(imgRefs.slice(0, 5))}`);
			// Check for attribution line
			const attrMatch = full.match(/Template.?Party[^\n<]*/i);
			if (attrMatch) console.log(`Attribution line found: "${attrMatch[0].trim()}"`);
		}
	} catch (e) {
		console.log('extract/inspect failed:', e.message);
	}
}

// ─── 4. Parts catalog probe ───────────────────────────────────────────────────
async function probePartsCatalog() {
	console.log('\n=== PARTS CATALOG (/parts/catalog.php) ===');
	const html = await fetchText(`${BASE}/parts/catalog.php`);

	// Look for embedded HTML/CSS code blocks
	const codeMatches = [...html.matchAll(/<code[^>]*>([\s\S]{10,500}?)<\/code>/g)];
	console.log(`<code> blocks: ${codeMatches.length}`);
	if (codeMatches.length > 0) {
		console.log('First <code> sample:\n' + codeMatches[0][1].slice(0, 200));
	}

	// data- attributes that might contain code
	const dataAttrs = [...html.matchAll(/data-(?:html|css|code|src)="([^"]{20,})"/g)];
	console.log(`data-html/css/code attrs: ${dataAttrs.length}`);
	if (dataAttrs.length > 0) {
		console.log('First data attr sample: ' + dataAttrs[0][1].slice(0, 200));
	}

	// <textarea> or <pre> blocks
	const textareas = [...html.matchAll(/<textarea[^>]*>([\s\S]{10,300}?)<\/textarea>/g)];
	console.log(`<textarea> blocks: ${textareas.length}`);
	if (textareas.length > 0) {
		console.log('First textarea:\n' + textareas[0][1].slice(0, 200));
	}

	// JSON blobs in <script>
	const scriptBlocks = [...html.matchAll(/<script[^>]*>([\s\S]{50,}?)<\/script>/g)];
	console.log(`<script> blocks: ${scriptBlocks.length}`);
	for (const s of scriptBlocks.slice(0, 3)) {
		if (s[1].includes('html') || s[1].includes('css') || s[1].includes('code')) {
			console.log('Script with code-like content (first 300 chars):\n' + s[1].slice(0, 300));
		}
	}

	// Part item IDs / preview img URLs
	const partIds = [...new Set([...html.matchAll(/\b((?:btn|title|list|bg|ui-tools|form)[a-z0-9-]+)\b/g)].map(m => m[1]))];
	console.log(`Part id hints (first 10): ${partIds.slice(0, 10).join(', ')}`);

	// Preview image patterns
	const previewImgs = [...html.matchAll(/src="([^"]*\/parts\/[^"]*\.(?:png|jpg|gif|webp|svg))"/g)].map(m => m[1]);
	console.log(`Preview imgs (first 3): ${previewImgs.slice(0, 3).join(', ')}`);

	// Check if there's a direct /parts/preview/ route
	const previewUrls = [...html.matchAll(/href="(\/parts\/[^"?#]+)"/g)].map(m => m[1]);
	console.log(`/parts/* links (first 10): ${previewUrls.slice(0, 10).join(', ')}`);

	// Try fetching one part's direct asset if pattern is visible
	// e.g. /parts/css/btn1.css  or /parts/html/btn1.html
	for (const id of ['btn1', 'title1']) {
		for (const ext of ['.css', '.html', '.js']) {
			const probe = `/parts/${id}${ext}`;
			try {
				const res = await fetch(`${BASE}${probe}`, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } });
				if (res.ok) console.log(`FOUND direct file: ${probe} (${res.status})`);
				await new Promise(r => setTimeout(r, 200));
			} catch { /* silent */ }
		}
	}
}

// ─── 5. Try /parts/preview route ─────────────────────────────────────────────
async function probePartsPreview() {
	console.log('\n=== PARTS PREVIEW PROBE ===');
	// Try a single part preview page with ?id= or ?part= param
	for (const url of [
		`${BASE}/parts/catalog.php?id=btn1`,
		`${BASE}/parts/preview.php?id=btn1`,
		`${BASE}/parts/catalog.php?part=btn1`,
		`${BASE}/parts/?id=btn1`,
	]) {
		try {
			const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
			if (res.ok) {
				const text = await res.text();
				const hasCode = text.includes('<code') || text.includes('data-html') || text.includes('<textarea');
				console.log(`${url} → ${res.status}, code-like content: ${hasCode} (${text.length} chars)`);
				if (hasCode) {
					const m = text.match(/<code[^>]*>([\s\S]{5,300}?)<\/code>/);
					if (m) console.log('  code sample: ' + m[1].slice(0, 150));
				}
			} else {
				console.log(`${url} → ${res.status}`);
			}
			await new Promise(r => setTimeout(r, 300));
		} catch (e) {
			console.log(`${url} → error: ${e.message}`);
		}
	}
}

// ─── main ─────────────────────────────────────────────────────────────────────
async function main() {
	const detailIds = await probeListPage();
	const detail = await probeDetailPage(detailIds[0]);

	if (detail.zips.length > 0) {
		await probeZip(detail.zips[0]);
	} else {
		console.log('\nNo ZIP URLs found — check detail page HTML manually');
	}

	await probePartsCatalog();
	await probePartsPreview();

	console.log('\n=== SPIKE COMPLETE ===');
}

main().catch(e => { console.error(e); process.exitCode = 1; });
