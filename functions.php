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
            'supports'      => array('title', 'editor', 'thumbnail', 'revisions'),
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
 * 製品情報タクソノミー設定を取得
 */
function muashi_get_product_taxonomy_config() {
    return array(
        'product_application' => array(
            'label'        => '用途',
            'plural'       => '用途',
            'slug'         => 'products/application',
            'hierarchical' => true,
        ),
        'product_material'   => array(
            'label'        => '基材',
            'plural'       => '基材',
            'slug'         => 'products/material',
            'hierarchical' => true,
        ),
        'product_design'     => array(
            'label'        => '意匠性',
            'plural'       => '意匠性',
            'slug'         => 'products/design',
            'hierarchical' => true,
        ),
        'product_function'   => array(
            'label'        => '機能',
            'plural'       => '機能',
            'slug'         => 'products/function',
            'hierarchical' => true,
        ),
        'product_environment'=> array(
            'label'        => '環境キーワード',
            'plural'       => '環境キーワード',
            'slug'         => 'products/environment',
            'hierarchical' => true,
        ),
    );
}

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
