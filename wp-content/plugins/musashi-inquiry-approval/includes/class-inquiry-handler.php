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
        // WP_CACHE_KEY_SALTを優先使用（影響範囲が限定的）
        if ( defined( 'WP_CACHE_KEY_SALT' ) && WP_CACHE_KEY_SALT ) {
            return WP_CACHE_KEY_SALT;
        }
        // フォールバック: AUTH_KEY
        if ( defined( 'AUTH_KEY' ) && AUTH_KEY ) {
            return AUTH_KEY;
        }
        // フォールバック: SECURE_AUTH_KEY
        if ( defined( 'SECURE_AUTH_KEY' ) && SECURE_AUTH_KEY ) {
            return SECURE_AUTH_KEY;
        }
        // フォールバック: NONCE_KEY
        if ( defined( 'NONCE_KEY' ) && NONCE_KEY ) {
            return NONCE_KEY;
        }
        // 最終フォールバック: wp_salt()でサイト固有の値を生成
        // wp_salt()は複数のWordPress saltキーを組み合わせて生成するため、サイトごとにユニーク
        return wp_salt( 'auth' );
    }

    /**
     * 暗号化キーを適切な長さに調整
     *
     * @return string 32バイトの暗号化キー
     */
    private static function get_formatted_key() {
        $key = self::get_encryption_key();
        // SHA-256でハッシュ化して、常に32バイト（256ビット）のキーを生成
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
        
        // JSONエンコード
        $json = wp_json_encode( $inquiry_data, JSON_UNESCAPED_UNICODE );
        if ( $json === false ) {
            error_log( 'Musashi Inquiry: Failed to encode data to JSON' );
            return false;
        }
        
        // 初期化ベクトル（IV）を生成
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
        
        // データを暗号化（AES-256-CBC）
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
        
        // IV + 暗号化データを結合してBase64エンコード
        $encrypted_with_iv = $iv . $encrypted;
        $encoded = base64_encode( $encrypted_with_iv );
        
        // 署名を生成（改ざん防止）
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
        
        // 署名を検証（改ざん検知）
        $expected_signature = hash_hmac( 'sha256', $encoded, self::get_encryption_key() );
        if ( ! hash_equals( $expected_signature, $signature ) ) {
            error_log( 'Musashi Inquiry: Invalid token signature' );
            return null;
        }
        
        // Base64デコード
        $encrypted_with_iv = base64_decode( $encoded, true );
        if ( $encrypted_with_iv === false ) {
            error_log( 'Musashi Inquiry: Failed to decode base64 token' );
            return null;
        }
        
        // IVの長さを取得
        $iv_length = openssl_cipher_iv_length( self::CIPHER_METHOD );
        if ( $iv_length === false ) {
            error_log( 'Musashi Inquiry: Invalid cipher method' );
            return null;
        }
        
        // データが最低限IVの長さを持っているか確認
        if ( strlen( $encrypted_with_iv ) < $iv_length ) {
            error_log( 'Musashi Inquiry: Token data too short' );
            return null;
        }
        
        // IVと暗号化データを分離
        $iv = substr( $encrypted_with_iv, 0, $iv_length );
        $encrypted = substr( $encrypted_with_iv, $iv_length );
        
        // データを復号化
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
        
        // JSONデコード
        $data = json_decode( $json );
        if ( $data === null ) {
            error_log( 'Musashi Inquiry: Failed to parse decrypted JSON' );
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
