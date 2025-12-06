<?php

/**
 * 変数ファイルの読み込み
 */
require_once(get_theme_file_path('/inc/variable.php'));

/**
 * PHPのメモリー上限の書き換え
 */
ini_set('memory_limit', '256M');

/**
 * wp_head　不要タグの削除
 */
remove_action( 'wp_head', 'wp_generator' ); //WordPressのバージョン情報
remove_action( 'wp_head', 'rsd_link' ); //外部アプリケーションから情報を取得するタグ
remove_action( 'wp_head', 'wlwmanifest_link' ); //Windows Live Writer用のタグ
remove_action( 'wp_head', 'index_rel_link' ); //現在の文書に対する「索引」であることを示すタグ
remove_action( 'wp_head', 'wp_shortlink_wp_head', 10, 0 ); //「?p=投稿ID」形式のデフォルトパーマリンクタグ
remove_action( 'wp_head', 'name_viewport' ); //「?p=投稿ID」形式のデフォルトパーマリンクタグ

//「link rel=next」等のタグ
remove_action( 'wp_head', 'parent_post_rel_link', 10, 0 );
remove_action( 'wp_head', 'start_post_rel_link', 10, 0 );
remove_action( 'wp_head', 'adjacent_posts_rel_link_wp_head', 10, 0 );

//フィード関連のタグ
remove_action( 'wp_head', 'feed_links', 2);
remove_action( 'wp_head', 'feed_links_extra', 3);

//絵文字関連タグ
remove_action( 'wp_head', 'print_emoji_detection_script', 7);
remove_action( 'admin_print_scripts', 'print_emoji_detection_script');
remove_action( 'wp_print_styles', 'print_emoji_styles' );
remove_action( 'admin_print_styles', 'print_emoji_styles');
add_filter( 'emoji_svg_url', '__return_false' );

/**
 * add_theme_support
 */
add_action( 'after_setup_theme', function(){
    // add_theme_support( 'title-tag' ); // tiltleタグの追加
    add_theme_support( 'post-thumbnails' ); //サムネイル機能の追加
    add_theme_support('menus'); // カスタムメニューの追加
    add_theme_support('widgets'); // ウィジェットの追加
});

/**
 * session_start
 */
add_action('init', function(){
    session_start();
});

/**
 * ツールバー非表示
 */
add_filter('show_admin_bar', '__return_false');

/**
 * css、js読み込み
 */
function my_styles() {
    wp_enqueue_style( 'scss-style', get_template_directory_uri() . '/assets/css/style.css', '', date('YmdGi', filemtime(get_template_directory() . '/assets/css/style.css')),''  );
    wp_enqueue_style( 'style', get_template_directory_uri() . '/style.css' , '', date('YmdGi', filemtime( get_template_directory().'/style.css' )),''  );
    wp_enqueue_script('jquery');
    wp_enqueue_script( 'common-script', get_template_directory_uri() . '/assets/js/common.js', array('jquery'), date('YmdGi', filemtime( get_template_directory().'/assets/js/common.js' )),'' );
}
add_action( 'wp_enqueue_scripts', 'my_styles' );


function addDefer($tag, $handle) {
    $handles = [
        'common-script',
        'animation-script',
        'slider-script'
    ];
    if(in_array($handle, $handles, true)) {
        return str_replace(' src=', ' defer src=', $tag);
    }
    return $tag;
}

add_filter('script_loader_tag', 'addDefer', 10, 2);

//全投稿の最終更新日
function all_modified_date( $post_type = "post", $format = "Y-m-d H:i:s" ){
    $all_modified_date = "";

    $args["post_type"] = $post_type;
    $args["orderby"] = "modified";
    $args["order"] = "DESC";
    $args["posts_per_page"] = 1;

    $query = new WP_Query( $args );
    if ($query->have_posts()):
        while ($query->have_posts()):
            $query->the_post();

            $all_modified_date = get_the_modified_date( $format );
        endwhile;
        wp_reset_postdata();
    else:
        $all_modified_date = "投稿がありません";
    endif;

    return $all_modified_date;
}

// 投稿のアーカイブページを作成する
function post_has_archive($args, $post_type)
{
    if ('post' == $post_type) {
        $args['rewrite'] = true; // リライトを有効にする
        $args['has_archive'] = 'news'; // 任意のスラッグ名
    }
    return $args;
}
add_filter('register_post_type_args', 'post_has_archive', 10, 2);


/**
 * メディア投稿タイプ
 */
function muashi_register_media_post_type() {
    $labels = array(
        'name'               => 'メディア',
        'singular_name'      => 'メディア',
        'menu_name'          => 'メディア',
        'name_admin_bar'     => 'メディア',
        'add_new'            => '新規追加',
        'add_new_item'       => 'メディアを追加',
        'edit_item'          => 'メディアを編集',
        'new_item'           => '新しいメディア',
        'view_item'          => 'メディアを表示',
        'search_items'       => 'メディアを検索',
        'not_found'          => 'メディアが見つかりませんでした',
        'not_found_in_trash' => 'ゴミ箱にメディアはありません',
        'all_items'          => 'すべてのメディア',
    );

    $args = array(
        'labels'             => $labels,
        'public'             => true,
        'has_archive'        => true,
        'rewrite'            => array( 'slug' => 'media' ),
        'menu_icon'          => 'dashicons-megaphone',
        'supports'           => array( 'title', 'editor', 'thumbnail', 'excerpt' ),
        'taxonomies'         => array( 'media_category', 'category' ),
        'show_in_rest'       => true,
    );

    register_post_type( 'media_post', $args );
}
add_action( 'init', 'muashi_register_media_post_type' );

/**
 * メディアカテゴリ
 */
function muashi_register_media_category_taxonomy() {
    $labels = array(
        'name'              => 'メディアカテゴリー',
        'singular_name'     => 'メディアカテゴリー',
        'search_items'      => 'カテゴリーを検索',
        'all_items'         => 'すべてのカテゴリー',
        'parent_item'       => '親カテゴリー',
        'parent_item_colon' => '親カテゴリー:',
        'edit_item'         => 'カテゴリーを編集',
        'update_item'       => 'カテゴリーを更新',
        'add_new_item'      => '新規カテゴリーを追加',
        'new_item_name'     => '新しいカテゴリー名',
        'menu_name'         => 'メディアカテゴリー',
    );

    $args = array(
        'labels'            => $labels,
        'hierarchical'      => true,
        'public'            => true,
        'show_ui'           => true,
        'show_admin_column' => true,
        'show_in_rest'      => true,
        'rewrite'           => array( 'slug' => 'media-category' ),
    );

    register_taxonomy( 'media_category', array( 'media_post' ), $args );

    register_taxonomy_for_object_type( 'media_category', 'media_post' );
}
add_action( 'init', 'muashi_register_media_category_taxonomy' );


if ( ! function_exists( 'muashi_get_primary_category_name' ) ) {
    /**
     * Returns the first available category name for a post.
     * Prefers the custom media taxonomy but falls back to the default category taxonomy.
     * Logs detailed information when categories cannot be resolved.
     */
    function muashi_get_primary_category_name( $post_id ) {
        if ( ! $post_id ) {
            error_log( 'muashi_get_primary_category_name: Missing post ID' );
            return '';
        }

        $taxonomies = array( 'media_category', 'category' );

        foreach ( $taxonomies as $taxonomy ) {
            if ( ! taxonomy_exists( $taxonomy ) ) {
                error_log( sprintf( 'muashi_get_primary_category_name: Taxonomy %s does not exist', $taxonomy ) );
                continue;
            }

            $terms = get_the_terms( $post_id, $taxonomy );

            if ( is_wp_error( $terms ) ) {
                error_log( sprintf( 'muashi_get_primary_category_name: WP_Error for post %d taxonomy %s: %s', $post_id, $taxonomy, $terms->get_error_message() ) );
                continue;
            }

            if ( empty( $terms ) ) {
                continue;
            }

            $term = reset( $terms );
            if ( $term && isset( $term->name ) ) {
                return $term->name;
            }
        }

        error_log( sprintf( 'muashi_get_primary_category_name: No category terms found for post %d', $post_id ) );
        return '';
    }
}



//ディスクリプション
add_action('admin_menu', 'add_custom_fields');
add_action('save_post', 'save_custom_fields');

// 記事ページと固定ページでカスタムフィールドを表示
function add_custom_fields() {
    add_meta_box( 'my_sectionid', 'メタ設定', 'my_custom_fields', 'post');
    add_meta_box( 'my_sectionid', 'メタ設定', 'my_custom_fields', 'page');
}

function my_custom_fields() {
    global $post;
    $keywords = get_post_meta($post->ID,'keywords',true);
    $description = get_post_meta($post->ID,'description',true);

    echo '<p>キーワード（半角カンマ区切り）<br>';
    echo '<input type="text" name="keywords" value="'.esc_html($keywords).'" size="60"></p>';

    echo '<p>ページの説明（description）160文字以内<br>';
    echo '<input type="text" style="width: 600px;height: 40px;" name="description" value="'.esc_html($description).'" maxlength="160"></p>';
}

// カスタムフィールドの値を保存
function save_custom_fields( $post_id ) {
    if(!empty($_POST['keywords']))
        update_post_meta($post_id, 'keywords', $_POST['keywords'] );
    else delete_post_meta($post_id, 'keywords');

    if(!empty($_POST['description']))
        update_post_meta($post_id, 'description', $_POST['description'] );
    else delete_post_meta($post_id, 'description');
}

/**
 * 製品資料PDFのメタボックス
 */
function muashi_register_product_pdf_metabox() {
    add_meta_box(
        'muashi-product-pdf',
        '資料PDF',
        'muashi_render_product_pdf_metabox',
        'product',
        'side',
        'default'
    );
}
add_action('add_meta_boxes', 'muashi_register_product_pdf_metabox');

/**
 * メタボックスの描画
 */
function muashi_render_product_pdf_metabox( $post ) {
    wp_nonce_field('muashi_product_pdf_nonce', 'muashi_product_pdf_nonce');

    $attachment_id = (int) get_post_meta($post->ID, 'product_pdf_attachment_id', true);
    $pdf_url       = $attachment_id ? wp_get_attachment_url($attachment_id) : '';

    echo '<div id="muashi-product-pdf-meta" class="muashi-product-pdf-meta">';
    echo '<input type="hidden" id="muashi_product_pdf_attachment_id" name="muashi_product_pdf_attachment_id" value="' . esc_attr($attachment_id) . '">';
    echo '<p><input type="text" id="muashi_product_pdf_url_display" class="widefat" value="' . esc_attr($pdf_url) . '" placeholder="PDFのURL" readonly></p>';
    echo '<p><button type="button" class="button muashi-product-pdf-select">PDFを選択</button> ';
    echo '<button type="button" class="button muashi-product-pdf-clear">クリア</button></p>';
    echo '<p class="description">メディアライブラリからPDFファイルを選択してください。</p>';
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
add_action('save_post_product', 'muashi_save_product_pdf_meta');

/**
 * 製品資料PDFメタボックス用スクリプト
 */
function muashi_enqueue_product_meta_admin_assets( $hook ) {
    if ( ! in_array($hook, array('post.php', 'post-new.php'), true) ) {
        return;
    }

    $screen = get_current_screen();
    if ( ! $screen || 'product' !== $screen->post_type ) {
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


add_filter( 'wpcf7_validate_email', 'wpcf7_validate_email_filter_extend', 11, 2 );
add_filter( 'wpcf7_validate_email*', 'wpcf7_validate_email_filter_extend', 11, 2 );
function wpcf7_validate_email_filter_extend( $result, $tag ) {
    $type = $tag['type'];
    $name = $tag['name'];
    $_POST[$name] = trim( strtr( (string) $_POST[$name], "n", " " ) );
    if ( 'email' == $type || 'email*' == $type ) {
        if (preg_match('/(.*)_confirm$/', $name, $matches)){ //確認用メルアド入力フォーム名を ○○○_confirm としています。
            $target_name = $matches[1];
            if ($_POST[$name] != $_POST[$target_name]) {
                if (method_exists($result, 'invalidate')) {
                    $result->invalidate( $tag,"確認用のメールアドレスが一致していません");
                } else {
                    $result['valid'] = false;
                    $result['reason'][$name] = '確認用のメールアドレスが一致していません';
                }
            }
        }
    }
    return $result;
}

add_filter('wpcf7_validate_hidden', 'muashi_validate_selected_products_field', 20, 2);
add_filter('wpcf7_validate_hidden*', 'muashi_validate_selected_products_field', 20, 2);

function muashi_validate_selected_products_field( $result, $tag ) {
    $tag_name = '';
    if ( is_array($tag) && isset($tag['name']) ) {
        $tag_name = $tag['name'];
    } elseif ( is_object($tag) && isset($tag->name) ) {
        $tag_name = $tag->name;
    }

    if ( 'selected_products' !== $tag_name ) {
        return $result;
    }

    $raw_value = isset($_POST['selected_products']) ? wp_unslash($_POST['selected_products']) : '';
    if ( is_array($raw_value) ) {
        $raw_value = implode(',', $raw_value);
    }
    $raw_value = trim( (string) $raw_value );

    $error_message_empty = '資料を少なくとも1件選択してください。';
    $error_message_limit = '資料は最大5件まで選択できます。5件を超える場合はお問い合わせください。';

    if ( $raw_value === '' ) {
        if ( method_exists($result, 'invalidate') ) {
            $result->invalidate( $tag, $error_message_empty );
        } else {
            $result['valid']        = false;
            $result['reason'][$tag_name] = $error_message_empty;
        }
        return $result;
    }

    $ids = array_filter( array_map( 'intval', explode( ',', $raw_value ) ) );
    $ids = array_values( array_unique( $ids ) );

    if ( empty( $ids ) ) {
        if ( method_exists($result, 'invalidate') ) {
            $result->invalidate( $tag, $error_message_empty );
        } else {
            $result['valid']        = false;
            $result['reason'][$tag_name] = $error_message_empty;
        }
        return $result;
    }

    if ( count( $ids ) > 5 ) {
        if ( method_exists($result, 'invalidate') ) {
            $result->invalidate( $tag, $error_message_limit );
        } else {
            $result['valid']        = false;
            $result['reason'][$tag_name] = $error_message_limit;
        }
        return $result;
    }

    $valid_ids = array();
    foreach ( $ids as $id ) {
        $post = get_post( $id );
        if ( $post && 'product' === $post->post_type && 'publish' === $post->post_status ) {
            $valid_ids[] = $id;
        }
    }

    if ( empty( $valid_ids ) ) {
        if ( method_exists($result, 'invalidate') ) {
            $result->invalidate( $tag, $error_message_empty );
        } else {
            $result['valid']        = false;
            $result['reason'][$tag_name] = $error_message_empty;
        }
        return $result;
    }

    $_POST['selected_products'] = implode( ',', $valid_ids );

    return $result;
}

add_filter('wpcf7_mail_components', 'muashi_append_download_summary_to_mail', 10, 3);

function muashi_append_download_summary_to_mail( $components, $contact_form, $instance ) {
    if ( empty($_POST['selected_products']) ) {
        return $components;
    }

    $raw_ids = wp_unslash( $_POST['selected_products'] );
    $ids     = array_filter( array_map( 'intval', explode( ',', $raw_ids ) ) );
    $ids     = array_values( array_unique( $ids ) );

    if ( empty( $ids ) ) {
        return $components;
    }

    $lines = array();
    foreach ( $ids as $id ) {
        $post = get_post( $id );
        if ( ! $post || 'product' !== $post->post_type ) {
            continue;
        }

        $title     = get_the_title( $post );
        $permalink = get_permalink( $post );
        $pdf_id    = (int) get_post_meta( $id, 'product_pdf_attachment_id', true );
        $pdf_url   = $pdf_id ? wp_get_attachment_url( $pdf_id ) : '';

        $line  = '・' . $title;
        $line .= '\n  PDF: ' . ( $pdf_url ? $pdf_url : '未設定' );
        $line .= '\n  製品ページ: ' . $permalink;
        $lines[] = $line;
    }

    if ( empty( $lines ) ) {
        return $components;
    }

    $summary = "==== 選択した資料 ====\n" . implode( "\n\n", $lines );

    $source_id = isset( $_POST['source_product'] ) ? (int) $_POST['source_product'] : 0;
    if ( $source_id && ! in_array( $source_id, $ids, true ) ) {
        $source_post = get_post( $source_id );
        if ( $source_post && 'product' === $source_post->post_type ) {
            $source_title = get_the_title( $source_post );
            $source_line  = '※ このページから遷移: ' . $source_title;
            $source_line .= '\n  製品ページ: ' . get_permalink( $source_post );
            $source_pdf_id  = (int) get_post_meta( $source_id, 'product_pdf_attachment_id', true );
            $source_pdf_url = $source_pdf_id ? wp_get_attachment_url( $source_pdf_id ) : '';
            if ( $source_pdf_url ) {
                $source_line .= '\n  PDF: ' . $source_pdf_url;
            }
            $summary .= "\n\n" . $source_line;
        }
    }

    $summary .= "\n";

    foreach ( array( 'mail', 'mail_2' ) as $mail_key ) {
        if ( ! isset( $components[ $mail_key ] ) ) {
            continue;
        }
        if ( isset( $components[ $mail_key ]['active'] ) && ! $components[ $mail_key ]['active'] ) {
            continue;
        }
        $body = isset( $components[ $mail_key ]['body'] ) ? $components[ $mail_key ]['body'] : '';
        $components[ $mail_key ]['body'] = muashi_integrate_download_summary_into_body( $body, $summary );
    }

    $_POST['download_summary'] = $summary;

    return $components;
}

function muashi_integrate_download_summary_into_body( $body, $summary ) {
    $body = (string) $body;

    if ( strpos( $body, '[download_summary]' ) !== false ) {
        return str_replace( '[download_summary]', $summary, $body );
    }

    if ( strpos( $body, '==== 選択した資料 ====' ) !== false ) {
        return $body;
    }

    $trimmed = trim( $body );
    if ( '' === $trimmed ) {
        return $summary;
    }

    return $trimmed . "\n\n" . $summary;
}

// 抜粋の文字数
function custom_excerpt_length( $length ) {
    return 400;	//表示したい文字数
}	
add_filter( 'excerpt_length', 'custom_excerpt_length', 999 );

// ページネーション
function ts_render_pagination( $query = null ) {
    if ( $query === null ) {
        global $wp_query;
        $query = $wp_query;
    }
    if ( empty( $query ) || $query->max_num_pages <= 1 ) return;

    $current = max( 1, (int) get_query_var('paged') );

    // 共通レンダラー（mid/endのみ可変）
    $render_variant = function( $mid_size, $end_size, $variant_class ) use ( $query, $current ) {

        // 数字リンクのみ（前後リンクは自前で出す）
        $links = paginate_links([
            'total'               => (int) $query->max_num_pages,
            'current'             => $current,
            'mid_size'            => $mid_size, // 可変
            'end_size'            => $end_size, // 可変
            'type'                => 'array',
            'prev_next'           => false,
            'before_page_number'  => '<span class="pagination__text">',
            'after_page_number'   => '</span>',
            'base'                => str_replace( 999999999, '%#%', esc_url( get_pagenum_link( 999999999 ) ) ),
            'format'              => 'page/%#%/',
        ]);

        echo '<div class="pagination ' . esc_attr( $variant_class ) . '" role="navigation" aria-label="Pagination">';

        // ← 前（矢印のみ）
        echo '<div class="pagination__arrow-wrapper">';
        if ( $current > 1 ) {
            $prev_url = get_pagenum_link( $current - 1 );
            echo '<a class="pagination__link pagination__link--prev" href="' . esc_url( $prev_url ) . '" rel="prev" aria-label="前のページ">
                    <span class="pagination__icon" aria-hidden="true">
                      <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M30.0831 20.5833H10.6873L18.9998 28.8958L17.9548 30.0833L7.66309 19.7917L17.9548 9.5L18.9998 10.6875L10.6873 19H30.0831V20.5833Z" fill="black"/>
                      </svg>
                    </span>
                  </a>';
        }
        echo '</div>';

        // 数字リンク + 省略（…）
        if ( $links ) {
            echo '<div class="pagination__num-wrapper">';

            foreach ( $links as $link ) {
                $is_current = (strpos( $link, 'current' ) !== false);
                $is_dots    = (strpos( $link, 'dots' ) !== false);

                // 省略「…」
                if ( $is_dots ) {
                    echo '<span class="pagination__ellipsis" aria-hidden="true">…</span>';
                    continue;
                }

                // aタグ（通常のページ番号）
                if ( preg_match( '/href=["\']([^"\']+)["\']/', $link, $m ) ) {
                    echo '<a class="pagination__link" href="' . esc_url( $m[1] ) . '">'
                          . wp_kses_post( strip_tags( $link, '<span>' ) ) .
                         '</a>';
                    continue;
                }

                // 現在ページ（span）
                if ( $is_current ) {
                    echo '<span class="pagination__link is-current">'
                          . wp_kses_post( strip_tags( $link, '<span>' ) ) .
                         '</span>';
                }
            }

            echo '</div>';
        }

        // → 次（矢印のみ）
        echo '<div class="pagination__arrow-wrapper">';
        if ( $current < (int) $query->max_num_pages ) {
            $next_url = get_pagenum_link( $current + 1 );
            echo '<a class="pagination__link pagination__link--next" href="' . esc_url( $next_url ) . '" rel="next" aria-label="次のページ">
                    <span class="pagination__icon" aria-hidden="true">
                      <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.33301 19H25.7288L17.4163 10.6875L18.4613 9.5L28.753 19.7917L18.4613 30.0833L17.4163 28.8958L25.7288 20.5833H6.33301V19Z" fill="black"/>
                      </svg>
                    </span>
                  </a>';
        }
        echo '</div>';

        echo '</div>';
    };

    // デスクトップ用（表示数多め）
    $render_variant( 2, 1, 'pagination--pc' );

    // スマホ用（表示数少なめ）
    $render_variant( 1, 1, 'pagination--sp' );
}

// functions.php
add_filter( 'register_block_type_args', function( $args, $name ) {
    // 対象ブロック（必要に応じて増やす）
    $targets = [
        'core/heading',
        // 'core/post-title',    // 投稿タイトルブロックもH1禁止にしたいなら有効化
        // 'core/query-title',
        // 'core/comments-title',
        // 'core/site-title',
    ];
    if ( in_array( $name, $targets, true ) ) {
        // H2〜H6のみ選択可能に（UIからH1が消える）
        $args['attributes']['levelOptions'] = [
            'type'    => 'array',
            'default' => [ 2, 3 ],
        ];
    }
    return $args;
}, 10, 2 );

/**
 * カスタム投稿タイプの追加
 */
function create_post_type() {
    // 製品情報
    register_post_type(
        'product',
        array(
            'labels' => array(
                'name'          => '製品情報',
                'singular_name' => '製品',
                'add_new_item'  => '新規製品を追加',
                'edit_item'     => '製品を編集',
            ),
            'public'        => true,
            'has_archive'   => 'products',
            'menu_position' => 5,
            'show_in_rest'  => true,
            'supports'      => array('title', 'editor', 'thumbnail', 'revisions'),
            'rewrite'       => array('slug' => 'products'),
            'menu_icon'     => 'dashicons-cart',
        )
    );

    // ストーリー
    register_post_type(
        'story',
        array(
            'labels' => array(
                'name'          => 'ストーリー',
                'singular_name' => 'ストーリー',
                'add_new_item'  => '新規ストーリーを追加',
                'edit_item'     => 'ストーリーを編集',
            ),
            'public'        => true,
            'has_archive'   => 'story',
            'menu_position' => 5,
            'show_in_rest'  => true,
            'supports'      => array('title', 'editor', 'thumbnail', 'revisions'),
            'rewrite'       => array('slug' => 'story'),
            'menu_icon'     => 'dashicons-book-alt',
        )
    );

    // お客様の声
    register_post_type(
        'voice',
        array(
            'labels' => array(
                'name'          => 'お客様の声',
                'singular_name' => 'お客様の声',
                'add_new_item'  => '新規お客様の声を追加',
                'edit_item'     => 'お客様の声を編集',
            ),
            'public'        => true,
            'has_archive'   => 'voices',
            'menu_position' => 5,
            'show_in_rest'  => true,
            'supports'      => array('title', 'editor', 'thumbnail', 'revisions', 'page-attributes'),
            'rewrite'       => array('slug' => 'voices'),
            'menu_icon'     => 'dashicons-testimonial',
        )
    );

    // 採用情報
    register_post_type(
        'career',
        array(
            'labels' => array(
                'name'          => '採用情報',
                'singular_name' => '採用情報',
                'add_new_item'  => '新規採用情報を追加',
                'edit_item'     => '採用情報を編集',
            ),
            'public'        => true,
            'has_archive'   => 'careers',
            'menu_position' => 5,
            'show_in_rest'  => true,
            'supports'      => array('title', 'editor', 'thumbnail', 'revisions'),
            'rewrite'       => array('slug' => 'careers'),
            'menu_icon'     => 'dashicons-businessperson',
        )
    );

    // インタビュー
    register_post_type(
        'interview',
        array(
            'labels' => array(
                'name'          => 'インタビュー',
                'singular_name' => 'インタビュー',
                'add_new_item'  => '新規インタビューを追加',
                'edit_item'     => 'インタビューを編集',
            ),
            'public'        => true,
            'has_archive'   => 'careers/interview',
            'menu_position' => 5,
            'show_in_rest'  => true,
            'supports'      => array('title', 'editor', 'thumbnail', 'revisions'),
            'rewrite'       => array(
                'slug'       => 'careers/interview',
                'with_front' => false,
            ),
            'menu_icon'     => 'dashicons-format-chat',
        )
    );

    // グローバルネットワーク
    register_post_type(
        'globalnetwork',
        array(
            'labels' => array(
                'name'          => 'グローバルネットワーク',
                'singular_name' => 'グローバルネットワーク',
                'add_new_item'  => '新規グローバルネットワークを追加',
                'edit_item'     => 'グローバルネットワークを編集',
            ),
            'public'        => true,
            'has_archive'   => 'global-network',
            'menu_position' => 5,
            'show_in_rest'  => true,
            'supports'      => array('title', 'editor', 'thumbnail', 'revisions'),
            'rewrite'       => array('slug' => 'global-network'),
            'menu_icon'     => 'dashicons-admin-site-alt3',
        )
    );
}
add_action('init', 'create_post_type');

/**
 * 製品情報タクソノミー設定 (固定値)
 */
function muashi_get_product_taxonomy_base_config() {
    return array(
        'product_application' => array(
            'label'        => '用途でえらぶ',
            'plural'       => '用途でえらぶ',
            'slug'         => 'products/application',
            'hierarchical' => true,
        ),
        'product_material'   => array(
            'label'        => '基材でえらぶ',
            'plural'       => '基材でえらぶ',
            'slug'         => 'products/material',
            'hierarchical' => true,
        ),
        'product_design'     => array(
            'label'        => '意匠性でえらぶ',
            'plural'       => '意匠性でえらぶ',
            'slug'         => 'products/design',
            'hierarchical' => true,
        ),
        'product_function'   => array(
            'label'        => '機能でえらぶ',
            'plural'       => '機能でえらぶ',
            'slug'         => 'products/function',
            'hierarchical' => true,
        ),
        'product_environment'=> array(
            'label'        => '環境キーワードでえらぶ',
            'plural'       => '環境キーワードでえらぶ',
            'slug'         => 'products/environment',
            'hierarchical' => true,
        ),
    );
}

/**
 * 製品情報タクソノミー設定を取得
 */
function muashi_get_product_taxonomy_config() {
    $config = muashi_get_product_taxonomy_base_config();
    $stored_order = get_option('muashi_product_taxonomy_order', array());

    if (is_array($stored_order) && ! empty($stored_order)) {
        $ordered = array();

        foreach ($stored_order as $taxonomy) {
            $taxonomy = sanitize_key($taxonomy);

            if (isset($config[$taxonomy])) {
                $ordered[$taxonomy] = $config[$taxonomy];
                unset($config[$taxonomy]);
            }
        }

        if (! empty($ordered)) {
            $config = $ordered + $config;
        }
    }

    return $config;
}

if (! defined('MUASHI_TERM_ORDER_META_KEY')) {
    define('MUASHI_TERM_ORDER_META_KEY', 'muashi_term_order');
}

function muashi_get_sorted_product_terms($taxonomy, $parent_id = 0) {
    if (! taxonomy_exists($taxonomy)) {
        return array();
    }

    $terms = get_terms(
        array(
            'taxonomy'   => $taxonomy,
            'hide_empty' => false,
            'parent'     => (int) $parent_id,
        )
    );

    if (is_wp_error($terms) || empty($terms)) {
        return array();
    }

    foreach ($terms as $term) {
        $order = get_term_meta($term->term_id, MUASHI_TERM_ORDER_META_KEY, true);
        $term->muashi_term_order = ('' === $order) ? PHP_INT_MAX : (int) $order;
    }

    usort(
        $terms,
        function ($a, $b) {
            if ($a->muashi_term_order === $b->muashi_term_order) {
                return strcasecmp($a->name, $b->name);
            }

            return ($a->muashi_term_order < $b->muashi_term_order) ? -1 : 1;
        }
    );

    return $terms;
}

function muashi_render_product_taxonomy_term_sortable_list($taxonomy, $parent_id = 0, $terms = null) {
    if (null === $terms) {
        $terms = muashi_get_sorted_product_terms($taxonomy, $parent_id);
    }

    if (empty($terms)) {
        return false;
    }

    echo '<ul class="muashi-term-sortable js-muashi-term-sortable" data-taxonomy="' . esc_attr($taxonomy) . '" data-parent="' . esc_attr((int) $parent_id) . '">';

    foreach ($terms as $term) {
        echo '<li class="muashi-term-sortable__item" data-term-id="' . esc_attr((int) $term->term_id) . '">';
        echo '<div class="muashi-term-sortable__label">' . esc_html($term->name) . '</div>';
        echo '<input type="hidden" name="muashi_product_term_order[' . esc_attr($taxonomy) . '][' . esc_attr((int) $parent_id) . '][]" value="' . esc_attr((int) $term->term_id) . '">';

        muashi_render_product_taxonomy_term_sortable_list($taxonomy, (int) $term->term_id);

        echo '</li>';
    }

    echo '</ul>';

    return true;
}

function muashi_get_sorted_product_terms_flat($taxonomy, $parent_id = 0) {
    $flat_terms = array();
    $terms      = muashi_get_sorted_product_terms($taxonomy, $parent_id);

    if (empty($terms)) {
        return $flat_terms;
    }

    foreach ($terms as $term) {
        $flat_terms[] = $term;
        $children     = muashi_get_sorted_product_terms_flat($taxonomy, (int) $term->term_id);

        if (! empty($children)) {
            $flat_terms = array_merge($flat_terms, $children);
        }
    }

    return $flat_terms;
}

function muashi_sanitize_product_taxonomy_order($input) {
    $sanitized = array();

    if (! is_array($input)) {
        return $sanitized;
    }

    $base_keys = array_keys(muashi_get_product_taxonomy_base_config());

    foreach ($input as $taxonomy) {
        $taxonomy = sanitize_key($taxonomy);

        if (in_array($taxonomy, $base_keys, true) && ! in_array($taxonomy, $sanitized, true)) {
            $sanitized[] = $taxonomy;
        }
    }

    return $sanitized;
}

function muashi_register_product_taxonomy_order_setting() {
    register_setting(
        'muashi_product_taxonomy_order_group',
        'muashi_product_taxonomy_order',
        array(
            'sanitize_callback' => 'muashi_sanitize_product_taxonomy_order',
            'default'           => array(),
        )
    );

    register_setting(
        'muashi_product_taxonomy_order_group',
        'muashi_product_term_order',
        array(
            'sanitize_callback' => 'muashi_sanitize_product_term_order',
            'default'           => array(),
        )
    );
}
add_action('admin_init', 'muashi_register_product_taxonomy_order_setting');

function muashi_sanitize_product_term_order($input) {
    $sanitized = array();

    if (! is_array($input)) {
        return $sanitized;
    }

    $base_config = muashi_get_product_taxonomy_base_config();

    foreach ($input as $taxonomy => $groups) {
        $taxonomy = sanitize_key($taxonomy);

        if (! isset($base_config[$taxonomy]) || ! taxonomy_exists($taxonomy)) {
            continue;
        }

        if (! is_array($groups)) {
            continue;
        }

        foreach ($groups as $parent_id => $term_ids) {
            $parent_id = (int) $parent_id;

            if (! is_array($term_ids)) {
                continue;
            }

            $sanitized[$taxonomy][$parent_id] = array();

            $order = 1;

            foreach ($term_ids as $term_id) {
                $term_id = (int) $term_id;

                if ($term_id <= 0) {
                    continue;
                }

                if (in_array($term_id, $sanitized[$taxonomy][$parent_id], true)) {
                    continue;
                }

                $term = get_term($term_id, $taxonomy);

                if (! $term || is_wp_error($term)) {
                    continue;
                }

                if ((int) $term->parent !== $parent_id) {
                    continue;
                }

                update_term_meta($term_id, MUASHI_TERM_ORDER_META_KEY, $order);
                clean_term_cache($term_id, $taxonomy);

                $sanitized[$taxonomy][$parent_id][] = $term_id;
                $order++;
            }
        }
    }

    return $sanitized;
}

function muashi_add_product_taxonomy_order_page() {
    add_theme_page(
        '製品カテゴリー並び順',
        '製品カテゴリー並び順',
        'manage_options',
        'muashi-product-taxonomy-order',
        'muashi_render_product_taxonomy_order_page'
    );
}
add_action('admin_menu', 'muashi_add_product_taxonomy_order_page');

function muashi_render_product_taxonomy_order_page() {
    if (! current_user_can('manage_options')) {
        return;
    }

    $base_config  = muashi_get_product_taxonomy_base_config();
    $stored_order = get_option('muashi_product_taxonomy_order', array());
    $taxonomies   = array();

    if (is_array($stored_order)) {
        foreach ($stored_order as $taxonomy) {
            if (isset($base_config[$taxonomy])) {
                $taxonomies[$taxonomy] = $base_config[$taxonomy];
                unset($base_config[$taxonomy]);
            }
        }
    }

    $taxonomies += $base_config;

    ?>
    <div class="wrap">
        <h1>製品カテゴリー並び順</h1>
        <p>「製品情報」ページのメニューに表示されるカテゴリーの並び順をドラッグ＆ドロップで変更できます。</p>
        <form method="post" action="options.php">
            <?php settings_fields('muashi_product_taxonomy_order_group'); ?>
            <ul id="muashi-product-taxonomy-sortable">
                <?php foreach ($taxonomies as $taxonomy => $settings) : ?>
                    <li class="muashi-product-taxonomy-sortable__item">
                        <span class="muashi-product-taxonomy-sortable__label"><?php echo esc_html($settings['label']); ?></span>
                        <input type="hidden" name="muashi_product_taxonomy_order[]" value="<?php echo esc_attr($taxonomy); ?>">
                    </li>
                <?php endforeach; ?>
            </ul>

            <hr class="muashi-settings-divider">

            <h2>カテゴリー内の項目の並び順</h2>
            <p>それぞれのカテゴリー内で表示される項目（ターム）の順番もドラッグ＆ドロップで変更できます。</p>

            <div class="muashi-term-sortable-sections">
                <?php foreach ($taxonomies as $taxonomy => $settings) : ?>
                    <div class="muashi-term-sortable-section">
                        <h3><?php echo esc_html($settings['label']); ?></h3>
                        <?php
                        $top_terms = muashi_get_sorted_product_terms($taxonomy, 0);

                        if (! muashi_render_product_taxonomy_term_sortable_list($taxonomy, 0, $top_terms)) {
                            echo '<p class="description">項目がまだ登録されていません。</p>';
                        }
                        ?>
                    </div>
                <?php endforeach; ?>
            </div>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

function muashi_admin_enqueue_product_taxonomy_order_assets($hook_suffix) {
    if ('appearance_page_muashi-product-taxonomy-order' !== $hook_suffix) {
        return;
    }

    wp_enqueue_script('jquery-ui-sortable');

    $script = 'jQuery(function($){
        var $taxonomyList = $("#muashi-product-taxonomy-sortable");
        if($taxonomyList.length){
            $taxonomyList.sortable({
                axis: "y",
                cursor: "move",
                opacity: 0.8,
                tolerance: "pointer"
            });
        }

        $(".js-muashi-term-sortable").each(function(){
            var $termList = $(this);
            $termList.sortable({
                axis: "y",
                cursor: "move",
                opacity: 0.8,
                tolerance: "pointer",
                placeholder: "muashi-term-sortable__placeholder"
            });
        });
    });';

    wp_add_inline_script('jquery-ui-sortable', $script);

    if (! wp_style_is('muashi-product-taxonomy-order', 'enqueued')) {
        wp_register_style('muashi-product-taxonomy-order', false);
        wp_enqueue_style('muashi-product-taxonomy-order');
    }

    $style = '#muashi-product-taxonomy-sortable { margin: 20px 0; max-width: 420px; }
#muashi-product-taxonomy-sortable .muashi-product-taxonomy-sortable__item { background: #fff; border: 1px solid #dcdcde; border-radius: 4px; padding: 12px 16px; margin-bottom: 8px; cursor: move; display: flex; align-items: center; }
#muashi-product-taxonomy-sortable .muashi-product-taxonomy-sortable__item:hover { border-color: #787c82; }
#muashi-product-taxonomy-sortable .muashi-product-taxonomy-sortable__label { font-weight: 600; }
.muashi-settings-divider { margin: 40px 0; }
.muashi-term-sortable-section { margin-bottom: 32px; }
.muashi-term-sortable { margin: 16px 0 0; padding-left: 0; list-style: none; max-width: 420px; }
.muashi-term-sortable .muashi-term-sortable { margin-left: 24px; }
.muashi-term-sortable__item { background: #fff; border: 1px solid #dcdcde; border-radius: 4px; padding: 10px 14px; margin-bottom: 6px; cursor: move; }
.muashi-term-sortable__item:hover { border-color: #787c82; }
.muashi-term-sortable__label { font-weight: 500; }
.muashi-term-sortable__placeholder { border: 2px dashed #8c8f94; height: 40px; margin-bottom: 6px; }';

    wp_add_inline_style('muashi-product-taxonomy-order', $style);
}
add_action('admin_enqueue_scripts', 'muashi_admin_enqueue_product_taxonomy_order_assets');

/**
 * 製品情報タクソノミーの登録
 */
function muashi_register_product_taxonomies() {
    $taxonomies = muashi_get_product_taxonomy_config();

    foreach ( $taxonomies as $taxonomy => $settings ) {
        register_taxonomy(
            $taxonomy,
            array( 'product' ),
            array(
                'hierarchical'      => $settings['hierarchical'],
                'show_ui'           => true,
                'show_admin_column' => true,
                'show_in_rest'      => true,
                'rewrite'           => array(
                    'slug'       => $settings['slug'],
                    'with_front' => false,
                    'hierarchical' => true,
                ),
                'labels'            => array(
                    'name'          => $settings['plural'],
                    'singular_name' => $settings['label'],
                    'search_items'  => $settings['label'] . 'を検索',
                    'all_items'     => $settings['plural'],
                    'parent_item'   => '親' . $settings['label'],
                    'parent_item_colon' => '親' . $settings['label'] . '：',
                    'edit_item'     => $settings['label'] . 'を編集',
                    'update_item'   => $settings['label'] . 'を更新',
                    'add_new_item'  => '新規' . $settings['label'] . 'を追加',
                    'new_item_name' => '新規' . $settings['label'],
                    'menu_name'     => $settings['plural'],
                ),
            )
        );
    }
}
add_action( 'init', 'muashi_register_product_taxonomies', 11 );

/**
 * 製品タクソノミー用の独自リライトルール
 */
add_action( 'init', function() {
    $taxonomies = muashi_get_product_taxonomy_config();
    foreach ( $taxonomies as $taxonomy => $settings ) {
        $slug = trim( $settings['slug'], '/' );
        if ( $slug === '' ) {
            continue;
        }

        $escaped_slug = preg_quote( $slug, '/' );
        $term_pattern = '(.+?)';

        add_rewrite_rule( '^' . $escaped_slug . '/' . $term_pattern . '/page/([0-9]+)/?$', 'index.php?' . $taxonomy . '=$matches[1]&paged=$matches[2]', 'top' );
        add_rewrite_rule( '^' . $escaped_slug . '/' . $term_pattern . '/?$', 'index.php?' . $taxonomy . '=$matches[1]', 'top' );
    }
}, 12 );

/**
 * インタビュー用のリライトルールを追加
 */
function register_interview_rewrite_rules() {
    add_rewrite_rule('^careers/interview/([^/]+)/?$', 'index.php?post_type=interview&name=$matches[1]', 'top');
    add_rewrite_rule('^careers/interview/?$', 'index.php?post_type=interview', 'top');
}
add_action('init', 'register_interview_rewrite_rules', 11);

/**
 * インタビューのパーマリンクを採用配下に固定
 */
add_filter( 'post_type_link', function( $post_link, $post ) {
    if ( 'interview' === $post->post_type ) {
        return home_url( user_trailingslashit( 'careers/interview/' . $post->post_name ) );
    }
    return $post_link;
}, 10, 2 );

/**
 * 製品タクソノミーのテンプレートを共通化
 */
add_filter( 'taxonomy_template', function( $template ) {
    if ( is_tax( array( 'product_application', 'product_material', 'product_design', 'product_function', 'product_environment' ) ) ) {
        $custom_template = locate_template( 'taxonomy-product-term.php' );
        if ( $custom_template ) {
            return $custom_template;
        }
    }
    return $template;
} );

/**
 * 製品タクソノミーのアーカイブで製品投稿を取得
 */
add_action( 'pre_get_posts', function( $query ) {
    if ( is_admin() || ! $query->is_main_query() ) {
        return;
    }

    if ( $query->is_tax( array( 'product_application', 'product_material', 'product_design', 'product_function', 'product_environment' ) ) ) {
        $query->set( 'post_type', array( 'product' ) );
        $query->set( 'posts_per_page', 12 );
        $query->set( 'orderby', 'date' );
        $query->set( 'order', 'DESC' );
    }
} );

/**
 * お客様の声アーカイブをmenu_order順で並び替え
 */
add_action( 'pre_get_posts', function( $query ) {
    if ( is_admin() || ! $query->is_main_query() ) {
        return;
    }

    if ( $query->is_post_type_archive( 'voice' ) ) {
        $query->set( 'orderby', 'menu_order' );
        $query->set( 'order', 'ASC' );
    }
} );

/**
 * 共通KV画像の出力ヘルパー
 */
function muashi_render_kv_picture( $args = array() ) {
    $args = wp_parse_args(
        $args,
        array(
            'post_id'        => get_queried_object_id(),
            'class'          => 'page__kv-pic',
            'fallback_pc'    => '',
            'fallback_sp'    => '',
            'media_query'    => '(min-width: 768px)',
            'include_source' => false,
        )
    );

    if ( $args['fallback_pc'] === '' ) {
        return;
    }

    $post_id        = $args['post_id'] ? (int) $args['post_id'] : 0;
    $include_source = ! empty( $args['include_source'] );
    $fallback_pc    = $args['fallback_pc'];
    $fallback_sp    = $args['fallback_sp'] !== '' ? $args['fallback_sp'] : $fallback_pc;
    $media_query    = $include_source ? $args['media_query'] : '';

    if ( $post_id && has_post_thumbnail( $post_id ) ) {
        $thumbnail_id     = get_post_thumbnail_id( $post_id );
        $thumbnail_pc     = wp_get_attachment_image_url( $thumbnail_id, 'full' );
        $thumbnail_srcset = wp_get_attachment_image_srcset( $thumbnail_id, 'full' );
        $thumbnail_sp     = wp_get_attachment_image_url( $thumbnail_id, 'medium_large' );
        $thumbnail_alt    = get_post_meta( $thumbnail_id, '_wp_attachment_image_alt', true );

        if ( $thumbnail_alt === '' ) {
            $thumbnail_alt = get_the_title( $post_id );
        }

        echo '<picture class="' . esc_attr( $args['class'] ) . '">';
        if ( $include_source && $media_query ) {
            $source_srcset = $thumbnail_srcset ? $thumbnail_srcset : $thumbnail_pc;
            echo '<source srcset="' . esc_attr( $source_srcset ) . '" media="' . esc_attr( $media_query ) . '">';
        }
        $img_src = $thumbnail_sp ? $thumbnail_sp : $thumbnail_pc;
        echo '<img src="' . esc_url( $img_src ) . '" alt="' . esc_attr( $thumbnail_alt ) . '">';
        echo '</picture>';
        return;
    }

    echo '<picture class="' . esc_attr( $args['class'] ) . '">';
    if ( $include_source && $media_query ) {
        echo '<source srcset="' . esc_url( $fallback_pc ) . '" media="' . esc_attr( $media_query ) . '">';
        echo '<img src="' . esc_url( $fallback_sp ) . '" alt="">';
    } else {
        echo '<img src="' . esc_url( $fallback_pc ) . '" alt="">';
    }
    echo '</picture>';
}

/**
 * CF7: フロントのフォーム出力に wpautop を適用しない（メール側は既定のまま）
 * CF7 5.8.6+ で導入された $options['for'] を利用
 */
add_filter( 'wpcf7_autop_or_not', function( $use_autop, $options ) {
    if ( isset( $options['for'] ) && $options['for'] === 'form' ) {
        return false; // フロントのフォームに <p><br> を入れない
    }
    return $use_autop; // メール側は従来の設定を維持
}, 10, 2 );

/**
 * ページの見出しにアンカーIDを自動付与
 */
add_filter( 'the_content', function( $content ) {
    $page_anchors = array(
        'about-us' => array(
            '武蔵塗料グループについて' => 'about-01',
            '経営理念' => 'about-02',
            '色と機能で世界を豊かに' => 'about-03',
            'コーポレートアイデンティティ' => 'about-04',
        ),
        'company' => array(
            '会社概要' => '01',
            '代表メッセージ' => '02',
        ),
    );

    $anchors = null;
    foreach ( $page_anchors as $page_slug => $anchor_map ) {
        if ( is_page( $page_slug ) ) {
            $anchors = $anchor_map;
            break;
        }
    }

    if ( ! $anchors ) {
        return $content;
    }

    foreach ( $anchors as $text => $id ) {
        $content = preg_replace(
            '/(<h2[^>]*)(>[\s]*' . preg_quote( $text, '/' ) . ')/u',
            '$1 id="' . $id . '"$2',
            $content
        );
    }
    return $content;
} );

/**
 * 蛇腹（もっと見る）スタイルを複数のブロックに追加
 */
add_action( 'init', function() {
    $expandable_style = array(
        'name'  => 'expandable',
        'label' => '蛇腹（もっと見る）',
    );

    // テーブルブロック
    register_block_style( 'core/table', $expandable_style );

    // グループブロック（人権方針など複数ブロックをまとめる場合）
    register_block_style( 'core/group', $expandable_style );

    // 画像ビューワースタイル
    $image_viewer_style = array(
        'name'  => 'image-viewer',
        'label' => '画像ビューワー',
    );

    // 画像ブロック
    register_block_style( 'core/image', $image_viewer_style );
} );

/**
 * ダウンロードボタン ブロックパターン
 */
add_action( 'init', function() {
    register_block_pattern(
        'muashi/download-button',
        array(
            'title'       => 'ダウンロードボタン',
            'description' => 'ダウンロードアイコン付きのボタン',
            'categories'  => array( 'buttons' ),
            'content'     => '<!-- wp:group {"layout":{"type":"constrained","justifyContent":"left"}} -->
<div class="wp-block-group"><!-- wp:button {"className":"is-style-download"} -->
<div class="wp-block-button is-style-download"><a class="wp-block-button__link wp-element-button" href="#">ダウンロード</a></div>
<!-- /wp:button -->

<!-- wp:paragraph {"fontSize":"small"} -->
<p class="has-small-font-size">発行：2024年6月　報告対象期間：2023年1月〜12月</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->',
        )
    );
} );

/**
 * ダウンロードボタン用エディタCSS
 */
add_action( 'enqueue_block_editor_assets', function() {
    wp_enqueue_style(
        'muashi-editor-download-button',
        get_template_directory_uri() . '/assets/css/editor-download-button.css',
        array(),
        filemtime( get_template_directory() . '/assets/css/editor-download-button.css' )
    );
} );

/**
 * 蛇腹スタイル適用時に「もっと見る」ボタンを自動追加（共通処理）
 */
function muashi_add_expandable_button( $block_content, $closing_tag ) {
    $button = '<button class="expandable-toggle" type="button"><span></span></button>';

    // 閉じタグの後ろにボタンを挿入
    $block_content = preg_replace(
        '/(' . preg_quote( $closing_tag, '/' ) . ')$/i',
        '$1' . $button,
        $block_content
    );

    // ラッパーで囲む
    return '<div class="expandable-wrapper">' . $block_content . '</div>';
}

/**
 * テーブルブロック用
 */
add_filter( 'render_block_core/table', function( $block_content, $block ) {
    if ( strpos( $block_content, 'is-style-expandable' ) === false ) {
        return $block_content;
    }
    return muashi_add_expandable_button( $block_content, '</figure>' );
}, 10, 2 );

/**
 * グループブロック用
 */
add_filter( 'render_block_core/group', function( $block_content, $block ) {
    if ( strpos( $block_content, 'is-style-expandable' ) === false ) {
        return $block_content;
    }
    return muashi_add_expandable_button( $block_content, '</div>' );
}, 10, 2 );

/**
 * ダイナミックブロック: 国内拠点情報
 * PHPで動的にレンダリングするため、コード変更が即座に反映される
 */
add_action( 'init', function() {
    register_block_type( 'muashi/domestic-locations', array(
        'api_version'     => 2,
        'title'           => '国内拠点情報',
        'description'     => '日本国内の拠点一覧（会社概要ページ用）',
        'category'        => 'widgets',
        'icon'            => 'location',
        'render_callback' => 'muashi_render_domestic_locations_block',
    ) );
} );

/**
 * 国内拠点情報ブロックのレンダリング関数
 */
function muashi_render_domestic_locations_block( $attributes, $content ) {
    ob_start();
    include get_template_directory() . '/blocks/domestic-locations.php';
    return ob_get_clean();
}
