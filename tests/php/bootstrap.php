<?php

define( 'ABSPATH', __DIR__ . '/wordpress/' );
define( 'DESIGNINSERTER_VERSION', '1.0.0' );
define( 'DESIGNINSERTER_PLUGIN_DIR', dirname( __DIR__, 2 ) . '/wp-content/plugins/designinserter/' );
define( 'DESIGNINSERTER_PLUGIN_URL', 'https://example.test/wp-content/plugins/designinserter/' );
define( 'DESIGNINSERTER_SOURCE_URL', 'https://pote-chil.com/css-stock/ja' );

$GLOBALS['designinserter_enqueued_scripts'] = array();
$GLOBALS['designinserter_enqueued_styles']  = array();
$GLOBALS['designinserter_shortcodes']       = array();
$GLOBALS['designinserter_unique_id']        = 0;

function sanitize_key( $key ) {
	return preg_replace( '/[^a-z0-9_\-]/', '', strtolower( (string) $key ) );
}

function absint( $maybeint ) {
	return abs( (int) $maybeint );
}

function sanitize_html_class( $class ) {
	return preg_replace( '/[^A-Za-z0-9_-]/', '', (string) $class );
}

function esc_attr( $text ) {
	return htmlspecialchars( (string) $text, ENT_QUOTES, 'UTF-8' );
}

function esc_html( $text ) {
	return htmlspecialchars( (string) $text, ENT_QUOTES, 'UTF-8' );
}

function esc_url( $url ) {
	return filter_var( (string) $url, FILTER_SANITIZE_URL );
}

function trailingslashit( $value ) {
	return rtrim( (string) $value, '/' ) . '/';
}

function rest_url( $path = '' ) {
	return 'https://example.test/wp-json/' . ltrim( (string) $path, '/' );
}

function wp_create_nonce( $action ) {
	return 'nonce-' . sanitize_key( $action );
}

function wp_unique_id( $prefix = '' ) {
	$GLOBALS['designinserter_unique_id']++;
	return $prefix . $GLOBALS['designinserter_unique_id'];
}

function wp_script_is( $handle, $status = 'enqueued' ) {
	return 'designinserter-frontend' === $handle && 'registered' === $status;
}

function wp_style_is( $handle, $status = 'enqueued' ) {
	return 'designinserter-frontend' === $handle && 'registered' === $status;
}

function wp_enqueue_script( $handle ) {
	$GLOBALS['designinserter_enqueued_scripts'][] = $handle;
}

function wp_enqueue_style( $handle ) {
	$GLOBALS['designinserter_enqueued_styles'][] = $handle;
}

function shortcode_atts( $pairs, $atts, $shortcode = '' ) {
	return array_merge( $pairs, $atts );
}

function add_shortcode( $tag, $callback ) {
	$GLOBALS['designinserter_shortcodes'][ $tag ] = $callback;
}

require_once __DIR__ . '/../tp-availability.php';
require_once DESIGNINSERTER_PLUGIN_DIR . 'includes/data.php';
require_once DESIGNINSERTER_PLUGIN_DIR . 'includes/render.php';
