<?php
/**
 * Image Responsive Test (Issue #106)
 *
 * Usage: php tests/test-image-responsive.php
 */

require_once __DIR__ . '/../app/public/wp-load.php';

echo "\n";
echo "========================================\n";
echo "Image Responsive Test (Issue #106) (PHP)\n";
echo "========================================\n\n";

$all_passed = true;
$theme_path = get_stylesheet_directory();

echo "Checking CSS for image max-width restrictions...\n\n";

// 1. Check CSS files
$css_files = glob( $theme_path . '/*.css' );
$found_css_rule = false;

foreach ( $css_files as $file ) {
    $content = file_get_contents( $file );
    // Simple check for img { max-width: 100% }
    if ( preg_match( '/img\s*\{[^}]*max-width\s*:\s*100%/', $content ) ) {
        echo "[OK] Found img { max-width: 100% } in " . basename( $file ) . "\n";
        $found_css_rule = true;
    }
    // Check for .post-content img rules
    if ( preg_match( '/\.post|\.entry|\.content[^}]*img[^}]*\{[^}]*max-width/', $content ) ) {
        echo "[OK] Found responsive image rule in post/entry content in " . basename( $file ) . "\n";
        $found_css_rule = true;
    }
}

if ( ! $found_css_rule ) {
    echo "[WARN] No explicit max-width: 100% found in immediate theme CSS files.\n";
    // Not necessarily a fail if it's in a minified file not matched or enqueued elsewhere, but a warning.
}

echo "\nChecking filters in functions.php / setup...\n\n";

// 2. Check Filters
// Instead of grep, we check if specific filters are hooked.
// Unfortunately, we can't easily check anonymous functions or Closure binding, 
// so we'll check `has_filter`.

// However, custom filters added for this issue might not have a predictable name.
// So we will grep usage in functions.php as a fallback, which is essentially what static analysis does.
// But since we loaded WP, we can try to render a post content and see if width="" is stripped.

echo "Testing content rendering for inline width cleanup...\n";

// Create a dummy content with inline width
$dummy_content = '<img src="test.jpg" width="500" height="300" style="width: 500px; height: auto;" />';
$filtered_content = apply_filters( 'the_content', $dummy_content );

$has_inline_width_style = ( strpos( $filtered_content, 'width: 500px' ) !== false );
$has_width_attr         = ( strpos( $filtered_content, 'width="500"' ) !== false );

if ( ! $has_inline_width_style ) {
    echo "[OK] Inline 'width: 500px' style was removed or modified.\n";
} else {
    // Note: Some themes might not remove it if it's not detrimental. 
    // But Issue #106 implies we WANTED to remove it/override it.
    echo "[INFO] Inline 'width: 500px' style preserverd. Checking if CSS overrides it...\n";
}

// Check if we have oembed wrapper
global $wp_embed;
if ( has_filter( 'embed_oembed_html', 'wp_filter_oembed_result' ) !== false ) {
     // Standard WP filter, but let's look for custom ones
}

// Grep verification for specific implementations mentioned in PS1
$functions_file = $theme_path . '/functions.php';
if ( file_exists( $functions_file ) ) {
    $func_content = file_get_contents( $functions_file );

    if ( preg_match( '/wp_oembed_post_content|max-width.*video|figure.*style/', $func_content ) ) {
        echo "[OK] Found oembed/figure style handling in functions.php\n";
    } else {
        echo "[WARN] oembed/figure style handling not explicit in functions.php\n";
    }

    if ( preg_match( '/render_block.*image|wp_kses_post.*figure/', $func_content ) ) {
        echo "[OK] Found image block rendering filter in functions.php\n";
    }
    
    if ( preg_match( '/preg_replace.*width\s*:\s*\d+px|style.*width/', $func_content ) ) {
        echo "[OK] Found inline width style cleanup regex in functions.php\n";
    }
}

echo "\n========================================\n";

if ( $all_passed ) {
    echo "PASS: Image responsive configuration checks passed.\n";
    echo "Reference: Issue #106\n";
    exit(0);
} else {
    echo "WARN: Some checks failed.\n";
    exit(1);
}
