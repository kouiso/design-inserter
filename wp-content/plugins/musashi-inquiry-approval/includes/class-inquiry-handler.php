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
     * 暗号化アルゴリズム
     */
    const CIPHER_METHOD = 'aes-256-cbc';

    /**
     * 暗号化キーを取得
     *
     * @return string
     */
    private static function get_encryption_key() {
        if ( defined( 'WP_CACHE_KEY_SALT' ) && WP_CACHE_KEY_SALT ) {
            return WP_CACHE_KEY_SALT;
        }
        if ( defined( 'AUTH_KEY' ) && AUTH_KEY ) {
            return AUTH_KEY;
        }
        if ( defined( 'SECURE_AUTH_KEY' ) && SECURE_AUTH_KEY ) {
            return SECURE_AUTH_KEY;
        }
        if ( defined( 'NONCE_KEY' ) && NONCE_KEY ) {
            return NONCE_KEY;
        }
        return wp_salt( 'auth' );
    }

    /**
     * 暗号化キーを適切な長さに調整
     *
     * @return string 32バイトの暗号化キー
     */
    private static function get_formatted_key() {
        $key = self::get_encryption_key();
        return hash( 'sha256', $key, true );
    }

    /**
     * 問い合わせデータを暗号化してトークンを生成
     *
     * @param array $data 問い合わせデータ
     * @return string|false 暗号化されたトークン、失敗時はfalse
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
        
        $json = wp_json_encode( $inquiry_data, JSON_UNESCAPED_UNICODE );
        if ( $json === false ) {
            error_log( 'Musashi Inquiry: Failed to encode data to JSON' );
            return false;
        }
        
        $iv_length = openssl_cipher_iv_length( self::CIPHER_METHOD );
        if ( $iv_length === false ) {
            error_log( 'Musashi Inquiry: Invalid cipher method' );
            return false;
        }
        
        $iv = openssl_random_pseudo_bytes( $iv_length );
        if ( $iv === false ) {
            error_log( 'Musashi Inquiry: Failed to generate IV' );
            return false;
        }
        
        $encrypted = openssl_encrypt(
            $json,
            self::CIPHER_METHOD,
            self::get_formatted_key(),
            OPENSSL_RAW_DATA,
            $iv
        );
        
        if ( $encrypted === false ) {
            error_log( 'Musashi Inquiry: Failed to encrypt data' );
            return false;
        }
        
        $encrypted_with_iv = $iv . $encrypted;
        $encoded = base64_encode( $encrypted_with_iv );
        
        $signature = hash_hmac( 'sha256', $encoded, self::get_encryption_key() );
        
        $token = $encoded . '.' . $signature;
        
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
        
        $token = strtr( $token, '-_', '+/' );
        
        $parts = explode( '.', $token );
        if ( count( $parts ) !== 2 ) {
            error_log( 'Musashi Inquiry: Invalid token format' );
            return null;
        }
        
        list( $encoded, $signature ) = $parts;
        
        $expected_signature = hash_hmac( 'sha256', $encoded, self::get_encryption_key() );
        if ( ! hash_equals( $expected_signature, $signature ) ) {
            error_log( 'Musashi Inquiry: Invalid token signature' );
            return null;
        }
        
        $encrypted_with_iv = base64_decode( $encoded, true );
        if ( $encrypted_with_iv === false ) {
            error_log( 'Musashi Inquiry: Failed to decode base64 token' );
            return null;
        }
        
        $iv_length = openssl_cipher_iv_length( self::CIPHER_METHOD );
        if ( $iv_length === false ) {
            error_log( 'Musashi Inquiry: Invalid cipher method' );
            return null;
        }
        
        if ( strlen( $encrypted_with_iv ) < $iv_length ) {
            error_log( 'Musashi Inquiry: Token data too short' );
            return null;
        }
        
        $iv = substr( $encrypted_with_iv, 0, $iv_length );
        $encrypted = substr( $encrypted_with_iv, $iv_length );
        
        $json = openssl_decrypt(
            $encrypted,
            self::CIPHER_METHOD,
            self::get_formatted_key(),
            OPENSSL_RAW_DATA,
            $iv
        );
        
        if ( $json === false ) {
            error_log( 'Musashi Inquiry: Failed to decrypt token data' );
            return null;
        }
        
        $data = json_decode( $json );
        if ( $data === null ) {
            error_log( 'Musashi Inquiry: Failed to parse decrypted JSON' );
            return null;
        }
        
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
