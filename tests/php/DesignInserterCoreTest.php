<?php

use PHPUnit\Framework\TestCase;

final class DesignInserterCoreTest extends TestCase {
	private const EXPECTED_CSS_STOCK_PART_COUNT = 222;
	private const EXPECTED_CSS_STOCK_CATEGORY_COUNT = 28;

	public function test_catalog_contains_expected_css_stock_parts() {
		$catalog = designinserter_get_catalog();

		$this->assertCount( self::EXPECTED_CSS_STOCK_PART_COUNT, $catalog['parts'] );
		$this->assertCount( self::EXPECTED_CSS_STOCK_CATEGORY_COUNT, $catalog['categories'] );
		$this->assertSame( DESIGNINSERTER_SOURCE_URL, $catalog['sourceUrl'] );
	}

	public function test_get_part_sanitizes_and_finds_known_part() {
		$part = designinserter_get_part( ' Heading-1 ' );

		$this->assertIsArray( $part );
		$this->assertSame( 'heading-1', $part['id'] );
		$this->assertSame( 'heading', $part['category'] );
	}

	public function test_editor_catalog_exposes_preview_urls_and_rest_settings() {
		$catalog = designinserter_get_editor_catalog();

		$this->assertCount( self::EXPECTED_CSS_STOCK_PART_COUNT, $catalog['parts'] );
		$this->assertStringStartsWith( DESIGNINSERTER_PLUGIN_URL . 'assets/previews/', $catalog['parts'][0]['previewImage'] );
		$this->assertSame( 'https://example.test/wp-json/designinserter/v1/parts/', $catalog['restUrl'] );
		$this->assertSame( 'nonce-wp_rest', $catalog['nonce'] );
	}

	public function test_render_part_outputs_scoped_markup_and_source() {
		$output = designinserter_render_part( 'heading-1' );

		$this->assertStringContainsString( 'Design Inserter:', $output );
		$this->assertStringContainsString( 'Source: https://pote-chil.com/css-stock/ja/heading#1', $output );
		$this->assertStringContainsString( 'data-designinserter-id="heading-1"', $output );
		$this->assertStringContainsString( 'data-designinserter-style="heading-1"', $output );
	}

	public function test_render_part_enqueues_behavior_assets() {
		$GLOBALS['designinserter_enqueued_scripts'] = array();
		$GLOBALS['designinserter_enqueued_styles']  = array();

		$output = designinserter_render_part( 'modal-1' );

		$this->assertStringContainsString( 'data-designinserter-behavior="modal"', $output );
		$this->assertContainsEquals( 'designinserter-frontend', $GLOBALS['designinserter_enqueued_scripts'] );
		$this->assertContainsEquals( 'designinserter-frontend', $GLOBALS['designinserter_enqueued_styles'] );
		$this->assertMatchesRegularExpression( '/id="modal-1__open__di-modal-1-\d+"/', $output );
		$this->assertMatchesRegularExpression( '/for="modal-1__open__di-modal-1-\d+"/', $output );
	}

	public function test_asset_urls_are_resolved_to_plugin_urls() {
		$html = '<img src="assets/embedded/example.svg"><a href="assets/previews/example.svg">Preview</a>';
		$css  = '.x { background-image: url(assets/embedded/example.svg); }';

		$this->assertSame(
			'<img src="' . DESIGNINSERTER_PLUGIN_URL . 'assets/embedded/example.svg"><a href="' . DESIGNINSERTER_PLUGIN_URL . 'assets/previews/example.svg">Preview</a>',
			designinserter_resolve_local_asset_urls( $html )
		);
		$this->assertSame(
			'.x { background-image: url("' . DESIGNINSERTER_PLUGIN_URL . 'assets/embedded/example.svg"); }',
			designinserter_resolve_local_asset_urls( $css )
		);
	}

	public function test_shortcode_uses_shared_renderer() {
		$output = designinserter_shortcode( array( 'id' => 'button-1' ) );

		$this->assertStringContainsString( 'data-designinserter-id="button-1"', $output );
		$this->assertArrayHasKey( 'designinserter_part', $GLOBALS['designinserter_shortcodes'] );
		$this->assertArrayHasKey( 'designinserter', $GLOBALS['designinserter_shortcodes'] );
	}
}
