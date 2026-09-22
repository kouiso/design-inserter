import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const baseUrl = 'https://pote-chil.com';
const indexUrl = `${baseUrl}/css-stock/ja`;
const outputPath = path.resolve('wp-content/plugins/designinserter/data/css-stock-parts.json');
const previewOutputDir = path.resolve('wp-content/plugins/designinserter/assets/previews');
const previewTempDir = path.resolve('wp-content/plugins/designinserter/assets/.previews-tmp');
const embeddedAssetOutputDir = path.resolve('wp-content/plugins/designinserter/assets/embedded');
const embeddedAssetTempDir = path.resolve('wp-content/plugins/designinserter/assets/.embedded-tmp');

function decodeHtml(value) {
	return value
		.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
		.replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)))
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&');
}

function stripTags(value) {
	return decodeHtml(value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());
}

function normalizeCode(value) {
	return decodeHtml(value)
		.replace(/\r\n/g, '\n')
		.replace(/^\n+/, '')
		.replace(/\n+$/, '')
		.replace(/^ {10}/gm, '');
}

async function fetchText(url) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
	}
	return response.text();
}

async function fetchAsset(url) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
	}
	return {
		bytes: Buffer.from(await response.arrayBuffer()),
		contentType: response.headers.get('content-type') || '',
	};
}

function getPreviewAssetPath(partId, imagePath) {
	if (!imagePath) {
		return '';
	}

	const sourcePath = new URL(imagePath, baseUrl).pathname;
	const ext = path.extname(sourcePath).toLowerCase() || '.svg';
	return `assets/previews/${partId}${ext}`;
}

function detectPreviewExtension(bytes, contentType, sourceUrl) {
	if (bytes.slice(0, 4).toString('ascii') === 'GIF8') {
		return '.gif';
	}
	if (bytes.slice(0, 4).toString('ascii') === 'RIFF' && bytes.slice(8, 12).toString('ascii') === 'WEBP') {
		return '.webp';
	}
	if (bytes.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
		return '.png';
	}
	if (contentType.includes('svg') || bytes.slice(0, 300).toString('utf8').includes('<svg')) {
		return '.svg';
	}

	return path.extname(new URL(sourceUrl).pathname).toLowerCase() || '.svg';
}

function getEmbeddedAssetPath(sourcePath, ext) {
	const pathname = new URL(sourcePath, baseUrl).pathname;
	const stem = pathname
		.replace(/^\/+/, '')
		.replace(/\.[a-z0-9]+$/i, '')
		.replace(/[^a-z0-9]+/gi, '-')
		.replace(/^-+|-+$/g, '')
		.toLowerCase();

	return `assets/embedded/${stem}${ext}`;
}

function extractEmbeddedAssetRefs(value) {
	if (!value || !value.includes('/css-stock/img/')) {
		return [];
	}

	const refs = new Set();
	const attrRegex = /\b(?:src|href)=["'](\/css-stock\/img\/[^"']+)["']/g;
	const cssUrlRegex = /url\(\s*["']?(\/css-stock\/img\/[^"')]+)["']?\s*\)/g;

	for (const match of value.matchAll(attrRegex)) {
		refs.add(match[1]);
	}

	for (const match of value.matchAll(cssUrlRegex)) {
		refs.add(match[1]);
	}

	return [...refs];
}

function extractCategories(html) {
	const categories = [];
	const seen = new Set();
	const regex = /<a[^>]+href="(\/css-stock\/ja\/[^"]+)"[\s\S]*?<div class="[^"]*_title_1oov1_35[^"]*">([\s\S]*?)<\/div>[\s\S]*?<span[^>]+data-count="(\d+)"[^>]+aria-label="セクション数：\d+"[\s\S]*?<span[^>]+data-count="(\d+)"[^>]+aria-label="スニペット数：\d+"/g;

	for (const match of html.matchAll(regex)) {
		const href = match[1];
		const slug = href.split('/').pop();
		if (seen.has(slug)) {
			continue;
		}
		seen.add(slug);

		categories.push({
			slug,
			label: stripTags(match[2]),
			url: `${baseUrl}${href}`,
			sectionCount: Number.parseInt(match[3], 10),
			expectedPartCount: Number.parseInt(match[4], 10),
		});
	}

	return categories;
}

function getSectionAt(sections, index) {
	let current = '';
	for (const section of sections) {
		if (section.index > index) {
			break;
		}
		current = section.title;
	}
	return current;
}

function extractCode(template, heading) {
	const headingIndex = template.indexOf(`<h4>${heading}</h4>`);
	if (headingIndex < 0) {
		return '';
	}

	const codeMatch = template.slice(headingIndex).match(/<code>([\s\S]*?)<\/code>/);
	return codeMatch ? normalizeCode(codeMatch[1]) : '';
}

function extractInputs(template) {
	const inputs = [];
	const regex = /<span>\s*([^：<]+)：<output>(#[0-9a-fA-F]{6})<\/output>\s*<\/span>/g;

	for (const match of template.matchAll(regex)) {
		inputs.push({
			label: stripTags(match[1]),
			defaultValue: match[2],
		});
	}

	return inputs;
}

function getPartBehavior(category, sourcePartId) {
	const id = `${category.slug}-${sourcePartId}`;

	if (category.slug === 'modal' && sourcePartId >= 1 && sourcePartId <= 2) {
		const rootSelector = `.modal-${sourcePartId}__wrap`;
		return {
			type: 'modal',
			requiresJs: true,
			enhancementLevel: 'required',
			rootSelector,
			selectors: [
				`${rootSelector} .modal-${sourcePartId}__open-label`,
				`${rootSelector} .modal-${sourcePartId}__close-label`,
				`${rootSelector} .modal-${sourcePartId}__background`,
				`${rootSelector} .modal-${sourcePartId}__content`,
			],
			events: ['click', 'keydown'],
			a11y: ['aria-modal', 'focusTrap', 'escapeClose', 'returnFocus'],
		};
	}

	if (category.slug === 'tab' && sourcePartId >= 1 && sourcePartId <= 4) {
		const rootSelector = `.tab-${sourcePartId}`;
		return {
			type: 'tabs',
			requiresJs: true,
			enhancementLevel: 'required',
			rootSelector,
			selectors: [`${rootSelector} input[type="radio"]`, `${rootSelector} label`],
			events: ['change', 'keydown'],
			a11y: ['roleTablist', 'roleTab', 'roleTabpanel', 'arrowKeys'],
		};
	}

	if (category.slug === 'read-more' && sourcePartId >= 1 && sourcePartId <= 4) {
		const rootSelector = `.read-more-${sourcePartId}`;
		return {
			type: 'readMore',
			requiresJs: true,
			enhancementLevel: 'required',
			rootSelector,
			selectors: [`${rootSelector} input[type="checkbox"]`, `${rootSelector} label`],
			events: ['change'],
			a11y: ['aria-expanded', 'aria-controls'],
		};
	}

	if (id === 'button-20') {
		return {
			type: 'scrollTop',
			requiresJs: true,
			enhancementLevel: 'required',
			rootSelector: '.button-20',
			selectors: ['.button-20'],
			events: ['click'],
			a11y: ['aria-label'],
		};
	}

	if (category.slug === 'tooltip' && sourcePartId >= 1 && sourcePartId <= 5) {
		const rootSelector = `.tooltip-${String(sourcePartId).padStart(3, '0')}`;
		return {
			type: 'tooltip',
			requiresJs: true,
			enhancementLevel: 'recommended',
			rootSelector,
			selectors: [`${rootSelector} > :first-child`, `${rootSelector} span, ${rootSelector} p`],
			events: ['mouseenter', 'mouseleave', 'focus', 'blur'],
			a11y: ['aria-describedby', 'roleTooltip'],
		};
	}

	return null;
}

function normalizePartCss(category, sourcePartId, cssCode) {
	if (category.slug === 'loading' && sourcePartId === 15) {
		return cssCode
			.replace(
				'.loading-15 {\n    transform-style: preserve-3d;',
				'.loading-15 {\n    position: relative;\n    width: 48px;\n    height: 48px;\n    margin: 24px auto;\n    transform-style: preserve-3d;'
			)
			.replace(
				'.loading-15 span {\n    position: absolute;\n    top: -24px;\n    left: -24px;',
				'.loading-15 span {\n    position: absolute;\n    top: 0;\n    left: 0;'
			);
	}

	return cssCode;
}

function extractParts(category, html) {
	const sections = [];
	const sectionRegex = /<h2\b[^>]*class="[^"]*_title_1dytu_[^"]*"[^>]*>([\s\S]*?)<\/h2>/g;
	for (const match of html.matchAll(sectionRegex)) {
		sections.push({
			index: match.index,
			title: stripTags(match[1]),
		});
	}

	const pageTitle = stripTags((html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/) || [null, category.label])[1]);
	const parts = [];
	const snippetRegex = /<snippet-card>([\s\S]*?)<\/snippet-card>\s*<template>([\s\S]*?)<\/template>/g;

	for (const match of html.matchAll(snippetRegex)) {
		const card = match[1];
		const template = match[2];
		const rawId = (card.match(/href="#(\d+)"/) || [null, ''])[1];
		const title = stripTags((card.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/) || [null, ''])[1]);
		const imagePath = (card.match(/<img\b[^>]*src="([^"]+)"/) || [null, ''])[1];
		const htmlCode = extractCode(template, 'HTMLをコピペする');
		const cssCode = normalizePartCss(category, Number.parseInt(rawId || '0', 10), extractCode(template, 'CSSをコピペする'));

		if (!rawId || !title || !htmlCode) {
			continue;
		}

		const id = `${category.slug}-${rawId}`;
		const sourcePartId = Number.parseInt(rawId, 10);
		const behavior = getPartBehavior(category, sourcePartId);
		const previewSourceImage = imagePath ? `${baseUrl}${imagePath}` : '';

		parts.push({
			id,
			sourcePartId,
			category: category.slug,
			categoryLabel: category.label,
			categoryTitle: pageTitle,
			section: getSectionAt(sections, match.index),
			title,
			html: htmlCode,
			css: cssCode,
			inputs: extractInputs(template),
			...(behavior ? { behavior } : {}),
			previewImage: getPreviewAssetPath(id, imagePath),
			previewSourceImage,
			sourceUrl: `${category.url}#${rawId}`,
		});
	}

	return parts;
}

async function downloadPreviewAssets(parts) {
	await rm(previewTempDir, { recursive: true, force: true });
	await mkdir(previewTempDir, { recursive: true });

	let downloaded = 0;
	for (const part of parts) {
		if (!part.previewSourceImage || !part.previewImage) {
			continue;
		}

		const { bytes, contentType } = await fetchAsset(part.previewSourceImage);
		const ext = detectPreviewExtension(bytes, contentType, part.previewSourceImage);
		part.previewImage = `assets/previews/${part.id}${ext}`;
		const outputFile = path.join(previewTempDir, path.basename(part.previewImage));
		await writeFile(outputFile, bytes);
		downloaded += 1;
	}

	await rm(previewOutputDir, { recursive: true, force: true });
	await mkdir(path.dirname(previewOutputDir), { recursive: true });
	await rename(previewTempDir, previewOutputDir);
	console.log(`Downloaded ${downloaded} preview assets to ${previewOutputDir}`);
}

async function downloadEmbeddedAssets(parts) {
	await rm(embeddedAssetTempDir, { recursive: true, force: true });
	await mkdir(embeddedAssetTempDir, { recursive: true });

	const sourcePaths = new Set();
	for (const part of parts) {
		for (const sourcePath of extractEmbeddedAssetRefs(part.html)) {
			sourcePaths.add(sourcePath);
		}
		for (const sourcePath of extractEmbeddedAssetRefs(part.css)) {
			sourcePaths.add(sourcePath);
		}
	}

	const assetMap = new Map();
	for (const sourcePath of sourcePaths) {
		const sourceUrl = new URL(sourcePath, baseUrl).href;
		const { bytes, contentType } = await fetchAsset(sourceUrl);
		const ext = detectPreviewExtension(bytes, contentType, sourceUrl);
		const assetPath = getEmbeddedAssetPath(sourcePath, ext);
		const outputFile = path.join(embeddedAssetTempDir, path.basename(assetPath));
		await writeFile(outputFile, bytes);
		assetMap.set(sourcePath, assetPath);
	}

	for (const part of parts) {
		for (const [sourcePath, assetPath] of assetMap.entries()) {
			part.html = part.html.replaceAll(sourcePath, assetPath);
			part.css = part.css.replaceAll(sourcePath, assetPath);
		}
	}

	await rm(embeddedAssetOutputDir, { recursive: true, force: true });
	await mkdir(path.dirname(embeddedAssetOutputDir), { recursive: true });
	await rename(embeddedAssetTempDir, embeddedAssetOutputDir);
	console.log(`Downloaded ${assetMap.size} embedded assets to ${embeddedAssetOutputDir}`);
}

async function main() {
	const indexHtml = await fetchText(indexUrl);
	const categories = extractCategories(indexHtml);

	if (!categories.length) {
		throw new Error('No CSS Stock categories found.');
	}

	const parts = [];
	for (const category of categories) {
		const html = await fetchText(category.url);
		const categoryParts = extractParts(category, html);
		parts.push(...categoryParts);
		console.log(`${category.slug}: ${categoryParts.length}/${category.expectedPartCount}`);
	}

	const expectedTotal = categories.reduce((sum, category) => sum + category.expectedPartCount, 0);
	await downloadPreviewAssets(parts);
	await downloadEmbeddedAssets(parts);
	const catalogParts = parts.map(({ previewSourceImage, ...part }) => part);
	const catalog = {
		sourceName: 'CSS Stock',
		sourceUrl: indexUrl,
		sourceNotice: 'CSS Stock permits use of listed source code on websites/blogs and asks that source links be included when the code itself is republished elsewhere.',
		scrapedAt: new Date().toISOString(),
		expectedTotal,
		total: catalogParts.length,
		categories,
		parts: catalogParts,
	};

	await mkdir(path.dirname(outputPath), { recursive: true });
	await writeFile(outputPath, `${JSON.stringify(catalog, null, 2)}\n`);

	if (catalogParts.length !== expectedTotal) {
		throw new Error(`Scraped ${catalogParts.length} parts, expected ${expectedTotal}.`);
	}

	console.log(`Wrote ${catalogParts.length} parts to ${outputPath}`);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
