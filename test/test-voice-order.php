<?php
/**
 * Voice Order Test
 *
 * Usage: php tests/test-voice-order.php
 */

define( 'DB_HOST', '127.0.0.1:10011' );
require_once __DIR__ . '/../wp-load.php';

echo "\n";
echo "========================================\n";
echo "Voice Post Order Test (PHP)\n";
echo "========================================\n\n";

global $wpdb;

// 実際のDBデータに基づいた検証
$query = "SELECT ID, post_title, menu_order FROM $wpdb->posts WHERE post_type='voice' AND post_status='publish' ORDER BY menu_order ASC";
$results = $wpdb->get_results( $query );

if ( empty( $results ) ) {
    echo "ERROR: No voice posts found\n";
    exit(1);
}

echo "Found " . count( $results ) . " voice posts\n\n";

// 実際のproduction環境のデータ（ID, menu_order, タイトル）
$expected_order = [
    1 => ['id' => 202, 'title' => '内装加飾色開発の最重要パートナー'],
    2 => ['id' => 293, 'title' => '本当のプロフェッショナル'],
    3 => ['id' => 290, 'title' => '独自の気風が育む豊かな人間性'],
    4 => ['id' => 299, 'title' => '感性を分かり合える存在'],
    5 => ['id' => 305, 'title' => '常に挑戦する姿勢を手本に'],
];

$all_passed = true;
$count = 0;

foreach ( $results as $post ) {
    $count++;
    
    // 期待される最大数まで検証
    if ( ! isset( $expected_order[ $count ] ) ) {
        echo "[WARN] Extra voice post found: #$count | ID={$post->ID} | {$post->post_title}\n";
        continue;
    }

    $id          = (int) $post->ID;
    $title       = $post->post_title;
    $menu_order  = (int) $post->menu_order;
    $expected    = $expected_order[ $count ];

    $id_match    = ( $id === $expected['id'] );
    $order_match = ( $menu_order === $count );

    if ( $id_match && $order_match ) {
        echo "[OK] [$count] menu_order=$menu_order | ID=$id | $title\n";
    } else {
        echo "[FAIL] [$count] Mismatch (ID=$id)\n";
        echo "  Expected: menu_order=$count, ID={$expected['id']}, title='{$expected['title']}'\n";
        echo "  Actual: menu_order=$menu_order, ID=$id, title='$title'\n";
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
