<?php
/**
 * インタビュー投稿タイプ用 ACF フィールドグループ定義
 *
 * ACFプラグインがアクティブな場合に、インタビュー情報のカスタムフィールドを登録します。
 * フィールド名は既存の get_post_meta() と互換性を保つため、同じ名前を使用しています。
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * ACF フィールドグループを登録
 */
add_action( 'acf/init', 'muashi_register_interview_acf_fields' );

function muashi_register_interview_acf_fields() {
    if ( ! function_exists( 'acf_add_local_field_group' ) ) {
        return;
    }

    acf_add_local_field_group( array(
        'key'      => 'group_interview_info',
        'title'    => 'インタビュー情報',
        'fields'   => array(
            array(
                'key'          => 'field_interview_company',
                'label'        => '会社名',
                'name'         => 'interview_company',
                'type'         => 'text',
                'instructions' => '例: スズキ株式会社',
                'required'     => 0,
                'placeholder'  => '会社名を入力',
            ),
            array(
                'key'          => 'field_interview_position',
                'label'        => '部署・役職',
                'name'         => 'interview_position',
                'type'         => 'text',
                'instructions' => '例: 四輪デザイン部 CMFデザイン課 主幹',
                'required'     => 0,
                'placeholder'  => '部署・役職を入力',
            ),
            array(
                'key'          => 'field_interview_person_name',
                'label'        => '氏名',
                'name'         => 'interview_person_name',
                'type'         => 'text',
                'instructions' => '例: 日向 隆 様',
                'required'     => 0,
                'placeholder'  => '氏名を入力',
            ),
        ),
        'location' => array(
            array(
                array(
                    'param'    => 'post_type',
                    'operator' => '==',
                    'value'    => 'interview',
                ),
            ),
        ),
        'menu_order'            => 0,
        'position'              => 'side', // サイドバーに表示
        'style'                 => 'default',
        'label_placement'       => 'top',
        'instruction_placement' => 'label',
        'active'                => true,
    ) );
}
