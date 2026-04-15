<?php
/**
 * CF7フォームテンプレートをテーマファイルで管理
 *
 * DB（プラグイン管理画面）ではなく cf7-templates/ 内のHTMLを正とする。
 * フォームHTMLの変更はテーマファイルを編集 → Git で管理できる。
 */
add_filter( 'wpcf7_contact_form_properties', 'muashi_cf7_form_templates', 10, 2 );
function muashi_cf7_form_templates( $properties, $contact_form ) {
    $templates = array(
        218 => 'contact.html',  // お問い合わせ
        221 => 'download.html', // カタログ請求
    );

    $form_id = $contact_form->id();

    if ( isset( $templates[ $form_id ] ) ) {
        $file = get_theme_file_path( 'cf7-templates/' . $templates[ $form_id ] );
        if ( file_exists( $file ) ) {
            $properties['form'] = file_get_contents( $file );
        }
    }

    return $properties;
}
