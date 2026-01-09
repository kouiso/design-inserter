<?php
/**
 * Media Page Content Test (Issue #89)
 *
 * メディアページ(/media-page/)のコンテンツ検証
 * - H1タイトルの確認
 * - media_post投稿の表示確認
 * - ページテンプレートの確認
 *
 * Usage: php tests/test-media-page.php
 */

define( 'DB_HOST', '127.0.0.1:10011' );
require_once __DIR__ . '/../wp-load.php';

echo "\n";
echo "========================================\n";
echo "Media Page Content Test (Issue #89)\n";
echo "========================================\n\n";

$all_passed = true;

// 1. Check media-page exists
echo "Checking media-page exists...\n";

$media_page = get_page_by_path( 'media-page' );

if ( $media_page ) {
    echo "[OK] Page 'media-page' exists (ID: {$media_page->ID})\n";
    echo "     Title: {$media_page->post_title}\n";
} else {
    echo "[FAIL] Page 'media-page' NOT found\n";
    $all_passed = false;
}

// 2. Check page template
echo "\nChecking page template...\n";

if ( $media_page ) {
    $template = get_page_template_slug( $media_page->ID );
    
    // テンプレートが空の場合はデフォルト（page-{slug}.php）を使用
    $theme_dir = get_stylesheet_directory();
    $expected_template = $theme_dir . '/page-media.php';
    
    if ( file_exists( $expected_template ) ) {
        echo "[OK] Template 'page-media.php' exists in theme\n";
    } else {
        echo "[WARN] Template 'page-media.php' not found (may use page-media-page.php or page.php)\n";
    }
}

// 3. Check media_post custom post type
echo "\nChecking media_post post type...\n";

$post_types = get_post_types( [], 'names' );

if ( in_array( 'media_post', $post_types ) ) {
    echo "[OK] Custom post type 'media_post' is registered\n";
} else {
    echo "[FAIL] Custom post type 'media_post' NOT registered\n";
    $all_passed = false;
}

// 4. Check media_post content exists
echo "\nChecking media_post content...\n";

$media_posts = get_posts( [
    'post_type'      => 'media_post',
    'posts_per_page' => 12,
    'post_status'    => 'publish',
] );

$media_count = count( $media_posts );

if ( $media_count > 0 ) {
    echo "[OK] Found $media_count media_post entries\n";
    
    // Display first 3 posts
    echo "\n     Sample posts:\n";
    $sample_count = min( 3, $media_count );
    for ( $i = 0; $i < $sample_count; $i++ ) {
        $post = $media_posts[$i];
        echo "     - ID={$post->ID}: {$post->post_title}\n";
    }
} else {
    echo "[WARN] No media_post entries found (page may be empty)\n";
}

// 5. HTTP-based content verification
echo "\nChecking page content via HTTP...\n";

$site_url = get_site_url();
$media_page_url = $site_url . '/media-page/';

$response = wp_remote_get( $media_page_url, [
    'timeout' => 10,
    'sslverify' => false,
] );

if ( is_wp_error( $response ) ) {
    echo "[FAIL] HTTP request failed: " . $response->get_error_message() . "\n";
    $all_passed = false;
} else {
    $status_code = wp_remote_retrieve_response_code( $response );
    $body = wp_remote_retrieve_body( $response );
    
    if ( $status_code === 200 ) {
        echo "[OK] Page returns HTTP 200\n";
        
        // Check for expected H1 content
        $expected_h1 = 'Pick up! 注目のピックアップ情報';
        if ( strpos( $body, $expected_h1 ) !== false ) {
            echo "[OK] Found expected H1: '$expected_h1'\n";
        } else {
            // Try partial match
            if ( strpos( $body, 'Pick up!' ) !== false || strpos( $body, '注目のピックアップ情報' ) !== false ) {
                echo "[OK] Found H1 content (partial match)\n";
            } else {
                echo "[FAIL] Expected H1 not found in page content\n";
                $all_passed = false;
            }
        }
        
        // Check that page is NOT showing news content instead
        if ( preg_match( '/<h1[^>]*>ニュース<\/h1>/u', $body ) ) {
            echo "[FAIL] Page is showing NEWS content instead of MEDIA content!\n";
            $all_passed = false;
        } else {
            echo "[OK] Page is NOT confused with news page\n";
        }
        
        // Check sidebar exists
        if ( strpos( $body, 'sidebar' ) !== false || strpos( $body, 'ニュース・お知らせ' ) !== false ) {
            echo "[OK] Sidebar content found\n";
        } else {
            echo "[INFO] Sidebar may not be present\n";
        }
        
    } else {
        echo "[FAIL] Page returns HTTP $status_code (expected 200)\n";
        $all_passed = false;
    }
}

echo "\n========================================\n";

if ( $all_passed ) {
    echo "PASS: Media page is properly configured!\n";
    echo "========================================\n";
    exit(0);
} else {
    echo "FAIL: Media page has issues\n";
    echo "\nReference: Issue #89 (WP_Query pagination)\n";
    echo "========================================\n";
    exit(1);
}
