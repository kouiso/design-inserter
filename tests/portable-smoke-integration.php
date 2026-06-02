<?php
/**
 * Portable WordPress integration smoke executed via `wp eval-file`.
 *
 * Extracted from scripts/wp-smoke.mjs (previously embedded as a giant
 * JS string) so the PHP can be syntax-highlighted, linted, and debugged
 * as a real PHP file. See follow-up issue #8.
 *
 * Echoes "integration_ok" on success. Any failure writes a diagnostic
 * to STDERR and exits with non-zero status, which wp-smoke.mjs treats
 * as a smoke failure.
 */

if (
    !shortcode_exists('designinserter_part')
    || false === has_action('init', 'designinserter_register_block')
    || false === has_action('wp_enqueue_scripts', 'designinserter_enqueue_frontend_base_styles')
    || false === has_action('rest_api_init', 'designinserter_register_rest_routes')
    || false === has_action('admin_menu', 'designinserter_admin_menu')
) {
    fwrite(STDERR, "hook registration smoke failed\n");
    exit(1);
}

$block_type = WP_Block_Type_Registry::get_instance()->get_registered('designinserter/css-part');
if (!$block_type || !is_callable($block_type->render_callback)) {
    fwrite(STDERR, "block not registered\n");
    exit(1);
}

global $wp_scripts;
$script = $wp_scripts->registered['designinserter-editor'] ?? null;
if (!$script || empty($script->extra['data']) || false === strpos($script->extra['data'], 'DesignInserterCatalog')) {
    fwrite(STDERR, "editor catalog not localized\n");
    exit(1);
}

preg_match('/var DesignInserterCatalog = (.*);/s', $script->extra['data'], $catalog_match);
$localized_catalog = isset($catalog_match[1]) ? json_decode($catalog_match[1], true) : null;
if (
    !is_array($localized_catalog)
    || count($localized_catalog['parts']) !== 222
    || rest_url('designinserter/v1/parts/') !== $localized_catalog['restUrl']
    || empty($localized_catalog['nonce'])
    || 0 !== strpos($localized_catalog['parts'][0]['previewImage'], DESIGNINSERTER_PLUGIN_URL . 'assets/previews/')
) {
    fwrite(STDERR, "editor catalog contract smoke failed\n");
    exit(1);
}

do_action('wp_enqueue_scripts');
if (!wp_style_is('designinserter-frontend', 'enqueued')) {
    fwrite(STDERR, "frontend base style smoke failed\n");
    exit(1);
}

designinserter_render_part('tooltip-1');
if (!wp_script_is('designinserter-frontend', 'enqueued')) {
    fwrite(STDERR, "frontend script not enqueued\n");
    exit(1);
}

$denied_request  = new WP_REST_Request('GET', '/designinserter/v1/parts/heading-3');
$denied_response = rest_do_request($denied_request);
if (!$denied_response->is_error() || !in_array($denied_response->get_status(), [401, 403], true)) {
    fwrite(STDERR, "REST permission smoke failed\n");
    exit(1);
}

wp_set_current_user(1);

$routes        = rest_get_server()->get_routes();
$route_pattern = '/designinserter/v1/parts/(?P<id>[a-z0-9\-]+)';
if (
    empty($routes[$route_pattern][0]['methods']['GET'])
    || empty($routes[$route_pattern][0]['args']['id']['required'])
    || 'sanitize_key' !== $routes[$route_pattern][0]['args']['id']['sanitize_callback']
) {
    fwrite(STDERR, "REST route contract smoke failed\n");
    exit(1);
}

ob_start();
designinserter_admin_page();
$admin_output = ob_get_clean();
if (
    false === strpos($admin_output, '<h1>Design Inserter</h1>')
    || false === strpos($admin_output, '<td>222</td>')
    || false === strpos($admin_output, DESIGNINSERTER_SOURCE_URL)
    || false === strpos($admin_output, '[designinserter_part id="heading-1"]')
) {
    fwrite(STDERR, "admin page smoke failed\n");
    exit(1);
}

$heading_render_1 = designinserter_render_part('heading-1');
$heading_render_2 = designinserter_render_part('heading-1');
if (
    false === strpos($heading_render_1, '<style data-designinserter-style="heading-1">')
    || false !== strpos($heading_render_2, '<style data-designinserter-style="heading-1">')
) {
    fwrite(STDERR, "style dedupe smoke failed\n");
    exit(1);
}

$box_render = designinserter_render_part('box-2');
if (
    false !== strpos($box_render, 'src="assets/embedded/')
    || false === strpos($box_render, DESIGNINSERTER_PLUGIN_URL . 'assets/embedded/css-stock-img-about-coding.svg')
) {
    fwrite(STDERR, "embedded asset render smoke failed\n");
    exit(1);
}

$modal_render_1 = designinserter_render_part('modal-1');
$modal_render_2 = designinserter_render_part('modal-1');
preg_match('/<input[^>]+\bid="([^"]+)"/', $modal_render_1, $modal_id_1);
preg_match('/<label[^>]+\bfor="([^"]+)"/', $modal_render_1, $modal_for_1);
preg_match('/<input[^>]+\bname="([^"]+)"/', $modal_render_1, $modal_name_1);
preg_match('/<input[^>]+\bid="([^"]+)"/', $modal_render_2, $modal_id_2);
if (
    !isset($modal_id_1[1], $modal_for_1[1], $modal_name_1[1], $modal_id_2[1])
    || $modal_id_1[1] !== $modal_for_1[1]
    || 0 !== strpos($modal_name_1[1], 'modal-1__trigger__di-modal-1-')
    || $modal_id_1[1] === $modal_id_2[1]
    || false !== strpos($modal_render_1, 'id="modal-1__open"')
) {
    fwrite(STDERR, "interactive render scoping smoke failed\n");
    exit(1);
}

$request  = new WP_REST_Request('GET', '/designinserter/v1/parts/heading-3');
$response = rest_do_request($request);
$data     = $response->get_data();
if ($response->is_error() || empty($data['id']) || 'heading-3' !== $data['id']) {
    fwrite(STDERR, "REST smoke failed\n");
    exit(1);
}

$modal_request  = new WP_REST_Request('GET', '/designinserter/v1/parts/modal-1');
$modal_response = rest_do_request($modal_request);
$modal_data     = $modal_response->get_data();
preg_match('/<input[^>]+\bid="([^"]+)"/', $modal_data['html'], $rest_modal_id);
preg_match('/<label[^>]+\bfor="([^"]+)"/', $modal_data['html'], $rest_modal_for);
preg_match('/<input[^>]+\bname="([^"]+)"/', $modal_data['html'], $rest_modal_name);
if (
    $modal_response->is_error()
    || !isset($rest_modal_id[1], $rest_modal_for[1], $rest_modal_name[1])
    || $rest_modal_id[1] !== $rest_modal_for[1]
    || 0 !== strpos($rest_modal_name[1], 'modal-1__trigger__di-preview-modal-1-')
    || false !== strpos($modal_data['html'], 'id="modal-1__open"')
) {
    fwrite(STDERR, "REST interactive scoping smoke failed\n");
    exit(1);
}

$box_request  = new WP_REST_Request('GET', '/designinserter/v1/parts/box-2');
$box_response = rest_do_request($box_request);
$box_data     = $box_response->get_data();
if (
    $box_response->is_error()
    || false !== strpos($box_data['html'], 'src="assets/embedded/')
    || false === strpos($box_data['html'], DESIGNINSERTER_PLUGIN_URL . 'assets/embedded/css-stock-img-about-coding.svg')
) {
    fwrite(STDERR, "REST embedded asset smoke failed\n");
    exit(1);
}

$missing_request  = new WP_REST_Request('GET', '/designinserter/v1/parts/missing-part');
$missing_response = rest_do_request($missing_request);
if (!$missing_response->is_error() || 404 !== $missing_response->get_status()) {
    fwrite(STDERR, "REST not-found smoke failed\n");
    exit(1);
}

echo 'integration_ok';
