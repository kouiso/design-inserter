---
applyTo: "**/*.php"
---

# WordPress Development Rules

## Coding Standards

- **Indentation**: Tabs (space conversion forbidden)
- **Function names**: snake_case + prefix (`muashi_function_name`)
- **Class names**: PascalCase with underscores (`My_Class_Name`)
- **Constants**: UPPER_CASE (`MY_CONSTANT_NAME`)
- **Comments**: All in Japanese, "Why" only

## Security Requirements

### Output Escaping

```php
echo esc_html( $text );
echo esc_attr( $attribute );
echo esc_url( $url );
echo wp_kses_post( $html_content );
```

### Nonce Verification

```php
// フォーム側
wp_nonce_field( 'my_action_nonce', 'my_nonce_field' );

// 処理側
if ( ! wp_verify_nonce( $_POST['my_nonce_field'], 'my_action_nonce' ) ) {
	wp_die( '不正なリクエストです' );
}
```

### Capability Check

```php
if ( ! current_user_can( 'manage_options' ) ) {
	wp_die( '権限がありません' );
}
```

### Database Escaping

```php
$results = $wpdb->get_results(
	$wpdb->prepare( "SELECT * FROM {$wpdb->posts} WHERE post_type = %s", 'post' )
);
```

## Theme Development

- Respect WordPress template hierarchy; use `get_template_part()` for separation
- Custom fields via ACF or `get_post_meta()`
- Register assets via `wp_enqueue_style()` / `wp_enqueue_script()`
- Conditional loading (enqueue scripts/styles only on pages that need them)
- i18n: use `esc_html__()`, `_e()`, etc. (text domain: `muashi`)

## AJAX / REST API

```php
// AJAX: Nonce verification required
add_action( 'wp_ajax_my_action', 'muashi_ajax_handler' );
function muashi_ajax_handler() {
	check_ajax_referer( 'my_nonce', 'security' );
	wp_send_json_success( $data );
}

// REST API: Permission callback required
register_rest_route( 'muashi/v1', '/endpoint', [
	'methods'             => 'GET',
	'callback'            => 'muashi_rest_callback',
	'permission_callback' => function() { return current_user_can( 'edit_posts' ); },
] );
```

## muashi Theme Structure

```
muashi/
├── functions.php           # Main functions
├── header.php / footer.php
├── template-parts/         # Template parts
├── src/scss/               # SCSS source
├── assets/css|js|images/   # Compiled assets
└── inc/                    # Additional includes
```

- SCSS compilation: `src/scss/` → `assets/css/` (via gulp)
- **Always investigate existing implementation before making changes** (similar templates, related functions, CSS naming)

## Caching

```php
$data = get_transient( 'my_cache_key' );
if ( false === $data ) {
	$data = expensive_operation();
	set_transient( 'my_cache_key', $data, HOUR_IN_SECONDS );
}
```
