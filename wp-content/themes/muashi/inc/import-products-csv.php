<?php
/**
 * 製品CSVインポート機能
 *
 * 管理画面「ツール > 製品CSVインポート」から実行可能。
 * CSVから製品データ（カスタム投稿 + ACFフィールド + タクソノミー）を一括投入する。
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * 管理メニューに「製品CSVインポート」を追加
 */
function muashi_register_product_csv_import_menu() {
    add_management_page(
        '製品CSVインポート',
        '製品CSVインポート',
        'manage_options',
        'muashi-product-csv-import',
        'muashi_product_csv_import_page'
    );
}
add_action( 'admin_menu', 'muashi_register_product_csv_import_menu' );

/**
 * インポートページの表示・処理
 */
function muashi_product_csv_import_page() {
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( 'アクセス権限がありません。' );
    }

    $default_csv_path = 'C:\\Users\\suker\\Downloads\\【20260125提出】20260116_新ホームページに掲載する品番_(現HPに記載なかったもの更新) (1).xlsx のコピー - 20260125（最新）説明コメント修正、追加.csv';

    echo '<div class="wrap">';
    echo '<h1>製品CSVインポート</h1>';

    // インポート実行
    if ( isset( $_POST['muashi_import_csv'] ) && check_admin_referer( 'muashi_csv_import_action', 'muashi_csv_import_nonce' ) ) {
        $csv_path = isset( $_POST['csv_path'] ) ? wp_unslash( $_POST['csv_path'] ) : '';
        if ( empty( $csv_path ) || ! file_exists( $csv_path ) ) {
            echo '<div class="notice notice-error"><p>CSVファイルが見つかりません: ' . esc_html( $csv_path ) . '</p></div>';
        } else {
            muashi_execute_product_csv_import( $csv_path );
        }
    }

    // フォーム表示
    echo '<form method="post">';
    wp_nonce_field( 'muashi_csv_import_action', 'muashi_csv_import_nonce' );
    echo '<table class="form-table">';
    echo '<tr><th><label for="csv_path">CSVファイルパス</label></th>';
    echo '<td><input type="text" name="csv_path" id="csv_path" value="' . esc_attr( $default_csv_path ) . '" class="large-text" /></td></tr>';
    echo '</table>';
    echo '<p class="description" style="color: #d63638; font-weight: bold;">注意: 実行すると既存の全製品データが削除され、CSVから再投入されます。</p>';
    echo '<p class="submit"><input type="submit" name="muashi_import_csv" class="button button-primary" value="インポート実行" onclick="return confirm(\'既存の全製品データを削除してCSVからインポートします。よろしいですか？\');" /></p>';
    echo '</form>';
    echo '</div>';
}

/**
 * CSVインポート実行
 */
function muashi_execute_product_csv_import( $csv_path ) {
    // 実行時間を延長
    set_time_limit( 300 );

    echo '<h2>インポート結果</h2>';
    echo '<pre style="background: #f0f0f1; padding: 15px; max-height: 600px; overflow-y: auto;">';

    // ========================================
    // Phase 1: 既存データ削除
    // ========================================
    echo "=== Phase 1: 既存製品データを削除 ===\n";

    $existing_products = get_posts( array(
        'post_type'      => 'product',
        'post_status'    => 'any',
        'posts_per_page' => -1,
        'fields'         => 'ids',
    ) );

    $deleted_count = 0;
    foreach ( $existing_products as $product_id ) {
        wp_delete_post( $product_id, true );
        $deleted_count++;
    }
    echo "削除完了: {$deleted_count}件\n\n";

    // ========================================
    // Phase 2: タクソノミーターム定義
    // ========================================
    echo "=== Phase 2: タクソノミーターム準備 ===\n";

    $taxonomy_map = array(
        'product_application' => array(
            'start_col' => 8,
            'terms'     => array( '自動車内装', '自動車外装', '家電', 'ゲーム機', 'カメラ/光学機器', 'モバイル機器', 'パソコン', 'その他' ),
        ),
        'product_material' => array(
            'start_col' => 16,
            'terms'     => array( 'ABS', 'PC', 'PC/ABS', 'PS', 'PMMA', 'PP', 'ナイロン', 'ステンレス', 'アルミニウム', 'マグネシウム合金', 'めっき', 'その他金属' ),
        ),
        'product_design' => array(
            'start_col' => 28,
            'terms'     => array( '高光沢', '高輝度', '金属調/メタリック', 'メッキ調', 'ミラー調/メッキ代替', 'ソフトフィール（触感）', '艶消し', '模様' ),
        ),
        'product_function' => array(
            'start_col' => 36,
            'terms'     => array( '耐傷つき性', '耐汚染性', '無反射', '抗菌・抗ウィルス', '軟密着素材対応', '耐加水分解性', '電波透過性' ),
        ),
        'product_environment' => array(
            'start_col' => 43,
            'terms'     => array( 'カーボンニュートラル/バイオ', '省エネ/低温硬化', '省エネ/UV硬化', '低VOC/水系', '低VOC/無溶剤・ハイソリッド', '有害物質低減/BTXフリー・ BPAフリー', '有害物質低減/メッキ代替塗装', '低VOC/型内塗装' ),
        ),
    );

    // 既存タームを削除して再作成
    foreach ( $taxonomy_map as $taxonomy => $config ) {
        $existing_terms = get_terms( array(
            'taxonomy'   => $taxonomy,
            'hide_empty' => false,
            'fields'     => 'ids',
        ) );
        if ( ! is_wp_error( $existing_terms ) ) {
            foreach ( $existing_terms as $term_id ) {
                wp_delete_term( $term_id, $taxonomy );
            }
        }

        // ターム作成
        foreach ( $config['terms'] as $index => $term_name ) {
            $result = wp_insert_term( $term_name, $taxonomy );
            if ( is_wp_error( $result ) ) {
                echo "警告: ターム作成失敗 [{$taxonomy}] {$term_name}: " . $result->get_error_message() . "\n";
            }
        }
        echo "タクソノミー [{$taxonomy}]: " . count( $config['terms'] ) . "ターム作成\n";
    }
    echo "\n";

    // ========================================
    // Phase 3: CSV読み込み＆インポート
    // ========================================
    echo "=== Phase 3: CSVインポート ===\n";

    // BOM対応でファイルを開く
    $handle = fopen( $csv_path, 'r' );
    if ( ! $handle ) {
        echo "エラー: CSVファイルを開けません。\n";
        echo '</pre>';
        return;
    }

    // BOMスキップ
    $bom = fread( $handle, 3 );
    if ( $bom !== "\xEF\xBB\xBF" ) {
        rewind( $handle );
    }

    // ヘッダー行をスキップ（行1: バイリンガルヘッダー、行2: タクソノミーサブヘッダー、行3-4: 空行）
    $skip_rows = 4;
    for ( $i = 0; $i < $skip_rows; $i++ ) {
        fgetcsv( $handle );
    }

    $imported_count = 0;
    $error_count    = 0;
    $menu_order     = 1;

    while ( ( $row = fgetcsv( $handle ) ) !== false ) {
        // 空行スキップ
        if ( empty( $row ) || ( count( $row ) === 1 && empty( trim( $row[0] ) ) ) ) {
            continue;
        }

        // col 0 (日本語品名) が空なら空行
        $product_name_ja = isset( $row[0] ) ? $row[0] : '';
        if ( empty( trim( $product_name_ja ) ) ) {
            continue;
        }

        // 全角スペース → 半角スペースに変換
        $product_name_ja = str_replace( "\xE3\x80\x80", ' ', $product_name_ja );

        // ACFフィールド値取得（単一行フィールドはtrimで末尾改行除去）
        $name_en      = isset( $row[1] ) ? trim( $row[1] ) : '';
        $line_number  = isset( $row[2] ) ? trim( $row[2] ) : '';
        $solvent_type = isset( $row[3] ) ? trim( $row[3] ) : '';
        $paint_type   = isset( $row[4] ) ? trim( $row[4] ) : '';
        $resin_type   = isset( $row[5] ) ? trim( $row[5] ) : '';
        $remarks      = isset( $row[6] ) ? trim( $row[6] ) : '';
        $description  = isset( $row[7] ) ? $row[7] : '';

        // 全角スペース変換（全フィールド）
        $name_en      = str_replace( "\xE3\x80\x80", ' ', $name_en );
        $line_number  = str_replace( "\xE3\x80\x80", ' ', $line_number );
        $solvent_type = str_replace( "\xE3\x80\x80", ' ', $solvent_type );
        $paint_type   = str_replace( "\xE3\x80\x80", ' ', $paint_type );
        $resin_type   = str_replace( "\xE3\x80\x80", ' ', $resin_type );
        $remarks      = str_replace( "\xE3\x80\x80", ' ', $remarks );

        // post_content を自動フォーマット（ショートコードでカスタムフィールド値を埋め込み）
        $post_content  = "製品名（商標）：[product_field name=\"product_name_trademark_en\"]\n";
        $post_content .= "ライン番号：[product_field name=\"product_line_number\"]\n";
        $post_content .= "[product_field name=\"product_solvent_type\"]\n";
        $post_content .= "[product_field name=\"product_paint_type\"]\n";
        $post_content .= "[product_field name=\"product_resin_type\"]\n";
        $post_content .= "[product_field name=\"product_remarks\"]\n";
        $post_content .= "\n【製品概要】\n\n" . $description . "\n\n【製品カタログ】\n\n準備中";

        // 投稿作成
        $post_data = array(
            'post_title'   => $product_name_ja,
            'post_content' => $post_content,
            'post_type'    => 'product',
            'post_status'  => 'publish',
            'menu_order'   => $menu_order,
        );

        $post_id = wp_insert_post( $post_data, true );

        if ( is_wp_error( $post_id ) ) {
            echo "エラー: 投稿作成失敗 [{$product_name_ja}]: " . $post_id->get_error_message() . "\n";
            $error_count++;
            continue;
        }

        // ACFフィールド設定
        if ( function_exists( 'update_field' ) ) {
            update_field( 'field_product_name_trademark_en', $name_en, $post_id );
            update_field( 'field_product_line_number', $line_number, $post_id );
            update_field( 'field_product_solvent_type', $solvent_type, $post_id );
            update_field( 'field_product_paint_type', $paint_type, $post_id );
            update_field( 'field_product_resin_type', $resin_type, $post_id );
            update_field( 'field_product_remarks', $remarks, $post_id );
        } else {
            // ACF未インストール時のフォールバック
            update_post_meta( $post_id, 'product_name_trademark_en', $name_en );
            update_post_meta( $post_id, 'product_line_number', $line_number );
            update_post_meta( $post_id, 'product_solvent_type', $solvent_type );
            update_post_meta( $post_id, 'product_paint_type', $paint_type );
            update_post_meta( $post_id, 'product_resin_type', $resin_type );
            update_post_meta( $post_id, 'product_remarks', $remarks );
        }

        // タクソノミー紐付け
        foreach ( $taxonomy_map as $taxonomy => $config ) {
            $term_names_to_assign = array();
            foreach ( $config['terms'] as $index => $term_name ) {
                $col_index = $config['start_col'] + $index;
                $cell_value = isset( $row[ $col_index ] ) ? trim( $row[ $col_index ] ) : '';
                // ○ (U+25CB) または 〇 (U+3007) の場合のみ紐付け
                if ( $cell_value === '○' || $cell_value === '〇' ) {
                    $term_names_to_assign[] = $term_name;
                }
            }
            if ( ! empty( $term_names_to_assign ) ) {
                wp_set_object_terms( $post_id, $term_names_to_assign, $taxonomy );
            }
        }

        echo "[{$menu_order}] {$product_name_ja} ({$line_number}) - ID: {$post_id}\n";
        $imported_count++;
        $menu_order++;
    }

    fclose( $handle );

    echo "\n=== 完了 ===\n";
    echo "インポート: {$imported_count}件\n";
    echo "エラー: {$error_count}件\n";
    echo "削除（旧データ）: {$deleted_count}件\n";
    echo '</pre>';

    if ( $imported_count > 0 && $error_count === 0 ) {
        echo '<div class="notice notice-success"><p>インポートが正常に完了しました。' . $imported_count . '件の製品を登録しました。</p></div>';
    } elseif ( $error_count > 0 ) {
        echo '<div class="notice notice-warning"><p>インポート完了（一部エラーあり）。成功: ' . $imported_count . '件、エラー: ' . $error_count . '件</p></div>';
    }
}
