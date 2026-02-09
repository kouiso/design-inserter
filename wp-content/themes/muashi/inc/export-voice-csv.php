<?php
/**
 * お客様の声CSVエクスポート機能
 *
 * 管理画面「ツール > お客様の声エクスポート」から実行可能。
 * 既存の voice 投稿データをCSVファイルとしてダウンロードする。
 * post_content 冒頭の著者情報パラグラフを自動パースして
 * 会社名・部署/役職・氏名に分離する。
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * 管理メニューに「お客様の声エクスポート」を追加
 */
function muashi_register_voice_csv_export_menu() {
    add_management_page(
        'お客様の声CSVエクスポート',
        'お客様の声エクスポート',
        'manage_options',
        'muashi-voice-csv-export',
        'muashi_voice_csv_export_page'
    );
}
add_action( 'admin_menu', 'muashi_register_voice_csv_export_menu' );

/**
 * エクスポートページの表示・処理
 */
function muashi_voice_csv_export_page() {
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( 'アクセス権限がありません。' );
    }

    // CSVダウンロード実行
    if ( isset( $_POST['muashi_export_voice_csv'] ) && check_admin_referer( 'muashi_voice_csv_export_action', 'muashi_voice_csv_export_nonce' ) ) {
        muashi_execute_voice_csv_export();
        return; // ダウンロード後はHTML出力しない
    }

    // プレビュー実行
    $preview_data = null;
    if ( isset( $_POST['muashi_preview_voice_csv'] ) && check_admin_referer( 'muashi_voice_csv_export_action', 'muashi_voice_csv_export_nonce' ) ) {
        $preview_data = muashi_get_voice_export_data();
    }

    echo '<div class="wrap">';
    echo '<h1>お客様の声CSVエクスポート</h1>';

    echo '<form method="post">';
    wp_nonce_field( 'muashi_voice_csv_export_action', 'muashi_voice_csv_export_nonce' );
    echo '<p class="description">post_content の冒頭パラグラフから著者情報（会社名・部署/役職・氏名）を自動抽出し、本文と分離してCSVに出力します。</p>';
    echo '<p class="submit">';
    echo '<input type="submit" name="muashi_preview_voice_csv" class="button button-secondary" value="プレビュー" /> ';
    echo '<input type="submit" name="muashi_export_voice_csv" class="button button-primary" value="CSVダウンロード" />';
    echo '</p>';
    echo '</form>';

    // プレビュー表示
    if ( $preview_data !== null ) {
        echo '<h2>プレビュー（' . count( $preview_data ) . '件）</h2>';
        echo '<table class="widefat striped">';
        echo '<thead><tr><th>#</th><th>タイトル</th><th>会社名</th><th>部署・役職</th><th>氏名</th><th>画像</th><th>menu_order</th><th>本文（先頭100文字）</th></tr></thead>';
        echo '<tbody>';
        foreach ( $preview_data as $i => $row ) {
            echo '<tr>';
            echo '<td>' . ( $i + 1 ) . '</td>';
            echo '<td>' . esc_html( $row['title'] ) . '</td>';
            echo '<td>' . esc_html( $row['company'] ) . '</td>';
            echo '<td>' . esc_html( $row['position'] ) . '</td>';
            echo '<td>' . esc_html( $row['person_name'] ) . '</td>';
            echo '<td>' . esc_html( $row['thumbnail_filename'] ) . '</td>';
            echo '<td>' . esc_html( $row['menu_order'] ) . '</td>';
            echo '<td>' . esc_html( mb_substr( strip_tags( $row['content_body'] ), 0, 100 ) ) . '…</td>';
            echo '</tr>';
        }
        echo '</tbody></table>';
    }

    echo '</div>';
}

/**
 * voice 投稿データを整形して配列で返す
 */
function muashi_get_voice_export_data() {
    $voices = get_posts( array(
        'post_type'      => 'voice',
        'post_status'    => 'any',
        'posts_per_page' => -1,
        'orderby'        => 'menu_order',
        'order'          => 'ASC',
    ) );

    $data = array();

    foreach ( $voices as $v ) {
        $content = $v->post_content;

        // ACFフィールドから著者情報を取得（優先）
        // ACFフィールドが空の場合のみ、冒頭パラグラフからパースを試みる
        $company     = get_field( 'voice_company', $v->ID );
        $position    = get_field( 'voice_position', $v->ID );
        $person_name = get_field( 'voice_person_name', $v->ID );

        if ( empty( $company ) && empty( $person_name ) ) {
            // ACFフィールドが空の場合: 冒頭パラグラフからパース（初回移行用）
            $author_info = muashi_parse_voice_author_paragraph( $content );
            $company     = $author_info['company'];
            $position    = $author_info['position'];
            $person_name = $author_info['person_name'];
            // 冒頭パラグラフを除去した本文
            $content = muashi_remove_first_paragraph_block( $content );
        }

        // サムネイルファイル名
        $thumb_filename = '';
        $thumb_id = get_post_thumbnail_id( $v->ID );
        if ( $thumb_id ) {
            $thumb_url = wp_get_attachment_url( $thumb_id );
            if ( $thumb_url ) {
                $thumb_filename = basename( $thumb_url );
            }
        }

        $data[] = array(
            'title'              => $v->post_title,
            'company'            => $company ?: '',
            'position'           => $position ?: '',
            'person_name'        => $person_name ?: '',
            'thumbnail_filename' => $thumb_filename,
            'menu_order'         => $v->menu_order,
            'content_body'       => $content,
        );
    }

    return $data;
}

/**
 * post_content の冒頭パラグラフから著者情報をパース
 *
 * パターン: <p>会社名<br>部署・役職<br>氏名 様</p>
 * - 1行目 → 会社名
 * - 最終行 → 氏名
 * - 中間行 → 部署・役職（複数あればスペース結合）
 * - 2行の場合 → 会社名 + 氏名（部署なし）
 */
function muashi_parse_voice_author_paragraph( $content ) {
    $result = array(
        'company'     => '',
        'position'    => '',
        'person_name' => '',
    );

    // 最初の wp:paragraph ブロック内の <p>...</p> を取得
    if ( ! preg_match( '/<!-- wp:paragraph -->\s*<p>(.*?)<\/p>\s*<!-- \/wp:paragraph -->/s', $content, $match ) ) {
        return $result;
    }

    $inner = $match[1];

    // <br> / <br /> / <br/> で分割し、HTMLタグ除去・トリム
    $lines = preg_split( '/<br\s*\/?>/i', $inner );
    $lines = array_map( function( $line ) {
        return trim( strip_tags( html_entity_decode( $line, ENT_QUOTES, 'UTF-8' ) ) );
    }, $lines );
    $lines = array_values( array_filter( $lines, function( $line ) {
        return $line !== '';
    } ) );

    if ( count( $lines ) === 0 ) {
        return $result;
    }

    // 1行目 = 会社名
    $result['company'] = $lines[0];

    if ( count( $lines ) >= 3 ) {
        // 3行以上: 最終行 = 氏名, 中間 = 部署・役職
        $result['person_name'] = $lines[ count( $lines ) - 1 ];
        $middle = array_slice( $lines, 1, count( $lines ) - 2 );
        $result['position'] = implode( ' ', $middle );
    } elseif ( count( $lines ) === 2 ) {
        // 2行: 会社名 + 氏名（部署なし）
        $result['person_name'] = $lines[1];
    } else {
        // 1行のみ: 会社名のみ
    }

    return $result;
}

/**
 * post_content から冒頭の wp:paragraph ブロックを1つ除去
 */
function muashi_remove_first_paragraph_block( $content ) {
    // 最初の wp:paragraph ブロックを除去（改行含む）
    $result = preg_replace(
        '/^<!-- wp:paragraph -->\s*<p>.*?<\/p>\s*<!-- \/wp:paragraph -->\s*/s',
        '',
        $content,
        1
    );
    return ltrim( $result, "\n\r" );
}

/**
 * CSVダウンロード実行
 */
function muashi_execute_voice_csv_export() {
    $data = muashi_get_voice_export_data();

    $filename = 'voice-export-' . date( 'Ymd-His' ) . '.csv';

    header( 'Content-Type: text/csv; charset=UTF-8' );
    header( 'Content-Disposition: attachment; filename="' . $filename . '"' );
    header( 'Pragma: no-cache' );
    header( 'Expires: 0' );

    $output = fopen( 'php://output', 'w' );

    // BOM
    fwrite( $output, "\xEF\xBB\xBF" );

    // ヘッダー行
    fputcsv( $output, array( 'タイトル', '会社名', '部署・役職', '氏名', 'アイキャッチ画像ファイル名', 'menu_order', '本文' ) );

    // データ行
    foreach ( $data as $row ) {
        fputcsv( $output, array(
            $row['title'],
            $row['company'],
            $row['position'],
            $row['person_name'],
            $row['thumbnail_filename'],
            $row['menu_order'],
            $row['content_body'],
        ) );
    }

    fclose( $output );
    exit;
}
