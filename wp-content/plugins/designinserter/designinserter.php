<?php
/*
Plugin Name: Design Inserter
Description: pote-chil.com/css-stock/ja の CSS パーツを WordPress 投稿に挿入するプラグイン
Version: 0.1.0
Author: ritmo-inc
*/

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'DESIGNINSERTER_VERSION', '0.1.0' );
define( 'DESIGNINSERTER_PLUGIN_FILE', __FILE__ );
define( 'DESIGNINSERTER_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'DESIGNINSERTER_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'DESIGNINSERTER_SOURCE_URL', 'https://pote-chil.com/css-stock/ja' );

require_once DESIGNINSERTER_PLUGIN_DIR . 'includes/data.php';
require_once DESIGNINSERTER_PLUGIN_DIR . 'includes/render.php';
require_once DESIGNINSERTER_PLUGIN_DIR . 'includes/block.php';
require_once DESIGNINSERTER_PLUGIN_DIR . 'includes/admin.php';
