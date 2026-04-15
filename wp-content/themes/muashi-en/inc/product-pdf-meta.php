<?php
/**
 * 製品資料PDFメタボックス関連の処理
 */

/**
 * 製品資料PDFのメタボックス登録
 */
function muashi_register_product_pdf_metabox() {
    $post_types = array( 'product', 'featured_product' );
    foreach ( $post_types as $post_type ) {
        add_meta_box(
            'muashi-product-pdf',
            '資料PDF',
            'muashi_render_product_pdf_metabox',
            $post_type,
            'side',
            'default'
        );
    }
}
add_action('add_meta_boxes', 'muashi_register_product_pdf_metabox');

/**
 * メタボックスの描画
 */
function muashi_render_product_pdf_metabox( $post ) {
    wp_nonce_field('muashi_product_pdf_nonce', 'muashi_product_pdf_nonce');

    $attachment_id = (int) get_post_meta($post->ID, 'product_pdf_attachment_id', true);
    $pdf_url       = $attachment_id ? wp_get_attachment_url($attachment_id) : '';
    $external_url  = get_post_meta($post->ID, 'product_pdf_external_url', true);
    $source_type   = get_post_meta($post->ID, 'product_pdf_source_type', true);

    if ( ! $source_type ) {
        $source_type = 'media';
    }

    echo '<div id="muashi-product-pdf-meta" class="muashi-product-pdf-meta">';
    
    // ソース選択ラジオボタン
    echo '<div style="margin-bottom: 1rem;">';
    echo '<p style="margin-bottom: 0.5rem;"><label><input type="radio" name="muashi_pdf_source_type" value="media" ' . checked($source_type, 'media', false) . '> メディアライブラリ</label></p>';
    echo '<p style="margin-bottom: 0;"><label><input type="radio" name="muashi_pdf_source_type" value="external" ' . checked($source_type, 'external', false) . '> 外部URL（Google Drive等）</label></p>';
    echo '</div>';

    // メディアライブラリセクション
    echo '<div id="muashi-pdf-media-section">';
    echo '<input type="hidden" id="muashi_product_pdf_attachment_id" name="muashi_product_pdf_attachment_id" value="' . esc_attr($attachment_id) . '">';
    echo '<p><input type="text" id="muashi_product_pdf_url_display" class="widefat" value="' . esc_attr($pdf_url) . '" placeholder="PDFのURL（読み取り専用）" readonly></p>';
    echo '<p><button type="button" class="button muashi-product-pdf-select">PDFを選択</button> ';
    echo '<button type="button" class="button muashi-product-pdf-clear">クリア</button></p>';
    echo '<p class="description">メディアライブラリからPDFファイルを選択してください。</p>';
    echo '</div>'; // #muashi-pdf-media-section

    // 外部URLセクション
    echo '<div id="muashi-pdf-external-section" style="display:none;">';
    echo '<p><input type="url" id="muashi_product_pdf_external_url" name="muashi_product_pdf_external_url" class="widefat" value="' . esc_attr($external_url) . '" placeholder="https://example.com/file.pdf"></p>';
    echo '<p class="description">外部サービスの共有リンクなどを入力してください。</p>';
    echo '</div>'; // #muashi-pdf-external-section

    echo '</div>';
}

/**
 * 製品資料PDFメタ情報の保存
 */
function muashi_save_product_pdf_meta( $post_id ) {
    if ( defined('DOING_AUTOSAVE') && DOING_AUTOSAVE ) {
        return;
    }

    if ( ! isset($_POST['muashi_product_pdf_nonce']) || ! wp_verify_nonce($_POST['muashi_product_pdf_nonce'], 'muashi_product_pdf_nonce') ) {
        return;
    }

    if ( ! current_user_can('edit_post', $post_id) ) {
        return;
    }

    // ソースタイプの保存
    $source_type = 'media';
    if ( isset($_POST['muashi_pdf_source_type']) ) {
        $source_type = sanitize_key($_POST['muashi_pdf_source_type']);
        update_post_meta($post_id, 'product_pdf_source_type', $source_type);
    }

    if ( 'external' === $source_type ) {
        // 外部URLの場合：外部URLを保存し、メディアライブラリ情報は削除
        if ( isset($_POST['muashi_product_pdf_external_url']) ) {
            update_post_meta($post_id, 'product_pdf_external_url', esc_url_raw($_POST['muashi_product_pdf_external_url']));
        }
        delete_post_meta($post_id, 'product_pdf_attachment_id');

    } else {
        // メディアライブラリの場合：外部URLは削除し、メディアライブラリ情報を保存
        delete_post_meta($post_id, 'product_pdf_external_url');

        if ( isset($_POST['muashi_product_pdf_attachment_id']) ) {
            $raw_value = wp_unslash($_POST['muashi_product_pdf_attachment_id']);
            $attachment_id = $raw_value !== '' ? (int) $raw_value : 0;

            if ( $attachment_id > 0 && 'attachment' === get_post_type($attachment_id) ) {
                update_post_meta($post_id, 'product_pdf_attachment_id', $attachment_id);
            } else {
                delete_post_meta($post_id, 'product_pdf_attachment_id');
            }
        }
    }
}
add_action('save_post_product', 'muashi_save_product_pdf_meta');
add_action('save_post_featured_product', 'muashi_save_product_pdf_meta');

/**
 * 製品資料PDFメタボックス用スクリプト
 */
function muashi_enqueue_product_meta_admin_assets( $hook ) {
    if ( ! in_array($hook, array('post.php', 'post-new.php'), true) ) {
        return;
    }

    $screen = get_current_screen();
    if ( ! $screen || ! in_array( $screen->post_type, array( 'product', 'featured_product' ), true ) ) {
        return;
    }

    wp_enqueue_media();
    wp_enqueue_script(
        'muashi-product-pdf-meta',
        get_template_directory_uri() . '/admin/js/product-meta.js',
        array('jquery'),
        '1.0.0',
        true
    );
}
add_action('admin_enqueue_scripts', 'muashi_enqueue_product_meta_admin_assets');
