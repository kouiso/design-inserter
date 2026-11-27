# 公開内容チェック

このリポは公開されている。issue・issue コメント・PR 本文・PR のレビューコメントとレビュー本文に、公開してはいけない内容が混ざっていないかを、作成時と編集時に検査する（#114 項目1）。

- 検査するだけ。本文の自動編集・削除はしない。
- 当たると検査が赤になり、目印つきのコメントを 1 つ作る。コメントに書くのは「規則名・行番号・件数」だけで、**当たった文字は書かない**（ログにも出さない）。
- 直して再検査で当たらなくなると、同じコメントが「OK」に更新される。
- 使うのは `GITHUB_TOKEN` だけ（外部サービス・新しい認証情報は不要）。実行するスクリプトと規則ファイルは、**常に既定の枝（main）の物**を使う（checkout の `ref` に `github.event.repository.default_branch` を明示）。PR の head・merge は取り出さない。

## 構成

| ファイル | 役割 |
|---|---|
| `.github/workflows/public-content-check.yml` | 起動条件。issues / issue_comment / pull_request_target / pull_request_review_comment / pull_request_review |
| `.github/scripts/public-content-check.mjs` | 検査本体（依存なしの Node）。`scan(text, rules)` が純関数 |
| `.github/public-content-rules.json` | 形の決まった汎用規則（公開してよい物だけ） |
| `tests/public-content-check.test.mjs` | 単体テストと、ローカルの偽 GitHub API サーバーを使った実走テスト |

## 初期の汎用規則

- 秘密の値: AWS アクセスキー、GitHub トークン、Slack トークン、OpenAI / Anthropic 型の API キー、Stripe の本番キー（`sk_live_` / `rk_live_`）、`Bearer eyJ…`（JWT）、Google の `AIza…`、秘密鍵の見出し。
- 名前つきの値の代入（`secret-assignment`）: 名前に `password` `secret` `token` `api_key` `AUTH_KEY` `…_SALT` `パスワード` `暗証番号` などを含む項目へ、`=` `:` `=>` 全角コロン（日本語の名前だけ `は` も）で値を入れている形と、PHP の `define( 'DB_PASSWORD', '…' )`。名前で厳しさを変える。
  - `password` / `passwd` / `pwd` / `パスワード` / `暗証番号`: 引用符つきは 8 文字以上（8〜15 文字は数字か記号を含むとき。数字だけの `"12345678"` も当たる）、引用符なしも 8 文字以上（英字と、数字か記号を含む）。`define` の `…PASSWORD` は値が何でも 8 文字以上で当たる。
  - `secret` / `api_key` / `AUTH_KEY` / `…_SALT` など: 引用符つき 8 文字以上、引用符なしは英字と数字を含む 20 文字以上。`define` の `…KEY` / `…SALT` は数字か記号を含む 8 文字以上。
  - `token` / `トークン`（誤検知が多い名前）: 引用符つき 16 文字以上、引用符なしは 32 文字以上。
  - 当たらないもの: `GITHUB_TOKEN` という語、`process.env.X`、`${{ secrets.X }}`、URL・パス、ドット区切りの名前や版（`color.primary.500`、`v1.2.0`）、見本の値（`your-` で始まる、`xxxx` を含む、値の全体が `…_here`・`changeme`・`put your …`）、引用符なしで英小文字と数字と `-` `_` だけの語（kebab / snake）。
- 資格情報つきの DB 接続文字列（postgres / mysql / mongodb / redis）。
- 個人のメールアドレス（`users.noreply.github.com`・`noreply@`・example.com/.org/.net・example.jp・`git@`・画像などのファイル名・URL の資格情報（`://user:pass@host`）は除く。`?email=`・`#`・パスの後ろに付いたメールは当てる）。
- 全規則とも、行を NFKC にそろえた形と、`%XX` を戻した形でも照合する（全角の `＠`、`%40`、全角英字）。行番号は元の行のまま。

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

- `id` ・ `label`: 持ち主の目印。**コメントにもログにも出ない**（持ち主指定の規則は、まとめて総称「持ち主指定の語」と表示される）。それでも、ここに顧客名などの本物の語を書かない（設定の誤りのエラーには規則の id が出る）。
- `words`: そのまま探す語。大文字小文字は区別しない。全角・半角も区別しない。記号を含んでも正規表現として扱われない。
- `patterns`: 正規表現（JavaScript）。JSON なので `\` は `\\` と書く。1 行ずつ検査するので、複数行にまたがる式は使えない。**`flags` を書かなければ大文字小文字を区別する**。空文字に当たる式は読み込み時に拒否される。
- `flags`: 正規表現の旗（`i` = 大文字小文字を区別しない）。
- `exclude`: 当たった文字がこの正規表現にも当たったら、当たりから外す（見本の除外用）。
- `excludeBefore`: 当たった位置の直前 256 文字がこの正規表現に当たったら外す（文脈による除外）。
- `sameLineAs`: 別の規則の id。その規則が当たった行でだけ検査する。参照先の `words` / `patterns` が空なら、この規則は何もしない。上の例では、顧客名と同じ行に円・¥ の金額があるときだけ当たる。
- 既存の汎用規則と同じ `id` を書いたときに足せるのは、`exclude` / `excludeBefore` だけ（例: 個人メールの `exclude` に会社の代表アドレスを足す）。`words` / `patterns` などを書くと、規則の id だけを出して exit 2 で止まる（汎用規則の行番号は外の人にも見せるので、持ち主の語を混ぜると一覧を当てられるため）。語を足したいときは、新しい `id` の規則にする。
- `words` `patterns` `exclude` `excludeBefore` は文字列の配列でなければならない（違うと検査は exit 2 で止まる。ログには中身を出さず、規則の id だけを出す）。JSON が壊れている・正規表現が使えないときも同じ。

### 外の人に見せるもの

- 投稿者（`author_association`）が `OWNER` `MEMBER` `COLLABORATOR` のときだけ、「持ち主指定の語」の行番号と件数を出す。
- それ以外の投稿者（外の人）には、行番号も件数も出さず、「該当あり」だけを出す（コメントにもログにも）。汎用規則の行番号と件数は、誰にでも出す。
- **それでも残る危険**: 外の人が、候補の語を 1 回の投稿に 1 つずつ入れて何度も投稿・編集すると、「該当あり」の有無から、secret の一覧に入っている語を 1 つずつ絞り込める。完全には防げない（語の数が多いほど、1 語ずつ当てるのに必要な投稿も増えるが、ゼロにはならない）。語を当てられること自体が困る一覧は、この仕組みに入れず、非公開の場所での確認にする。
- `exclude` / `excludeBefore` も同じ種類の危険を持つ。外の人が候補を投稿して「当たらなかった」ことから、除外の一覧に入っている語（たとえば許可した会社のドメイン）を絞り込める。除外に入れる語も、当てられて困らないものだけにする。

### 制約

- フォークからの PR のレビューコメント・レビュー本文では、GitHub が読み取り専用のトークンにし、secret も渡さない。コメントは書けず（赤の結果だけが残る）、追加規則も効かず、汎用規則だけで検査する。
- `pull_request_review` と `pull_request_review_comment` は、**ワークフローの定義そのものが PR 側の版**で動く（GitHub の仕様）。checkout で既定の枝のスクリプトを使うので、PR の中のスクリプトは動かないが、PR がワークフローの定義を書き換えれば、その PR 上のレビューの検査は外せる。issue・issue コメント・PR 本文の検査は、既定の枝の定義で動くので外せない。

## いつ効くか

- `issues` / `issue_comment` / `pull_request_target`: **既定の枝（main）にある物だけ**が動く。develop にマージしただけでは動かず、develop から main へのリリース後に効き始める。
- `pull_request_review` / `pull_request_review_comment`: 定義が PR 側の版になるので、develop に入ると、**develop 向けの PR で（main へのリリース前から）動き始める**。ただし実行するスクリプトは既定の枝（main）の物なので、main にスクリプトが入るまでは「既定の枝に無いので検査しません」と通知して成功で終わる（この 2 つのイベントだけ。ほかのイベントでスクリプトが無いのは異常なので `::error` を出して赤にする）。

## テストの流れ

- `pnpm test`（`script/test.mjs` の `testPublicContentCheck`）。`task ci:fast` と `node .github/ci/run.mjs js|local` の `js-test` 経由でも流れる。
- `.github/workflows/ci.yml` の `Public content check tests` ステップ（develop 向けの PR でも流れる）。
- 単独: `node --test tests/public-content-check.test.mjs`
- ワークフローの構文: `actionlint .github/workflows/public-content-check.yml`
