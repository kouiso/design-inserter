<?php
/**
 * CF7 セキュリティ強化
 *
 * - ファイルアップロードの MIME タイプ実体検証（finfo_file）
 * - IP ベースのレート制限（WordPress transient API）
 *
 * ハニーポットは CF7 Honeypot プラグインに委譲。
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
 * レガシー Office（doc/xls/ppt）で octet-stream が返る場合は OLE2 マジックバイトで二次検証する。
 */
function muashi_cf7_get_allowed_mime_types() {
	return array(
		'pdf'  => array( 'application/pdf' ),
		'doc'  => array( 'application/msword' ),
		'docx' => array(
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'application/zip',
		),
		'xls'  => array( 'application/vnd.ms-excel' ),
		'xlsx' => array(
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'application/zip',
		),
		'ppt'  => array( 'application/vnd.ms-powerpoint' ),
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
 * CF7 v5.x では wpcf7_validate_file フィルターが3引数 ($result, $tag, $args) を渡す。
 * $args['uploaded_files'] が渡された場合はそれを優先し、未渡しの場合は
 * WPCF7_Submission::get_instance() からファイルパスを取得する（フォールバック）。
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
			$result->invalidate( $tag, 'This file type cannot be uploaded.' );
			return $result;
		}

		$finfo    = finfo_open( FILEINFO_MIME_TYPE );
		$detected = finfo_file( $finfo, $file_path );
		finfo_close( $finfo );

		if ( false === $detected ) {
			$result->invalidate( $tag, 'File validation failed. Please try a different file.' );
			return $result;
		}

		$allowed_for_ext = $allowed_mime_types[ $extension ];

		// レガシー Office（doc/xls/ppt）で octet-stream が返った場合、OLE2 マジックバイトで二次検証
		if ( 'application/octet-stream' === $detected && in_array( $extension, array( 'doc', 'xls', 'ppt' ), true ) ) {
			if ( muashi_cf7_has_ole2_signature( $file_path ) ) {
				continue;
			}
			$result->invalidate(
				$tag,
				'The file contents do not match the extension. Please select the correct file.'
			);
			return $result;
		}

		if ( ! in_array( $detected, $allowed_for_ext, true ) ) {
			$result->invalidate(
				$tag,
				'The file contents do not match the extension. Please select the correct file.'
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
 * 同一 IP・同一フォームから5分間に3回を超える送信をブロック。
 *
 * @param WPCF7_ContactForm $contact_form
 * @param bool              &$abort true にすると送信中止
 * @param WPCF7_Submission  $submission
 */
function muashi_cf7_rate_limit( $contact_form, &$abort, $submission ) {
	$ip = muashi_cf7_get_client_ip();

	if ( empty( $ip ) ) {
		error_log( 'muashi_cf7_rate_limit: クライアント IP を取得できません。レート制限をスキップします。' );
		return;
	}

	// フォーム ID を含めてフォーム別にレート制限を分離
	$form_id       = $contact_form->id();
	$transient_key = 'muashi_cf7_rl_' . md5( $ip . '_' . $form_id );
	$max_attempts  = 3;
	$window        = 5 * MINUTE_IN_SECONDS;

	$attempts = (int) get_transient( $transient_key );

	if ( $attempts >= $max_attempts ) {
		$abort = true;
		$submission->set_response(
			'You have reached the submission limit. Please wait a while and try again.'
		);
		return;
	}

	set_transient( $transient_key, $attempts + 1, $window );
}

/**
 * OLE2 Compound Document のマジックバイト検証
 *
 * レガシー Office ファイル（doc/xls/ppt）は finfo_file() が
 * application/octet-stream を返す場合がある。先頭4バイトが
 * OLE2 シグネチャ（D0 CF 11 E0）であれば正当なファイルと判定する。
 *
 * @param string $file_path ファイルパス
 * @return bool OLE2 シグネチャが一致すれば true
 */
function muashi_cf7_has_ole2_signature( $file_path ) {
	$handle = @fopen( $file_path, 'rb' );
	if ( ! $handle ) {
		return false;
	}
	$bytes = fread( $handle, 4 );
	fclose( $handle );

	// OLE2 Compound Document Format マジックナンバー: D0 CF 11 E0
	return "\xD0\xCF\x11\xE0" === $bytes;
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
	// wp_get_environment_type() は定数だけでなくフィルターにも対応（WP 5.5+）
	if ( function_exists( 'wp_get_environment_type' ) && in_array( wp_get_environment_type(), array( 'local', 'development' ), true ) ) {
		$flags = FILTER_FLAG_NO_RES_RANGE;
	}

	$validated = filter_var( $ip, FILTER_VALIDATE_IP, $flags );

	return $validated ? sanitize_text_field( $validated ) : '';
}
