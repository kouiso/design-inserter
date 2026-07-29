import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const pluginSlug = 'designinserter';
const pluginDir = path.join(repoRoot, 'wp-content/plugins', pluginSlug);
const packageJsonPath = path.join(repoRoot, 'package.json');
const catalogPath = path.join(pluginDir, 'data/css-stock-parts.json');
const noticePath = path.join(pluginDir, 'NOTICE.md');
const pluginMainPath = path.join(pluginDir, 'designinserter.php');
const defaultOutputPath = path.join(repoRoot, '.tmp/ready-checklist/designinserter-ready-checklist.json');

const targetTickets = [
	'K036',
	'K041',
	'K070',
	'K071',
	'K072',
	'K073',
	'K074',
	'K075',
	'K076',
	'K077',
];

const ticketLabels = {
	K036: 'Candidate build and package hash readiness',
	K041: 'WordPress plugin metadata and distribution scope readiness',
	K070: 'Catalog count and source attribution readiness',
	K071: 'CTA copy and insertion flow readiness',
	K072: 'Error and log audit readiness',
	K073: 'Persona drift and internal-instruction grep readiness',
	K074: 'Content cross-check readiness',
	K075: 'Signing and store metadata applicability readiness',
	K076: 'Release approval and rollback sign-off readiness',
	K077: 'Final ready packet assembly readiness',
};

const commandBook = {
	generateChecklist: {
		command: 'npm run ready:checklist',
		artifact: '.tmp/ready-checklist/designinserter-ready-checklist.json',
	},
	buildZip: {
		command: 'npm run build:zip',
		artifact: 'dist/designinserter-<package.version>.zip',
	},
	phpunit: {
		command: 'npm run test:php',
		artifact: '.tmp/ready-checklist/phpunit.txt',
	},
	phpcs: {
		command: 'npm run phpcs',
		artifact: '.tmp/ready-checklist/phpcs.txt',
	},
	phpLint: {
		command: 'npm run php:lint',
		artifact: '.tmp/ready-checklist/php-lint.txt',
	},
	e2eFresh: {
		command: 'npm run e2e:fresh',
		artifact: '.tmp/e2e-fresh-wp/evidence/fresh-report.json',
	},
	errorLogAudit: {
		command: 'rg -n "(console\\.(error|warn)|throw new Error|error_log|wp_die|trigger_error)" wp-content/plugins/designinserter scripts docs openspec -S',
		artifact: '.tmp/ready-checklist/error-log-audit.txt',
	},
	personaDriftGrep: {
		command: 'rg -n "(taishi|kumicho|persona|ready checklist|K0(36|41|7[0-7])|TODO|FIXME|lorem|placeholder)" README.md docs openspec wp-content/plugins/designinserter scripts -S',
		artifact: '.tmp/ready-checklist/persona-drift-grep.txt',
	},
	contentCrossCheck: {
		command: 'node scripts/generate-ready-checklist.mjs --stdout',
		artifact: '.tmp/ready-checklist/designinserter-ready-checklist.json',
	},
};

const parseArgs = (argv) => {
	const args = {
		outputPath: process.env.DI_READY_CHECKLIST_PATH || defaultOutputPath,
		stdout: false,
	};

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];

		if (arg === '--stdout') {
			args.stdout = true;
			continue;
		}

		if (arg === '--output') {
			const next = argv[index + 1];
			if (!next) {
				throw new Error('--output requires a path.');
			}
			args.outputPath = path.resolve(repoRoot, next);
			index += 1;
			continue;
		}

		throw new Error(`Unknown argument: ${arg}`);
	}

	return args;
};

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'));

const fileExists = async (filePath) => {
	try {
		const result = await stat(filePath);
		return result.isFile();
	} catch {
		return false;
	}
};

const sha256File = async (filePath) => {
	const bytes = await readFile(filePath);
	return createHash('sha256').update(bytes).digest('hex');
};

const parsePluginHeader = (source) => {
	const headerMatch = source.match(/\/\*([\s\S]*?)\*\//);
	if (!headerMatch) {
		return {};
	}

	const header = {};
	for (const rawLine of headerMatch[1].split('\n')) {
		const line = rawLine.replace(/^\s*\*\s?/, '').trim();
		const match = line.match(/^([^:]+):\s*(.*)$/);
		if (match) {
			header[match[1]] = match[2];
		}
	}

	return header;
};

export const collectPackageFacts = async (packageJson, rootDir = repoRoot) => {
	const distDir = path.join(rootDir, 'dist');
	let distFiles = [];

	try {
		distFiles = await readdir(distDir);
	} catch {
		distFiles = [];
	}

	const expectedZipName = `${pluginSlug}-${packageJson.version}.zip`;
	const expectedZipPath = path.join(distDir, expectedZipName);
	const expectedZipExists = await fileExists(expectedZipPath);
	const distZips = distFiles.filter((file) => file.endsWith('.zip')).sort();

	return {
		name: packageJson.name,
		version: packageJson.version,
		private: packageJson.private === true,
		expectedZip: {
			path: path.relative(rootDir, expectedZipPath),
			exists: expectedZipExists,
			sha256: expectedZipExists ? await sha256File(expectedZipPath) : '',
		},
		distZips,
		staleDistZips: distZips.filter((file) => file !== expectedZipName),
	};
};

const collectCatalogFacts = async (catalog) => {
	const parts = Array.isArray(catalog.parts) ? catalog.parts : [];
	const categories = Array.isArray(catalog.categories) ? catalog.categories : [];
	const duplicateIds = [];
	const ids = new Set();
	const missingRequiredFields = [];
	const missingPreviewFiles = [];
	const missingSourceUrls = [];
	const emptyHtmlOrMissingCss = [];
	const emptyCssParts = [];

	for (const part of parts) {
		if (part?.id) {
			if (ids.has(part.id)) {
				duplicateIds.push(part.id);
			}
			ids.add(part.id);
		}

		const missingFields = ['id', 'category', 'title', 'sourceUrl', 'html', 'css', 'previewImage'].filter((field) => {
			if (field === 'css') {
				return typeof part?.css !== 'string';
			}

			return !part?.[field];
		});
		if (missingFields.length > 0) {
			missingRequiredFields.push({
				id: part?.id || '',
				missingFields,
			});
		}

		if (!part?.sourceUrl) {
			missingSourceUrls.push(part?.id || '');
		}

		if (!part?.html || typeof part?.css !== 'string') {
			emptyHtmlOrMissingCss.push(part?.id || '');
		}

		if (part?.css === '') {
			emptyCssParts.push(part?.id || '');
		}

		if (part?.previewImage) {
			const previewPath = path.join(pluginDir, part.previewImage);
			if (!(await fileExists(previewPath))) {
				missingPreviewFiles.push({
					id: part.id || '',
					previewImage: part.previewImage,
				});
			}
		}
	}

	return {
		sourceName: catalog.sourceName || '',
		sourceUrl: catalog.sourceUrl || '',
		scrapedAt: catalog.scrapedAt || '',
		expectedTotal: catalog.expectedTotal ?? null,
		total: catalog.total ?? null,
		actualPartCount: parts.length,
		actualCategoryCount: categories.length,
		categoryExpectedPartTotal: categories.reduce((sum, category) => sum + (category.expectedPartCount || 0), 0),
		duplicateIds,
		missingRequiredFields,
		missingPreviewFiles,
		missingSourceUrls,
		emptyHtmlOrMissingCss,
		emptyCssParts,
		sourceNoticePresent: typeof catalog.sourceNotice === 'string' && catalog.sourceNotice.length > 0,
	};
};

const makeStatus = (passed) => (passed ? 'pass' : 'fail');

const buildContentCrossCheck = (facts) => {
	const checks = [
		{
			id: 'catalog-total-matches-expected',
			status: makeStatus(
				facts.catalog.expectedTotal === facts.catalog.total
					&& facts.catalog.total === facts.catalog.actualPartCount,
			),
			expected: facts.catalog.expectedTotal,
			actual: facts.catalog.actualPartCount,
		},
		{
			id: 'category-total-matches-part-total',
			status: makeStatus(facts.catalog.categoryExpectedPartTotal === facts.catalog.actualPartCount),
			expected: facts.catalog.categoryExpectedPartTotal,
			actual: facts.catalog.actualPartCount,
		},
		{
			id: 'no-duplicate-part-ids',
			status: makeStatus(facts.catalog.duplicateIds.length === 0),
			findings: facts.catalog.duplicateIds,
		},
		{
			id: 'all-required-part-fields-present',
			status: makeStatus(facts.catalog.missingRequiredFields.length === 0),
			findings: facts.catalog.missingRequiredFields,
		},
		{
			id: 'all-preview-files-exist',
			status: makeStatus(facts.catalog.missingPreviewFiles.length === 0),
			findings: facts.catalog.missingPreviewFiles,
		},
		{
			id: 'source-notice-present',
			status: makeStatus(facts.catalog.sourceNoticePresent && facts.notice.cssStockSourcePresent),
			findings: {
				catalogSourceNoticePresent: facts.catalog.sourceNoticePresent,
				noticeCssStockSourcePresent: facts.notice.cssStockSourcePresent,
			},
		},
		{
			id: 'plugin-version-matches-package-version',
			status: makeStatus(facts.plugin.header.Version === facts.package.version),
			expected: facts.package.version,
			actual: facts.plugin.header.Version || '',
		},
	];

	return {
		status: checks.every((check) => check.status === 'pass') ? 'pass' : 'fail',
		checks,
		command: commandBook.contentCrossCheck.command,
		artifact: commandBook.contentCrossCheck.artifact,
	};
};

const buildCtaTable = () => [
	{
		ticket: 'K036',
		cta: 'Build the release candidate zip and record size plus SHA256.',
		ownerRole: 'release owner',
		command: commandBook.buildZip.command,
		artifact: commandBook.buildZip.artifact,
		status: 'not_run_by_generator',
		blocking: true,
	},
	{
		ticket: 'K041',
		cta: 'Confirm plugin header metadata, package version, NOTICE, and distribution scope.',
		ownerRole: 'release owner',
		command: commandBook.generateChecklist.command,
		artifact: commandBook.generateChecklist.artifact,
		status: 'manual_review_required',
		blocking: true,
	},
	{
		ticket: 'K070',
		cta: 'Verify catalog totals, required fields, source URLs, and preview assets.',
		ownerRole: 'qa owner',
		command: commandBook.contentCrossCheck.command,
		artifact: commandBook.contentCrossCheck.artifact,
		status: 'auto_checked',
		blocking: true,
	},
	{
		ticket: 'K071',
		cta: 'Capture CTA and insertion-flow evidence for block, shortcode, and REST preview paths.',
		ownerRole: 'qa owner',
		command: commandBook.e2eFresh.command,
		artifact: commandBook.e2eFresh.artifact,
		status: 'not_run_by_generator',
		blocking: true,
	},
	{
		ticket: 'K072',
		cta: 'Review runtime-facing errors, warnings, and explicit throws for acceptable behavior.',
		ownerRole: 'engineering owner',
		command: commandBook.errorLogAudit.command,
		artifact: commandBook.errorLogAudit.artifact,
		status: 'manual_review_required',
		blocking: true,
	},
	{
		ticket: 'K073',
		cta: 'Grep for internal persona, coordination, placeholder, and ticket-marker leakage.',
		ownerRole: 'content owner',
		command: commandBook.personaDriftGrep.command,
		artifact: commandBook.personaDriftGrep.artifact,
		status: 'manual_review_required',
		blocking: true,
	},
	{
		ticket: 'K074',
		cta: 'Cross-check generated content against catalog source, NOTICE, and rendered evidence.',
		ownerRole: 'qa owner',
		command: commandBook.contentCrossCheck.command,
		artifact: commandBook.contentCrossCheck.artifact,
		status: 'auto_checked',
		blocking: true,
	},
	{
		ticket: 'K075',
		cta: 'Decide whether zip signing, wordpress.org/store metadata, or paid redistribution approval applies.',
		ownerRole: 'release owner',
		command: commandBook.generateChecklist.command,
		artifact: commandBook.generateChecklist.artifact,
		status: 'manual_review_required',
		blocking: true,
	},
	{
		ticket: 'K076',
		cta: 'Collect named sign-offs for release, QA, legal/licensing, and rollback readiness.',
		ownerRole: 'release owner',
		command: commandBook.generateChecklist.command,
		artifact: commandBook.generateChecklist.artifact,
		status: 'manual_review_required',
		blocking: true,
	},
	{
		ticket: 'K077',
		cta: 'Assemble final ready packet with checklist JSON, command outputs, screenshots, zip hash, and open exceptions.',
		ownerRole: 'release owner',
		command: commandBook.generateChecklist.command,
		artifact: '.tmp/ready-checklist/',
		status: 'manual_review_required',
		blocking: true,
	},
];

const buildManualAuditBlocks = (facts) => ({
	errorLogAudit: {
		status: 'manual_review_required',
		command: commandBook.errorLogAudit.command,
		artifact: commandBook.errorLogAudit.artifact,
		reviewQuestions: [
			'Are all explicit throws reachable only for invalid setup, invalid catalog data, or failed local tooling?',
			'Are browser console warnings/errors in fresh install evidence empty or explained?',
			'Are REST and render failures fail-closed without leaking private data?',
		],
		knownInputs: [
			'wp-content/plugins/designinserter',
			'scripts',
			'docs',
			'openspec',
			'.tmp/e2e-fresh-wp/evidence/fresh-report.json',
		],
	},
	personaDriftGrep: {
		status: 'manual_review_required',
		command: commandBook.personaDriftGrep.command,
		artifact: commandBook.personaDriftGrep.artifact,
		reviewQuestions: [
			'Do user-facing docs, PHP, JS, and catalog data avoid agent/persona names and coordination text?',
			'Are any K036/K041/K070-K077 references limited to release evidence, not plugin runtime output?',
			'Are TODO, FIXME, lorem, and placeholder findings acceptable for the release candidate?',
		],
	},
	signingStoreMetaApplicability: {
		status: 'manual_review_required',
		applicability: {
			packagePrivate: facts.package.private,
			zipSigning: 'not_applicable_unless_distribution_channel_requires_signed_zip',
			wordPressOrgStoreMeta: 'not_applicable_unless_submitting_to_wordpress_org',
			paidRedistribution: facts.notice.paidRedistributionWarningPresent
				? 'requires_explicit_css_stock_permission_before_paid_public_distribution'
				: 'manual_legal_review_required',
			externalSend: 'not_performed_by_this_generator',
		},
		requiredDecisionFields: [
			'distributionChannel',
			'zipSigningRequired',
			'storeMetadataRequired',
			'cssStockPermissionStatus',
			'decisionOwner',
			'decisionAt',
		],
	},
});

const buildSignOffFields = () => ({
	status: 'unsigned',
	requiredFields: [
		{
			id: 'releaseOwner',
			label: 'Release owner',
			type: 'string',
			required: true,
		},
		{
			id: 'qaOwner',
			label: 'QA owner',
			type: 'string',
			required: true,
		},
		{
			id: 'engineeringOwner',
			label: 'Engineering owner',
			type: 'string',
			required: true,
		},
		{
			id: 'licensingOwner',
			label: 'Licensing or distribution owner',
			type: 'string',
			required: true,
		},
		{
			id: 'approvedAt',
			label: 'Approval timestamp',
			type: 'datetime',
			required: true,
		},
		{
			id: 'readyDecision',
			label: 'Ready decision',
			type: 'enum',
			allowedValues: ['ready', 'ready_with_exceptions', 'not_ready'],
			required: true,
		},
		{
			id: 'openExceptions',
			label: 'Open exceptions',
			type: 'array',
			required: true,
		},
		{
			id: 'rollbackPlan',
			label: 'Rollback plan',
			type: 'string',
			required: true,
		},
	],
	values: {
		releaseOwner: '',
		qaOwner: '',
		engineeringOwner: '',
		licensingOwner: '',
		approvedAt: '',
		readyDecision: '',
		openExceptions: [],
		rollbackPlan: '',
		notes: '',
	},
	perTicket: Object.fromEntries(
		targetTickets.map((ticket) => [
			ticket,
			{
				status: 'unsigned',
				approver: '',
				approvedAt: '',
				evidenceArtifacts: [],
				notes: '',
			},
		]),
	),
});

const collectFacts = async () => {
	const packageJson = await readJson(packageJsonPath);
	const catalog = await readJson(catalogPath);
	const notice = await readFile(noticePath, 'utf8');
	const pluginSource = await readFile(pluginMainPath, 'utf8');
	const pluginHeader = parsePluginHeader(pluginSource);

	return {
		package: await collectPackageFacts(packageJson),
		plugin: {
			mainFile: path.relative(repoRoot, pluginMainPath),
			header: pluginHeader,
			versionConstantMatchesHeader: pluginSource.includes(`define( 'DESIGNINSERTER_VERSION', '${pluginHeader.Version}' );`),
		},
		catalog: await collectCatalogFacts(catalog),
		notice: {
			path: path.relative(repoRoot, noticePath),
			cssStockSourcePresent: notice.includes('https://pote-chil.com/css-stock/ja'),
			paidRedistributionWarningPresent: notice.includes('does not explicitly grant paid redistribution'),
			remixIconNoticePresent: notice.includes('Remix Icon'),
		},
	};
};

const buildChecklist = async () => {
	const facts = await collectFacts();
	const manualAudits = buildManualAuditBlocks(facts);
	const contentCrossCheck = buildContentCrossCheck(facts);

	return {
		schemaVersion: 1,
		generatedAt: new Date().toISOString(),
		generatedBy: 'scripts/generate-ready-checklist.mjs',
		project: {
			name: facts.package.name,
			pluginSlug,
			version: facts.package.version,
		},
		scope: {
			tickets: targetTickets.map((ticket) => ({
				id: ticket,
				label: ticketLabels[ticket],
			})),
			nonGoals: [
				'Does not push, merge, submit to external stores, or call external password/ops CLIs.',
				'Does not edit tests/e2e.',
				'Does not mark manual sign-offs as complete.',
			],
		},
		localFacts: facts,
		ctaTable: buildCtaTable(),
		evidenceGeneration: {
			outputDirectory: '.tmp/ready-checklist',
			recommendedArtifacts: [
				commandBook.generateChecklist.artifact,
				commandBook.buildZip.artifact,
				commandBook.phpunit.artifact,
				commandBook.phpcs.artifact,
				commandBook.phpLint.artifact,
				commandBook.errorLogAudit.artifact,
				commandBook.personaDriftGrep.artifact,
				'.tmp/e2e-fresh-wp/evidence/fresh-report.json',
				'.tmp/e2e-fresh-wp/evidence/fresh-all-designs.png',
				'.tmp/e2e-fresh-wp/evidence/fresh-shortcode.png',
				'.tmp/e2e-fresh-wp/evidence/rest-preview-heading-1.json',
			],
			commands: Object.values(commandBook),
		},
		audits: {
			contentCrossCheck,
			errorLogAudit: manualAudits.errorLogAudit,
			personaDriftGrep: manualAudits.personaDriftGrep,
			signingStoreMetaApplicability: manualAudits.signingStoreMetaApplicability,
		},
		readyGates: [
			{
				id: 'all-local-content-cross-checks-pass',
				status: contentCrossCheck.status,
				blocking: true,
			},
			{
				id: 'candidate-zip-built-and-hashed',
				status: facts.package.expectedZip.exists ? 'pass' : 'not_run',
				blocking: true,
				evidence: facts.package.expectedZip,
			},
			{
				id: 'manual-audits-reviewed',
				status: 'manual_review_required',
				blocking: true,
				audits: ['errorLogAudit', 'personaDriftGrep', 'signingStoreMetaApplicability'],
			},
			{
				id: 'all-sign-offs-present',
				status: 'unsigned',
				blocking: true,
			},
		],
		signOffFields: buildSignOffFields(),
	};
};

const main = async () => {
	const args = parseArgs(process.argv.slice(2));
	const checklist = await buildChecklist();
	const output = `${JSON.stringify(checklist, null, 2)}\n`;

	if (args.stdout) {
		process.stdout.write(output);
		return;
	}

	await mkdir(path.dirname(args.outputPath), { recursive: true });
	await writeFile(args.outputPath, output);
	console.log(`Wrote ${path.relative(repoRoot, args.outputPath)}`);
};

if (path.resolve(process.argv[1] || '') === fileURLToPath(import.meta.url)) {
	main().catch((error) => {
		console.error(error);
		process.exitCode = 1;
	});
}
