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

		// 見るのは「復号できたか」だけにする。件数が 0 なら復号は出来とるので available は true を返し、
		// 中身の妥当性は各テストの件数アサーションに落とす。ここで空を locked 扱いにすると、
		// カタログが空へ退行したときに skip されて黙って緑になる。
		$required = array(
			__DIR__ . '/../wp-content/plugins/designinserter/data/template-party-parts.json'     => 'parts',
			__DIR__ . '/../wp-content/plugins/designinserter/data/template-party-templates.json' => 'templates',
		);

		foreach ( $required as $path => $key ) {
			if ( ! is_readable( $path ) ) {
				$available = false;

				return $available;
			}

			$decoded = json_decode( (string) file_get_contents( $path ), true );

			// git-crypt の暗号文は JSON として読めんので decode が null になる。
			if ( ! is_array( $decoded ) || ! array_key_exists( $key, $decoded ) ) {
				$available = false;

				return $available;
			}
		}

		$available = true;

		return $available;
	}
}
