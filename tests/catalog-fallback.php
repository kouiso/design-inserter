<?php

define( 'ABSPATH', dirname( __DIR__ ) . '/' );
define( 'DESIGNINSERTER_SOURCE_URL', 'https://pote-chil.com/css-stock/ja' );

function assert_true( $condition, $message ) {
	if ( ! $condition ) {
		fwrite( STDERR, "Assertion failed: {$message}\n" );
		exit( 1 );
	}
}

function sanitize_key( $key ) {
	$key = strtolower( (string) $key );
	return preg_replace( '/[^a-z0-9_\-]/', '', $key );
}

$mode = isset( $argv[1] ) ? $argv[1] : '';
$root = sys_get_temp_dir() . '/designinserter-catalog-fallback-' . getmypid();

if ( 'missing' !== $mode && 'invalid' !== $mode ) {
	fwrite( STDERR, "Usage: php tests/catalog-fallback.php missing|invalid\n" );
	exit( 1 );
}

if ( 'invalid' === $mode ) {
	mkdir( $root . '/data', 0777, true );
	file_put_contents( $root . '/data/css-stock-parts.json', '{not-json' );
} else {
	mkdir( $root, 0777, true );
}

define( 'DESIGNINSERTER_PLUGIN_DIR', $root . '/' );

require __DIR__ . '/../wp-content/plugins/designinserter/includes/data.php';

$catalog = designinserter_get_catalog();

assert_true( isset( $catalog['parts'], $catalog['categories'], $catalog['sourceUrl'] ), 'fallback catalog has expected keys' );
assert_true( array() === $catalog['parts'], 'fallback catalog has empty parts' );
assert_true( array() === $catalog['categories'], 'fallback catalog has empty categories' );
assert_true( DESIGNINSERTER_SOURCE_URL === $catalog['sourceUrl'], 'fallback catalog keeps source URL' );
assert_true( null === designinserter_get_part( 'heading-1' ), 'fallback catalog returns no part' );

echo "Catalog fallback {$mode} passed\n";
