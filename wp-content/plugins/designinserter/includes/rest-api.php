<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function designinserter_register_rest_routes() {
	register_rest_route(
		'designinserter/v1',
		'/parts/(?P<id>[a-z0-9_\-]+)',
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

	register_rest_route(
		'designinserter/v1',
		'/templates/(?P<id>[a-z0-9_\-]+)/create-page',
		array(
			'methods'             => 'POST',
			'callback'            => 'designinserter_rest_create_template_page',
			'permission_callback' => function () {
				return current_user_can( 'edit_pages' );
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

	$scope = wp_unique_id( 'di-preview-' . sanitize_key( $part['id'] ) . '-' );
	$html  = isset( $part['html'] ) ? designinserter_scope_interactive_html( designinserter_resolve_local_asset_urls( $part['html'] ), $scope ) : '';

	return rest_ensure_response(
		array(
			'id'   => $part['id'],
			'html' => $html,
			'css'  => isset( $part['css'] ) ? designinserter_resolve_local_asset_urls( $part['css'] ) : '',
		)
	);
}

function designinserter_rest_create_template_page( $request ) {
	$template = designinserter_get_template( $request['id'] );

	if ( ! $template ) {
		return new WP_Error(
			'not_found',
			'Template not found.',
			array( 'status' => 404 )
		);
	}

	$post_id = wp_insert_post(
		array(
			'post_title'  => sanitize_text_field( isset( $template['title'] ) ? $template['title'] : $request['id'] ),
			'post_type'   => 'page',
			'post_status' => 'draft',
			'meta_input'  => array(
				'_wp_page_template'       => 'designinserter-full-template',
				'_di_template_id'         => sanitize_key( $template['id'] ),
				'_di_template_bundle_dir' => designinserter_sanitize_bundle_dir(
					isset( $template['variantId'] ) ? $template['variantId'] : ''
				),
			),
		),
		true
	);

	if ( is_wp_error( $post_id ) ) {
		return $post_id;
	}

	return rest_ensure_response(
		array(
			'page_id'  => $post_id,
			'edit_url' => get_edit_post_link( $post_id, 'raw' ),
		)
	);
}
