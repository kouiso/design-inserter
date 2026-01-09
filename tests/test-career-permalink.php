<?php
/**
 * Career Permalink Test (Issue #102)
 *
 * Usage: php tests/test-career-permalink.php
 */

require_once __DIR__ . '/../app/public/wp-load.php';

echo "\n";
echo "========================================\n";
echo "Career Permalink Test (Issue #102) (PHP)\n";
echo "========================================\n\n";

$all_passed = true;

// 1. Check Post Types Existence and Counts
$post_types = ['career', 'interview'];

foreach ( $post_types as $pt ) {
    $count = wp_count_posts( $pt );
    if ( isset( $count->publish ) ) {
        echo "[OK] $pt posts found: " . $count->publish . "\n";
    } else {
        echo "[WARN] No published $pt posts found (or type definition missing?)\n";
    }
}

echo "\nChecking register_post_type() configuration...\n\n";

// 2. Check Rewrite Rules via global $wp_post_types
global $wp_post_types;

// Check Career
if ( isset( $wp_post_types['career'] ) ) {
    $career_obj = $wp_post_types['career'];
    $rewrite = $career_obj->rewrite;

    if ( is_array( $rewrite ) && isset( $rewrite['slug'] ) && $rewrite['slug'] === 'career' ) {
        echo "[OK] career post type has correct rewrite slug: 'career'\n";
    } else {
        echo "[FAIL] career post type rewrite slug incorrect. Got: " . print_r($rewrite['slug'] ?? 'null', true) . "\n";
        $all_passed = false;
    }
} else {
    echo "[FAIL] Post type 'career' is not registered.\n";
    $all_passed = false;
}

// Check Interview
if ( isset( $wp_post_types['interview'] ) ) {
    $interview_obj = $wp_post_types['interview'];
    $rewrite = $interview_obj->rewrite;

    // 期待値: 'career/interview'
    if ( is_array( $rewrite ) && isset( $rewrite['slug'] ) && $rewrite['slug'] === 'career/interview' ) {
        echo "[OK] interview post type has correct rewrite slug: 'career/interview'\n";
    } else {
        echo "[FAIL] interview post type rewrite slug incorrect. Expected 'career/interview', Got: " . print_r($rewrite['slug'] ?? 'null', true) . "\n";
        $all_passed = false;
    }
} else {
    echo "[FAIL] Post type 'interview' is not registered.\n";
    $all_passed = false;
}

echo "\n========================================\n";

if ( $all_passed ) {
    echo "PASS: Career permalink configuration is correct!\n";
    exit(0);
} else {
    echo "FAIL: Career permalink configuration has issues\n";
    echo "Reference: Issue #102\n";
    exit(1);
}
