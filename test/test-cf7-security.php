<?php
/**
 * CF7 Security Test
 *
 * cf7-security.php の各関数をユニットテストする。
 * メール送信なし、PHP関数レベルでの検証。
 *
 * テスト対象:
 *   1. MIME 許可リスト（muashi_cf7_get_allowed_mime_types）
 *   2. MIME 実体検証（muashi_cf7_validate_file_mime）
 *   3. IP 取得ヘルパー（muashi_cf7_get_client_ip）
 *   4. レート制限（muashi_cf7_rate_limit）※DB 接続時のみ
 *
 * Usage: php test/test-cf7-security.php
 */

define( 'DB_HOST', '127.0.0.1:10011' );
require_once __DIR__ . '/../wp-load.php';

// functions.php から自動ロードされない場合に備えて明示的にロード
if ( ! function_exists( 'muashi_cf7_get_allowed_mime_types' ) ) {
	require_once get_theme_file_path( '/inc/cf7-security.php' );
}

echo "\n";
echo "========================================\n";
echo "CF7 Security Test (PHP)\n";
echo "========================================\n";

$all_passed = true;
$test_count = 0;
$pass_count = 0;
$skip_count = 0;

$original_remote_addr = isset( $_SERVER['REMOTE_ADDR'] ) ? $_SERVER['REMOTE_ADDR'] : null;

/**
 * テストアサーション
 */
function assert_test( $label, $condition, &$all_passed, &$test_count, &$pass_count ) {
	$test_count++;
	if ( $condition ) {
		$pass_count++;
		echo "[OK] $label\n";
	} else {
		echo "[FAIL] $label\n";
		$all_passed = false;
	}
}

/**
 * DB 接続チェック（ソケットレベル）
 *
 * $wpdb->query() は接続失敗時に wp_die() を呼び PHP プロセスを終了するため、
 * WordPress API を使わずにソケット接続で判定する。
 */
function is_db_available() {
	$host = defined( 'DB_HOST' ) ? DB_HOST : 'localhost';
	$port = 3306;
	if ( strpos( $host, ':' ) !== false ) {
		list( $host, $port ) = explode( ':', $host, 2 );
	}
	$socket = @fsockopen( $host, (int) $port, $errno, $errstr, 2 );
	if ( $socket ) {
		fclose( $socket );
		return true;
	}
	return false;
}

/* ========================================================================
 * MIME 検証用モッククラス
 *
 * CF7 の WPCF7_Validation / WPCF7_FormTag と
 * 同じインターフェースを持つが、CF7 プラグインのクラスとの衝突を避けるために別名で定義。
 * ======================================================================== */

class Test_CF7_Validation {
	private $valid   = true;
	private $message = '';

	public function is_valid( $name ) {
		return $this->valid;
	}

	public function invalidate( $tag, $message ) {
		$this->valid   = false;
		$this->message = $message;
	}

	public function is_still_valid() {
		return $this->valid;
	}

	public function get_message() {
		return $this->message;
	}
}

class Test_CF7_FormTag {
	public $name;

	public function __construct( $name = 'file-upload' ) {
		$this->name = $name;
	}
}

class Test_CF7_Submission {
	public $response = '';

	public function set_response( $message ) {
		$this->response = $message;
	}
}

class Test_CF7_ContactForm {
	private $id;

	public function __construct( $id = 999 ) {
		$this->id = $id;
	}

	public function id() {
		return $this->id;
	}
}

/* ========================================================================
 * 1. MIME 許可リスト検証
 * ======================================================================== */

echo "\n--- 1. MIME 許可リスト検証 ---\n\n";

$allowed = muashi_cf7_get_allowed_mime_types();

assert_test(
	'全10拡張子が定義されている（pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png）',
	count( $allowed ) === 10,
	$all_passed, $test_count, $pass_count
);

// PDF
assert_test(
	'pdf: application/pdf が許可',
	in_array( 'application/pdf', $allowed['pdf'], true ),
	$all_passed, $test_count, $pass_count
);

// OOXML — 内部的に ZIP アーカイブ
assert_test(
	'docx: application/zip が許可（OOXML は ZIP コンテナ）',
	in_array( 'application/zip', $allowed['docx'], true ),
	$all_passed, $test_count, $pass_count
);
assert_test(
	'xlsx: application/zip が許可',
	in_array( 'application/zip', $allowed['xlsx'], true ),
	$all_passed, $test_count, $pass_count
);
assert_test(
	'pptx: application/zip が許可',
	in_array( 'application/zip', $allowed['pptx'], true ),
	$all_passed, $test_count, $pass_count
);

// Legacy Office
assert_test(
	'doc: application/msword が許可',
	in_array( 'application/msword', $allowed['doc'], true ),
	$all_passed, $test_count, $pass_count
);
assert_test(
	'xls: application/vnd.ms-excel が許可',
	in_array( 'application/vnd.ms-excel', $allowed['xls'], true ),
	$all_passed, $test_count, $pass_count
);
assert_test(
	'ppt: application/vnd.ms-powerpoint が許可',
	in_array( 'application/vnd.ms-powerpoint', $allowed['ppt'], true ),
	$all_passed, $test_count, $pass_count
);

// レガシー Office の octet-stream は許可リストに含まず、OLE2 マジックバイト検証で別途処理する設計
	assert_test(
		'doc: application/octet-stream は許可リスト外（OLE2 マジックバイト検証で別途処理）',
		! in_array( 'application/octet-stream', $allowed['doc'], true ),
		$all_passed, $test_count, $pass_count
	);
	assert_test(
		'xls: application/octet-stream は許可リスト外（OLE2 マジックバイト検証で別途処理）',
		! in_array( 'application/octet-stream', $allowed['xls'], true ),
		$all_passed, $test_count, $pass_count
	);
	assert_test(
		'ppt: application/octet-stream は許可リスト外（OLE2 マジックバイト検証で別途処理）',
		! in_array( 'application/octet-stream', $allowed['ppt'], true ),
	$all_passed, $test_count, $pass_count
);

// Images
assert_test(
	'jpg: image/jpeg が許可',
	in_array( 'image/jpeg', $allowed['jpg'], true ),
	$all_passed, $test_count, $pass_count
);
assert_test(
	'jpeg: image/jpeg が許可',
	in_array( 'image/jpeg', $allowed['jpeg'], true ),
	$all_passed, $test_count, $pass_count
);
assert_test(
	'png: image/png が許可',
	in_array( 'image/png', $allowed['png'], true ),
	$all_passed, $test_count, $pass_count
);

// 未許可拡張子が含まれていないこと
assert_test(
	'exe は許可リストに含まれない',
	! isset( $allowed['exe'] ),
	$all_passed, $test_count, $pass_count
);
assert_test(
	'zip は許可リストに含まれない',
	! isset( $allowed['zip'] ),
	$all_passed, $test_count, $pass_count
);
assert_test(
	'php は許可リストに含まれない',
	! isset( $allowed['php'] ),
	$all_passed, $test_count, $pass_count
);

/* ========================================================================
 * 2. MIME 実体検証（finfo テスト）
 * ======================================================================== */

echo "\n--- 2. MIME 実体検証（finfo テスト） ---\n\n";

if ( ! function_exists( 'finfo_open' ) ) {
	echo "[SKIP] finfo 拡張が利用不可（このセクションの 10 テストをスキップ）\n";
	$skip_count += 10;
} else {
	$tmp_dir    = sys_get_temp_dir();
	$test_files = array();
	$tmp_bases  = array(); // tempnam で生成したベースファイル（cleanup用）

	// --- テスト用ファイル生成
	// tempnam でユニーク名を生成し、拡張子付きコピーを作成する
	// （並行実行時の固定パス衝突を防ぐため）

	// 正規 PDF（%PDF- マジックバイト）
	$tmp_bases[] = $base = tempnam( $tmp_dir, 'cf7_' );
	$test_files['valid_pdf'] = $base . '.pdf';
	file_put_contents( $test_files['valid_pdf'], "%PDF-1.4 test content\n%%EOF" );

	// 正規 JPEG（FFD8FF マジックバイト）
	$tmp_bases[] = $base = tempnam( $tmp_dir, 'cf7_' );
	$test_files['valid_jpg'] = $base . '.jpg';
	file_put_contents( $test_files['valid_jpg'], "\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00" );

	// 正規 PNG（89504E47 マジックバイト）
	$tmp_bases[] = $base = tempnam( $tmp_dir, 'cf7_' );
	$test_files['valid_png'] = $base . '.png';
	file_put_contents( $test_files['valid_png'], "\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01" );

	// 偽装 PDF（テキスト内容を .pdf 拡張子で保存）
	$tmp_bases[] = $base = tempnam( $tmp_dir, 'cf7_' );
	$test_files['spoofed_pdf'] = $base . '.pdf';
	file_put_contents( $test_files['spoofed_pdf'], "This is plain text, not a PDF file." );

	// 未許可拡張子（.exe）
	$tmp_bases[] = $base = tempnam( $tmp_dir, 'cf7_' );
	$test_files['exe_file'] = $base . '.exe';
	file_put_contents( $test_files['exe_file'], "MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xFF\xFF" );


	// --- テスト実行 ---

	// 正規 PDF → パス
	$result = new Test_CF7_Validation();
	$tag    = new Test_CF7_FormTag();
	muashi_cf7_validate_file_mime( $result, $tag, array( 'uploaded_files' => array( $test_files['valid_pdf'] ) ) );
	assert_test(
		'正規 PDF ファイル → パス',
		$result->is_still_valid(),
		$all_passed, $test_count, $pass_count
	);

	// 正規 JPEG → パス
	$result = new Test_CF7_Validation();
	$tag    = new Test_CF7_FormTag();
	muashi_cf7_validate_file_mime( $result, $tag, array( 'uploaded_files' => array( $test_files['valid_jpg'] ) ) );
	assert_test(
		'正規 JPEG ファイル → パス',
		$result->is_still_valid(),
		$all_passed, $test_count, $pass_count
	);

	// 正規 PNG → パス
	$result = new Test_CF7_Validation();
	$tag    = new Test_CF7_FormTag();
	muashi_cf7_validate_file_mime( $result, $tag, array( 'uploaded_files' => array( $test_files['valid_png'] ) ) );
	assert_test(
		'正規 PNG ファイル → パス',
		$result->is_still_valid(),
		$all_passed, $test_count, $pass_count
	);

	// 偽装 PDF（テキスト→.pdf）→ ブロック
	$result = new Test_CF7_Validation();
	$tag    = new Test_CF7_FormTag();
	muashi_cf7_validate_file_mime( $result, $tag, array( 'uploaded_files' => array( $test_files['spoofed_pdf'] ) ) );
	assert_test(
		'偽装 PDF（テキスト内容を .pdf にリネーム）→ ブロック',
		! $result->is_still_valid(),
		$all_passed, $test_count, $pass_count
	);
	assert_test(
		'偽装 PDF ブロック時のエラーメッセージが正しい',
		$result->get_message() === 'ファイルの内容が拡張子と一致しません。正しいファイルを選択してください。',
		$all_passed, $test_count, $pass_count
	);

	// 未許可拡張子 → ブロック
	$result = new Test_CF7_Validation();
	$tag    = new Test_CF7_FormTag();
	muashi_cf7_validate_file_mime( $result, $tag, array( 'uploaded_files' => array( $test_files['exe_file'] ) ) );
	assert_test(
		'未許可拡張子（.exe）→ ブロック',
		! $result->is_still_valid(),
		$all_passed, $test_count, $pass_count
	);
	assert_test(
		'未許可拡張子ブロック時のエラーメッセージが正しい',
		$result->get_message() === 'このファイル形式はアップロードできません。',
		$all_passed, $test_count, $pass_count
	);

	// 空のアップロード → パス（バリデーション不要）
	$result = new Test_CF7_Validation();
	$tag    = new Test_CF7_FormTag();
	muashi_cf7_validate_file_mime( $result, $tag, array( 'uploaded_files' => array() ) );
	assert_test(
		'空のアップロード → パス（バリデーションスキップ）',
		$result->is_still_valid(),
		$all_passed, $test_count, $pass_count
	);

	// args なし → パス
	$result = new Test_CF7_Validation();
	$tag    = new Test_CF7_FormTag();
	muashi_cf7_validate_file_mime( $result, $tag );
	assert_test(
		'args 未指定 → パス（バリデーションスキップ）',
		$result->is_still_valid(),
		$all_passed, $test_count, $pass_count
	);

	// 存在しないファイルパス → スキップ（パス）
	$result = new Test_CF7_Validation();
	$tag    = new Test_CF7_FormTag();
	muashi_cf7_validate_file_mime( $result, $tag, array( 'uploaded_files' => array( '/tmp/nonexistent_file_12345.pdf' ) ) );
	assert_test(
		'存在しないファイル → スキップ（パス）',
		$result->is_still_valid(),
		$all_passed, $test_count, $pass_count
	);

	// クリーンアップ（拡張子付きファイルとtempnamベースファイルを両方削除）
	foreach ( $test_files as $path ) {
		if ( file_exists( $path ) ) {
			@unlink( $path );
		}
	}
	foreach ( $tmp_bases as $base ) {
		if ( file_exists( $base ) ) {
			@unlink( $base );
		}
	}
}

/* ========================================================================
 * 3. IP 取得ヘルパー検証（DB 不要）
 * ======================================================================== */

echo "\n--- 3. IP 取得ヘルパー検証 ---\n\n";

// REMOTE_ADDR 未設定 → 空文字
unset( $_SERVER['REMOTE_ADDR'] );
assert_test(
	'REMOTE_ADDR 未設定 → 空文字',
	muashi_cf7_get_client_ip() === '',
	$all_passed, $test_count, $pass_count
);

// REMOTE_ADDR 空文字 → 空文字
$_SERVER['REMOTE_ADDR'] = '';
assert_test(
	'REMOTE_ADDR 空文字 → 空文字',
	muashi_cf7_get_client_ip() === '',
	$all_passed, $test_count, $pass_count
);

// パブリック IP → そのまま返る
$_SERVER['REMOTE_ADDR'] = '8.8.8.8';
assert_test(
	'パブリック IP (8.8.8.8) → そのまま返る',
	muashi_cf7_get_client_ip() === '8.8.8.8',
	$all_passed, $test_count, $pass_count
);

// 別のパブリック IP
$_SERVER['REMOTE_ADDR'] = '1.1.1.1';
assert_test(
	'パブリック IP (1.1.1.1) → そのまま返る',
	muashi_cf7_get_client_ip() === '1.1.1.1',
	$all_passed, $test_count, $pass_count
);

// 不正な文字列 → 空文字
$_SERVER['REMOTE_ADDR'] = 'not-an-ip';
assert_test(
	'不正な文字列 → 空文字',
	muashi_cf7_get_client_ip() === '',
	$all_passed, $test_count, $pass_count
);

// XSS 試行 → 空文字
$_SERVER['REMOTE_ADDR'] = '<script>alert(1)</script>';
assert_test(
	'XSS 文字列 → 空文字（filter_var で除外）',
	muashi_cf7_get_client_ip() === '',
	$all_passed, $test_count, $pass_count
);

// SQL インジェクション試行 → 空文字
$_SERVER['REMOTE_ADDR'] = "1.1.1.1' OR '1'='1";
assert_test(
	'SQLi 文字列 → 空文字（filter_var で除外）',
	muashi_cf7_get_client_ip() === '',
	$all_passed, $test_count, $pass_count
);

// IPv6 ループバック → 空文字（予約済み IP）
$_SERVER['REMOTE_ADDR'] = '::1';
assert_test(
	'IPv6 ループバック (::1) → 空文字（予約済み IP）',
	muashi_cf7_get_client_ip() === '',
	$all_passed, $test_count, $pass_count
);

// プライベート IP — WP_ENVIRONMENT_TYPE 定数に応じて結果が変わる
$_SERVER['REMOTE_ADDR'] = '192.168.1.1';
$result_private = muashi_cf7_get_client_ip();
if ( defined( 'WP_ENVIRONMENT_TYPE' ) && in_array( WP_ENVIRONMENT_TYPE, array( 'local', 'development' ), true ) ) {
	assert_test(
		'プライベート IP (ローカル環境) → 許可される',
		$result_private === '192.168.1.1',
		$all_passed, $test_count, $pass_count
	);
} else {
	assert_test(
		'プライベート IP (本番相当環境) → 拒否される',
		$result_private === '',
		$all_passed, $test_count, $pass_count
	);
}

/* ========================================================================
 * 4. レート制限ロジック検証（DB 接続必須）
 * ======================================================================== */

echo "\n--- 4. レート制限ロジック検証 ---\n\n";

$db_available = is_db_available();

if ( ! $db_available ) {
	echo "[SKIP] DB 接続不可のためレート制限テストをスキップ（Local by Flywheel シェルから実行してください）\n";
	// このセクションには 9 テストが含まれる
	$skip_count += 9;
} else {
	// muashi_cf7_rate_limit は $contact_form->id() でフォーム別にレート制限を分離する
	$test_form_id       = 999;
	$contact_form       = new Test_CF7_ContactForm( $test_form_id );
	$_SERVER['REMOTE_ADDR'] = '8.8.8.8';
	$test_transient_key = 'muashi_cf7_rl_' . md5( '8.8.8.8' . '_' . $test_form_id );

	// 既存 transient をクリーンアップ
	delete_transient( $test_transient_key );

	$submission = new Test_CF7_Submission();

	// 1〜3回目: 送信成功（abort=false のまま）
	for ( $i = 1; $i <= 3; $i++ ) {
		$abort               = false;
		$submission->response = '';
		muashi_cf7_rate_limit( $contact_form, $abort, $submission );
		assert_test(
			"レート制限: {$i}回目 → 送信成功（abort=false）",
			$abort === false,
			$all_passed, $test_count, $pass_count
		);
	}

	// 4回目: ブロック
	$abort               = false;
	$submission->response = '';
	muashi_cf7_rate_limit( $contact_form, $abort, $submission );
	assert_test(
		'レート制限: 4回目 → ブロック（abort=true）',
		$abort === true,
		$all_passed, $test_count, $pass_count
	);
	assert_test(
		'レート制限: ブロック時にエラーメッセージが設定される',
		strpos( $submission->response, '送信回数の上限' ) !== false,
		$all_passed, $test_count, $pass_count
	);

	// 5回目: 引き続きブロック
	$abort               = false;
	$submission->response = '';
	muashi_cf7_rate_limit( $contact_form, $abort, $submission );
	assert_test(
		'レート制限: 5回目 → 引き続きブロック',
		$abort === true,
		$all_passed, $test_count, $pass_count
	);

	// transient 削除後: 再送信可能
	delete_transient( $test_transient_key );
	$abort               = false;
	$submission->response = '';
	muashi_cf7_rate_limit( $contact_form, $abort, $submission );
	assert_test(
		'レート制限: transient クリア後 → 再送信可能（abort=false）',
		$abort === false,
		$all_passed, $test_count, $pass_count
	);

	// transient カウンターが正しくインクリメントされていることを確認
	$stored = (int) get_transient( $test_transient_key );
	assert_test(
		'レート制限: transient カウンター = 1（再送信後）',
		$stored === 1,
		$all_passed, $test_count, $pass_count
	);

	// IP が空の場合: レート制限スキップ
	delete_transient( $test_transient_key );
	unset( $_SERVER['REMOTE_ADDR'] );
	$abort               = false;
	$submission->response = '';
	muashi_cf7_rate_limit( $contact_form, $abort, $submission );
	assert_test(
		'レート制限: IP 取得不可 → スキップ（abort=false）',
		$abort === false,
		$all_passed, $test_count, $pass_count
	);

	// クリーンアップ
	$_SERVER['REMOTE_ADDR'] = '8.8.8.8';
	delete_transient( $test_transient_key );
}

/* ========================================================================
 * $_SERVER['REMOTE_ADDR'] 復元
 * ======================================================================== */

if ( $original_remote_addr !== null ) {
	$_SERVER['REMOTE_ADDR'] = $original_remote_addr;
} else {
	unset( $_SERVER['REMOTE_ADDR'] );
}

/* ========================================================================
 * Summary
 * ======================================================================== */

echo "\n========================================\n";
echo "SUMMARY: $pass_count / $test_count passed";
if ( $skip_count > 0 ) {
	echo " ($skip_count test(s) skipped)";
}
echo "\n========================================\n";

if ( $all_passed ) {
	echo "PASS: All tests passed!\n";
	echo "========================================\n";
	exit( 0 );
} else {
	echo "FAIL: Some tests failed\n";
	echo "========================================\n";
	exit( 1 );
}
