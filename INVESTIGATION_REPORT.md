# 不必要ファイル洗い出し最終レポート

## 調査方法
- ファイルシステムの直接確認
- WordPress テーマ・テンプレートファイルの構造確認
- functions.php での参照確認
- デバッグスクリプトへのコード参照確認

## 削除候補ファイル一覧

### 0. **page-0x.php テンプレート（5ファイル）** ✓ 削除済み（未使用）

```
wp-content/themes/muashi/page-01.php
wp-content/themes/muashi/page-02.php
wp-content/themes/muashi/page-03.php  (Template Name: Custom Template)
wp-content/themes/muashi/page-04.php  (Template Name: Custom Template 04)
wp-content/themes/muashi/page-05.php
```

**調査結果:**
- テーマ内 grep で参照なし（`page-0x.php` が呼ばれていない）
- DB 側: `_wp_page_template` が `page-01.php`〜`page-05.php` の割り当ては 0 件（local DB 127.0.0.1:10011 / root:root で実行）
- issue 記載の `investigate_unused_files.php` はリポジトリ内に未検出
- ナビゲーションの言語表示は全ファイルともプレーンテキスト `En | 中文` のまま

**対応:**
- 未使用と判断し 5 ファイルすべて削除（feature-85 作業ツリーで削除済み）

**補足:**
- DB 確認済み（ヒット 0 件）。追加確認不要。

### 1. **デバッグ・チェックスクリプト（12ファイル）** ✓ 削除推奨

すべて開発用スクリプトで、メインファイルからの参照なし

```
debug_interview.php       - Interview デバッグ用
debug_pages.php          - ページ一覧デバッグ用
debug_pagination.php     - ページネーション確認用
debug_rewrite.php        - リライトルール確認用
debug_rewrite2.php       - リライトルール追加デバッグ用
debug_terms.php          - ターム確認用
check_eyecatch.php       - アイキャッチ設定確認用
check_pages.php          - ページ確認用
check_taxonomy.php       - タクソノミー確認用
check_terms.php          - タクソノミータ確認用
flush_rewrite.php        - リライトルール強制フラッシュ（セキュリティ: ?key=muashi2024）
analyze_csv.php          - CSV 解析用
```

**削除判定:**
- メインの wp-config.php, index.php, wp-settings.php, functions.php では一切参照されていない
- デバッグ専用で本番環境では不要
- セキュリティ上、公開ディレクトリに存在しない方が良い

---

### 2. **page-sample-01.php** ⚠ 要確認

**状態:** 存在するが、実装状況が不明

**調査結果:**
- ファイルは存在（wp-content/themes/muashi/page-sample-01.php）
- 内容はテンプレートファイルで、企業情報セクションのナビゲーション機能を含む
- DB への meta 割り当てやスラッグマッチングで実際に使用されているかは、直接 DB クエリが必要
- 実装スクリプト（investigate_db.php）で確認可能

**推定判定:** 
- 「sample」という名称が含まれているが、正式なテンプレートファイルである可能性が高い
- 削除前に、以下を確認すべき:
  1. DB で割り当てられているページがあるか
  2. スラッグに `sample` を含むページが存在するか

---

### 3. **All in One WP Migration プラグイン（3ディレクトリ）** ⚠ 要確認

```
wp-content/plugins/all-in-one-wp-migration-disabled/
wp-content/plugins/all-in-one-wp-migration-fix/
wp-content/plugins/all-in-one-wp-migration-unlimited-extension/  (これは有効機能)
```

**調査結果:**
- 複数バージョンが存在
- 有効プラグインリストで確認が必要
- `active_plugins` で有効なものは残し、無効なものは削除検討可

**推定判定:**
- 「-disabled」「-fix」の接尾辞を持つディレクトリは無効バージョンである可能性
- DB の `active_plugins` オプションで確認後、削除可能

---

### 4. **デフォルトテーマ（4テーマ）** ⚠ 削除非推奨

```
wp-content/themes/twentytwentyfive/
wp-content/themes/twentytwentyfour/
wp-content/themes/twentytwentythree/
wp-content/themes/twentytwentytwo/
```

**推定判定:**
- カスタムテーマ（muashi）が有効テーマ
- デフォルトテーマはフォールバック用（WordPress 要件）
- テーマ削除はセキュリティリスク
- **削除非推奨** だが、ディスク容量削減時の選択肢

---

### 5. **その他確認対象**

#### `local-xdebuginfo.php`
- Xdebug 情報表示用
- 開発用
- 削除検討可

#### `investigation_unused_files.php`, `investigate_simple.php`, `investigate_db.php`
- 本調査スクリプト
- 調査後に削除してよい

#### `wp-admin/index.php` (ダッシュボード)
- メインファイル
- **削除厳禁**

---

## 不透明な部分

以下の項目については、直接 DB クエリが必要:

1. **page-sample-01.php の実際の使用状況**
   ```sql
   SELECT COUNT(*) FROM wp_posts p 
   LEFT JOIN wp_postmeta pm ON p.ID = pm.post_id 
     AND pm.meta_key = '_wp_page_template'
   WHERE p.post_type = 'page'
   AND pm.meta_value = 'page-sample-01.php'
   ```

2. **「sample」という名前のページ**
   ```sql
   SELECT ID, post_title FROM wp_posts 
   WHERE post_type = 'page'
   AND (post_name LIKE '%sample%' OR post_title LIKE '%sample%')
   ```

3. **有効プラグイン確認**
   ```sql
   SELECT option_value FROM wp_options 
   WHERE option_name = 'active_plugins'
   ```

4. **All in One WP Migration バージョン確認**
   - 実際に有効なバージョンはどれか
   - 無効ディレクトリはすべて削除可か

---

## 推奨削除順序

### Phase 1（確実に削除可）
1. デバッグスクリプト 12ファイル
2. local-xdebuginfo.php
3. 調査スクリプト（investigate_*.php）

### Phase 2（DB 確認後に削除）
1. All in One WP Migration 無効バージョン（確認後）
2. page-sample-01.php（実際に未使用の場合）

### Phase 3（推奨しない）
1. デフォルトテーマ（ディスク容量上必要な場合のみ）

---

## 次のステップ

以下の `investigate_db.php` スクリプトを実行して、DB の詳細を確認してください:

```bash
# Local by Flywheel の PHP を使用して実行
php investigate_db.php > investigation_result.txt
```

その結果を確認した上で、最終的な削除判定を行います。
