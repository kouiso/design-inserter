<?php
/*
Plugin Name: Design Inserter
Description: pote-chil.com/css-stock/ja の CSS パーツを WordPress 投稿に挿入するプラグイン
Version: 1.0.0
Requires at least: 6.0
Requires PHP: 7.4
Author: ritmo-inc
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Text Domain: designinserter
*/

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'DESIGNINSERTER_VERSION', '1.0.0' );
define( 'DESIGNINSERTER_PLUGIN_FILE', __FILE__ );
define( 'DESIGNINSERTER_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'DESIGNINSERTER_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'DESIGNINSERTER_SOURCE_URL', 'https://pote-chil.com/css-stock/ja' );

require_once DESIGNINSERTER_PLUGIN_DIR . 'includes/data.php';
require_once DESIGNINSERTER_PLUGIN_DIR . 'includes/render.php';
require_once DESIGNINSERTER_PLUGIN_DIR . 'includes/block.php';
require_once DESIGNINSERTER_PLUGIN_DIR . 'includes/admin.php';
require_once DESIGNINSERTER_PLUGIN_DIR . 'includes/rest-api.php';
require_once DESIGNINSERTER_PLUGIN_DIR . 'includes/templates.php';
