import { execFile } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { test, expect } from '@playwright/test';

const execFileAsync = promisify(execFile);
const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
const packageJson = JSON.parse(await readFile(path.join(repoRoot, 'package.json'), 'utf8'));
const tmpRoot = path.join(repoRoot, '.tmp', 'e2e-tp-wp');
const evidenceDir = path.join(tmpRoot, 'evidence');
const composePath = path.join(tmpRoot, 'docker-compose.yml');
const projectName = 'designinserter-tp-e2e';
const port = process.env.DI_TP_E2E_PORT || '18083';
const baseUrl = `http://127.0.0.1:${port}`;
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
		'DROP DATABASE IF EXISTS designinserter_tp_e2e; CREATE DATABASE designinserter_tp_e2e CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; GRANT ALL PRIVILEGES ON designinserter_tp_e2e.* TO "wordpress"@"%"; FLUSH PRIVILEGES;',
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
		'DROP DATABASE IF EXISTS designinserter_tp_e2e;',
	], { timeout: 60000 }).catch(() => {});
}

async function loginAsAdmin(page, redirectPath = '/wp-admin/') {
	const redirectTo = `${baseUrl}${redirectPath}`;
	// 認証済み・未認証の両方を同じヘルパーで扱うため、目的ページを直接開く。
	await page.goto(redirectTo, { waitUntil: 'domcontentloaded' });

	const loginInput = page.locator('#user_login').first();
	if (await loginInput.isVisible().catch(() => false)) {
		await loginInput.fill('admin');
		await page.locator('#user_pass').fill('admin');
		await page.locator('#wp-submit').click();
	}

	await page.waitForURL((url) => url.href.startsWith(redirectTo), { waitUntil: 'domcontentloaded', timeout: 30000 });
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

async function waitForWordPressInstall() {
	const deadline = Date.now() + 180000;
	let lastError = '';

	while (Date.now() < deadline) {
		try {
			await dockerCompose(['exec', '-T', 'wordpress', 'sh', '-c', 'test -f /var/www/html/wp-load.php && wp core is-installed --path=/var/www/html --allow-root'], { timeout: 15000 });
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
      WORDPRESS_DB_NAME: designinserter_tp_e2e
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: wordpress
      WORDPRESS_DB_HOST: designinserter-db
      WP_HOME: ${yamlDoubleQuoted(baseUrl)}
      WP_TITLE: Design Inserter TP E2E
      WP_LOCALE: ja
      WP_AUTO_INSTALL: "true"
      WP_ADMIN_USER: admin
      WP_ADMIN_PASS: admin
      WP_ADMIN_EMAIL: admin@example.com
    volumes:
      - wp_core_tp:/var/www/html
      - ${yamlDoubleQuoted(`${path.join(repoRoot, 'dist')}:/dist:ro`)}
      - ${yamlDoubleQuoted(`${tmpRoot}:/e2e`)}
      - ${yamlDoubleQuoted(`${path.join(repoRoot, '.docker', 'conf', 'php.ini')}:/usr/local/etc/php/conf.d/custom.ini:ro`)}
      - ${yamlDoubleQuoted(`${path.join(repoRoot, '.docker', 'conf', 'mysql-client.cnf')}:/etc/mysql/mariadb.conf.d/99-docker.cnf:ro`)}
    networks:
      - default
      - designinserter_dev
volumes:
  wp_core_tp:
networks:
  designinserter_dev:
    external: true
    name: wordpress-plugin-designinserter_designinserter-net
`);
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
}

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
	await writeFreshCompose();
	// Template Party のテストなので復号済みが前提。ロック環境ではここで明示的に落ちる（DI-BLD-022）。
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

	editorPageId = await dockerCompose(['exec', '-T', 'wordpress', 'wp', 'post', 'create', '--post_type=page', '--post_status=draft', '--post_title=TP E2E Editor', '--post_content=', '--porcelain', '--allow-root'], { timeout: 60000 });

	await writeFile(path.join(evidenceDir, 'editor-url.txt'), `${baseUrl}/wp-admin/post.php?post=${editorPageId}&action=edit\n`);
});

test.afterAll(async () => {
	if (process.env.DI_E2E_KEEP_DOCKER !== '1') {
		await dockerCompose(['down', '-v', '--remove-orphans']).catch(() => '');
		await cleanupExternalDatabase();
	}
});

test('source filter buttons render in block inspector', async ({ page }) => {
	await loginAsAdmin(page, `/wp-admin/post.php?post=${editorPageId}&action=edit`);
	await waitForEditorReady(page);
	await insertDesignInserterBlock(page);
	await selectDesignInserterBlock(page);

	const picker = page.locator('.di-picker').first();
	await expect(picker).toBeVisible({ timeout: 15000 });

	const allBtn = picker.locator('button.di-picker__source').filter({ hasText: 'すべて' }).first();
	const cssStockBtn = picker.locator('button.di-picker__source').filter({ hasText: 'デザインパーツ' }).first();
	const tpBtn = picker.locator('button.di-picker__source').filter({ hasText: 'Template Party' }).first();

	await expect(allBtn).toBeVisible();
	await expect(cssStockBtn).toBeVisible();
	await expect(tpBtn).toBeVisible();

	await page.screenshot({ path: path.join(evidenceDir, 'source-filter-buttons.png'), fullPage: false });
});

test('Template Party filter shows template cards with badge', async ({ page }) => {
	await loginAsAdmin(page, `/wp-admin/post.php?post=${editorPageId}&action=edit`);
	await waitForEditorReady(page);
	await insertDesignInserterBlock(page);
	await selectDesignInserterBlock(page);

	const picker = page.locator('.di-picker').first();
	await expect(picker).toBeVisible({ timeout: 15000 });

	const tpBtn = picker.locator('button.di-picker__source').filter({ hasText: 'Template Party' }).first();
	await tpBtn.click();

	// Template cards should appear (each has the テンプレ badge).
	const templateCards = picker.locator('.di-card--template');
	await expect(templateCards.first()).toBeVisible({ timeout: 15000 });

	const badge = templateCards.first().locator('.di-card__badge');
	await expect(badge).toBeVisible();
	await expect(badge).toHaveText('テンプレ');

	await page.screenshot({ path: path.join(evidenceDir, 'template-party-cards.png'), fullPage: false });

	const cardCount = await templateCards.count();
	expect(cardCount).toBeGreaterThan(0);
});

test('デザインパーツ filter hides template cards and shows only parts', async ({ page }) => {
	await loginAsAdmin(page, `/wp-admin/post.php?post=${editorPageId}&action=edit`);
	await waitForEditorReady(page);
	await insertDesignInserterBlock(page);
	await selectDesignInserterBlock(page);

	const picker = page.locator('.di-picker').first();
	await expect(picker).toBeVisible({ timeout: 15000 });

	const cssStockBtn = picker.locator('button.di-picker__source').filter({ hasText: 'デザインパーツ' }).first();
	await cssStockBtn.click();

	// Template cards (テンプレ badge) must not be visible when the デザインパーツ filter is active.
	await expect(picker.locator('.di-card--template').first()).not.toBeVisible({ timeout: 5000 }).catch(() => {});
	const templateCardCount = await picker.locator('.di-card--template').count();
	expect(templateCardCount).toBe(0);

	// Regular part cards must be visible.
	await expect(picker.locator('.di-card:not(.di-card--template)').first()).toBeVisible({ timeout: 10000 });

	await page.screenshot({ path: path.join(evidenceDir, 'css-stock-filter-active.png'), fullPage: false });
});

test('clicking a template card shows iframe preview', async ({ page }) => {
	await loginAsAdmin(page, `/wp-admin/post.php?post=${editorPageId}&action=edit`);
	await waitForEditorReady(page);
	await insertDesignInserterBlock(page);
	await selectDesignInserterBlock(page);

	const picker = page.locator('.di-picker').first();
	await expect(picker).toBeVisible({ timeout: 15000 });

	const tpBtn = picker.locator('button.di-picker__source').filter({ hasText: 'Template Party' }).first();
	await tpBtn.click();

	const firstCard = picker.locator('.di-card--template').first();
	await expect(firstCard).toBeVisible({ timeout: 15000 });
	await firstCard.click();

	// After clicking, the preview iframe should appear.
	const previewIframe = page.locator('.di-preview--template iframe');
	await expect(previewIframe).toBeVisible({ timeout: 15000 });

	const iframeSrc = await previewIframe.getAttribute('src');
	expect(iframeSrc).toMatch(/template-party\.com/);

	// DI-EDT-026: 作成前に必ずデモリンク挙動の disclosure Notice が可視状態で出ること
	// （文字列が editor.js のどこかに存在するだけでは、実際に表示されているかは分からない）。
	const disclosureNotice = page.locator('.di-create-page').getByText('公開ページはテンプレートのデモサイトへのリンクになります');
	await expect(disclosureNotice).toBeVisible({ timeout: 15000 });

	await page.screenshot({ path: path.join(evidenceDir, 'template-iframe-preview.png'), fullPage: false });
});

test('create-page REST endpoint creates a draft page for a template', async ({ page, request }) => {
	// Log in to get a valid nonce cookie.
	await loginAsAdmin(page, '/wp-admin/');

	// Retrieve nonce from WP REST API via the admin.
	// Navigate to the editor page so wp object is available for nonce.
	await page.goto(`${baseUrl}/wp-admin/post.php?post=${editorPageId}&action=edit`, { waitUntil: 'domcontentloaded' });
	await waitForEditorReady(page);

	const createResult = await page.evaluate(async (restBase) => {
		// Find the templatesRestUrl and first template ID from catalog.
		const catalog = window.DesignInserterCatalog || null;
		if (!catalog || !catalog.templatesRestUrl || !catalog.templates || !catalog.templates[0]) {
			return { error: 'catalog not available', catalog: JSON.stringify(catalog).slice(0, 200) };
		}

		const templateId = catalog.templates[0].id;
		const url = catalog.templatesRestUrl + templateId + '/create-page';

		try {
			const r = await fetch(url, {
				method: 'POST',
				credentials: 'include',
				headers: {
					'X-WP-Nonce': catalog.nonce,
					'Content-Type': 'application/json',
				},
			});
			const body = await r.json();
			return { status: r.status, body };
		} catch (err) {
			return { error: err.message };
		}
	}, baseUrl);

	await writeFile(path.join(evidenceDir, 'create-page-result.json'), JSON.stringify(createResult, null, 2));
	await page.screenshot({ path: path.join(evidenceDir, 'after-create-page.png'), fullPage: false });

	expect(createResult.error).toBeUndefined();
	expect(createResult.status).toBe(200);
	expect(createResult.body.page_id).toBeGreaterThan(0);
	expect(createResult.body.edit_url).toContain('/wp-admin/post.php?post=');
});
