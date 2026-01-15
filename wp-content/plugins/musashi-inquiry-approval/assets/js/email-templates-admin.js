/**
 * メールテンプレート編集ページのJavaScript
 * Musashi Inquiry Approval Plugin
 */

/**
 * タブ切り替え
 */
function showTab(tabId, element) {
    document.querySelectorAll('.email-tab-content').forEach(function (tab) {
        tab.style.display = 'none';
    });
    document.querySelectorAll('.nav-tab').forEach(function (tab) {
        tab.classList.remove('nav-tab-active');
    });
    document.getElementById(tabId).style.display = 'block';
    element.classList.add('nav-tab-active');
}

/**
 * メールタグのコピー
 */
function copyTag(element) {
    var text = element.textContent;
    var success = false;

    // モダンなClipboard APIを試す（HTTPS/localhost環境）
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
            showCopySuccess(element);
        }).catch(function () {
            // Clipboard APIが失敗したら従来の方法を試す
            success = fallbackCopyTextToClipboard(text);
            if (success) {
                showCopySuccess(element);
            }
        });
    } else {
        // Clipboard APIが使えない場合は従来の方法を使用
        success = fallbackCopyTextToClipboard(text);
        if (success) {
            showCopySuccess(element);
        }
    }
}

/**
 * フォールバックのコピー方法（document.execCommand使用）
 */
function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    var successful = false;
    try {
        successful = document.execCommand('copy');
    } catch (err) {
        console.error('コピーに失敗しました', err);
    }

    document.body.removeChild(textArea);
    return successful;
}

/**
 * コピー成功時の表示
 */
function showCopySuccess(element) {
    var original = element.textContent;
    element.textContent = 'コピーしました!';
    element.style.background = '#0073aa';
    element.style.color = '#fff';
    setTimeout(function () {
        element.textContent = original;
        element.style.background = '';
        element.style.color = '';
    }, 1000);
}



/**
 * ボタンプレビュー更新
 */
function updateButtonPreview(key) {
    var text = document.getElementById('musashi_email_' + key + '_button_text').value;
    var color = document.getElementById('musashi_email_' + key + '_button_color').value;
    var preview = document.getElementById('preview-btn-' + key);
    var colorText = document.getElementById('musashi_email_' + key + '_button_color_text');

    preview.textContent = text || 'ボタン';
    preview.style.backgroundColor = color;
    colorText.value = color;
}

/**
 * カラーピッカー同期
 */
function syncColorPicker(key) {
    var colorText = document.getElementById('musashi_email_' + key + '_button_color_text').value;
    var colorPicker = document.getElementById('musashi_email_' + key + '_button_color');
    var preview = document.getElementById('preview-btn-' + key);

    // 有効なカラーコードかチェック
    if (/^#[0-9A-Fa-f]{6}$/.test(colorText)) {
        colorPicker.value = colorText;
        preview.style.backgroundColor = colorText;
    }
}

