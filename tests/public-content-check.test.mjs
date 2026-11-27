// 公開内容チェック (.github/scripts/public-content-check.mjs) の単体テストと、
// ローカル HTTP サーバーを GitHub API に見立てた実走テスト。
// 偽の秘密は、TruffleHog や push protection に引っかからないよう、実行時に文字列を組み立てる。
// 実際の GitHub には何も書かない（GITHUB_API_URL をローカルサーバーへ向ける）。
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import http from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const scriptPath = join(root, ".github/scripts/public-content-check.mjs");
const rulesPath = join(root, ".github/public-content-rules.json");
const { scan, compileRules, mergeExtraRules, buildComment, extractTarget } = await import(scriptPath);
const rulesJson = JSON.parse(readFileSync(rulesPath, "utf8"));
const rules = compileRules(rulesJson);

// ---- 偽の秘密（実行時に組み立てる。どれも実在しない作り物） ----
const AT = String.fromCharCode(64);
const fakes = {
  "aws-access-key": () => "AKIA" + "X".repeat(16),
  "github-token": () => "gh" + "p_" + "a1B2".repeat(9),
  "github-token-pat": () => "github" + "_pat_" + "Ab1_".repeat(8),
  "slack-token": () => "xo" + "xb-" + "1234567890-abcdefghij",
  "anthropic-key": () => "sk" + "-ant-" + "api03-" + "Qw9".repeat(10),
  "openai-key": () => "sk" + "-" + "ab12".repeat(12),
  "private-key-header": () => "-----BEGIN " + "RSA PRIVATE" + " KEY-----",
  "secret-assignment": () => "pass" + "word" + ' = "' + "Zx9".repeat(8) + '"',
  "db-connection-string": () => "postgres" + "://" + "app_user" + ":" + "S3cr3tPw0rd9" + AT + "db.internal.test:5432/app",
  "personal-email": () => "taro.sample" + AT + "corp-sample.test",
};
const fakeRuleId = (key) => key.replace(/-pat$/, "");

function ids(results) {
  return results.map((r) => r.ruleId);
}

// ---- scan(): 赤になる ----
for (const [key, make] of Object.entries(fakes)) {
  test(`scan: ${key} の作り物で当たる`, () => {
    const secret = make();
    const results = scan(`説明の行\nここに ${secret} がある\n`, rules);
    assert.deepEqual(ids(results), [fakeRuleId(key)]);
    assert.deepEqual(results[0].lines, [2]);
    assert.equal(results[0].count, 1);
    assert.ok(!JSON.stringify(results).includes(secret), "結果に当たった文字を含めない");
  });
}

test("scan: 秘密の名前の代入は、引用符つき・英数字混じりの長い値の両方で当たる", () => {
  const value = "Zx9".repeat(8);
  assert.deepEqual(ids(scan(`API_KEY: ${value}`, rules)), ["secret-assignment"]);
  assert.deepEqual(ids(scan(`"client_secret": "${value}"`, rules)), ["secret-assignment"]);
  assert.deepEqual(ids(scan(`DB_PASSWORD=${value}`, rules)), ["secret-assignment"]);
});

// ---- scan(): 普通の文章は緑 ----
const ordinary = [
  "GITHUB_TOKEN を使う。secrets.GITHUB_TOKEN は自動で入る。",
  "Closes #12\nRefs #114",
  "const token = process.env.GITHUB_TOKEN;",
  "token: ${{ secrets.GITHUB_TOKEN }}",
  "password: \"\"\nsecret = null\napi_key: <your-key-here>",
  "const apiKey = getApiKeyFromSettingsForCurrentUser();",
  "secret: some-long-kebab-case-description-here",
  "password = " + '"' + "your-password-" + "x".repeat(10) + '"',
  "コミット 11bd71901bbe5b1630ceea73d27597364c9af683 で直した。",
  "CSS クラス sk-circle と sk-fading-circle を使う。",
  "Co-Authored-By: Claude <noreply" + AT + "anthropic.com>",
  "12345+someone" + AT + "users.noreply.github.com",
  "連絡先は info" + AT + "example.com / " + "info" + AT + "example.org / " + "info" + AT + "example.net / " + "info" + AT + "example.jp",
  "git" + AT + "github.com:kouiso/design-inserter.git",
  "画像は image" + AT + "2x.png を使う。",
  "psql postgres://localhost:5432/appdb で接続する。",
  "postgres://user:password" + AT + "localhost/db は見本。",
  "顧客への請求は 120,000円 でした。¥5,000 の割引。",
  "```php\n$value = get_option( 'designinserter_settings' );\n```",
  "パーツ 222 件をカテゴリ別に挿入できる。販売前の品質確認を行う。",
  "",
];
for (const text of ordinary) {
  test(`scan: 普通の文章は緑 (${JSON.stringify(text.slice(0, 24))})`, () => {
    assert.deepEqual(scan(text, rules), []);
  });
}

test("scan: null / undefined の本文でも落ちない", () => {
  assert.deepEqual(scan(null, rules), []);
  assert.deepEqual(scan(undefined, rules), []);
});

// ---- 行番号と件数 ----
test("scan: 行番号は 1 始まり、同じ行の複数件は件数に数え行番号は 1 つ", () => {
  const aws = fakes["aws-access-key"]();
  const text = ["先頭の行", `${aws} と ${aws}`, "普通の行", "", `keys: ${aws}`].join("\n");
  const [hit] = scan(text, rules);
  assert.equal(hit.ruleId, "aws-access-key");
  assert.deepEqual(hit.lines, [2, 5]);
  assert.equal(hit.count, 3);
});

test("scan: CRLF でも行番号がずれない", () => {
  const text = ["a", "b", `c ${fakes["personal-email"]()}`].join("\r\n");
  assert.deepEqual(scan(text, rules)[0].lines, [3]);
});

test("scan: 複数の規則に当たったら規則ごとに返す", () => {
  const text = `${fakes["aws-access-key"]()}\n${fakes["personal-email"]()}`;
  const results = scan(text, rules);
  assert.deepEqual(ids(results).sort(), ["aws-access-key", "personal-email"]);
});

// ---- 規則ファイルの形 ----
test("規則ファイルは汎用規則だけで、持ち主固有の欄（顧客名・禁止語など）を持たない", () => {
  assert.deepEqual(
    rulesJson.rules.map((r) => r.id),
    ["aws-access-key", "github-token", "slack-token", "anthropic-key", "openai-key", "private-key-header", "secret-assignment", "db-connection-string", "personal-email"],
  );
  for (const rule of rulesJson.rules) {
    assert.ok(!("words" in rule), `${rule.id} は words を持たない`);
    assert.ok(!("sameLineAs" in rule), `${rule.id} は sameLineAs を持たない`);
  }
});

// ---- 環境変数経由の追加規則 ----
test("mergeExtraRules: 新しい規則の追加と、同じ id への words 追加ができる", () => {
  const customer = "テスト" + "商事";
  const extra = [
    { id: "customer-names", label: "顧客名", flags: "i", words: [customer] },
    { id: "customer-amount", label: "顧客名と同じ行の金額", sameLineAs: "customer-names", patterns: ["[0-9][0-9,]*円", "[¥￥][0-9][0-9,]*"] },
    { id: "personal-email", exclude: ["@corp-sample\\.test$"] },
  ];
  const merged = compileRules(mergeExtraRules(rulesJson, extra));
  assert.equal(rulesJson.rules.length, 9, "元の規則を書き換えない");

  const text = [`${customer}への請求は 120,000円`, "別の行で 5,000円 と書いた", `${customer}について打ち合わせ`, `${fakes["personal-email"]()}`].join("\n");
  const results = scan(text, merged);
  const byId = Object.fromEntries(results.map((r) => [r.ruleId, r]));
  assert.deepEqual(byId["customer-names"].lines, [1, 3]);
  assert.deepEqual(byId["customer-amount"].lines, [1]);
  assert.equal(byId["customer-amount"].count, 1);
  assert.ok(!byId["personal-email"], "exclude を足した規則は当たらなくなる");
});

test("sameLineAs: 前提の規則が空なら、金額だけの行には当たらない", () => {
  const extra = [
    { id: "customer-names", label: "顧客名", words: [] },
    { id: "customer-amount", label: "金額", sameLineAs: "customer-names", patterns: ["[0-9][0-9,]*円"] },
  ];
  assert.deepEqual(scan("請求は 120,000円", compileRules(mergeExtraRules(rulesJson, extra))), []);
});

test("compileRules: 壊れた正規表現・空文字に当たる規則は、中身を出さずに止める", () => {
  const secretWord = "ここは顧客名(";
  assert.throws(
    () => compileRules([{ id: "x", patterns: [secretWord] }]),
    (error) => /規則 x/.test(error.message) && !error.message.includes("顧客名"),
  );
  assert.throws(() => compileRules([{ id: "y", patterns: ["a*"] }]), /規則 y/);
  assert.throws(() => compileRules([{ id: "z", sameLineAs: "none", patterns: ["a"] }]), /sameLineAs/);
});

// ---- コメント本文 ----
test("buildComment: 規則名・行番号・件数だけで、当たった文字を含まない", () => {
  const secrets = Object.values(fakes).map((make) => make());
  const text = secrets.map((s, i) => `行${i} ${s}`).join("\n");
  const findings = scan(text, rules).map((r) => ({ segment: "本文", ...r }));
  assert.ok(findings.length >= 9);
  const body = buildComment({ marker: "<!-- public-content-check -->", kind: "issue", url: "https://example.com/x/1", findings });
  assert.ok(body.startsWith("<!-- public-content-check -->"));
  assert.ok(body.includes("要確認"));
  for (const label of findings.map((f) => f.label)) assert.ok(body.includes(label));
  for (const secret of secrets) assert.ok(!body.includes(secret), "コメントに当たった文字を書かない");
  assert.ok(!body.includes("corp-sample"), "メールのドメインも書かない");
  const ok = buildComment({ marker: "<!-- public-content-check -->", kind: "issue", url: null, findings: [] });
  assert.ok(ok.includes("OK"));
});

test("extractTarget: イベントごとに本文・番号・目印を取り出し、bot は除く", () => {
  const issue = extractTarget("issues", { issue: { number: 3, title: "t", body: "b", html_url: "u" } });
  assert.equal(issue.number, 3);
  assert.equal(issue.marker, "<!-- public-content-check -->");
  const pr = extractTarget("pull_request_target", { pull_request: { number: 4, title: "t", body: "b" } });
  assert.equal(pr.number, 4);
  const comment = extractTarget("issue_comment", { issue: { number: 5 }, comment: { id: 99, body: "c", user: { login: "someone" } } });
  assert.equal(comment.number, 5);
  assert.equal(comment.marker, "<!-- public-content-check:comment-99 -->");
  const review = extractTarget("pull_request_review_comment", { pull_request: { number: 6 }, comment: { id: 7, body: "c", user: { login: "someone" } } });
  assert.equal(review.number, 6);
  assert.equal(review.marker, "<!-- public-content-check:review-comment-7 -->");
  assert.ok(extractTarget("issue_comment", { issue: { number: 5 }, comment: { id: 1, body: "x", user: { login: "github-actions[bot]" } } }).skip);
  assert.equal(extractTarget("push", {}), null);
});

// ---- ローカル HTTP サーバーを GitHub API に見立てた実走 ----
function startFakeGitHub({ failWrites = false, preload = [] } = {}) {
  const state = { comments: [...preload], requests: [], nextId: 1000 };
  const server = http.createServer((req, res) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      const url = new URL(req.url, "http://localhost");
      const body = raw ? JSON.parse(raw) : null;
      state.requests.push({ method: req.method, path: url.pathname, auth: req.headers.authorization, body });
      const send = (code, json) => {
        res.writeHead(code, { "Content-Type": "application/json" });
        res.end(JSON.stringify(json));
      };
      let m;
      if (req.method === "GET" && (m = url.pathname.match(/^\/repos\/o\/r\/issues\/(\d+)\/comments$/))) {
        return send(200, state.comments.filter((c) => c.issue === Number(m[1])));
      }
      if (failWrites && req.method !== "GET") return send(403, { message: "Resource not accessible by integration" });
      if (req.method === "POST" && (m = url.pathname.match(/^\/repos\/o\/r\/issues\/(\d+)\/comments$/))) {
        const comment = { id: state.nextId++, issue: Number(m[1]), body: body.body, user: { login: "github-actions[bot]" } };
        state.comments.push(comment);
        return send(201, comment);
      }
      if (req.method === "PATCH" && (m = url.pathname.match(/^\/repos\/o\/r\/issues\/comments\/(\d+)$/))) {
        const comment = state.comments.find((c) => c.id === Number(m[1]));
        if (!comment) return send(404, { message: "Not Found" });
        comment.body = body.body;
        return send(200, comment);
      }
      return send(404, { message: "Not Found" });
    });
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      resolve({
        state,
        url: `http://127.0.0.1:${server.address().port}`,
        writes: () => state.requests.filter((r) => r.method !== "GET"),
        close: () => new Promise((done) => server.close(done)),
      });
    });
  });
}

function runScript({ eventName, event, apiUrl, extraEnv = {} }) {
  const dir = mkdtempSync(join(tmpdir(), "public-content-check-"));
  const eventPath = join(dir, "event.json");
  writeFileSync(eventPath, JSON.stringify(event));
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [scriptPath], {
      // 実環境の GITHUB_* を引き継がない。
      env: {
        PATH: process.env.PATH,
        GITHUB_EVENT_PATH: eventPath,
        GITHUB_EVENT_NAME: eventName,
        GITHUB_REPOSITORY: "o/r",
        GITHUB_API_URL: apiUrl,
        GITHUB_TOKEN: "test-token",
        ...extraEnv,
      },
    });
    let output = "";
    child.stdout.on("data", (d) => (output += d));
    child.stderr.on("data", (d) => (output += d));
    child.on("close", (code) => {
      rmSync(dir, { recursive: true, force: true });
      resolve({ code, output });
    });
  });
}

const issueEvent = (number, body, title = "題名") => ({ action: "opened", issue: { number, title, body, html_url: `https://example.com/o/r/issues/${number}` } });

test("実走: 当たれば目印コメントを 1 つ作って exit 1、直すと同じコメントを OK に更新して exit 0", async () => {
  const api = await startFakeGitHub();
  try {
    const aws = fakes["aws-access-key"]();
    // 1. 作成
    let r = await runScript({ eventName: "issues", event: issueEvent(7, `背景\n${aws}\n`), apiUrl: api.url });
    assert.equal(r.code, 1, r.output);
    assert.equal(api.writes().length, 1);
    assert.equal(api.writes()[0].method, "POST");
    assert.equal(api.writes()[0].path, "/repos/o/r/issues/7/comments");
    assert.equal(api.writes()[0].auth, "Bearer test-token");
    assert.ok(api.writes()[0].body.body.startsWith("<!-- public-content-check -->"));
    assert.ok(api.writes()[0].body.body.includes("AWS アクセスキー"));
    assert.ok(api.writes()[0].body.body.includes("| 本文 | 2 | 1 |"));
    assert.ok(!api.writes()[0].body.body.includes(aws));
    assert.ok(!r.output.includes(aws), "ログにも当たった文字を出さない");

    // 2. 編集後もまだ当たる → 新規投稿せず同じコメントを更新（行番号が変わる）
    r = await runScript({ eventName: "issues", event: issueEvent(7, `背景\n\n追記\n${aws} ${aws}\n`), apiUrl: api.url });
    assert.equal(r.code, 1, r.output);
    assert.equal(api.writes().length, 2);
    assert.equal(api.writes()[1].method, "PATCH");
    assert.equal(api.writes()[1].path, "/repos/o/r/issues/comments/1000");
    assert.ok(api.writes()[1].body.body.includes("| 本文 | 4 | 2 |"));
    assert.equal(api.state.comments.length, 1);

    // 3. 同じ内容でもう一度 → 変更なしなら書かない
    r = await runScript({ eventName: "issues", event: issueEvent(7, `背景\n\n追記\n${aws} ${aws}\n`), apiUrl: api.url });
    assert.equal(r.code, 1, r.output);
    assert.equal(api.writes().length, 2);

    // 4. 直した → OK に更新して exit 0
    r = await runScript({ eventName: "issues", event: issueEvent(7, "背景\n直した\n"), apiUrl: api.url });
    assert.equal(r.code, 0, r.output);
    assert.equal(api.writes().length, 3);
    assert.equal(api.writes()[2].method, "PATCH");
    assert.ok(api.writes()[2].body.body.includes("OK"));
    assert.ok(api.writes()[2].body.body.startsWith("<!-- public-content-check -->"));
    assert.equal(api.state.comments.length, 1);
  } finally {
    await api.close();
  }
});

test("実走: 当たらず、目印コメントも無いなら何も書かず exit 0", async () => {
  const api = await startFakeGitHub();
  try {
    const r = await runScript({ eventName: "issues", event: issueEvent(8, "Closes #12\nGITHUB_TOKEN を使う\n"), apiUrl: api.url });
    assert.equal(r.code, 0, r.output);
    assert.equal(api.writes().length, 0);
  } finally {
    await api.close();
  }
});

test("実走: タイトルに当たっても検出する（場所はタイトル）", async () => {
  const api = await startFakeGitHub();
  try {
    const r = await runScript({ eventName: "issues", event: issueEvent(9, "本文は普通", `鍵 ${fakes["github-token"]()}`), apiUrl: api.url });
    assert.equal(r.code, 1, r.output);
    assert.ok(api.writes()[0].body.body.includes("| タイトル | 1 | 1 |"));
  } finally {
    await api.close();
  }
});

test("実走: pull_request_target の本文は PR 番号のコメント先へ", async () => {
  const api = await startFakeGitHub();
  try {
    const event = { action: "edited", pull_request: { number: 21, title: "t", body: `概要\n${fakes["slack-token"]()}`, html_url: "https://example.com/o/r/pull/21" } };
    const r = await runScript({ eventName: "pull_request_target", event, apiUrl: api.url });
    assert.equal(r.code, 1, r.output);
    assert.equal(api.writes()[0].path, "/repos/o/r/issues/21/comments");
  } finally {
    await api.close();
  }
});

test("実走: コメント本文とレビューコメントは対象ごとに別の目印コメントを持つ", async () => {
  const api = await startFakeGitHub();
  try {
    const bad = fakes["db-connection-string"]();
    const commentEvent = (id, body) => ({ action: "created", issue: { number: 30 }, comment: { id, body, user: { login: "someone" }, html_url: `https://example.com/c/${id}` } });
    let r = await runScript({ eventName: "issue_comment", event: commentEvent(501, `接続: ${bad}`), apiUrl: api.url });
    assert.equal(r.code, 1, r.output);
    r = await runScript({ eventName: "issue_comment", event: commentEvent(502, `これも ${bad}`), apiUrl: api.url });
    assert.equal(r.code, 1, r.output);
    assert.equal(api.state.comments.length, 2, "コメントごとに 1 つ");
    assert.ok(api.state.comments[0].body.includes("<!-- public-content-check:comment-501 -->"));
    assert.ok(api.state.comments[1].body.includes("<!-- public-content-check:comment-502 -->"));
    // 501 を直しても 502 の通知は変わらない
    r = await runScript({ eventName: "issue_comment", event: { ...commentEvent(501, "直した"), action: "edited" }, apiUrl: api.url });
    assert.equal(r.code, 0, r.output);
    assert.ok(api.state.comments[0].body.includes("OK"));
    assert.ok(api.state.comments[1].body.includes("要確認"));
    // レビューコメント
    const review = { action: "created", pull_request: { number: 31 }, comment: { id: 601, body: bad, user: { login: "someone" } } };
    r = await runScript({ eventName: "pull_request_review_comment", event: review, apiUrl: api.url });
    assert.equal(r.code, 1, r.output);
    assert.equal(api.writes().at(-1).path, "/repos/o/r/issues/31/comments");
    assert.ok(api.writes().at(-1).body.body.includes("<!-- public-content-check:review-comment-601 -->"));
  } finally {
    await api.close();
  }
});

test("実走: github-actions[bot] のコメントは検査せず、API も呼ばない", async () => {
  const api = await startFakeGitHub();
  try {
    const event = { action: "created", issue: { number: 40 }, comment: { id: 700, body: fakes["aws-access-key"](), user: { login: "github-actions[bot]" } } };
    const r = await runScript({ eventName: "issue_comment", event, apiUrl: api.url });
    assert.equal(r.code, 0, r.output);
    assert.equal(api.state.requests.length, 0);
  } finally {
    await api.close();
  }
});

test("実走: 他人が目印だけ真似したコメントは、検査結果の置き場所にしない", async () => {
  const api = await startFakeGitHub({
    preload: [{ id: 1, issue: 50, body: "<!-- public-content-check -->\nなりすまし", user: { login: "someone" } }],
  });
  try {
    const r = await runScript({ eventName: "issues", event: issueEvent(50, fakes["aws-access-key"]()), apiUrl: api.url });
    assert.equal(r.code, 1, r.output);
    assert.equal(api.writes()[0].method, "POST");
    assert.equal(api.state.comments[0].body, "<!-- public-content-check -->\nなりすまし");
  } finally {
    await api.close();
  }
});

test("実走: コメントを書けなくても（権限なし）赤の結果は変えない", async () => {
  const api = await startFakeGitHub({ failWrites: true });
  try {
    const r = await runScript({ eventName: "issues", event: issueEvent(60, fakes["aws-access-key"]()), apiUrl: api.url });
    assert.equal(r.code, 1, r.output);
    assert.ok(r.output.includes("::warning"));
  } finally {
    await api.close();
  }
});

test("実走: 環境変数 PUBLIC_CONTENT_EXTRA_RULES の追加規則が効く（未設定なら何も足さない）", async () => {
  const api = await startFakeGitHub();
  try {
    const customer = "テスト" + "商事";
    const extra = JSON.stringify([
      { id: "customer-names", label: "顧客名", flags: "i", words: [customer] },
      { id: "customer-amount", label: "顧客名と同じ行の金額", sameLineAs: "customer-names", patterns: ["[0-9][0-9,]*円"] },
    ]);
    const event = issueEvent(70, `${customer}の請求は 120,000円\n別の行は 3,000円`);
    // 未設定: 緑
    let r = await runScript({ eventName: "issues", event, apiUrl: api.url });
    assert.equal(r.code, 0, r.output);
    assert.equal(api.writes().length, 0);
    // 設定あり: 赤。顧客名もコメントに書かない
    r = await runScript({ eventName: "issues", event, apiUrl: api.url, extraEnv: { PUBLIC_CONTENT_EXTRA_RULES: extra } });
    assert.equal(r.code, 1, r.output);
    const body = api.writes()[0].body.body;
    assert.ok(body.includes("顧客名 (`customer-names`) | 本文 | 1 | 1 |"));
    assert.ok(body.includes("顧客名と同じ行の金額 (`customer-amount`) | 本文 | 1 | 1 |"));
    assert.ok(!body.includes(customer));
    assert.ok(!r.output.includes(customer));
    // 空文字の secret（未設定相当）は無視
    r = await runScript({ eventName: "issues", event, apiUrl: api.url, extraEnv: { PUBLIC_CONTENT_EXTRA_RULES: "" } });
    assert.equal(r.code, 0, r.output);
  } finally {
    await api.close();
  }
});

test("実走: 壊れた追加規則は exit 2 で、中身をログに出さない", async () => {
  const api = await startFakeGitHub();
  try {
    const leaky = "顧客" + "秘密{";
    const r = await runScript({ eventName: "issues", event: issueEvent(80, "普通"), apiUrl: api.url, extraEnv: { PUBLIC_CONTENT_EXTRA_RULES: leaky } });
    assert.equal(r.code, 2);
    assert.ok(!r.output.includes(leaky));
    const r2 = await runScript({ eventName: "issues", event: issueEvent(80, "普通"), apiUrl: api.url, extraEnv: { PUBLIC_CONTENT_EXTRA_RULES: JSON.stringify([{ id: "bad", words: [], patterns: ["顧客秘密("] }]) } });
    assert.equal(r2.code, 2);
    assert.ok(!r2.output.includes("顧客秘密"));
    assert.equal(api.state.requests.length, 0);
  } finally {
    await api.close();
  }
});

// ---- ワークフローの契約 ----
test("ワークフロー: base だけ使い、最小権限・SHA 固定・追加の認証情報なし", () => {
  const w = readFileSync(join(root, ".github/workflows/public-content-check.yml"), "utf8");
  for (const trigger of ["issues:", "issue_comment:", "pull_request_target:", "pull_request_review_comment:"]) {
    assert.ok(w.includes(trigger), trigger);
  }
  assert.ok(/pull_request_target:\n\s+types: \[opened, edited, reopened\]/.test(w));
  // PR の head を取り出さない: checkout に ref を指定しない
  assert.ok(!/^\s*ref:/m.test(w), "checkout に ref を指定しない");
  assert.ok(!w.includes("github.event.pull_request.head"), "PR の head を参照しない");
  assert.ok(!w.includes("head.sha") && !w.includes("head.ref"));
  // 最小権限
  assert.match(w, /permissions:\n\s+contents: read\n\s+issues: write\n\s+pull-requests: write\n/);
  assert.ok(!/write-all|contents: write/.test(w));
  // 使う secret は GITHUB_TOKEN と、持ち主が任意で入れる PUBLIC_CONTENT_EXTRA_RULES だけ
  const secrets = [...w.matchAll(/secrets\.([A-Za-z0-9_]+)/g)].map((m) => m[1]);
  assert.deepEqual([...new Set(secrets)].sort(), ["GITHUB_TOKEN", "PUBLIC_CONTENT_EXTRA_RULES"]);
  // 本文を run の中へ式展開しない
  assert.ok(!/run:.*\$\{\{\s*github\.event\.(issue|comment|pull_request|review)\.(body|title)/.test(w));
  // actions は SHA 固定
  const uses = [...w.matchAll(/uses:\s*(\S+)/g)].map((m) => m[1]);
  assert.ok(uses.length >= 2);
  for (const u of uses) assert.match(u, /@[0-9a-f]{40}$/, u);
  // bot の除外
  assert.ok(w.includes("github.event.comment.user.login != 'github-actions[bot]'"));
});
