<?php
/**
 * FAQ Page Content Test
 *
 * FAQページ(/faq/)のコンテンツ検証
 * - H1タイトルの確認
 * - サイドバーアンカーリンクの確認
 * - Q&Aコンテンツの表示確認
 *
 * Usage: php tests/test-faq-page.php
 */

define( 'DB_HOST', '127.0.0.1:10011' );
require_once __DIR__ . '/../wp-load.php';

echo "\n";
echo "========================================\n";
echo "FAQ Page Content Test\n";
echo "========================================\n\n";

$all_passed = true;

// 1. Check FAQ page exists
echo "Checking FAQ page exists...\n";

$faq_page = get_page_by_path( 'faq' );

if ( $faq_page ) {
    echo "[OK] Page 'faq' exists (ID: {$faq_page->ID})\n";
    echo "     Title: {$faq_page->post_title}\n";
} else {
    echo "[FAIL] Page 'faq' NOT found\n";
    $all_passed = false;
}

// 2. Check page template
echo "\nChecking page template...\n";

$theme_dir = get_stylesheet_directory();
$expected_template = $theme_dir . '/page-faq.php';

if ( file_exists( $expected_template ) ) {
    echo "[OK] Template 'page-faq.php' exists in theme\n";
} else {
    echo "[WARN] Template 'page-faq.php' not found\n";
}

// 3. HTTP-based content verification
echo "\nChecking page content via HTTP...\n";

$site_url = get_site_url();
$faq_page_url = $site_url . '/faq/';

$response = wp_remote_get( $faq_page_url, [
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
        $expected_h1 = 'よくある質問';
        if ( strpos( $body, $expected_h1 ) !== false ) {
            echo "[OK] Found expected content: '$expected_h1'\n";
        } else {
            echo "[FAIL] Expected H1 '$expected_h1' not found\n";
            $all_passed = false;
        }
        
        // Check for sidebar anchor links
        $expected_anchors = [
            '#musashi-paint-group' => 'ムサシについて',
            '#work-content'        => '仕事内容',
            '#human-resource'      => '人材',
            '#selection'           => '選考',
            '#welfare'             => '福利厚生',
        ];
        
        echo "\nChecking sidebar anchor links...\n";
        $anchors_found = 0;
        
        foreach ( $expected_anchors as $anchor => $label ) {
            if ( strpos( $body, $anchor ) !== false ) {
                echo "[OK] Found anchor: $anchor\n";
                $anchors_found++;
            } else {
                echo "[WARN] Anchor not found: $anchor ($label)\n";
            }
        }
        
        if ( $anchors_found >= 3 ) {
            echo "[OK] Found $anchors_found/" . count($expected_anchors) . " expected anchors\n";
        } else {
            echo "[FAIL] Only $anchors_found anchors found (expected at least 3)\n";
            $all_passed = false;
        }
        
        // Check that FAQ content is present (look for common FAQ markers)
        if ( strpos( $body, 'Q.' ) !== false || strpos( $body, 'A.' ) !== false || 
             strpos( $body, '質問' ) !== false || strpos( $body, '回答' ) !== false ) {
            echo "[OK] Q&A content markers found\n";
        } else {
            echo "[INFO] Q&A content markers not detected (may use different format)\n";
        }
        
    } else {
        echo "[FAIL] Page returns HTTP $status_code (expected 200)\n";
        $all_passed = false;
    }
}

echo "\n========================================\n";

if ( $all_passed ) {
    echo "PASS: FAQ page is properly configured!\n";
    echo "========================================\n";
    exit(0);
} else {
    echo "FAIL: FAQ page has issues\n";
    echo "========================================\n";
    exit(1);
}
