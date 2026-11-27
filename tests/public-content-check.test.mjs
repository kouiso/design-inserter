// 公開内容チェック (.github/scripts/public-content-check.mjs) の単体テストと、
// ローカル HTTP サーバーを GitHub API に見立てた実走テスト。
// 偽の秘密は、TruffleHog や push protection に引っかからないよう、実行時に文字列を組み立てる。
// 実際の GitHub には何も書かない（GITHUB_API_URL をローカルサーバーへ向ける）。
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import http from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const scriptPath = join(root, ".github/scripts/public-content-check.mjs");
const rulesPath = join(root, ".github/public-content-rules.json");
const { scan, compileRules, mergeExtraRules, buildComment, extractTarget, summarizeFindings } = await import(scriptPath);
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
  "stripe-key": () => "sk" + "_live_" + "a1B2c3D4e5F6g7H8i9J0",
  "jwt-bearer": () => "Authorization: Bear" + "er ey" + "Jhbgcioijiuz.abcdefghijkl.mnopqrstuvwx",
  "google-api-key": () => "AI" + "za" + "Sy" + "Ab1".repeat(11),
  "private-key-header": () => "-----BEGIN " + "RSA PRIVATE" + " KEY-----",
  "secret-assignment": () => "pass" + "word" + ' = "' + "Zx9".repeat(8) + '"',
  "db-connection-string": () => "postgres" + "://" + "app_user" + ":" + "S3cr3tPw0rd9" + AT + "db.internal.test:5432/app",
  "personal-email": () => "taro.sample" + AT + "corp-sample.test",
};
const fakeRuleId = (key) => key.replace(/-pat$/, "");

const assignIds = (results) => ids(results).map((id) => (id.startsWith("secret-assignment") ? "secret-assignment" : id));

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
  assert.deepEqual(assignIds(scan(`API_KEY: ${value}`, rules)), ["secret-assignment"]);
  assert.deepEqual(assignIds(scan(`"client_secret": "${value}"`, rules)), ["secret-assignment"]);
  assert.deepEqual(assignIds(scan(`DB_PASSWORD=${value}`, rules)), ["secret-assignment"]);
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
    ["aws-access-key", "github-token", "slack-token", "anthropic-key", "openai-key", "stripe-key", "jwt-bearer", "google-api-key", "private-key-header", "secret-assignment", "secret-assignment-token", "secret-assignment-bare", "secret-assignment-define", "db-connection-string", "personal-email"],
  );
  for (const rule of rulesJson.rules) {
    assert.ok(!("words" in rule), `${rule.id} は words を持たない`);
    assert.ok(!("sameLineAs" in rule), `${rule.id} は sameLineAs を持たない`);
    assert.ok(!("owner" in rule), `${rule.id} は持ち主指定の規則ではない`);
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
  assert.equal(rulesJson.rules.length, 15, "元の規則を書き換えない");
  assert.ok(!rulesJson.rules.some((r) => r.id === "customer-names"));

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
  assert.deepEqual(scan("請求は 120,000円", compileRules(extra)), []);
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
      state.requests.push({ method: req.method, path: url.pathname, search: url.search, auth: req.headers.authorization, body });
      const send = (code, json) => {
        res.writeHead(code, { "Content-Type": "application/json" });
        res.end(JSON.stringify(json));
      };
      let m;
      if (req.method === "GET" && (m = url.pathname.match(/^\/repos\/o\/r\/issues\/(\d+)\/comments$/))) {
        // 本物と同じく per_page / page を見る（page を無視する偽物だと、ページングの不具合を見逃す）。
        const perPage = Number(url.searchParams.get("per_page") ?? 30);
        const page = Number(url.searchParams.get("page") ?? 1);
        return send(200, state.comments.filter((c) => c.issue === Number(m[1])).slice((page - 1) * perPage, page * perPage));
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
    const eventBy = (association) => {
      const event = issueEvent(70, `${customer}の請求は 120,000円\n別の行は 3,000円\n${customer}`);
      event.issue.author_association = association;
      return event;
    };
    // 未設定: 緑
    let r = await runScript({ eventName: "issues", event: eventBy("OWNER"), apiUrl: api.url });
    assert.equal(r.code, 0, r.output);
    assert.equal(api.writes().length, 0);
    // 設定あり・投稿者が持ち主側: 赤。規則名は総称 1 つに、行番号と件数は出す。id も顧客名も書かない
    r = await runScript({ eventName: "issues", event: eventBy("OWNER"), apiUrl: api.url, extraEnv: { PUBLIC_CONTENT_EXTRA_RULES: extra } });
    assert.equal(r.code, 1, r.output);
    const body = api.writes()[0].body.body;
    assert.ok(body.includes("| 持ち主指定の語 | 本文 | 1, 3 | 3 |"), body);
    assert.equal(body.split("持ち主指定の語").length - 1, 1, "総称は 1 行にまとまる");
    for (const hidden of ["customer-names", "customer-amount", "顧客名", customer]) {
      assert.ok(!body.includes(hidden), `${hidden} をコメントに書かない`);
      assert.ok(!r.output.includes(hidden), `${hidden} をログに書かない`);
    }
    assert.ok(r.output.includes("持ち主指定の語"));
    // 設定あり・投稿者が外の人: 行番号も件数も出さず「該当あり」だけ（コメントにもログにも）
    const outsider = await startFakeGitHub();
    try {
      for (const association of ["NONE", "CONTRIBUTOR", "FIRST_TIME_CONTRIBUTOR", undefined]) {
        const o = await runScript({ eventName: "issues", event: eventBy(association), apiUrl: outsider.url, extraEnv: { PUBLIC_CONTENT_EXTRA_RULES: extra } });
        assert.equal(o.code, 1, o.output);
        assert.ok(!o.output.includes("行 1"), o.output);
        assert.ok(o.output.includes("持ち主指定の語 / 該当あり"), o.output);
      }
      const concealed = outsider.state.comments[0].body;
      assert.ok(concealed.includes("| 持ち主指定の語 | 本文 | 非表示 | 該当あり |"), concealed);
      assert.ok(!concealed.includes("1, 3"));
      for (const hidden of ["customer-names", "customer-amount", customer]) assert.ok(!concealed.includes(hidden));
    } finally {
      await outsider.close();
    }
    // 空文字の secret（未設定相当）は無視
    r = await runScript({ eventName: "issues", event: eventBy("OWNER"), apiUrl: api.url, extraEnv: { PUBLIC_CONTENT_EXTRA_RULES: "" } });
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
  // PR 側のコードを取り出さない: checkout の ref は既定の枝を明示する。
  // （pull_request_review / pull_request_review_comment の GITHUB_SHA は PR のマージコミットなので、ref を省いてはいけない）
  const refs = [...w.matchAll(/^\s*ref:\s*(.+)$/gm)].map((m) => m[1].trim());
  assert.deepEqual(refs, ["${{ github.event.repository.default_branch }}"], "checkout の ref は既定の枝だけ");
  assert.match(w, /uses: actions\/checkout@[0-9a-f]{40}[^\n]*\n\s+with:\n\s+ref: \$\{\{ github\.event\.repository\.default_branch \}\}\n/);
  assert.ok(!w.includes("github.event.pull_request.head"), "PR の head を参照しない");
  assert.ok(!/head\.sha|head\.ref|head_ref|github\.sha|refs\/pull|merge_commit_sha/.test(w), "PR の head・merge を参照しない");
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

// ======== レビュー指摘（#119）への対応で足したテスト ========

// ---- 代入の形（WordPress の define、PHP の配列、日本語の語、短い引用符つきの値、記号入りの値） ----
const PW = "pass" + "word";
const secretForms = {
  "define の形（空白あり）": () => `define( 'DB_${PW.toUpperCase()}', '${"Zx9".repeat(4)}' );`,
  "define の形（空白なし）": () => `define('AUTH_KEY','${"Zx9".repeat(8)}');`,
  "define の形（SALT）": () => `define('SECURE_AUTH_SALT', "${"Qw8".repeat(6)}");`,
  "PHP の配列 =>": () => `'${PW}' => '${"Zx9".repeat(3)}',`,
  "日本語の語 パスワード": () => `パスワード: ${"Zx9".repeat(8)}`,
  "日本語の語 暗証番号": () => `暗証番号 = "${"Zx9".repeat(4)}"`,
  "全角コロン": () => `パスワード：${"Zx9".repeat(8)}`,
  "全角コロン（英語の語）": () => `${PW}：${"Zx9".repeat(8)}`,
  "引用符つきの短い値（8 文字以上で記号入り）": () => `${PW} = "P@ssw0rd123"`,
  "引用符なしで記号入りの値": () => `DB_${PW.toUpperCase()}=Tr0ub4dor&3xyzABCDEF12`,
  "値の途中に your を含む": () => `token: "aBcYourZ9xQ1mP2qLr7vT"`,
  "JSON の形": () => `{"client_secret": "${"Zx9".repeat(8)}"}`,
};
for (const [name, make] of Object.entries(secretForms)) {
  test(`secret-assignment: ${name}`, () => {
    const text = make();
    assert.deepEqual(assignIds(scan(`前の行\n${text}\n`, rules)), ["secret-assignment"], text);
  });
}

const notSecretForms = [
  "define( 'DB_" + PW.toUpperCase() + "', '" + PW + "_here' );",
  "define( 'DB_NAME', 'database_name_here' );",
  "define( 'AUTH_KEY', 'put your unique phrase here' );",
  `token: "your-token-abcdefgh"`,
  `api_key = "${"x".repeat(16)}"`,
  `${PW}: "${"*".repeat(12)}"`,
  `token_url: "https://example.com/oauth/token"`,
  `secret: /etc/ssl/private/secret-1234567890.pem`,
  `token: some-long-kebab-case-description-with-2-digits`,
  `${PW}: "short"`,
  `${PW} = "lowercaseonly"`,
  `'${PW}' => $request->input('${PW}'),`,
  "$token = get_option( 'designinserter_token_setting_name' );",
  "パスワードは管理画面の「設定」から変更できます。",
  "token: ${{ secrets.GITHUB_TOKEN }}",
];
for (const text of notSecretForms) {
  test(`secret-assignment: 見本・説明は当たらない (${JSON.stringify(text.slice(0, 30))})`, () => {
    assert.deepEqual(scan(text, rules), [], text);
  });
}

// ---- NFKC と %XX ----
test("scan: 全角の ＠・%40・全角英字でも当たり、行番号は元の行のまま", () => {
  const local = "taro.sample";
  const domain = "corp-sample.test";
  const fullAt = `${local}＠${domain}`;
  const encoded = `${local}%40${domain}`;
  const fullAws = "ＡＫＩＡ" + "X".repeat(16);
  const text = ["普通の行", fullAt, "普通の行", encoded, fullAws].join("\n");
  const byId = Object.fromEntries(scan(text, rules).map((r) => [r.ruleId, r]));
  assert.deepEqual(byId["personal-email"].lines, [2, 4]);
  assert.equal(byId["personal-email"].count, 2, "同じ文字列を形違いで二重に数えない");
  assert.deepEqual(byId["aws-access-key"].lines, [5]);
});

test("scan: words は全角英字でも当たる（NFKC にそろえる）", () => {
  const word = "Cust" + "omerZ";
  const merged = compileRules(mergeExtraRules(rulesJson, [{ id: "w", words: [word] }]));
  const fullWidth = "ＣＵＳＴＯＭＥＲＺ";
  assert.deepEqual(scan(`1行目\n${fullWidth}の件`, merged).map((r) => r.lines), [[2]]);
  assert.deepEqual(scan(word.toLowerCase(), merged).map((r) => r.ruleId), ["w"]);
});

test("scan: URL の資格情報は個人メールとして数えない（接続文字列の規則だけ）", () => {
  const url = "https://" + "someone:pass1234" + AT + "host.test/path";
  assert.deepEqual(scan(url, rules), []);
  assert.deepEqual(ids(scan(fakes["db-connection-string"](), rules)), ["db-connection-string"]);
  assert.deepEqual(ids(scan(`連絡先: mailto:${fakes["personal-email"]()}`, rules)), ["personal-email"]);
});

// ---- 長い 1 行でも遅くならない ----
test("scan: 65536 文字の 1 行で、どの規則も 500ms 未満（二乗に遅くならない）", () => {
  const big = (unit) => unit.repeat(Math.ceil(65536 / unit.length)).slice(0, 65536);
  const units = [
    "a", "a.", "A1", "-", " ", "@", "a@", "a@b.", "a@b.c.", "%40", "%", "ＡＢ",
    "pass" + "word", "pass" + "word=", "pass" + "word: ", "token=a1", "'" + PW + "' => '", "パスワード: ",
    "sk-", "sk-ant-", "gh" + "p_", "github" + "_pat_", "xo" + "xb-", "sk" + "_live_", "AI" + "za", "AK" + "IA",
    "postgres://a:", "postgres://a:b@", "-----BEGIN A ", "Bear" + "er ey" + "Jaaaaaaaaaaa.", "\t", "a\n",
  ];
  for (const rule of rulesJson.rules) {
    const single = compileRules([rule]);
    for (const unit of units) {
      const text = big(unit);
      const start = performance.now();
      scan(text, single);
      const elapsed = performance.now() - start;
      assert.ok(elapsed < 500, `${rule.id} が ${JSON.stringify(unit)} の 65536 文字で ${Math.round(elapsed)}ms かかった`);
    }
  }
  const start = performance.now();
  for (const unit of units) scan(big(unit), rules);
  assert.ok(performance.now() - start < 5000, "全規則を通しても遅くならない");
});

// ---- 追加規則の型の確認 ----
test("compileRules / mergeExtraRules: words・patterns・exclude が文字列の配列でなければ、id だけを出して拒否する", () => {
  const secretWord = "顧客" + "ひみつ";
  for (const [key, value] of [["words", secretWord], ["patterns", secretWord], ["exclude", secretWord], ["words", [secretWord, 1]], ["patterns", { a: secretWord }]]) {
    assert.throws(
      () => mergeExtraRules(rulesJson, [{ id: "bad-rule", [key]: value }]),
      (error) => error.message.includes("bad-rule") && error.message.includes(key) && !error.message.includes(secretWord),
      `${key}`,
    );
  }
  assert.throws(() => compileRules([{ id: "w", words: "abc" }]), /規則 w の words/);
  assert.throws(() => mergeExtraRules(rulesJson, [null]), /規則 #1/);
  assert.throws(() => mergeExtraRules(rulesJson, [{ words: ["a"] }]), /規則 #1/);
  assert.throws(() => mergeExtraRules(rulesJson, { rules: "x" }), /配列ではない/);
  assert.throws(() => mergeExtraRules(rulesJson, [{ id: "l", label: 5 }]), /規則 l の label/);
});

test("実走: 型が違う追加規則は規則の id だけを出して exit 2", async () => {
  const api = await startFakeGitHub();
  try {
    const word = "顧客" + "ひみつ";
    const extra = JSON.stringify([{ id: "my-words", words: word }]);
    const r = await runScript({ eventName: "issues", event: issueEvent(81, "普通"), apiUrl: api.url, extraEnv: { PUBLIC_CONTENT_EXTRA_RULES: extra } });
    assert.equal(r.code, 2, r.output);
    assert.ok(r.output.includes("my-words"));
    assert.ok(!r.output.includes(word));
    assert.equal(api.state.requests.length, 0);
  } finally {
    await api.close();
  }
});

// ---- 持ち主指定の規則の見せ方 ----
test("summarizeFindings: 持ち主指定の規則は総称 1 つにまとめ、外の人には行番号と件数を出さない", () => {
  const hits = [
    { ruleId: "aws-access-key", label: "AWS アクセスキー", lines: [1], count: 1 },
    { ruleId: "cust", label: "顧客名", lines: [2, 5], count: 3 },
    { ruleId: "ban", label: "禁止語", lines: [5, 7], count: 2 },
  ];
  const owner = new Set(["cust", "ban"]);
  const trusted = summarizeFindings([{ segment: "本文", hits }], owner, true);
  assert.deepEqual(trusted.map((f) => f.ruleId), ["aws-access-key", null]);
  assert.deepEqual(trusted[1].lines, [2, 5, 7]);
  assert.equal(trusted[1].count, 5);
  const outsider = summarizeFindings([{ segment: "本文", hits }], owner, false);
  assert.deepEqual(outsider[1], { segment: "本文", ruleId: null, label: "持ち主指定の語", owner: true, concealed: true, lines: [], count: 0 });
  assert.deepEqual(outsider[0].lines, [1], "汎用規則は外の人にも行番号を出す");
  const body = buildComment({ marker: "<!-- m -->", kind: "issue", url: null, findings: outsider });
  assert.ok(body.includes("| 持ち主指定の語 | 本文 | 非表示 | 該当あり |"));
  assert.ok(body.includes("| AWS アクセスキー (`aws-access-key`) | 本文 | 1 | 1 |"));
  assert.ok(!body.includes("顧客名") && !body.includes("禁止語") && !body.includes("cust") && !body.includes("ban"));
});

test("mergeExtraRules: 既存の汎用規則に足した分は持ち主指定にならず、新しい id だけが持ち主指定になる", () => {
  const merged = mergeExtraRules(rulesJson, [{ id: "personal-email", exclude: ["x"] }, { id: "mine", words: ["a"] }]);
  assert.ok(!merged.find((r) => r.id === "personal-email").owner);
  assert.equal(merged.find((r) => r.id === "mine").owner, true);
});

test("extractTarget: author_association を取り出す（無ければ null）", () => {
  assert.equal(extractTarget("issues", { issue: { number: 1, author_association: "OWNER" } }).association, "OWNER");
  assert.equal(extractTarget("pull_request_target", { pull_request: { number: 1, author_association: "NONE" } }).association, "NONE");
  assert.equal(extractTarget("issue_comment", { issue: { number: 1 }, comment: { id: 1, author_association: "MEMBER" } }).association, "MEMBER");
  assert.equal(extractTarget("pull_request_review", { pull_request: { number: 1 }, review: { id: 1, author_association: "COLLABORATOR" } }).association, "COLLABORATOR");
  assert.equal(extractTarget("pull_request_review_comment", { pull_request: { number: 1 }, comment: { id: 1 } }).association, null);
});

// ---- words と patterns の大文字小文字 ----
test("words は大文字小文字を区別せず、flags なしの patterns は区別する", () => {
  const word = "Fo" + "oBar";
  const only = (def, text) => scan(text, compileRules([def])).length;
  assert.equal(only({ id: "w", words: [word] }, word.toLowerCase()), 1);
  assert.equal(only({ id: "w", words: [word] }, word.toUpperCase()), 1);
  assert.equal(only({ id: "w", words: [word], flags: "" }, word.toLowerCase()), 1);
  assert.equal(only({ id: "p", patterns: [word] }, word), 1);
  assert.equal(only({ id: "p", patterns: [word] }, word.toLowerCase()), 0, "flags なしの patterns は区別する");
  assert.equal(only({ id: "p", patterns: [word], flags: "i" }, word.toLowerCase()), 1);
  assert.equal(only({ id: "w", words: ["a.b"] }, "axb"), 0, "words は正規表現として扱わない");
});

// ---- pull_request_review の実走・bot 除外 ----
test("実走: pull_request_review の本文は review ごとの目印コメントで検査する", async () => {
  const api = await startFakeGitHub();
  try {
    const event = { action: "submitted", pull_request: { number: 90 }, review: { id: 4242, body: `LGTM\n${fakes["github-token"]()}`, user: { login: "someone" }, html_url: "https://example.com/o/r/pull/90#r4242" } };
    let r = await runScript({ eventName: "pull_request_review", event, apiUrl: api.url });
    assert.equal(r.code, 1, r.output);
    assert.equal(api.writes()[0].path, "/repos/o/r/issues/90/comments");
    assert.ok(api.writes()[0].body.body.startsWith("<!-- public-content-check:review-4242 -->"));
    assert.ok(api.writes()[0].body.body.includes("| 本文 | 2 | 1 |"));
    r = await runScript({ eventName: "pull_request_review", event: { ...event, action: "edited", review: { ...event.review, body: "直した" } }, apiUrl: api.url });
    assert.equal(r.code, 0, r.output);
    assert.equal(api.writes().at(-1).method, "PATCH");
    assert.ok(api.writes().at(-1).body.body.includes("OK"));
    // 本文なしのレビュー（インラインのコメントだけの承認など）は何も書かない
    r = await runScript({ eventName: "pull_request_review", event: { ...event, pull_request: { number: 91 }, review: { id: 1, body: null, user: { login: "someone" } } }, apiUrl: api.url });
    assert.equal(r.code, 0, r.output);
    assert.equal(api.writes().length, 2);
  } finally {
    await api.close();
  }
});

test("実走: github-actions[bot] のレビューは検査せず、API も呼ばない", async () => {
  const api = await startFakeGitHub();
  try {
    const event = { action: "submitted", pull_request: { number: 92 }, review: { id: 9, body: fakes["aws-access-key"](), user: { login: "github-actions[bot]" } } };
    const r = await runScript({ eventName: "pull_request_review", event, apiUrl: api.url });
    assert.equal(r.code, 0, r.output);
    assert.equal(api.state.requests.length, 0);
  } finally {
    await api.close();
  }
});

// ---- ページング ----
test("実走: 目印コメントが 101 件目以降にあっても、ページをたどって同じコメントを更新する", async () => {
  const preload = [];
  for (let i = 1; i <= 130; i += 1) preload.push({ id: i, issue: 95, body: `ふつうのコメント ${i}`, user: { login: "someone" } });
  preload.push({ id: 5000, issue: 95, body: "<!-- public-content-check -->\n## 公開内容チェック: 要確認\n古い内容", user: { login: "github-actions[bot]" } });
  const api = await startFakeGitHub({ preload });
  try {
    const r = await runScript({ eventName: "issues", event: issueEvent(95, fakes["aws-access-key"]()), apiUrl: api.url });
    assert.equal(r.code, 1, r.output);
    const gets = api.state.requests.filter((q) => q.method === "GET");
    assert.deepEqual(gets.map((q) => q.search), ["?per_page=100&page=1", "?per_page=100&page=2"]);
    assert.equal(api.writes().length, 1);
    assert.equal(api.writes()[0].method, "PATCH");
    assert.equal(api.writes()[0].path, "/repos/o/r/issues/comments/5000");
    assert.equal(api.state.comments.length, 131, "新しいコメントを作らない");
  } finally {
    await api.close();
  }
});

// ---- 21 行以上の当たり ----
test("実走: 21 行以上に当たったら、行番号は 20 個までにして残りは件数で示す", async () => {
  const api = await startFakeGitHub();
  try {
    const aws = fakes["aws-access-key"]();
    const body = Array.from({ length: 25 }, (_, i) => `${i + 1} 行目 ${aws}`).join("\n");
    const r = await runScript({ eventName: "issues", event: issueEvent(96, body), apiUrl: api.url });
    assert.equal(r.code, 1, r.output);
    const shown = Array.from({ length: 20 }, (_, i) => i + 1).join(", ");
    assert.ok(api.writes()[0].body.body.includes(`| 本文 | ${shown} ほか 5 行 | 25 |`), api.writes()[0].body.body);
    assert.ok(r.output.includes("ほか 5 行"));
  } finally {
    await api.close();
  }
});

// ---- ログへの出力（改行でログの命令を偽造されない） ----
test("実走: 改行を含むエラーも、ログでは 1 行にして命令を偽造させない", async () => {
  const api = await startFakeGitHub();
  try {
    // 設定を読めない場合
    let r = await runScript({ eventName: "issues", event: issueEvent(97, "普通"), apiUrl: api.url, extraEnv: { GITHUB_EVENT_PATH: "/no/such/event.json\n::error::injected" } });
    assert.equal(r.code, 2, r.output);
    assert.ok(r.output.includes("%0A"));
    assert.ok(!/^::error::injected/m.test(r.output), r.output);
    // API が失敗した場合（パスに改行が入る）
    r = await runScript({ eventName: "issues", event: issueEvent(97, fakes["aws-access-key"]()), apiUrl: api.url, extraEnv: { GITHUB_REPOSITORY: "o/r\n::warning::injected" } });
    assert.equal(r.code, 1, r.output);
    assert.ok(r.output.includes("::warning title=公開内容チェック::コメントを書けませんでした"));
    assert.ok(!/^::warning::injected/m.test(r.output), r.output);
    // 対象外のイベント名
    r = await runScript({ eventName: "push\n::error::injected", event: {}, apiUrl: api.url });
    assert.equal(r.code, 0, r.output);
    assert.ok(!/^::error::injected/m.test(r.output), r.output);
  } finally {
    await api.close();
  }
});

// ---- ワークフローの契約（レビュー系イベント） ----
test("ワークフロー: pull_request_review の起動と bot 除外、既定の枝の checkout、リリース前の安全な空振り", () => {
  const w = readFileSync(join(root, ".github/workflows/public-content-check.yml"), "utf8");
  assert.match(w, /pull_request_review:\n\s+types: \[submitted, edited\]/);
  assert.match(w, /pull_request_review_comment:\n\s+types: \[created, edited\]/);
  assert.ok(w.includes("github.event.review.user.login != 'github-actions[bot]'"));
  assert.ok(w.includes("github.event.comment.user.login != 'github-actions[bot]'"));
  assert.ok(w.includes("github.event.review.id"), "review ごとに直列化する");
  assert.match(w, /\[ ! -f \.github\/scripts\/public-content-check\.mjs \]/, "既定の枝にスクリプトが無い間は空振りする");
  assert.ok(w.includes("PR 側の版"), "レビュー系イベントではワークフロー定義が PR 側になる、と書いてある");
});

// ======== 再レビュー（#119）への対応で足したテスト ========

// ---- 1: 取りこぼしていた代入の形 ----
const moreSecretForms = {
  "define の長い値（$ ^ & * % # @ ! を含む）": () => "define('NONCE_" + "SALT', 'q8#Lk2@fP!x9zR$mW3^vB7&nH5*tY1%c');",
  "define の PASSWORD は小文字だけの値でも当たる": () => `define( 'DB_${PW.toUpperCase()}', 'correcthorsebattery' );`,
  "パスワード（引用符なし 8 文字以上）": () => "パスワード: Xk9mP2qLr7vT",
  "パスワードは（日本語の名前だけ）": () => "パスワードは Xk9mP2qLr7vT です",
  "パスワード＝（全角の等号）": () => "パスワード＝Xk9mP2qLr7vT",
  "password: 引用符なし 8 文字以上": () => `${PW}: Xk9mP2qLr7vT`,
  "passwd = 引用符なし": () => "pass" + "wd = Xk9mP2qLr7vT",
  "token は引用符つき 16 文字以上": () => `token: "${"Zx9".repeat(6)}"`,
  "token は引用符なしなら 32 文字以上": () => "TOKEN=5f4dcc3b5aa765d61d8327deb882cf99",
  "数字だけの引用符つき値（桁数が 8 以上）": () => `${PW}: "12345678"`,
};
for (const [name, make] of Object.entries(moreSecretForms)) {
  test(`secret-assignment（再レビュー）: ${name}`, () => {
    const text = make();
    const results = scan(`前の行\n${text}\n`, rules);
    assert.deepEqual(assignIds(results), ["secret-assignment"], text);
    assert.equal(results[0].count, 1, "複数の patterns に当たっても 1 件");
    assert.deepEqual(results[0].lines, [2]);
  });
}

const moreNotSecret = [
  'token: "color.primary.500"',
  '"token": "2024-01-01"',
  "cache_token: 'di-v1.2.0'",
  "esc_html__( 'Invalid token', 'designinserter-admin' )",
  "トークンは GitHubActions2024Workflow で使う",
  "トークン: GitHubActions2024Workflow",
  'api_key: "YOUR-API-KEY-1234"',
  'api_key: "sk-xxxxxxxxxxxxxxxx"',
  "define( 'DESIGNINSERTER_VERSION_KEY', 'designinserter_version' );",
  `${PW}: Required`,
  `${PW}: \${DB_${PW.toUpperCase()}}`,
  "token: abc123",
  "「パスワード」は管理画面で変更できます。",
];
for (const text of moreNotSecret) {
  test(`secret-assignment（再レビュー）: 誤検知しない (${JSON.stringify(text.slice(0, 30))})`, () => {
    assert.deepEqual(scan(text, rules), [], text);
  });
}

// ---- 2: 汎用規則に足せるのは exclude / excludeBefore だけ ----
test("mergeExtraRules: 汎用規則の id に words / patterns を足そうとすると、id だけを出して拒否する", () => {
  const secretWord = "顧客" + "ひみつ";
  for (const generic of ["personal-email", "secret-assignment", "aws-access-key"]) {
    for (const key of ["words", "patterns", "label", "flags", "sameLineAs"]) {
      const value = key === "words" || key === "patterns" ? [secretWord] : secretWord;
      assert.throws(
        () => mergeExtraRules(rulesJson, [{ id: generic, [key]: value }]),
        (error) => error.message.includes(generic) && error.message.includes("exclude") && !error.message.includes(secretWord),
        `${generic} / ${key}`,
      );
    }
  }
  // exclude / excludeBefore は足せる
  const merged = mergeExtraRules(rulesJson, [{ id: "personal-email", exclude: ["@corp-sample\\.test$"], excludeBefore: ["x$"] }]);
  const email = merged.find((r) => r.id === "personal-email");
  assert.ok(email.exclude.includes("@corp-sample\\.test$"));
  assert.ok(email.excludeBefore.includes("x$"));
  assert.ok(!email.owner);
  assert.deepEqual(scan(fakes["personal-email"](), compileRules(merged)), []);
});

test("実走: 汎用規則に words を足した追加規則は、規則の id だけを出して exit 2", async () => {
  const api = await startFakeGitHub();
  try {
    const word = "顧客" + "ひみつ";
    const extra = JSON.stringify([{ id: "personal-email", words: [word] }]);
    const r = await runScript({ eventName: "issues", event: issueEvent(82, "普通"), apiUrl: api.url, extraEnv: { PUBLIC_CONTENT_EXTRA_RULES: extra } });
    assert.equal(r.code, 2, r.output);
    assert.ok(r.output.includes("personal-email"));
    assert.ok(!r.output.includes(word));
    assert.equal(api.state.requests.length, 0);
  } finally {
    await api.close();
  }
});

// ---- 3: クエリ・フラグメントのメールは URL の資格情報として除外しない ----
test("メール: URL の資格情報だけを除き、クエリ・フラグメント・パスの後ろのメールは当てる", () => {
  const mail = "taro.sample" + AT + "corp-sample.test";
  for (const text of [
    `https://forms.test?email=${mail}`,
    `https://forms.test/path?a=1&cc=${mail}`,
    `https://forms.test/path#${mail}`,
    `https://forms.test/${mail}`,
  ]) {
    assert.deepEqual(ids(scan(text, rules)), ["personal-email"], text);
  }
  assert.deepEqual(scan(`https://someone:pass1234${AT}host.test/x`, rules), []);
  assert.deepEqual(scan(`https://someone${AT}host.test/x`, rules), [], "user@host の形（パスワードなし）も資格情報");
});

// ---- 6: 件数・文脈の長さ・全角の持ち主の語 ----
test("scan: 全角を含む行でも、形違いで二重に数えない", () => {
  const aws = fakes["aws-access-key"]();
  const fullAws = "ＡＫＩＡ" + "X".repeat(16);
  const mail = "taro.sample" + AT + "corp-sample.test";
  const text = [`半角 ${aws}`, `全角 ${fullAws}`, `両方 ${aws} と ${fullAws}`, `全角メール taro.sample＠corp-sample.test と ${mail}`].join("\n");
  const byId = Object.fromEntries(scan(text, rules).map((r) => [r.ruleId, r]));
  assert.deepEqual(byId["aws-access-key"].lines, [1, 2, 3]);
  assert.equal(byId["aws-access-key"].count, 1 + 1 + 2);
  assert.deepEqual(byId["personal-email"].lines, [4]);
  assert.equal(byId["personal-email"].count, 2);
});

test("メール: URL の資格情報の判定は直前 256 文字まで（それより前の :// は見ない）", () => {
  const mail = "taro.sample" + AT + "corp-sample.test";
  const near = `://${"a".repeat(100)}:${mail}`;
  const far = `://${"a".repeat(300)}:${mail}`;
  assert.deepEqual(scan(near, rules), [], "256 文字以内の :// は資格情報として除く");
  assert.deepEqual(ids(scan(far, rules)), ["personal-email"], "256 文字より前の :// は見ないので当たる");
});

test("scan: 全角で書いた持ち主の語は、半角の本文にも当たる（NFKC）", () => {
  const fullWidthWord = "ＣＵＳＴＯＭＥＲＺ";
  const merged = compileRules(mergeExtraRules(rulesJson, [{ id: "mine", words: [fullWidthWord] }]));
  assert.deepEqual(scan("1\ncustomerz の件", merged).map((r) => r.lines), [[2]]);
  assert.deepEqual(scan("1\nＣＵＳＴＯＭＥＲＺ の件", merged).map((r) => r.lines), [[2]]);
  assert.deepEqual(scan("1\nｃｕｓｔｏｍｅｒｚ の件", merged).map((r) => r.lines), [[2]]);
});

// ---- 5: スクリプトが無いときの扱い（ワークフローの run の分岐を実際に動かす） ----
test("ワークフロー: 既定の枝にスクリプトが無い時、成功で終わるのは review 系の 2 イベントだけ", () => {
  const w = readFileSync(join(root, ".github/workflows/public-content-check.yml"), "utf8");
  const block = w.slice(w.indexOf("run: |\n", w.indexOf("Scan issue / PR / comment text")) + "run: |\n".length);
  const script = block.split("\n").map((line) => line.replace(/^ {10}/, "")).join("\n");
  assert.ok(script.includes("node .github/scripts/public-content-check.mjs"));
  const dir = mkdtempSync(join(tmpdir(), "public-content-missing-"));
  try {
    const exitFor = (eventName) => spawnSync("bash", ["-c", script], { cwd: dir, env: { PATH: process.env.PATH, GITHUB_EVENT_NAME: eventName }, encoding: "utf8" });
    for (const name of ["pull_request_review", "pull_request_review_comment"]) {
      const r = exitFor(name);
      assert.equal(r.status, 0, name);
      assert.ok(r.stdout.includes("::notice::"));
    }
    for (const name of ["issues", "issue_comment", "pull_request_target"]) {
      const r = exitFor(name);
      assert.equal(r.status, 1, name);
      assert.ok(r.stdout.includes("::error::"), name);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ======== 三回目のレビュー（#119）への対応で足したテスト ========

// ---- 1: ドット区切りの除外は token の規則だけ。password / api_key / define には効かない ----
const dottedSecretForms = {
  "引用符つきの password（ドット入り）": () => `${PW}: "Summer.2024"`,
  "引用符なしの password（ドット入り）": () => `${PW}: hunter2.secret`,
  "api_key（ドット区切りの 3 部分）": () => `api_key: "abC123.dEf456.gHi789"`,
  "define の PASSWORD（ドット入り）": () => `define( 'DB_${PW.toUpperCase()}', 'my.pass.2024' );`,
};
for (const [name, make] of Object.entries(dottedSecretForms)) {
  test(`secret-assignment（ドット区切り）: ${name} は当たる`, () => {
    const text = make();
    const results = scan(text, rules);
    assert.equal(results.length, 1, text);
    assert.ok(results[0].ruleId.startsWith("secret-assignment"), results[0].ruleId);
    assert.equal(results[0].count, 1);
  });
}

test("規則ファイル: ドット区切りの除外を持つのは token の規則だけ", () => {
  const withDotted = rulesJson.rules.filter((r) => (r.exclude ?? []).some((e) => e.includes("(?:\\.")) && r.id.startsWith("secret-assignment")).map((r) => r.id);
  assert.deepEqual(withDotted, ["secret-assignment-token"]);
});

// ---- 2: 当たらない側 ----
const stillNotSecret = [
  "define( 'DI_META_KEY', '_di_meta_v2' );",
  "define( 'DI_CACHE_KEY', 'di-cache-2' );",
  "define( 'MONKEY', 'banana-42' );",
  "define( 'AUTH_KEY_VERSION', 'v2-2024-01' );",
  "pwd: ~/work/design-inserter",
  "pwd " + "= ~/work/design-inserter",
  `${PW}_policy: min8+symbol`,
  `${PW}: PasswordHash256;`,
  `${PW}: PBKDF2-SHA256`,
  "パスワードは PBKDF2-SHA256 でハッシュ化する",
  "パスワードは password123 のように推測しやすいものを禁止",
  `${PW} = process.env.DB_${PW.toUpperCase()}_V2`,
];
for (const text of stillNotSecret) {
  test(`secret-assignment（誤検知）: 当たらない (${JSON.stringify(text.slice(0, 34))})`, () => {
    assert.deepEqual(scan(text, rules), [], text);
  });
}

test("secret-assignment: define の KEY / SALT は大文字小文字を区別し、WordPress の鍵と …_SECRET_KEY だけ当てる", () => {
  const v = "Zx9Zx9Zx9Zx9";
  for (const name of ["AUTH_KEY", "SECURE_AUTH_KEY", "LOGGED_IN_KEY", "NONCE_KEY", "AUTH_SALT", "SECURE_AUTH_SALT", "LOGGED_IN_SALT", "NONCE_SALT", "JWT_SECRET_KEY"]) {
    assert.deepEqual(ids(scan(`define( '${name}', '${v}' );`, rules)), ["secret-assignment-define"], name);
  }
  assert.deepEqual(scan(`define( 'auth_key', '${v}' );`, rules), [], "小文字の定数名には当てない");
  assert.deepEqual(scan(`define( 'MY_API_KEY', '${v}' );`, rules), [], "WordPress の鍵ではない KEY は当てない");
  assert.deepEqual(ids(scan(`define( 'DB_${PW.toUpperCase()}', 'lowercaseonly' );`, rules)), ["secret-assignment-define"], "…PASSWORD は値が何でも当てる");
});


// ---- 3: 追加規則の項目名と空の規則 ----
test("mergeExtraRules: 知らない項目名は、規則の id と項目名だけを出して拒否する", () => {
  const secretWord = "顧客" + "ひみつ";
  for (const key of ["word", "description", "category", "owner", "excludeCaseSensitive", "pattern"]) {
    assert.throws(
      () => mergeExtraRules(rulesJson, [{ id: "my-rule", words: ["a"], [key]: secretWord }]),
      (error) => error.message.includes("my-rule") && error.message.includes(key) && !error.message.includes(secretWord),
      key,
    );
  }
  // 汎用規則に知らない項目を足しても同じ
  assert.throws(() => mergeExtraRules(rulesJson, [{ id: "personal-email", exclude: ["x"], wordz: ["a"] }]), /personal-email.*wordz/);
  // 許される項目だけなら通る
  assert.doesNotThrow(() => mergeExtraRules(rulesJson, [{ id: "ok", label: "l", flags: "i", words: ["a"], patterns: ["b"], exclude: ["c"], excludeBefore: ["d"], sameLineAs: "personal-email" }]));
});

test("mergeExtraRules: words も patterns も空の新しい規則は拒否する", () => {
  for (const def of [{ id: "empty-1" }, { id: "empty-2", words: [] }, { id: "empty-3", words: [], patterns: [] }, { id: "empty-4", words: [""], patterns: [""] }, { id: "empty-5", exclude: ["x"] }]) {
    assert.throws(() => mergeExtraRules(rulesJson, [def]), new RegExp(`規則 ${def.id} は words も patterns も空`), def.id);
  }
  assert.doesNotThrow(() => mergeExtraRules(rulesJson, [{ id: "one", patterns: ["a"] }]));
});

test("実走: 知らない項目名・空の規則の追加規則は、規則の id と項目名だけを出して exit 2", async () => {
  const api = await startFakeGitHub();
  try {
    const word = "顧客" + "ひみつ";
    const cases = [
      [[{ id: "typo-rule", word: [word] }], "typo-rule", "word"],
      [[{ id: "empty-rule", words: [] }], "empty-rule", "words も patterns も空"],
    ];
    for (const [extra, id, detail] of cases) {
      const r = await runScript({ eventName: "issues", event: issueEvent(83, "普通"), apiUrl: api.url, extraEnv: { PUBLIC_CONTENT_EXTRA_RULES: JSON.stringify(extra) } });
      assert.equal(r.code, 2, r.output);
      assert.ok(r.output.includes(id) && r.output.includes(detail), r.output);
      assert.ok(!r.output.includes(word));
    }
    assert.equal(api.state.requests.length, 0);
  } finally {
    await api.close();
  }
});

// ---- 4: 重なりを 1 件にまとめる ----
test("scan: 同じ場所に複数の patterns が当たっても 1 件（重なりをまとめる）", () => {
  const results = scan(`${PW}: Xk9mP2qLr7vTzz88aaQQ`, rules);
  assert.equal(results.length, 1);
  assert.equal(results[0].count, 1);
  assert.deepEqual(results[0].lines, [1]);
  // 規則 1 つに、重なる patterns を 2 つ持たせた場合
  const overlap = compileRules([{ id: "o", patterns: ["abc\\d+", "bc\\d+", "c\\d+"] }]);
  assert.equal(scan("abc123", overlap)[0].count, 1);
  assert.equal(scan("abc123 abc456", overlap)[0].count, 2, "離れた 2 か所は 2 件");
  assert.equal(scan("abc123abc456", overlap)[0].count, 2, "隣り合う別の当たりは 2 件");
});

// ======== 四回目のレビュー（#119）への対応で足したテスト ========
// secret-assignment-bare: 型の注記の形（英語の password: / password?: の直後で、値の後ろが ; , | ) > [ か行末）だけ、
// パスカルケースと全部大文字の名前を除く。= ＝ は と日本語の名前には効かせない。

const bareHits = {
  "日本語の名前: 単語＋数字": () => "パスワード: Tanaka1985",
  "日本語の名前 + は": () => "パスワードは Kouiso2024 です",
  "= の形: 単語＋数字": () => `DB_${PW.toUpperCase()}=Summer2024`,
  "= の形: パスカルケース": () => `ADMIN_${PW.toUpperCase()}=SummerTime2024`,
  "= の形: 大文字の名前に見える値": () => `${PW}=Passw0rd123`,
  "英語のコロン: 名前の直後が pass で始まる値": () => `${PW}: passXk9mP2qL`,
  "名前の後ろに _PROD": () => `${PW.toUpperCase()}_PROD=Xk9mP2qLr7`,
  "名前の前後に付く語（DB_ … _PRODUCTION）": () => `DB_${PW.toUpperCase()}_PRODUCTION=Xk9mP2qLr7`,
  "名前の後ろに ForAdmin（admin の中の min は除外語ではない）": () => `${PW}ForAdmin: Xk9mP2qLr7`,
  "名前の後ろに数字": () => `${PW}2=Xk9mP2qLr7`,
  "英語のコロン: 後ろに文章が続く（型の注記ではない）": () => `${PW}: Summer2024 です`,
  "= の形: 後ろが ;": () => `${PW} = Summer2024;`,
  "英語のコロン: 型の注記ではない値（行末）": () => `${PW}: Xk9mP2qLr7vT`,
  "英語の ?: の形": () => `${PW}?: xk9mp2qlr7;`,
  "pwd は = の形": () => "pwd = Xk9mP2qLr7",
};
for (const [name, make] of Object.entries(bareHits)) {
  test(`secret-assignment-bare（再々レビュー）: 当たる: ${name}`, () => {
    const text = make();
    const results = scan(text, rules);
    assert.deepEqual(ids(results), ["secret-assignment-bare"], text);
    assert.equal(results[0].count, 1);
  });
}

const bareMisses = {
  "英語のコロン + ; の前のパスカルケース": () => `${PW}: PasswordHash256;`,
  "英語の ?: + | の前のパスカルケース": () => `${PW}?: PasswordHash256 | null;`,
  "hash を含む名前": () => `${PW}_hash=Xk9mP2qLr7`,
  "policy を含む名前": () => `${PW}_policy: min8+symbol`,
  "min / length を含む名前": () => `${PW}_min_length: 8chars12`,
  "日本語の名前 + アルゴリズム名": () => "パスワードは PBKDF2-SHA256 でハッシュ化する",
  "日本語の名前 + password で始まる例": () => "パスワードは password123 のように推測しやすいものを禁止",
  "値が password だけ（数字つき）": () => `${PW}=${PW}123`,
  "process.env の参照": () => `${PW} = process.env.DB_${PW.toUpperCase()}_V2`,
  "pwd の ~ パス": () => "pwd = ~/work/design-inserter",
  "pwd は : の形では当てない": () => "pwd: Xk9mP2qLr7",
};
for (const [name, make] of Object.entries(bareMisses)) {
  test(`secret-assignment-bare（再々レビュー）: 当たらない: ${name}`, () => {
    const text = make();
    assert.deepEqual(scan(text, rules), [], text);
  });
}


// ======== 五回目のレビュー（#119）への対応で足したテスト ========
// 型の注記とみなすのは、(a) 値の後ろが ; > [ のとき、(b) 値が型らしい語尾（Hash / Digest / Type / String / Str / Array / Buffer /
// Bytes / Field / Input / Value + 数字）で終わり、後ろが , | ) か行末のとき。| ) , と行末は、型らしい語尾を要求する。

const fifthHits = {
  "行末の単語＋数字": () => `${PW}: Summer2024`,
  "リストの行頭の - つき": () => `- ${PW}: Summer2024`,
  "別の項目と同じ行": () => `user: admin, ${PW}: Summer2024`,
  "後ろがコンマだけ": () => `${PW}: Summer2024,`,
  "かっこの中": () => `(${PW}: Summer2024)`,
  "後ろが | だけ（表の区切りか型の合併か区別できないので、型らしい語尾が無ければ当てる）": () => `${PW}: Summer2024 |`,
  "行末の大文字と数字": () => `${PW}: AB12CD34EF`,
  "Pass 始まりの値（大文字）": () => `${PW}: Pass1234`,
  "pass 始まりの値（小文字）": () => `${PW}: pass1234`,
  "password を含む値（2024）": () => `${PW}: ${PW}2024`,
  "名前に CONFIRM": () => `${PW.toUpperCase()}_CONFIRM=Xk9mP2qLr7`,
  "名前に _confirmation": () => `${PW}_confirmation: Xk9mP2qLr7`,
  "マークダウンの表（英語）": () => `| ${PW} | Summer2024 |`,
  "マークダウンの表（日本語）": () => "| パスワード | Xk9mP2qLr7vT |",
  "表の行頭に別の列がある": () => `| admin | ${PW} | Xk9mP2qLr7vT | 本番 |`,
};
for (const [name, make] of Object.entries(fifthHits)) {
  test(`secret-assignment-bare（五回目）: 当たる: ${name}`, () => {
    const text = make();
    const results = scan(text, rules);
    assert.deepEqual(ids(results), ["secret-assignment-bare"], text);
    assert.equal(results[0].count, 1);
  });
}

const fifthMisses = {
  "行末の型名（Hash + 数字）": () => `${PW}: PasswordHash256`,
  "行末の型名（Str）": () => `${PW}: SecretStr`,
  "; の前の配列型": () => `${PW}: Uint8Array;`,
  "コンマの前の型名（String）": () => `${PW}: Base64String,`,
  "| の前の型名（Digest）と ?:": () => `${PW}?: Sha256Digest | null;`,
  "行末の型名（Argon2Hash）": () => `${PW}: Argon2Hash`,
  "readonly つきの行末の型名": () => `readonly ${PW}: Uint8Array`,
  "かっこの中の型名": () => `login(${PW}: SecretStr)`,
  "; の前のパスカルケース": () => `${PW}: PasswordHash256;`,
  "見本によく使われる弱い値": () => `パスワードは ${PW}123 のように推測しやすいものを禁止`,
  "表の見出し行（説明）": () => `| ${PW} | 説明 |`,
  "表の見出し行（英語の説明）": () => `| ${PW} | Description |`,
  "表の見出し行（日本語の名前）": () => "| パスワード | 説明 |",
  "表の見出し行（別の列）": () => `| Field | ${PW} | Description |`,
  "表の区切り行": () => `| ${PW} | --- |`,
  "表の区切りだけの行": () => "| --- | --- |",
};
for (const [name, make] of Object.entries(fifthMisses)) {
  test(`secret-assignment-bare（五回目）: 当たらない: ${name}`, () => {
    const text = make();
    assert.deepEqual(scan(text, rules), [], text);
  });
}

test("secret-assignment-bare: 型の注記の判断（; > [ は無条件、, | ) と行末は型らしい語尾が必要）", () => {
  const plain = "Summer2024"; // パスカルケースだが型らしい語尾を持たない
  const typeLike = "Summer2024Value"; // 型らしい語尾を持つ
  // 無条件の後ろ: 型らしい語尾が無くても注記
  for (const tail of [";", " ;", ">", "["]) {
    assert.deepEqual(scan(`${PW}: ${plain}${tail}`, rules), [], JSON.stringify(tail));
  }
  // 型らしい語尾が必要な後ろ: 無ければ当たる、あれば注記
  for (const tail of [",", " |", ")", ""]) {
    assert.deepEqual(ids(scan(`${PW}: ${plain}${tail}`, rules)), ["secret-assignment-bare"], `plain ${JSON.stringify(tail)}`);
    assert.deepEqual(scan(`${PW}: ${typeLike}${tail}`, rules), [], `typeLike ${JSON.stringify(tail)}`);
  }
  // 文章が続く形は注記ではない
  for (const tail of [" です", " # メモ", "。", " (本番)", " end"]) {
    assert.deepEqual(ids(scan(`${PW}: ${plain}${tail}`, rules)), ["secret-assignment-bare"], JSON.stringify(tail));
  }
});

test("secret-assignment-bare: 除外は password / passwd / pass だけと、弱い見本の password1〜password1234", () => {
  for (const sample of ["pass", "password", "passwd", "password1", "password12", "password123", "password1234"]) {
    assert.deepEqual(scan(`${PW}=${sample}`, rules).filter((r) => r.ruleId === "secret-assignment-bare"), [], sample);
  }
  for (const real of ["Pass1234", "pass1234", "password2024", "password12345", "Passw0rd123"]) {
    assert.deepEqual(ids(scan(`${PW}=${real}`, rules)), ["secret-assignment-bare"], real);
  }
});

test("secret-assignment-bare: 表の区切り | は password 系と日本語の名前だけ（pwd・secret には使わない）", () => {
  assert.deepEqual(scan("| pwd | Xk9mP2qLr7vT |", rules), []);
  assert.deepEqual(scan("| token | Xk9mP2qLr7vT |", rules), []);
  assert.deepEqual(ids(scan("| パスワード | Xk9mP2qLr7vT |", rules)), ["secret-assignment-bare"]);
  assert.deepEqual(ids(scan(`| ${PW} | Xk9mP2qLr7vT |`, rules)), ["secret-assignment-bare"]);
});

// ======== 六回目のレビュー（#119）への対応で足したテスト ========
// Markdown の `コード` と **強調** を除いた形でも照合する。名前の直後の注記（本番）を許す。
// | は、行頭が | の表の行の形のときだけ区切りとして認める。

const BT = String.fromCharCode(96); // バッククォート
const markdownHits = {
  "コードの英語 password": () => `${PW}: ${BT}Summer2024${BT}`,
  "コードの日本語 パスワード": () => `パスワード: ${BT}Xk9mP2qLr7vT${BT}`,
  "表の中のコード": () => `| パスワード | ${BT}Xk9mP2qLr7vT${BT} |`,
  "リストの中のコード": () => `- パスワード: ${BT}Xk9mP2qLr7vT${BT}`,
  "= の形のコード": () => `DB_${PW.toUpperCase()}=${BT}Xk9mP2qLr7vT${BT}`,
  "api_key のコード（引用符なし 20 文字）": () => `api_key: ${BT}Ab12Cd34Ef56Gh78Ij90${BT}`,
  "secret のコード（引用符なし 22 文字）": () => `secret: ${BT}Ab12Cd34Ef56Gh78Ij90Kl${BT}`,
  "強調された名前": () => "**パスワード**: Xk9mP2qLr7vT",
  "名前の直後の注記（日本語）": () => "パスワード（本番）: Xk9mP2qLr7vT",
  "名前の直後の注記（半角かっこ・英語）": () => `${PW} (prod): Xk9mP2qLr7vT`,
  "名前の直後の注記（api_key の引用符つき）": () => `api_key (本番): "Ab12Cd34Ef56Gh78Ij90"`,
  "強調された英語の名前とコード": () => `**${PW}**: ${BT}Xk9mP2qLr7vT${BT}`,
  "表の強調された名前": () => "| **パスワード** | Xk9mP2qLr7vT |",
  "アンダースコアの強調": () => "__パスワード__: Xk9mP2qLr7vT",
};
for (const [name, make] of Object.entries(markdownHits)) {
  test(`Markdown（六回目）: 当たる: ${name}`, () => {
    const text = make();
    const results = scan(text, rules);
    assert.equal(results.length, 1, text);
    assert.ok(results[0].ruleId.startsWith("secret-assignment"), results[0].ruleId);
    assert.equal(results[0].count, 1, "形違いの照合で二重に数えない");
    assert.deepEqual(results[0].lines, [1]);
  });
}

test("Markdown: 行番号は元の行のまま（飾りを除いた形でも）", () => {
  const text = ["# 見出し", "", `パスワード: ${BT}Xk9mP2qLr7vT${BT}`, "**説明**"].join("\n");
  assert.deepEqual(scan(text, rules).map((r) => r.lines), [[3]]);
});

// これまでの「当たらない」例が、バッククォートや強調で包んでも当たらないこと
test("Markdown: これまでの「当たらない」例を `コード` や **強調** で包んでも当たらない", () => {
  const lists = [
    notSecretForms,
    moreNotSecret,
    stillNotSecret,
    ...[bareMisses, fifthMisses].map((group) => Object.values(group).map((make) => make())),
  ];
  let checked = 0;
  for (const list of lists) {
    for (const text of list) {
      if (text.includes(BT)) continue;
      for (const wrapped of [`${BT}${text}${BT}`, `**${text}**`, `- ${BT}${text}${BT}`]) {
        assert.deepEqual(scan(wrapped, rules), [], wrapped);
        checked += 1;
      }
    }
  }
  assert.ok(checked > 100, `確かめた数: ${checked}`);
});

test("Markdown: 型名をインラインコードにしても注記として扱う（値の後ろの閉じのバッククォートは無視する）", () => {
  for (const text of [
    `${BT}${PW}: PasswordHash256${BT}`,
    `${BT}${PW}: Uint8Array;${BT}`,
    `${PW}: ${BT}SecretStr${BT}`,
    `${BT}${PW}?: Sha256Digest | null;${BT}`,
  ]) {
    assert.deepEqual(scan(text, rules), [], text);
  }
  // 型らしい語尾が無ければ、コードの中でも当てる
  assert.deepEqual(ids(scan(`${BT}${PW}: Summer2024${BT}`, rules)), ["secret-assignment-bare"]);
});

// ---- 2: | は表の行の形のときだけ ----
test("bare: | は行頭が | の表の行のときだけ区切りとして認める（パイプ・コマンドには使わない）", () => {
  for (const text of [
    `echo $DB_${PW.toUpperCase()} | sha256sum`,
    `$${PW} | sha512sum`,
    `echo ${PW} | md5sum`,
    `cat file | grep ${PW} | Xk9mP2qLr7vT`,
    `${PW} | Xk9mP2qLr7vT`, // 行頭が | でない
    `a | ${PW} | Xk9mP2qLr7vT |`,
  ]) {
    assert.deepEqual(scan(text, rules), [], text);
  }
  for (const text of [
    `| ${PW} | Summer2024 |`,
    `  | ${PW} | Summer2024 |`, // 行頭に空白があってもよい
    `| 本番 | ${PW} | Xk9mP2qLr7vT |`,
    "| 本番 | パスワード | Xk9mP2qLr7vT | 備考 |",
  ]) {
    assert.deepEqual(ids(scan(text, rules)), ["secret-assignment-bare"], text);
  }
});

test("bare: sha256sum / md5sum などのコマンド名と、方針の説明は値として当てない", () => {
  for (const sample of ["sha256sum", "sha1sum", "sha512sum", "md5sum", "b2sum", "b3sum"]) {
    assert.deepEqual(scan(`| ${PW} | ${sample} |`, rules), [], sample);
    assert.deepEqual(scan(`${PW}=${sample}`, rules), [], sample);
  }
  for (const policy of ["min8+symbol", "min12chars", "max64chars", "8+chars", "8+symbol"]) {
    assert.deepEqual(scan(`| ${PW} | ${policy} |`, rules), [], policy);
    assert.deepEqual(scan(`${PW}: ${policy}`, rules), [], policy);
  }
});

test("bare: 表の見出し行は引き続き当たらない（説明・英語の説明・別の列）", () => {
  for (const text of [`| ${PW} | 説明 |`, `| ${PW} | Description |`, "| パスワード | 説明 |", `| Field | ${PW} | Description |`, `| ${PW} | --- |`]) {
    assert.deepEqual(scan(text, rules), [], text);
  }
});
