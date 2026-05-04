<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function designinserter_register_rest_routes() {
	register_rest_route(
		'designinserter/v1',
		'/parts/(?P<id>[a-z0-9\-]+)',
		array(
			'methods'             => 'GET',
			'callback'            => 'designinserter_rest_get_part',
			'permission_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
			'args'                => array(
				'id' => array(
					'required'          => true,
					'sanitize_callback' => 'sanitize_key',
				),
			),
		)
	);
}
add_action( 'rest_api_init', 'designinserter_register_rest_routes' );

function designinserter_rest_get_part( $request ) {
	$part = designinserter_get_part( $request['id'] );

	if ( ! $part ) {
		return new WP_Error(
			'not_found',
			'Part not found.',
			array( 'status' => 404 )
		);
	}

	return rest_ensure_response( array(
		'id'   => $part['id'],
		'html' => isset( $part['html'] ) ? $part['html'] : '',
		'css'  => isset( $part['css'] ) ? $part['css'] : '',
	) );
}
