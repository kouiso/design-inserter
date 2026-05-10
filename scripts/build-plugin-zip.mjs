import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { mkdir, readFile, rm, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const pluginSlug = 'designinserter';
const pluginDir = path.join(repoRoot, 'wp-content/plugins', pluginSlug);
const packageJsonPath = path.join(repoRoot, 'package.json');
const outputDir = process.env.DI_DIST_DIR || path.join(repoRoot, '.tmp/dist');
const stagingDir = path.join(repoRoot, '.tmp/package');
const requiredFiles = [
	'designinserter.php',
	'NOTICE.md',
	'data/css-stock-parts.json',
	'assets/editor.js',
	'assets/frontend.js',
	'includes/render.php',
];

const ensureFileExists = async (filePath) => {
	const result = await stat(filePath);
	if (!result.isFile()) {
		throw new Error(`${filePath} is not a file.`);
	}
};

const main = async () => {
	const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
	const version = packageJson.version;
	if (!version) {
		throw new Error('package.json version is empty.');
	}

	await ensureFileExists(path.join(pluginDir, 'designinserter.php'));
	await rm(stagingDir, { recursive: true, force: true });
	await mkdir(stagingDir, { recursive: true });
	await mkdir(outputDir, { recursive: true });

	const stagedPluginDir = path.join(stagingDir, pluginSlug);
	await execFileAsync('cp', ['-R', pluginDir, stagedPluginDir]);

	for (const requiredFile of requiredFiles) {
		await ensureFileExists(path.join(stagedPluginDir, requiredFile));
	}

	const zipPath = path.join(outputDir, `${pluginSlug}-${version}.zip`);
	await rm(zipPath, { force: true });
	await execFileAsync('zip', ['-qr', zipPath, pluginSlug], { cwd: stagingDir });

	const zipBytes = await readFile(zipPath);
	const sha256 = createHash('sha256').update(zipBytes).digest('hex');

	console.log(`Built ${zipPath}`);
	console.log(`Size: ${zipBytes.length} bytes`);
	console.log(`SHA256: ${sha256}`);
};

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
