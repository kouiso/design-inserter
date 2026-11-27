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
    ["aws-access-key", "github-token", "slack-token", "anthropic-key", "openai-key", "stripe-key", "jwt-bearer", "google-api-key", "private-key-header", "secret-assignment", "db-connection-string", "personal-email"],
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
  assert.equal(rulesJson.rules.length, 12, "元の規則を書き換えない");
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
    assert.deepEqual(ids(scan(`前の行\n${text}\n`, rules)), ["secret-assignment"], text);
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
