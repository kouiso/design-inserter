<?php
/**
 * News Page Content Test
 *
 * ニュースページ(/news/)のコンテンツ検証
 * - H1タイトルの確認
 * - 投稿リストの表示確認
 * - サイドバーの確認
 *
 * Usage: php tests/test-news-page.php
 */

define( 'DB_HOST', '127.0.0.1:10011' );
require_once __DIR__ . '/../wp-load.php';

echo "\n";
echo "========================================\n";
echo "News Page Content Test\n";
echo "========================================\n\n";

$all_passed = true;

// 1. Check news page exists
echo "Checking news page exists...\n";

$news_page = get_page_by_path( 'news' );

if ( $news_page ) {
    echo "[OK] Page 'news' exists (ID: {$news_page->ID})\n";
    echo "     Title: {$news_page->post_title}\n";
} else {
    echo "[FAIL] Page 'news' NOT found\n";
    $all_passed = false;
}

// 2. Check page template
echo "\nChecking page template...\n";

$theme_dir = get_stylesheet_directory();
$expected_template = $theme_dir . '/page-news.php';

if ( file_exists( $expected_template ) ) {
    echo "[OK] Template 'page-news.php' exists in theme\n";
} else {
    echo "[WARN] Template 'page-news.php' not found\n";
}

// 3. Check news posts exist (standard posts in 'news' category or all posts)
echo "\nChecking news posts...\n";

// Try to get posts from 'news' category first
$news_category = get_category_by_slug( 'news' );

if ( $news_category ) {
    $news_posts = get_posts( [
        'post_type'      => 'post',
        'posts_per_page' => 10,
        'post_status'    => 'publish',
        'category'       => $news_category->term_id,
    ] );
    echo "[OK] Found 'news' category (ID: {$news_category->term_id})\n";
} else {
    // Fallback to all posts
    $news_posts = get_posts( [
        'post_type'      => 'post',
        'posts_per_page' => 10,
        'post_status'    => 'publish',
    ] );
    echo "[INFO] No 'news' category found, checking all posts\n";
}

$posts_count = count( $news_posts );

if ( $posts_count > 0 ) {
    echo "[OK] Found $posts_count news posts\n";
    
    // Display first 3 posts
    echo "\n     Sample posts:\n";
    $sample_count = min( 3, $posts_count );
    for ( $i = 0; $i < $sample_count; $i++ ) {
        $post = $news_posts[$i];
        $date = get_the_date( 'Y.m.d', $post->ID );
        echo "     - [$date] {$post->post_title}\n";
    }
} else {
    echo "[WARN] No news posts found\n";
}

// 4. HTTP-based content verification
echo "\nChecking page content via HTTP...\n";

$site_url = get_site_url();
$news_page_url = $site_url . '/news/';

$response = wp_remote_get( $news_page_url, [
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
        $expected_h1 = 'ニュース';
        if ( strpos( $body, $expected_h1 ) !== false ) {
            echo "[OK] Found expected content: '$expected_h1'\n";
        } else {
            echo "[FAIL] Expected H1 '$expected_h1' not found\n";
            $all_passed = false;
        }
        
        // Check that page is NOT showing media content instead
        if ( preg_match( '/<h1[^>]*>Pick up!.*ピックアップ情報<\/h1>/u', $body ) ) {
            echo "[FAIL] Page is showing MEDIA content instead of NEWS content!\n";
            $all_passed = false;
        } else {
            echo "[OK] Page is NOT confused with media page\n";
        }
        
        // Check sidebar links
        if ( strpos( $body, 'ニュース・お知らせ' ) !== false ) {
            echo "[OK] Found sidebar link: ニュース・お知らせ\n";
        } else {
            echo "[INFO] Sidebar link 'ニュース・お知らせ' not found\n";
        }
        
        if ( strpos( $body, 'Pick up!' ) !== false || strpos( $body, 'ピックアップ情報' ) !== false ) {
            echo "[OK] Found sidebar link to Pick up! page\n";
        } else {
            echo "[INFO] Sidebar link to Pick up! not found\n";
        }
        
    } else {
        echo "[FAIL] Page returns HTTP $status_code (expected 200)\n";
        $all_passed = false;
    }
}

echo "\n========================================\n";

if ( $all_passed ) {
    echo "PASS: News page is properly configured!\n";
    echo "========================================\n";
    exit(0);
} else {
    echo "FAIL: News page has issues\n";
    echo "========================================\n";
    exit(1);
}
