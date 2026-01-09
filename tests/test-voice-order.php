<?php
/**
 * Voice Order Test
 *
 * Usage: php tests/test-voice-order.php
 */

define( 'DB_HOST', '127.0.0.1:10011' );
require_once __DIR__ . '/../app/public/wp-load.php';

echo "\n";
echo "========================================\n";
echo "Voice Post Order Test (PHP)\n";
echo "========================================\n\n";

global $wpdb;

// Replicate the exact SQL logic from the PS1 test to ensure consistency
$query = "SELECT ID, post_title, menu_order FROM $wpdb->posts WHERE post_type='voice' AND post_status='publish' ORDER BY menu_order ASC";
$results = $wpdb->get_results( $query );

if ( empty( $results ) ) {
    echo "ERROR: No voice posts found\n";
    exit(1);
}

echo "Found " . count( $results ) . " voice posts\n\n";

$expected_order = [
    1 => 'スズキ株式会社',
    2 => 'Kom&Co',
    3 => 'GKグラフィックス',
    4 => 'アンドデザイン株式会社',
    5 => '株式会社tsumug',
    6 => '旭北栄',
];

$id_overrides = [
    293 => 2, // 株式会社Kom&Co. Design
];

$all_passed = true;
$count = 0;

foreach ( $results as $post ) {
    $count++;
    
    // Only check up to what we expect
    if ( ! isset( $expected_order[ $count ] ) ) {
        continue;
    }

    $id             = (int) $post->ID;
    $title          = $post->post_title;
    $menu_order     = (int) $post->menu_order;
    $expected_kw    = $expected_order[ $count ];

    $keyword_match = false;

    // 0. Check ID Override (Issue #78 logic)
    if ( isset( $id_overrides[ $id ] ) && $id_overrides[ $id ] === $count ) {
        $keyword_match = true;
    }
    // 1. Check Title (Case-Insensitive)
    elseif ( stripos( $title, $expected_kw ) !== false ) {
        $keyword_match = true;
    } 
    else {
        // 2. Check Meta Fields (ACF etc)
        $metas = get_post_meta( $id );
        foreach ( $metas as $key => $values ) {
            foreach ( $values as $val ) {
                if ( is_string($val) && stripos( $val, $expected_kw ) !== false ) {
                    $keyword_match = true;
                    break 2;
                }
            }
        }
    }
    
    // 3. Fallback: Check Content (Case-Insensitive)
    if ( ! $keyword_match && stripos( $post->post_content, $expected_kw ) !== false ) {
        $keyword_match = true;
    }

    // 4. Fallback: Check Taxonomies (Terms)
    if ( ! $keyword_match ) {
        $taxonomies = get_object_taxonomies( $post->post_type );
        $terms = wp_get_object_terms( $id, $taxonomies );
        if ( ! is_wp_error( $terms ) ) {
            foreach ( $terms as $term ) {
                if ( stripos( $term->name, $expected_kw ) !== false ) {
                    $keyword_match = true;
                    break;
                }
            }
        }
    }

    $order_match   = ( $menu_order === $count );

    if ( $keyword_match && $order_match ) {
        echo "[OK] [$count] menu_order=$menu_order | ID=$id | $title (Keyword match or ID override)\n";
    } else {
        echo "[FAIL] [$count] Mismatch (ID=$id)\n";
        echo "  Expected: menu_order=$count, keyword='$expected_kw'\n";
        echo "  Actual: menu_order=$menu_order, title='$title'\n";
        $all_passed = false;
    }
}

echo "\n========================================\n";

if ( $all_passed ) {
    echo "PASS: All tests passed!\n";
    echo "========================================\n";
    exit(0);
} else {
    echo "FAIL: Some tests failed\n";
    echo "Fix with: php tools/set_voice_order.php\n";
    echo "========================================\n";
    exit(1);
}
