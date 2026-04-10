<?php
/**
 * 「カタログダウンロード」用サイドバーメニューセットアップ
 *
 * page-document.php / page-document-featured.php のサイドバーを
 * WordPress メニューとして管理可能にする。
 *
 * 実行方法:
 * - メニュー初期化スクリプト（run-all-menu-setup.php）経由
 * - または PHP CLI: php wp-content/themes/muashi/inc/setup-document-menu.php
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

// セキュリティチェック（管理者のみ実行可能）
if ( ! current_user_can( 'manage_options' ) && ! defined( 'WP_CLI' ) ) {
	wp_die( 'このスクリプトは管理者のみ実行可能です。' );
}

/**
 * カタログダウンロード用サイドバーメニューを作成
 */
function muashi_setup_document_sidebar_menu() {
	$menu_name     = 'カタログダウンロード用サイドバー';
	$menu_location = 'sidebar_document';

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

	// 「カタログダウンロード」リンク
	wp_update_nav_menu_item( $menu_id, 0, array(
		'menu-item-title'    => 'カタログダウンロード',
		'menu-item-url'      => home_url( '/document/' ),
		'menu-item-status'   => 'publish',
		'menu-item-type'     => 'custom',
		'menu-item-position' => $position++,
	) );
	echo "  追加: カタログダウンロード\n";

	// メニューをロケーションに割り当て
	$locations                   = get_theme_mod( 'nav_menu_locations', array() );
	$locations[ $menu_location ] = $menu_id;
	set_theme_mod( 'nav_menu_locations', $locations );
	echo "ロケーション割り当て: {$menu_location}\n";

	echo "\n完了: カタログダウンロード用サイドバーメニュー ({$position} 項目)\n";
}

muashi_setup_document_sidebar_menu();
