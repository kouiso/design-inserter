<?php
/**
 * グローバルネットワーク世界地図（クリッカブルSVG）
 *
 * 各マーカーをクリックすると対応するglobalnetwork投稿ページに遷移する
 */
?>
<div class="global-map" data-testid="global-network-map">
	<h2 class="global-map__title">Manufacturing Footprint</h2>
	<?php $svg_ver = filemtime( get_stylesheet_directory() . '/assets/img/global-network/world-map.svg' ) . '.' . time(); ?>
	<object
		data="<?php echo esc_url( get_stylesheet_directory_uri() . '/assets/img/global-network/world-map.svg?v=' . $svg_ver ); ?>"
		type="image/svg+xml"
		class="global-map__object"
		aria-label="<?php echo esc_attr( 'Manufacturing Footprint map' ); ?>"
	>
		<img
			src="<?php echo esc_url( get_stylesheet_directory_uri() . '/assets/img/global-network/world-map.svg' ); ?>"
			alt="<?php echo esc_attr( 'Manufacturing Footprint map' ); ?>"
			class="global-map__fallback"
		>
	</object>
</div>
