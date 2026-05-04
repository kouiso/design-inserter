<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function designinserter_register_block() {
	wp_register_script(
		'designinserter-editor',
		DESIGNINSERTER_PLUGIN_URL . 'assets/editor.js',
		array( 'wp-blocks', 'wp-element', 'wp-components', 'wp-block-editor', 'wp-i18n' ),
		DESIGNINSERTER_VERSION,
		true
	);

	wp_register_style(
		'designinserter-editor',
		DESIGNINSERTER_PLUGIN_URL . 'assets/editor.css',
		array(),
		DESIGNINSERTER_VERSION
	);

	wp_localize_script(
		'designinserter-editor',
		'DesignInserterCatalog',
		designinserter_get_editor_catalog()
	);

	register_block_type(
		'designinserter/css-part',
		array(
			'api_version'   => 2,
			'editor_script' => 'designinserter-editor',
			'editor_style'  => 'designinserter-editor',
			'attributes'    => array(
				'partId' => array(
					'type'    => 'string',
					'default' => '',
				),
			),
			'render_callback' => 'designinserter_render_block',
		)
	);
}
add_action( 'init', 'designinserter_register_block' );

function designinserter_render_block( $attributes ) {
	$part_id = isset( $attributes['partId'] ) ? $attributes['partId'] : '';
	return designinserter_render_part( $part_id );
}
