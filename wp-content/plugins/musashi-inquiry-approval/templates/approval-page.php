<?php
/**
 * 管理者確認ページテンプレート（シンプル版）
 *
 * @package Musashi_Inquiry_Approval
 * @var object $inquiry 問い合わせデータ
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>問い合わせ確認 - <?php bloginfo( 'name' ); ?></title>
    <?php wp_head(); ?>

</head>
<body>
    <div class="approval-container">
        <div class="approval-header">
            <h1>問い合わせ確認</h1>
            <p><?php bloginfo( 'name' ); ?></p>
        </div>

        <div class="approval-content">
            <p class="approval-message">
                この問い合わせに対する対応を選択してください。
            </p>

            <div class="action-buttons">
                <form method="post" action="<?php echo esc_url( home_url( '/' ) ); ?>" class="action-form" id="approve-form">
                    <?php wp_nonce_field( 'musashi_inquiry_action', 'musashi_inquiry_nonce' ); ?>
                    <input type="hidden" name="musashi_inquiry_action" value="1">
                    <input type="hidden" name="inquiry_token" value="<?php echo esc_attr( $inquiry->token ); ?>">
                    <input type="hidden" name="action_type" value="approve">
                    <button type="button" class="action-btn btn-approve" onclick="confirmAction('approve')">
                        <span class="btn-icon">✅</span>
                        承認する
                    </button>
                </form>

                <form method="post" action="<?php echo esc_url( home_url( '/' ) ); ?>" class="action-form" id="reject-form">
                    <?php wp_nonce_field( 'musashi_inquiry_action', 'musashi_inquiry_nonce' ); ?>
                    <input type="hidden" name="musashi_inquiry_action" value="1">
                    <input type="hidden" name="inquiry_token" value="<?php echo esc_attr( $inquiry->token ); ?>">
                    <input type="hidden" name="action_type" value="reject">
                    <button type="button" class="action-btn btn-reject" onclick="confirmAction('reject')">
                        <span class="btn-icon">❌</span>
                        否認する
                    </button>
                </form>
            </div>
        </div>

        <div class="approval-footer">
            このページは管理者専用です
        </div>
    </div>

    <!-- 確認ダイアログ -->
    <div class="confirmation-overlay" id="confirmation-overlay">
        <div class="confirmation-dialog">
            <h3 id="confirmation-title">確認</h3>
            <p id="confirmation-message">この操作を実行しますか？</p>
            <div class="confirmation-buttons">
                <button type="button" class="confirmation-btn cancel" onclick="closeConfirmation()">キャンセル</button>
                <button type="button" class="confirmation-btn confirm" id="confirmation-submit">実行する</button>
            </div>
        </div>
    </div>

    <?php wp_footer(); ?>
</body>
</html>
