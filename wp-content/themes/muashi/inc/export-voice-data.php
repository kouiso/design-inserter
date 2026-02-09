<?php
/**
 * お客様の声データ確認スクリプト（一時ファイル）
 */
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$voices = get_posts( array(
    'post_type'      => 'voice',
    'post_status'    => 'any',
    'posts_per_page' => -1,
    'orderby'        => 'menu_order',
    'order'          => 'ASC',
) );

echo "=== お客様の声 全投稿データ ===\n";
echo "件数: " . count( $voices ) . "\n\n";

foreach ( $voices as $v ) {
    echo "--- ID: {$v->ID} | menu_order: {$v->menu_order} ---\n";
    echo "タイトル: {$v->post_title}\n";
    echo "ステータス: {$v->post_status}\n";
    echo "会社名: " . get_post_meta( $v->ID, 'voice_company', true ) . "\n";
    echo "部署・役職: " . get_post_meta( $v->ID, 'voice_position', true ) . "\n";
    echo "氏名: " . get_post_meta( $v->ID, 'voice_person_name', true ) . "\n";
    echo "サムネイル: " . ( has_post_thumbnail( $v->ID ) ? get_the_post_thumbnail_url( $v->ID, 'full' ) : 'なし' ) . "\n";
    echo "本文:\n" . mb_substr( $v->post_content, 0, 200 ) . "...\n\n";
}
