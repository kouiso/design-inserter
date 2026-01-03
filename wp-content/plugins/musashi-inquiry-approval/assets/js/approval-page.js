/**
 * 問い合わせ承認確認ページ用スクリプト
 */

let currentAction = null;

/**
 * 承認/否認アクションの確認ダイアログを表示
 * @param {string} action 'approve' または 'reject'
 */
window.confirmAction = function (action) {
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

/**
 * 確認ダイアログを閉じる
 */
window.closeConfirmation = function () {
    const overlay = document.getElementById('confirmation-overlay');
    overlay.classList.remove('active');
    currentAction = null;
}

document.addEventListener('DOMContentLoaded', function () {
    // 実行ボタンのイベントリスナー
    const submitBtn = document.getElementById('confirmation-submit');
    if (submitBtn) {
        submitBtn.addEventListener('click', function () {
            if (currentAction === 'approve') {
                document.getElementById('approve-form').submit();
            } else if (currentAction === 'reject') {
                document.getElementById('reject-form').submit();
            }
        });
    }

    // オーバーレイクリックで閉じる
    const overlay = document.getElementById('confirmation-overlay');
    if (overlay) {
        overlay.addEventListener('click', function (e) {
            if (e.target === this) {
                closeConfirmation();
            }
        });
    }

    // Escキーで閉じる
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeConfirmation();
        }
    });
});
