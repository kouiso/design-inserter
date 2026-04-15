<?php
/**
 * 製品ページカスタムURLメタボックス関連の処理
 */

/**
 * 製品ページURLのメタボックス登録
 */
function muashi_register_product_custom_url_metabox() {
    $post_types = array( 'product', 'featured_product' );
    foreach ( $post_types as $post_type ) {
        add_meta_box(
            'muashi-product-custom-url',
            '製品ページURL設定',
            'muashi_render_product_custom_url_metabox',
            $post_type,
            'side',
            'default'
        );
    }
}
add_action('add_meta_boxes', 'muashi_register_product_custom_url_metabox');

/**
 * メタボックスの描画
 */
function muashi_render_product_custom_url_metabox( $post ) {
    wp_nonce_field('muashi_product_custom_url_nonce', 'muashi_product_custom_url_nonce');

    $custom_url = get_post_meta($post->ID, 'product_custom_url', true);

    echo '<div class="muashi-product-custom-url-meta">';
    echo '<p><input type="text" id="muashi_product_custom_url" name="muashi_product_custom_url" class="widefat" value="' . esc_attr($custom_url) . '" placeholder="https://... または /contact/ など"></p>';
    echo '<p class="description">ダウンロードページ等の「製品ページへ」のリンク先を変更したい場合に入力してください。<br>空欄の場合は通常の製品ページ（詳細ページ）へ遷移します。</p>';
    echo '</div>';
}

/**
 * 製品ページURLメタ情報の保存
 */
function muashi_save_product_custom_url_meta( $post_id ) {
    if ( defined('DOING_AUTOSAVE') && DOING_AUTOSAVE ) {
        return;
    }

    if ( ! isset($_POST['muashi_product_custom_url_nonce']) || ! wp_verify_nonce($_POST['muashi_product_custom_url_nonce'], 'muashi_product_custom_url_nonce') ) {
        return;
    }

    if ( ! current_user_can('edit_post', $post_id) ) {
        return;
    }

    if ( isset($_POST['muashi_product_custom_url']) ) {
        // URLをサニタイズして保存
        update_post_meta($post_id, 'product_custom_url', esc_url_raw($_POST['muashi_product_custom_url']));
    }
}
add_action('save_post_product', 'muashi_save_product_custom_url_meta');
add_action('save_post_featured_product', 'muashi_save_product_custom_url_meta');
