<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_filter(
	'theme_page_templates',
	function ( $templates ) {
		$templates['designinserter-full-template'] = 'Design Inserter Full Template';
		return $templates;
	}
);

add_filter(
	'template_include',
	function ( $template ) {
		if ( is_singular( 'page' ) && get_page_template_slug() === 'designinserter-full-template' ) {
			$plugin_template = DESIGNINSERTER_PLUGIN_DIR . 'templates/full-page.php';
			if ( file_exists( $plugin_template ) ) {
				return $plugin_template;
			}
		}
		return $template;
	}
);
