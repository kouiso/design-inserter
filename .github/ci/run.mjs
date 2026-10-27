import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, unlinkSync } from "node:fs";

function run(command, args = []) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.error) console.error(result.error.message);
  // SIGKILL 等で落ちた場合は status が null になり generic な exit 1 しか出ないため、シグナル名を先に出す
  if (result.signal) console.error(`${command} terminated by ${result.signal}`);
  if (result.status !== 0) process.exit(result.status ?? 1);
}
function files(directory, suffix, recursive = false) {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const path = `${directory}/${entry.name}`;
      if (entry.isDirectory())
        return recursive ? files(path, suffix, true) : [];
      return path.endsWith(suffix) ? [path] : [];
    })
    .sort();
}
function phpTool(tool, docker = false) {
  const args =
    tool === "phpunit"
      ? ["--configuration", "phpunit.xml.dist"]
      : ["--standard=phpcs.xml.dist"];
  if (docker)
    run("docker", [
      "run",
      "--rm",
      "-v",
      `${process.cwd()}:/app`,
      "-w",
      "/app",
      "composer:2",
      "php",
      `vendor/bin/${tool}`,
      ...args,
    ]);
  else run(`vendor/bin/${tool}`, args);
}
const checks = {
  phpunit: () => phpTool("phpunit"),
  phpcs: () => phpTool("phpcs"),
  "phpunit-docker": () => phpTool("phpunit", true),
  "phpcs-docker": () => phpTool("phpcs", true),
  "php-lint": () => {
    for (const root of [
      "wp-content/plugins/designinserter",
      "wp-content/themes/designinserter-dev",
      "tests",
    ]) {
      for (const path of files(root, ".php", true)) run("php", ["-l", path]);
    }
  },
  "js-syntax": () => {
    for (const root of ["script", "wp-content/plugins/designinserter/asset"]) {
      for (const path of files(root, root === "script" ? ".mjs" : ".js"))
        run("node", ["--check", path]);
    }
  },
  "js-test": () => run("pnpm", ["test"]),
  "build-dev": () => run("pnpm", ["run", "build:dev"]),
  release: () => run("pnpm", ["run", "build"]),
  "clean-stale-release": () => {
    // なぜ: 以前の正式版 zip を今回の dev 検査の成果と誤認させない。
    if (existsSync("dist")) {
      for (const name of readdirSync("dist")) {
        if (name.startsWith("designinserter-") && name.endsWith(".zip"))
          unlinkSync(`dist/${name}`);
      }
    }
  },
};
const profiles = {
  php: ["phpunit", "phpcs", "php-lint"],
  js: ["js-syntax", "build-dev", "js-test"],
  // なぜ: 復号後の正式ビルドは trusted workflow の既存ゲートの後だけで実行する。
  "trusted-js": ["js-syntax", "js-test"],
  local: [
    "phpcs-docker",
    "php-lint",
    "clean-stale-release",
    "build-dev",
    "js-syntax",
    "js-test",
    "phpunit-docker",
  ],
};
const selected =
  profiles[process.argv[2]] ??
  (checks[process.argv[2]] ? [process.argv[2]] : null);
if (!selected) {
  console.error("Unknown CI phase");
  process.exit(2);
}
for (const phase of selected) checks[phase]();
