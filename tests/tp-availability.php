<?php
/**
 * Template Party のカタログは ToS 上の再配布制限があるため git-crypt で暗号化してある。
 * 鍵を持たん環境（外部コントリビュータ・CI の一部）では復号できず、
 * designinserter_get_catalog() は CSS Stock の 222 件だけを返す。
 * 期待値をどちらに合わせるかを実データから判定するために在否を返す。
 */

if ( ! function_exists( 'designinserter_tp_catalog_file_available' ) ) {
	/**
	 * @param string $path カタログファイルのパス
	 * @param string $key  必須の配列キー
	 * @return bool 復号済みのカタログが読める場合 true
	 */
	function designinserter_tp_catalog_file_available( $path, $key ) {
		if ( ! is_readable( $path ) ) {
			return false;
		}

		$contents = file_get_contents( $path );

		if ( false === $contents ) {
			return false;
		}

		// JSON の壊れ方を locked 扱いにするとデータ退行が skip されるため、git-crypt の署名だけを判定する。
		if ( 0 === strncmp( $contents, "\0GITCRYPT\0", 10 ) ) {
			return false;
		}

		$decoded = json_decode( $contents );

		if ( JSON_ERROR_NONE !== json_last_error() ) {
			throw new UnexpectedValueException(
				sprintf( 'Template Party catalog is malformed JSON: %s (%s)', $path, json_last_error_msg() )
			);
		}

		if ( ! is_object( $decoded ) || ! property_exists( $decoded, $key ) || ! is_array( $decoded->{$key} ) ) {
			throw new UnexpectedValueException(
				sprintf( 'Template Party catalog must contain an array at "%s": %s', $key, $path )
			);
		}

		return true;
	}
}

if ( ! function_exists( 'designinserter_tp_data_available' ) ) {
	/**
	 * @return bool 復号済みの Template Party パーツカタログが読める場合 true
	 */
	function designinserter_tp_data_available() {
		static $available = null;

		if ( null !== $available ) {
			return $available;
		}

		// 見るのは「復号できたか」だけにする。件数が 0 なら復号は出来とるので available は true を返し、
		// 中身の妥当性は各テストの件数アサーションに落とす。ここで空を locked 扱いにすると、
		// カタログが空へ退行したときに skip されて黙って緑になる。
		$required = array(
			__DIR__ . '/../wp-content/plugins/designinserter/data/template-party-parts.json'     => 'parts',
			__DIR__ . '/../wp-content/plugins/designinserter/data/template-party-templates.json' => 'templates',
		);
		$available = true;

		foreach ( $required as $path => $key ) {
			if ( ! designinserter_tp_catalog_file_available( $path, $key ) ) {
				$available = false;
			}
		}

		return $available;
	}
}
