# 製品CSVインポート 引き継ぎプロンプト

## このドキュメントの目的
stagingの値を取り入れた後に、製品データのCSVインポートを再実行する必要がある。
以下の内容を新しいAIセッションに渡すことで、同じ作業を再現できる。

---

## 依頼内容

製品データCSVから、WordPressの `product` カスタム投稿タイプにデータを再投入してください。
**既存の製品データは全て削除して、CSVから新規作成します。**

---

## 実装済みの仕組み（コード変更は不要）

以下は全て実装済み。**コードの変更は不要で、インポートの再実行のみ必要。**

### 1. CSVインポートスクリプト
- **ファイル**: `wp-content/themes/muashi/inc/import-products-csv.php`
- 管理画面「ツール > 製品CSVインポート」からもアクセス可能
- WP-CLIからも実行可能（後述）

### 2. ショートコード `[product_field]`
- **登録場所**: `wp-content/themes/muashi/functions.php`
- `[product_field name="フィールド名"]` で投稿のACFカスタムフィールド値を表示
- `the_content()` 経由で自動展開される

### 3. ACFフィールド（6つ）
- **定義ファイル**: `wp-content/themes/muashi/acf-json/group_product_info.json`
- `product_name_trademark_en` - 製品名（英語/商標）
- `product_line_number` - ライン番号
- `product_solvent_type` - 溶剤・水系・無溶剤系分類
- `product_paint_type` - 塗料別分類
- `product_resin_type` - 樹脂別分類
- `product_remarks` - 備考（新規追加済み）

### 4. タクソノミー（5つ）
- `product_application` (用途でえらぶ) - 8ターム
- `product_material` (基材でえらぶ) - 12ターム
- `product_design` (意匠性でえらぶ) - 8ターム
- `product_function` (機能でえらぶ) - 7ターム
- `product_environment` (環境キーワードでえらぶ) - 8ターム

---

## CSVカラムマッピング

| CSV列 | 内容 | → WordPress |
|---|---|---|
| A (col 0) | 日本語品名（商標） | `post_title`（そのまま使用） |
| B (col 1) | 英語品名（商標） | ACF: `product_name_trademark_en` |
| C (col 2) | ライン番号 | ACF: `product_line_number` |
| D (col 3) | 溶剤・水系・無溶剤系分類 | ACF: `product_solvent_type` |
| E (col 4) | 塗料別分類 | ACF: `product_paint_type` |
| F (col 5) | 樹脂別分類 | ACF: `product_resin_type` |
| G (col 6) | 備考 | ACF: `product_remarks` |
| H (col 7) | 説明コメント | `post_content` に埋め込み |
| I-P (col 8-15) | 用途でえらぶ ○/× | taxonomy: `product_application` |
| Q-AB (col 16-27) | 基材でえらぶ ○/× | taxonomy: `product_material` |
| AC-AJ (col 28-35) | 意匠性でえらぶ ○/× | taxonomy: `product_design` |
| AK-AQ (col 36-42) | 機能でえらぶ ○/× | taxonomy: `product_function` |
| AR-AY (col 43-50) | 環境キーワードでえらぶ ○/× | taxonomy: `product_environment` |

---

## post_content のフォーマット

インポート時に自動生成される。ショートコードでACFフィールド値を動的表示：

```
製品名（商標）：[product_field name="product_name_trademark_en"]
ライン番号：[product_field name="product_line_number"]
[product_field name="product_solvent_type"]
[product_field name="product_paint_type"]
[product_field name="product_resin_type"]
[product_field name="product_remarks"]

【製品概要】

{CSVの説明コメント}

【製品カタログ】

準備中
```

---

## データ処理ルール

- **CSV厳守**: タイポ含めそのまま取り込む。改行も保持
- **唯一の変換**: 全角スペース → 半角スペースに統一
- 単一行フィールドの末尾改行のみ `trim()` で除去
- ○ と 〇（全角丸）の両方をタクソノミー紐付け判定対象
- 空セルも×と同じ扱い（○/〇がある場合のみタームに紐付け）
- 同名製品が複数ある場合 → 別製品として投稿
- `menu_order`: CSVの行順（1始まり連番、CSVの下ほど大きい値）
- CSVヘッダー: 先頭4行スキップ（ヘッダー3行 + 空行1行）

---

## インポート実行手順

### 方法A: WP-CLI（推奨）

1. `wp-content/themes/muashi/inc/run-csv-import.php` の `$csv_path` を新しいCSVファイルのパスに更新
2. 以下のコマンドを実行：

```bash
"C:\Users\suker\AppData\Roaming\Local\lightning-services\php-8.2.27+1\bin\win64\php.exe" -c "c:\Users\suker\Local Sites\musashipaint\app\public\wp-content\themes\muashi\inc\php-cli.ini" "C:\Users\suker\AppData\Local\Programs\Local\resources\extraResources\bin\wp-cli\wp-cli.phar" --path="c:\Users\suker\Local Sites\musashipaint\app\public" eval-file "wp-content/themes/muashi/inc/run-csv-import.php"
```

### 方法B: 管理画面
1. WordPress管理画面 > ツール > 製品CSVインポート
2. CSVファイルパスを入力して「インポート実行」

---

## 環境情報

- **PHP**: `C:\Users\suker\AppData\Roaming\Local\lightning-services\php-8.2.27+1\bin\win64\php.exe`
- **WP-CLI**: `C:\Users\suker\AppData\Local\Programs\Local\resources\extraResources\bin\wp-cli\wp-cli.phar`
- **PHP CLI設定**: `wp-content/themes/muashi/inc/php-cli.ini`（MySQL port 10011）
- **WordPress**: `c:\Users\suker\Local Sites\musashipaint\app\public`

---

## 注意事項

- stagingを取り入れた後、ACF JSONの同期状態に注意。管理画面のACF > ツール > 同期で確認
- CSVファイルのパスが変わる場合は `run-csv-import.php` を更新する
- インポートスクリプトは既存データを全削除してから投入するので、手動で追加した製品データがある場合は注意
- 製品詳細ページ（`single-product.php`）は `the_content()` のみで表示（product-info-displayテンプレートは使わない）
- 製品一覧ページ（`page-product.php`）は `product-info-display` テンプレートパーツで表示
