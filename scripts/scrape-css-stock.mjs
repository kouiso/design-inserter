import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const baseUrl = 'https://pote-chil.com';
const indexUrl = `${baseUrl}/css-stock/ja`;
const outputPath = path.resolve('wp-content/plugins/designinserter/data/css-stock-parts.json');

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
		const cssCode = extractCode(template, 'CSSをコピペする');

		if (!rawId || !title || !htmlCode) {
			continue;
		}

		parts.push({
			id: `${category.slug}-${rawId}`,
			sourcePartId: Number.parseInt(rawId, 10),
			category: category.slug,
			categoryLabel: category.label,
			categoryTitle: pageTitle,
			section: getSectionAt(sections, match.index),
			title,
			html: htmlCode,
			css: cssCode,
			inputs: extractInputs(template),
			previewImage: imagePath ? `${baseUrl}${imagePath}` : '',
			sourceUrl: `${category.url}#${rawId}`,
		});
	}

	return parts;
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
	const catalog = {
		sourceName: 'CSS Stock',
		sourceUrl: indexUrl,
		sourceNotice: 'CSS Stock permits use of listed source code on websites/blogs and asks that source links be included when the code itself is republished elsewhere.',
		scrapedAt: new Date().toISOString(),
		expectedTotal,
		total: parts.length,
		categories,
		parts,
	};

	await mkdir(path.dirname(outputPath), { recursive: true });
	await writeFile(outputPath, `${JSON.stringify(catalog, null, 2)}\n`);

	if (parts.length !== expectedTotal) {
		throw new Error(`Scraped ${parts.length} parts, expected ${expectedTotal}.`);
	}

	console.log(`Wrote ${parts.length} parts to ${outputPath}`);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
