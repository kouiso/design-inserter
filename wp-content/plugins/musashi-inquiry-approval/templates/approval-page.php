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

        .approval-container {
            max-width: 500px;
            width: 100%;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            text-align: center;
        }

        .approval-header {
            background-color: #7B7B00;
            color: #ffffff;
            padding: 30px;
        }

        .approval-header h1 {
            font-size: 22px;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .approval-header p {
            font-size: 14px;
            opacity: 0.9;
        }

        .approval-content {
            padding: 40px 30px;
        }

        .approval-message {
            font-size: 16px;
            color: #666;
            margin-bottom: 30px;
        }

        .action-buttons {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .action-form {
            width: 100%;
        }

        .action-btn {
            width: 100%;
            padding: 18px 30px;
            font-size: 16px;
            font-weight: 600;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }

        .action-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .action-btn:active {
            transform: translateY(0);
        }

        .btn-approve {
            background-color: #28a745;
            color: #ffffff;
        }

        .btn-approve:hover {
            background-color: #1e7e34;
        }

        .btn-reject {
            background-color: #dc3545;
            color: #ffffff;
        }

        .btn-reject:hover {
            background-color: #bd2130;
        }

        .btn-icon {
            font-size: 20px;
        }

        .approval-footer {
            padding: 15px 30px;
            background-color: #f8f9fa;
            border-top: 1px solid #dddddd;
            font-size: 12px;
            color: #999;
        }

        /* 確認ダイアログ */
        .confirmation-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            align-items: center;
            justify-content: center;
        }

        .confirmation-overlay.active {
            display: flex;
        }

        .confirmation-dialog {
            background-color: #ffffff;
            border-radius: 12px;
            padding: 30px;
            max-width: 400px;
            width: 90%;
            text-align: center;
        }

        .confirmation-dialog h3 {
            font-size: 20px;
            margin-bottom: 15px;
        }

        .confirmation-dialog p {
            color: #666;
            margin-bottom: 25px;
        }

        .confirmation-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
        }

        .confirmation-btn {
            padding: 12px 30px;
            font-size: 14px;
            font-weight: 600;
            border: none;
            border-radius: 6px;
            cursor: pointer;
        }

        .confirmation-btn.cancel {
            background-color: #dddddd;
            color: #333333;
        }

        .confirmation-btn.confirm {
            color: #ffffff;
        }
    </style>
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

    <script>
        let currentAction = null;

        function confirmAction(action) {
            currentAction = action;
            const overlay = document.getElementById('confirmation-overlay');
            const title = document.getElementById('confirmation-title');
            const message = document.getElementById('confirmation-message');
            const submitBtn = document.getElementById('confirmation-submit');

            if (action === 'approve') {
                title.textContent = '承認しますか？';
                message.textContent = 'ユーザーに資料ダウンロードリンク付きのメールが送信されます。';
                submitBtn.style.backgroundColor = '#28a745';
            } else {
                title.textContent = '否認しますか？';
                message.textContent = 'ユーザーにお断りメールが送信されます。';
                submitBtn.style.backgroundColor = '#dc3545';
            }

            overlay.classList.add('active');
        }

        function closeConfirmation() {
            const overlay = document.getElementById('confirmation-overlay');
            overlay.classList.remove('active');
            currentAction = null;
        }

        document.getElementById('confirmation-submit').addEventListener('click', function() {
            if (currentAction === 'approve') {
                document.getElementById('approve-form').submit();
            } else if (currentAction === 'reject') {
                document.getElementById('reject-form').submit();
            }
        });

        // オーバーレイクリックで閉じる
        document.getElementById('confirmation-overlay').addEventListener('click', function(e) {
            if (e.target === this) {
                closeConfirmation();
            }
        });

        // Escキーで閉じる
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeConfirmation();
            }
        });
    </script>

    <?php wp_footer(); ?>
</body>
</html>
