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
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
            line-height: 1.8;
            color: #333333;
            background-color: #e9ecef;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .complete-container {
            max-width: 400px;
            width: 100%;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            text-align: center;
            overflow: hidden;
        }

        .complete-header {
            background-color: <?php echo esc_attr( $color ); ?>;
            color: #ffffff;
            padding: 40px 30px;
        }

        .complete-icon {
            font-size: 64px;
            margin-bottom: 15px;
            display: block;
        }

        .complete-title {
            font-size: 24px;
            font-weight: 600;
        }

        .complete-content {
            padding: 30px;
        }

        .complete-message {
            font-size: 15px;
            color: #666666;
        }

        .complete-footer {
            padding: 15px;
            background-color: #f8f9fa;
            border-top: 1px solid #dddddd;
            font-size: 11px;
            color: #999999;
        }
    </style>
</head>
<body>
    <div class="complete-container">
        <div class="complete-header">
            <span class="complete-icon"><?php echo $icon; ?></span>
            <h1 class="complete-title"><?php echo esc_html( $title ); ?></h1>
        </div>

        <div class="complete-content">
            <p class="complete-message"><?php echo esc_html( $message ); ?></p>
        </div>

        <div class="complete-footer">
            処理日時: <?php echo esc_html( current_time( 'Y年n月j日 H:i' ) ); ?>
        </div>
    </div>

    <?php wp_footer(); ?>
</body>
</html>
