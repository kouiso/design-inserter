<?php
/**
 * Template Party のカタログは ToS 上の再配布制限があるため git-crypt で暗号化してある。
 * 鍵を持たん環境（外部コントリビュータ・CI の一部）では復号できず、
 * designinserter_get_catalog() は CSS Stock の 222 件だけを返す。
 * 期待値をどちらに合わせるかを実データから判定するために在否を返す。
 */

if ( ! function_exists( 'designinserter_tp_data_available' ) ) {
	/**
	 * @return bool 復号済みの Template Party パーツカタログが読める場合 true
	 */
	function designinserter_tp_data_available() {
		static $available = null;

		if ( null !== $available ) {
			return $available;
		}

		$path = __DIR__ . '/../wp-content/plugins/designinserter/data/template-party-parts.json';

		if ( ! is_readable( $path ) ) {
			$available = false;

			return $available;
		}

		$decoded   = json_decode( (string) file_get_contents( $path ), true );
		$available = is_array( $decoded ) && ! empty( $decoded['parts'] );

		return $available;
	}
}
