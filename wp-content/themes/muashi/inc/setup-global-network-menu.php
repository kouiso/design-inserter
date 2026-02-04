<?php
/**
 * 「グローバルネットワーク」用サイドバーメニューセットアップ
 *
 * 実行方法: php で直接実行
 * php wp-content/themes/muashi/inc/setup-global-network-menu.php
 */

// WordPress環境外から実行された場合は終了
if ( ! defined( 'ABSPATH' ) ) {
	// PHP直接実行する場合のためのブートストラップ
	$wp_load_path = dirname( __FILE__, 5 ) . '/wp-load.php';
	if ( file_exists( $wp_load_path ) ) {
		require_once $wp_load_path;
	} else {
		die( 'WordPress environment not found.' );
	}
}

function muashi_setup_global_network_sidebar_menu() {
	$menu_name = 'グローバルネットワーク用サイドバー';
	$menu_location = 'sidebar_global_network';

	// 既存メニューを確認
	$menu = wp_get_nav_menu_object($menu_name);

	// メニューが存在しない場合のみ作成
	if (!$menu) {
		// メニュー作成
		$menu_id = wp_create_nav_menu($menu_name);
		error_log("Menu created: $menu_name (ID: $menu_id)");

		// メニュー項目定義
		$menu_items = array(
			// 第1階層: 武蔵塗料グループについて
			array(
				'title' => '武蔵塗料グループについて',
				'url'   => URL_ABOUT_US,
				'parent' => 0,
				'children' => array(
					array('title' => '企業概要', 'url' => URL_COMPANY),
					array('title' => 'ヒストリー', 'url' => URL_HISTORY),
				),
			),
			// 第1階層: 選ばれる理由（配下展開）
			array(
				'title' => '選ばれる理由',
				'url'   => URL_TECHNOLOGY,
				'parent' => 0,
				'children' => array(
					array('title' => '最先端の技術開発力', 'url' => URL_TECHNOLOGY),
					array(
						'title' => 'グローバルネットワーク',
						'url'   => URL_GLOBAL_NETWORK,
						'children' => array(
							array('title' => '海外拠点', 'url' => URL_GLOBAL_NETWORK . '#overseas-bases'),
						),
					),
					array('title' => 'サステナブルなビジネス展開', 'url' => URL_SUSTAINABLE_BUSINESS),
					array('title' => '顧客志向のカスタマイズ', 'url' => URL_CUSTOMIZATION),
				),
			),
			// 第1階層: サステナビリティ
			array(
				'title' => 'サステナビリティ',
				'url'   => URL_SUSTAINABILITY,
				'parent' => 0,
			),
			// 第1階層: お客様の声
			array(
				'title' => 'お客様の声',
				'url'   => URL_VOICE,
				'parent' => 0,
			),
		);

		// メニュー項目を追加
		$position = 1;

		foreach ($menu_items as $item) {
			// 親アイテムを追加
			$parent_id = wp_update_nav_menu_item($menu_id, 0, array(
				'menu-item-title'    => $item['title'],
				'menu-item-url'      => $item['url'],
				'menu-item-status'   => 'publish',
				'menu-item-type'     => 'custom',
				'menu-item-position' => $position++,
			));

			error_log("Added menu item: {$item['title']} (ID: $parent_id)");

			// 子アイテムがある場合
			if (isset($item['children'])) {
				foreach ($item['children'] as $child) {
					$child_id = wp_update_nav_menu_item($menu_id, 0, array(
						'menu-item-title'     => $child['title'],
						'menu-item-url'       => $child['url'],
						'menu-item-status'    => 'publish',
						'menu-item-type'      => 'custom',
						'menu-item-position'  => $position++,
						'menu-item-parent-id' => $parent_id,
					));
					error_log("  Added child: {$child['title']} (ID: $child_id)");

					// 孫アイテムがある場合（第3階層）
					if (isset($child['children'])) {
						foreach ($child['children'] as $grandchild) {
							$grandchild_id = wp_update_nav_menu_item($menu_id, 0, array(
								'menu-item-title'     => $grandchild['title'],
								'menu-item-url'       => $grandchild['url'],
								'menu-item-status'    => 'publish',
								'menu-item-type'      => 'custom',
								'menu-item-position'  => $position++,
								'menu-item-parent-id' => $child_id,
							));
							error_log("    Added grandchild: {$grandchild['title']} (ID: $grandchild_id)");
						}
					}
				}
			}
		}

		// メニューをロケーションに割り当て
		$locations = get_theme_mod('nav_menu_locations', array());
		$locations[$menu_location] = $menu_id;
		set_theme_mod('nav_menu_locations', $locations);

		error_log("Menu assigned to location: $menu_location");
	} else {
		error_log("Menu already exists: $menu_name");
	}
}

// スクリプト直接実行
if ( ! defined( 'WP_CLI' ) ) {
	muashi_setup_global_network_sidebar_menu();
	echo "Setup complete!\n";
}
