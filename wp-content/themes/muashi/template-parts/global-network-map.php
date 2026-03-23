<?php
/**
 * グローバルネットワーク世界地図（クリッカブルSVG）
 *
 * 各マーカーをクリックすると対応するglobalnetwork投稿ページに遷移する
 */
?>
<div class="global-map" data-testid="global-network-map">
	<?php $svg_ver = filemtime( get_stylesheet_directory() . '/assets/img/global-network/world-map.svg' ) . '.' . time(); ?>
	<object
		data="<?php echo esc_url( get_stylesheet_directory_uri() . '/assets/img/global-network/world-map.svg?v=' . $svg_ver ); ?>"
		type="image/svg+xml"
		class="global-map__object"
		aria-label="<?php echo esc_attr( '武蔵塗料グループ グローバル生産拠点マップ' ); ?>"
	>
		<img
			src="<?php echo esc_url( get_stylesheet_directory_uri() . '/assets/img/global-network/world-map.svg' ); ?>"
			alt="<?php echo esc_attr( 'グローバル生産拠点マップ' ); ?>"
			class="global-map__fallback"
		>
	</object>
</div>
