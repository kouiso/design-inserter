<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function designinserter_get_catalog_path() {
	return DESIGNINSERTER_PLUGIN_DIR . 'data/css-stock-parts.json';
}

function designinserter_get_catalog() {
	static $catalog = null;

	if ( null !== $catalog ) {
		return $catalog;
	}

	$path = designinserter_get_catalog_path();
	if ( ! file_exists( $path ) ) {
		$catalog = array(
			'parts'      => array(),
			'categories' => array(),
			'sourceUrl'  => DESIGNINSERTER_SOURCE_URL,
		);
		return $catalog;
	}

	$decoded = json_decode( file_get_contents( $path ), true );
	if ( ! is_array( $decoded ) ) {
		$decoded = array();
	}

	$catalog = array(
		'parts'      => isset( $decoded['parts'] ) && is_array( $decoded['parts'] ) ? $decoded['parts'] : array(),
		'categories' => isset( $decoded['categories'] ) && is_array( $decoded['categories'] ) ? $decoded['categories'] : array(),
		'sourceUrl'  => isset( $decoded['sourceUrl'] ) ? $decoded['sourceUrl'] : DESIGNINSERTER_SOURCE_URL,
		'scrapedAt'  => isset( $decoded['scrapedAt'] ) ? $decoded['scrapedAt'] : '',
	);

	return $catalog;
}

function designinserter_get_parts() {
	$catalog = designinserter_get_catalog();
	return $catalog['parts'];
}

function designinserter_get_editor_catalog() {
	$catalog = designinserter_get_catalog();
	$items = array();

	foreach ( $catalog['parts'] as $part ) {
		$items[] = array(
			'id'            => $part['id'],
			'title'         => isset( $part['title'] ) ? $part['title'] : $part['id'],
			'categoryLabel' => isset( $part['categoryLabel'] ) ? $part['categoryLabel'] : '',
			'previewImage'  => isset( $part['previewImage'] ) ? $part['previewImage'] : '',
		);
	}

	return array(
		'parts'   => $items,
		'restUrl' => rest_url( 'designinserter/v1/parts/' ),
		'nonce'   => wp_create_nonce( 'wp_rest' ),
	);
}

function designinserter_get_part( $part_id ) {
	$part_id = sanitize_key( $part_id );

	foreach ( designinserter_get_parts() as $part ) {
		if ( isset( $part['id'] ) && $part['id'] === $part_id ) {
			return $part;
		}
	}

	return null;
}
