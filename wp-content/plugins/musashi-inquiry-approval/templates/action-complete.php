<?php
/**
 * アクション完了ページテンプレート（シンプル版）
 *
 * @package Musashi_Inquiry_Approval
 * @var string $message 完了メッセージ
 * @var string $action 実行されたアクション (approve/reject)
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$is_approved = ( $action === 'approve' );
$icon = $is_approved ? '✅' : '📧';
$title = $is_approved ? '承認しました' : '否認しました';
$color = $is_approved ? '#28a745' : '#dc3545';
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>処理完了 - <?php bloginfo( 'name' ); ?></title>
    <?php wp_head(); ?>

</head>
<body>
    <div class="complete-container">
        <div class="complete-header" style="background-color: <?php echo esc_attr( $color ); ?>;">
            <span class="complete-icon"><?php echo $icon; ?></span>
            <h1 class="complete-title"><?php echo esc_html( $title ); ?></h1>
        </div>

        <div class="complete-content">
            <p class="complete-message"><?php echo esc_html( $message ); ?></p>
            <button type="button" class="close-button" onclick="closeWindow()">
                このページを閉じる
            </button>
        </div>

        <div class="complete-footer">
            処理日時: <?php echo esc_html( current_time( 'Y年n月j日 H:i' ) ); ?>
        </div>
    </div>

    <?php wp_footer(); ?>
</body>
</html>
