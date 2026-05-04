<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function designinserter_render_part( $part_id ) {
	static $rendered_styles = array();
	static $rendered_instances = 0;

	$part = designinserter_get_part( $part_id );
	if ( ! $part ) {
		return '';
	}

	$id     = esc_attr( $part['id'] );
	$title  = isset( $part['title'] ) ? esc_html( $part['title'] ) : $id;
	$html   = isset( $part['html'] ) ? $part['html'] : '';
	$css    = isset( $part['css'] ) ? $part['css'] : '';
	$source = isset( $part['sourceUrl'] ) ? esc_url( $part['sourceUrl'] ) : esc_url( DESIGNINSERTER_SOURCE_URL );
	$rendered_instances++;
	$scope = sprintf( 'di-%s-%d', $id, $rendered_instances );
	$html  = designinserter_scope_interactive_html( $html, $scope );

	$style = '';
	if ( '' !== trim( $css ) && ! isset( $rendered_styles[ $id ] ) ) {
		$style = sprintf( "<style data-designinserter-style=\"%s\">\n%s\n</style>\n", $id, $css );
		$rendered_styles[ $id ] = true;
	}

	return sprintf(
		"\n<!-- Design Inserter: %s | Source: %s -->\n%s<div class=\"designinserter-part\" data-designinserter-id=\"%s\" aria-label=\"%s\">\n%s\n</div>\n",
		esc_html( $title ),
		$source,
		$style,
		$id,
		$title,
		$html
	);
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
