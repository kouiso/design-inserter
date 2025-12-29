<?php

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
        'has_archive'        => false,
        // NOTE: /media/ はWordPressの予約語のため使用不可
        'rewrite'            => array(
            'slug'       => 'media-page',
            'with_front' => false,
        ),
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
