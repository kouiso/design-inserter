<?php
/**
 * お客様の声用サイドバーメニューのセットアップスクリプト
 *
 * 使用方法:
 * WP-CLI: wp eval-file wp-content/themes/muashi/inc/setup-voice-menu.php
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
 * お客様の声用サイドバーメニューを作成
 */
function muashi_setup_voice_sidebar_menu() {
    $menu_name     = 'お客様の声用サイドバー';
    $menu_location = 'sidebar_voice';

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

        // メニュー項目を追加（選ばれる理由配下展開）
        $menu_items = array(
            // 第1階層: 武蔵塗料グループについて（子要素非表示）
            array(
                'title' => '武蔵塗料グループについて',
                'url'   => URL_ABOUT_US,
            ),
            // 第1階層: 選ばれる理由（配下展開）
            array(
                'title' => '選ばれる理由',
                'url'   => URL_TECHNOLOGY,
                'children' => array(
                    // 第2階層: 最先端の技術開発力
                    array('title' => '最先端の技術開発力', 'url' => URL_TECHNOLOGY),
                    // 第2階層: グローバルネットワーク
                    array(
                        'title' => 'グローバルネットワーク',
                        'url'   => URL_GLOBAL_NETWORK,
                        'children' => array(
                            // 第3階層: グループ会社・グローバル生産拠点
                            array('title' => 'グループ会社', 'url' => URL_GLOBAL_NETWORK . '#overseas-bases'),
                            array('title' => 'グローバル生産拠点', 'url' => URL_GLOBAL_NETWORK . '#overseas-bases'),
                        ),
                    ),
                    // 第2階層: サステナブルなビジネス展開
                    array('title' => 'サステナブルなビジネス展開', 'url' => URL_SUSTAINABLE_BUSINESS),
                    // 第2階層: 顧客志向のカスタマイズ
                    array('title' => '顧客志向のカスタマイズ', 'url' => URL_CUSTOMIZATION),
                ),
            ),
            // 第1階層: サステナビリティ（子要素非表示）
            array(
                'title' => 'サステナビリティ',
                'url'   => URL_SUSTAINABILITY,
            ),
            // 第1階層: お客様の声
            array(
                'title' => 'お客様の声',
                'url'   => URL_VOICE,
            ),
        );

        $position = 1;

        foreach ( $menu_items as $item ) {
            // 親アイテムを追加（第1階層）
            $parent_id = wp_update_nav_menu_item(
                $menu_id,
                0,
                array(
                    'menu-item-title'     => $item['title'],
                    'menu-item-url'       => $item['url'],
                    'menu-item-status'    => 'publish',
                    'menu-item-type'      => 'custom',
                    'menu-item-position'  => $position++,
                )
            );

            if ( is_wp_error( $parent_id ) ) {
                echo "Error adding menu item '{$item['title']}': " . $parent_id->get_error_message() . "\n";
            } else {
                echo "Added menu item '{$item['title']}' (ID: {$parent_id})\n";
            }

            // 子アイテムがある場合（第2階層）
            if ( isset( $item['children'] ) ) {
                foreach ( $item['children'] as $child ) {
                    $child_id = wp_update_nav_menu_item(
                        $menu_id,
                        0,
                        array(
                            'menu-item-title'     => $child['title'],
                            'menu-item-url'       => $child['url'],
                            'menu-item-status'    => 'publish',
                            'menu-item-type'      => 'custom',
                            'menu-item-position'  => $position++,
                            'menu-item-parent-id' => $parent_id,
                        )
                    );

                    if ( is_wp_error( $child_id ) ) {
                        echo "Error adding child item '{$child['title']}': " . $child_id->get_error_message() . "\n";
                    } else {
                        echo "  Added child item '{$child['title']}' (ID: {$child_id})\n";
                    }

                    // 孫アイテムがある場合（第3階層）
                    if ( isset( $child['children'] ) ) {
                        foreach ( $child['children'] as $grandchild ) {
                            $grandchild_id = wp_update_nav_menu_item(
                                $menu_id,
                                0,
                                array(
                                    'menu-item-title'     => $grandchild['title'],
                                    'menu-item-url'       => $grandchild['url'],
                                    'menu-item-status'    => 'publish',
                                    'menu-item-type'      => 'custom',
                                    'menu-item-position'  => $position++,
                                    'menu-item-parent-id' => $child_id,
                                )
                            );

                            if ( is_wp_error( $grandchild_id ) ) {
                                echo "Error adding grandchild item '{$grandchild['title']}': " . $grandchild_id->get_error_message() . "\n";
                            } else {
                                echo "    Added grandchild item '{$grandchild['title']}' (ID: {$grandchild_id})\n";
                            }
                        }
                    }
                }
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
muashi_setup_voice_sidebar_menu();
