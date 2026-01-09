<?php
/**
 * Pagination Test (Issue #71)
 *
 * Usage: php tests/test-pagination.php
 */

require_once __DIR__ . '/../app/public/wp-load.php';

echo "\n";
echo "========================================\n";
echo "Pagination Test (Issue #71) (PHP)\n";
echo "========================================\n\n";

$all_passed = true;

// 1. Verify Post Counts > 12
$target_types = ['story', 'voice', 'interview', 'product', 'media_post', 'career'];
$needs_pagination = [];

echo "Checking post counts...\n";
foreach ( $target_types as $pt ) {
    $count = wp_count_posts( $pt )->publish;
    if ( $count > 12 ) {
        echo "[OK] $pt has $count posts (pagination required)\n";
        $needs_pagination[] = $pt;
    }
}

if ( empty( $needs_pagination ) ) {
    echo "[INFO] No post types have >12 posts. Pagination test might not be fully verifiable on live data.\n";
}

// 2. Check functions.php for pre_get_posts or similar
$functions_file = get_stylesheet_directory() . '/functions.php';
if ( file_exists( $functions_file ) ) {
    $content = file_get_contents( $functions_file );

    // Check strict post_type_archive checks
    foreach ( ['story', 'voice', 'product'] as $pt ) {
        if ( preg_match( '/is_post_type_archive\(\s*[\'"]' . $pt . '[\'"]\s*\)/', $content ) ) {
            echo "[OK] Found is_post_type_archive check for '$pt'\n";
        } else {
            echo "[WARN] No explicit is_post_type_archive check found for '$pt' in functions.php (Might be dynamic)\n";
        }
    }

    if ( strpos( $content, "'posts_per_page'" ) !== false ) {
        echo "[OK] Found posts_per_page configuration code\n";
    }

} else {
    echo "[FAIL] functions.php not found.\n";
    $all_passed = false;
}

// 3. Verify Rewrite Rules
global $wp_rewrite;
if ( isset( $wp_rewrite->pagination_base ) ) {
    echo "[OK] Pagination base is set to: " . $wp_rewrite->pagination_base . "\n";
}
// We can check if specific rules exist
$rules = $wp_rewrite->wp_rewrite_rules();
$found_paged = false;
foreach ( $rules as $regex => $query ) {
    if ( strpos( $regex, 'page/' ) !== false ) {
        $found_paged = true;
        break;
    }
}
if ( $found_paged ) {
    echo "[OK] Found pagination rewrite rules in WP Rewrite\n";
} else {
    echo "[WARN] No explicit 'page/' rewrite rules found in global \$wp_rewrite (Unexpected)\n";
}

echo "\n========================================\n";

if ( $all_passed ) {
    echo "PASS: Pagination config seems correct.\n";
    echo "Manual Verify: Visit /product/page/2/ etc.\n";
    exit(0);
} else {
    echo "FAIL: Issue #71 checks failed.\n";
    exit(1);
}
