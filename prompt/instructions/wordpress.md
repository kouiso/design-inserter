# WordPress 開発ルール (WordPress Development Rules)
<!-- WordPress Development Rules -->

## 1. WordPress コーディング規約
<!-- WordPress Coding Standards -->

**Always adhere to [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/).**
<!-- 常に WordPress Coding Standards に準拠すること。 -->

### PHP ファイル規約
<!-- PHP File Standards -->

- **Indent**: Tabs (space conversion forbidden)
<!-- インデント: タブ（スペース変換禁止） -->
- **Function names**: Snake case (`my_function_name`)
<!-- 関数名: スネークケース（`my_function_name`） -->
- **Class names**: Pascal case with underscores (`My_Class_Name`)
<!-- クラス名: パスカルケース（`My_Class_Name`） -->
- **Constants**: All uppercase with underscores (`MY_CONSTANT_NAME`)
<!-- 定数: 大文字とアンダースコア（`MY_CONSTANT_NAME`） -->

### コメント規約
<!-- Comment Standards -->

- Japanese required for all comments
<!-- コメントは全て日本語 -->
- Avoid self-explanatory comments, explain only "Why"
<!-- 自明なコメントは避け、「Why」のみ説明 -->

## 2. セキュリティ必須事項
<!-- Security Requirements -->

### 2.1. 出力エスケープ（必須）
<!-- Output Escaping (Required) -->

**All output must be escaped.**
<!-- 全ての出力は必ずエスケープすること。 -->

```php
// ✅ Correct
echo esc_html( $text );
echo esc_attr( $attribute );
echo esc_url( $url );
echo wp_kses_post( $html_content );

// ❌ Forbidden - No escaping
echo $text;
echo $attribute;
```

### 2.2. Nonce 検証（必須）
<!-- Nonce Verification (Required) -->

**All form processing must include nonce verification.**
<!-- 全てのフォーム処理にはNonce検証を含めること。 -->

```php
// フォーム側
wp_nonce_field( 'my_action_nonce', 'my_nonce_field' );

// 処理側
if ( ! wp_verify_nonce( $_POST['my_nonce_field'], 'my_action_nonce' ) ) {
    wp_die( '不正なリクエストです' );
}
```

### 2.3. ケイパビリティチェック（必須）
<!-- Capability Check (Required) -->

**Admin functions must include permission checks.**
<!-- 管理機能には権限チェックを含めること。 -->

```php
if ( ! current_user_can( 'manage_options' ) ) {
    wp_die( '権限がありません' );
}
```

### 2.4. データベースエスケープ（必須）
<!-- Database Escaping (Required) -->

**Always use `$wpdb->prepare()` for database queries.**
<!-- データベースクエリには必ず `$wpdb->prepare()` を使用すること。 -->

```php
// ✅ Correct
$results = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM {$wpdb->posts} WHERE post_type = %s",
        'post'
    )
);

// ❌ Forbidden - Direct variable embedding
$results = $wpdb->get_results(
    "SELECT * FROM {$wpdb->posts} WHERE post_type = '{$type}'"
);
```

## 3. テーマ開発規約
<!-- Theme Development Standards -->

### 3.1. テンプレート階層
<!-- Template Hierarchy -->

- Respect WordPress template hierarchy
<!-- WordPressテンプレート階層を尊重 -->
- Use `get_template_part()` to separate parts
<!-- `get_template_part()` でパーツを分離 -->

```php
// ✅ Correct
get_template_part( 'template-parts/content', get_post_type() );

// ❌ Not recommended - Direct include
include( 'template-parts/content.php' );
```

### 3.2. カスタムフィールド
<!-- Custom Fields -->

- Use ACF or `get_post_meta()`
<!-- ACF または `get_post_meta()` を使用 -->

```php
// ACF
$value = get_field( 'field_name' );

// WordPress native
$value = get_post_meta( get_the_ID(), 'meta_key', true );
```

### 3.3. 翻訳対応
<!-- Translation Support -->

- Use `__()`, `_e()`, `esc_html__()` etc.
<!-- `__()`, `_e()`, `esc_html__()` 等を使用 -->

```php
echo esc_html__( 'テキスト', 'muashi' );
_e( 'テキスト', 'muashi' );
```

### 3.4. アセット登録
<!-- Asset Registration -->

- Use `wp_enqueue_style()`, `wp_enqueue_script()`
<!-- `wp_enqueue_style()`, `wp_enqueue_script()` を使用 -->

```php
function muashi_enqueue_assets() {
    wp_enqueue_style(
        'muashi-style',
        get_stylesheet_uri(),
        array(),
        filemtime( get_stylesheet_directory() . '/style.css' )
    );
}
add_action( 'wp_enqueue_scripts', 'muashi_enqueue_assets' );
```

## 4. プラグイン開発規約
<!-- Plugin Development Standards -->

### 4.1. プラグインヘッダー
<!-- Plugin Header -->

```php
<?php
/**
 * Plugin Name: プラグイン名
 * Plugin URI: https://example.com/
 * Description: プラグインの説明
 * Version: 1.0.0
 * Author: 作者名
 * Text Domain: plugin-textdomain
 */
```

### 4.2. アクティベーション/デアクティベーション
<!-- Activation/Deactivation -->

```php
register_activation_hook( __FILE__, 'my_plugin_activate' );
register_deactivation_hook( __FILE__, 'my_plugin_deactivate' );
```

### 4.3. アンインストール時のクリーンアップ
<!-- Uninstall Cleanup -->

- Create `uninstall.php` or use `register_uninstall_hook()`
<!-- `uninstall.php` を作成するか `register_uninstall_hook()` を使用 -->

## 5. WordPress 固有の注意事項
<!-- WordPress Specific Precautions -->

### 5.1. データベース操作
<!-- Database Operations -->

- Always escape when using `$wpdb`
<!-- `$wpdb` 使用時は必ずエスケープ -->
- Prefer WordPress functions (`wp_insert_post()`, `update_post_meta()`, etc.)
<!-- WordPress関数を優先（`wp_insert_post()`, `update_post_meta()` 等） -->

### 5.2. AJAX処理
<!-- AJAX Processing -->

- Use `wp_ajax_` / `wp_ajax_nopriv_` hooks
<!-- `wp_ajax_` / `wp_ajax_nopriv_` フック使用 -->
- Always include nonce verification
<!-- 必ずNonce検証を含める -->

```php
add_action( 'wp_ajax_my_action', 'my_ajax_handler' );
add_action( 'wp_ajax_nopriv_my_action', 'my_ajax_handler' );

function my_ajax_handler() {
    check_ajax_referer( 'my_nonce', 'security' );
    // 処理
    wp_send_json_success( $data );
}
```

### 5.3. REST API
<!-- REST API -->

- Implement proper authentication and permission checks
<!-- 適切な認証・権限チェック実装 -->

```php
register_rest_route( 'my-namespace/v1', '/endpoint', array(
    'methods'             => 'GET',
    'callback'            => 'my_rest_callback',
    'permission_callback' => function() {
        return current_user_can( 'edit_posts' );
    },
) );
```

### 5.4. キャッシュ
<!-- Caching -->

- Consider using Transients API
<!-- トランジェントAPI活用検討 -->

```php
$data = get_transient( 'my_cache_key' );
if ( false === $data ) {
    $data = expensive_operation();
    set_transient( 'my_cache_key', $data, HOUR_IN_SECONDS );
}
```

## 6. muashi テーマ固有ルール
<!-- muashi Theme Specific Rules -->

### 6.1. ディレクトリ構造
<!-- Directory Structure -->

```
muashi/
├── functions.php       # メイン関数ファイル
├── style.css          # テーマ情報
├── header.php         # ヘッダー
├── footer.php         # フッター
├── index.php          # メインテンプレート
├── single.php         # 単一投稿
├── page.php           # 固定ページ
├── archive.php        # アーカイブ
├── template-parts/    # テンプレートパーツ
├── src/
│   └── scss/          # SCSS ソース
├── assets/
│   ├── css/           # コンパイル済みCSS
│   ├── js/            # JavaScript
│   └── images/        # 画像
└── inc/               # 追加機能
```

### 6.2. SCSS コンパイル
<!-- SCSS Compilation -->

- Source: `src/scss/`
- Output: `assets/css/`
- Use gulp for compilation
<!-- gulpでコンパイル -->

### 6.3. 既存パターン踏襲
<!-- Follow Existing Patterns -->

**Always investigate existing implementation before making changes.**
<!-- 変更前に必ず既存の実装を調査すること。 -->

- Check similar templates
<!-- 類似テンプレートを確認 -->
- Check related functions
<!-- 関連する関数を確認 -->
- Check CSS class naming conventions
<!-- CSSクラス命名規則を確認 -->
