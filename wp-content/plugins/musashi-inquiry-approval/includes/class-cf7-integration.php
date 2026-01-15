<?php
/**
 * Contact Form 7 連携クラス
 *
 * @package Musashi_Inquiry_Approval
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class Musashi_CF7_Integration
 * 
 * Contact Form 7のフックを使用して問い合わせフローを制御
 */
class Musashi_CF7_Integration {

    /**
     * 初期化
     */
    public static function init() {
        // CF7のメール送信後に実行
        add_action( 'wpcf7_mail_sent', array( __CLASS__, 'handle_submission' ), 10, 1 );
        
        // CF7のデフォルトメール送信を制御（オプション）
        // add_filter( 'wpcf7_skip_mail', array( __CLASS__, 'skip_default_mail' ), 10, 2 );
    }

    /**
     * フォーム送信時の処理
     *
     * @param WPCF7_ContactForm $contact_form
     */
    public static function handle_submission( $contact_form ) {
        $target_form_id = get_option( 'musashi_target_form_id', '' );
        
        if ( empty( $target_form_id ) ) {
            return;
        }
        
        if ( (int) $contact_form->id() !== (int) $target_form_id ) {
            return;
        }
        
        $submission = WPCF7_Submission::get_instance();
        
        if ( ! $submission ) {
            return;
        }

        $posted_data = $submission->get_posted_data();
        $inquiry_data = self::prepare_inquiry_data( $posted_data );
        $token = Musashi_Inquiry_Handler::create_token( $inquiry_data );
        
        $inquiry = Musashi_Inquiry_Handler::array_to_object( $inquiry_data );
        $inquiry->token = $token;

        $user_mail_sent = Musashi_Email_Sender::send_user_confirmation( $inquiry );
        if ( ! $user_mail_sent ) {
            error_log( 'Musashi Inquiry: Failed to send user confirmation email' );
        }

        $admin_mail_sent = Musashi_Email_Sender::send_admin_notification( $inquiry );
        if ( ! $admin_mail_sent ) {
            error_log( 'Musashi Inquiry: Failed to send admin notification email' );
        }
    }

    /**
     * CF7の送信データから問い合わせデータを準備
     *
     * @param array $posted_data CF7の送信データ
     * @return array
     */
    private static function prepare_inquiry_data( $posted_data ) {
        $field_mapping = array(
            'your-email'     => 'email',
            'your-name'      => 'name',
            'your-company'   => 'company',
            'your-tel'       => 'phone',
            'your-subject'   => 'subject',
            'your-message'   => 'message',
            'selected_products' => 'selected_products',
        );

        $inquiry_data = array();

        foreach ( $field_mapping as $cf7_field => $inquiry_field ) {
            if ( isset( $posted_data[ $cf7_field ] ) ) {
                $value = $posted_data[ $cf7_field ];
                
                if ( is_array( $value ) ) {
                    $value = implode( ', ', $value );
                }
                
                $inquiry_data[ $inquiry_field ] = $value;
            }
        }

        return $inquiry_data;
    }

    /**
     * CF7のデフォルトメール送信をスキップ（オプション）
     * 
     * 使用する場合は init() メソッド内でコメントを外してください
     *
     * @param bool              $skip
     * @param WPCF7_ContactForm $contact_form
     * @return bool
     */
    public static function skip_default_mail( $skip, $contact_form ) {
        // 特定のフォームIDのみスキップする場合
        // $target_form_ids = array( 123, 456 ); // CF7のフォームID
        // if ( in_array( $contact_form->id(), $target_form_ids, true ) ) {
        //     return true;
        // }
        
        return $skip;
    }
}

add_action( 'plugins_loaded', array( 'Musashi_CF7_Integration', 'init' ), 20 );
