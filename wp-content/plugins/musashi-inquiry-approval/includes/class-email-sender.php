<?php
/**
 * メール送信クラス
 *
 * @package Musashi_Inquiry_Approval
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class Musashi_Email_Sender
 * 
 * 各種メールの送信を担当
 */
class Musashi_Email_Sender {

    /**
     * 管理者メールアドレスを取得
     *
     * @return string
     */
    private static function get_admin_email() {
        return get_option( 'admin_email' );
    }

    /**
     * サイト名を取得
     *
     * @return string
     */
    private static function get_site_name() {
        return get_bloginfo( 'name' );
    }

    /**
     * メールタグを置換
     *
     * @param string $template テンプレート文字列
     * @param object $inquiry  問い合わせデータ
     * @param array  $extra    追加の変数
     * @return string
     */
    private static function replace_mail_tags( $template, $inquiry, $extra = array() ) {
        $tags = array(
            '[your-name]'         => $inquiry->name ?? '',
            '[your-email]'        => $inquiry->email ?? '',
            '[your-company]'      => $inquiry->company ?? '',
            '[your-tel]'          => $inquiry->phone ?? '',
            '[your-subject]'      => $inquiry->subject ?? '',
            '[your-message]'      => $inquiry->message ?? '',
            '[_site_title]'       => self::get_site_name(),
            '[_site_url]'         => home_url(),
            '[_site_admin_email]' => self::get_admin_email(),
            // 後方互換性のため旧形式もサポート
            '{name}'              => $inquiry->name ?? '',
            '{email}'             => $inquiry->email ?? '',
            '{company}'           => $inquiry->company ?? '',
            '{phone}'             => $inquiry->phone ?? '',
            '{subject}'           => $inquiry->subject ?? '',
            '{message}'           => $inquiry->message ?? '',
            '{site_name}'         => self::get_site_name(),
            '{site_url}'          => home_url(),
        );
        
        $tags = array_merge( $tags, $extra );
        
        return str_replace( array_keys( $tags ), array_values( $tags ), $template );
    }

    /**
     * ボタンHTMLを生成
     *
     * @param string $url   リンクURL
     * @param string $text  ボタンテキスト
     * @param string $color ボタン色
     * @return string
     */
    private static function generate_button_html( $url, $text, $color = '#7B7B00' ) {
        return '<div style="text-align: center; margin: 25px 0;">
            <a href="' . esc_url( $url ) . '" style="display: inline-block; background-color: ' . esc_attr( $color ) . '; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">' . esc_html( $text ) . '</a>
        </div>';
    }

    /**
     * テキストをHTMLメール形式に変換
     *
     * @param string $text    テキスト本文
     * @param array  $buttons ボタン置換情報
     * @return string
     */
    private static function text_to_html( $text, $buttons = array() ) {
        $placeholders = array();
        foreach ( $buttons as $i => $button ) {
            $placeholder = "___BUTTON_PLACEHOLDER_{$i}___";
            $button_html = self::generate_button_html( $button['url'], $button['text'], $button['color'] ?? '#7B7B00' );
            $placeholders[$placeholder] = $button_html;
            
            if ( isset( $button['tag'] ) ) {
                $text = str_replace( $button['tag'], $placeholder, $text );
            }
        }
        
        $text = esc_html( $text );
        $text = nl2br( $text );
        
        foreach ( $placeholders as $placeholder => $button_html ) {
            $text = str_replace( esc_html( $placeholder ), $button_html, $text );
        }
        
        return '<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: \'Helvetica Neue\', Arial, \'Hiragino Kaku Gothic ProN\', \'Hiragino Sans\', Meiryo, sans-serif; line-height: 1.8; color: #333333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
        ' . $text . '
    </div>
</body>
</html>';
    }

    /**
     * メールを送信
     *
     * @param string $to      宛先
     * @param string $subject 件名
     * @param string $body    本文
     * @param string $from    送信元
     * @param string $headers_extra 追加ヘッダー
     * @return bool
     */
    private static function send_mail( $to, $subject, $body, $from = '', $headers_extra = '' ) {
        $headers = array( 'Content-Type: text/html; charset=UTF-8' );
        
        if ( ! empty( $from ) ) {
            $headers[] = "From: {$from}";
        } else {
            $headers[] = "From: " . self::get_site_name() . " <" . self::get_admin_email() . ">";
        }
        
        if ( ! empty( $headers_extra ) ) {
            $extra_lines = explode( "\n", $headers_extra );
            foreach ( $extra_lines as $line ) {
                $line = trim( $line );
                if ( ! empty( $line ) ) {
                    $headers[] = $line;
                }
            }
        }
        
        return wp_mail( $to, $subject, $body, $headers );
    }

    /**
     * ユーザーへの自動返信メール
     *
     * @param object $inquiry 問い合わせデータ
     * @return bool
     */
    public static function send_user_confirmation( $inquiry ) {
        $defaults = function_exists( 'musashi_inquiry_get_default_email_templates' ) 
            ? musashi_inquiry_get_default_email_templates() 
            : array( 'user' => array( 'subject' => '', 'body' => '' ) );
        
        $to = get_option( 'musashi_email_user_to', '[your-email]' );
        $from = get_option( 'musashi_email_user_from', '' );
        $subject = get_option( 'musashi_email_user_subject', $defaults['user']['subject'] );
        $headers = get_option( 'musashi_email_user_headers', '' );
        $body_template = get_option( 'musashi_email_user_body', $defaults['user']['body'] );

        $to = self::replace_mail_tags( $to, $inquiry );
        $from = self::replace_mail_tags( $from, $inquiry );
        $subject = self::replace_mail_tags( $subject, $inquiry );
        $headers = self::replace_mail_tags( $headers, $inquiry );
        $body = self::replace_mail_tags( $body_template, $inquiry );
        
        $html_body = self::text_to_html( $body );
        
        return self::send_mail( $to, $subject, $html_body, $from, $headers );
    }

    /**
     * 管理者への通知メール
     *
     * @param object $inquiry 問い合わせデータ
     * @return bool
     */
    public static function send_admin_notification( $inquiry ) {
        $defaults = function_exists( 'musashi_inquiry_get_default_email_templates' ) 
            ? musashi_inquiry_get_default_email_templates() 
            : array( 'admin' => array( 'subject' => '', 'body' => '' ) );
        
        $review_url = Musashi_Inquiry_Handler::get_review_url( $inquiry->token );
        
        $to = get_option( 'musashi_email_admin_to', '[_site_admin_email]' );
        $from = get_option( 'musashi_email_admin_from', '' );
        $subject = get_option( 'musashi_email_admin_subject', $defaults['admin']['subject'] );
        $headers = get_option( 'musashi_email_admin_headers', '' );
        $body_template = get_option( 'musashi_email_admin_body', $defaults['admin']['body'] );
        $button_text = get_option( 'musashi_email_admin_button_text', '確認ページを開く' );
        $button_color = get_option( 'musashi_email_admin_button_color', '#7B7B00' );
        
        $extra = array(
            '[review_url]' => $review_url,
            '{review_url}' => $review_url,
        );
        
        $to = self::replace_mail_tags( $to, $inquiry, $extra );
        $from = self::replace_mail_tags( $from, $inquiry, $extra );
        $subject = self::replace_mail_tags( $subject, $inquiry, $extra );
        $headers = self::replace_mail_tags( $headers, $inquiry, $extra );
        $body = self::replace_mail_tags( $body_template, $inquiry, $extra );
        
        $buttons = array(
            array(
                'url'   => $review_url,
                'text'  => $button_text,
                'color' => $button_color,
                'tag'   => '[review_url]',
            ),
        );
        $html_body = self::text_to_html( $body, $buttons );
        
        return self::send_mail( $to, $subject, $html_body, $from, $headers );
    }

    /**
     * 承認メール（資料ダウンロードリンク付き）
     *
     * @param object $inquiry 問い合わせデータ
     * @return bool
     */
    public static function send_approval_email( $inquiry ) {
        $defaults = function_exists( 'musashi_inquiry_get_default_email_templates' ) 
            ? musashi_inquiry_get_default_email_templates() 
            : array( 'approval' => array( 'subject' => '', 'body' => '' ) );
        
        $download_url = home_url( '/document/' );
        if ( ! empty( $inquiry->selected_products ) ) {
            $download_url = add_query_arg( 'dl_product_id', $inquiry->selected_products, $download_url );
        }
        
        $to = get_option( 'musashi_email_approval_to', '[your-email]' );
        $from = get_option( 'musashi_email_approval_from', '' );
        $subject = get_option( 'musashi_email_approval_subject', $defaults['approval']['subject'] );
        $headers = get_option( 'musashi_email_approval_headers', '' );
        $body_template = get_option( 'musashi_email_approval_body', $defaults['approval']['body'] );
        $button_text = get_option( 'musashi_email_approval_button_text', '📥 資料ダウンロードページへ' );
        $button_color = get_option( 'musashi_email_approval_button_color', '#7B7B00' );
        
        $extra = array(
            '[download_url]' => $download_url,
            '{download_url}' => $download_url,
        );
        
        $to = self::replace_mail_tags( $to, $inquiry, $extra );
        $from = self::replace_mail_tags( $from, $inquiry, $extra );
        $subject = self::replace_mail_tags( $subject, $inquiry, $extra );
        $headers = self::replace_mail_tags( $headers, $inquiry, $extra );
        $body = self::replace_mail_tags( $body_template, $inquiry, $extra );
        
        $buttons = array(
            array(
                'url'   => $download_url,
                'text'  => $button_text,
                'color' => $button_color,
                'tag'   => '[download_url]',
            ),
        );
        $html_body = self::text_to_html( $body, $buttons );
        
        return self::send_mail( $to, $subject, $html_body, $from, $headers );
    }

    /**
     * お断りメール
     *
     * @param object $inquiry 問い合わせデータ
     * @return bool
     */
    public static function send_rejection_email( $inquiry ) {
        $defaults = function_exists( 'musashi_inquiry_get_default_email_templates' ) 
            ? musashi_inquiry_get_default_email_templates() 
            : array( 'rejection' => array( 'subject' => '', 'body' => '' ) );
        
        $to = get_option( 'musashi_email_rejection_to', '[your-email]' );
        $from = get_option( 'musashi_email_rejection_from', '' );
        $subject = get_option( 'musashi_email_rejection_subject', $defaults['rejection']['subject'] );
        $headers = get_option( 'musashi_email_rejection_headers', '' );
        $body_template = get_option( 'musashi_email_rejection_body', $defaults['rejection']['body'] );
        
        $to = self::replace_mail_tags( $to, $inquiry );
        $from = self::replace_mail_tags( $from, $inquiry );
        $subject = self::replace_mail_tags( $subject, $inquiry );
        $headers = self::replace_mail_tags( $headers, $inquiry );
        $body = self::replace_mail_tags( $body_template, $inquiry );
        
        $html_body = self::text_to_html( $body );
        
        return self::send_mail( $to, $subject, $html_body, $from, $headers );
    }

    /**
     * 管理者への承認完了通知メール（二重承認防止用）
     *
     * @param object $inquiry     問い合わせデータ
     * @param string $action_type 実行したアクション（'approved' または 'rejected'）
     * @return bool
     */
    public static function send_admin_action_notification( $inquiry, $action_type ) {
        $defaults = function_exists( 'musashi_inquiry_get_default_email_templates' ) 
            ? musashi_inquiry_get_default_email_templates() 
            : array( 'admin_action' => array( 'subject' => '', 'body' => '' ) );
        
        $to = get_option( 'musashi_email_admin_action_to', '[_site_admin_email]' );
        $from = get_option( 'musashi_email_admin_action_from', '' );
        $subject = get_option( 'musashi_email_admin_action_subject', $defaults['admin_action']['subject'] );
        $headers = get_option( 'musashi_email_admin_action_headers', '' );
        $body_template = get_option( 'musashi_email_admin_action_body', $defaults['admin_action']['body'] );
        
        $action_label = ( $action_type === 'approved' ) ? '承認' : 'お断り';
        
        $extra = array(
            '[action_type]'  => $action_label,
            '{action_type}'  => $action_label,
            '[action_date]'  => current_time( 'Y年n月j日 H:i' ),
            '{action_date}'  => current_time( 'Y年n月j日 H:i' ),
        );
        
        $to = self::replace_mail_tags( $to, $inquiry, $extra );
        $from = self::replace_mail_tags( $from, $inquiry, $extra );
        $subject = self::replace_mail_tags( $subject, $inquiry, $extra );
        $headers = self::replace_mail_tags( $headers, $inquiry, $extra );
        $body = self::replace_mail_tags( $body_template, $inquiry, $extra );
        
        $html_body = self::text_to_html( $body );
        
        return self::send_mail( $to, $subject, $html_body, $from, $headers );
    }
}
