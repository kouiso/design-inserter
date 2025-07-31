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