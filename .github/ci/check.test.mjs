import assert from "node:assert/strict";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";
const root = fileURLToPath(new URL("../../", import.meta.url));
function trace(profile, fail = "") {
  const dir = mkdtempSync(join(tmpdir(), "design-ci-contract-"));
  try {
    for (const file of [
      "wp-content/plugins/designinserter/demo.php",
      "wp-content/themes/designinserter-dev/theme.php",
      "tests/example.php",
      "script/example.mjs",
      "wp-content/plugins/designinserter/asset/example.js",
      "dist/designinserter-0.1.zip",
      "dist/dev/keep.zip",
    ]) {
      const path = join(dir, file);
      mkdirSync(join(path, ".."), { recursive: true });
      writeFileSync(path, "fixture");
    }
    for (const name of [
      "pnpm",
      "php",
      "node",
      "docker",
      "vendor/bin/phpunit",
      "vendor/bin/phpcs",
    ]) {
      const path = join(dir, name);
      mkdirSync(join(path, ".."), { recursive: true });
      writeFileSync(
        path,
        `#!${process.execPath}\nconst fs=require('node:fs');const cmd=[${JSON.stringify(name)},...process.argv.slice(2)];fs.appendFileSync(process.env.TRACE,JSON.stringify(cmd)+'\\n');if(cmd.slice(0,3).join(' ')===process.env.FAIL)process.exit(37);\n`,
      );
      chmodSync(path, 0o700);
    }
    const result = spawnSync(
      process.execPath,
      [join(root, ".github/ci/run.mjs"), profile],
      {
        cwd: dir,
        env: {
          ...process.env,
          PATH: `${dir}:${process.env.PATH}`,
          TRACE: join(dir, "trace"),
          FAIL: fail,
        },
        encoding: "utf8",
      },
    );
    let commands = [];
    try {
      commands = readFileSync(join(dir, "trace"), "utf8")
        .trim()
        .split("\n")
        .filter(Boolean)
        .map(JSON.parse);
    } catch {}
    return {
      ...result,
      commands,
      removedRelease: !existsSync(join(dir, "dist/designinserter-0.1.zip")),
      keptDev: existsSync(join(dir, "dist/dev/keep.zip")),
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
test("native PHP phase preserves PHPUnit PHPCS and all PHP source roots", () => {
  const r = trace("php");
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(r.commands.slice(0, 2), [
    ["vendor/bin/phpunit", "--configuration", "phpunit.xml.dist"],
    ["vendor/bin/phpcs", "--standard=phpcs.xml.dist"],
  ]);
  assert.deepEqual(r.commands.slice(2), [
    ["php", "-l", "wp-content/plugins/designinserter/demo.php"],
    ["php", "-l", "wp-content/themes/designinserter-dev/theme.php"],
    ["php", "-l", "tests/example.php"],
  ]);
});
test("JS phase retains syntax checks, dev build, and catalog/contract/stub tests", () => {
  const r = trace("js");
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(r.commands, [
    ["node", "--check", "script/example.mjs"],
    ["node", "--check", "wp-content/plugins/designinserter/asset/example.js"],
    ["pnpm", "run", "build:dev"],
    ["pnpm", "test"],
  ]);
});
test("local full retains Docker PHP, stale-release cleanup and no trusted release", () => {
  const r = trace("local");
  assert.equal(r.status, 0, r.stderr);
  const docker = r.commands.filter((c) => c[0] === "docker");
  assert.equal(docker.length, 2);
  assert.ok(docker[0].includes("vendor/bin/phpcs"));
  assert.ok(docker[1].includes("vendor/bin/phpunit"));
  assert.ok(r.commands.some((c) => c.join(" ") === "pnpm run build:dev"));
  assert.ok(!r.commands.some((c) => c.join(" ") === "pnpm run build"));
  assert.ok(r.removedRelease);
  assert.ok(r.keptDev);
});
test("first failure is propagated before later JS build and tests", () => {
  const r = trace("js", "node --check script/example.mjs");
  assert.equal(r.status, 37);
  assert.equal(r.commands.length, 1);
  const build = trace("js", "pnpm run build:dev");
  assert.equal(build.status, 37);
  assert.equal(build.commands.at(-1).join(" "), "pnpm run build:dev");
  const php = trace(
    "php",
    "vendor/bin/phpunit --configuration phpunit.xml.dist",
  );
  assert.equal(php.status, 37);
  assert.equal(php.commands.length, 1);
  const docker = trace("local", "docker run --rm");
  assert.equal(docker.status, 37);
  assert.equal(docker.commands.length, 1);
  assert.ok(!docker.removedRelease);
  assert.equal(trace("unknown").status, 2);
});
test("trusted JS and release remain explicit phases after the original unlock gate", () => {
  const js = trace("trusted-js");
  assert.equal(js.status, 0, js.stderr);
  assert.ok(!js.commands.some((c) => c.includes("build:dev")));
  assert.equal(js.commands.at(-1).join(" "), "pnpm test");
  assert.deepEqual(trace("release").commands, [["pnpm", "run", "build"]]);
  const w = readFileSync(
    join(root, ".github/workflows/trusted-test.yml"),
    "utf8",
  );
  assert.ok(
    w.indexOf("git-crypt unlock") <
      w.indexOf("node .github/ci/run.mjs trusted-js"),
  );
  assert.match(w, /environment: git-crypt-ci/);
  assert.match(w, /branches: \[main\]/);
  assert.ok(w.includes("node .github/ci/run.mjs release"));
});
test("cloud and Task aliases point to the shared phases without changing trust boundaries", () => {
  const ci = readFileSync(join(root, ".github/workflows/ci.yml"), "utf8");
  assert.ok(ci.includes("node .github/ci/run.mjs php-lint"));
  assert.ok(!ci.includes("pnpm install"));
  const w = readFileSync(join(root, ".github/workflows/test.yml"), "utf8");
  assert.ok(w.includes("node .github/ci/run.mjs php"));
  assert.ok(w.includes("node .github/ci/run.mjs js"));
  assert.ok(!w.includes("GIT_CRYPT_KEY"));
  for (const name of ["test.yml", "trusted-test.yml"]) {
    const phpJob = readFileSync(
      join(root, ".github/workflows", name),
      "utf8",
    ).split("\n  js:")[0];
    assert.ok(phpJob.includes("Setup Node 22 for shared CI entry"));
  }
  const task = readFileSync(join(root, "Taskfile.yml"), "utf8");
  assert.ok(task.includes("pnpm install --frozen-lockfile"));
  assert.ok(task.includes("node .github/ci/run.mjs local"));
  assert.ok(task.includes("task: ci:fast"));
});
