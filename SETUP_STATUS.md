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

## Phase 3: YAGNI 削除

### 完了内容
- Docker dev 環境を 1 MySQL + 1 WordPress に縮退した。
- 残したもの:
  - `docker-compose.yml`
  - `.docker/wordpress/Dockerfile`
  - `.docker/wordpress/docker-entrypoint.sh`
  - `.docker/mysql/init-databases.sql`
  - `.docker/conf/*`
  - `.env.example` / `.env.docker.example` / local `.env`
- 削除したもの:
  - 旧 `muashi` テーマ本体、カスタム投稿タイプ、ACF/CF7/業務ロジック、ページテンプレート、画像/SCSS/JS。
  - 旧 `musashi-inquiry-approval` プラグイン。
  - GitHub Actions / GitHub 設定。
  - 旧テスト、VRT、Playwright、gulp、Taskfile、プロンプト/エージェント設定、ステージング同期設定。
  - Bedrock/Bogo 用 Dockerfile。
- 代わりに `wp-content/themes/designinserter-dev` を最小テーマとして作成した。
- `package.json` / `package-lock.json` を Design Inserter 用の最小 npm 設定に更新した。
- `docker compose config --quiet` で Compose 構文を確認済み。
- `SETUP_STATUS.md` 以外に `musashi` / `muashi` / `musashipaint` 参照が残っていないことを `rg` で確認済み。

### プレモーテム所見
- WordPress core は Docker volume にダウンロードする構成のため、volume が壊れた場合は `docker compose down -v` で再生成する。
- Phase 4 では `WP_AUTO_INSTALL=false` のまま起動し、インストール画面が表示されることを先に確認する。その後 WP-CLI で初期インストールする。
- プラグイン mount は `wp-content/plugins` ディレクトリ単位にしたため、Phase 5 で追加した `designinserter` が再起動なしでもコンテナ側に見える想定。

### 残課題
- 実機 Docker で volume reset、起動、install 画面確認、初期インストール、テーマ有効化確認を行う。
- local `.env` は git 管理対象外。

### 次 Phase 計画
- `docker compose down -v` の後、`docker compose up -d --build` を実行する。
- `http://localhost:8080` で WordPress install 画面を確認する。
- WP-CLI で初期インストールし、`designinserter-dev` テーマを有効化する。

## Phase 4: WordPress 初期化

### 完了内容
- 実機 Docker context は `orbstack` であることを確認した。
- OrbStack アプリを起動/再起動した。
- `docker compose config --quiet` による Compose 構文検証は Phase 3 で完了済み。

### ブロッカー
- `docker compose down -v`、`docker info`、`orb status` が daemon 応答待ちで停止した。
- OrbStack log に `VM hang` / `health check failed` / Docker port forward `context deadline exceeded` が出ている。
- そのため、この時点では以下を実機検証できていない:
  - `docker compose down -v`
  - `docker compose up -d --build`
  - `http://localhost:8080` の WordPress install 画面
  - WP-CLI による初期インストール
  - admin login / テーマ適用確認

### admin login 情報
- 予定値: `http://localhost:8080/wp-admin/`
- 予定ユーザー: `admin`
- 予定パスワード: `admin`
- 備考: Docker daemon 復旧後に WP-CLI で初期インストールして確定する。

### プレモーテム所見
- Docker/OrbStack VM が復旧しない限り、WordPress install 画面とプラグイン有効化の UI 確認は完了できない。
- `WP_AUTO_INSTALL=false` のため、daemon 復旧後はまず install 画面が出る想定。自動インストールに切り替える場合は `.env` の `WP_AUTO_INSTALL=true` に変更する。

### 残課題
- Docker daemon 復旧後、Phase 4 の実機検証を再実行する。
- Phase 5 の WordPress admin 表示・有効化確認も Docker 復旧後に実施する。

### 次 Phase 計画
- Docker に依存しない範囲で `designinserter` plugin skeleton を作成する。
- ローカル PHP が利用できる場合は PHP 構文検査を行う。
