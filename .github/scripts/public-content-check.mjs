// 公開内容チェック: issue・PR・コメントの本文に、公開してはいけない内容がないか検査する。
// 依存なしの Node。純関数 scan() と、イベント JSON を読んで目印コメントを更新する run() からなる。
//
// なぜ「当たった文字」を一切出さないか: 公開リポのコメントに当たった文字を書き写すと、
// 検査自身が漏えいを 1 つ増やす。出すのは規則名・行番号・件数だけ。
// 本文の自動編集・削除はしない（編集や削除は持ち主の許可が要るため）。
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const BOT_LOGIN = "github-actions[bot]";
// なぜ: これ以外の投稿者（外の人）には、持ち主指定の語の行番号と件数を見せない。
// 候補の語を 1 行に 1 つ並べて投稿されると、行番号から secret の一覧を当てられるため。
export const TRUSTED_ASSOCIATIONS = new Set(["OWNER", "MEMBER", "COLLABORATOR"]);
export const OWNER_LABEL = "持ち主指定の語";
const MAX_LINES_SHOWN = 20;
const MAX_COMMENT_PAGES = 30;
// 正規表現の後ろ向きの文脈照合（excludeBefore）で見る文字数。
const CONTEXT_CHARS = 256;

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

// excludeCaseSensitive は規則ファイル専用（exclude は常に大文字小文字を区別しない。こちらは区別する）。
const LIST_KEYS = ["words", "patterns", "exclude", "excludeBefore", "excludeCaseSensitive"];
// secret（持ち主の追加規則）で使える項目。これ以外が来たら、規則の id と項目名だけを出して止める。
const EXTRA_RULE_KEYS = new Set(["id", "label", "flags", "words", "patterns", "exclude", "excludeBefore", "sameLineAs"]);

/** 規則 1 件の型を確かめる。エラーに出すのは id だけ（中身は出さない）。 */
export function validateRuleDef(def, index) {
  if (!def || typeof def !== "object" || Array.isArray(def)) throw new Error(`規則 #${index + 1} がオブジェクトではない`);
  if (typeof def.id !== "string" || def.id === "") throw new Error(`規則 #${index + 1} に文字列の id が無い`);
  for (const key of LIST_KEYS) {
    if (def[key] === undefined) continue;
    if (!Array.isArray(def[key]) || def[key].some((v) => typeof v !== "string")) {
      throw new Error(`規則 ${def.id} の ${key} が文字列の配列ではない`);
    }
  }
  for (const key of ["label", "flags", "sameLineAs"]) {
    if (def[key] !== undefined && typeof def[key] !== "string") throw new Error(`規則 ${def.id} の ${key} が文字列ではない`);
  }
}

/** 規則 1 件を、検査に使える形にする。words / patterns が空の規則は何にも当たらない。 */
function compileRule(def, index) {
  validateRuleDef(def, index);
  const baseFlags = String(def.flags ?? "").replace(/[gy]/g, "");
  const matchers = [];
  // words は常に大文字小文字を区別しない。patterns は flags に従う（flags なしなら区別する）。
  for (const word of def.words ?? []) {
    if (word === "") continue;
    matchers.push(compileList(escapeRegExp(word.normalize("NFKC")), `${baseFlags.replace("i", "")}gi`, def.id, "words"));
  }
  for (const pattern of def.patterns ?? []) {
    if (pattern === "") continue;
    matchers.push(compileList(pattern, `${baseFlags}g`, def.id, "patterns"));
  }
  const excludes = (def.exclude ?? []).filter((p) => p !== "").map((p) => compileList(p, "i", def.id, "exclude"));
  const excludeBefore = (def.excludeBefore ?? []).filter((p) => p !== "").map((p) => compileList(p, "", def.id, "excludeBefore"));
  const excludesCaseSensitive = (def.excludeCaseSensitive ?? []).filter((p) => p !== "").map((p) => compileList(p, "", def.id, "excludeCaseSensitive"));
  return {
    id: def.id,
    label: String(def.label ?? def.id),
    owner: def.owner === true,
    sameLineAs: def.sameLineAs ?? null,
    matchers,
    excludes,
    excludesCaseSensitive,
    excludeBefore,
  };
}

function ruleDefs(rules, what) {
  const defs = Array.isArray(rules) ? rules : rules?.rules;
  if (!Array.isArray(defs)) throw new Error(`${what}が規則の配列ではない`);
  return defs;
}

/** 規則ファイルの JSON（または規則の配列）を、検査用の形にする。 */
export function compileRules(rules) {
  const compiled = ruleDefs(rules, "規則").map(compileRule);
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
 * 汎用規則と同じ id なら exclude / excludeBefore だけを後ろへ足せる（words / patterns は不可。例外を投げる）。
 * 無い id なら「持ち主指定」の新しい規則にする。
 * 持ち主指定の規則は、コメントでは総称 OWNER_LABEL にまとめ、id も出さない。
 */
export function mergeExtraRules(base, extra) {
  const merged = ruleDefs(base, "規則").map((def) => ({ ...def }));
  const extraDefs = ruleDefs(extra, "追加規則");
  extraDefs.forEach((add, index) => {
    validateRuleDef(add, index);
    // なぜ: 綴りの間違い（word など）を黙って無視すると、規則が効かないまま気づけない。
    const unknown = Object.keys(add).filter((key) => !EXTRA_RULE_KEYS.has(key));
    if (unknown.length > 0) throw new Error(`規則 ${add.id} に知らない項目がある: ${unknown.join(" / ")}`);
  });
  for (const add of extraDefs) {
    const target = merged.find((def) => def.id === add.id);
    if (!target) {
      // なぜ: words も patterns も空の規則は何にも当たらない。効いていると思い込ませないよう止める。
      const hasTerm = [...(add.words ?? []), ...(add.patterns ?? [])].some((term) => term !== "");
      if (!hasTerm) throw new Error(`規則 ${add.id} は words も patterns も空`);
      merged.push({ ...add, owner: true });
      continue;
    }
    // なぜ: 汎用規則（行番号を外の人にも見せる）に持ち主の語を混ぜると、その語の一覧を行番号から当てられる。
    // 足せるのは、見本を除く exclude / excludeBefore だけ。語を足したいなら新しい id の規則にする。
    const forbidden = Object.keys(add).filter((key) => key !== "id" && key !== "exclude" && key !== "excludeBefore" && add[key] !== undefined);
    if (forbidden.length > 0) {
      throw new Error(`規則 ${add.id} は汎用規則なので、足せるのは exclude / excludeBefore だけ（${forbidden.join(" / ")} は不可）`);
    }
    for (const key of ["exclude", "excludeBefore"]) {
      if (add[key]?.length) target[key] = [...(target[key] ?? []), ...add[key]];
    }
  }
  return merged;
}

// ---- 検査（純関数） ----

/** 行を、そのままの形・NFKC にそろえた形・さらに %XX を戻した形で照合する（全角の ＠ や %40 を取りこぼさない）。 */
function variantsOf(line) {
  const nfkc = line.normalize("NFKC");
  const decoded = nfkc.replace(/%([0-7][0-9a-fA-F])/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  return [...new Set([line, nfkc, decoded])];
}

// 除外は、当たった文字の「値の部分」（名前つきグループ value* があればそこ）だけに当てる。
function valueOf(match) {
  const groups = match.groups ?? {};
  for (const key of Object.keys(groups)) {
    if (key.startsWith("value") && groups[key] !== undefined) return groups[key];
  }
  return match[0];
}

function countInText(text, rule) {
  // なぜ: 同じ場所に複数の patterns が当たっても 1 件と数える（重なる範囲は 1 つにまとめる）。
  const spans = [];
  for (const matcher of rule.matchers) {
    matcher.lastIndex = 0;
    for (const match of text.matchAll(matcher)) {
      if (rule.excludes.length || rule.excludesCaseSensitive.length) {
        const value = valueOf(match);
        if (rule.excludes.some((ex) => ex.test(value)) || rule.excludesCaseSensitive.some((ex) => ex.test(value))) continue;
      }
      if (rule.excludeBefore.length) {
        const before = text.slice(Math.max(0, match.index - CONTEXT_CHARS), match.index);
        if (rule.excludeBefore.some((ex) => ex.test(before))) continue;
      }
      spans.push([match.index, match.index + match[0].length]);
    }
  }
  spans.sort((a, b) => a[0] - b[0]);
  let count = 0;
  let end = -1;
  for (const [from, to] of spans) {
    if (from >= end) count += 1;
    end = Math.max(end, to);
  }
  return count;
}

/**
 * text を 1 行ずつ rules で検査する。
 * @returns {{ruleId: string, label: string, lines: number[], count: number}[]}
 *   lines は 1 始まりの行番号（元の本文の行。重複なし・昇順）、count は当たった箇所の総数。当たった文字は返さない。
 */
export function scan(text, rules) {
  const compiled = Array.isArray(rules) && rules[0]?.matchers ? rules : compileRules(rules);
  const byId = new Map(compiled.map((rule) => [rule.id, rule]));
  const lines = String(text ?? "").split(/\r\n|\r|\n/);
  const variants = new Array(lines.length);
  const variantsFor = (index) => (variants[index] ??= variantsOf(lines[index]));
  const perRule = new Map();

  const hitsOf = (rule) => {
    if (perRule.has(rule.id)) return perRule.get(rule.id);
    const hits = new Map();
    perRule.set(rule.id, hits);
    if (rule.matchers.length === 0) return hits;
    // 顧客名が空など、前提の規則が無効なら、この規則も無効。
    const anchor = rule.sameLineAs ? hitsOf(byId.get(rule.sameLineAs)) : null;
    if (rule.sameLineAs && anchor.size === 0) return hits;
    for (let index = 0; index < lines.length; index += 1) {
      if (anchor && !anchor.has(index + 1)) continue;
      // 同じ文字列が形を変えて二重に数えられないよう、形ごとの件数の最大を使う。
      let count = 0;
      for (const variant of variantsFor(index)) count = Math.max(count, countInText(variant, rule));
      if (count > 0) hits.set(index + 1, count);
    }
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

/**
 * 場所（タイトル・本文）ごとの scan 結果を、コメントとログに出す形にする。
 * 持ち主指定の規則は、総称 OWNER_LABEL 1 つにまとめて id を隠す。
 * 投稿者が持ち主側（OWNER / MEMBER / COLLABORATOR。trusted=true）でなければ、その行番号も件数も出さない。
 * @param {{segment: string, hits: ReturnType<typeof scan>}[]} perSegment
 */
export function summarizeFindings(perSegment, ownerIds, trusted) {
  const findings = [];
  for (const { segment, hits } of perSegment) {
    const owner = hits.filter((h) => ownerIds.has(h.ruleId));
    for (const hit of hits) {
      if (!ownerIds.has(hit.ruleId)) findings.push({ segment, ...hit, owner: false, concealed: false });
    }
    if (owner.length > 0) {
      findings.push({
        segment,
        ruleId: null,
        label: OWNER_LABEL,
        owner: true,
        concealed: !trusted,
        lines: trusted ? [...new Set(owner.flatMap((h) => h.lines))].sort((a, b) => a - b) : [],
        count: trusted ? owner.reduce((sum, h) => sum + h.count, 0) : 0,
      });
    }
  }
  return findings;
}

// ---- イベントから検査対象を取り出す ----

/**
 * @returns {null | {skip: string} | {number: number, marker: string, kind: string, url: string|null, association: string|null, segments: {name: string, text: string}[]}}
 */
export function extractTarget(eventName, event) {
  const login = event?.comment?.user?.login ?? event?.review?.user?.login ?? null;
  const url = (obj) => (typeof obj?.html_url === "string" ? obj.html_url : null);
  const assoc = (obj) => (typeof obj?.author_association === "string" ? obj.author_association : null);
  switch (eventName) {
    case "issues":
      return {
        number: event.issue.number,
        marker: "<!-- public-content-check -->",
        kind: "issue",
        url: url(event.issue),
        association: assoc(event.issue),
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
        association: assoc(event.pull_request),
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
        association: assoc(event.comment),
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
        association: assoc(event.review),
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

/** 1 件の当たりを、コメントの表の 1 行にする（持ち主指定の語は id を出さず、外の人には「該当あり」だけ）。 */
function findingRow(f) {
  if (f.owner && f.concealed) return `| ${cell(f.label)} | ${cell(f.segment)} | 非表示 | 該当あり |`;
  const name = f.owner ? cell(f.label) : `${cell(f.label)} (\`${cell(f.ruleId)}\`)`;
  return `| ${name} | ${cell(f.segment)} | ${describeLines(f.lines)} | ${f.count} |`;
}

/**
 * @param {{marker: string, kind: string, url: string|null, findings: ReturnType<typeof summarizeFindings>}} input
 * findings が空なら「OK」の本文。当たった文字は受け取らないし、書かない。
 * ruleId を持つ当たり（owner が偽）は、そのまま表に出す。
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
  return [
    marker,
    "## 公開内容チェック: 要確認",
    "",
    `${target}この${kind}に、このリポジトリで公開してはいけないとされる内容に当たる箇所がありました。当たった文字そのものは、ここには書きません。`,
    "",
    "| 規則 | 場所 | 行番号 | 件数 |",
    "|---|---|---|---|",
    ...findings.map(findingRow),
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

// なぜ: ログに出す文字列に改行があると、`::error::` のような行を偽造できる。
function sanitizeLog(text) {
  return String(text).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
}

function describeFindingForLog(f) {
  if (f.owner && f.concealed) return `${f.segment} / ${f.label} / 該当あり`;
  const name = f.owner ? f.label : f.ruleId;
  return `${f.segment} / ${name} / ${f.lines.length} 行 / ${f.count} 件 (行 ${describeLines(f.lines)})`;
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
    log(`対象外のイベントです: ${sanitizeLog(eventName)}`);
    return 0;
  }
  if (target.skip) {
    log(`検査しません: ${target.skip}`);
    return 0;
  }

  const ownerIds = new Set(compiled.filter((rule) => rule.owner).map((rule) => rule.id));
  const trusted = TRUSTED_ASSOCIATIONS.has(target.association);
  const findings = summarizeFindings(
    target.segments.map((segment) => ({ segment: segment.name, hits: scan(segment.text, compiled) })),
    ownerIds,
    trusted,
  );
  const failed = findings.length > 0;
  for (const f of findings) log(`当たり: ${describeFindingForLog(f)}`);
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
