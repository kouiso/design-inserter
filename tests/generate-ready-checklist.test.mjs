import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import test from 'node:test';
import path from 'node:path';

import { collectPackageFacts } from '../scripts/generate-ready-checklist.mjs';

test('ready checklist selects only the current package version archive', async () => {
	const fixtureRoot = await mkdtemp(path.join(tmpdir(), 'designinserter-ready-checklist-'));
	const distDir = path.join(fixtureRoot, 'dist');
	const packageJson = {
		name: 'wordpress-plugin-designinserter',
		version: '2.3.4',
		private: true,
	};
	const expectedZipName = `designinserter-${packageJson.version}.zip`;
	const staleZipName = 'designinserter-1.0.0.zip';
	const expectedZipBytes = Buffer.from('current release candidate');

	try {
		await mkdir(distDir);
		await writeFile(path.join(distDir, expectedZipName), expectedZipBytes);
		await writeFile(path.join(distDir, staleZipName), 'stale archive');

		const packageFacts = await collectPackageFacts(packageJson, fixtureRoot);
		const expectedSha256 = createHash('sha256').update(expectedZipBytes).digest('hex');

		assert.equal(packageFacts.expectedZip.path, `dist/${expectedZipName}`);
		assert.equal(packageFacts.expectedZip.exists, true);
		assert.equal(packageFacts.expectedZip.sha256, expectedSha256);
		assert.deepEqual(packageFacts.distZips, [staleZipName, expectedZipName]);
		assert.deepEqual(packageFacts.staleDistZips, [staleZipName]);
	} finally {
		await rm(fixtureRoot, { recursive: true, force: true });
	}
});
