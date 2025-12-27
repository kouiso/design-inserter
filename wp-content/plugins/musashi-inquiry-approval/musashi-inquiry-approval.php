<?php
/**
 * Plugin Name: Musashi Inquiry Approval
 * Plugin URI: https://example.com/
 * Description: 問い合わせの管理者承認フローを実装するプラグイン。Contact Form 7と連携し、競合チェック後に資料送付の可否を決定できます。
 * Version: 1.1.0
 * Author: Musashi
 * Author URI: https://example.com/
 * Text Domain: musashi-inquiry-approval
 * Domain Path: /languages
 * Requires at least: 5.0
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// プラグイン定数
define( 'MUSASHI_INQUIRY_VERSION', '1.1.0' );
define( 'MUSASHI_INQUIRY_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'MUSASHI_INQUIRY_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * プラグイン有効化時の処理
 */
function musashi_inquiry_activate() {
    flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'musashi_inquiry_activate' );

/**
 * プラグイン無効化時の処理
 */
function musashi_inquiry_deactivate() {
    flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'musashi_inquiry_deactivate' );

/**
 * テンプレートリダイレクト（クエリパラメータ方式）
 */
function musashi_inquiry_template_redirect() {
    // 承認ページの表示（?musashi_review=1&token=xxx）
    if ( isset( $_GET['musashi_review'] ) && $_GET['musashi_review'] === '1' ) {
        $token = isset( $_GET['token'] ) ? $_GET['token'] : '';
        if ( $token ) {
            musashi_inquiry_display_review_page( $token );
            exit;
        }
    }
    
    // アクション処理（承認/お断り）
    if ( isset( $_POST['musashi_inquiry_action'] ) && $_POST['musashi_inquiry_action'] === '1' ) {
        musashi_inquiry_handle_action();
        exit;
    }
}
add_action( 'template_redirect', 'musashi_inquiry_template_redirect' );

/**
 * 必要なクラスファイルを読み込み
 */
function musashi_inquiry_load_classes() {
    require_once MUSASHI_INQUIRY_PLUGIN_DIR . 'includes/class-inquiry-handler.php';
    require_once MUSASHI_INQUIRY_PLUGIN_DIR . 'includes/class-email-sender.php';
    require_once MUSASHI_INQUIRY_PLUGIN_DIR . 'includes/class-cf7-integration.php';
}
add_action( 'plugins_loaded', 'musashi_inquiry_load_classes' );

/**
 * 管理画面メニューの追加
 */
function musashi_inquiry_admin_menu() {
    add_menu_page(
        '問い合わせ承認',
        '問い合わせ承認',
        'manage_options',
        'musashi-inquiry-settings',
        'musashi_inquiry_settings_page',
        'dashicons-email-alt',
        30
    );
    
    add_submenu_page(
        'musashi-inquiry-settings',
        'ダッシュボード',
        'ダッシュボード',
        'manage_options',
        'musashi-inquiry-settings',
        'musashi_inquiry_settings_page'
    );
    
    add_submenu_page(
        'musashi-inquiry-settings',
        'メールテンプレート',
        'メールテンプレート',
        'manage_options',
        'musashi-inquiry-email-templates',
        'musashi_inquiry_email_templates_page'
    );
}
add_action( 'admin_menu', 'musashi_inquiry_admin_menu' );

/**
 * メールテンプレート設定の登録
 */
function musashi_inquiry_register_settings() {
    // 対象フォーム設定
    register_setting( 'musashi_inquiry_general_settings', 'musashi_target_form_id' );
    
    // メールテンプレート設定
    $mail_types = array( 'user', 'admin', 'approval', 'rejection', 'admin_action' );
    $fields = array( 'to', 'from', 'subject', 'headers', 'body', 'html_mode', 'button_text', 'button_color' );
    
    foreach ( $mail_types as $type ) {
        foreach ( $fields as $field ) {
            register_setting( 'musashi_inquiry_email_settings', "musashi_email_{$type}_{$field}" );
        }
    }
}
add_action( 'admin_init', 'musashi_inquiry_register_settings' );

/**
 * メールテンプレート編集ページ
 */
function musashi_inquiry_email_templates_page() {
    if ( ! current_user_can( 'manage_options' ) ) {
        return;
    }
    
    // デフォルトに戻す処理
    if ( isset( $_POST['musashi_reset_templates'] ) && check_admin_referer( 'musashi_reset_templates' ) ) {
        $mail_types = array( 'user', 'admin', 'approval', 'rejection', 'admin_action' );
        $fields = array( 'to', 'from', 'subject', 'headers', 'body', 'html_mode', 'button_text', 'button_color' );
        foreach ( $mail_types as $type ) {
            foreach ( $fields as $field ) {
                delete_option( "musashi_email_{$type}_{$field}" );
            }
        }
        echo '<div class="notice notice-success is-dismissible"><p>テンプレートをデフォルトに戻しました。</p></div>';
    }
    
    // デフォルト値
    $defaults = musashi_inquiry_get_default_email_templates();
    $admin_email = get_option( 'admin_email' );
    $site_name = get_bloginfo( 'name' );
    
    // 保存済みの値を取得
    $templates = array(
        'user' => array(
            'to'           => get_option( 'musashi_email_user_to', '[your-email]' ),
            'from'         => get_option( 'musashi_email_user_from', "{$site_name} <{$admin_email}>" ),
            'subject'      => get_option( 'musashi_email_user_subject', $defaults['user']['subject'] ),
            'headers'      => get_option( 'musashi_email_user_headers', '' ),
            'body'         => get_option( 'musashi_email_user_body', $defaults['user']['body'] ),
            'html_mode'    => get_option( 'musashi_email_user_html_mode', '' ),
            'button_text'  => get_option( 'musashi_email_user_button_text', '' ),
            'button_color' => get_option( 'musashi_email_user_button_color', '#7B7B00' ),
            'has_button'   => false,
        ),
        'admin' => array(
            'to'           => get_option( 'musashi_email_admin_to', '[_site_admin_email]' ),
            'from'         => get_option( 'musashi_email_admin_from', "{$site_name} <{$admin_email}>" ),
            'subject'      => get_option( 'musashi_email_admin_subject', $defaults['admin']['subject'] ),
            'headers'      => get_option( 'musashi_email_admin_headers', 'Reply-To: [your-email]' ),
            'body'         => get_option( 'musashi_email_admin_body', $defaults['admin']['body'] ),
            'html_mode'    => get_option( 'musashi_email_admin_html_mode', '' ),
            'button_text'  => get_option( 'musashi_email_admin_button_text', '確認ページを開く' ),
            'button_color' => get_option( 'musashi_email_admin_button_color', '#7B7B00' ),
            'has_button'   => true,
            'button_tag'   => '[review_url]',
        ),
        'approval' => array(
            'to'           => get_option( 'musashi_email_approval_to', '[your-email]' ),
            'from'         => get_option( 'musashi_email_approval_from', "{$site_name} <{$admin_email}>" ),
            'subject'      => get_option( 'musashi_email_approval_subject', $defaults['approval']['subject'] ),
            'headers'      => get_option( 'musashi_email_approval_headers', '' ),
            'body'         => get_option( 'musashi_email_approval_body', $defaults['approval']['body'] ),
            'html_mode'    => get_option( 'musashi_email_approval_html_mode', '' ),
            'button_text'  => get_option( 'musashi_email_approval_button_text', '📥 資料ダウンロードページへ' ),
            'button_color' => get_option( 'musashi_email_approval_button_color', '#7B7B00' ),
            'has_button'   => true,
            'button_tag'   => '[download_url]',
        ),
        'rejection' => array(
            'to'           => get_option( 'musashi_email_rejection_to', '[your-email]' ),
            'from'         => get_option( 'musashi_email_rejection_from', "{$site_name} <{$admin_email}>" ),
            'subject'      => get_option( 'musashi_email_rejection_subject', $defaults['rejection']['subject'] ),
            'headers'      => get_option( 'musashi_email_rejection_headers', '' ),
            'body'         => get_option( 'musashi_email_rejection_body', $defaults['rejection']['body'] ),
            'html_mode'    => get_option( 'musashi_email_rejection_html_mode', '' ),
            'button_text'  => get_option( 'musashi_email_rejection_button_text', '' ),
            'button_color' => get_option( 'musashi_email_rejection_button_color', '#7B7B00' ),
            'has_button'   => false,
        ),
        'admin_action' => array(
            'to'           => get_option( 'musashi_email_admin_action_to', '[_site_admin_email]' ),
            'from'         => get_option( 'musashi_email_admin_action_from', "{$site_name} <{$admin_email}>" ),
            'subject'      => get_option( 'musashi_email_admin_action_subject', $defaults['admin_action']['subject'] ),
            'headers'      => get_option( 'musashi_email_admin_action_headers', '' ),
            'body'         => get_option( 'musashi_email_admin_action_body', $defaults['admin_action']['body'] ),
            'html_mode'    => get_option( 'musashi_email_admin_action_html_mode', '' ),
            'button_text'  => get_option( 'musashi_email_admin_action_button_text', '' ),
            'button_color' => get_option( 'musashi_email_admin_action_button_color', '#7B7B00' ),
            'has_button'   => false,
        ),
    );
    
    $tab_labels = array(
        'user' => array( 'title' => 'ユーザー自動返信', 'desc' => '問い合わせ送信時にユーザーに送信されるメールです。' ),
        'admin' => array( 'title' => '管理者通知', 'desc' => '問い合わせ送信時に管理者に送信されるメールです。確認ページへのボタンが含まれます。' ),
        'approval' => array( 'title' => '承認メール', 'desc' => '管理者が承認した際にユーザーに送信されるメールです。ダウンロードボタンが含まれます。' ),
        'rejection' => array( 'title' => 'お断りメール', 'desc' => '管理者がお断りした際にユーザーに送信されるメールです。' ),
        'admin_action' => array( 'title' => '管理者処理完了通知', 'desc' => '承認/お断りの処理が完了した際に管理者に送信される確認メールです（二重承認防止用）。' ),
    );
    ?>
    <style>
        .musashi-mail-tags { background: #f0f0f1; padding: 12px 15px; border-radius: 4px; margin-bottom: 20px; }
        .musashi-mail-tags code { background: #fff; padding: 3px 6px; margin: 2px; display: inline-block; cursor: pointer; border: 1px solid #ddd; border-radius: 3px; }
        .musashi-mail-tags code:hover { background: #0073aa; color: #fff; border-color: #0073aa; }
        .musashi-email-form { background: #fff; border: 1px solid #ccd0d4; border-radius: 4px; padding: 20px; margin-top: 15px; }
        .musashi-email-form table { width: 100%; }
        .musashi-email-form th { width: 100px; padding: 12px 10px 12px 0; vertical-align: top; font-weight: 600; }
        .musashi-email-form td { padding: 8px 0; }
        .musashi-email-form input[type="text"], .musashi-email-form textarea { width: 100%; }
        .musashi-email-form textarea { font-family: monospace; font-size: 13px; }
        .musashi-button-note { background: #e7f3ff; border-left: 4px solid #0073aa; padding: 10px 15px; margin: 10px 0; font-size: 13px; }
        
        /* モード切り替えタブ */
        .musashi-mode-tabs { display: inline-flex; background: #f0f0f1; border-radius: 4px; padding: 3px; margin-bottom: 10px; }
        .musashi-mode-tab { padding: 6px 16px; cursor: pointer; border-radius: 3px; font-size: 13px; transition: all 0.2s; }
        .musashi-mode-tab:hover { background: #e0e0e0; }
        .musashi-mode-tab.active { background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); font-weight: 600; }
        .musashi-mode-tab.html-active { background: #d63638; color: #fff; }
        
        /* ボタン設定 */
        .musashi-button-settings { background: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 6px; padding: 15px; margin-top: 15px; }
        .musashi-button-settings h4 { margin: 0 0 12px 0; font-size: 14px; color: #1d2327; }
        .musashi-button-settings .setting-row { display: flex; align-items: center; gap: 15px; margin-bottom: 10px; }
        .musashi-button-settings .setting-row:last-child { margin-bottom: 0; }
        .musashi-button-settings label { width: 120px; font-weight: 500; font-size: 13px; }
        .musashi-button-settings input[type="text"] { flex: 1; max-width: 300px; }
        .musashi-button-settings input[type="color"] { width: 50px; height: 34px; padding: 2px; cursor: pointer; }
        .musashi-button-preview { margin-top: 12px; padding-top: 12px; border-top: 1px solid #e0e0e0; }
        .musashi-button-preview-label { font-size: 12px; color: #666; margin-bottom: 8px; }
        .musashi-preview-btn { display: inline-block; padding: 12px 30px; border-radius: 6px; font-weight: bold; font-size: 14px; color: #fff; text-decoration: none; }
        
        /* HTML警告 */
        .musashi-html-warning { background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; padding: 10px 15px; margin-bottom: 10px; font-size: 13px; color: #856404; display: none; }
        .musashi-html-warning.show { display: block; }
    </style>
    
    <div class="wrap">
        <h1>メールテンプレート設定</h1>
        
        <div class="musashi-mail-tags">
            <strong>使用可能なメールタグ:</strong><br>
            <code onclick="copyTag(this)">[your-name]</code>
            <code onclick="copyTag(this)">[your-company]</code>
            <code onclick="copyTag(this)">[your-email]</code>
            <code onclick="copyTag(this)">[your-tel]</code>
            <code onclick="copyTag(this)">[your-subject]</code>
            <code onclick="copyTag(this)">[your-message]</code>
            <code onclick="copyTag(this)">[_site_title]</code>
            <code onclick="copyTag(this)">[_site_url]</code>
            <code onclick="copyTag(this)">[_site_admin_email]</code>
            <code onclick="copyTag(this)">[review_url]</code>
            <code onclick="copyTag(this)">[download_url]</code>
            <code onclick="copyTag(this)">[action_type]</code>
            <code onclick="copyTag(this)">[action_date]</code>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">※ クリックでコピーできます</p>
        </div>
        
        <form method="post" action="options.php">
            <?php settings_fields( 'musashi_inquiry_email_settings' ); ?>
            
            <div class="nav-tab-wrapper">
                <?php $first = true; foreach ( $tab_labels as $key => $label ) : ?>
                <a href="#<?php echo $key; ?>-email" class="nav-tab <?php echo $first ? 'nav-tab-active' : ''; ?>" 
                   onclick="showTab('<?php echo $key; ?>-email', this); return false;"><?php echo esc_html( $label['title'] ); ?></a>
                <?php $first = false; endforeach; ?>
            </div>
            
            <?php $first = true; foreach ( $templates as $key => $template ) : 
                $is_html_mode = ! empty( $template['html_mode'] );
            ?>
            <div id="<?php echo $key; ?>-email" class="email-tab-content musashi-email-form" <?php echo ! $first ? 'style="display:none;"' : ''; ?>>
                <h2><?php echo esc_html( $tab_labels[$key]['title'] ); ?></h2>
                <p class="description"><?php echo esc_html( $tab_labels[$key]['desc'] ); ?></p>
                
                <table>
                    <tr>
                        <th>送信先</th>
                        <td>
                            <input type="text" name="musashi_email_<?php echo $key; ?>_to" 
                                   value="<?php echo esc_attr( $template['to'] ); ?>">
                        </td>
                    </tr>
                    <tr>
                        <th>送信元</th>
                        <td>
                            <input type="text" name="musashi_email_<?php echo $key; ?>_from" 
                                   value="<?php echo esc_attr( $template['from'] ); ?>">
                        </td>
                    </tr>
                    <tr>
                        <th>題名</th>
                        <td>
                            <input type="text" name="musashi_email_<?php echo $key; ?>_subject" 
                                   value="<?php echo esc_attr( $template['subject'] ); ?>">
                        </td>
                    </tr>
                    <tr>
                        <th>追加ヘッダー</th>
                        <td>
                            <textarea name="musashi_email_<?php echo $key; ?>_headers" rows="2"><?php echo esc_textarea( $template['headers'] ); ?></textarea>
                        </td>
                    </tr>
                    <tr>
                        <th>メッセージ本文</th>
                        <td>
                            <!-- モード切り替えタブ -->
                            <div class="musashi-mode-tabs">
                                <span class="musashi-mode-tab <?php echo ! $is_html_mode ? 'active' : ''; ?>" 
                                      onclick="setEditMode('<?php echo $key; ?>', 'text')">テキスト</span>
                                <span class="musashi-mode-tab <?php echo $is_html_mode ? 'active html-active' : ''; ?>" 
                                      onclick="setEditMode('<?php echo $key; ?>', 'html')">HTML</span>
                            </div>
                            <input type="hidden" name="musashi_email_<?php echo $key; ?>_html_mode" 
                                   id="musashi_email_<?php echo $key; ?>_html_mode"
                                   value="<?php echo $is_html_mode ? '1' : ''; ?>">
                            
                            <!-- HTML警告 -->
                            <div class="musashi-html-warning <?php echo $is_html_mode ? 'show' : ''; ?>" id="html-warning-<?php echo $key; ?>">
                                ⚠️ <strong>HTMLモード:</strong> HTMLを直接編集できます。誤ったHTMLはメール表示が崩れる原因になります。
                            </div>
                            
                            <?php if ( $template['has_button'] ) : ?>
                            <div class="musashi-button-note" id="button-note-<?php echo $key; ?>" <?php echo $is_html_mode ? 'style="display:none;"' : ''; ?>>
                                <strong>🔘 ボタン表示:</strong> 本文に <code><?php echo esc_html( $template['button_tag'] ); ?></code> を記載すると、下で設定したボタンとして表示されます。
                            </div>
                            <?php endif; ?>
                            
                            <textarea name="musashi_email_<?php echo $key; ?>_body" 
                                      id="musashi_email_<?php echo $key; ?>_body"
                                      rows="15"><?php echo esc_textarea( $template['body'] ); ?></textarea>
                        </td>
                    </tr>
                </table>
                
                <?php if ( $template['has_button'] ) : ?>
                <!-- ボタン設定 -->
                <div class="musashi-button-settings" id="button-settings-<?php echo $key; ?>" <?php echo $is_html_mode ? 'style="display:none;"' : ''; ?>>
                    <h4>🔘 ボタン設定</h4>
                    <div class="setting-row">
                        <label for="musashi_email_<?php echo $key; ?>_button_text">ボタンテキスト</label>
                        <input type="text" name="musashi_email_<?php echo $key; ?>_button_text" 
                               id="musashi_email_<?php echo $key; ?>_button_text"
                               value="<?php echo esc_attr( $template['button_text'] ); ?>"
                               onchange="updateButtonPreview('<?php echo $key; ?>')">
                    </div>
                    <div class="setting-row">
                        <label for="musashi_email_<?php echo $key; ?>_button_color">ボタン色</label>
                        <input type="color" name="musashi_email_<?php echo $key; ?>_button_color" 
                               id="musashi_email_<?php echo $key; ?>_button_color"
                               value="<?php echo esc_attr( $template['button_color'] ); ?>"
                               onchange="updateButtonPreview('<?php echo $key; ?>')">
                        <input type="text" id="musashi_email_<?php echo $key; ?>_button_color_text"
                               value="<?php echo esc_attr( $template['button_color'] ); ?>"
                               style="width: 100px;"
                               onchange="syncColorPicker('<?php echo $key; ?>')">
                    </div>
                    <div class="musashi-button-preview">
                        <div class="musashi-button-preview-label">プレビュー:</div>
                        <span class="musashi-preview-btn" id="preview-btn-<?php echo $key; ?>"
                              style="background-color: <?php echo esc_attr( $template['button_color'] ); ?>">
                            <?php echo esc_html( $template['button_text'] ); ?>
                        </span>
                    </div>
                </div>
                <?php endif; ?>
            </div>
            <?php $first = false; endforeach; ?>
            
            <?php submit_button( 'テンプレートを保存' ); ?>
        </form>
        
        <hr style="margin: 40px 0;">
        
        <h2>デフォルトに戻す</h2>
        <p>テンプレートを初期状態に戻したい場合は、以下のボタンをクリックしてください。</p>
        <form method="post" action="">
            <?php wp_nonce_field( 'musashi_reset_templates' ); ?>
            <button type="submit" name="musashi_reset_templates" class="button" 
                    onclick="return confirm('すべてのメールテンプレートをデフォルトに戻しますか？');">
                デフォルトに戻す
            </button>
        </form>
    </div>
    
    <script>
    function showTab(tabId, element) {
        document.querySelectorAll('.email-tab-content').forEach(function(tab) {
            tab.style.display = 'none';
        });
        document.querySelectorAll('.nav-tab').forEach(function(tab) {
            tab.classList.remove('nav-tab-active');
        });
        document.getElementById(tabId).style.display = 'block';
        element.classList.add('nav-tab-active');
    }
    
    function copyTag(element) {
        var text = element.textContent;
        navigator.clipboard.writeText(text).then(function() {
            var original = element.textContent;
            element.textContent = 'コピーしました!';
            element.style.background = '#0073aa';
            element.style.color = '#fff';
            setTimeout(function() {
                element.textContent = original;
                element.style.background = '';
                element.style.color = '';
            }, 1000);
        });
    }
    
    // モード切り替え
    function setEditMode(key, mode) {
        var container = document.getElementById(key + '-email');
        var tabs = container.querySelectorAll('.musashi-mode-tab');
        var hiddenInput = document.getElementById('musashi_email_' + key + '_html_mode');
        var warning = document.getElementById('html-warning-' + key);
        var buttonNote = document.getElementById('button-note-' + key);
        var buttonSettings = document.getElementById('button-settings-' + key);
        var textarea = document.getElementById('musashi_email_' + key + '_body');
        
        tabs.forEach(function(tab) {
            tab.classList.remove('active', 'html-active');
        });
        
        if (mode === 'html') {
            tabs[1].classList.add('active', 'html-active');
            hiddenInput.value = '1';
            warning.classList.add('show');
            if (buttonNote) buttonNote.style.display = 'none';
            if (buttonSettings) buttonSettings.style.display = 'none';
            textarea.style.minHeight = '300px';
        } else {
            tabs[0].classList.add('active');
            hiddenInput.value = '';
            warning.classList.remove('show');
            if (buttonNote) buttonNote.style.display = 'block';
            if (buttonSettings) buttonSettings.style.display = 'block';
            textarea.style.minHeight = '';
        }
    }
    
    // ボタンプレビュー更新
    function updateButtonPreview(key) {
        var text = document.getElementById('musashi_email_' + key + '_button_text').value;
        var color = document.getElementById('musashi_email_' + key + '_button_color').value;
        var preview = document.getElementById('preview-btn-' + key);
        var colorText = document.getElementById('musashi_email_' + key + '_button_color_text');
        
        preview.textContent = text || 'ボタン';
        preview.style.backgroundColor = color;
        colorText.value = color;
    }
    
    // カラーピッカー同期
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
    </script>
    <?php
}

/**
 * デフォルトのメールテンプレートを取得
 */
function musashi_inquiry_get_default_email_templates() {
    $site_name = get_bloginfo( 'name' );
    
    return array(
        'user' => array(
            'subject' => "【{$site_name}】お問い合わせを受け付けました",
            'body' => "[your-name] 様

この度は{$site_name}にお問い合わせいただき、誠にありがとうございます。

お問い合わせ内容を確認の上、担当者より改めてご連絡させていただきます。
通常、2〜3営業日以内にご回答いたしますので、今しばらくお待ちください。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
お問い合わせ内容
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
お名前: [your-name]
会社名: [your-company]
メール: [your-email]
電話番号: [your-tel]
件名: [your-subject]

【お問い合わせ内容】
[your-message]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

※このメールは自動送信されています。
※お心当たりのない方は、お手数ですが本メールを破棄してください。

{$site_name}
[_site_url]",
        ),
        'admin' => array(
            'subject' => "【要確認】新規お問い合わせ - [your-name] 様",
            'body' => "新規お問い合わせがありました。
確認の上、対応をお願いします。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
お問い合わせ内容
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
お名前: [your-name]
会社名: [your-company]
メール: [your-email]
電話番号: [your-tel]
件名: [your-subject]

【お問い合わせ内容】
[your-message]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▼ 確認ページ（承認/お断りの選択）
[review_url]",
        ),
        'approval' => array(
            'subject' => "【{$site_name}】資料ダウンロードのご案内",
            'body' => "[your-name] 様

この度は{$site_name}にお問い合わせいただき、誠にありがとうございます。

ご依頼いただきました資料をご用意いたしました。
下記のリンクよりダウンロードページにアクセスしていただけます。

▼ 資料ダウンロードページ
[download_url]

ご不明な点がございましたら、お気軽にお問い合わせください。
今後とも{$site_name}をよろしくお願いいたします。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{$site_name}
[_site_url]",
        ),
        'rejection' => array(
            'subject' => "【{$site_name}】お問い合わせへのご回答",
            'body' => "[your-name] 様

この度は{$site_name}にお問い合わせいただき、誠にありがとうございます。

お問い合わせ内容を慎重に検討いたしましたが、
誠に恐れ入りますが、今回はご要望にお応えすることが難しい状況でございます。

ご期待に沿えず大変申し訳ございませんが、何卒ご理解いただけますと幸いです。

その他ご質問等ございましたら、お気軽にお問い合わせください。
今後とも{$site_name}をよろしくお願いいたします。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{$site_name}
[_site_url]",
        ),
        'admin_action' => array(
            'subject' => "【処理完了】[your-name] 様の問い合わせを[action_type]しました",
            'body' => "問い合わせの処理が完了しました。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
処理内容
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
処理種別: [action_type]
処理日時: [action_date]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
対象の問い合わせ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
お名前: [your-name]
会社名: [your-company]
メール: [your-email]
電話番号: [your-tel]

【お問い合わせ内容】
[your-message]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

※このメールは処理完了の記録として送信されています。
※同じ問い合わせへの重複対応にご注意ください。",
        ),
    );
}

/**
 * 設定ページの表示
 */
function musashi_inquiry_settings_page() {
    if ( ! current_user_can( 'manage_options' ) ) {
        return;
    }

    // WP Mail SMTPが有効かチェック
    $wp_mail_smtp_active = class_exists( 'WPMailSMTP\WPMailSMTP' ) || function_exists( 'wp_mail_smtp' );
    
    // Contact Form 7のフォーム一覧を取得
    $cf7_forms = array();
    if ( class_exists( 'WPCF7_ContactForm' ) ) {
        $forms = WPCF7_ContactForm::find();
        foreach ( $forms as $form ) {
            $cf7_forms[] = array(
                'id'    => $form->id(),
                'title' => $form->title(),
            );
        }
    }
    
    // 保存済みの対象フォームID
    $target_form_id = get_option( 'musashi_target_form_id', '' );
    ?>
    <div class="wrap">
        <h1>問い合わせ承認フロー</h1>
        
        <div style="display: flex; gap: 30px; flex-wrap: wrap; margin-top: 20px;">
            <!-- 説明 -->
            <div style="flex: 1; min-width: 400px;">
            
                <!-- 対象フォーム設定 -->
                <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; padding: 20px; margin-bottom: 20px;">
                    <h2 style="margin-top: 0; color: #856404;">⚙️ 対象フォーム設定</h2>
                    <p style="font-size: 14px; color: #856404; margin-bottom: 15px;">
                        承認フローを実行するContact Form 7フォームを選択してください。
                    </p>
                    <form method="post" action="options.php">
                        <?php settings_fields( 'musashi_inquiry_general_settings' ); ?>
                        <select name="musashi_target_form_id" style="min-width: 300px; padding: 8px;">
                            <option value="">-- フォームを選択 --</option>
                            <?php foreach ( $cf7_forms as $form ) : ?>
                                <option value="<?php echo esc_attr( $form['id'] ); ?>" <?php selected( $target_form_id, $form['id'] ); ?>>
                                    <?php echo esc_html( $form['title'] ); ?> (ID: <?php echo esc_html( $form['id'] ); ?>)
                                </option>
                            <?php endforeach; ?>
                        </select>
                        <?php submit_button( '保存', 'primary', 'submit', false ); ?>
                    </form>
                    <?php if ( empty( $target_form_id ) ) : ?>
                        <p style="color: #dc3545; font-weight: 600; margin-top: 10px;">
                            ⚠️ フォームが選択されていません。承認フローは実行されません。
                        </p>
                    <?php else : ?>
                        <p style="color: #28a745; font-weight: 600; margin-top: 10px;">
                            ✅ 設定済み
                        </p>
                    <?php endif; ?>
                </div>
            
                <div style="background: #fff; border: 1px solid #ccd0d4; border-radius: 4px; padding: 20px;">
                    <h2 style="margin-top: 0;">📝 使い方</h2>
                    <ol style="margin: 15px 0; padding-left: 20px;">
                        <li>ユーザーが問い合わせフォームを送信</li>
                        <li>ユーザーに自動返信メール、管理者に通知メールが届く</li>
                        <li>管理者がメール内のボタンをクリック</li>
                        <li>確認ページで「承認」または「お断り」を選択</li>
                        <li>選択に応じたメールがユーザーに送信される</li>
                        <li><strong>管理者にも処理完了通知が届く（二重承認防止）</strong></li>
                    </ol>
                </div>

            </div>

            <!-- ステータス -->
            <div style="flex: 0 0 350px;">
                <div style="background: #fff; border: 1px solid #ccd0d4; border-radius: 4px; padding: 20px;">
                    <h3 style="margin-top: 0;">🔧 メール送信設定</h3>
                    <?php if ( $wp_mail_smtp_active ) : ?>
                        <p style="color: #28a745; font-weight: 600;">✅ WP Mail SMTP が有効です</p>
                        <p style="font-size: 13px; color: #666;">
                            メールはWP Mail SMTP経由で送信されます。<br>
                            <a href="<?php echo admin_url( 'admin.php?page=wp-mail-smtp' ); ?>">WP Mail SMTPの設定を確認</a>
                        </p>
                    <?php else : ?>
                        <p style="color: #dc3545; font-weight: 600;">⚠️ WP Mail SMTP が無効です</p>
                        <p style="font-size: 13px; color: #666;">
                            メールが正しく送信されない可能性があります。<br>
                            WP Mail SMTPプラグインを有効化し、メール設定を行ってください。
                        </p>
                        <p>
                            <a href="<?php echo admin_url( 'plugins.php' ); ?>" class="button">プラグイン設定へ</a>
                        </p>
                    <?php endif; ?>
                </div>

                <div style="background: #fff; border: 1px solid #ccd0d4; border-radius: 4px; padding: 20px; margin-top: 20px;">
                    <h3 style="margin-top: 0;">📧 管理者メールアドレス</h3>
                    <p style="font-size: 14px; margin: 0;">
                        <code><?php echo esc_html( get_option( 'admin_email' ) ); ?></code>
                    </p>
                    <p style="font-size: 12px; color: #666; margin-top: 10px;">
                        問い合わせ通知はこのアドレスに送信されます。<br>
                        <a href="<?php echo admin_url( 'options-general.php' ); ?>">一般設定で変更</a>
                    </p>
                </div>
            </div>
        </div>
    </div>
    <?php
}

/**
 * Contact Form 7が有効かチェック
 */
function musashi_inquiry_check_cf7() {
    if ( ! class_exists( 'WPCF7' ) ) {
        add_action( 'admin_notices', function() {
            echo '<div class="notice notice-error"><p>';
            echo esc_html__( 'Musashi Inquiry Approval プラグインには Contact Form 7 が必要です。', 'musashi-inquiry-approval' );
            echo '</p></div>';
        } );
    }
}
add_action( 'admin_init', 'musashi_inquiry_check_cf7' );

/**
 * 確認ページの表示
 */
function musashi_inquiry_display_review_page( $token ) {
    // URLデコード
    $token = rawurldecode( $token );
    
    // トークンを復号化
    $inquiry = Musashi_Inquiry_Handler::decode_token( $token );
    
    if ( ! $inquiry ) {
        wp_die( 
            '無効なリンクです。このリンクは改ざんされているか、無効です。',
            '無効なリンク',
            array( 'response' => 404 )
        );
    }
    
    // テンプレートを読み込み
    include MUSASHI_INQUIRY_PLUGIN_DIR . 'templates/approval-page.php';
}

/**
 * 承認/お断りアクションの処理
 */
function musashi_inquiry_handle_action() {
    // nonce検証
    if ( ! isset( $_POST['musashi_inquiry_nonce'] ) || 
         ! wp_verify_nonce( $_POST['musashi_inquiry_nonce'], 'musashi_inquiry_action' ) ) {
        wp_die( '不正なリクエストです。', 'エラー', array( 'response' => 403 ) );
    }
    
    $token = isset( $_POST['inquiry_token'] ) ? sanitize_text_field( $_POST['inquiry_token'] ) : '';
    $action = isset( $_POST['action_type'] ) ? sanitize_text_field( $_POST['action_type'] ) : '';
    
    if ( empty( $token ) || ! in_array( $action, array( 'approve', 'reject' ), true ) ) {
        wp_die( '無効なリクエストです。', 'エラー', array( 'response' => 400 ) );
    }
    
    // トークンを復号化
    $inquiry = Musashi_Inquiry_Handler::decode_token( $token );
    
    if ( ! $inquiry ) {
        wp_die( '無効なトークンです。', 'エラー', array( 'response' => 400 ) );
    }
    
    // メール送信
    $action_type = ( $action === 'approve' ) ? 'approved' : 'rejected';
    
    if ( $action === 'approve' ) {
        $user_mail_sent = Musashi_Email_Sender::send_approval_email( $inquiry );
        $message = '資料ダウンロードリンクをお客様に送信しました。';
    } else {
        $user_mail_sent = Musashi_Email_Sender::send_rejection_email( $inquiry );
        $message = 'お断りメールをお客様に送信しました。';
    }
    
    // 管理者への処理完了通知（二重承認防止）
    Musashi_Email_Sender::send_admin_action_notification( $inquiry, $action_type );
    
    // 完了ページを表示
    include MUSASHI_INQUIRY_PLUGIN_DIR . 'templates/action-complete.php';
}

/**
 * CSSの読み込み（確認ページ用）
 */
function musashi_inquiry_enqueue_styles() {
    if ( isset( $_GET['musashi_review'] ) || isset( $_POST['musashi_inquiry_action'] ) ) {
        wp_enqueue_style(
            'musashi-inquiry-approval',
            MUSASHI_INQUIRY_PLUGIN_URL . 'assets/css/approval-page.css',
            array(),
            MUSASHI_INQUIRY_VERSION
        );
    }
}
add_action( 'wp_enqueue_scripts', 'musashi_inquiry_enqueue_styles' );
