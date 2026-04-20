<?php
/**
 * 不要なナビゲーションメニューを削除するスクリプト
 *
 * 実行方法:
 * 1. WordPressサイトにログインした状態でブラウザからアクセス
 * 2. または WP-CLI: wp eval-file wp-content/themes/muashi/inc/cleanup-unused-menus.php
 *
 * 実行後はこのファイル自体を削除すること
 */

// WordPress環境外から実行された場合はブートストラップ
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
 * 不要なメニューを削除
 */
function muashi_cleanup_unused_menus() {
	// 削除対象のメニュー名一覧
	$menus_to_delete = array(
		// 現時点で不要な重複メニュー（ゴミ）- 5個
		'サステナビリティサイドバー',
		'繝九Η繝ｼ繧ｹ繝ｻ繝斐ャ繧ｯ繧｢繝・・逕ｨ繧ｵ繧､繝峨ヰ繝ｼ',
		'ニュース・メディアサイドバー',
		'よくある質問サイドバー',
		'私たちについてサイドバー',

		// 今回の修正後に不要になるメニュー - 3個
		'インタビュー用サイドバー',
		'会社概要用サイドバー',
		'グローバルネットワーク用サイドバー',
	);

	$deleted = array();
	$not_found = array();
	$errors = array();

	foreach ( $menus_to_delete as $menu_name ) {
		$menu = wp_get_nav_menu_object( $menu_name );

		if ( $menu ) {
			$result = wp_delete_nav_menu( $menu->term_id );
			if ( is_wp_error( $result ) ) {
				$errors[] = $menu_name . ': ' . $result->get_error_message();
			} else {
				$deleted[] = $menu_name;
			}
		} else {
			$not_found[] = $menu_name;
		}
	}

	// 結果を出力
	echo "=== 不要メニュー削除結果 ===\n\n";

	if ( ! empty( $deleted ) ) {
		echo "削除成功:\n";
		foreach ( $deleted as $name ) {
			echo "  - {$name}\n";
		}
		echo "\n";
	}

	if ( ! empty( $not_found ) ) {
		echo "見つからなかった（既に削除済み）:\n";
		foreach ( $not_found as $name ) {
			echo "  - {$name}\n";
		}
		echo "\n";
	}

	if ( ! empty( $errors ) ) {
		echo "エラー:\n";
		foreach ( $errors as $error ) {
			echo "  - {$error}\n";
		}
		echo "\n";
	}

	echo "処理完了。このファイルを削除してください。\n";

	return array(
		'deleted'   => $deleted,
		'not_found' => $not_found,
		'errors'    => $errors,
	);
}

// スクリプト実行
muashi_cleanup_unused_menus();
