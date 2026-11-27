# 公開内容チェック

このリポは公開されている。issue・issue コメント・PR 本文・PR のレビューコメントに、公開してはいけない内容が混ざっていないかを、作成時と編集時に検査する（#114 項目1）。

- 検査するだけ。本文の自動編集・削除はしない。
- 当たると検査が赤になり、目印つきのコメントを 1 つ作る。コメントに書くのは「規則名・行番号・件数」だけで、**当たった文字は書かない**。
- 直して再検査で当たらなくなると、同じコメントが「OK」に更新される。
- 使うのは `GITHUB_TOKEN` だけ（外部サービス・新しい認証情報は不要）。PR の head は取り出さず、base にあるスクリプトと規則ファイルだけを使う。

## 構成

| ファイル | 役割 |
|---|---|
| `.github/workflows/public-content-check.yml` | 起動条件。issues / issue_comment / pull_request_target / pull_request_review_comment / pull_request_review |
| `.github/scripts/public-content-check.mjs` | 検査本体（依存なしの Node）。`scan(text, rules)` が純関数 |
| `.github/public-content-rules.json` | 形の決まった汎用規則（公開してよい物だけ） |
| `tests/public-content-check.test.mjs` | 単体テストと、ローカルの偽 GitHub API サーバーを使った実走テスト |

## 初期の汎用規則

秘密の値（AWS アクセスキー、GitHub トークン、Slack トークン、OpenAI / Anthropic 型の API キー、秘密鍵の見出し、`password|secret|token|api_key` への長い値の代入）、資格情報つきの DB 接続文字列（postgres / mysql / mongodb / redis）、個人のメールアドレス（`users.noreply.github.com`・`noreply@`・example.com/.org/.net・example.jp・`git@`・画像などのファイル名は除く）。

## 顧客名・禁止語・DB 名などを足す（持ち主向け）

顧客名・禁止語・DB の名前と ID・秘密の名前・弱点や攻め方の手順は、**このファイルに書かない**。公開リポに一覧を置いた時点で、その一覧が外に漏れるため。

代わりに、Actions の secret `PUBLIC_CONTENT_EXTRA_RULES` に、規則の配列を JSON で入れる。ワークフローが環境変数として検査スクリプトに渡し、未設定なら何も足さない。secret を作るかどうか・誰が管理するかは持ち主が決める（コードからは作らない）。

```json
[
  { "id": "customer-names", "label": "顧客名", "flags": "i", "words": ["顧客A", "顧客Aの略称"] },
  { "id": "customer-amount", "label": "顧客名と同じ行の金額", "sameLineAs": "customer-names",
    "patterns": ["[¥￥][ \\t]*[0-9][0-9,]*", "[0-9][0-9,.]*[ \\t]*(?:万|千|億)?円"] },
  { "id": "banned-words", "label": "禁止語", "flags": "i", "words": ["禁止語1"] },
  { "id": "attack-procedures", "label": "弱点や攻め方の手順", "flags": "i", "patterns": ["具体的な言い回し.*手順"] }
]
```

規則の書き方:

- `id` ・ `label`: コメントに出る名前。**ここに顧客名などの本物の語を書かない**（コメントは公開される）。
- `words`: そのまま探す語（大文字小文字は区別しない）。記号を含んでも正規表現として扱われない。
- `patterns`: 正規表現（JavaScript）。JSON なので `\` は `\\` と書く。1 行ずつ検査するので、複数行にまたがる式は使えない。空文字に当たる式は読み込み時に拒否される。
- `flags`: 正規表現の旗（`i` = 大文字小文字を区別しない）。
- `exclude`: 当たった文字がこの正規表現にも当たったら、当たりから外す（見本の除外用）。
- `sameLineAs`: 別の規則の id。その規則が当たった行でだけ検査する。参照先の `words` / `patterns` が空なら、この規則は何もしない。上の例では、顧客名と同じ行に円・¥ の金額があるときだけ当たる。
- 既存の規則と同じ `id` を書くと、`words` / `patterns` / `exclude` が後ろに足される（例: 個人メールの `exclude` に会社の代表アドレスを足す）。
- JSON が壊れている・正規表現が使えないときは、検査は exit 2 で止まる。ログには中身を出さず、どの規則かだけを出す。

制約: フォークからの PR のレビューコメント（`pull_request_review_comment`）では、GitHub が secret を渡さない。その場合は汎用規則だけで検査する。

## いつ効くか

`issues` / `issue_comment` / `pull_request_target` 系のワークフローは、**既定の枝（main）にある物だけ**が動く。develop にマージしただけでは動かず、develop から main へのリリース後に効き始める。

## テストの流れ

- `pnpm test`（`script/test.mjs` の `testPublicContentCheck`）。`task ci:fast` と `node .github/ci/run.mjs js|local` の `js-test` 経由でも流れる。
- `.github/workflows/ci.yml` の `Public content check tests` ステップ（develop 向けの PR でも流れる）。
- 単独: `node --test tests/public-content-check.test.mjs`
- ワークフローの構文: `actionlint .github/workflows/public-content-check.yml`
