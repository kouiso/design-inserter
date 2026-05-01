# SETUP_STATUS

## Phase 1: Clone & Rename

### 完了内容
- `/Users/kouiso/ghq/ritmo-inc/` を作成済み。
- `https://github.com/ritmo-inc/musashipaint` を clone 済み。
- `musashipaint` ディレクトリを `wordpress-plugin-designinserter` に rename 済み。
- git remote `origin` を削除済み。リモート push は行っていない。
- 置換対象を確認:
  - root `README.md`: 存在しない。
  - `composer.json`: 存在しない。
  - `package.json`: `musashipaint` 文字列なし。
  - `docker-compose.yml`: `musashipaint` 文字列なし。ただし `musashi` 系のサービス名・DB 名は Phase 3 で削除/汎用化対象。

### プレモーテム所見
- 旧プロジェクト名は `musashipaint` だけでなく `musashi` / `muashi` として多数残っているため、単純置換だけではプラグイン開発環境として不十分。
- Docker Compose は JP/EN/Bedrock の複数環境を含んでおり、そのまま起動すると不要なサービス・DB・テーマ依存が残る。

### 残課題
- テーマを 1 つに絞る。
- musashipaint 固有のテーマ・プラグイン・CI・テスト・プロンプト類を削除する。
- Docker を 1 WordPress + 1 DB の構成に整理する。

### 次 Phase 計画
- `wp-content/themes/muashi` と `wp-content/themes/muashi-en` を比較し、プラグイン開発用に残すテーマを決定する。

## Phase 2: テーマ 1 個に絞る

### 完了内容
- `muashi` と `muashi-en` を比較:
  - どちらも 215 ファイルで、`functions.php` は 2,000 行超。どちらもプラグイン開発用としては重い。
  - `muashi` は既存 Docker の JP WordPress デフォルトテーマ。
  - `muashi-en` は英語サイト用の差分を持つ重複テーマで、今回の `/css-stock/ja` 検証軸から外れる。
- `wp-content/themes/muashi` を残した。
- `wp-content/themes/muashi-en` を完全削除した。

### プレモーテム所見
- 残した `muashi` も業務ロジックが多く、この時点ではまだ「シンプル」とは言えない。
- Phase 3 で `functions.php`、カスタム投稿タイプ、ACF/CF7 依存、ページテンプレートを削除または最小化しないと、素の WordPress 検証に失敗する可能性が高い。

### 残課題
- `muashi` をプラグイン開発用の最小テーマへ縮退する。
- Docker Compose から EN/Bedrock サービス参照を削除する。

### 次 Phase 計画
- musashipaint 固有のテーマロジック、既存プラグイン、GitHub Actions、テスト/プロンプト類を削除する。
- Docker 開発環境だけを汎用 WordPress プラグイン開発用に残す。
