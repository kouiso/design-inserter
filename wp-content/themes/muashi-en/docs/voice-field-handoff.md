# お客様の声CSVインポート＆フィールド改修 引き継ぎプロンプト

## このドキュメントの目的
stagingのデータを取り入れた後（All-in-One MigrationでDB上書き後）に、お客様の声データをCSVから再投入し、フィールド改修を適用する必要がある。
以下の内容を新しいAIセッションに渡すことで、同じ作業を再現できる。

---

## 依頼内容

お客様の声（`voice` カスタム投稿タイプ）について、以下を実行してください。
**staging取り込みでDBが上書きされているため、コード変更＋データ再投入の両方が必要です。**

1. テーマファイルのコード変更（4ファイル）
2. ACF JSON同期
3. お客様の声CSVエクスポート → インポートでデータ再投入

---

## 実装手順

### Step 1: コード変更（4ファイル）

#### 1-1. ACFフィールド定義の変更
- **ファイル**: `wp-content/themes/muashi/acf-json/group_voice_info.json`
- `field_voice_position`（部署・役職）のブロックを以下に置換:

```json
{
    "key": "field_voice_position",
    "label": "部署・役職",
    "name": "voice_position",
    "aria-label": "",
    "type": "textarea",
    "instructions": "例: 四輪デザイン部 CMFデザイン課 主幹（改行可） ｜ フィールド名: voice_position",
    "required": 0,
    "conditional_logic": 0,
    "wrapper": {
        "width": "",
        "class": "",
        "id": ""
    },
    "default_value": "",
    "maxlength": "",
    "rows": 3,
    "placeholder": "部署・役職を入力（改行可）",
    "new_lines": "br"
}
```

**変更ポイント:** `"type": "text"` → `"type": "textarea"`, `"rows": 3` 追加, `"new_lines": "br"` 追加, `"prepend"/"append"` 削除

#### 1-2. 一覧ページテンプレート
- **ファイル**: `wp-content/themes/muashi/page-voice.php`
- `voice_position` の出力箇所を変更:

```php
// Before:
<p class="archive__position"><?php echo esc_html( $voice_position ); ?></p>
// After:
<p class="archive__position"><?php echo nl2br( esc_html( $voice_position ) ); ?></p>
```

#### 1-3. 詳細ページテンプレート
- **ファイル**: `wp-content/themes/muashi/single-voice.php`
- `voice_position` の出力箇所を変更:

```php
// Before:
<p class="page__author-position"><?php echo esc_html($voice_position); ?></p>
// After:
<p class="page__author-position"><?php echo nl2br( esc_html( $voice_position ) ); ?></p>
```

#### 1-4. CSVインポートスクリプト
- **ファイル**: `wp-content/themes/muashi/inc/import-voice-csv.php`
- CSV読み込み後（`$title`, `$company`, `$position`, `$person_name` の取得直後）に追加:

```php
// 全角スペース → 半角スペースに変換
$company     = str_replace( '　', ' ', $company );
$position    = str_replace( '　', ' ', $position );
$person_name = str_replace( '　', ' ', $person_name );
```

### Step 2: ACF JSON同期
WordPress管理画面で同期を実行:
1. 管理画面 > カスタムフィールド
2. 「お客様の声情報」グループに「同期」ボタンが表示されるのでクリック

### Step 3: お客様の声データの再投入

#### 3-1. CSVインポート実行
以下のCSVファイルを使ってインポートを実行する:

```
C:\Users\suker\Downloads\voice-export-test2.csv
```

管理画面 > ツール > お客様の声CSVインポート でCSVパスを指定して実行。
**インポートは全削除→再投入方式。既存データは全て削除される。**

※CSVには全角スペースが含まれているが、インポートスクリプト（Step 1-4で変更済み）が自動で半角に変換する。

---

## CSVカラムマッピング

| CSV列 | 内容 | → WordPress |
|---|---|---|
| A (col 0) | タイトル（見出し） | `post_title` |
| B (col 1) | 会社名 | ACF: `voice_company` |
| C (col 2) | 部署・役職 | ACF: `voice_position`（**textarea / 改行可**） |
| D (col 3) | 氏名 | ACF: `voice_person_name` |
| E (col 4) | アイキャッチ画像ファイル名 | `_thumbnail_id`（メディアライブラリから検索） |
| F (col 5) | menu_order | `menu_order`（表示順） |
| G (col 6) | 本文 | `post_content`（Gutenbergブロック形式） |

---

## データ処理ルール

- **CSV厳守**: タイポ含めそのまま取り込む
- **全角スペース→半角スペース変換**: company, position, person_name の3フィールドに適用
- アイキャッチ画像: ファイル名でメディアライブラリから `_wp_attached_file` の末尾一致検索
- `menu_order`: CSVの行順（1始まり連番）

---

## インポートスクリプト

- **ファイル**: `wp-content/themes/muashi/inc/import-voice-csv.php`
- 管理画面「ツール > お客様の声CSVインポート」からアクセス
- エクスポート: `wp-content/themes/muashi/inc/export-voice-csv.php`
- 管理画面「ツール > お客様の声エクスポート」からアクセス

---

## 環境情報

- **PHP**: `C:\Users\suker\AppData\Roaming\Local\lightning-services\php-8.2.27+1\bin\win64\php.exe`
- **WP-CLI**: `C:\Users\suker\AppData\Local\Programs\Local\resources\extraResources\bin\wp-cli\wp-cli.phar`
- **PHP CLI設定**: `wp-content/themes/muashi/inc/php-cli.ini`（MySQL port 10011）
- **WordPress**: `c:\Users\suker\Local Sites\musashipaint\app\public`

---

## 注意事項

- staging取り込み後はACF JSONが上書きされている可能性があるので、Step 1のコード変更→Step 2のACF同期を必ず実行
- `nl2br(esc_html(...))` の順序は重要。`esc_html` → `nl2br` の順でXSS対策
- All-in-One Migrationでメディアファイルも上書きされるため、画像のattachment IDが変わる可能性あり。CSVインポートスクリプトはファイル名で再検索するので問題なし
