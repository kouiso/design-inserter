import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  AUTOMATED_ISSUE_LABELS,
  COMMENT_AUTHOR,
  MARKER,
  apiBase,
  buildComment,
  checkIssue,
  checkPr,
  hasContent,
  rewriteIssueHeadings,
  shouldSkip,
} from "../.github/scripts/format-check.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const script = join(root, ".github/scripts/format-check.mjs");

const GOOD_ISSUE = `## 背景
公開リポのため書き方をそろえたい。

## 今どこまで
- 何も変更していません。

## 次にやること
1. 検査スクリプトを足す。

## 誰の判断待ち
- 磯貝さん: マージの可否。

## 完了条件
- テストで赤→緑を確かめた。
`;

const GOOD_PR = `## 関連 Issue
- Refs #114

## 概要・背景・妥協点
書き方チェックを足す。

## やったこと
- スクリプトを足した。

## やっていないこと
- 公開内容チェック。
`;

// ---------- 純関数 ----------

test("issue: 5 見出しがそろって中身があれば OK", () => {
  assert.deepEqual(checkIssue(GOOD_ISSUE), { ok: true, missing: [], empty: [], invalid: [] });
});

test("issue: 見出しが足りないと missing に名前が出る", () => {
  const body = "## 背景\nあり\n\n## 完了条件\nあり\n";
  const r = checkIssue(body);
  assert.equal(r.ok, false);
  assert.deepEqual(r.missing, ["今どこまで", "次にやること", "誰の判断待ち"]);
  assert.deepEqual(r.empty, []);
});

test("issue: 空の本文・null は全部 missing", () => {
  for (const body of ["", null, undefined, "   \n\n"]) {
    assert.equal(checkIssue(body).missing.length, 5);
  }
});

test("issue: 見出しは # 〜 #### を許し、頭が一致すれば足す語を許す", () => {
  const body = [
    "# 背景・目的\nあり",
    "## 今どこまで（2026-10-29 時点）\nあり",
    "### 次にやること\nあり",
    "#### 誰の判断待ち\nあり",
    "## **完了条件**\nあり",
  ].join("\n\n");
  assert.equal(checkIssue(body).ok, true);
});

test("issue: 見出しの途中にだけ語がある・5 階層以上は見出しと見なさない", () => {
  const body = GOOD_ISSUE.replace("## 背景", "## この背景").replace("## 完了条件", "##### 完了条件");
  const r = checkIssue(body);
  assert.deepEqual(r.missing, ["背景", "完了条件"]);
});

test("未記入扱い: 見出しだけ・「-」だけ・「- [ ]」だけ・コメントだけ・空白だけ", () => {
  const unfilled = {
    背景: "",
    今どこまで: "-\n",
    次にやること: "- [ ]\n- [ ] \n",
    誰の判断待ち: "<!-- ここに書く\n複数行のコメント -->\n",
    完了条件: "   \n\t\n",
  };
  const body = Object.entries(unfilled)
    .map(([h, c]) => `## ${h}\n${c}`)
    .join("\n");
  const r = checkIssue(body);
  assert.equal(r.ok, false);
  assert.deepEqual(r.missing, []);
  assert.deepEqual(r.empty, ["背景", "今どこまで", "次にやること", "誰の判断待ち", "完了条件"]);
});

test("未記入扱い: issue フォームの _No response_ と番号だけの箇条書き", () => {
  assert.equal(hasContent("_No response_"), false);
  assert.equal(hasContent("1."), false);
  assert.equal(hasContent("* [x]"), false);
  assert.equal(hasContent("- [ ] テストを書く"), true);
  assert.equal(hasContent("<!-- c -->\n本文"), true);
  assert.equal(hasContent("#114 を直す"), true);
});

test("見出しだけ → 文字を足すと直る（赤→緑）", () => {
  const bad = GOOD_ISSUE.replace("- 磯貝さん: マージの可否。", "-");
  assert.deepEqual(checkIssue(bad).empty, ["誰の判断待ち"]);
  assert.equal(checkIssue(GOOD_ISSUE).ok, true);
});

test("コードブロック内の # は見出しにしない", () => {
  const body = "## 背景\n```\n## 今どこまで\n```\n";
  const r = checkIssue(body);
  assert.ok(r.missing.includes("今どこまで"));
});

test("深い見出しの下の文は親の節の中身になる / 見出しだけの子は中身にならない", () => {
  const withChild = GOOD_ISSUE.replace("1. 検査スクリプトを足す。", "#### 手順\n1. 検査スクリプトを足す。");
  assert.equal(checkIssue(withChild).ok, true);
  const onlyChild = GOOD_ISSUE.replace("1. 検査スクリプトを足す。", "#### 手順\n");
  assert.deepEqual(checkIssue(onlyChild).empty, ["次にやること"]);
});

test("PR: 概要・変更内容・関連Issue がそろえば OK（スクショ・その他は任意）", () => {
  assert.equal(checkPr(GOOD_PR).ok, true);
  const classic = "## 概要\nあり\n\n## 変更内容\n- あり\n\n## 関連Issue\nCloses #12\n";
  assert.equal(checkPr(classic).ok, true);
});

test("PR: 「概要・背景・妥協点」は概要、「やったこと」は変更内容として数える", () => {
  const body = "## 概要・背景・妥協点\nあり\n## やったこと\nあり\n## 関連 Issue\nRefs #1";
  assert.deepEqual(checkPr(body), { ok: true, missing: [], empty: [], invalid: [] });
});

test("PR: 見出しが足りない・空のとき missing / empty", () => {
  const r = checkPr("## 概要\n\n## 関連Issue\n- Refs #1\n");
  assert.deepEqual(r.missing, ["変更内容"]);
  assert.deepEqual(r.empty, ["概要"]);
  assert.equal(r.ok, false);
});

test("PR: 関連Issue 節に Closes / Refs と番号が要る（大文字小文字は問わない）", () => {
  const withRef = (ref) => `## 概要\nあり\n## 変更内容\nあり\n## 関連Issue\n${ref}\n`;
  for (const ok of ["Closes #1", "closes #1", "REFS #22", "refs #3", "- Refs #114（項目2）", "Closes: #5", "Refs kouiso/design-inserter#114"]) {
    assert.equal(checkPr(withRef(ok)).ok, true, ok);
  }
  // Fixes / Resolves も GitHub が閉じる語なので許す
  for (const ok of ["Fixes #1", "fixes #1", "Resolves #2", "resolved #3", "Closed #4"]) {
    assert.equal(checkPr(withRef(ok)).ok, true, ok);
  }
  for (const bad of ["#114", "なし", "Closes", "Refs #abc", "see #114", "Closes#1"]) {
    const r = checkPr(withRef(bad));
    assert.equal(r.ok, false, bad);
    assert.deepEqual(r.invalid.map((i) => i.name), ["関連Issue"], bad);
  }
});

test("PR: Closes は関連Issue 節の外にあっても数えない", () => {
  const body = "## 概要\nCloses #1\n## 変更内容\nあり\n## 関連Issue\n- なし\n";
  assert.equal(checkPr(body).ok, false);
});

test("対象外: bot（type も login の [bot] も）", () => {
  assert.ok(shouldSkip("pr", { user: { login: "renovate[bot]", type: "User" } }));
  assert.ok(shouldSkip("pr", { user: { login: "someapp", type: "Bot" } }));
  assert.ok(shouldSkip("issue", { user: { login: "github-actions[bot]" } }));
  assert.equal(shouldSkip("pr", { user: { login: "kouiso", type: "User" } }), null);
});

test("対象外: 下書きの PR だけ（issue の draft 項目は見ない）", () => {
  const user = { login: "kouiso", type: "User" };
  assert.ok(shouldSkip("pr", { user, draft: true }));
  assert.equal(shouldSkip("pr", { user, draft: false }), null);
});

test("対象外: アラート系ラベルの issue（大文字小文字を問わない）", () => {
  const user = { login: "kouiso", type: "User" };
  for (const name of AUTOMATED_ISSUE_LABELS) {
    assert.ok(shouldSkip("issue", { user, labels: [{ name: "bug" }, { name: name.toUpperCase() }] }), name);
  }
  assert.equal(shouldSkip("issue", { user, labels: [{ name: "bug" }, { name: "devin" }] }), null);
  assert.equal(shouldSkip("issue", { user, labels: [] }), null);
  // PR のラベルでは除外しない
  assert.equal(shouldSkip("pr", { user, labels: [{ name: "alert" }] }), null);
});

test("コメントは見出し名だけで、本文の文字を引用しない", () => {
  const secret = "SECRET-VALUE-SHOULD-NOT-ECHO";
  const body = `## 背景\n${secret}\n`;
  const comment = buildComment("issue", checkIssue(body));
  assert.ok(comment.startsWith(MARKER));
  assert.ok(!comment.includes(secret));
  assert.match(comment, /今どこまで/);
  assert.match(buildComment("pr", checkPr("## 概要\nあり")), /変更内容（「やったこと」でも可）/);
  assert.match(buildComment("pr", checkPr(GOOD_PR)), /OK/);
});

test("API の基点は GITHUB_API_URL から読む（既定は api.github.com）", () => {
  assert.equal(apiBase({}), "https://api.github.com");
  assert.equal(apiBase({ GITHUB_API_URL: "http://127.0.0.1:1234/" }), "http://127.0.0.1:1234");
});

// ---------- workflow の形（base のスクリプトだけを使うこと） ----------

test("workflow: 権限はジョブごとに最小、PR の head を取り出さない、actions は SHA 固定", () => {
  const yml = readFileSync(join(root, ".github/workflows/issue-pr-format-check.yml"), "utf8");
  assert.match(yml, /^ {2}issues:\n {4}types: \[opened, edited, reopened, labeled, unlabeled\]$/m);
  assert.match(
    yml,
    /^ {2}pull_request_target:\n {4}types: \[opened, edited, reopened, ready_for_review, converted_to_draft\]$/m,
  );
  // 全体は contents: read だけ。書き込み権限は issue 用・PR 用のジョブにそれぞれ要る分だけ。
  assert.match(yml, /^permissions:\n {2}contents: read\n\n/m);
  const jobs = yml.split(/^jobs:\n/m)[1];
  const [issueJob, prJob] = jobs.split(/^ {2}pr-check:\n/m);
  assert.match(issueJob, /^ {2}issue-check:\n/m);
  assert.match(issueJob, /if: github\.event_name == 'issues'/);
  assert.match(issueJob, /permissions:\n {6}contents: read\n {6}issues: write\n/);
  assert.doesNotMatch(issueJob, /pull-requests:/);
  assert.match(prJob, /if: github\.event_name == 'pull_request_target'/);
  assert.match(prJob, /permissions:\n {6}contents: read\n {6}pull-requests: write\n/);
  assert.doesNotMatch(prJob, /issues:/);
  // checkout は資格情報を残さず、スクリプトのディレクトリだけ取る
  for (const job of [issueJob, prJob]) {
    assert.match(job, /persist-credentials: false/);
    assert.match(job, /sparse-checkout: \.github\/scripts\n/);
  }
  assert.equal([...yml.matchAll(/persist-credentials: false/g)].length, 2);
  assert.equal([...yml.matchAll(/sparse-checkout: /g)].length, 2);
  // 同じ issue / PR の実行は新しい方だけ残す
  assert.match(
    yml,
    /concurrency:\n {2}group: format-check-\$\{\{ github\.event\.issue\.number \|\| github\.event\.pull_request\.number \}\}\n {2}cancel-in-progress: true\n/,
  );
  assert.doesNotMatch(yml, /\bpull_request:\s*$/m);
  assert.doesNotMatch(yml, /pull_request\.head|head_ref|head\.sha|head\.ref/);
  assert.doesNotMatch(yml, /^\s+ref:/m);
  assert.doesNotMatch(yml, /secrets\.(?!GITHUB_TOKEN)/);
  assert.doesNotMatch(yml, /\$\{\{\s*github\.event\.(issue|pull_request)\.(body|title)/);
  for (const m of yml.matchAll(/uses:\s*(\S+)/g)) {
    assert.match(m[1], /@[0-9a-f]{40}$/, `SHA 固定でない: ${m[1]}`);
  }
});

// ---------- 偽の GitHub API を立てて、スクリプトを実際に走らせる ----------

function startFakeApi(initialComments = []) {
  const state = {
    comments: initialComments.map((c, i) => ({ id: 100 + i, ...c })),
    requests: [],
    nextId: 1000,
    failWith: null,
  };
  const server = createServer((req, res) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      const url = new URL(req.url, "http://127.0.0.1");
      const body = raw ? JSON.parse(raw) : undefined;
      state.requests.push({ method: req.method, path: url.pathname, query: url.search, body, auth: req.headers.authorization });
      const send = (status, json) => {
        res.writeHead(status, { "Content-Type": "application/json" });
        res.end(JSON.stringify(json));
      };
      if (state.failWith) return send(state.failWith, { message: "boom" });
      const list = url.pathname.match(/^\/repos\/o\/r\/issues\/(\d+)\/comments$/);
      const one = url.pathname.match(/^\/repos\/o\/r\/issues\/comments\/(\d+)$/);
      if (req.method === "GET" && list) {
        const perPage = Number(url.searchParams.get("per_page"));
        const page = Number(url.searchParams.get("page"));
        return send(200, state.comments.slice((page - 1) * perPage, page * perPage));
      }
      if (req.method === "POST" && list) {
        const created = { id: state.nextId++, user: { login: COMMENT_AUTHOR }, body: body.body };
        state.comments.push(created);
        return send(201, created);
      }
      if (req.method === "PATCH" && one) {
        const target = state.comments.find((c) => c.id === Number(one[1]));
        if (!target) return send(404, { message: "no" });
        target.body = body.body;
        return send(200, target);
      }
      return send(404, { message: "unexpected" });
    });
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      state.url = `http://127.0.0.1:${server.address().port}`;
      state.close = () => new Promise((r) => server.close(r));
      state.writes = () => state.requests.filter((r) => r.method !== "GET");
      resolve(state);
    });
  });
}

function runScript(api, event, extraEnv = {}) {
  const dir = mkdtempSync(join(tmpdir(), "format-check-"));
  const eventPath = join(dir, "event.json");
  writeFileSync(eventPath, JSON.stringify(event));
  const env = {
    PATH: process.env.PATH,
    GITHUB_API_URL: api.url,
    GITHUB_TOKEN: "test-token-not-real",
    GITHUB_REPOSITORY: "o/r",
    GITHUB_EVENT_PATH: eventPath,
    ...extraEnv,
  };
  for (const [k, v] of Object.entries(env)) if (v === undefined) delete env[k];
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script], { env });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));
    child.on("error", reject);
    child.on("close", (code) => {
      rmSync(dir, { recursive: true, force: true });
      resolve({ code, stdout, stderr });
    });
  });
}

const human = { login: "kouiso", type: "User" };
const issueEvent = (body, extra = {}) => ({
  action: "opened",
  issue: { number: 7, body, user: human, labels: [], ...extra },
});
const prEvent = (body, extra = {}) => ({
  action: "opened",
  pull_request: { number: 8, body, user: human, draft: false, ...extra },
});

test("実行: 足りない issue → コメントを 1 つ作って exit 1、直すと同じコメントが OK に更新されて exit 0", async () => {
  const api = await startFakeApi();
  try {
    const bad = await runScript(api, issueEvent("## 背景\nあり\n"));
    assert.equal(bad.code, 1, bad.stderr);
    assert.equal(api.writes().length, 1);
    assert.equal(api.writes()[0].method, "POST");
    assert.equal(api.writes()[0].path, "/repos/o/r/issues/7/comments");
    assert.equal(api.writes()[0].auth, "Bearer test-token-not-real");
    assert.ok(api.writes()[0].body.body.startsWith(MARKER));
    assert.equal(api.comments.length, 1);

    // まだ足りないまま編集 → 新規投稿しない（内容が同じなら何も書かない）
    const again = await runScript(api, issueEvent("## 背景\nあり\n", { action: "edited" }));
    assert.equal(again.code, 1);
    assert.equal(api.writes().length, 1);

    // 少しだけ直した（足りない項目が変わる）→ 同じコメントを PATCH
    const partial = await runScript(api, issueEvent("## 背景\nあり\n## 完了条件\nあり\n"));
    assert.equal(partial.code, 1);
    assert.equal(api.writes().length, 2);
    assert.equal(api.writes()[1].method, "PATCH");
    assert.equal(api.writes()[1].path, "/repos/o/r/issues/comments/1000");
    assert.equal(api.comments.length, 1);
    assert.ok(!api.comments[0].body.includes("完了条件"));

    // 全部そろった → 同じコメントを OK に更新、exit 0
    const good = await runScript(api, issueEvent(GOOD_ISSUE));
    assert.equal(good.code, 0, good.stderr);
    assert.equal(api.writes().length, 3);
    assert.equal(api.writes()[2].method, "PATCH");
    assert.match(api.comments[0].body, /書き方チェック: OK/);
    assert.equal(api.comments.length, 1);

    // OK のまま再実行 → 何も書かない
    const goodAgain = await runScript(api, issueEvent(GOOD_ISSUE, { action: "edited" }));
    assert.equal(goodAgain.code, 0);
    assert.equal(api.writes().length, 3);
  } finally {
    await api.close();
  }
});

test("実行: 最初からそろっている issue / PR は何も書かず exit 0", async () => {
  const api = await startFakeApi();
  try {
    assert.equal((await runScript(api, issueEvent(GOOD_ISSUE))).code, 0);
    assert.equal((await runScript(api, prEvent(GOOD_PR))).code, 0);
    assert.equal(api.writes().length, 0);
  } finally {
    await api.close();
  }
});

test("実行: PR の関連Issue に番号が無い → 赤、Refs を足すと緑", async () => {
  const api = await startFakeApi();
  try {
    const bad = await runScript(api, prEvent(GOOD_PR.replace("Refs #114", "なし")));
    assert.equal(bad.code, 1, bad.stderr);
    assert.equal(api.writes()[0].path, "/repos/o/r/issues/8/comments");
    assert.match(api.comments[0].body, /Closes #番号/);
    const fixed = await runScript(api, prEvent(GOOD_PR, { action: "edited" }));
    assert.equal(fixed.code, 0);
    assert.match(api.comments[0].body, /OK/);
    assert.equal(api.comments.length, 1);
  } finally {
    await api.close();
  }
});

test("実行: bot・下書き PR・アラート系ラベルの issue は何も書かず exit 0（目印コメントを探すだけ）", async () => {
  const api = await startFakeApi();
  try {
    const badBody = "何も書いていない";
    const cases = [
      issueEvent(badBody, { user: { login: "renovate[bot]", type: "Bot" } }),
      prEvent(badBody, { user: { login: "dependabot[bot]", type: "Bot" } }),
      prEvent(badBody, { draft: true }),
      issueEvent(badBody, { labels: [{ name: "alert" }] }),
      { action: "opened", issue: { number: 9, body: badBody, user: human, labels: [], pull_request: {} } },
    ];
    for (const event of cases) {
      const r = await runScript(api, event);
      assert.equal(r.code, 0, r.stderr);
      assert.match(r.stdout, /skip/);
    }
    assert.equal(api.writes().length, 0);
    assert.ok(api.requests.every((q) => q.method === "GET"));
  } finally {
    await api.close();
  }
});

test("実行: 後から対象外になった（下書きに戻した・アラート系ラベルが付いた）物の赤いコメントは「対象外」に更新される", async () => {
  const api = await startFakeApi();
  try {
    assert.equal((await runScript(api, prEvent("書いていない"))).code, 1);
    assert.match(api.comments[0].body, /足りない項目があります/);
    // 下書きに戻した
    const draft = await runScript(api, { ...prEvent("書いていない", { draft: true }), action: "converted_to_draft" });
    assert.equal(draft.code, 0, draft.stderr);
    assert.equal(api.writes().length, 2);
    assert.equal(api.writes()[1].method, "PATCH");
    assert.match(api.comments[0].body, /対象外になったので検査しません/);
    assert.ok(api.comments[0].body.startsWith(MARKER));
    // 同じ対象外をもう一度 → 書かない
    await runScript(api, { ...prEvent("書いていない", { draft: true }), action: "edited" });
    assert.equal(api.writes().length, 2);
    // 下書きを外すと、同じコメントがまた検査結果に戻る
    assert.equal((await runScript(api, { ...prEvent("書いていない"), action: "ready_for_review" })).code, 1);
    assert.equal(api.comments.length, 1);
    assert.match(api.comments[0].body, /足りない項目があります/);
  } finally {
    await api.close();
  }
});

test("実行: アラート系ラベルが付いた issue の赤いコメントも「対象外」に更新される", async () => {
  const api = await startFakeApi();
  try {
    assert.equal((await runScript(api, issueEvent("何も無い"))).code, 1);
    const labeled = await runScript(api, { ...issueEvent("何も無い", { labels: [{ name: "Alert" }] }), action: "labeled" });
    assert.equal(labeled.code, 0, labeled.stderr);
    assert.match(api.comments[0].body, /対象外になったので検査しません/);
    assert.equal(api.comments.length, 1);
  } finally {
    await api.close();
  }
});

test("実行: ready_for_review で下書きでなくなった PR は検査する", async () => {
  const api = await startFakeApi();
  try {
    const r = await runScript(api, { ...prEvent("書いていない", { draft: false }), action: "ready_for_review" });
    assert.equal(r.code, 1);
    assert.equal(api.writes().length, 1);
  } finally {
    await api.close();
  }
});

test("実行: 目印だけ真似た他人のコメントは更新せず、2 ページ目にある自分のコメントは見つける", async () => {
  const filler = Array.from({ length: 100 }, (_, i) => ({ user: human, body: `c${i}` }));
  const api = await startFakeApi([
    { user: human, body: `${MARKER}\n偽物` },
    ...filler.slice(1),
    { user: { login: COMMENT_AUTHOR }, body: `${MARKER}\n古い内容` },
  ]);
  try {
    const r = await runScript(api, issueEvent("## 背景\nあり\n"));
    assert.equal(r.code, 1, r.stderr);
    assert.equal(api.writes().length, 1);
    assert.equal(api.writes()[0].method, "PATCH");
    assert.equal(api.writes()[0].path, "/repos/o/r/issues/comments/200");
    assert.ok(api.requests.some((q) => q.method === "GET" && q.query.includes("page=2")));
    assert.equal(api.comments[0].body, `${MARKER}\n偽物`);
  } finally {
    await api.close();
  }
});

test("実行: API 失敗・トークン無し・イベント無しは exit 2（書き方の不備の exit 1 と区別する）", async () => {
  const api = await startFakeApi();
  try {
    api.failWith = 500;
    const failed = await runScript(api, issueEvent("## 背景\nあり\n"));
    assert.equal(failed.code, 2);
    assert.match(failed.stderr, /HTTP 500/);
    api.failWith = null;
    assert.equal((await runScript(api, issueEvent(GOOD_ISSUE), { GITHUB_TOKEN: undefined })).code, 2);
    assert.equal((await runScript(api, { action: "opened" })).code, 2);
  } finally {
    await api.close();
  }
});

// ---------- アカウント既定の様式（kouiso/.github）との整合 ----------

// 既定の pull_request_template.md の、このチェックが見る部分（コメントと初期値は原文のまま）。
const DEFAULT_PR_TEMPLATE_UNFILLED = `## 関連 Issue

<!-- 最後の PR だけ SBI を Closes。途中の PR と PBI は Refs。別リポジトリの場合: Closes オーナー名/リポジトリ名#番号 -->

- Closes #
- Refs:

## 概要・背景・妥協点

<!--
何を・なぜ を1〜2行で。結論から。
- Issue の記述と違う進め方をした箇所と、その理由
-->

## やったこと

<!-- 1行に1つ。変更が3つ以上なら「対象 / 変更 / 理由」の表にする。 -->

-

## やっていないこと

- なし

## Before / After

> [!TIP]
> 画面まわりならスクリーンショット・動画を前後で並べる。

| Before | After |
| --- | --- |
| | |
`;

test("既定の PR テンプレートは、書く前は赤・書くと緑", () => {
  const r = checkPr(DEFAULT_PR_TEMPLATE_UNFILLED);
  assert.equal(r.ok, false);
  assert.deepEqual(r.missing, []);
  assert.deepEqual(r.empty, ["概要", "変更内容"]);
  assert.deepEqual(r.invalid.map((i) => i.name), ["関連Issue"]);

  const filled = DEFAULT_PR_TEMPLATE_UNFILLED.replace("- Closes #\n- Refs:", "- Closes #12\n- Refs: #3")
    .replace("-->\n\n## やったこと", "-->\nチェックを足す。\n\n## やったこと")
    .replace("-->\n\n-\n", "-->\n\n- スクリプトを足した\n");
  assert.deepEqual(checkPr(filled), { ok: true, missing: [], empty: [], invalid: [] });
  // 「Closes #」「Refs:」だけ残して番号を書かないと赤のまま
  assert.equal(checkPr(filled.replace("- Closes #12\n- Refs: #3", "- Closes #\n- Refs:")).ok, false);
});

// GitHub の issue フォームは、各欄を「### ラベル」＋入力値の形で本文にする。
const form = (...fields) => fields.map(([label, value]) => `### ${label}\n\n${value}`).join("\n\n");
const DONE_DEFAULT =
  "> [!TIP]\n> ここが合否のラインです。「動くこと」やなく「何がどうなっとれば終わりか」を書いてください。\n\n- [ ]";

test("既定の issue フォームの見出しは別名として通る（背景・次にやること・完了条件）", () => {
  const bug = form(
    ["なぜ直したいか（必須）", "注文履歴が開けん。"],
    [
      "何が起きたか（必須）",
      "- 本当はこうなってほしい：開く\n- 実際はこうなった：開かん\n- どうしたら同じことが起きるか：履歴を押す",
    ],
    ["どうなったら終わりか（必須）", DONE_DEFAULT.replace("- [ ]", "- [ ] 履歴が開く")],
  );
  const r = checkIssue(bug);
  // 既定の様式に無い欄は課題の指定どおり必須のまま
  assert.deepEqual(r.missing, ["今どこまで", "次にやること", "誰の判断待ち"]);
  assert.deepEqual(r.empty, []);

  const todo = form(["何をしてほしいか（必須）", "期限を調べる。"], ["どうなったら終わりか（必須）", "- [ ] 日付が書いてある"]);
  assert.deepEqual(checkIssue(todo).missing, ["背景", "今どこまで", "誰の判断待ち"]);
  assert.equal(checkIssue(form(["なぜ欲しいか（必須）", "手作業がつらい"])).missing.includes("背景"), false);
  assert.equal(checkIssue("## やること\n- a\n").missing.includes("次にやること"), false);
  assert.equal(checkIssue("## 完成の定義\n- a\n").missing.includes("完了条件"), false);
  assert.equal(checkIssue("## 背景・目的\na\n").missing.includes("背景"), false);
});

test("既定フォームを書き換えずに出した欄（案内の囲み・- [ ] だけ・ラベルだけ）は未記入", () => {
  const body = form(
    ["なぜ直したいか（必須）", "困っとる。"],
    ["何が起きたか（必須）", "- 本当はこうなってほしい：\n- 実際はこうなった：\n- どうしたら同じことが起きるか："],
    ["どうなったら終わりか（必須）", DONE_DEFAULT],
  );
  const r = checkIssue(body);
  assert.deepEqual(r.empty, ["完了条件"]);
  assert.equal(r.missing.includes("背景"), false);
  const onlyLabels = form(["何が起きたか（必須）", "- 本当はこうなってほしい：\n- 実際はこうなった："]);
  assert.deepEqual(checkIssue(onlyLabels).empty, ["背景"]);
  assert.equal(hasContent("> [!TIP]\n> 案内\n\n- [ ] 書いた"), true);
  assert.equal(hasContent("> 引用だけ"), true);
});

test("既定に無い「今どこまで」「誰の判断待ち」は、他の見出しでは通さない", () => {
  for (const heading of ["何が起きたか", "手がかり", "その他", "どれくらい困っとるか"]) {
    const r = checkIssue(`## ${heading}\nあり\n`);
    assert.ok(r.missing.includes("今どこまで"), heading);
    assert.ok(r.missing.includes("誰の判断待ち"), heading);
  }
});

test("対象外: 既定の SBI フォーム（メモ（任意）が空）と、本文が空のサブ issue だけ", () => {
  const user = { login: "kouiso", type: "User" };
  const parent = "https://api.github.com/repos/o/r/issues/1";
  for (const body of [
    "### メモ（任意）\n\n_No response_",
    "### メモ（任意）\n\n",
    "## メモ（任意）\n\n_No response_\n", // fix-issue-headings で書き換わった後
    "### メモ（任意）\r\n\r\n_No response_\r\n",
    "### メモ（任意）\n<!-- 書きたいこと -->",
  ]) {
    assert.ok(shouldSkip("issue", { user, body }), body);
  }
  assert.ok(shouldSkip("issue", { user, body: "", parent_issue_url: parent }));
  assert.ok(shouldSkip("issue", { user, body: null, parent_issue_url: parent }));
  // メモに中身がある・見出しが完全一致でない・前置きや他の見出しがある・空の本文（サブ issue でない）は検査する
  for (const body of [
    "### メモ（任意）\n\n子の作業メモ",
    "### メモ\n\n_No response_",
    "### メモ（任意）の続き\n\n_No response_",
    "前置き\n### メモ（任意）\n_No response_",
    "### メモ（任意）\n_No response_\n### 背景\ny",
    "### メモ（任意）\n_No response_\n### メモ（任意）\n_No response_",
    "",
  ]) {
    assert.equal(shouldSkip("issue", { user, body }), null, body);
  }
  // サブ issue でも本文に何か書いてあれば検査する（parent_issue_url だけでは外さない）
  assert.equal(shouldSkip("issue", { user, body: "背景だけ書いた", parent_issue_url: parent }), null);
  assert.equal(shouldSkip("pr", { user, body: "### メモ（任意）\n" }), null);
});

// ---------- 別エージェントのレビュー指摘（1〜10）に対応するテスト ----------

const FULL_ISSUE_TAIL = "## 次にやること\nx\n## 誰の判断待ち\nx\n## 完了条件\nx";

test("レビュー1: フェンスの外の HTML コメントの中の見出しは見出しにしない（未記入が緑にならない）", () => {
  const body = `## 背景\n<!--\n## 今どこまで の例\n- x\n-->\n${FULL_ISSUE_TAIL}`;
  const r = checkIssue(body);
  assert.equal(r.ok, false);
  assert.deepEqual(r.missing, ["今どこまで"]);
  // 本文ぜんぶがコメント
  const all = checkIssue(`<!--\n${GOOD_ISSUE}\n-->`);
  assert.equal(all.ok, false);
  assert.equal(all.missing.length, 5);
  // 閉じていないコメントは本文の終わりまで
  const open = checkIssue(`## 背景\nあり\n<!--\n## 今どこまで\nx\n${FULL_ISSUE_TAIL}`);
  assert.equal(open.ok, false);
  assert.ok(open.missing.includes("今どこまで"));
  assert.ok(open.missing.includes("完了条件"));
  // 1 行のコメント、行の途中から始まるコメント、同じ行で閉じて続く見出し
  assert.deepEqual(checkIssue(`<!-- ## 背景 -->\n${FULL_ISSUE_TAIL}`).missing, ["背景", "今どこまで"]);
  assert.ok(checkIssue(`## 背景\nあり <!--\n## 今どこまで\n-->\n## 今どこまで\nx\n${FULL_ISSUE_TAIL}`).ok);
  // フェンス（コードブロック）の中の <!-- はコメントを始めない
  const fenced = checkIssue(`## 背景\n\`\`\`\n<!--\n\`\`\`\nあり\n## 今どこまで\nx\n${FULL_ISSUE_TAIL}`);
  assert.equal(fenced.ok, true);
  // PR 版
  const pr = checkPr("## 関連 Issue\n<!--\n## 概要 の例\nRefs #1\n-->\n## やったこと\n-");
  assert.deepEqual(pr.missing, ["概要"]);
  assert.deepEqual(pr.empty, ["変更内容", "関連Issue"]);
  assert.equal(pr.ok, false);
});

test("レビュー2: 節は別の必須見出し（別名を含む）で切れる", () => {
  const r = checkIssue(`# 背景\n## 今どこまで\nx\n${FULL_ISSUE_TAIL}`);
  assert.deepEqual(r.empty, ["背景"]);
  const alias = checkIssue(`## 背景\n### どうなったら終わりか\nx\n## 今どこまで\nx\n## 次にやること\nx\n## 誰の判断待ち\nx`);
  assert.deepEqual(alias.empty, ["背景"]);
  assert.equal(alias.missing.length, 0);
  const pr = checkPr("# 概要\n## やったこと\nx\n## 関連Issue\nRefs #1");
  assert.deepEqual(pr.empty, ["概要"]);
  // 必須でない深い見出しは、これまでどおり親の節の中身になる
  assert.equal(checkPr("# 概要\n## 補足\nx\n# 変更内容\nx\n# 関連Issue\nRefs #1").ok, true);
});

test("レビュー3: フェンスは開いた長さを覚え、閉じは同じ文字・同じ長さ以上・情報文字列なし・字下げ3以下", () => {
  const tail = "## 今どこまで\nx\n" + FULL_ISSUE_TAIL;
  const missingNow = (body) => checkIssue(body).missing.includes("今どこまで");
  // 4 本で開けたら 3 本では閉じない
  assert.ok(missingNow(`## 背景\n\`\`\`\`\n\`\`\`\n${tail}\n\`\`\`\`\n`));
  // 情報文字列つきでは閉じない
  assert.ok(missingNow(`## 背景\n\`\`\`\n\`\`\`js\n${tail}\n\`\`\`\n`));
  // 別の文字では閉じない
  assert.ok(missingNow(`## 背景\n~~~\n\`\`\`\n${tail}\n~~~\n`));
  assert.ok(missingNow(`## 背景\n\`\`\`\n~~~\n${tail}\n\`\`\`\n`));
  // 字下げ 4 以上では閉じない・開かない
  assert.ok(missingNow(`## 背景\n\`\`\`\n    \`\`\`\n${tail}\n\`\`\`\n`));
  assert.equal(missingNow(`## 背景\n    \`\`\`\n${tail}\n`), false);
  // 正しく閉じれば、その後ろの見出しは本物（長い閉じ・字下げ 3 までは閉じる）
  assert.equal(missingNow(`## 背景\n\`\`\`\n\`\`\`\`\n${tail}`), false);
  assert.equal(missingNow(`## 背景\n\`\`\`\n   \`\`\`  \n${tail}`), false);
  assert.equal(missingNow(`## 背景\n~~~~\ncode\n~~~~~\n${tail}`), false);
  // 閉じないフェンスは本文の終わりまで
  assert.ok(missingNow(`## 背景\n\`\`\`\n${tail}`));
  // 空のコードブロックだけの節は未記入
  assert.deepEqual(checkIssue(`## 背景\n\`\`\`\n\`\`\`\n${"## 今どこまで\nx\n" + FULL_ISSUE_TAIL}`).empty, ["背景"]);
  assert.equal(checkIssue(`## 背景\n\`\`\`\nコード\n\`\`\`\n${tail}`).ok, true);
});

test("レビュー4: 区切り線・引用記号だけ・ゼロ幅文字・&nbsp;・<br>・「・」だけ・空の表は未記入", () => {
  for (const blank of [
    "---",
    "***",
    "___",
    "- - -",
    ">",
    "> ",
    "> >",
    "​",
    "​‌‍⁠﻿",
    "​- ​",
    "&nbsp;",
    "&#160;",
    "&NBSP;",
    " ",
    "<br>",
    "<br/>",
    "<BR />",
    "&nbsp;<br>&nbsp;",
    "・",
    "• ",
    "| |",
    "|  |  |\n| --- | --- |\n|   |   |",
    "| :--- | ---: |",
  ]) {
    assert.equal(hasContent(blank), false, JSON.stringify(blank));
    const issue = `## 背景\n${blank}\n## 今どこまで\nx\n${FULL_ISSUE_TAIL}`;
    assert.deepEqual(checkIssue(issue).empty, ["背景"], JSON.stringify(blank));
  }
  for (const filled of ["| 項目 | 内容 |", "・書いた", "<br>x", "&nbsp;x", "> 引用した", "--- 注意", "-x"]) {
    assert.equal(hasContent(filled), true, filled);
  }
});

test("レビュー5: 見出しの頭の番号・記号・【】・絵文字は落として一致を見る", () => {
  const decorated = [
    "## 1. 背景",
    "## ① 今どこまで",
    "## 【次にやること】",
    "## 🎯 誰の判断待ち",
    "## ❗️ 完了条件",
  ];
  const body = decorated.map((h) => `${h}\nx`).join("\n");
  assert.deepEqual(checkIssue(body), { ok: true, missing: [], empty: [], invalid: [] });
  const more = ["## 2) 背景", "## ・今どこまで", "## (3) 次にやること", "## 【誰の判断待ち】", "## ２．完了条件"];
  assert.equal(checkIssue(more.map((h) => `${h}\nx`).join("\n")).ok, true);
  assert.equal(checkPr("## 1. 概要\nx\n## ② やったこと\nx\n## 【関連 Issue】\nRefs #1").ok, true);
  // 頭ではなく途中にだけ語がある物は、これまでどおり一致しない
  assert.deepEqual(checkIssue("## 2026年の背景\nx").missing.includes("背景"), true);
});

test("レビュー6: Refs:#3（コロンの後に空白なし）も通る。キーワードと # の間が空なら通らない", () => {
  const pr = (ref) => `## 概要\nx\n## 変更内容\nx\n## 関連Issue\n${ref}\n`;
  for (const ok of ["Refs:#3", "Refs : #3", "closes:#9", "- Fixes:kouiso/design-inserter#1", "Refs:  #3"]) {
    assert.equal(checkPr(pr(ok)).ok, true, ok);
  }
  for (const bad of ["Closes#1", "Refs:", "Refs: abc", "Refs #"]) {
    assert.equal(checkPr(pr(bad)).ok, false, bad);
  }
});

test("レビュー8: issue は fix-issue-headings.yml と同じ書き換え後の本文で判定する", () => {
  assert.equal(rewriteIssueHeadings("### a\n#### b\n##### c\n## d\n    ### e"), "## a\n### b\n##### c\n## d\n    ### e");
  assert.equal(rewriteIssueHeadings(null), "");
  // 書き換え後は ### が ## になるので、直前の節の子ではなく兄弟になる（書き換え前なら子で、緑になってしまう）
  const raw = "## 次にやること\n### 手順\nx\n## 背景\nx\n## 今どこまで\nx\n## 誰の判断待ち\nx\n## 完了条件\nx";
  assert.deepEqual(checkIssue(raw).empty, ["次にやること"]);
  // 書き換え前に ### だけで書かれた issue（フォームの出力）は、書き換え後と同じ結果になる
  assert.deepEqual(checkIssue(raw), checkIssue(rewriteIssueHeadings(raw)));
  // PR 本文は書き換えない
  assert.equal(checkPr("## 概要\n### 補足\nx\n## 変更内容\nx\n## 関連Issue\nRefs #1").ok, true);
});

test("レビュー10: CRLF 本文・全角英字の見出し", () => {
  const crlf = (s) => s.replace(/\n/g, "\r\n");
  assert.deepEqual(checkIssue(crlf(GOOD_ISSUE)), { ok: true, missing: [], empty: [], invalid: [] });
  assert.deepEqual(checkPr(crlf(GOOD_PR)), { ok: true, missing: [], empty: [], invalid: [] });
  // CRLF のコメント・フェンス・未記入
  const bad = crlf(`## 背景\n<!--\n## 今どこまで\n-->\n\`\`\`\n## 次にやること\n\`\`\`\n${FULL_ISSUE_TAIL.replace("## 次にやること\nx\n", "")}\n`);
  assert.deepEqual(checkIssue(bad).missing, ["今どこまで", "次にやること"]);
  assert.deepEqual(checkIssue(crlf("## 背景\n-\n")).empty, ["背景"]);
  // 全角英字・全角空白・全角ハイフン
  assert.equal(checkPr("## 概要\nx\n## 変更内容\nx\n## 関連　Ｉｓｓｕｅ\nRefs #1").ok, true);
  assert.equal(checkPr("## 概要\nx\n## 変更内容\nx\n## ＩＳＳＵＥ 関連\nRefs #1").missing[0], "関連Issue");
  assert.equal(checkPr("## 概要\nx\n## 変更内容\nx\n## 関連ＩＳＳＵＥ\nＲｅｆｓ #1").ok, false);
});

test("実行: 目印コメントの更新は、書き換え前後・CRLF の本文でも同じ結果になる", async () => {
  const api = await startFakeApi();
  try {
    const body = "## 背景\r\n<!--\r\n## 今どこまで\r\n-->\r\n";
    const r = await runScript(api, issueEvent(body));
    assert.equal(r.code, 1, r.stderr);
    assert.match(api.comments[0].body, /今どこまで/);
    assert.ok(!api.comments[0].body.includes("## 今どこまで\r"));
  } finally {
    await api.close();
  }
});
