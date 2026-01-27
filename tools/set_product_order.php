<?php
/**
 * One-off script to set menu_order for product posts based on creation date.
 * This maintains the current display order while enabling manual reordering.
 *
 * Usage:
 *   CLI: php tools/set_product_order.php
 *   Web: https://musashipaint.local/tools/set_product_order.php?secret=run-once-change-me
 */

require_once __DIR__ . '/../wp-load.php';

$allowed_secret = getenv('PRODUCT_ORDER_SECRET') ?: 'run-once-change-me';

// Security guard
if (php_sapi_name() !== 'cli') {
    $secret = isset($_GET['secret']) ? (string) $_GET['secret'] : '';
    if ($secret !== $allowed_secret) {
        status_header(403);
        header('Content-Type: text/plain; charset=utf-8');
        echo "Forbidden: set PRODUCT_ORDER_SECRET or pass ?secret=...\n";
        exit;
    }
    header('Content-Type: text/plain; charset=utf-8');
}

// Get all product posts ordered by date ASC (current sort order)
$posts = get_posts([
    'post_type'   => 'product',
    'post_status' => 'publish',
    'numberposts' => -1,
    'orderby'     => array('date' => 'ASC', 'ID' => 'ASC'),
]);

$order = 1;
foreach ($posts as $post) {
    $current_order = (int) $post->menu_order;

    if ($current_order !== $order) {
        wp_update_post([
            'ID'         => $post->ID,
            'menu_order' => $order,
        ]);
        printf(
            "[%d] %s\t%d -> %d\n",
            $post->ID,
            $post->post_title,
            $current_order,
            $order
        );
    } else {
        printf(
            "[%d] %s\t%d (no change)\n",
            $post->ID,
            $post->post_title,
            $current_order
        );
    }

    $order++;
}

echo "Done.\n";
