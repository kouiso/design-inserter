<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$bundle_dir_meta = get_post_meta( get_the_ID(), '_di_template_bundle_dir', true );
$bundle_dir_safe = designinserter_sanitize_bundle_dir( $bundle_dir_meta );
$index_path      = DESIGNINSERTER_PLUGIN_DIR . 'data/template-party-bundles/' . $bundle_dir_safe . '/index.html';

$bundles_root    = realpath( DESIGNINSERTER_PLUGIN_DIR . 'data/template-party-bundles' );
$index_real      = $bundle_dir_safe ? realpath( $index_path ) : false;
$path_safe       = $bundles_root && $index_real && strpos( $index_real, $bundles_root . DIRECTORY_SEPARATOR ) === 0;

if ( $bundle_dir_safe && $path_safe ) {
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
