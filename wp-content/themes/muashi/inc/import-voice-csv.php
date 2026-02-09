<?php
/**
 * お客様の声CSVインポート機能
 *
 * 管理画面「ツール > お客様の声CSVインポート」から実行可能。
 * CSVからお客様の声データ（カスタム投稿 + ACFフィールド + サムネイル）を一括投入する。
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * 管理メニューに「お客様の声CSVインポート」を追加
 */
function muashi_register_voice_csv_import_menu() {
    add_management_page(
        'お客様の声CSVインポート',
        'お客様の声CSVインポート',
        'manage_options',
        'muashi-voice-csv-import',
        'muashi_voice_csv_import_page'
    );
}
add_action( 'admin_menu', 'muashi_register_voice_csv_import_menu' );

/**
 * インポートページの表示・処理
 */
function muashi_voice_csv_import_page() {
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( 'アクセス権限がありません。' );
    }

    $default_csv_path = '';

    echo '<div class="wrap">';
    echo '<h1>お客様の声CSVインポート</h1>';

    // インポート実行
    if ( isset( $_POST['muashi_import_voice_csv'] ) && check_admin_referer( 'muashi_voice_csv_import_action', 'muashi_voice_csv_import_nonce' ) ) {
        $csv_path = isset( $_POST['csv_path'] ) ? wp_unslash( $_POST['csv_path'] ) : '';
        if ( empty( $csv_path ) || ! file_exists( $csv_path ) ) {
            echo '<div class="notice notice-error"><p>CSVファイルが見つかりません: ' . esc_html( $csv_path ) . '</p></div>';
        } else {
            muashi_execute_voice_csv_import( $csv_path );
        }
    }

    // フォーム表示
    echo '<form method="post">';
    wp_nonce_field( 'muashi_voice_csv_import_action', 'muashi_voice_csv_import_nonce' );
    echo '<table class="form-table">';
    echo '<tr><th><label for="csv_path">CSVファイルパス</label></th>';
    echo '<td><input type="text" name="csv_path" id="csv_path" value="' . esc_attr( $default_csv_path ) . '" class="large-text" />';
    echo '<p class="description">「お客様の声エクスポート」でダウンロードしたCSVファイルのフルパスを指定してください。</p></td></tr>';
    echo '</table>';
    echo '<p class="description" style="color: #d63638; font-weight: bold;">注意: 実行すると既存の全お客様の声データが削除され、CSVから再投入されます。</p>';
    echo '<p class="submit"><input type="submit" name="muashi_import_voice_csv" class="button button-primary" value="インポート実行" onclick="return confirm(\'既存の全お客様の声データを削除してCSVからインポートします。よろしいですか？\');" /></p>';
    echo '</form>';
    echo '</div>';
}

/**
 * CSVインポート実行
 */
function muashi_execute_voice_csv_import( $csv_path ) {
    set_time_limit( 300 );

    echo '<h2>インポート結果</h2>';
    echo '<pre style="background: #f0f0f1; padding: 15px; max-height: 600px; overflow-y: auto;">';

    // ========================================
    // Phase 1: 既存データ削除
    // ========================================
    echo "=== Phase 1: 既存お客様の声データを削除 ===\n";

    $existing = get_posts( array(
        'post_type'      => 'voice',
        'post_status'    => 'any',
        'posts_per_page' => -1,
        'fields'         => 'ids',
    ) );

    $deleted_count = 0;
    foreach ( $existing as $post_id ) {
        wp_delete_post( $post_id, true );
        $deleted_count++;
    }
    echo "削除完了: {$deleted_count}件\n\n";

    // ========================================
    // Phase 2: CSV読み込み＆インポート
    // ========================================
    echo "=== Phase 2: CSVインポート ===\n";

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

    // ヘッダー行スキップ
    fgetcsv( $handle );

    $imported_count = 0;
    $error_count    = 0;

    while ( ( $row = fgetcsv( $handle ) ) !== false ) {
        // 空行スキップ
        if ( empty( $row ) || ( count( $row ) === 1 && empty( trim( $row[0] ) ) ) ) {
            continue;
        }

        $title              = isset( $row[0] ) ? trim( $row[0] ) : '';
        $company            = isset( $row[1] ) ? trim( $row[1] ) : '';
        $position           = isset( $row[2] ) ? trim( $row[2] ) : '';
        $person_name        = isset( $row[3] ) ? trim( $row[3] ) : '';
        $thumbnail_filename = isset( $row[4] ) ? trim( $row[4] ) : '';
        $menu_order         = isset( $row[5] ) ? intval( $row[5] ) : 0;
        $content            = isset( $row[6] ) ? $row[6] : '';

        // 全角スペース → 半角スペースに変換
        $company     = str_replace( '　', ' ', $company );
        $position    = str_replace( '　', ' ', $position );
        $person_name = str_replace( '　', ' ', $person_name );

        if ( empty( $title ) ) {
            continue;
        }

        // 投稿作成
        $post_data = array(
            'post_title'   => $title,
            'post_content' => $content,
            'post_type'    => 'voice',
            'post_status'  => 'publish',
            'menu_order'   => $menu_order,
        );

        $post_id = wp_insert_post( $post_data, true );

        if ( is_wp_error( $post_id ) ) {
            echo "エラー: 投稿作成失敗 [{$title}]: " . $post_id->get_error_message() . "\n";
            $error_count++;
            continue;
        }

        // ACFフィールド設定
        if ( function_exists( 'update_field' ) ) {
            update_field( 'field_voice_company', $company, $post_id );
            update_field( 'field_voice_position', $position, $post_id );
            update_field( 'field_voice_person_name', $person_name, $post_id );
        } else {
            update_post_meta( $post_id, 'voice_company', $company );
            update_post_meta( $post_id, 'voice_position', $position );
            update_post_meta( $post_id, 'voice_person_name', $person_name );
        }

        // アイキャッチ画像紐付け
        $thumb_status = 'なし';
        if ( ! empty( $thumbnail_filename ) ) {
            $attachment = muashi_find_attachment_by_filename( $thumbnail_filename );
            if ( $attachment ) {
                set_post_thumbnail( $post_id, $attachment->ID );
                $thumb_status = "設定済み (ID:{$attachment->ID})";
            } else {
                $thumb_status = "画像未検出: {$thumbnail_filename}";
            }
        }

        echo "[{$menu_order}] {$title} - ID: {$post_id} | 会社: {$company} | 画像: {$thumb_status}\n";
        $imported_count++;
    }

    fclose( $handle );

    echo "\n=== 完了 ===\n";
    echo "インポート: {$imported_count}件\n";
    echo "エラー: {$error_count}件\n";
    echo "削除（旧データ）: {$deleted_count}件\n";
    echo '</pre>';

    if ( $imported_count > 0 && $error_count === 0 ) {
        echo '<div class="notice notice-success"><p>インポートが正常に完了しました。' . $imported_count . '件のお客様の声を登録しました。</p></div>';
    } elseif ( $error_count > 0 ) {
        echo '<div class="notice notice-warning"><p>インポート完了（一部エラーあり）。成功: ' . $imported_count . '件、エラー: ' . $error_count . '件</p></div>';
    }
}

/**
 * ファイル名でメディアライブラリからattachmentを検索
 */
function muashi_find_attachment_by_filename( $filename ) {
    global $wpdb;

    // _wp_attached_file メタで末尾一致検索
    $result = $wpdb->get_row( $wpdb->prepare(
        "SELECT post_id FROM {$wpdb->postmeta}
         WHERE meta_key = '_wp_attached_file'
         AND meta_value LIKE %s
         LIMIT 1",
        '%' . $wpdb->esc_like( $filename )
    ) );

    if ( $result ) {
        return get_post( $result->post_id );
    }

    return null;
}
