// 公開内容チェック: issue・PR・コメントの本文に、公開してはいけない内容がないか検査する。
// 依存なしの Node。純関数 scan() と、イベント JSON を読んで目印コメントを更新する main() からなる。
//
// なぜ「当たった文字」を一切出さないか: 公開リポのコメントに当たった文字を書き写すと、
// 検査自身が漏えいを 1 つ増やす。出すのは規則名・行番号・件数だけ。
// 本文の自動編集・削除はしない（編集や削除は持ち主の許可が要るため）。
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const BOT_LOGIN = "github-actions[bot]";
const MAX_LINES_SHOWN = 20;
const MAX_COMMENT_PAGES = 30;

function escapeRegExp(word) {
  return word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ---- 規則の読み込み ----

function compileList(source, flags, ruleId, kind) {
  try {
    const re = new RegExp(source, flags);
    // なぜ: 空文字に当たる規則は全行に当たってしまうので、読み込みの時点で止める。
    if (new RegExp(`^(?:${source})$`, flags.replace("g", "")).test("")) {
      throw new Error("空文字に当たる");
    }
    return re;
  } catch (error) {
    // 規則の中身は出さない（持ち主が顧客名を書いている可能性がある）。
    throw new Error(`規則 ${ruleId} の ${kind} が正規表現として使えない: ${error.message.split(":")[0]}`);
  }
}

/** 規則 1 件を、検査に使える形にする。pattern が空の規則は enabled=false。 */
function compileRule(def) {
  if (!def || typeof def.id !== "string" || !def.id) throw new Error("規則に id が無い");
  const baseFlags = String(def.flags ?? "").replace(/[gy]/g, "");
  const matchers = [];
  for (const word of def.words ?? []) {
    if (typeof word !== "string" || word === "") continue;
    matchers.push(compileList(escapeRegExp(word), `${baseFlags.replace("i", "")}gi`, def.id, "words"));
  }
  for (const pattern of def.patterns ?? []) {
    if (typeof pattern !== "string" || pattern === "") continue;
    matchers.push(compileList(pattern, `${baseFlags}g`, def.id, "patterns"));
  }
  const excludes = (def.exclude ?? [])
    .filter((p) => typeof p === "string" && p !== "")
    .map((p) => compileList(p, "i", def.id, "exclude"));
  return {
    id: def.id,
    label: String(def.label ?? def.id),
    sameLineAs: def.sameLineAs ?? null,
    matchers,
    excludes,
  };
}

/** 規則ファイルの JSON（または規則の配列）を、検査用の形にする。 */
export function compileRules(rules) {
  const defs = Array.isArray(rules) ? rules : (rules?.rules ?? []);
  const compiled = defs.map(compileRule);
  const ids = new Set();
  for (const rule of compiled) {
    if (ids.has(rule.id)) throw new Error(`規則 id が重複している: ${rule.id}`);
    ids.add(rule.id);
  }
  for (const rule of compiled) {
    if (rule.sameLineAs && !ids.has(rule.sameLineAs)) {
      throw new Error(`規則 ${rule.id} の sameLineAs が存在しない規則を指している`);
    }
  }
  return compiled;
}

/**
 * 追加の規則（secret PUBLIC_CONTENT_EXTRA_RULES から来る JSON。規則の配列）を、規則ファイルの規則へ足す。
 * 顧客名・禁止語など持ち主固有の語は公開リポに置けないので、ここから足す。
 * 同じ id なら words / patterns / exclude を後ろへ足し、無い id なら新しい規則として加える。
 */
export function mergeExtraRules(base, extra) {
  const baseDefs = Array.isArray(base) ? base : (base?.rules ?? []);
  const extraDefs = Array.isArray(extra) ? extra : (extra?.rules ?? []);
  const merged = baseDefs.map((def) => ({ ...def }));
  for (const add of extraDefs) {
    const target = merged.find((def) => def.id === add.id);
    if (!target) {
      merged.push({ ...add });
      continue;
    }
    for (const key of ["words", "patterns", "exclude"]) {
      if (add[key]?.length) target[key] = [...(target[key] ?? []), ...add[key]];
    }
  }
  return merged;
}

// ---- 検査（純関数） ----

function lineHits(line, rule) {
  let count = 0;
  for (const matcher of rule.matchers) {
    matcher.lastIndex = 0;
    for (const match of line.matchAll(matcher)) {
      if (rule.excludes.some((ex) => ex.test(match[0]))) continue;
      count += 1;
    }
  }
  return count;
}

/**
 * text を 1 行ずつ rules で検査する。
 * @returns {{ruleId: string, label: string, lines: number[], count: number}[]}
 *   lines は 1 始まりの行番号（重複なし・昇順）、count は当たった箇所の総数。当たった文字は返さない。
 */
export function scan(text, rules) {
  const compiled = rules.length && rules[0]?.matchers ? rules : compileRules(rules);
  const byId = new Map(compiled.map((rule) => [rule.id, rule]));
  const lines = String(text ?? "").split(/\r\n|\r|\n/);
  const perRule = new Map();

  const hitsOf = (rule) => {
    if (perRule.has(rule.id)) return perRule.get(rule.id);
    const hits = new Map();
    perRule.set(rule.id, hits);
    if (rule.matchers.length === 0) return hits;
    // 顧客名が空など、前提の規則が無効なら、この規則も無効。
    const anchor = rule.sameLineAs ? hitsOf(byId.get(rule.sameLineAs)) : null;
    if (rule.sameLineAs && anchor.size === 0) return hits;
    lines.forEach((line, index) => {
      if (anchor && !anchor.has(index + 1)) return;
      const count = lineHits(line, rule);
      if (count > 0) hits.set(index + 1, count);
    });
    return hits;
  };

  const results = [];
  for (const rule of compiled) {
    const hits = hitsOf(rule);
    if (hits.size === 0) continue;
    results.push({
      ruleId: rule.id,
      label: rule.label,
      lines: [...hits.keys()].sort((a, b) => a - b),
      count: [...hits.values()].reduce((sum, n) => sum + n, 0),
    });
  }
  return results;
}

// ---- イベントから検査対象を取り出す ----

/**
 * @returns {null | {skip: string} | {number: number, marker: string, kind: string, url: string|null, segments: {name: string, text: string}[]}}
 */
export function extractTarget(eventName, event) {
  const login = event?.comment?.user?.login ?? event?.review?.user?.login ?? null;
  const url = (obj) => (typeof obj?.html_url === "string" ? obj.html_url : null);
  switch (eventName) {
    case "issues":
      return {
        number: event.issue.number,
        marker: "<!-- public-content-check -->",
        kind: "issue",
        url: url(event.issue),
        segments: [
          { name: "タイトル", text: event.issue.title },
          { name: "本文", text: event.issue.body },
        ],
      };
    case "pull_request_target":
    case "pull_request":
      return {
        number: event.pull_request.number,
        marker: "<!-- public-content-check -->",
        kind: "PR",
        url: url(event.pull_request),
        segments: [
          { name: "タイトル", text: event.pull_request.title },
          { name: "本文", text: event.pull_request.body },
        ],
      };
    case "issue_comment":
    case "pull_request_review_comment": {
      // なぜ: 自分のコメントを検査すると、コメント更新が次の起動を呼んで止まらなくなる。
      if (login === BOT_LOGIN) return { skip: "github-actions[bot] のコメントは検査しない" };
      const isReview = eventName === "pull_request_review_comment";
      return {
        number: isReview ? event.pull_request.number : event.issue.number,
        marker: `<!-- public-content-check:${isReview ? "review-comment" : "comment"}-${event.comment.id} -->`,
        kind: isReview ? "レビューコメント" : "コメント",
        url: url(event.comment),
        segments: [{ name: "本文", text: event.comment.body }],
      };
    }
    case "pull_request_review":
      if (login === BOT_LOGIN) return { skip: "github-actions[bot] のレビューは検査しない" };
      return {
        number: event.pull_request.number,
        marker: `<!-- public-content-check:review-${event.review.id} -->`,
        kind: "レビュー",
        url: url(event.review),
        segments: [{ name: "本文", text: event.review.body }],
      };
    default:
      return null;
  }
}

// ---- コメント本文の組み立て ----

function cell(text) {
  return String(text).replace(/\|/g, "\\|").replace(/[\r\n]+/g, " ");
}

function describeLines(lines) {
  const shown = lines.slice(0, MAX_LINES_SHOWN).join(", ");
  const rest = lines.length - MAX_LINES_SHOWN;
  return rest > 0 ? `${shown} ほか ${rest} 行` : shown;
}

/**
 * @param {{marker: string, kind: string, url: string|null, findings: {segment: string, ruleId: string, label: string, lines: number[], count: number}[]}} input
 * findings が空なら「OK」の本文。当たった文字は受け取らないし、書かない。
 */
export function buildComment({ marker, kind, url, findings }) {
  const target = url ? `対象: ${url}\n\n` : "";
  if (findings.length === 0) {
    return [
      marker,
      "## 公開内容チェック: OK",
      "",
      `${target}再検査したところ、この${kind}に公開してはいけない可能性のある内容は見つかりませんでした。`,
    ].join("\n");
  }
  const rows = findings.map(
    (f) => `| ${cell(f.label)} (\`${cell(f.ruleId)}\`) | ${cell(f.segment)} | ${describeLines(f.lines)} | ${f.count} |`,
  );
  return [
    marker,
    "## 公開内容チェック: 要確認",
    "",
    `${target}この${kind}に、このリポジトリで公開してはいけないとされる内容に当たる箇所がありました。当たった文字そのものは、ここには書きません。`,
    "",
    "| 規則 | 場所 | 行番号 | 件数 |",
    "|---|---|---|---|",
    ...rows,
    "",
    "- 該当箇所を編集して消すか書き換えてください。直すと自動で再検査され、問題がなくなればこのコメントは「OK」に更新されます。",
    "- 秘密の値だった場合は、編集履歴にも残るため、消すだけでなく無効化（再発行）してください。",
    "- 見本や作り物で問題ない場合は、持ち主に規則の見直しを相談してください。",
    "- このチェックは本文を自動で編集・削除しません。",
  ].join("\n");
}

// ---- GitHub API ----

function apiClient({ apiUrl, token, fetchImpl = fetch }) {
  const base = apiUrl.replace(/\/+$/, "");
  async function call(method, path, body) {
    const res = await fetchImpl(`${base}${path}`, {
      method,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "public-content-check",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`${method} ${path} -> HTTP ${res.status}`);
    return res.status === 204 ? null : res.json();
  }
  return { call };
}

async function findMarkerComment(api, repo, number, marker) {
  for (let page = 1; page <= MAX_COMMENT_PAGES; page += 1) {
    const comments = await api.call("GET", `/repos/${repo}/issues/${number}/comments?per_page=100&page=${page}`);
    // なぜ: 他人が目印を書いたコメントを、検査結果の置き場所と取り違えない。
    const found = comments.find((c) => c.user?.login === BOT_LOGIN && typeof c.body === "string" && c.body.includes(marker));
    if (found) return found;
    if (comments.length < 100) return null;
  }
  return null;
}

function sanitizeLog(text) {
  return String(text).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
}

// ---- 実行 ----

/**
 * @returns {Promise<number>} 終了コード。0=問題なし、1=当たりあり、2=設定やイベントの不備
 */
export async function run({ env = process.env, log = console.log, fetchImpl } = {}) {
  let compiled;
  let event;
  try {
    const rulesPath = env.PUBLIC_CONTENT_RULES_PATH || fileURLToPath(new URL("../public-content-rules.json", import.meta.url));
    let rules = JSON.parse(readFileSync(rulesPath, "utf8"));
    if (env.PUBLIC_CONTENT_EXTRA_RULES?.trim()) {
      let extra;
      try {
        extra = JSON.parse(env.PUBLIC_CONTENT_EXTRA_RULES);
      } catch {
        // なぜ: JSON.parse のエラー文には入力の一部が入る。secret の中身を公開ログに出さない。
        throw new Error("PUBLIC_CONTENT_EXTRA_RULES が JSON として読めない（中身は出さない）");
      }
      rules = mergeExtraRules(rules, extra);
    }
    compiled = compileRules(rules);
    event = JSON.parse(readFileSync(env.GITHUB_EVENT_PATH, "utf8"));
  } catch (error) {
    // 規則の JSON が壊れているときの error.message に本文は含まれない。
    log(`::error title=公開内容チェック::設定を読めませんでした: ${sanitizeLog(error.message)}`);
    return 2;
  }

  const eventName = env.GITHUB_EVENT_NAME;
  let target;
  try {
    target = extractTarget(eventName, event);
  } catch {
    log(`::error title=公開内容チェック::イベント ${sanitizeLog(eventName)} から本文を取り出せませんでした`);
    return 2;
  }
  if (!target) {
    log(`対象外のイベントです: ${eventName}`);
    return 0;
  }
  if (target.skip) {
    log(`検査しません: ${target.skip}`);
    return 0;
  }

  const findings = [];
  for (const segment of target.segments) {
    for (const hit of scan(segment.text, compiled)) findings.push({ segment: segment.name, ...hit });
  }
  const failed = findings.length > 0;
  for (const f of findings) {
    log(`当たり: ${f.segment} / ${f.ruleId} / ${f.lines.length} 行 / ${f.count} 件 (行 ${describeLines(f.lines)})`);
  }
  if (failed) log(`::error title=公開内容チェック::${findings.length} 件の規則に当たりました。詳細は ${target.kind} のコメントを見てください。`);
  else log("公開してはいけない内容は見つかりませんでした。");

  // コメントの作成・更新。失敗しても検査の結果（終了コード）は変えない。
  // なぜ: フォークからのレビューコメントなど、書き込み権限が無い起動でも「赤」だけは確実に出す。
  try {
    const repo = env.GITHUB_REPOSITORY || event.repository?.full_name;
    const api = apiClient({ apiUrl: env.GITHUB_API_URL || "https://api.github.com", token: env.GITHUB_TOKEN ?? "", fetchImpl });
    const existing = await findMarkerComment(api, repo, target.number, target.marker);
    if (failed || existing) {
      const body = buildComment({ marker: target.marker, kind: target.kind, url: target.url, findings });
      if (!existing) {
        await api.call("POST", `/repos/${repo}/issues/${target.number}/comments`, { body });
        log("目印コメントを作成しました。");
      } else if (existing.body !== body) {
        await api.call("PATCH", `/repos/${repo}/issues/comments/${existing.id}`, { body });
        log("目印コメントを更新しました。");
      }
    }
  } catch (error) {
    log(`::warning title=公開内容チェック::コメントを書けませんでした: ${sanitizeLog(error.message)}`);
  }
  return failed ? 1 : 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exitCode = await run();
}
