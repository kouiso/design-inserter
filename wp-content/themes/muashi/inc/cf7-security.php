<?php
/**
 * CF7 セキュリティ強化
 *
 * - ファイルアップロードの MIME タイプ実体検証（finfo_file）
 * - IP ベースのレート制限（WordPress transient API）
 *
 * reCAPTCHA v3 は CF7 のインテグレーション設定で有効化する（コード不要）。
 *
 * @package Muashi
 * @see     SECURITY_PLAN.md
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* ========================================================================
 * 1. MIME タイプ許可リスト
 * ======================================================================== */

/**
 * 許可する拡張子と対応する MIME タイプのマッピング
 *
 * contact.html の filetypes:pdf|doc|docx|xls|xlsx|ppt|pptx|jpg|png に対応。
 * OOXML（docx/xlsx/pptx）は内部的に ZIP なので application/zip も許可する。
 */
function muashi_cf7_get_allowed_mime_types() {
	return array(
		'pdf'  => array( 'application/pdf' ),
		'doc'  => array( 'application/msword', 'application/octet-stream' ),
		'docx' => array(
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'application/zip',
		),
		'xls'  => array( 'application/vnd.ms-excel', 'application/octet-stream' ),
		'xlsx' => array(
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'application/zip',
		),
		'ppt'  => array( 'application/vnd.ms-powerpoint', 'application/octet-stream' ),
		'pptx' => array(
			'application/vnd.openxmlformats-officedocument.presentationml.presentation',
			'application/zip',
		),
		'jpg'  => array( 'image/jpeg' ),
		'jpeg' => array( 'image/jpeg' ),
		'png'  => array( 'image/png' ),
	);
}

/* ========================================================================
 * 2. MIME タイプ実体検証フィルター
 * ======================================================================== */

add_filter( 'wpcf7_validate_file',  'muashi_cf7_validate_file_mime', 20, 3 );
add_filter( 'wpcf7_validate_file*', 'muashi_cf7_validate_file_mime', 20, 3 );

/**
 * finfo_file() でファイルのマジックバイトを検査し、
 * 拡張子に対応する MIME タイプと一致しない場合はバリデーションエラーにする。
 *
 * wpcf7_validate_file フィルターは ($result, $tag) の2引数のみ渡すため、
 * アップロードファイルパスは WPCF7_Submission から直接取得する。
 * テストコードからは後方互換のため $args['uploaded_files'] も受け付ける。
 *
 * @param WPCF7_Validation $result バリデーション結果
 * @param WPCF7_FormTag    $tag    フォームタグ
 * @param array            $args   テスト用: ['uploaded_files' => array of file paths]
 * @return WPCF7_Validation
 */
function muashi_cf7_validate_file_mime( $result, $tag, $args = array() ) {
	if ( ! $result->is_valid( $tag->name ) ) {
		return $result;
	}

	// テストコードから $args['uploaded_files'] を受け取った場合はそちらを優先する。
	// 本番では wpcf7_validate_file フィルターが $args を渡さないため、
	// WPCF7_Submission から直接ファイルパスを取得する。
	if ( ! empty( $args['uploaded_files'] ) ) {
		$uploaded_files = $args['uploaded_files'];
	} elseif ( class_exists( 'WPCF7_Submission' ) ) {
		$submission     = WPCF7_Submission::get_instance();
		$all_files      = $submission ? $submission->uploaded_files() : array();
		$uploaded_files = isset( $all_files[ $tag->name ] ) ? $all_files[ $tag->name ] : array();
	} else {
		$uploaded_files = array();
	}

	// WP_Error または空の場合はスキップ
	if ( empty( $uploaded_files ) || is_wp_error( $uploaded_files ) ) {
		return $result;
	}

	$uploaded_files = (array) $uploaded_files;

	// finfo 拡張が利用不可の場合はログを残してパス
	if ( ! function_exists( 'finfo_open' ) ) {
		error_log( 'muashi_cf7_validate_file_mime: finfo extension is not available. Skipping MIME validation.' );
		return $result;
	}

	$allowed_mime_types = muashi_cf7_get_allowed_mime_types();

	foreach ( $uploaded_files as $file_path ) {
		if ( ! is_string( $file_path ) || ! @is_file( $file_path ) ) {
			continue;
		}

		$extension = strtolower( pathinfo( $file_path, PATHINFO_EXTENSION ) );

		if ( ! isset( $allowed_mime_types[ $extension ] ) ) {
			$result->invalidate( $tag, 'このファイル形式はアップロードできません。' );
			return $result;
		}

		$finfo    = finfo_open( FILEINFO_MIME_TYPE );
		$detected = finfo_file( $finfo, $file_path );
		finfo_close( $finfo );

		if ( false === $detected ) {
			$result->invalidate( $tag, 'ファイルの検証に失敗しました。別のファイルをお試しください。' );
			return $result;
		}

		$allowed_for_ext = $allowed_mime_types[ $extension ];

		if ( ! in_array( $detected, $allowed_for_ext, true ) ) {
			$result->invalidate(
				$tag,
				'ファイルの内容が拡張子と一致しません。正しいファイルを選択してください。'
			);
			return $result;
		}
	}

	return $result;
}

/* ========================================================================
 * 3. レート制限
 * ======================================================================== */

add_action( 'wpcf7_before_send_mail', 'muashi_cf7_rate_limit', 10, 3 );

/**
 * IP ベースのレート制限
 *
 * 同一 IP から5分間に3回を超える送信をブロック。
 *
 * @param WPCF7_ContactForm $contact_form
 * @param bool              &$abort true にすると送信中止
 * @param WPCF7_Submission  $submission
 */
function muashi_cf7_rate_limit( $contact_form, &$abort, $submission ) {
	$ip = muashi_cf7_get_client_ip();

	if ( empty( $ip ) ) {
		return;
	}

	$transient_key = 'muashi_cf7_rl_' . md5( $ip );
	$max_attempts  = 3;
	$window        = 5 * MINUTE_IN_SECONDS;

	$attempts = (int) get_transient( $transient_key );

	if ( $attempts >= $max_attempts ) {
		$abort = true;
		$submission->set_response(
			'送信回数の上限に達しました。しばらく時間を置いてから再度お試しください。'
		);
		return;
	}

	set_transient( $transient_key, $attempts + 1, $window );
}

/**
 * クライアント IP を取得
 *
 * @return string IP アドレス（取得不可時は空文字）
 */
function muashi_cf7_get_client_ip() {
	if ( empty( $_SERVER['REMOTE_ADDR'] ) ) {
		return '';
	}

	$ip = $_SERVER['REMOTE_ADDR'];

	// 本番環境ではプライベート IP・予約済み IP を拒否
	$flags = FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE;

	// ローカル・開発環境ではプライベート IP を許可（予約済み IP は引き続き拒否）
	if ( defined( 'WP_ENVIRONMENT_TYPE' ) && in_array( WP_ENVIRONMENT_TYPE, array( 'local', 'development' ), true ) ) {
		$flags = FILTER_FLAG_NO_RES_RANGE;
	}

	$validated = filter_var( $ip, FILTER_VALIDATE_IP, $flags );

	return $validated ? sanitize_text_field( $validated ) : '';
}
