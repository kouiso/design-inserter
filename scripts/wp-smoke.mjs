import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);
const mode = args.includes('--docker')
  ? 'docker'
  : args.includes('--portable')
    ? 'portable'
    : args.includes('--stubs')
      ? 'stubs'
      : 'auto';

const repoRoot = process.cwd();
const pluginSlug = 'designinserter';
const pluginDir = path.join(repoRoot, 'wp-content/plugins', pluginSlug);
const portableWpVersion = process.env.WP_SMOKE_WP_VERSION || '6.9.4';
const wpCliVersion = process.env.WP_SMOKE_WP_CLI_VERSION || '2.12.0';
const parsedTimeoutMs = Number.parseInt(process.env.WP_SMOKE_TIMEOUT_MS || '180000', 10);
const commandTimeoutMs = Number.isFinite(parsedTimeoutMs) && parsedTimeoutMs > 0 ? parsedTimeoutMs : 180000;
const wpCliUrl = process.env.WP_SMOKE_WP_CLI_URL || `https://github.com/wp-cli/wp-cli/releases/download/v${wpCliVersion}/wp-cli-${wpCliVersion}.phar`;
const sqliteDropinUrl = 'https://raw.githubusercontent.com/aaemnnosttv/wp-sqlite-db/v1.3.3/src/db.php';
const wpCliPhpArgs = ['-d', 'memory_limit=512M', '-d', 'error_reporting=6143'];

class SmokeEnvironmentError extends Error {}

function runProcess(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: options.cwd || repoRoot,
    encoding: 'utf8',
    stdio: options.capture ? 'pipe' : 'inherit',
    timeout: commandTimeoutMs,
  });

  if (result.error) {
    throw options.environment ? new SmokeEnvironmentError(result.error.message) : result.error;
  }

  return result;
}

function assertSuccess(result, label, options = {}) {
  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
    const message = output || `${label} failed`;
    throw options.environment ? new SmokeEnvironmentError(message) : new Error(message);
  }
}

function requireCommand(command) {
  const result = runProcess('sh', ['-c', `command -v ${command}`], { capture: true, environment: true });
  assertSuccess(result, `${command} is required`, { environment: true });
  return result.stdout.trim();
}

function docker(commandArgs, options = {}) {
  console.log(`$ docker ${commandArgs.join(' ')}`);
  const result = runProcess('docker', commandArgs, options);
  assertSuccess(result, `docker ${commandArgs.join(' ')}`);
  return result.stdout || '';
}

function wpDocker(commandArgs, options = {}) {
  return docker(['compose', 'exec', '-T', 'wordpress', 'wp', ...commandArgs, '--allow-root'], options);
}

function isDockerAvailable() {
  const result = spawnSync('docker', ['info'], {
    encoding: 'utf8',
    stdio: 'pipe',
    timeout: commandTimeoutMs,
  });
  return !result.error && result.status === 0;
}

function waitMs(ms) {
  spawnSync(process.execPath, ['-e', `setTimeout(() => {}, ${Number(ms) || 0})`], { stdio: 'ignore' });
}

function isHostPortAvailable(port) {
  const script = [
    "const net = require('node:net');",
    'const server = net.createServer();',
    'server.once("error", () => process.exit(1));',
    `server.listen(${Number(port)}, "0.0.0.0", () => server.close(() => process.exit(0)));`,
  ].join(' ');
  const result = spawnSync(process.execPath, ['-e', script], {
    encoding: 'utf8',
    stdio: 'pipe',
    timeout: 5000,
  });
  return result.status === 0;
}

function getRunningComposeServices() {
  const result = runProcess('docker', ['compose', 'ps', '--status', 'running', '--services'], { capture: true });
  if (result.status !== 0) {
    return [];
  }

  return result.stdout.trim().split(/\r?\n/).filter(Boolean);
}

function readPortEnv(name, defaultPort) {
  const port = Number(process.env[name] || defaultPort);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid ${name}: ${process.env[name]}`);
  }

  return port;
}

function getDockerWpUrl() {
  return (process.env.WP_HOME || `http://localhost:${readPortEnv('WP_PORT', 8080)}`).replace(/\/+$/, '');
}

function assertDockerPortIsSafe() {
  const portChecks = [
    { envName: 'WP_PORT', defaultPort: 8080, service: 'wordpress' },
    { envName: 'MYSQL_PORT', defaultPort: 3316, service: 'db' },
  ];
  const runningServices = getRunningComposeServices();

  for (const { envName, defaultPort, service } of portChecks) {
    const port = readPortEnv(envName, defaultPort);
    if (!runningServices.includes(service) && !isHostPortAvailable(port)) {
      throw new Error(`Host port ${port} for ${service} is already in use. Set ${envName} to a free port before running Docker smoke.`);
    }
  }
}

function assertComposeRuntimeStable() {
  const required = ['db', 'wordpress'];
  const running = getRunningComposeServices();
  const missing = required.filter((service) => !running.includes(service));
  if (missing.length) {
    throw new Error(`Docker smoke runtime is not running: ${missing.join(', ')}`);
  }

  waitMs(3000);

  const stillRunning = getRunningComposeServices();
  const stopped = required.filter((service) => !stillRunning.includes(service));
  if (stopped.length) {
    throw new Error(`Docker smoke runtime stopped shortly after startup: ${stopped.join(', ')}`);
  }
}

function runStubSmoke() {
  console.log('$ php tests/render-smoke.php');
  const result = runProcess('php', ['tests/render-smoke.php']);
  assertSuccess(result, 'PHP WordPress stub smoke');
  console.log('Docker-free WordPress stub smoke passed.');
}

function download(url, destination) {
  console.log(`$ curl -L --fail --silent --show-error -o ${destination} ${url}`);
  const result = runProcess('curl', ['-L', '--fail', '--silent', '--show-error', '-o', destination, url], { environment: true });
  assertSuccess(result, `download ${url}`, { environment: true });
}

function runWpCli(wpCliPath, commandArgs, options = {}) {
  const label = ['php', ...wpCliPhpArgs, wpCliPath, ...commandArgs].join(' ');
  console.log(`$ ${label}`);
  const result = runProcess('php', [...wpCliPhpArgs, wpCliPath, ...commandArgs], options);
  assertSuccess(result, `wp-cli ${commandArgs.join(' ')}`, options);
  return result.stdout || '';
}

function assertPhpExtensions() {
  const result = runProcess(
    'php',
    [
      '-r',
      [
        "foreach (array('sqlite3', 'pdo_sqlite', 'mysqli') as $extension) {",
        "if (!extension_loaded($extension)) {",
        "fwrite(STDERR, \"missing extension: $extension\\n\");",
        'exit(1);',
        '}',
        '}',
      ].join(' '),
    ],
    { capture: true, environment: true }
  );
  assertSuccess(result, 'PHP sqlite3, pdo_sqlite, and mysqli extensions are required', { environment: true });
}

function assertSafePortableRoot(portableRoot) {
  const resolved = path.resolve(portableRoot);
  const tmpRoot = path.resolve(os.tmpdir());
  const repo = path.resolve(repoRoot);

  if (resolved === '/' || resolved === tmpRoot || resolved === repo || !path.basename(resolved).includes('designinserter')) {
    throw new SmokeEnvironmentError(`Unsafe WP_SMOKE_PORTABLE_DIR: ${resolved}`);
  }
}

function linkPluginIntoPortableWp(wpDir) {
  const target = path.join(wpDir, 'wp-content/plugins', pluginSlug);
  fs.rmSync(target, { recursive: true, force: true });

  try {
    fs.symlinkSync(pluginDir, target, 'dir');
  } catch (error) {
    fs.cpSync(pluginDir, target, { recursive: true });
  }
}

function unpackDistributionZipIntoPortableWp(zipPath, wpDir) {
  const target = path.join(wpDir, 'wp-content/plugins', pluginSlug);
  fs.rmSync(target, { recursive: true, force: true });

  console.log(`$ unzip -q ${zipPath} -d ${path.join(wpDir, 'wp-content/plugins')}`);
  const result = runProcess('unzip', ['-q', zipPath, '-d', path.join(wpDir, 'wp-content/plugins')]);
  assertSuccess(result, `unzip ${zipPath}`);

  const mainFile = path.join(target, 'designinserter.php');
  if (!fs.existsSync(mainFile)) {
    throw new Error(`Distribution zip did not unpack designinserter.php at ${mainFile}`);
  }
}

function listPluginSourceFiles(dir = pluginDir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.DS_Store') {
      continue;
    }

    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listPluginSourceFiles(abs));
    } else {
      files.push(abs);
    }
  }
  return files;
}

const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i += 1) {
  let c = i;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[i] = c >>> 0;
}

function crc32Hex(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, '0');
}

function readZipCrcs(zipPath) {
  const result = runProcess('unzip', ['-v', zipPath], { capture: true });
  assertSuccess(result, `unzip -v ${zipPath}`);

  const crcs = new Map();
  for (const line of result.stdout.split(/\r?\n/)) {
    const match = line.match(/^\s*\d+\s+\S+\s+\d+\s+\S+\s+\S+\s+\S+\s+([0-9a-fA-F]{8})\s+(.+)$/);
    if (match && match[2].startsWith(`${pluginSlug}/`)) {
      crcs.set(match[2], match[1].toLowerCase());
    }
  }
  return crcs;
}

function assertDistributionZipFresh(zipPath) {
  const sourceFiles = listPluginSourceFiles().sort();
  const expectedEntries = new Map(sourceFiles.map((file) => [
    `${pluginSlug}/${path.relative(pluginDir, file).split(path.sep).join('/')}`,
    file,
  ]));
  const zipCrcs = readZipCrcs(zipPath);
  const staleMessage = 'Distribution zip is stale; run npm run build before portable zip smoke.';
  const missingEntries = [...expectedEntries.keys()].filter((entry) => !zipCrcs.has(entry));
  const unexpectedEntries = [...zipCrcs.keys()].filter((entry) => !expectedEntries.has(entry));
  const changedEntries = [];

  for (const [entry, file] of expectedEntries) {
    if (zipCrcs.has(entry)) {
      const currentCrc = crc32Hex(fs.readFileSync(file));
      if (zipCrcs.get(entry) !== currentCrc) {
        changedEntries.push(entry);
      }
    }
  }

  if (missingEntries.length || unexpectedEntries.length || changedEntries.length) {
    throw new Error([
      staleMessage,
      missingEntries.length ? `missing entries: ${missingEntries.slice(0, 10).join(', ')}` : '',
      unexpectedEntries.length ? `unexpected entries: ${unexpectedEntries.slice(0, 10).join(', ')}` : '',
      changedEntries.length ? `zip content differs from plugin source: ${changedEntries.slice(0, 10).join(', ')}` : '',
    ].filter(Boolean).join('\n'));
  }
}

function getDistributionZipPath() {
  const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
  const distDir = path.join(repoRoot, 'dist');
  const expectedName = `${pluginSlug}-${packageJson.version}.zip`;
  const zipPath = path.join(distDir, expectedName);
  if (fs.existsSync(zipPath)) {
    return zipPath;
  }

  if (fs.existsSync(distDir)) {
    const staleZips = fs.readdirSync(distDir).filter((entry) => (
      entry.startsWith(`${pluginSlug}-`) &&
      entry.endsWith('.zip') &&
      entry !== expectedName
    ));

    if (staleZips.length) {
      throw new Error(`Distribution zip version mismatch; expected ${expectedName} but found ${staleZips.join(', ')}. Run npm run build before portable zip smoke.`);
    }
  }

  return null;
}

function assertContains(value, needle, message) {
  if (!value.includes(needle)) {
    throw new Error(message);
  }
}

function assertNotContains(value, needle, message) {
  if (value.includes(needle)) {
    throw new Error(message);
  }
}

function runPortableSmoke() {
  requireCommand('php');
  requireCommand('curl');
  assertPhpExtensions();

  const explicitPortableRoot = Boolean(process.env.WP_SMOKE_PORTABLE_DIR);
  const portableRoot = process.env.WP_SMOKE_PORTABLE_DIR || fs.mkdtempSync(path.join(os.tmpdir(), 'designinserter-real-wp-smoke-'));
  const cleanupPortableRoot = !explicitPortableRoot && process.env.WP_SMOKE_KEEP_PORTABLE !== '1';
  const binDir = path.join(portableRoot, 'bin');
  const wpDir = path.join(portableRoot, 'wp');
  const sqliteDir = path.join(portableRoot, 'sqlite');
  const wpCliPath = path.join(binDir, 'wp-cli.phar');

  try {
    if (explicitPortableRoot) {
      assertSafePortableRoot(portableRoot);
      fs.rmSync(portableRoot, { recursive: true, force: true });
    }
    fs.mkdirSync(binDir, { recursive: true });
    fs.mkdirSync(wpDir, { recursive: true });
    fs.mkdirSync(sqliteDir, { recursive: true });

    download(wpCliUrl, wpCliPath);
    runWpCli(wpCliPath, ['core', 'download', `--path=${wpDir}`, `--version=${portableWpVersion}`, '--quiet'], { environment: true });
    download(sqliteDropinUrl, path.join(wpDir, 'wp-content/db.php'));
    runWpCli(wpCliPath, [
      'config',
      'create',
      `--path=${wpDir}`,
      '--dbname=wordpress',
      '--dbuser=root',
      '--dbpass=',
      '--dbhost=localhost',
      '--skip-check',
      '--quiet',
    ], { environment: true });
    runWpCli(wpCliPath, ['config', 'set', 'DB_DIR', `${sqliteDir}${path.sep}`, '--type=constant', '--quiet', `--path=${wpDir}`], { environment: true });
    runWpCli(wpCliPath, ['config', 'set', 'WP_DEBUG', 'true', '--raw', '--type=constant', '--quiet', `--path=${wpDir}`], { environment: true });
    runWpCli(wpCliPath, [
      'core',
      'install',
      `--path=${wpDir}`,
      '--url=http://example.test',
      '--title=Design Inserter Smoke',
      '--admin_user=admin',
      '--admin_password=admin',
      '--admin_email=dev@example.com',
      '--skip-email',
      '--quiet',
    ], { environment: true });

    const distributionZipPath = getDistributionZipPath();
    if (distributionZipPath) {
      requireCommand('unzip');
      assertDistributionZipFresh(distributionZipPath);
      unpackDistributionZipIntoPortableWp(distributionZipPath, wpDir);
      runWpCli(wpCliPath, ['plugin', 'activate', 'designinserter', `--path=${wpDir}`, '--quiet']);
      runWpCli(wpCliPath, ['plugin', 'is-active', 'designinserter', `--path=${wpDir}`]);

      const zipShortcode = runWpCli(
        wpCliPath,
        ['eval', 'echo do_shortcode(\'[designinserter_part id="heading-1"]\');', `--path=${wpDir}`],
        { capture: true }
      );
      assertContains(zipShortcode, 'data-designinserter-id="heading-1"', 'Portable zip-installed shortcode smoke did not render heading-1.');

      const zipBlock = runWpCli(
        wpCliPath,
        ['eval', 'echo do_blocks(\'<!-- wp:designinserter/css-part {"partId":"loading-4"} /-->\');', `--path=${wpDir}`],
        { capture: true }
      );
      assertContains(zipBlock, 'data-designinserter-id="loading-4"', 'Portable zip-installed dynamic block smoke did not render loading-4.');
      assertNotContains(zipBlock, '<style data-designinserter-style="loading-4"', 'Portable zip-installed SVG-only dynamic block emitted an unexpected style tag.');

      runWpCli(wpCliPath, ['plugin', 'deactivate', 'designinserter', `--path=${wpDir}`, '--quiet']);
      runWpCli(wpCliPath, ['plugin', 'delete', 'designinserter', `--path=${wpDir}`, '--quiet']);
    } else {
      console.warn('Distribution zip not found; skipping portable zip install smoke. Run npm run build first to cover this path.');
    }

    linkPluginIntoPortableWp(wpDir);
    runWpCli(wpCliPath, ['plugin', 'activate', 'designinserter', `--path=${wpDir}`, '--quiet']);
    runWpCli(wpCliPath, ['plugin', 'is-active', 'designinserter', `--path=${wpDir}`]);

    const wpVersion = runWpCli(wpCliPath, ['core', 'version', `--path=${wpDir}`], { capture: true }).trim();
    const shortcode = runWpCli(
      wpCliPath,
      ['eval', 'echo do_shortcode(\'[designinserter_part id="heading-1"]\');', `--path=${wpDir}`],
      { capture: true }
    );
    assertContains(shortcode, 'data-designinserter-id="heading-1"', 'Portable shortcode smoke did not render heading-1.');

    const block = runWpCli(
      wpCliPath,
      ['eval', 'echo do_blocks(\'<!-- wp:designinserter/css-part {"partId":"loading-4"} /-->\');', `--path=${wpDir}`],
      { capture: true }
    );
    assertContains(block, 'data-designinserter-id="loading-4"', 'Portable dynamic block smoke did not render loading-4.');
    assertNotContains(block, '<style data-designinserter-style="loading-4"', 'Portable SVG-only dynamic block emitted an unexpected style tag.');

    const integrationScript = path.join(repoRoot, 'tests/portable-smoke-integration.php');
    const integration = runWpCli(
      wpCliPath,
      ['eval-file', integrationScript, `--path=${wpDir}`],
      { capture: true }
    );
    assertContains(integration, 'integration_ok', 'Portable integration smoke did not finish.');

    const content = runWpCli(
      wpCliPath,
      [
        'eval',
        'echo apply_filters("the_content", "[designinserter_part id=\\"heading-4\\"]\\n<!-- wp:designinserter/css-part {\\"partId\\":\\"heading-5\\"} /-->");',
        `--path=${wpDir}`,
      ],
      { capture: true }
    );
    assertContains(content, 'data-designinserter-id="heading-4"', 'Portable the_content smoke did not render shortcode.');
    assertContains(content, 'data-designinserter-id="heading-5"', 'Portable the_content smoke did not render dynamic block.');

    if (cleanupPortableRoot) {
      console.log(`Portable WordPress smoke passed with WordPress ${wpVersion}; cleaned ${portableRoot}`);
    } else {
      console.log(`Portable WordPress smoke passed with WordPress ${wpVersion} at ${wpDir}`);
    }
  } finally {
    if (cleanupPortableRoot) {
      fs.rmSync(portableRoot, { recursive: true, force: true });
    }
  }
}

function runDockerSmoke() {
  docker(['info'], { capture: true });
  process.env.WP_HOME = getDockerWpUrl();
  docker(['compose', 'config', '--quiet']);
  assertDockerPortIsSafe();
  docker(['compose', 'up', '-d', '--build']);
  assertComposeRuntimeStable();

  const installed = runProcess(
    'docker',
    ['compose', 'exec', '-T', 'wordpress', 'wp', 'core', 'is-installed', '--allow-root'],
    { capture: true }
  );

  if (installed.status !== 0) {
    wpDocker([
      'core',
      'install',
      `--url=${getDockerWpUrl()}`,
      '--title=Design Inserter Dev',
      '--admin_user=admin',
      '--admin_password=admin',
      '--admin_email=dev@example.com',
    ]);
  }

  wpDocker(['theme', 'activate', 'designinserter-dev']);
  wpDocker(['plugin', 'activate', 'designinserter']);

  const render = wpDocker([
    'eval',
    'echo do_shortcode(\'[designinserter_part id="heading-1"]\');',
  ], { capture: true });

  assertContains(render, 'data-designinserter-id="heading-1"', 'Shortcode smoke did not render heading-1.');

  const block = wpDocker([
    'eval',
    'echo do_blocks(\'<!-- wp:designinserter/css-part {"partId":"loading-4"} /-->\');',
  ], { capture: true });

  assertContains(block, 'data-designinserter-id="loading-4"', 'Dynamic block smoke did not render loading-4.');
  assertNotContains(block, '<style data-designinserter-style="loading-4"', 'Dynamic block emitted an unexpected SVG-only style tag.');

  console.log(`WordPress plugin smoke passed at ${getDockerWpUrl()}/wp-admin/ (admin/admin)`);
}

try {
  if (mode === 'stubs') {
    runStubSmoke();
  } else if (mode === 'portable') {
    runPortableSmoke();
  } else if (mode === 'docker') {
    runDockerSmoke();
  } else if (isDockerAvailable()) {
    runDockerSmoke();
  } else {
    console.warn('Docker is not available; trying portable WordPress smoke.');
    try {
      runPortableSmoke();
    } catch (error) {
      if (!(error instanceof SmokeEnvironmentError)) {
        throw error;
      }
      console.warn(`Portable WordPress smoke unavailable: ${error.message}`);
      console.warn('Falling back to Docker-free WordPress stub smoke.');
      runStubSmoke();
    }
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
