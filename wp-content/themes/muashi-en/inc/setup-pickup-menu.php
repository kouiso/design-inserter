<?php
/**
 * Featured 用サイドバーメニューセットアップ
 *
 * 実行方法: php で直接実行
 * php wp-content/themes/muashi-en/inc/setup-pickup-menu.php
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

// セキュリティチェック（管理者のみ実行可能）
if ( ! current_user_can( 'manage_options' ) && ! defined( 'WP_CLI' ) ) {
	wp_die( 'このスクリプトは管理者のみ実行可能です。' );
}

function muashi_setup_pickup_sidebar_menu() {
	$menu_name = 'News / Featured Sidebar';
	$legacy_menu_name = 'ニュース・ピックアップ用サイドバー';
	$menu_location = 'sidebar_news_media';

	// 既存メニューを確認
	$menu = wp_get_nav_menu_object($menu_name);
	if ( ! $menu ) {
		// 旧メニュー名が残っている環境では既存メニューを再利用する
		$menu = wp_get_nav_menu_object( $legacy_menu_name );
	}

	// メニューが存在しない場合のみ作成
	if (!$menu) {
		// メニュー作成
		$menu_id = wp_create_nav_menu($menu_name);
		error_log("Menu created: $menu_name (ID: $menu_id)");

		// メニュー項目定義
		$menu_items = array(
			// 第1階層: Featured
			array(
				'title' => 'Featured',
				'url'   => URL_MEDIA,
				'parent' => 0,
			),
			// 第1階層: News ニュース
			array(
				'title' => 'News',
				'url'   => URL_NEWS,
				'parent' => 0,
			),
			// 第1階層: SNS
			array(
				'title' => 'SNS',
				'url'   => '#',
				'parent' => 0,
				'children' => array(
					array('title' => 'LinkedIn', 'url' => 'https://www.linkedin.com/company/musashi-paint-holdings/'),
					array('title' => 'Instagram', 'url' => 'https://www.instagram.com/musashi_paint_official/'),
					array('title' => 'Facebook', 'url' => 'https://www.facebook.com/musashipaintholdings/'),
				),
			),
			// 第1階層: よくあるご質問
			array(
				'title' => 'FAQs',
				'url'   => URL_FAQ,
				'parent' => 0,
				'children' => array(
					// 第2階層: 武蔵塗料グループについて
					array('title' => '武蔵塗料グループについて', 'url' => URL_ABOUT_US),
				),
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
					$child_args = array(
						'menu-item-title'     => $child['title'],
						'menu-item-url'       => $child['url'],
						'menu-item-status'    => 'publish',
						'menu-item-type'      => 'custom',
						'menu-item-position'  => $position++,
						'menu-item-parent-id' => $parent_id,
					);

					// 外部リンク（https://で始まるURL）は新しいタブで開く
					if (strpos($child['url'], 'https://') === 0 || strpos($child['url'], 'http://') === 0) {
						// localhost以外の外部リンク
						if (strpos($child['url'], 'localhost') === false) {
							$child_args['menu-item-target'] = '_blank';
						}
					}

					$child_id = wp_update_nav_menu_item($menu_id, 0, $child_args);
					error_log("  Added child: {$child['title']} (ID: $child_id)");
				}
			}
		}

		// メニューをロケーションに割り当て
		$locations = get_theme_mod('nav_menu_locations', array());
		$locations[$menu_location] = $menu_id;
		set_theme_mod('nav_menu_locations', $locations);

		error_log("Menu assigned to location: $menu_location");
	} else {
		$locations = get_theme_mod('nav_menu_locations', array());
		$locations[$menu_location] = $menu->term_id;
		set_theme_mod('nav_menu_locations', $locations);

		error_log("Menu already exists: {$menu->name}");
	}
}

// スクリプト直接実行
if ( ! defined( 'WP_CLI' ) ) {
	muashi_setup_pickup_sidebar_menu();
	echo "Setup complete!\n";
}
