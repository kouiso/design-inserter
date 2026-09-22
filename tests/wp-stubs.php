<?php

define( 'ABSPATH', dirname( __DIR__ ) . '/' );

$GLOBALS['designinserter_wp_stub'] = array(
	'actions'       => array(),
	'blocks'        => array(),
	'capability_checks' => array(),
	'current_user_can' => true,
	'filters'       => array(),
	'localized'     => array(),
	'options_pages' => array(),
	'rest_routes'   => array(),
	'scripts'       => array(),
	'shortcodes'    => array(),
	'styles'        => array(),
);

function designinserter_stub_state() {
	return $GLOBALS['designinserter_wp_stub'];
}

function designinserter_stub_set_current_user_can( $allowed ) {
	$GLOBALS['designinserter_wp_stub']['current_user_can'] = (bool) $allowed;
}

function designinserter_stub_call( $callback, $args = array() ) {
	if ( is_array( $callback ) ) {
		$reflection = new ReflectionMethod( $callback[0], $callback[1] );
	} else {
		$reflection = new ReflectionFunction( $callback );
	}

	if ( ! $reflection->isVariadic() ) {
		$args = array_slice( $args, 0, $reflection->getNumberOfParameters() );
	}

	return call_user_func_array( $callback, $args );
}

function designinserter_stub_add_hook( $type, $hook_name, $callback, $priority, $accepted_args ) {
	$GLOBALS['designinserter_wp_stub'][ $type ][ $hook_name ][ $priority ][] = array(
		'callback'      => $callback,
		'accepted_args' => $accepted_args,
	);
	return true;
}

function plugin_dir_path( $file ) {
	return trailingslashit( dirname( $file ) );
}

function plugin_dir_url( $file ) {
	return 'http://example.test/wp-content/plugins/' . basename( dirname( $file ) ) . '/';
}

function trailingslashit( $value ) {
	return rtrim( $value, '/\\' ) . '/';
}

function sanitize_key( $key ) {
	$key = strtolower( (string) $key );
	return preg_replace( '/[^a-z0-9_\-]/', '', $key );
}

function sanitize_html_class( $class ) {
	return preg_replace( '/[^A-Za-z0-9_\-]/', '', (string) $class );
}

function esc_attr( $value ) {
	return htmlspecialchars( (string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8' );
}

function esc_html( $value ) {
	return htmlspecialchars( (string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8' );
}

function esc_url( $value ) {
	return filter_var( (string) $value, FILTER_SANITIZE_URL );
}

function wp_kses_post( $content ) {
	return (string) $content;
}

function wp_strip_all_tags( $string, $remove_breaks = false ) {
	if ( $remove_breaks ) {
		return preg_replace( '/\s+/', ' ', (string) $string );
	}
	return (string) $string;
}

function add_action( $hook_name, $callback, $priority = 10, $accepted_args = 1 ) {
	return designinserter_stub_add_hook( 'actions', $hook_name, $callback, $priority, $accepted_args );
}

function do_action( $hook_name, ...$args ) {
	if ( empty( $GLOBALS['designinserter_wp_stub']['actions'][ $hook_name ] ) ) {
		return;
	}

	$callbacks = $GLOBALS['designinserter_wp_stub']['actions'][ $hook_name ];
	ksort( $callbacks );

	foreach ( $callbacks as $priority_callbacks ) {
		foreach ( $priority_callbacks as $registered ) {
			designinserter_stub_call(
				$registered['callback'],
				array_slice( $args, 0, $registered['accepted_args'] )
			);
		}
	}
}

function add_filter( $hook_name, $callback, $priority = 10, $accepted_args = 1 ) {
	return designinserter_stub_add_hook( 'filters', $hook_name, $callback, $priority, $accepted_args );
}

function apply_filters( $hook_name, $value, ...$args ) {
	if ( empty( $GLOBALS['designinserter_wp_stub']['filters'][ $hook_name ] ) ) {
		return $value;
	}

	$callbacks = $GLOBALS['designinserter_wp_stub']['filters'][ $hook_name ];
	ksort( $callbacks );

	foreach ( $callbacks as $priority_callbacks ) {
		foreach ( $priority_callbacks as $registered ) {
			$callback_args = array_merge( array( $value ), $args );
			$value = designinserter_stub_call(
				$registered['callback'],
				array_slice( $callback_args, 0, $registered['accepted_args'] )
			);
		}
	}

	return $value;
}

function wp_register_script( $handle, $src, $deps = array(), $ver = false, $in_footer = false ) {
	$GLOBALS['designinserter_wp_stub']['scripts'][ $handle ] = array(
		'src'       => $src,
		'deps'      => $deps,
		'ver'       => $ver,
		'in_footer' => $in_footer,
		'enqueued'  => false,
	);
}

function wp_register_style( $handle, $src, $deps = array(), $ver = false ) {
	$GLOBALS['designinserter_wp_stub']['styles'][ $handle ] = array(
		'src'      => $src,
		'deps'     => $deps,
		'ver'      => $ver,
		'enqueued' => false,
	);
}

function wp_localize_script( $handle, $object_name, $l10n ) {
	$GLOBALS['designinserter_wp_stub']['localized'][ $handle ][ $object_name ] = $l10n;
}

function register_block_type( $block_type, $args = array() ) {
	$GLOBALS['designinserter_wp_stub']['blocks'][ $block_type ] = $args;
	return $block_type;
}

function wp_enqueue_script( $handle ) {
	if ( ! isset( $GLOBALS['designinserter_wp_stub']['scripts'][ $handle ] ) ) {
		$GLOBALS['designinserter_wp_stub']['scripts'][ $handle ] = array();
	}

	$GLOBALS['designinserter_wp_stub']['scripts'][ $handle ]['enqueued'] = true;
}

function wp_enqueue_style( $handle ) {
	if ( ! isset( $GLOBALS['designinserter_wp_stub']['styles'][ $handle ] ) ) {
		$GLOBALS['designinserter_wp_stub']['styles'][ $handle ] = array();
	}

	$GLOBALS['designinserter_wp_stub']['styles'][ $handle ]['enqueued'] = true;
}

function wp_script_is( $handle, $list = 'enqueued' ) {
	if ( 'registered' === $list ) {
		return isset( $GLOBALS['designinserter_wp_stub']['scripts'][ $handle ] );
	}

	return ! empty( $GLOBALS['designinserter_wp_stub']['scripts'][ $handle ]['enqueued'] );
}

function wp_style_is( $handle, $list = 'enqueued' ) {
	if ( 'registered' === $list ) {
		return isset( $GLOBALS['designinserter_wp_stub']['styles'][ $handle ] );
	}

	return ! empty( $GLOBALS['designinserter_wp_stub']['styles'][ $handle ]['enqueued'] );
}

function shortcode_atts( $pairs, $atts, $shortcode = '' ) {
	$atts = (array) $atts;
	$out  = array();

	foreach ( $pairs as $name => $default ) {
		$out[ $name ] = array_key_exists( $name, $atts ) ? $atts[ $name ] : $default;
	}

	return $out;
}

function add_shortcode( $tag, $callback ) {
	$GLOBALS['designinserter_wp_stub']['shortcodes'][ $tag ] = $callback;
}

function shortcode_parse_atts( $text ) {
	$atts = array();
	preg_match_all( '/([A-Za-z0-9_\-]+)\s*=\s*(?:"([^"]*)"|\'([^\']*)\'|([^\s\]]+))/', $text, $matches, PREG_SET_ORDER );

	foreach ( $matches as $match ) {
		$value = '';
		if ( '' !== $match[2] ) {
			$value = $match[2];
		} elseif ( '' !== $match[3] ) {
			$value = $match[3];
		} elseif ( isset( $match[4] ) ) {
			$value = $match[4];
		}

		$atts[ $match[1] ] = $value;
	}

	return $atts;
}

function do_shortcode( $content ) {
	return preg_replace_callback(
		'/\[([A-Za-z0-9_\-]+)\b([^\]]*)\]/',
		function ( $matches ) {
			$tag = $matches[1];
			if ( ! isset( $GLOBALS['designinserter_wp_stub']['shortcodes'][ $tag ] ) ) {
				return $matches[0];
			}

			return designinserter_stub_call(
				$GLOBALS['designinserter_wp_stub']['shortcodes'][ $tag ],
				array( shortcode_parse_atts( $matches[2] ), null, $tag )
			);
		},
		$content
	);
}

function do_blocks( $content ) {
	$content = preg_replace_callback(
		'/<!--\s+wp:([a-z0-9\-]+\/[a-z0-9\-]+)(\s+({.*?}))?\s+\/-->/s',
		'designinserter_stub_render_block_match',
		$content
	);

	return preg_replace_callback(
		'/<!--\s+wp:([a-z0-9\-]+\/[a-z0-9\-]+)(\s+({.*?}))?\s+-->(.*?)<!--\s+\/wp:\1\s+-->/s',
		'designinserter_stub_render_block_match',
		$content
	);
}

function designinserter_stub_render_block_match( $matches ) {
	$block_name = $matches[1];
	$attrs      = isset( $matches[3] ) && '' !== $matches[3] ? json_decode( $matches[3], true ) : array();
	$inner_html = isset( $matches[4] ) ? $matches[4] : '';

	if ( ! is_array( $attrs ) ) {
		$attrs = array();
	}

	if ( empty( $GLOBALS['designinserter_wp_stub']['blocks'][ $block_name ]['render_callback'] ) ) {
		return $matches[0];
	}

	$callback = $GLOBALS['designinserter_wp_stub']['blocks'][ $block_name ]['render_callback'];
	return designinserter_stub_call(
		$callback,
		array(
			$attrs,
			$inner_html,
			array(
				'blockName' => $block_name,
				'attrs'     => $attrs,
			),
		)
	);
}

function rest_url( $path = '' ) {
	return 'http://example.test/wp-json/' . ltrim( $path, '/' );
}

function wp_create_nonce( $action = -1 ) {
	return 'test-nonce';
}

function current_user_can( $capability ) {
	$GLOBALS['designinserter_wp_stub']['capability_checks'][] = $capability;
	return ! empty( $GLOBALS['designinserter_wp_stub']['current_user_can'] );
}

function register_rest_route( $namespace, $route, $args = array(), $override = false ) {
	$GLOBALS['designinserter_wp_stub']['rest_routes'][ $namespace ][ $route ] = $args;
	return true;
}

function rest_ensure_response( $response ) {
	return $response;
}

function rest_do_request( $request ) {
	$route = $request instanceof WP_REST_Request ? $request->get_route() : '';

	foreach ( $GLOBALS['designinserter_wp_stub']['rest_routes'] as $namespace => $routes ) {
		foreach ( $routes as $route_pattern => $args ) {
			$pattern = '#^/' . preg_quote( $namespace, '#' ) . $route_pattern . '$#';
			if ( ! preg_match( $pattern, $route, $matches ) ) {
				continue;
			}

			foreach ( $matches as $name => $value ) {
				if ( is_string( $name ) ) {
					$request[ $name ] = $value;
				}
			}

			if ( isset( $args['permission_callback'] ) && true !== designinserter_stub_call( $args['permission_callback'] ) ) {
				return new WP_Error( 'rest_forbidden', 'Forbidden.', array( 'status' => 403 ) );
			}

			return designinserter_stub_call( $args['callback'], array( $request ) );
		}
	}

	return new WP_Error( 'rest_no_route', 'No route was found.', array( 'status' => 404 ) );
}

function add_options_page( $page_title, $menu_title, $capability, $menu_slug, $callback = '' ) {
	$GLOBALS['designinserter_wp_stub']['options_pages'][ $menu_slug ] = array(
		'page_title' => $page_title,
		'menu_title' => $menu_title,
		'capability' => $capability,
		'callback'   => $callback,
	);
	return $menu_slug;
}

function wp_unique_id( $prefix = '' ) {
	static $id = 0;
	$id++;
	return $prefix . $id;
}

add_filter( 'the_content', 'do_blocks', 9 );
add_filter( 'the_content', 'do_shortcode', 11 );

class WP_REST_Request implements ArrayAccess {
	private $method;
	private $route;
	private $params = array();

	public function __construct( $method = 'GET', $route = '' ) {
		$this->method = $method;
		$this->route  = $route;
	}

	public function get_method() {
		return $this->method;
	}

	public function get_route() {
		return $this->route;
	}

	#[\ReturnTypeWillChange]
	public function offsetExists( $offset ) {
		return array_key_exists( $offset, $this->params );
	}

	#[\ReturnTypeWillChange]
	public function offsetGet( $offset ) {
		return isset( $this->params[ $offset ] ) ? $this->params[ $offset ] : null;
	}

	#[\ReturnTypeWillChange]
	public function offsetSet( $offset, $value ) {
		$this->params[ $offset ] = $value;
	}

	#[\ReturnTypeWillChange]
	public function offsetUnset( $offset ) {
		unset( $this->params[ $offset ] );
	}
}

class WP_Error {
	public $code;
	public $message;
	public $data;

	public function __construct( $code = '', $message = '', $data = array() ) {
		$this->code    = $code;
		$this->message = $message;
		$this->data    = $data;
	}
}
