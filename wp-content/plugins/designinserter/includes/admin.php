<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function designinserter_admin_menu() {
	add_options_page(
		'Design Inserter',
		'Design Inserter',
		'manage_options',
		'designinserter',
		'designinserter_admin_page'
	);
}
add_action( 'admin_menu', 'designinserter_admin_menu' );

function designinserter_admin_page() {
	$catalog = designinserter_get_catalog();
	$parts   = isset( $catalog['parts'] ) ? $catalog['parts'] : array();

	$css_stock_count    = 0;
	$template_party_count = 0;
	foreach ( $parts as $part ) {
		$source = isset( $part['source'] ) ? $part['source'] : 'css-stock';
		if ( 'template-party' === $source ) {
			$template_party_count++;
		} else {
			$css_stock_count++;
		}
	}
	?>
	<div class="wrap">
		<h1>Design Inserter</h1>
		<p>CSS Stock から収集した CSS パーツを Gutenberg block または shortcode で挿入します。</p>
		<table class="widefat striped">
			<tbody>
				<tr>
					<th scope="row">Parts</th>
					<td><?php echo esc_html( $css_stock_count ); ?></td>
				</tr>
				<tr>
					<th scope="row">Template Party Parts</th>
					<td><?php echo esc_html( $template_party_count ); ?></td>
				</tr>
				<tr>
					<th scope="row">Total Parts</th>
					<td><?php echo esc_html( $css_stock_count + $template_party_count ); ?></td>
				</tr>
				<tr>
					<th scope="row">Source</th>
					<td><a href="<?php echo esc_url( DESIGNINSERTER_SOURCE_URL ); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html( DESIGNINSERTER_SOURCE_URL ); ?></a></td>
				</tr>
				<tr>
					<th scope="row">Shortcode</th>
					<td><code>[designinserter_part id="heading-1"]</code></td>
				</tr>
			</tbody>
		</table>
	</div>
	<?php
}
