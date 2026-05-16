<?php

require __DIR__ . '/wp-stubs.php';
require __DIR__ . '/../wp-content/plugins/designinserter/designinserter.php';

function assert_true( $condition, $message ) {
	if ( ! $condition ) {
		fwrite( STDERR, "Assertion failed: {$message}\n" );
		exit( 1 );
	}
}

$state = designinserter_stub_state();
assert_true( isset( $state['shortcodes']['designinserter_part'] ), 'plugin registers shortcode on load' );
assert_true( isset( $state['actions']['init'] ), 'plugin registers init hook on load' );
assert_true( isset( $state['actions']['rest_api_init'] ), 'plugin registers REST hook on load' );
assert_true( isset( $state['actions']['admin_menu'] ), 'plugin registers admin menu hook on load' );

do_action( 'init' );
do_action( 'rest_api_init' );
do_action( 'admin_menu' );

$state = designinserter_stub_state();
assert_true( isset( $state['scripts']['designinserter-frontend'] ), 'init registers frontend script' );
assert_true( isset( $state['styles']['designinserter-frontend'] ), 'init registers frontend style' );
assert_true( isset( $state['scripts']['designinserter-editor'] ), 'init registers editor script' );
assert_true( isset( $state['styles']['designinserter-editor'] ), 'init registers editor style' );
assert_true( isset( $state['blocks']['designinserter/css-part'] ), 'init registers dynamic block' );
assert_true( isset( $state['localized']['designinserter-editor']['DesignInserterCatalog'] ), 'init localizes editor catalog' );
assert_true( isset( $state['rest_routes']['designinserter/v1']['/parts/(?P<id>[a-z0-9\-]+)'] ), 'REST route is registered' );
assert_true( isset( $state['options_pages']['designinserter'] ), 'admin menu page is registered' );
assert_true( 'manage_options' === $state['options_pages']['designinserter']['capability'], 'admin settings page requires manage_options' );

ob_start();
designinserter_stub_call( $state['options_pages']['designinserter']['callback'] );
$admin_output = ob_get_clean();
assert_true( strpos( $admin_output, '<h1>Design Inserter</h1>' ) !== false, 'admin page callback renders heading' );
assert_true( strpos( $admin_output, '<td>222</td>' ) !== false, 'admin page callback renders catalog count' );
assert_true( strpos( $admin_output, DESIGNINSERTER_SOURCE_URL ) !== false, 'admin page callback renders source URL' );
assert_true( strpos( $admin_output, '[designinserter_part id="heading-1"]' ) !== false, 'admin page callback renders shortcode example' );

do_action( 'wp_enqueue_scripts' );
$state = designinserter_stub_state();
assert_true( ! empty( $state['styles']['designinserter-frontend']['enqueued'] ), 'wp_enqueue_scripts enqueues frontend base style' );

$editor_catalog = $state['localized']['designinserter-editor']['DesignInserterCatalog'];
assert_true( count( $editor_catalog['parts'] ) === 222, 'editor catalog has 222 parts' );
assert_true( $editor_catalog['restUrl'] === 'http://example.test/wp-json/designinserter/v1/parts/', 'editor catalog exposes REST URL' );
assert_true( $editor_catalog['nonce'] === 'test-nonce', 'editor catalog exposes nonce' );

$catalog = designinserter_get_catalog();
assert_true( count( $catalog['parts'] ) === 222, 'catalog has 222 parts' );

$heading = designinserter_render_part( 'heading-1' );
assert_true( strpos( $heading, '<!-- Design Inserter:' ) !== false, 'render includes source comment' );
assert_true( strpos( $heading, '<style data-designinserter-style="heading-1">' ) !== false, 'render includes CSS style tag' );
assert_true( strpos( $heading, 'data-designinserter-id="heading-1"' ) !== false, 'render includes part id attribute' );
assert_true( strpos( $heading, 'aria-label=' ) !== false, 'render includes aria label' );
assert_true( strpos( $heading, 'https://pote-chil.com/css-stock/ja/heading#1' ) !== false, 'render includes source URL' );
$heading_repeat = designinserter_render_part( 'heading-1' );
assert_true( strpos( $heading_repeat, 'data-designinserter-id="heading-1"' ) !== false, 'repeat render still outputs part wrapper' );
assert_true( strpos( $heading_repeat, '<style data-designinserter-style="heading-1">' ) === false, 'repeat render does not duplicate CSS style tag' );

assert_true( designinserter_render_part( 'nonexistent' ) === '', 'invalid id renders empty string' );
assert_true( designinserter_get_part( 'Heading-1!!' )['id'] === 'heading-1', 'sanitize_key normalizes ids' );

$modal_render_1 = designinserter_render_part( 'modal-1' );
$modal_render_2 = designinserter_render_part( 'modal-1' );
preg_match( '/<input[^>]+\bid="([^"]+)"/', $modal_render_1, $modal_id_1 );
preg_match( '/<label[^>]+\bfor="([^"]+)"/', $modal_render_1, $modal_for_1 );
preg_match( '/<input[^>]+\bname="([^"]+)"/', $modal_render_1, $modal_name_1 );
preg_match( '/<input[^>]+\bid="([^"]+)"/', $modal_render_2, $modal_id_2 );
assert_true( isset( $modal_id_1[1], $modal_for_1[1] ) && $modal_id_1[1] === $modal_for_1[1], 'interactive id/for attributes are scoped consistently' );
assert_true( isset( $modal_name_1[1] ) && strpos( $modal_name_1[1], 'modal-1__trigger__di-modal-1-' ) === 0, 'interactive name attributes are scoped' );
assert_true( isset( $modal_id_2[1] ) && $modal_id_1[1] !== $modal_id_2[1], 'multiple interactive renders receive unique scoped ids' );
assert_true( strpos( $modal_render_1, 'id="modal-1__open"' ) === false, 'interactive raw ids are not left unscoped' );

$embedded_render = designinserter_render_part( 'box-2' );
assert_true( strpos( $embedded_render, 'src="assets/embedded/' ) === false, 'render resolves embedded asset src values' );
assert_true( strpos( $embedded_render, DESIGNINSERTER_PLUGIN_URL . 'assets/embedded/css-stock-img-about-coding.svg' ) !== false, 'render resolves embedded asset URLs to plugin URL' );

$svg_only = null;
$form_part = null;
foreach ( $catalog['parts'] as $part ) {
	if ( null === $svg_only && isset( $part['css'] ) && '' === trim( $part['css'] ) ) {
		$svg_only = $part;
	}

	if ( null === $form_part && isset( $part['html'] ) && false !== strpos( $part['html'], '<input' ) ) {
		$form_part = $part;
	}
}

assert_true( null !== $svg_only, 'catalog has an SVG-only part' );
$svg_render = designinserter_render_part( $svg_only['id'] );
assert_true( strpos( $svg_render, '<style data-designinserter-style=' ) === false, 'SVG-only part omits style tag' );

assert_true( null !== $form_part, 'catalog has a form/input part' );
$form_render = designinserter_render_part( $form_part['id'] );
assert_true( strpos( $form_render, '<input' ) !== false, 'form/input HTML is not stripped' );

$shortcode_render = do_shortcode( sprintf( '[designinserter_part id="%s"]', $svg_only['id'] ) );
assert_true( strpos( $shortcode_render, sprintf( 'data-designinserter-id="%s"', $svg_only['id'] ) ) !== false, 'do_shortcode uses registered shortcode renderer' );
assert_true( strpos( $shortcode_render, sprintf( '<style data-designinserter-style="%s"', $svg_only['id'] ) ) === false, 'shortcode render keeps SVG-only style omission' );

$block_render = do_blocks( '<!-- wp:designinserter/css-part {"partId":"heading-2"} /-->' );
assert_true( strpos( $block_render, 'data-designinserter-id="heading-2"' ) !== false, 'do_blocks uses registered dynamic block renderer' );
assert_true( strpos( $block_render, '<style data-designinserter-style="heading-2">' ) !== false, 'dynamic block render includes CSS style tag' );

$content_render = apply_filters( 'the_content', "[designinserter_part id=\"heading-4\"]\n<!-- wp:designinserter/css-part {\"partId\":\"heading-5\"} /-->" );
assert_true( strpos( $content_render, 'data-designinserter-id="heading-4"' ) !== false, 'the_content filter renders shortcode' );
assert_true( strpos( $content_render, 'data-designinserter-id="heading-5"' ) !== false, 'the_content filter renders dynamic block' );

$behavior_render = designinserter_render_part( 'tooltip-1' );
assert_true( strpos( $behavior_render, 'data-designinserter-behavior="tooltip"' ) !== false, 'behavior metadata is rendered' );
$state = designinserter_stub_state();
assert_true( ! empty( $state['scripts']['designinserter-frontend']['enqueued'] ), 'JS behavior enqueues frontend script' );
assert_true( ! empty( $state['styles']['designinserter-frontend']['enqueued'] ), 'JS behavior enqueues frontend style' );

$route = $state['rest_routes']['designinserter/v1']['/parts/(?P<id>[a-z0-9\-]+)'];
assert_true( 'GET' === $route['methods'], 'REST route uses GET only' );
assert_true( isset( $route['args']['id']['required'] ) && true === $route['args']['id']['required'], 'REST route requires id parameter' );
assert_true( isset( $route['args']['id']['sanitize_callback'] ) && 'sanitize_key' === $route['args']['id']['sanitize_callback'], 'REST route sanitizes id parameter' );
assert_true( designinserter_stub_call( $route['permission_callback'] ) === true, 'REST permission callback allows editors' );
$state = designinserter_stub_state();
assert_true( in_array( 'edit_posts', $state['capability_checks'], true ), 'REST permission callback checks edit_posts capability' );
designinserter_stub_set_current_user_can( false );
assert_true( designinserter_stub_call( $route['permission_callback'] ) === false, 'REST permission callback rejects users without edit_posts' );
designinserter_stub_set_current_user_can( true );
$rest_part = designinserter_stub_call( $route['callback'], array( array( 'id' => 'heading-3' ) ) );
assert_true( isset( $rest_part['id'] ) && 'heading-3' === $rest_part['id'], 'REST callback returns requested part' );
assert_true( isset( $rest_part['html'], $rest_part['css'] ), 'REST callback returns html and css' );
$rest_box = designinserter_stub_call( $route['callback'], array( array( 'id' => 'box-2' ) ) );
assert_true( strpos( $rest_box['html'], 'src="assets/embedded/' ) === false, 'REST callback resolves embedded asset src values' );
assert_true( strpos( $rest_box['html'], DESIGNINSERTER_PLUGIN_URL . 'assets/embedded/css-stock-img-about-coding.svg' ) !== false, 'REST callback resolves embedded asset URLs to plugin URL' );
$rest_modal = designinserter_stub_call( $route['callback'], array( array( 'id' => 'modal-1' ) ) );
preg_match( '/<input[^>]+\bid="([^"]+)"/', $rest_modal['html'], $rest_modal_id );
preg_match( '/<label[^>]+\bfor="([^"]+)"/', $rest_modal['html'], $rest_modal_for );
preg_match( '/<input[^>]+\bname="([^"]+)"/', $rest_modal['html'], $rest_modal_name );
assert_true( isset( $rest_modal_id[1], $rest_modal_for[1] ) && $rest_modal_id[1] === $rest_modal_for[1], 'REST callback scopes interactive id/for attributes consistently' );
assert_true( isset( $rest_modal_name[1] ) && strpos( $rest_modal_name[1], 'modal-1__trigger__di-preview-modal-1-' ) === 0, 'REST callback scopes interactive name attributes' );
assert_true( strpos( $rest_modal['html'], 'id="modal-1__open"' ) === false, 'REST callback does not leave raw interactive ids unscoped' );
$rest_missing = designinserter_stub_call( $route['callback'], array( array( 'id' => 'missing-part' ) ) );
assert_true( $rest_missing instanceof WP_Error && 'not_found' === $rest_missing->code, 'REST callback returns WP_Error for missing part' );

$rest_request = new WP_REST_Request( 'GET', '/designinserter/v1/parts/heading-6' );
$rest_dispatch = rest_do_request( $rest_request );
assert_true( isset( $rest_dispatch['id'] ) && 'heading-6' === $rest_dispatch['id'], 'rest_do_request dispatches registered route' );
designinserter_stub_set_current_user_can( false );
$rest_forbidden = rest_do_request( new WP_REST_Request( 'GET', '/designinserter/v1/parts/heading-6' ) );
assert_true( $rest_forbidden instanceof WP_Error && 'rest_forbidden' === $rest_forbidden->code && 403 === $rest_forbidden->data['status'], 'rest_do_request returns 403 WP_Error when permission is denied' );
designinserter_stub_set_current_user_can( true );

echo "WordPress stub smoke passed\n";
