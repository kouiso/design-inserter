<?php

use PHPUnit\Framework\TestCase;

final class DesignInserterCoreTest extends TestCase {
	private const EXPECTED_CSS_STOCK_PART_COUNT    = 222;
	private const EXPECTED_CSS_STOCK_CATEGORY_COUNT = 28;
	private const EXPECTED_TP_PART_COUNT           = 138;
	private const EXPECTED_TOTAL_PART_COUNT        = 360; // 222 + 138
	private const EXPECTED_TP_TEMPLATE_COUNT       = 1017;
	private const KNOWN_TP_TEMPLATE_ID             = 'tp_wa1_blue';

	/**
	 * Template Party のカタログは git-crypt で暗号化されとるので、鍵の無い環境では復号できん。
	 * その場合はごまかさずに skip として報告する。
	 */
	private function requireTemplateParty(): void {
		if ( ! designinserter_tp_data_available() ) {
			$this->markTestSkipped( 'Template Party catalog is git-crypt locked in this environment.' );
		}
	}

	private function expectedTotalPartCount(): int {
		return designinserter_tp_data_available()
			? self::EXPECTED_TOTAL_PART_COUNT
			: self::EXPECTED_CSS_STOCK_PART_COUNT;
	}

	public function test_catalog_merges_css_stock_and_template_party_parts() {
		$catalog = designinserter_get_catalog();

		$this->assertCount( $this->expectedTotalPartCount(), $catalog['parts'] );
		$this->assertSame( DESIGNINSERTER_SOURCE_URL, $catalog['sourceUrl'] );
	}

	public function test_catalog_css_stock_parts_have_correct_source() {
		$catalog    = designinserter_get_catalog();
		$css_parts  = array_filter( $catalog['parts'], fn( $p ) => ( $p['source'] ?? '' ) === 'css-stock' );

		$this->assertCount( self::EXPECTED_CSS_STOCK_PART_COUNT, array_values( $css_parts ) );
	}

	public function test_catalog_template_party_parts_have_correct_source() {
		$this->requireTemplateParty();

		$catalog  = designinserter_get_catalog();
		$tp_parts = array_filter( $catalog['parts'], fn( $p ) => ( $p['source'] ?? '' ) === 'template-party' );

		$this->assertCount( self::EXPECTED_TP_PART_COUNT, array_values( $tp_parts ) );
	}

	public function test_catalog_categories_have_no_duplicate_slugs() {
		$catalog = designinserter_get_catalog();
		$slugs   = array_column( $catalog['categories'], 'slug' );

		$this->assertSameSize( $slugs, array_unique( $slugs ) );

		if ( designinserter_tp_data_available() ) {
			$this->assertGreaterThan( self::EXPECTED_CSS_STOCK_CATEGORY_COUNT, count( $slugs ) );
		} else {
			$this->assertSame( self::EXPECTED_CSS_STOCK_CATEGORY_COUNT, count( $slugs ) );
		}
	}

	public function test_get_part_sanitizes_and_finds_known_part() {
		$part = designinserter_get_part( ' Heading-1 ' );

		$this->assertIsArray( $part );
		$this->assertSame( 'heading-1', $part['id'] );
		$this->assertSame( 'heading', $part['category'] );
	}

	public function test_get_templates_returns_all_template_party_templates() {
		$this->requireTemplateParty();

		$templates = designinserter_get_templates();

		$this->assertIsArray( $templates );
		$this->assertCount( self::EXPECTED_TP_TEMPLATE_COUNT, $templates );
	}

	public function test_get_template_by_id_returns_known_template() {
		$this->requireTemplateParty();

		$template = designinserter_get_template( self::KNOWN_TP_TEMPLATE_ID );

		$this->assertIsArray( $template );
		$this->assertSame( self::KNOWN_TP_TEMPLATE_ID, $template['id'] );
		$this->assertArrayHasKey( 'demoUrl', $template );
		$this->assertArrayHasKey( 'bundleDir', $template );
		$this->assertStringContainsString( 'template-party.com', $template['demoUrl'] );
	}

	public function test_get_template_returns_null_for_unknown_id() {
		$result = designinserter_get_template( 'nonexistent-template-xyz' );

		$this->assertNull( $result );
	}

	public function test_editor_catalog_exposes_merged_parts_and_templates() {
		$catalog = designinserter_get_editor_catalog();

		$this->assertCount( $this->expectedTotalPartCount(), $catalog['parts'] );
		$this->assertCount( designinserter_tp_data_available() ? self::EXPECTED_TP_TEMPLATE_COUNT : 0, $catalog['templates'] );
		$this->assertStringStartsWith( DESIGNINSERTER_PLUGIN_URL . 'assets/previews/', $catalog['parts'][0]['previewImage'] );
		$this->assertSame( 'https://example.test/wp-json/designinserter/v1/parts/', $catalog['restUrl'] );
		$this->assertSame( 'nonce-wp_rest', $catalog['nonce'] );
		$this->assertSame( 'https://example.test/wp-json/designinserter/v1/templates/', $catalog['templatesRestUrl'] );
	}


	public function test_editor_catalog_uses_japanese_friendly_title_when_title_is_empty_or_slug() {
		$empty_title_item = designinserter_shape_part_for_editor_catalog(
			array(
				'id'            => 'button-54',
				'title'         => '',
				'categoryLabel' => 'ボタン',
			)
		);
		$slug_title_item  = designinserter_shape_part_for_editor_catalog(
			array(
				'id'            => 'button-55',
				'title'         => 'button-55',
				'categoryLabel' => 'ボタン',
			)
		);

		$this->assertSame( 'ボタン 54', $empty_title_item['title'] );
		$this->assertSame( 'ボタン 55', $slug_title_item['title'] );
		$this->assertNotSame( 'button-54', $empty_title_item['title'] );
		$this->assertStringContainsString( 'ボタン', $empty_title_item['title'] );
	}

	public function test_editor_catalog_keeps_existing_readable_title() {
		$item = designinserter_shape_part_for_editor_catalog(
			array(
				'id'            => 'button-54',
				'title'         => '細い矢印',
				'categoryLabel' => 'ボタン',
			)
		);

		$this->assertSame( '細い矢印', $item['title'] );
	}

	public function test_editor_catalog_exposes_three_source_filters() {
		$catalog  = designinserter_get_editor_catalog();
		$sources  = $catalog['sources'];
		$ids      = array_column( $sources, 'id' );

		$this->assertCount( 3, $sources );
		$this->assertContains( 'all', $ids );
		$this->assertContains( 'css-stock', $ids );
		$this->assertContains( 'template-party', $ids );
	}

	public function test_editor_catalog_template_entries_have_required_fields() {
		$this->requireTemplateParty();

		$catalog   = designinserter_get_editor_catalog();
		$first_tmpl = $catalog['templates'][0] ?? null;

		$this->assertNotNull( $first_tmpl );
		$this->assertArrayHasKey( 'id', $first_tmpl );
		$this->assertArrayHasKey( 'type', $first_tmpl );
		$this->assertArrayHasKey( 'source', $first_tmpl );
		$this->assertArrayHasKey( 'demoUrl', $first_tmpl );
		$this->assertArrayHasKey( 'bundleDir', $first_tmpl );
		$this->assertSame( 'template', $first_tmpl['type'] );
		$this->assertSame( 'template-party', $first_tmpl['source'] );
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
