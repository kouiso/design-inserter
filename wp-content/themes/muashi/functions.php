<?php

/**
 * 【一時コード】不要メニュー削除 - 管理画面アクセス時に1回だけ実行
 * 実行確認後、このブロックは削除してOK
 */
add_action( 'admin_init', function() {
    if ( get_option( 'muashi_menus_cleaned_v4' ) ) {
        return;
    }

    // 削除対象メニュー（重複・未使用）
    $menus_to_delete = array(
        'サステナビリティサイドバー',
        'ニュース・メディアサイドバー',
        'よくある質問サイドバー',
        '私たちについてサイドバー',
        'インタビュー用サイドバー',
        '会社概要用サイドバー',
        'ニュース・ピックアップ用サイドバー',
    );

    foreach ( $menus_to_delete as $menu_name ) {
        $menu = wp_get_nav_menu_object( $menu_name );
        if ( $menu ) {
            wp_delete_nav_menu( $menu->term_id );
            error_log( "Deleted menu: $menu_name" );
        }
    }

    // sidebar_interview, sidebar_company のロケーション割り当てを解除
    $locations = get_theme_mod( 'nav_menu_locations', array() );
    unset( $locations['sidebar_interview'] );
    unset( $locations['sidebar_company'] );
    set_theme_mod( 'nav_menu_locations', $locations );

    update_option( 'muashi_menus_cleaned_v4', true );
    error_log( 'Muashi: Unused menus cleaned up (v4)' );
});

/**
 * 変数ファイルの読み込み
 */
require_once(get_theme_file_path('/inc/variable.php'));
require_once(get_theme_file_path('/inc/post-types.php'));
require_once(get_theme_file_path('/inc/setup.php'));
require_once(get_theme_file_path('/inc/hierarchy-chart-pattern.php'));

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
 * インタビュー投稿タイプ用メタボックス（会社名・部署役職・氏名）
 */
add_action( 'add_meta_boxes', 'add_interview_meta_box' );
add_action( 'save_post_interview', 'save_interview_meta' );

function add_interview_meta_box() {
    add_meta_box(
        'interview_meta_box',
        'インタビュー情報',
        'render_interview_meta_box',
        'interview',
        'normal',
        'high'
    );
}

function render_interview_meta_box( $post ) {
    wp_nonce_field( 'interview_meta_nonce_action', 'interview_meta_nonce' );

    $company     = get_post_meta( $post->ID, 'interview_company', true );
    $position    = get_post_meta( $post->ID, 'interview_position', true );
    $person_name = get_post_meta( $post->ID, 'interview_person_name', true );
    ?>
    <p>
        <label for="interview_company">会社名</label><br>
        <input type="text" id="interview_company" name="interview_company"
               value="<?php echo esc_attr( $company ); ?>" style="width: 100%;">
    </p>
    <p>
        <label for="interview_position">部署・役職</label><br>
        <input type="text" id="interview_position" name="interview_position"
               value="<?php echo esc_attr( $position ); ?>" style="width: 100%;">
    </p>
    <p>
        <label for="interview_person_name">氏名</label><br>
        <input type="text" id="interview_person_name" name="interview_person_name"
               value="<?php echo esc_attr( $person_name ); ?>" style="width: 100%;">
    </p>
    <?php
}

function save_interview_meta( $post_id ) {
    if ( ! isset( $_POST['interview_meta_nonce'] ) ||
         ! wp_verify_nonce( $_POST['interview_meta_nonce'], 'interview_meta_nonce_action' ) ) {
        return;
    }

    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
        return;
    }

    if ( ! current_user_can( 'edit_post', $post_id ) ) {
        return;
    }

    $fields = array( 'interview_company', 'interview_position', 'interview_person_name' );

    foreach ( $fields as $field ) {
        if ( isset( $_POST[ $field ] ) ) {
            update_post_meta( $post_id, $field, sanitize_text_field( $_POST[ $field ] ) );
        }
    }
}

/**
 * 製品資料PDFメタボックス関連の処理
 */
require_once(get_theme_file_path('/inc/product-pdf-meta.php'));
require_once(get_theme_file_path('/inc/product-custom-url-meta.php'));
require_once(get_theme_file_path('/inc/product-data.php'));



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
function ts_render_pagination( $query = null, $base_url_override = null, $current_page_override = null ) {
    if ( $query === null ) {
        global $wp_query;
        $query = $wp_query;
    }
    if ( empty( $query ) || $query->max_num_pages <= 1 ) return;

    // ベースURLと現在ページを決定
    $is_static_page = is_page() && ! is_front_page();
    
    // 引数で指定されていればそれを使用、なければ従来の方法で取得
    if ( $current_page_override !== null ) {
        $current = max( 1, (int) $current_page_override );
    } else {
        $current = max( 1, (int) get_query_var( 'paged' ) );
    }
    
    // ベースURLが指定されていればそれを使用
    $custom_base_url = $base_url_override ? trailingslashit( $base_url_override ) : null;

    // ページURL生成ヘルパー
    $get_page_url = function( $page_num ) use ( $is_static_page, $custom_base_url ) {
        // カスタムベースURLが指定されていればそれを使用
        if ( $custom_base_url ) {
            if ( $page_num <= 1 ) {
                return $custom_base_url;
            }
            return $custom_base_url . 'page/' . $page_num . '/';
        }
        
        if ( $is_static_page ) {
            // get_page_uri() で確実に基本パスを取得（ページ番号を含まない）
            $page_id = get_queried_object_id();
            $page_uri = get_page_uri( $page_id );
            $base_permalink = home_url( '/' . $page_uri . '/' );
            if ( $page_num <= 1 ) {
                return $base_permalink;
            }
            // WordPress標準の /page/N/ 形式
            return $base_permalink . 'page/' . $page_num . '/';
        }
        return get_pagenum_link( $page_num );
    };

    // 共通レンダラー（mid/endのみ可変）
    $render_variant = function( $mid_size, $end_size, $variant_class ) use ( $query, $current, $is_static_page, $get_page_url, $custom_base_url ) {

        // paginate_links用のベースとフォーマット
        if ( $custom_base_url ) {
            // カスタムベースURLが指定されている場合
            $base_url = $custom_base_url . '%_%';
            $format = 'page/%#%/';
        } elseif ( $is_static_page ) {
            // 固定ページ: WordPress標準の /page/N/ 形式
            $page_id = get_queried_object_id();
            $page_uri = get_page_uri( $page_id );
            $base_url = home_url( '/' . $page_uri . '/%_%' );
            $format = 'page/%#%/';
        } else {
            // アーカイブ: 標準の方法
            $big = 999999999;
            $base_url = str_replace( $big, '%#%', esc_url( get_pagenum_link( $big ) ) );
            $format = '';
        }

        // 数字リンクのみ（前後リンクは自前で出す）
        $paginate_args = array(
            'total'               => (int) $query->max_num_pages,
            'current'             => $current,
            'mid_size'            => $mid_size,
            'end_size'            => $end_size,
            'type'                => 'array',
            'prev_next'           => false,
            'before_page_number'  => '<span class="pagination__text">',
            'after_page_number'   => '</span>',
            'base'                => $base_url,
            'format'              => $format,
        );
        $links = paginate_links( $paginate_args );

        echo '<div class="pagination ' . esc_attr( $variant_class ) . '" role="navigation" aria-label="Pagination">';

        // ← 前（矢印のみ）
        echo '<div class="pagination__arrow-wrapper">';
        if ( $current > 1 ) {
            $prev_url = $get_page_url( $current - 1 );
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
            $next_url = $get_page_url( $current + 1 );
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
            'has_archive'   => false,
            'menu_position' => 5,
            'show_in_rest'  => true,
            'supports'      => array('title', 'editor', 'thumbnail', 'revisions', 'page-attributes'),
            'rewrite'       => array(
                'slug'       => 'product',
                'with_front' => false,
            ),
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
            'has_archive'   => false,
            'menu_position' => 5,
            'show_in_rest'  => true,
            'supports'      => array('title', 'editor', 'thumbnail', 'revisions'),
            'rewrite'       => array(
                'slug'       => 'story',
                'with_front' => false,
            ),
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
            'has_archive'   => false,
            'menu_position' => 5,
            'show_in_rest'  => true,
            'supports'      => array('title', 'editor', 'thumbnail', 'revisions', 'page-attributes'),
            'rewrite'       => array(
                'slug'       => 'voice',
                'with_front' => false,
            ),
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
            'has_archive'   => false,
            'menu_position' => 5,
            'show_in_rest'  => true,
            'supports'      => array('title', 'editor', 'thumbnail', 'revisions', 'page-attributes'),
            'rewrite'       => array(
                'slug'       => 'career',
                'with_front' => false,
            ),
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
            'has_archive'   => false,
            'menu_position' => 5,
            'show_in_rest'  => true,
            'supports'      => array('title', 'editor', 'thumbnail', 'revisions', 'page-attributes'),
            'rewrite'       => array(
                'slug'       => 'career/interview',
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
            'has_archive'   => false,
            'menu_position' => 5,
            'show_in_rest'  => true,
            'supports'      => array('title', 'editor', 'thumbnail', 'revisions', 'page-attributes'),
            'rewrite'       => array(
                'slug'       => 'global-network',
                'with_front' => false,
            ),
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
            'slug'         => 'product/application',
            'hierarchical' => true,
        ),
        'product_material'   => array(
            'label'        => '基材でえらぶ',
            'plural'       => '基材でえらぶ',
            'slug'         => 'product/material',
            'hierarchical' => true,
        ),
        'product_design'     => array(
            'label'        => '意匠性でえらぶ',
            'plural'       => '意匠性でえらぶ',
            'slug'         => 'product/design',
            'hierarchical' => true,
        ),
        'product_function'   => array(
            'label'        => '機能でえらぶ',
            'plural'       => '機能でえらぶ',
            'slug'         => 'product/function',
            'hierarchical' => true,
        ),
        'product_environment'=> array(
            'label'        => '環境キーワードでえらぶ',
            'plural'       => '環境キーワードでえらぶ',
            'slug'         => 'product/environment',
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
 * 個別投稿のURLを career/interview/[slug] 形式にするためのカスタムルール
 * 数字のみのスラッグは除外（ページネーションと区別するため）
 */
function register_interview_rewrite_rules() {
    // インタビュー投稿の個別ページ（career/interview/[slug]の形式）
    // 数字のみのスラッグを除外するため、少なくとも1つの非数字文字を含むスラッグのみマッチ
    add_rewrite_rule('^career/interview/([^/]*[^0-9/]+[^/]*)/?$', 'index.php?post_type=interview&name=$matches[1]', 'top');
}
add_action('init', 'register_interview_rewrite_rules', 11);

/**
 * インタビューのパーマリンクを採用配下に固定
 */
add_filter( 'post_type_link', function( $post_link, $post ) {
    if ( 'interview' === $post->post_type ) {
        return home_url( user_trailingslashit( 'career/interview/' . $post->post_name ) );
    }
    return $post_link;
}, 10, 2 );

/**
 * 固定ページのページネーション用リライトルール
 * WordPress標準の /pagename/page/N/ 形式のURLを認識させる
 * 
 * 注意: 新しいルールを追加した場合はパーマリンク設定を再保存するか、
 * flush_rewrite_rules() を実行する必要があります
 */
function register_page_pagination_rewrite_rules() {
    // career/interview 固定ページ（interview投稿タイプと競合するため明示的に登録）
    add_rewrite_rule(
        '^career/interview/?$',
        'index.php?pagename=career/interview',
        'top'
    );

    // career/interview ページのページネーション
    add_rewrite_rule(
        '^career/interview/page/([0-9]+)/?$',
        'index.php?pagename=career/interview&paged=$matches[1]',
        'top'
    );

    // 全ての公開固定ページを取得してリライトルールを自動生成
    $pages = get_pages( array(
        'post_status' => 'publish',
    ) );

    foreach ( $pages as $page ) {
        $page_path = get_page_uri( $page->ID );
        
        // career/interview は上で既に登録済みなのでスキップ
        if ( $page_path === 'career/interview' ) {
            continue;
        }
        
        // 親子ページ対応（例: career/interview）
        add_rewrite_rule(
            '^' . preg_quote( $page_path, '/' ) . '/page/([0-9]+)/?$',
            'index.php?pagename=' . $page_path . '&paged=$matches[1]',
            'top'
        );
    }

    // 製品ページのタブ切り替え用URL（/product/design/ など）
    // /product/ ページを表示し、タブ状態をクエリ変数で渡す
    $product_taxonomy_slugs = array(
        'application',
        'material',
        'design',
        'function',
        'environment',
    );

    foreach ( $product_taxonomy_slugs as $slug ) {
        // /product/design/ → /product/ ページを表示（タブ状態を渡す）
        add_rewrite_rule(
            '^product/' . $slug . '/?$',
            'index.php?pagename=product&product_tab=' . $slug,
            'top'
        );
    }
}
add_action( 'init', 'register_page_pagination_rewrite_rules', 12 );

/**
 * カスタムクエリ変数を登録
 */
add_filter( 'query_vars', function( $vars ) {
    $vars[] = 'product_tab';
    return $vars;
});

/**
 * 固定ページでも paged クエリ変数を保持する
 */
add_action( 'pre_get_posts', function( $query ) {
    if ( $query->is_main_query() && ! is_admin() && $query->is_page() ) {
        // リライトルールで設定した paged を保持
        if ( get_query_var( 'paged' ) ) {
            $query->set( 'paged', get_query_var( 'paged' ) );
        }
    }
});

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
 * カスタム投稿タイプアーカイブの表示件数・ソート順を設定
 */
add_action( 'pre_get_posts', function( $query ) {
    if ( is_admin() || ! $query->is_main_query() ) {
        return;
    }

    // story アーカイブ: 12件/ページ, date DESC
    if ( $query->is_post_type_archive( 'story' ) ) {
        $query->set( 'posts_per_page', 12 );
        $query->set( 'orderby', 'date' );
        $query->set( 'order', 'DESC' );
    }

    // voice アーカイブ: 12件/ページ, menu_order ASC
    if ( $query->is_post_type_archive( 'voice' ) ) {
        $query->set( 'posts_per_page', 12 );
        $query->set( 'orderby', 'menu_order' );
        $query->set( 'order', 'ASC' );
    }

    // globalnetwork アーカイブ: 12件/ページ, menu_order ASC
    if ( $query->is_post_type_archive( 'globalnetwork' ) ) {
        $query->set( 'posts_per_page', 12 );
        $query->set( 'orderby', 'menu_order' );
        $query->set( 'order', 'ASC' );
    }

    // media_post アーカイブ: 全件表示, date DESC
    if ( $query->is_post_type_archive( 'media_post' ) ) {
        $query->set( 'posts_per_page', -1 );
        $query->set( 'orderby', 'date' );
        $query->set( 'order', 'DESC' );
    }

    // product アーカイブ: 12件/ページ, menu_order ASC
    if ( $query->is_post_type_archive( 'product' ) ) {
        $query->set( 'posts_per_page', 12 );
        $query->set( 'orderby', 'menu_order' );
        $query->set( 'order', 'ASC' );
    }

    // interview アーカイブ: 12件/ページ, date DESC
    if ( $query->is_post_type_archive( 'interview' ) ) {
        $query->set( 'posts_per_page', 12 );
        $query->set( 'orderby', 'date' );
        $query->set( 'order', 'DESC' );
    }
} );

/**
 * アーカイブページ用の固定ページ設定を取得するヘルパー関数
 * 投稿タイプに対応する固定ページからKV画像、タイトル、本文を取得
 *
 * @param string $post_type 投稿タイプ名
 * @return array page_id, title, content を含む配列
 */
function muashi_get_archive_page_settings( $post_type ) {
    // 投稿タイプと固定ページスラッグのマッピング
    $page_slug_map = array(
        'interview'     => 'career/interview',
        'story'         => 'story',
        'voice'         => 'voice',
        'career'        => 'career',
        'globalnetwork' => 'global-network',
        'media_post'    => 'media-page',
        'product'       => 'product',
    );

    $slug = isset( $page_slug_map[ $post_type ] ) ? $page_slug_map[ $post_type ] : '';

    if ( empty( $slug ) ) {
        return array(
            'page_id' => 0,
            'title'   => '',
            'content' => '',
        );
    }

    // スラッグから固定ページを取得
    $page = get_page_by_path( $slug );

    if ( ! $page ) {
        return array(
            'page_id' => 0,
            'title'   => '',
            'content' => '',
        );
    }

    return array(
        'page_id' => $page->ID,
        'title'   => $page->post_title,
        'content' => apply_filters( 'the_content', $page->post_content ),
    );
}

/**
 * 共通KV画像の出力ヘルパー
 * アイキャッチ画像を優先し、なければfallback画像を使用
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

    $post_id        = $args['post_id'] ? (int) $args['post_id'] : 0;
    $include_source = ! empty( $args['include_source'] );
    $fallback_pc    = $args['fallback_pc'];
    $fallback_sp    = $args['fallback_sp'] !== '' ? $args['fallback_sp'] : $fallback_pc;
    $media_query    = $include_source ? $args['media_query'] : '';

    // アイキャッチ画像がある場合は優先して表示
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

    // アイキャッチがなくfallback_pcも指定されていない場合は何も出力しない
    if ( $fallback_pc === '' ) {
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

    // ぶら下げインデントスタイル
    $hanging_indent_style = array(
        'name'  => 'hanging-indent',
        'label' => 'ぶら下げインデント',
    );

    // 段落ブロック
    register_block_style( 'core/paragraph', $hanging_indent_style );

    // 2列縦並びレスポンシブスタイル（モバイルで縦表示）
    $two_column_responsive_style = array(
        'name'  => 'two-column-responsive',
        'label' => '2列表（モバイル縦並び）',
    );

    // テーブルブロックに適用
    register_block_style( 'core/table', $two_column_responsive_style );
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
 * 画像サイズ用エディタCSS・JS
 */
add_action( 'enqueue_block_editor_assets', function() {
    wp_enqueue_style(
        'muashi-editor-image-sizes',
        get_template_directory_uri() . '/assets/css/editor-image-sizes.css',
        array(),
        filemtime( get_template_directory() . '/assets/css/editor-image-sizes.css' )
    );

    // 画像サイズスライダー
    wp_enqueue_script(
        'muashi-image-size-slider',
        get_template_directory_uri() . '/admin/js/image-size-slider.js',
        array( 'wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-compose', 'wp-hooks' ),
        filemtime( get_template_directory() . '/admin/js/image-size-slider.js' ),
        true
    );
} );

/**
 * 画像ブロックのカスタム幅をフロントエンドに適用
 */
add_filter( 'render_block_core/image', function( $block_content, $block ) {
    if ( empty( $block['attrs']['customMaxWidth'] ) ) {
        return $block_content;
    }

    $max_width = (int) $block['attrs']['customMaxWidth'];
    $unit = isset( $block['attrs']['customMaxWidthUnit'] ) ? $block['attrs']['customMaxWidthUnit'] : 'px';

    // 安全な単位のみ許可
    if ( ! in_array( $unit, array( 'px', '%' ), true ) ) {
        $unit = 'px';
    }

    $style_value = 'max-width:' . $max_width . $unit;

    // 既存のstyle属性をチェック
    if ( preg_match( '/style="([^"]*)"/', $block_content, $matches ) ) {
        $existing_style = $matches[1];
        
        // width: XXXpx を width: 100% に置き換え（レスポンシブ対応）
        $existing_style = preg_replace( '/width:\s*\d+px/i', 'width:100%', $existing_style );
        
        // 既にmax-widthが設定されている場合は置換、なければ追加
        if ( preg_match( '/max-width:[^;]+;?/', $existing_style ) ) {
            $new_style = preg_replace( '/max-width:[^;]+;?/', $style_value . ';', $existing_style );
        } else {
            $new_style = rtrim( $existing_style, ';' ) . ';' . $style_value . ';';
        }
        $block_content = str_replace( 'style="' . $matches[1] . '"', 'style="' . $new_style . '"', $block_content );
    } else {
        // figureタグにstyle属性を追加
        $block_content = preg_replace( '/<figure([^>]*)class="/', '<figure$1style="' . $style_value . ';" class="', $block_content );
    }

    return $block_content;
}, 10, 2 );

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

/**
 * サイドバーナビゲーション用メニューロケーション登録
 */
function muashi_register_sidebar_nav_menus() {
    register_nav_menus( array(
        'sidebar_contact'        => 'お問い合わせ・資料請求用サイドバー',
        'sidebar_news_media'     => 'ニュース・メディア用サイドバー',
        'sidebar_voice'          => 'お客様の声用サイドバー',
        'sidebar_story'          => 'ストーリー用サイドバー',
        'sidebar_sustainability' => 'サステナビリティ用サイドバー',
        'sidebar_career'         => '採用情報用サイドバー',
        'sidebar_history'        => 'ヒストリー用サイドバー',
        'sidebar_global_network' => 'グローバルネットワーク用サイドバー',
        'sidebar_faq'            => 'よくある質問用サイドバー',
        'sidebar_about_us'       => '私たちについて用サイドバー',
        'sidebar_product'        => '製品情報用サイドバー',
    ) );
}
add_action( 'after_setup_theme', 'muashi_register_sidebar_nav_menus' );

/**
 * サイドバーナビゲーション用カスタムウォーカー
 * トップレベル項目と子メニュー項目を表示
 * 子項目は行頭を下げて表示（常に展開状態）
 */
class Muashi_Sidebar_Nav_Walker extends Walker_Nav_Menu {

    /**
     * 現在の親メニュー項目が祖先かどうかを追跡
     */
    private $parent_is_ancestor = false;

    /**
     * メニュー項目の開始タグを出力
     *
     * デザイン/挙動要件:
     * - depth 0 (第1階層): 変更なし（常に表示、通常のリンク/テキスト）
     * - depth 1 (第2階層):
     *   - 子がある場合: アコーディオントリガーになる。クリックで第3階層を開閉。
     *   - 子がない場合: 通常のリンク。
     *   - クラス: 既存の navigation__sub-item を維持しつつアコーディオン機能を追加
     * - depth 2 (第3階層): アコーディオンの中身（通常のリンク）
     */
    public function start_el( &$output, $item, $depth = 0, $args = null, $id = 0 ) {
        $is_current   = $item->current || $item->current_item_ancestor || $item->current_item_parent;
        $has_children = in_array( 'menu-item-has-children', $item->classes, true );

        // depth 1で子がある場合、祖先フラグを保持
        if ( $depth === 1 && $has_children ) {
            $this->parent_is_ancestor = $item->current_item_ancestor || $item->current;
        }

        // depth 0: トップレベル（変更なし）
        if ( $depth === 0 ) {
            $classes = array( 'navigation__item' );
            if ( $is_current ) {
                $classes[] = 'is-active';
            }
            $class_attr = implode( ' ', array_filter( $classes ) );
            $output .= '<li class="' . esc_attr( $class_attr ) . '">';

            $url = $item->url;
            $target = '';
            if ( $item->target === '_blank' ) {
                $target = ' target="_blank" rel="noopener noreferrer"';
            }

            // 現在のページはリンクなしのテキスト
            if ( $item->current ) {
                $output .= '<p class="navigation__item-title">';
                $output .= esc_html( $item->title );
                $output .= '</p>';
            } else {
                $output .= '<a href="' . esc_url( $url ) . '" class="navigation__item-title"' . $target . '>';
                $output .= esc_html( $item->title );
                $output .= '</a>';
            }

        } elseif ( $depth === 1 ) {
            // depth 1: 第2階層
            $classes = array( 'navigation__sub-item' );
            // 親メニュー項目（展開中）の場合もアクティブ扱いにする
            if ( $item->current || $item->current_item_ancestor ) {
                $classes[] = 'is-active';
            }
            $output .= '<li class="' . esc_attr( implode(' ', $classes) ) . '">';

            $target = '';
            if ( $item->target === '_blank' ) {
                $target = ' target="_blank" rel="noopener noreferrer"';
            }

            // 子がある場合はアコーディオントリガー
            if ( $has_children ) {
                // 特定のメニューロケーションではアコーディオンを無効化
                $theme_location = isset( $args->theme_location ) ? $args->theme_location : '';
                $disable_accordion_locations = array( 'sidebar_history', 'sidebar_about_us', 'sidebar_voice', 'sidebar_global_network' );
                $disable_accordion = in_array( $theme_location, $disable_accordion_locations, true );

                // アコーディオンJSが反応するクラスと属性を追加
                if ( $disable_accordion ) {
                    // アコーディオン無効: has-accordionクラスも出力しない
                    $link_classes = 'navigation__sub-link is-active';
                } else {
                    $link_classes = 'navigation__sub-link js-navigation-accordion has-accordion';
                    if ( $item->current || $item->current_item_ancestor ) {
                        $link_classes .= ' is-active';
                    }
                }

                // role="button" でクリッカブルであることを示す
                $aria_expanded = ( $item->current || $item->current_item_ancestor || $disable_accordion ) ? 'true' : 'false';
                $output .= '<p class="' . esc_attr( $link_classes ) . '" role="button" tabindex="0" aria-expanded="' . $aria_expanded . '">';
                $output .= esc_html( $item->title );
                $output .= '</p>';
            } else {
                // 子がない場合は通常のリンク
                $link_classes = 'navigation__sub-link';
                if ( $item->current ) {
                    $link_classes .= ' is-active';
                }
                $output .= '<a href="' . esc_url( $item->url ) . '" class="' . esc_attr( $link_classes ) . '"' . $target . '>';
                $output .= esc_html( $item->title );
                $output .= '</a>';
            }

        } else {
            // depth 2+: 第3階層以降（アコーディオンの中身）
            // 親のデザインを踏襲（navigation__sub-item はマージンのため、孫要素としてアコーディオン用クラスを使う）
            $sub_classes = 'navigation__sub-accordion-item';
            if ( $item->current ) {
                $sub_classes .= ' navigation__sub-accordion-item--active';
            }
            $output .= '<li class="' . esc_attr( $sub_classes ) . '">';

            $target = '';
            if ( $item->target === '_blank' ) {
                $target = ' target="_blank" rel="noopener noreferrer"';
            }

            $link_class = 'navigation__sub-accordion-link';
            if ( $item->current ) {
                $link_class .= ' is-current';
            }
            $output .= '<a href="' . esc_url( $item->url ) . '" class="' . esc_attr( $link_class ) . '"' . $target . '>';
            $output .= esc_html( $item->title );
            $output .= '</a>';
        }
    }

    /**
     * メニュー項目の終了タグを出力
     */
    public function end_el( &$output, $item, $depth = 0, $args = null ) {
        $output .= '</li>';
    }

    /**
     * サブメニューの開始タグを出力
     */
    public function start_lvl( &$output, $depth = 0, $args = null ) {
        if ( $depth === 0 ) {
            // 第2階層を囲むリスト（常に表示）
            $output .= '<ul class="navigation__sub-list">';
        } else {
            // 第3階層を囲むリスト
            $classes = array( 'navigation__sub-accordion-list' );
            $aria_hidden = 'true';

            // 特定のメニューロケーションでは常に展開
            $theme_location = isset( $args->theme_location ) ? $args->theme_location : '';
            $disable_accordion_locations = array( 'sidebar_history', 'sidebar_about_us', 'sidebar_voice', 'sidebar_global_network' );
            $disable_accordion = in_array( $theme_location, $disable_accordion_locations, true );

            if ( $this->parent_is_ancestor || $disable_accordion ) {
                $classes[] = 'is-active';
                $aria_hidden = 'false';
            }

            $class_attr = implode( ' ', $classes );
            $output .= '<ul class="' . esc_attr( $class_attr ) . '" aria-hidden="' . $aria_hidden . '">';

            // フラグをリセット
            $this->parent_is_ancestor = false;
        }
    }

    /**
     * サブメニューの終了タグを出力
     */
    public function end_lvl( &$output, $depth = 0, $args = null ) {
        $output .= '</ul>';
    }
}

/**
 * サイドバーナビゲーションを出力
 *
 * @param string $location メニューロケーション名
 */
function muashi_render_sidebar_navigation( $location ) {
    if ( ! has_nav_menu( $location ) ) {
        return;
    }

    echo '<div class="navigation">';
    echo '<div class="navigation__inner">';

    wp_nav_menu( array(
        'theme_location' => $location,
        'container'      => false,
        'items_wrap'     => '<ul class="navigation__list">%3$s</ul>',
        'walker'         => new Muashi_Sidebar_Nav_Walker(),
        'depth'          => 3,
    ) );

    echo '</div>';
    echo '</div>';
}