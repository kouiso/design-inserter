<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function designinserter_render_part( $part_id ) {
	$part = designinserter_get_part( $part_id );
	if ( ! $part ) {
		return '';
	}

	$id     = esc_attr( $part['id'] );
	$title  = isset( $part['title'] ) ? esc_html( $part['title'] ) : $id;
	$html   = isset( $part['html'] ) ? $part['html'] : '';
	$css    = isset( $part['css'] ) ? $part['css'] : '';
	$source = isset( $part['sourceUrl'] ) ? esc_url( $part['sourceUrl'] ) : esc_url( DESIGNINSERTER_SOURCE_URL );

	return sprintf(
		"\n<!-- Design Inserter: %s | Source: %s -->\n<style data-designinserter-style=\"%s\">\n%s\n</style>\n<div class=\"designinserter-part\" data-designinserter-id=\"%s\" aria-label=\"%s\">\n%s\n</div>\n",
		esc_html( $title ),
		$source,
		$id,
		$css,
		$id,
		$title,
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
