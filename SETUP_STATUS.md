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
