<?php
/**
 * 全サイドバーメニュー一括初期化スクリプト
 *
 * 実行方法:
 * 1. ブラウザで直接アクセス: http://musashi-paint.local/wp-content/themes/muashi/inc/run-all-menu-setup.php
 * 2. または、PHPコマンドで実行: php wp-content/themes/muashi/inc/run-all-menu-setup.php
 *
 * 注意: 既存のメニューを削除して再作成します
 */

// WordPress環境をロード
if ( ! defined( 'ABSPATH' ) ) {
	$wp_load_path = dirname( __FILE__, 5 ) . '/wp-load.php';
	if ( file_exists( $wp_load_path ) ) {
		require_once $wp_load_path;
	} else {
		die( 'WordPress environment not found.' );
	}
}

// セキュリティチェック（管理者 or CLI実行のみ許可）
if ( ! current_user_can( 'manage_options' ) && ! defined( 'WP_CLI' ) && php_sapi_name() !== 'cli' ) {
	wp_die( 'このスクリプトは管理者のみ実行可能です。' );
}

echo "<html><head><meta charset='utf-8'><title>メニュー初期化</title></head><body>";
echo "<h1>サイドバーメニュー一括初期化</h1>";
echo "<pre>";

// 既存メニューを削除
$menus_to_delete = array(
	'私たちについて用サイドバー',
	'ヒストリー用サイドバー',
	'サステナビリティ用サイドバー',
	'お客様の声用サイドバー',
	'グローバルネットワーク用サイドバー',
	'採用情報用サイドバー',
	'よくある質問用サイドバー',
	'ピックアップ用サイドバー',
	'ニュース用サイドバー',
	'ニュース・ピックアップ用サイドバー',
	'カタログダウンロード用サイドバー',
);

echo "=== 既存メニュー削除 ===\n\n";

foreach ( $menus_to_delete as $menu_name ) {
	$menu = wp_get_nav_menu_object( $menu_name );
	if ( $menu ) {
		$result = wp_delete_nav_menu( $menu->term_id );
		if ( $result ) {
			echo "✓ 削除成功: {$menu_name} (ID: {$menu->term_id})\n";
		} else {
			echo "✗ 削除失敗: {$menu_name}\n";
		}
	} else {
		echo "- スキップ: {$menu_name} (存在しません)\n";
	}
}

echo "\n=== 新規メニュー作成 ===\n\n";

// 各セットアップスクリプトを実行
$setup_scripts = array(
	'setup-pickup-menu.php' => 'ニュース・ピックアップ用サイドバー',
	'setup-history-menu.php' => 'ヒストリー用サイドバー',
	'setup-sustainability-menu.php' => 'サステナビリティ用サイドバー',
	'setup-global-network-menu.php' => 'グローバルネットワーク用サイドバー',
	'setup-career-menu.php' => '採用情報用サイドバー',
	'setup-faq-menu.php' => 'よくある質問用サイドバー',
	'setup-about-us-menu.php' => '私たちについて用サイドバー',
	'setup-voice-menu.php' => 'お客様の声用サイドバー',
	'setup-document-menu.php' => 'カタログダウンロード用サイドバー',
);

foreach ( $setup_scripts as $script_file => $menu_name ) {
	echo "\n--- {$menu_name} ---\n";

	$script_path = dirname( __FILE__ ) . '/' . $script_file;

	if ( file_exists( $script_path ) ) {
		// 出力バッファリング開始
		ob_start();

		// スクリプトを実行
		require_once $script_path;

		// 出力を取得して表示
		$output = ob_get_clean();
		echo $output;

		// メニューが作成されたか確認
		$menu = wp_get_nav_menu_object( $menu_name );
		if ( $menu ) {
			$item_count = wp_get_nav_menu_items( $menu->term_id );
			$count = is_array( $item_count ) ? count( $item_count ) : 0;
			echo "✓ 作成成功: {$menu_name} ({$count}個のメニュー項目)\n";
		} else {
			echo "✗ 作成失敗: {$menu_name}\n";
		}
	} else {
		echo "✗ ファイルが見つかりません: {$script_file}\n";
	}
}

echo "\n=== 完了 ===\n\n";
echo "全てのメニュー初期化が完了しました。\n";
echo "WordPress管理画面の「外観」→「メニュー」で確認してください。\n";

echo "</pre></body></html>";
