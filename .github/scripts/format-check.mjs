// issue と PR の「書き方」を文字の規則だけで検査する（AI・外部サービス・依存なし）。
// 純関数（checkIssue / checkPr / shouldSkip / buildComment）と、
// イベント JSON を読んで GitHub API にコメントを書く main を分けている。
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

// 目印。これを含む github-actions[bot] のコメントを「このチェックのコメント」と見なす。
export const MARKER = "<!-- format-check -->";
// GITHUB_TOKEN で書いたコメントの作者。他人が目印だけ真似て書いても更新対象にしない。
export const COMMENT_AUTHOR = "github-actions[bot]";

// 機械が自動で作る issue に付くラベル（小文字で比較）。
// なぜ: このリポで issue を自動作成する workflow は無く（ci-failure-notify は Slack 通知のみ、
// devin-slack-trigger はラベルを読むだけ）、renovate の Dependency Dashboard は bot 作成として別途除外される。
// 外部のアラート系ツールが付ける一般的な名前を先回りで入れてある。
export const AUTOMATED_ISSUE_LABELS = [
  "alert",
  "alerts",
  "automated",
  "auto-generated",
  "ci-failure",
  "monitoring",
];

// 見出し名 → 受け入れる見出しの頭（番号・記号・空白を落として小文字化した形で前方一致）。
// 先頭が正式名、2つ目以降は別名。別名はアカウント既定の様式
// （kouiso/.github の ISSUE_TEMPLATE/*.yml と pull_request_template.md）の見出し。
// 既定の様式に「今どこまで」「誰の判断待ち」に当たる欄は無い。課題の指定どおり別名を作らず必須のままにする。
export const ISSUE_SECTIONS = [
  { name: "背景", prefixes: ["背景", "なぜ直したいか", "なぜ欲しいか", "何が起きたか"] },
  { name: "今どこまで", prefixes: ["今どこまで"] },
  { name: "次にやること", prefixes: ["次にやること", "やること", "何をしてほしいか"] },
  { name: "誰の判断待ち", prefixes: ["誰の判断待ち"] },
  { name: "完了条件", prefixes: ["完了条件", "どうなったら終わりか", "完成の定義"] },
];
export const PR_SECTIONS = [
  { name: "概要", prefixes: ["概要"] },
  // アカウント既定の PR テンプレートでは「やったこと」が変更内容にあたる。
  { name: "変更内容", prefixes: ["変更内容", "やったこと"] },
  { name: "関連Issue", prefixes: ["関連issue"], issueRef: true },
];

// Closes / Refs の他に、GitHub が閉じる語として扱う Fixes / Resolves 系も許す。
const ISSUE_REF_PATTERN =
  /(?:^|[^A-Za-z0-9_])(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?|refs?)(?:\s*:\s*|\s+)(?:[\w.-]+\/[\w.-]+)?#\d+/i;

const ZERO_WIDTH = /[​-‍⁠﻿]/g;

// 見出しの比較用の形。全角→半角、装飾と空白を落とし、頭の番号・記号・【】・絵文字も落とす。
export function normalizeHeading(text) {
  return String(text ?? "")
    .replace(ZERO_WIDTH, "")
    .normalize("NFKC")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, "")
    .replace(/^[\p{N}\p{P}\p{S}\p{Extended_Pictographic}‍️]+/u, "")
    .toLowerCase();
}

// fix-issue-headings.yml が opened のときに本文へかける書き換えと同じ。
// 判定は書き換え後の本文で行い、workflow の実行順に左右されないようにする。
export function rewriteIssueHeadings(body) {
  return String(body ?? "")
    .replace(/^### /gm, "## ")
    .replace(/^#### /gm, "### ");
}

// インラインコード（`...`）。中の <!-- はコメントの始まりにしない。
const CODE_SPAN = /(`+)(?!`)[\s\S]*?(?<!`)\1(?!`)/g;

// 本文を行に分け、フェンスの外の HTML コメントを取り除く（行頭で始まる閉じていないコメントは本文の終わりまで）。
// フェンスは開いた長さを覚え、閉じは「字下げ3以下・同じ文字・同じ長さ以上・情報文字列なし」だけ。
function scan(body) {
  const raw = String(body ?? "").replace(ZERO_WIDTH, "").replace(/\r\n?/g, "\n").split("\n");
  // 行の途中で始まる閉じない <!-- は、同じ段落（次の空行・見出しの行・フェンスの手前まで）に --> がある時だけコメントにする。
  const closesInParagraph = (from) => {
    for (let j = from + 1; j < raw.length; j += 1) {
      const next = raw[j];
      if (next.trim() === "" || /^ {0,3}#{1,6}[ \t]/.test(next) || /^ {0,3}(`{3,}|~{3,})/.test(next)) return false;
      if (next.includes("-->")) return true;
    }
    return false;
  };
  const lines = [];
  const fenced = [];
  let fence = null;
  let inComment = false;
  for (let lineIndex = 0; lineIndex < raw.length; lineIndex += 1) {
    let line = raw[lineIndex];
    if (inComment) {
      const end = line.indexOf("-->");
      if (end < 0) {
        lines.push("");
        fenced.push(false);
        continue;
      }
      inComment = false;
      line = line.slice(end + 3);
    } else if (fence) {
      const close = line.match(/^ {0,3}(`{3,}|~{3,})[ \t]*$/);
      if (close && close[1][0] === fence.char && close[1].length >= fence.len) fence = null;
      lines.push(line);
      fenced.push(true);
      continue;
    } else {
      const open = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
      if (open && !(open[1][0] === "`" && open[2].includes("`"))) {
        fence = { char: open[1][0], len: open[1].length };
        lines.push(line);
        fenced.push(true);
        continue;
      }
    }
    for (;;) {
      // バッククォートで囲んだ `<!--` は文字として書いただけなので、コメントの始まりにしない。
      const masked = line.replace(CODE_SPAN, (m) => "\u0000".repeat(m.length));
      const start = masked.indexOf("<!--");
      if (start < 0) break;
      const end = line.indexOf("-->", start + 4);
      if (end < 0) {
        // 閉じない <!-- は、行頭（字下げ3以下）か、後ろに --> がある時だけコメントとして扱う。
        // 行の途中で閉じも無いなら、ただの文字として残す。
        if (/^ {0,3}$/.test(line.slice(0, start)) || closesInParagraph(lineIndex)) {
          line = line.slice(0, start);
          inComment = true;
        }
        break;
      }
      line = line.slice(0, start) + line.slice(end + 3);
    }
    lines.push(line);
    fenced.push(false);
  }
  return { lines, fenced };
}

// 本文を見出し（# 〜 ####）で区切る。コードブロックとコメントの中の # は見出しにしない。
// 節は「同じかより浅い見出し」か「別の必須見出し（別名を含む）」まで続く。
function splitBody(body, definitions = []) {
  const { lines, fenced } = scan(body);
  const requiredPrefixes = definitions.flatMap((d) => d.prefixes.map(normalizeHeading));
  const isRequiredKey = (key) => requiredPrefixes.some((p) => key.startsWith(p));
  const headings = [];
  lines.forEach((line, index) => {
    if (fenced[index]) return;
    const m = line.match(/^ {0,3}(#{1,4})[ \t]+(.+?)[ \t]*#*[ \t]*$/);
    if (m) headings.push({ index, level: m[1].length, title: m[2], key: normalizeHeading(m[2]) });
  });
  const preamble = lines.slice(0, headings.length ? headings[0].index : lines.length).join("\n");
  const sections = headings.map((heading, i) => {
    let end = lines.length;
    for (let j = i + 1; j < headings.length; j += 1) {
      if (headings[j].level <= heading.level || isRequiredKey(headings[j].key)) {
        end = headings[j].index;
        break;
      }
    }
    return {
      title: heading.title,
      key: heading.key,
      content: lines.slice(heading.index + 1, end).join("\n"),
    };
  });
  return { preamble, sections };
}

export const parseSections = (body, definitions = []) => splitBody(body, definitions).sections;

// 見出しだけ・「-」だけ・「- [ ]」だけ・HTML コメントだけ・空白だけなどは中身なし。
// 「_No response_」は issue フォームが空欄に自動で入れる文字なので同じ扱い。
export function hasContent(content) {
  let inAlert = false;
  return String(content ?? "")
    .replace(ZERO_WIDTH, "")
    .split("\n")
    .some((raw) => {
      const line = raw
        .replace(/<br\s*\/?>|&nbsp;|&#0*160;|&#x0*a0;/gi, " ")
        .trim();
      // 既定の issue フォームが初期値に入れる `> [!TIP]` の囲みは案内文なので中身にしない。
      if (/^>\s*\[!(?:note|tip|important|warning|caution)\]/i.test(line)) {
        inAlert = true;
        return false;
      }
      if (inAlert && line.startsWith(">")) return false;
      inAlert = false;
      if (line === "") return false;
      if (/^#{1,6}(\s.*)?$/.test(line)) return false;
      // コードブロックの開始・終了の行そのものは中身にしない（中の行は数える）。
      if (/^(?:`{3,}|~{3,})[\w-]*$/.test(line)) return false;
      // 区切り線（---・***・___）。
      if (/^([-*_])(?:\s*\1){2,}$/.test(line)) return false;
      // 引用の記号だけ。
      if (/^(?:>\s*)+$/.test(line)) return false;
      // 箇条書き・番号・チェックボックスの記号だけ。
      if (/^(?:[-*+・•●○]|\d+[.)])\s*(?:\[[ xX]?\])?\s*$/.test(line)) return false;
      // 「- 本当はこうなってほしい：」のように、ラベルだけで答えが無い箇条書き。
      if (/^[-*+]\s+[^:：]+[:：]\s*$/.test(line)) return false;
      // 中身が空の表の行（| | |、| --- | --- |）。
      if (/^\|[\s|:-]*$/.test(line)) return false;
      if (/^_?no response_?$/i.test(line)) return false;
      return true;
    });
}

// 既定の SBI フォームの形か。見出しが「メモ（任意）」に完全一致する 1 つだけで、前置きも中身も無い。
export function isSbiBody(body) {
  const { preamble, sections } = splitBody(body);
  return (
    sections.length === 1 &&
    sections[0].key === normalizeHeading("メモ（任意）") &&
    !hasContent(preamble) &&
    !hasContent(sections[0].content)
  );
}

// 本文が「空」か。HTML コメントを除いた後が、空白（ゼロ幅文字を含む）だけか `_No response_` だけのとき。
// 見出しだけの本文や「-」だけの本文は空と見なさない（hasContent とは別の、より狭い判定）。
export function isBlankBody(body) {
  const text = scan(body).lines.join("\n").trim();
  return text === "" || /^_?no response_?$/i.test(text);
}

function evaluate(body, definitions) {
  const sections = parseSections(body, definitions);
  const missing = [];
  const empty = [];
  const invalid = [];
  for (const def of definitions) {
    const prefixes = def.prefixes.map(normalizeHeading);
    const found = sections.filter((s) => prefixes.some((p) => s.key.startsWith(p)));
    if (found.length === 0) {
      missing.push(def.name);
      continue;
    }
    const filled = found.filter((s) => hasContent(s.content));
    if (filled.length === 0) {
      empty.push(def.name);
      continue;
    }
    if (def.issueRef && !filled.some((s) => ISSUE_REF_PATTERN.test(s.content))) {
      invalid.push({
        name: def.name,
        reason: "`Closes #番号` か `Refs #番号` の形で issue 番号を書いてください",
      });
    }
  }
  return {
    ok: missing.length === 0 && empty.length === 0 && invalid.length === 0,
    missing,
    empty,
    invalid,
  };
}

// opened のときだけ、fix-issue-headings.yml の書き換え後の本文で判定する（edited で二重に繰り上げない）。
export const checkIssue = (body, { rewrite = false } = {}) =>
  evaluate(rewrite ? rewriteIssueHeadings(body) : body, ISSUE_SECTIONS);
export const checkPr = (body) => evaluate(body, PR_SECTIONS);

export function isBot(user) {
  const login = String(user?.login ?? "");
  return user?.type === "Bot" || login.endsWith("[bot]");
}

// 対象外なら理由の文字列、対象なら null。
export function shouldSkip(kind, item) {
  if (isBot(item?.user)) return "bot が作成";
  if (kind === "pr" && item?.draft === true) return "下書きの PR";
  if (kind === "issue") {
    // 既定の SBI フォーム（メモ（任意）が空）と、本文が空のサブ issue は書き方を問わない。
    // サブ issue でも本文に何か書いてあれば検査する。
    if (isSbiBody(item?.body)) return "SBI フォームの issue";
    if (item?.parent_issue_url && isBlankBody(item?.body)) return "本文が空のサブ issue";
    const names = (item?.labels ?? []).map((l) =>
      String(typeof l === "string" ? l : (l?.name ?? "")).toLowerCase(),
    );
    const hit = names.find((n) => AUTOMATED_ISSUE_LABELS.includes(n));
    if (hit) return `自動作成の issue（ラベル ${hit}）`;
  }
  return null;
}

function describeSection(name) {
  const def = [...ISSUE_SECTIONS, ...PR_SECTIONS].find((d) => d.name === name);
  const others = (def?.prefixes ?? []).slice(1);
  return others.length > 0 ? `${name}（${others.map((o) => `「${o}」`).join("")}でも可）` : name;
}

// 後から対象外になった（下書きに戻した・アラート系ラベルが付いた）ときに、残っている目印コメントを置き換える文。
export function buildSkipComment() {
  return `${MARKER}\n## 書き方チェック: 対象外\n対象外になったので検査しません。\n`;
}

// コメントには見出し名と固定の案内だけを書く。本文の文字は一切引用しない。
export function buildComment(kind, result) {
  const label = kind === "pr" ? "PR" : "issue";
  if (result.ok) {
    return `${MARKER}\n## 書き方チェック: OK\n${label}の書き方がそろっています。\n`;
  }
  const lines = [
    MARKER,
    "## 書き方チェック: 足りない項目があります",
    `${label}の本文を次のとおり直してください。直すとこのコメントが自動で更新されます。`,
    "",
  ];
  if (result.missing.length > 0) {
    lines.push(
      `- 見出しがありません: ${result.missing.map(describeSection).join("、")}（\`## 見出し名\` の形で足してください）`,
    );
  }
  if (result.empty.length > 0) {
    lines.push(
      `- 中身が未記入です: ${result.empty.map(describeSection).join("、")}（見出しだけ・「-」だけ・「- [ ]」だけ・コメントだけは未記入になります）`,
    );
  }
  for (const item of result.invalid) {
    lines.push(`- ${item.name}: ${item.reason}`);
  }
  lines.push("");
  return lines.join("\n");
}

export function apiBase(env = process.env) {
  return (env.GITHUB_API_URL || "https://api.github.com").replace(/\/+$/, "");
}

async function request(env, method, path, payload) {
  const response = await fetch(`${apiBase(env)}${path}`, {
    method,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "design-inserter-format-check",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`GitHub API ${method} ${path} -> HTTP ${response.status}`);
  }
  return response.status === 204 ? null : response.json();
}

async function findMarkerComment(env, repo, number) {
  for (let page = 1; page <= 50; page += 1) {
    const comments = await request(
      env,
      "GET",
      `/repos/${repo}/issues/${number}/comments?per_page=100&page=${page}`,
    );
    const hit = comments.find(
      (c) => c.user?.login === COMMENT_AUTHOR && String(c.body ?? "").includes(MARKER),
    );
    if (hit) return hit;
    if (comments.length < 100) return null;
  }
  return null;
}

const REFETCH_ISSUE_ACTIONS = ["labeled", "unlabeled", "reopened"];

// 戻り値は終了コード: 0 = 対象外 or そろっている、1 = 書き方が足りない、2 = 実行の失敗。
export async function main(env = process.env, log = console) {
  try {
    if (!env.GITHUB_EVENT_PATH) throw new Error("GITHUB_EVENT_PATH がありません");
    if (!env.GITHUB_TOKEN) throw new Error("GITHUB_TOKEN がありません");
    const payload = JSON.parse(readFileSync(env.GITHUB_EVENT_PATH, "utf8"));
    const isPr = Boolean(payload.pull_request);
    const kind = isPr ? "pr" : "issue";
    let item = isPr ? payload.pull_request : payload.issue;
    if (!item) throw new Error("イベントに issue も pull_request もありません");
    // issues イベントは PR では来ないが、念のため PR 由来の issue は見ない。
    if (!isPr && item.pull_request) {
      log.log("skip: PR 由来のイベント");
      return 0;
    }
    // bot が作った物には目印コメントが付くことが無いので、API を呼ばずに終える。
    if (isBot(item.user)) {
      log.log("skip: bot が作成");
      return 0;
    }
    const repo = env.GITHUB_REPOSITORY || payload.repository?.full_name;
    if (!repo) throw new Error("GITHUB_REPOSITORY がありません");

    // labeled / unlabeled / reopened の payload の本文は、ラベル付きで作った issue では
    // fix-issue-headings.yml の書き換え前の古い物のことがある。今の本文とラベルを API で読み直して判定する。
    if (!isPr && REFETCH_ISSUE_ACTIONS.includes(payload.action)) {
      item = await request(env, "GET", `/repos/${repo}/issues/${item.number}`);
    }

    const existing = await findMarkerComment(env, repo, item.number);
    const update = (body) =>
      existing.body === body
        ? null
        : request(env, "PATCH", `/repos/${repo}/issues/comments/${existing.id}`, { body });

    // 後から対象外になった場合、前に書いた赤いコメントが残らないよう更新する。無ければ何も書かない。
    const skipReason = shouldSkip(kind, item);
    if (skipReason) {
      if (existing) await update(buildSkipComment());
      log.log(`skip: ${skipReason}`);
      return 0;
    }

    // fix-issue-headings.yml は opened のときだけ見出しを繰り上げる。同じ書き換えは opened のときだけかける。
    const result = isPr
      ? checkPr(item.body)
      : checkIssue(item.body, { rewrite: payload.action === "opened" });
    const body = buildComment(kind, result);

    if (!result.ok) {
      if (!existing) {
        await request(env, "POST", `/repos/${repo}/issues/${item.number}/comments`, { body });
      } else {
        await update(body);
      }
      log.log(
        `NG: missing=${result.missing.join(",")} empty=${result.empty.join(",")} invalid=${result.invalid.map((i) => i.name).join(",")}`,
      );
      return 1;
    }
    if (existing) await update(body);
    log.log("OK");
    return 0;
  } catch (error) {
    log.error(`format-check の実行に失敗: ${error.message}`);
    return 2;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await main();
}
