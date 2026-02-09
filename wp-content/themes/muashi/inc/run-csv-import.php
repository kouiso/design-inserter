<?php
/**
 * WP-CLI用CSVインポート実行スクリプト
 * 使用方法: wp eval-file wp-content/themes/muashi/inc/run-csv-import.php
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$csv_path = 'C:\\Users\\suker\\Downloads\\【20260125提出】20260116_新ホームページに掲載する品番_(現HPに記載なかったもの更新) (1).xlsx のコピー - 20260125（最新）説明コメント修正、追加.csv';

if ( ! file_exists( $csv_path ) ) {
    echo "エラー: CSVファイルが見つかりません: {$csv_path}\n";
    exit( 1 );
}

echo "CSVファイル: {$csv_path}\n";
echo "ファイルサイズ: " . filesize( $csv_path ) . " bytes\n\n";

// インポート関数がまだ読み込まれていない場合に備えて
if ( ! function_exists( 'muashi_execute_product_csv_import' ) ) {
    require_once get_theme_file_path( '/inc/import-products-csv.php' );
}

muashi_execute_product_csv_import( $csv_path );
