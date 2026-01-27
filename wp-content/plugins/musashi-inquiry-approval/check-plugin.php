<?php
// プラグインの有効化状態を確認するスクリプト

if ( ! file_exists( __DIR__ . '/../wp-load.php' ) ) {
	exit( 'wp-load.php not found' );
}

require __DIR__ . '/../wp-load.php';

global $wpdb;
$output = '';

$output .= "=== Musashi Inquiry Approval プラグイン診断 ===\n\n";

// 1. ファイルの存在確認
$plugin_file = WP_PLUGIN_DIR . '/musashi-inquiry-approval/musashi-inquiry-approval.php';
$output .= "【ファイルの存在確認】\n";
if (file_exists($plugin_file)) {
	$output .= "✓ プラグインファイルが存在します: " . $plugin_file . "\n";
} else {
	$output .= "✗ プラグインファイルが見つかりません: " . $plugin_file . "\n";
}
$output .= "\n";

// 2. プラグインメタデータの確認
$output .= "【プラグイン情報の取得】\n";
if (function_exists('get_plugin_data')) {
	$plugin_data = get_plugin_data($plugin_file);
	$output .= "プラグイン名: " . $plugin_data['Name'] . "\n";
	$output .= "バージョン: " . $plugin_data['Version'] . "\n";
	$output .= "説明: " . $plugin_data['Description'] . "\n";
} else {
	$output .= "✗ get_plugin_data() が利用できません\n";
}
$output .= "\n";

// 3. 有効化状態の確認
$output .= "【有効化状態の確認】\n";
$is_active = is_plugin_active('musashi-inquiry-approval/musashi-inquiry-approval.php');
$output .= "有効化状態: " . ($is_active ? "✓ 有効" : "✗ 無効") . "\n";
$output .= "\n";

// 4. 有効なプラグイン一覧
$output .= "【有効なプラグイン一覧（先頭10個）】\n";
$active_plugins = get_option('active_plugins', array());
if (empty($active_plugins)) {
	$output .= "有効なプラグインはありません\n";
} else {
	$count = 0;
	foreach ($active_plugins as $plugin) {
		if ($count < 10) {
			$output .= "- " . $plugin . "\n";
			$count++;
		}
	}
	if (count($active_plugins) > 10) {
		$output .= "... 他 " . (count($active_plugins) - 10) . " 個\n";
	}
}
$output .= "\n";

// 5. wp_options テーブルから有効なプラグイン情報を確認
$output .= "【データベースの有効なプラグイン情報】\n";
$active_plugins_from_db = $wpdb->get_var(
	"SELECT option_value FROM {$wpdb->options} WHERE option_name = 'active_plugins' LIMIT 1"
);
if ($active_plugins_from_db) {
	$plugins_array = maybe_unserialize($active_plugins_from_db);
	if (in_array('musashi-inquiry-approval/musashi-inquiry-approval.php', $plugins_array)) {
		$output .= "✓ プラグインはデータベースでも有効として登録されています\n";
	} else {
		$output .= "✗ プラグインはデータベースでは無効です\n";
	}
} else {
	$output .= "✗ active_plugins オプションが見つかりません\n";
}
$output .= "\n";

// 6. プラグインに必要な関数の確認
$output .= "【プラグインの依存関係チェック】\n";
if (function_exists('get_option')) {
	$output .= "✓ get_option() は使用可能です\n";
} else {
	$output .= "✗ get_option() が見つかりません\n";
}
if (function_exists('wp_mail')) {
	$output .= "✓ wp_mail() は使用可能です\n";
} else {
	$output .= "✗ wp_mail() が見つかりません\n";
}
if (class_exists('WP_Post')) {
	$output .= "✓ WP_Post クラスは使用可能です\n";
} else {
	$output .= "✗ WP_Post クラスが見つかりません\n";
}
$output .= "\n";

// 7. エラーログのチェック
$output .= "【PHPエラーログ（存在すれば）】\n";
$error_log = ini_get('error_log');
if ($error_log && file_exists($error_log)) {
	$output .= "エラーログファイル: " . $error_log . "\n";
	$lines = file($error_log);
	$recent_lines = array_slice($lines, -5);
	foreach ($recent_lines as $line) {
		if (strpos($line, 'musashi') !== false) {
			$output .= "  " . trim($line) . "\n";
		}
	}
} else {
	$output .= "エラーログファイルが見つかりません\n";
}

// HTMLとして出力
header('Content-Type: text/html; charset=UTF-8');
echo '<pre>' . htmlspecialchars($output, ENT_QUOTES, 'UTF-8') . '</pre>';
