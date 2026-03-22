<?php
/**
 * インタビュー用サイドバーメニューの修正スクリプト
 * 
 * 問題: sidebar_interview に間違ったメニュー（ニュース用）が設定されている
 * 解決: 正しいインタビュー用メニューを作成し直して設定する
 *
 * 使用方法:
 * WP-CLI: wp eval-file wp-content/themes/muashi/inc/fix-interview-menu.php
 * または ブラウザからアクセス: https://your-site/wp-content/themes/muashi/inc/fix-interview-menu.php
 */

// WordPress環境外から実行された場合
if ( ! defined( 'ABSPATH' ) ) {
    $wp_load_path = dirname( __FILE__, 5 ) . '/wp-load.php';
    if ( file_exists( $wp_load_path ) ) {
        require_once $wp_load_path;
    } else {
        die( 'WordPress environment not found.' );
    }
}

// セキュリティチェック（管理者のみ実行可能）
if ( ! current_user_can( 'manage_options' ) && ! defined( 'WP_CLI' ) ) {
	wp_die( 'このスクリプトは管理者のみ実行可能です。' );
}

header('Content-Type: text/plain; charset=utf-8');

echo "=== インタビュー用サイドバーメニュー修正スクリプト ===\n\n";

/**
 * インタビュー用サイドバーメニューを修正
 */
function fix_interview_sidebar_menu() {
    $menu_name     = 'インタビュー用サイドバー';
    $menu_location = 'sidebar_interview';

    // 現在の設定を確認
    $locations = get_theme_mod('nav_menu_locations', array());
    echo "現在のメニューロケーション設定:\n";
    if (isset($locations[$menu_location])) {
        echo "  sidebar_interview => メニューID: " . $locations[$menu_location] . "\n";
        $current_items = wp_get_nav_menu_items($locations[$menu_location]);
        if ($current_items) {
            echo "  現在のメニュー項目:\n";
            foreach($current_items as $item) {
                echo "    - " . $item->title . " => " . $item->url . "\n";
            }
        }
    } else {
        echo "  sidebar_interview のロケーション設定がありません\n";
    }
    echo "\n";

    // 既存の「インタビュー用サイドバー」メニューを探す
    $existing_menu = wp_get_nav_menu_object($menu_name);

    if ($existing_menu) {
        echo "既存のメニュー「{$menu_name}」(ID: {$existing_menu->term_id}) を削除します...\n";
        wp_delete_nav_menu($existing_menu->term_id);
    }

    // 新しいメニューを作成
    $menu_id = wp_create_nav_menu($menu_name);

    if (is_wp_error($menu_id)) {
        echo "エラー: メニュー作成に失敗しました - " . $menu_id->get_error_message() . "\n";
        return false;
    }

    echo "新しいメニュー「{$menu_name}」(ID: {$menu_id}) を作成しました\n";

    // メニュー項目を追加（インタビュー用の正しい項目）
    $menu_items = array(
        array(
            'title' => '採用情報',
            'url'   => home_url('/career/'),
        ),
        array(
            'title' => 'インタビュー',
            'url'   => home_url('/career/interview/'),
        ),
        array(
            'title' => 'よくある質問',
            'url'   => home_url('/faq/'),
        ),
    );

    foreach ($menu_items as $index => $item) {
        $item_id = wp_update_nav_menu_item(
            $menu_id,
            0,
            array(
                'menu-item-title'    => $item['title'],
                'menu-item-url'      => $item['url'],
                'menu-item-status'   => 'publish',
                'menu-item-type'     => 'custom',
                'menu-item-position' => $index + 1,
            )
        );

        if (is_wp_error($item_id)) {
            echo "エラー: メニュー項目「{$item['title']}」の追加に失敗 - " . $item_id->get_error_message() . "\n";
        } else {
            echo "  メニュー項目「{$item['title']}」(ID: {$item_id}) を追加しました\n";
        }
    }

    // メニューロケーションに割り当て
    $locations[$menu_location] = $menu_id;
    set_theme_mod('nav_menu_locations', $locations);
    echo "\nメニューをロケーション「{$menu_location}」に割り当てました\n";

    echo "\n=== 修正完了 ===\n";
    return true;
}

// スクリプト実行
fix_interview_sidebar_menu();

echo "\n=== 修正後のメニューロケーション設定 ===\n";
$locations = get_theme_mod('nav_menu_locations', array());
print_r($locations);
