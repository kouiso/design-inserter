<?php
/**
 * 「製品情報」用サイドバーメニューセットアップ
 *
 * navigation-product.php のフォールバック構造を WordPress メニューとして作成する。
 * タクソノミー設定とターム順序は muashi_get_product_taxonomy_config() と
 * muashi_get_sorted_product_terms() を使用して動的に取得する。
 *
 * 実行方法:
 * - メニュー初期化プラグイン（Tools > メニュー初期化）経由
 * - または PHP CLI: php wp-content/themes/muashi/inc/setup-product-menu.php
 *
 * @package Muashi
 */

if ( ! defined( 'ABSPATH' ) ) {
	$wp_load_path = dirname( __FILE__, 5 ) . '/wp-load.php';
	if ( file_exists( $wp_load_path ) ) {
		require_once $wp_load_path;
	} else {
		die( 'WordPress environment not found.' );
	}
}

/**
 * 製品情報サイドバーメニューを作成
 */
function muashi_setup_product_sidebar_menu() {
	$menu_name     = '製品情報用サイドバー';
	$menu_location = 'sidebar_product';

	// 既存メニューがあれば削除して再作成
	$existing_menu = wp_get_nav_menu_object( $menu_name );
	if ( $existing_menu ) {
		wp_delete_nav_menu( $existing_menu->term_id );
		echo "既存メニュー削除: {$menu_name} (ID: {$existing_menu->term_id})\n";
	}

	$menu_id = wp_create_nav_menu( $menu_name );
	if ( is_wp_error( $menu_id ) ) {
		echo "メニュー作成失敗: {$menu_name} - " . $menu_id->get_error_message() . "\n";
		return;
	}
	echo "メニュー作成: {$menu_name} (ID: {$menu_id})\n";

	$position = 1;

	// ── Depth 0: 「製品情報」見出し ──
	$product_info_id = wp_update_nav_menu_item( $menu_id, 0, array(
		'menu-item-title'    => '製品情報',
		'menu-item-url'      => '#',
		'menu-item-status'   => 'publish',
		'menu-item-type'     => 'custom',
		'menu-item-position' => $position++,
	) );
	echo "  追加: 製品情報 (ID: {$product_info_id})\n";

	// ── Depth 1-2: タクソノミーカテゴリ + ターム ──
	$taxonomies = muashi_get_product_taxonomy_config();

	foreach ( $taxonomies as $taxonomy => $settings ) {
		// Depth 1: タクソノミーラベル（アコーディオントリガー）
		$category_id = wp_update_nav_menu_item( $menu_id, 0, array(
			'menu-item-title'     => $settings['label'],
			'menu-item-url'       => '#',
			'menu-item-status'    => 'publish',
			'menu-item-type'      => 'custom',
			'menu-item-position'  => $position++,
			'menu-item-parent-id' => $product_info_id,
		) );
		echo "    カテゴリ: {$settings['label']} (ID: {$category_id})\n";

		// Depth 2: 各タクソノミーのターム
		$terms = muashi_get_sorted_product_terms( $taxonomy, 0 );
		foreach ( $terms as $term ) {
			$term_item_id = wp_update_nav_menu_item( $menu_id, 0, array(
				'menu-item-title'     => $term->name,
				'menu-item-type'      => 'taxonomy',
				'menu-item-object'    => $taxonomy,
				'menu-item-object-id' => $term->term_id,
				'menu-item-status'    => 'publish',
				'menu-item-position'  => $position++,
				'menu-item-parent-id' => $category_id,
			) );
			echo "      ターム: {$term->name} (ID: {$term_item_id})\n";

			// 子タームがある場合
			$child_terms = muashi_get_sorted_product_terms( $taxonomy, $term->term_id );
			if ( ! empty( $child_terms ) ) {
				foreach ( $child_terms as $child ) {
					wp_update_nav_menu_item( $menu_id, 0, array(
						'menu-item-title'     => $child->name,
						'menu-item-type'      => 'taxonomy',
						'menu-item-object'    => $taxonomy,
						'menu-item-object-id' => $child->term_id,
						'menu-item-status'    => 'publish',
						'menu-item-position'  => $position++,
						'menu-item-parent-id' => $term_item_id,
					) );
					echo "        子ターム: {$child->name}\n";
				}
			}
		}
	}

	// ── Depth 0: 「注目製品」リンク ──
	wp_update_nav_menu_item( $menu_id, 0, array(
		'menu-item-title'    => '注目製品',
		'menu-item-url'      => URL_FEATURED,
		'menu-item-status'   => 'publish',
		'menu-item-type'     => 'custom',
		'menu-item-position' => $position++,
	) );
	echo "  追加: 注目製品\n";

	// ── Depth 0: 「製品用途紹介」リンク ──
	wp_update_nav_menu_item( $menu_id, 0, array(
		'menu-item-title'    => '製品用途紹介',
		'menu-item-url'      => URL_APPLICATIONS,
		'menu-item-status'   => 'publish',
		'menu-item-type'     => 'custom',
		'menu-item-position' => $position++,
	) );
	echo "  追加: 製品用途紹介\n";

	// メニューをロケーションに割り当て
	$locations                 = get_theme_mod( 'nav_menu_locations', array() );
	$locations[ $menu_location ] = $menu_id;
	set_theme_mod( 'nav_menu_locations', $locations );
	echo "ロケーション割り当て: {$menu_location}\n";

	echo "\n完了: 製品情報サイドバーメニュー ({$position} 項目)\n";
}

// プラグイン経由の場合は WP_CLI が定義済み → 関数のみエクスポート
// 直接実行の場合はすぐにセットアップ
if ( ! defined( 'WP_CLI' ) ) {
	muashi_setup_product_sidebar_menu();
}
