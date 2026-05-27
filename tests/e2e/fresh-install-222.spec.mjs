import { execFile } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { test, expect } from '@playwright/test';

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(new URL('../..', import.meta.url).pathname);
const tmpRoot = path.join(repoRoot, '.tmp', 'e2e-fresh-wp');
const evidenceDir = path.join(tmpRoot, 'evidence');
const composePath = path.join(tmpRoot, 'docker-compose.yml');
const projectName = 'designinserter-e2e';
const port = process.env.DI_E2E_PORT || '18082';
const baseUrl = `http://127.0.0.1:${port}`;
const packageJson = JSON.parse(await readFile(path.join(repoRoot, 'package.json'), 'utf8'));
let allDesignsPageId = '';
let shortcodePageId = '';
let editorPageId = '';

function yamlDoubleQuoted(value) {
	return JSON.stringify(value);
}

async function run(command, args, options = {}) {
	const result = await execFileAsync(command, args, {
		cwd: repoRoot,
		maxBuffer: 1024 * 1024 * 20,
		...options,
	});
	return result.stdout.trim();
}

async function dockerCompose(args, options = {}) {
	return run('docker', ['compose', '-f', composePath, '-p', projectName, ...args], options);
}

async function prepareExternalDatabase() {
	await run('docker', [
		'exec',
		'designinserter-db',
		'mysql',
		'-uroot',
		'-prootpass',
		'-e',
		'DROP DATABASE IF EXISTS designinserter_e2e; CREATE DATABASE designinserter_e2e CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; GRANT ALL PRIVILEGES ON designinserter_e2e.* TO "wordpress"@"%"; FLUSH PRIVILEGES;',
	], { timeout: 60000 });
}

async function cleanupExternalDatabase() {
	await run('docker', [
		'exec',
		'designinserter-db',
		'mysql',
		'-uroot',
		'-prootpass',
		'-e',
		'DROP DATABASE IF EXISTS designinserter_e2e;',
	], { timeout: 60000 }).catch(() => {});
}

function collectBrowserIssues(page) {
	const issues = {
		failedRequests: [],
		consoleErrors: [],
		pageErrors: [],
	};

	page.on('requestfailed', (requestInfo) => issues.failedRequests.push({
		url: requestInfo.url(),
		failure: requestInfo.failure()?.errorText || '',
	}));
	page.on('console', (message) => {
		if (message.type() === 'error') {
			issues.consoleErrors.push(message.text());
		}
	});
	page.on('pageerror', (error) => issues.pageErrors.push(error.message));

	return issues;
}

async function loginAsAdmin(page, redirectPath = '/wp-admin/') {
	const redirectTo = `${baseUrl}${redirectPath}`;
	await page.goto(`${baseUrl}/wp-login.php?redirect_to=${encodeURIComponent(redirectTo)}`, { waitUntil: 'domcontentloaded' });
	await page.locator('#user_login').fill('admin');
	await page.locator('#user_pass').fill('admin');
	await page.locator('#wp-submit').click();
	await page.waitForURL((url) => url.href.startsWith(redirectTo), { timeout: 30000 });
}

async function writeEvidenceJson(filename, value) {
	await writeFile(path.join(evidenceDir, filename), `${JSON.stringify(value, null, 2)}\n`);
}

async function getEditorCanvasLocator(page, selector) {
	const iframeCount = await page.locator('iframe[name="editor-canvas"]').count();
	if (iframeCount > 0) {
		return page.frameLocator('iframe[name="editor-canvas"]').locator(selector);
	}
	return page.locator(selector);
}

async function waitForEditorReady(page) {
	await page.waitForFunction(() => window.wp?.data?.select('core/block-editor'), null, { timeout: 60000 });
	await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {});
	await page.evaluate(() => {
		window.wp?.data?.dispatch('core/preferences')?.set?.('core/edit-post', 'welcomeGuide', false);
		window.wp?.data?.dispatch('core/preferences')?.set?.('core/edit-site', 'welcomeGuide', false);
		window.wp?.data?.dispatch('core/edit-post')?.closeModal?.();
		window.wp?.data?.dispatch('core/edit-post')?.openGeneralSidebar?.('edit-post/block');
		window.wp?.data?.dispatch('core/interface')?.enableComplementaryArea?.('core', 'edit-post/block');
	}).catch(() => {});
	await page.keyboard.press('Escape').catch(() => {});
}

async function insertDesignInserterBlock(page) {
	const inserterToggle = page.locator([
		'.edit-post-header-toolbar__inserter-toggle',
		'.editor-document-tools__inserter-toggle',
		'button[aria-label*="Toggle block inserter"]',
		'button[aria-label*="ブロック挿入"]',
	].join(', ')).first();
	await inserterToggle.click();

	const inserterSearch = page.locator([
		'.block-editor-inserter__search input',
		'.block-editor-inserter__search .components-search-control__input',
		'.components-search-control__input',
	].join(', ')).first();
	await inserterSearch.fill('Design Inserter');
	await page.screenshot({ path: path.join(evidenceDir, 'gutenberg-inserter-search.png'), fullPage: false });

	const blockButton = page.locator('button.block-editor-block-types-list__item').filter({ hasText: 'Design Inserter' }).first();
	await blockButton.click();

	await page.waitForFunction(() => {
		const selector = window.wp?.data?.select('core/block-editor');
		return selector?.getBlocks?.().some((block) => block.name === 'designinserter/css-part');
	}, null, { timeout: 30000 });
}

async function selectDesignInserterBlock(page) {
	await page.evaluate(() => {
		const selector = window.wp?.data?.select('core/block-editor');
		const dispatcher = window.wp?.data?.dispatch('core/block-editor');
		const block = selector?.getBlocks?.().find((item) => item.name === 'designinserter/css-part');
		if (block) {
			dispatcher?.selectBlock?.(block.clientId);
		}
		window.wp?.data?.dispatch('core/edit-post')?.openGeneralSidebar?.('edit-post/block');
		window.wp?.data?.dispatch('core/interface')?.enableComplementaryArea?.('core', 'edit-post/block');
	});

	const block = await getEditorCanvasLocator(page, '.wp-block[data-type="designinserter/css-part"]');
	await block.first().click({ timeout: 30000 }).catch(() => {});
}

async function selectPartFromInspector(page, { categoryLabel, search, cardText }) {
	const picker = page.locator('.di-picker').first();
	await expect(picker).toBeVisible();
	await expect(picker.locator('.di-picker__guide-title')).toHaveText('右側でページに入れる素材を選びます');
	await expect(picker.locator('.di-picker__guide-text')).toContainText('素材の変更はこの欄で行います');
	await picker.locator('button').filter({ hasText: new RegExp(`^${categoryLabel}\\s*\\(`) }).first().click();
	const searchInput = picker.locator('.di-picker__search input, input.di-picker__search, .components-text-control__input').first();
	await searchInput.fill(search);
	await expect(picker.locator('.di-card').filter({ hasText: cardText }).first()).toBeVisible();
	await picker.locator('.di-card').filter({ hasText: cardText }).first().click();
	await expect(picker.locator('.di-picker__current')).toContainText(cardText);
	await page.screenshot({ path: path.join(evidenceDir, 'sbi36-picker-guide-selected.png'), fullPage: false });
}

async function getDesignInserterEditorState(page) {
	return page.evaluate(() => {
		const selector = window.wp?.data?.select('core/block-editor');
		const blocks = selector?.getBlocks?.() || [];
		const target = blocks.find((block) => block.name === 'designinserter/css-part');
		return {
			blockCount: blocks.length,
			designInserterBlockCount: blocks.filter((block) => block.name === 'designinserter/css-part').length,
			selectedBlockName: selector?.getSelectedBlock?.()?.name || '',
			partId: target?.attributes?.partId || '',
		};
	});
}

async function waitForWordPressInstall() {
	const deadline = Date.now() + 180000;
	let lastError = '';

	while (Date.now() < deadline) {
		try {
			await dockerCompose(['exec', '-T', 'wordpress', 'sh', '-lc', 'test -f /var/www/html/wp-load.php && wp core is-installed --path=/var/www/html --allow-root'], { timeout: 15000 });
			return;
		} catch (error) {
			lastError = error.message;
			await new Promise((resolve) => setTimeout(resolve, 3000));
		}
	}

	throw new Error(`WordPress fresh install did not become ready. Last error: ${lastError}`);
}

async function writeFreshCompose() {
	await mkdir(tmpRoot, { recursive: true });
	await mkdir(evidenceDir, { recursive: true });

	await writeFile(composePath, `services:
  wordpress:
    build:
      context: ${yamlDoubleQuoted(path.join(repoRoot, '.docker', 'wordpress'))}
    ports:
      - "${port}:80"
    environment:
      WORDPRESS_DB_NAME: designinserter_e2e
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: wordpress
      WORDPRESS_DB_HOST: designinserter-db
      WP_HOME: ${yamlDoubleQuoted(baseUrl)}
      WP_TITLE: Design Inserter Fresh E2E
      WP_LOCALE: ja
      WP_AUTO_INSTALL: "true"
      WP_ADMIN_USER: admin
      WP_ADMIN_PASS: admin
      WP_ADMIN_EMAIL: admin@example.com
    volumes:
      - wp_core:/var/www/html
      - ${yamlDoubleQuoted(`${path.join(repoRoot, '.tmp', 'dist')}:/dist:ro`)}
      - ${yamlDoubleQuoted(`${tmpRoot}:/e2e`)}
      - ${yamlDoubleQuoted(`${path.join(repoRoot, '.docker', 'conf', 'php.ini')}:/usr/local/etc/php/conf.d/custom.ini:ro`)}
      - ${yamlDoubleQuoted(`${path.join(repoRoot, '.docker', 'conf', 'mysql-client.cnf')}:/etc/mysql/mariadb.conf.d/99-docker.cnf:ro`)}
    networks:
      - default
      - designinserter_dev
volumes:
  wp_core:
networks:
  designinserter_dev:
    external: true
    name: wordpress-plugin-designinserter_designinserter-net
`);
}

async function createAllDesignsBlockContent() {
	const catalog = JSON.parse(await readFile(path.join(repoRoot, 'wp-content/plugins/designinserter/data/css-stock-parts.json'), 'utf8'));
	const blocks = [
		'<!-- wp:heading {"level":1} --><h1 class="wp-block-heading">Design Inserter E2E all parts</h1><!-- /wp:heading -->',
		...catalog.parts.map((part) => [
			`<!-- wp:group {"className":"di-e2e-item di-e2e-${part.id}"} --><div class="wp-block-group di-e2e-item di-e2e-${part.id}">`,
			`<!-- wp:designinserter/css-part {"partId":"${part.id}"} /-->`,
			'</div><!-- /wp:group -->',
		].join('\n')),
	].join('\n');
	const contentPath = path.join(tmpRoot, 'all-designs-blocks.html');
	await writeFile(contentPath, blocks);
	return contentPath;
}

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
	await writeFreshCompose();
	await run('npm', ['run', 'build:zip']);
	await dockerCompose(['down', '-v', '--remove-orphans']).catch(() => '');
	await prepareExternalDatabase();
	await dockerCompose(['up', '-d', '--build', '--wait'], { timeout: 180000 });
	await waitForWordPressInstall();
	await dockerCompose(['exec', '-T', 'wordpress', 'touch', '/var/www/html/favicon.ico'], { timeout: 60000 });
	await dockerCompose(['exec', '-T', 'wordpress', 'wp', 'option', 'update', 'permalink_structure', '', '--allow-root'], { timeout: 60000 });
	await dockerCompose(['exec', '-T', 'wordpress', 'wp', 'rewrite', 'flush', '--allow-root'], { timeout: 60000 });

	const zipPath = `/dist/designinserter-${packageJson.version}.zip`;
	await dockerCompose(['exec', '-T', 'wordpress', 'wp', 'plugin', 'install', zipPath, '--activate', '--allow-root'], { timeout: 60000 });
	const contentPath = await createAllDesignsBlockContent();
	allDesignsPageId = await dockerCompose(['exec', '-T', 'wordpress', 'wp', 'post', 'create', '/e2e/all-designs-blocks.html', '--post_type=page', '--post_status=publish', '--post_title=All Designs E2E', '--porcelain', '--allow-root'], { timeout: 60000 });
	shortcodePageId = await dockerCompose(['exec', '-T', 'wordpress', 'wp', 'post', 'create', '--post_type=page', '--post_status=publish', '--post_title=Shortcode E2E', '--post_content=[designinserter_part id="heading-1"]', '--porcelain', '--allow-root'], { timeout: 60000 });
	editorPageId = await dockerCompose(['exec', '-T', 'wordpress', 'wp', 'post', 'create', '--post_type=page', '--post_status=draft', '--post_title=Editor CTA E2E', '--post_content=', '--porcelain', '--allow-root'], { timeout: 60000 });
	const restPreview = await dockerCompose(['exec', '-T', 'wordpress', 'wp', 'eval', 'wp_set_current_user(1); $request = new WP_REST_Request("GET", "/designinserter/v1/parts/heading-1"); $request->set_param("id", "heading-1"); $response = designinserter_rest_get_part($request); echo wp_json_encode($response->get_data());', '--allow-root'], { timeout: 60000 });

	await writeFile(path.join(evidenceDir, 'fresh-url.txt'), `${baseUrl}/?page_id=${allDesignsPageId}\n`);
	await writeFile(path.join(evidenceDir, 'shortcode-url.txt'), `${baseUrl}/?page_id=${shortcodePageId}\n`);
	await writeFile(path.join(evidenceDir, 'editor-url.txt'), `${baseUrl}/wp-admin/post.php?post=${editorPageId}&action=edit\n`);
	await writeFile(path.join(evidenceDir, 'rest-preview-heading-1.json'), `${restPreview}\n`);
	await writeFile(path.join(evidenceDir, 'source-content-path.txt'), `${contentPath}\n`);
});

test.afterAll(async () => {
	if (process.env.DI_E2E_KEEP_DOCKER !== '1') {
		await dockerCompose(['down', '-v', '--remove-orphans']).catch(() => '');
		await cleanupExternalDatabase();
	}
});

test('fresh WordPress install activates zip and renders all 222 parts', async ({ page, request }) => {
	const failedRequests = [];
	const consoleMessages = [];
	page.on('requestfailed', (requestInfo) => failedRequests.push(requestInfo.url()));
	page.on('console', (message) => {
		if (['error', 'warning'].includes(message.type())) {
			consoleMessages.push(`${message.type()}: ${message.text()}`);
		}
	});

	const response = await page.goto(`${baseUrl}/?page_id=${allDesignsPageId}`, { waitUntil: 'domcontentloaded' });
	expect(response?.ok()).toBeTruthy();
	await page.waitForSelector('.designinserter-part', { timeout: 30000 });

	const report = await page.evaluate(() => {
		const parts = Array.from(document.querySelectorAll('.designinserter-part'));
		const data = parts.map((part) => {
			const rect = part.getBoundingClientRect();
			return {
				id: part.getAttribute('data-designinserter-id'),
				behavior: part.getAttribute('data-designinserter-behavior') || '',
				initialized: part.getAttribute('data-designinserter-initialized'),
				width: Math.round(rect.width),
				height: Math.round(rect.height),
			};
		});
		return {
			partCount: parts.length,
			uniquePartCount: new Set(data.map((item) => item.id)).size,
			styleCount: document.querySelectorAll('style[data-designinserter-style]').length,
			behaviorCount: data.filter((item) => item.behavior).length,
			initializedBehaviorCount: data.filter((item) => item.behavior && item.initialized === 'true').length,
			zeroBox: data.filter((item) => item.width <= 0 || item.height <= 0),
			frontendCss: Array.from(document.querySelectorAll('link[href*="designinserter/assets/frontend.css"]')).map((link) => link.href),
			frontendJs: Array.from(document.querySelectorAll('script[src*="designinserter/assets/frontend.js"]')).map((script) => script.src),
		};
	});

	const restResponse = await request.get(`${baseUrl}/?rest_route=/designinserter/v1/parts/heading-1`);
	expect(restResponse.status()).toBe(401);

	await page.screenshot({ path: path.join(evidenceDir, 'fresh-all-designs.png'), fullPage: false });
	await writeFile(path.join(evidenceDir, 'fresh-report.json'), JSON.stringify({
		url: `${baseUrl}/?page_id=${allDesignsPageId}`,
		report,
		failedRequests,
		consoleMessages,
		restPreviewUnauthenticatedStatus: restResponse.status(),
	}, null, 2));

	expect(report.partCount).toBe(222);
	expect(report.uniquePartCount).toBe(222);
	expect(report.styleCount).toBe(209);
	expect(report.behaviorCount).toBe(16);
	expect(report.initializedBehaviorCount).toBe(16);
	expect(report.zeroBox).toHaveLength(0);
	expect(report.frontendCss).toHaveLength(1);
	expect(report.frontendJs).toHaveLength(1);
	expect(failedRequests).toHaveLength(0);
	expect(consoleMessages).toHaveLength(0);
});

test('fresh install renders shortcode through the shared renderer', async ({ page }) => {
	const response = await page.goto(`${baseUrl}/?page_id=${shortcodePageId}`, { waitUntil: 'domcontentloaded' });
	expect(response?.ok()).toBeTruthy();
	const part = page.locator('.designinserter-part[data-designinserter-id="heading-1"]');
	await expect(part).toHaveCount(1);
	await expect(part).toBeVisible();
	await page.screenshot({ path: path.join(evidenceDir, 'fresh-shortcode.png'), fullPage: false });
});

test('admin settings screen enumerates CTA links and buttons', async ({ page }) => {
	await loginAsAdmin(page, '/wp-admin/options-general.php?page=designinserter');
	const issues = collectBrowserIssues(page);

	expect(page.url()).toContain('/wp-admin/options-general.php?page=designinserter');
	await expect(page.locator('.wrap h1')).toHaveText('Design Inserter');

	const enumeration = await page.locator('.wrap').evaluate((root) => {
		const visibleText = (element) => (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim();
		const rectOf = (element) => {
			const rect = element.getBoundingClientRect();
			return {
				x: Math.round(rect.x),
				y: Math.round(rect.y),
				width: Math.round(rect.width),
				height: Math.round(rect.height),
			};
		};
		const links = Array.from(root.querySelectorAll('a')).map((element) => ({
			text: visibleText(element),
			href: element.href,
			target: element.target || '',
			rel: element.rel || '',
			rect: rectOf(element),
		}));
		const buttons = Array.from(root.querySelectorAll('button, input[type="button"], input[type="submit"], input[type="reset"], a.button')).map((element) => ({
			tag: element.tagName.toLowerCase(),
			type: element.getAttribute('type') || '',
			text: visibleText(element) || element.getAttribute('value') || element.getAttribute('aria-label') || '',
			disabled: Boolean(element.disabled),
			rect: rectOf(element),
		}));
		const rows = Array.from(root.querySelectorAll('table tr')).map((row) => Array.from(row.children).map((cell) => visibleText(cell)));

		return {
			title: visibleText(root.querySelector('h1')),
			links,
			buttons,
			rows,
		};
	});

	await page.screenshot({ path: path.join(evidenceDir, 'admin-settings-cta.png'), fullPage: false });
	await writeEvidenceJson('admin-settings-enumeration.json', {
		url: page.url(),
		enumeration,
		issues,
	});

	expect(enumeration.rows).toContainEqual(['Parts', '222']);
	expect(enumeration.rows).toContainEqual(['Shortcode', '[designinserter_part id="heading-1"]']);
	expect(enumeration.links.some((link) => link.href.includes('pote-chil.com/css-stock'))).toBeTruthy();
	expect(issues.failedRequests).toHaveLength(0);
	expect(issues.consoleErrors).toHaveLength(0);
	expect(issues.pageErrors).toHaveLength(0);
});

test('Gutenberg editor inserts, selects, searches, categorizes, clicks cards, and survives continuous use', async ({ page }) => {
	const continuousUseMs = Number(process.env.DI_E2E_CONTINUOUS_MS || 60000);
	const editorUrl = `${baseUrl}/wp-admin/post.php?post=${editorPageId}&action=edit`;

	await loginAsAdmin(page, `/wp-admin/post.php?post=${editorPageId}&action=edit`);
	const issues = collectBrowserIssues(page);
	expect(page.url()).toContain(`/wp-admin/post.php?post=${editorPageId}&action=edit`);
	await waitForEditorReady(page);

	await insertDesignInserterBlock(page);
	await selectDesignInserterBlock(page);
	await selectPartFromInspector(page, {
		categoryLabel: 'ボタン',
		search: 'button-54',
		cardText: '細い矢印',
	});
	await page.waitForFunction(() => {
		const block = window.wp?.data?.select('core/block-editor')?.getBlocks?.().find((item) => item.name === 'designinserter/css-part');
		return block?.attributes?.partId === 'button-54';
	}, null, { timeout: 30000 });

	const selectedState = await getDesignInserterEditorState(page);
	const preview = await getEditorCanvasLocator(page, '.di-preview__render .button-54');
	await expect(preview.first()).toBeVisible();
	await page.screenshot({ path: path.join(evidenceDir, 'gutenberg-part-picker-selected.png'), fullPage: false });

	const startedAt = Date.now();
	const continuousSteps = [];
	const picker = page.locator('.di-picker').first();
	const categoryButton = picker.locator('button').filter({ hasText: /^ボタン\s*\(/ }).first();
	const allButton = picker.locator('button').filter({ hasText: /^全て\s*\(/ }).first();
	const searchInput = picker.locator('.di-picker__search input, input.di-picker__search, .components-text-control__input').first();

	while (Date.now() - startedAt < continuousUseMs) {
		await categoryButton.click();
		await searchInput.fill('button-54');
		await expect(picker.locator('.di-card').filter({ hasText: '細い矢印' }).first()).toBeVisible();
		await allButton.click();
		await searchInput.fill('heading-1');
		await expect(picker.locator('.di-card').filter({ hasText: '左線' }).first()).toBeVisible();
		await searchInput.fill('');
		await page.waitForTimeout(1000);
		continuousSteps.push({
			elapsedMs: Date.now() - startedAt,
			state: await getDesignInserterEditorState(page),
		});
	}

	await page.screenshot({ path: path.join(evidenceDir, 'continuous-use-audit.png'), fullPage: false });
	await writeEvidenceJson('gutenberg-cta-report.json', {
		url: editorUrl,
		selectedState,
		continuousUseMs,
	});
	await writeEvidenceJson('continuous-use-audit.json', {
		url: editorUrl,
		durationMs: Date.now() - startedAt,
		steps: continuousSteps,
		issues,
	});

	expect(selectedState.designInserterBlockCount).toBe(1);
	expect(selectedState.selectedBlockName).toBe('designinserter/css-part');
	expect(selectedState.partId).toBe('button-54');
	expect(Date.now() - startedAt).toBeGreaterThanOrEqual(60000);
	expect(issues.failedRequests).toHaveLength(0);
	expect(issues.consoleErrors).toHaveLength(0);
	expect(issues.pageErrors).toHaveLength(0);
});
