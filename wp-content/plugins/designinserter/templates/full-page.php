<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$bundle_dir_meta = get_post_meta( get_the_ID(), '_di_template_bundle_dir', true );
$bundle_dir_safe = sanitize_key( $bundle_dir_meta );
$index_path      = DESIGNINSERTER_PLUGIN_DIR . 'data/template-party-bundles/' . $bundle_dir_safe . '/index.html';

if ( $bundle_dir_safe && file_exists( $index_path ) ) {
	$base_url = DESIGNINSERTER_PLUGIN_URL . 'data/template-party-bundles/' . $bundle_dir_safe . '/';
	$html     = file_get_contents( $index_path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
	$html     = preg_replace(
		'/(<head[^>]*>)/i',
		'$1<base href="' . esc_url( $base_url ) . '">',
		$html,
		1
	);
	echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
} else {
	$template_id = get_post_meta( get_the_ID(), '_di_template_id', true );
	$template    = designinserter_get_template( sanitize_key( $template_id ) );

	if ( $template && ! empty( $template['demoUrl'] ) ) {
		wp_redirect( esc_url_raw( $template['demoUrl'] ) );
		exit;
	}

	wp_die(
		esc_html__( 'Template bundle not found. Please run the scraper to download template files.', 'designinserter' ),
		esc_html__( 'Template Not Found', 'designinserter' ),
		array( 'response' => 404 )
	);
}
exit;
