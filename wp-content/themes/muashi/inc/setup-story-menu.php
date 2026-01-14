<?php
/**
 * ストーリー用サイドバーメニューのセットアップスクリプト
 *
 * 使用方法:
 * WP-CLI: wp eval-file wp-content/themes/muashi/inc/setup-story-menu.php
 * または WordPress管理画面から一度だけ実行
 */

// WordPress環境外から実行された場合は終了
if ( ! defined( 'ABSPATH' ) ) {
    // WP-CLI経由で実行する場合のためのブートストラップ
    $wp_load_path = dirname( __FILE__, 6 ) . '/wp-load.php';
    if ( file_exists( $wp_load_path ) ) {
        require_once $wp_load_path;
    } else {
        die( 'WordPress environment not found.' );
    }
}

/**
 * ストーリー用サイドバーメニューを作成
 */
function muashi_setup_story_sidebar_menu() {
    $menu_name     = 'ストーリー用サイドバー';
    $menu_location = 'sidebar_story';

    // 既存のメニューをチェック
    $existing_menu = wp_get_nav_menu_object( $menu_name );

    if ( $existing_menu ) {
        echo "Menu '{$menu_name}' already exists (ID: {$existing_menu->term_id}). Skipping creation.\n";
        $menu_id = $existing_menu->term_id;
    } else {
        // メニューを作成
        $menu_id = wp_create_nav_menu( $menu_name );

        if ( is_wp_error( $menu_id ) ) {
            echo "Error creating menu: " . $menu_id->get_error_message() . "\n";
            return false;
        }

        echo "Created menu '{$menu_name}' (ID: {$menu_id})\n";

        // メニュー項目を追加
        $menu_items = array(
            array(
                'title' => '武蔵塗料グループについて',
                'url'   => home_url( '/about-us/' ),
            ),
            array(
                'title' => '会社概要',
                'url'   => home_url( '/about-us/profile/' ),
            ),
            array(
                'title' => 'グローバルネットワーク',
                'url'   => home_url( '/about-us/global/' ),
            ),
            array(
                'title' => 'ヒストリー',
                'url'   => home_url( '/about-us/history/' ),
            ),
            array(
                'title' => 'サステナビリティ',
                'url'   => home_url( '/about-us/sustainability/' ),
            ),
            /* ストーリーページを非表示
            array(
                'title' => 'ストーリー',
                'url'   => home_url( '/story/' ),
            ),
            */
            array(
                'title' => 'お客様の声',
                'url'   => home_url( '/voice/' ),
            ),
            array(
                'title' => 'よくある質問',
                'url'   => home_url( '/faq/' ),
            ),
        );

        foreach ( $menu_items as $index => $item ) {
            $item_id = wp_update_nav_menu_item(
                $menu_id,
                0,
                array(
                    'menu-item-title'     => $item['title'],
                    'menu-item-url'       => $item['url'],
                    'menu-item-status'    => 'publish',
                    'menu-item-type'      => 'custom',
                    'menu-item-position'  => $index + 1,
                )
            );

            if ( is_wp_error( $item_id ) ) {
                echo "Error adding menu item '{$item['title']}': " . $item_id->get_error_message() . "\n";
            } else {
                echo "Added menu item '{$item['title']}' (ID: {$item_id})\n";
            }
        }
    }

    // メニューロケーションに割り当て
    $locations = get_theme_mod( 'nav_menu_locations', array() );

    if ( isset( $locations[ $menu_location ] ) && $locations[ $menu_location ] === $menu_id ) {
        echo "Menu already assigned to location '{$menu_location}'.\n";
    } else {
        $locations[ $menu_location ] = $menu_id;
        set_theme_mod( 'nav_menu_locations', $locations );
        echo "Assigned menu to location '{$menu_location}'.\n";
    }

    echo "\nSetup complete!\n";
    return true;
}

// スクリプト実行
muashi_setup_story_sidebar_menu();
