<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function designinserter_render_part( $part_id, $html = null, $css = null ) {
	static $rendered_styles = array();
	static $rendered_instances = 0;

	// インライン内容が渡された場合もメタデータと挙動情報が必要なため、パーツは常に解決する。
	$part = designinserter_get_part( $part_id );
	if ( ! $part && null === $html && null === $css ) {
		return '';
	}

	$id        = esc_attr( $part ? $part['id'] : $part_id );
	$title_raw = $part ? designinserter_get_part_display_title( $part ) : $part_id;
	$title     = esc_html( $title_raw );
	$html   = null !== $html ? designinserter_resolve_local_asset_urls( wp_kses_post( (string) $html ) ) : ( isset( $part['html'] ) ? designinserter_resolve_local_asset_urls( $part['html'] ) : '' );
	$css    = null !== $css ? designinserter_resolve_local_asset_urls( designinserter_sanitize_inline_css( (string) $css ) ) : ( isset( $part['css'] ) ? designinserter_resolve_local_asset_urls( designinserter_sanitize_inline_css( $part['css'] ) ) : '' );
	$source = $part && isset( $part['sourceUrl'] ) ? esc_url( $part['sourceUrl'] ) : esc_url( DESIGNINSERTER_SOURCE_URL );
	$behavior = $part ? designinserter_get_part_behavior( $part ) : array();
	if ( designinserter_behavior_requires_js( $behavior ) ) {
		designinserter_enqueue_frontend_behavior();
	}

	$rendered_instances++;
	$scope = sprintf( 'di-%s-%d', $id, $rendered_instances );
	$html  = designinserter_scope_interactive_html( $html, $scope );

	$style = '';
	if ( '' !== trim( $css ) && ! isset( $rendered_styles[ $id ] ) ) {
		$style = sprintf( "<style data-designinserter-style=\"%s\">\n%s\n</style>\n", $id, $css );
		$rendered_styles[ $id ] = true;
	}

	$behavior_attr = '';
	if ( ! empty( $behavior['type'] ) ) {
		$behavior_attr = sprintf( ' data-designinserter-behavior="%s"', esc_attr( $behavior['type'] ) );
		if ( ! empty( $behavior['rootSelector'] ) ) {
			$behavior_attr .= sprintf( ' data-designinserter-root-selector="%s"', esc_attr( $behavior['rootSelector'] ) );
		}
	}

	return sprintf(
		"\n<!-- Design Inserter: %s | Source: %s -->\n%s<div class=\"designinserter-part\" data-designinserter-id=\"%s\"%s aria-label=\"%s\">\n%s\n</div>\n",
		esc_html( $title ),
		$source,
		$style,
		$id,
		$behavior_attr,
		esc_attr( $title_raw ),
		$html
	);
}

function designinserter_sanitize_inline_css( $css ) {
	// CSS 内に HTML タグが混入すると <style> ブロックを閉じられてしまうため、タグを除去する。
	return wp_strip_all_tags( $css );
}

function designinserter_resolve_local_asset_urls( $value ) {
	if ( '' === $value || false === strpos( $value, 'assets/' ) ) {
		return $value;
	}

	$base_url = trailingslashit( DESIGNINSERTER_PLUGIN_URL );
	$value = preg_replace_callback(
		'/\b(src|href)=(["\'])(assets\/(?:embedded|previews)\/[^"\']+)\2/',
		function ( $matches ) use ( $base_url ) {
			return sprintf( '%s=%s%s%s', $matches[1], $matches[2], esc_url( $base_url . $matches[3] ), $matches[2] );
		},
		$value
	);

	return preg_replace_callback(
		'/url\(\s*(["\']?)(assets\/(?:embedded|previews)\/[^)"\']+)\1\s*\)/',
		function ( $matches ) use ( $base_url ) {
			return sprintf( 'url("%s")', esc_url( $base_url . $matches[2] ) );
		},
		$value
	);
}

function designinserter_get_part_behavior( $part ) {
	if ( ! isset( $part['behavior'] ) || ! is_array( $part['behavior'] ) ) {
		return array();
	}

	return $part['behavior'];
}

function designinserter_behavior_requires_js( $behavior ) {
	return is_array( $behavior ) && ! empty( $behavior['requiresJs'] );
}

function designinserter_enqueue_frontend_behavior() {
	if ( wp_script_is( 'designinserter-frontend', 'registered' ) ) {
		wp_enqueue_script( 'designinserter-frontend' );
	}

	if ( wp_style_is( 'designinserter-frontend', 'registered' ) ) {
		wp_enqueue_style( 'designinserter-frontend' );
	}
}

function designinserter_scope_interactive_html( $html, $scope ) {
	if ( '' === $html || false === strpos( $html, '=' ) ) {
		return $html;
	}

	$scope = sanitize_html_class( $scope );
	$id_map = array();

	return preg_replace_callback(
		'/\b(id|for|name)=(["\'])([^"\']+)\2/',
		function ( $matches ) use ( $scope, &$id_map ) {
			$attribute = $matches[1];
			$quote     = $matches[2];
			$value     = $matches[3];

			if ( '' === $value ) {
				return $matches[0];
			}

			if ( 'name' === $attribute ) {
				return sprintf( '%s=%s%s__%s%s', $attribute, $quote, $value, $scope, $quote );
			}

			if ( 'id' === $attribute ) {
				$id_map[ $value ] = $value . '__' . $scope;
				return sprintf( '%s=%s%s%s', $attribute, $quote, $id_map[ $value ], $quote );
			}

			$scoped_value = isset( $id_map[ $value ] ) ? $id_map[ $value ] : $value . '__' . $scope;
			return sprintf( '%s=%s%s%s', $attribute, $quote, $scoped_value, $quote );
		},
		$html
	);
}

function designinserter_shortcode( $atts ) {
	$atts = shortcode_atts(
		array(
			'id' => '',
		),
		$atts,
		'designinserter_part'
	);

	return designinserter_render_part( $atts['id'] );
}
add_shortcode( 'designinserter_part', 'designinserter_shortcode' );
add_shortcode( 'designinserter', 'designinserter_shortcode' );
