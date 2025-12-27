<?php
/**
 * 問い合わせ処理クラス
 *
 * @package Musashi_Inquiry_Approval
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class Musashi_Inquiry_Handler
 * 
 * 問い合わせデータの暗号化・復号化を担当
 */
class Musashi_Inquiry_Handler {

    /**
     * 暗号化キーを取得
     *
     * @return string
     */
    private static function get_encryption_key() {
        // WP_CACHE_KEY_SALTを優先使用（影響範囲が限定的）
        if ( defined( 'WP_CACHE_KEY_SALT' ) && WP_CACHE_KEY_SALT ) {
            return WP_CACHE_KEY_SALT;
        }
        return 'musashi-inquiry-default-key';
    }

    /**
     * 問い合わせデータを暗号化してトークンを生成
     *
     * @param array $data 問い合わせデータ
     * @return string 暗号化されたトークン
     */
    public static function create_token( $data ) {
        $inquiry_data = array(
            'email'            => sanitize_email( $data['email'] ?? '' ),
            'name'             => sanitize_text_field( $data['name'] ?? '' ),
            'company'          => sanitize_text_field( $data['company'] ?? '' ),
            'phone'            => sanitize_text_field( $data['phone'] ?? '' ),
            'subject'          => sanitize_text_field( $data['subject'] ?? '' ),
            'message'          => sanitize_textarea_field( $data['message'] ?? '' ),
            'selected_products'=> sanitize_text_field( $data['selected_products'] ?? '' ),
        );
        
        // JSONエンコード
        $json = wp_json_encode( $inquiry_data, JSON_UNESCAPED_UNICODE );
        
        // Base64エンコード
        $encoded = base64_encode( $json );
        
        // 署名を生成
        $signature = hash_hmac( 'sha256', $encoded, self::get_encryption_key() );
        
        // トークン = エンコードデータ.署名
        $token = $encoded . '.' . $signature;
        
        // URL-safeにする
        $token = strtr( $token, '+/', '-_' );
        
        return $token;
    }

    /**
     * トークンを復号化して問い合わせデータを取得
     *
     * @param string $token トークン
     * @return object|null 問い合わせデータ（オブジェクト形式）
     */
    public static function decode_token( $token ) {
        if ( empty( $token ) ) {
            return null;
        }
        
        // URL-safeから戻す
        $token = strtr( $token, '-_', '+/' );
        
        // トークンを分割
        $parts = explode( '.', $token );
        if ( count( $parts ) !== 2 ) {
            error_log( 'Musashi Inquiry: Invalid token format' );
            return null;
        }
        
        list( $encoded, $signature ) = $parts;
        
        // 署名を検証
        $expected_signature = hash_hmac( 'sha256', $encoded, self::get_encryption_key() );
        if ( ! hash_equals( $expected_signature, $signature ) ) {
            error_log( 'Musashi Inquiry: Invalid token signature' );
            return null;
        }
        
        // Base64デコード
        $json = base64_decode( $encoded );
        if ( $json === false ) {
            error_log( 'Musashi Inquiry: Failed to decode token' );
            return null;
        }
        
        // JSONデコード
        $data = json_decode( $json );
        if ( $data === null ) {
            error_log( 'Musashi Inquiry: Failed to parse token JSON' );
            return null;
        }
        
        // トークン自体も保持（メール送信時に使用）
        $data->token = strtr( $token, '+/', '-_' );
        
        return $data;
    }

    /**
     * 確認ページのURLを生成
     *
     * @param string $token トークン
     * @return string
     */
    public static function get_review_url( $token ) {
        return add_query_arg( array(
            'musashi_review' => '1',
            'token' => $token,
        ), home_url( '/' ) );
    }

    /**
     * 問い合わせデータを配列からオブジェクトに変換
     *
     * @param array $data 問い合わせデータ（配列）
     * @return object
     */
    public static function array_to_object( $data ) {
        $obj = new stdClass();
        $obj->email            = $data['email'] ?? '';
        $obj->name             = $data['name'] ?? '';
        $obj->company          = $data['company'] ?? '';
        $obj->phone            = $data['phone'] ?? '';
        $obj->subject          = $data['subject'] ?? '';
        $obj->message          = $data['message'] ?? '';
        $obj->selected_products= $data['selected_products'] ?? '';
        $obj->token            = $data['token'] ?? '';
        
        return $obj;
    }
}
