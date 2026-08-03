<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// ─── catalog paths ────────────────────────────────────────────────────────────

function designinserter_get_catalog_path() {
	return DESIGNINSERTER_PLUGIN_DIR . 'data/css-stock-parts.json';
}

function designinserter_get_parts_catalog_paths() {
	return array(
		array(
			'path'   => DESIGNINSERTER_PLUGIN_DIR . 'data/css-stock-parts.json',
			'source' => 'css-stock',
		),
		array(
			'path'   => DESIGNINSERTER_PLUGIN_DIR . 'data/template-party-parts.json',
			'source' => 'template-party',
		),
	);
}

function designinserter_get_templates_catalog_path() {
	return DESIGNINSERTER_PLUGIN_DIR . 'data/template-party-templates.json';
}

// ─── parts catalog (merged from all sources) ──────────────────────────────────

function designinserter_get_catalog() {
	static $catalog = null;

	if ( null !== $catalog ) {
		return $catalog;
	}

	$all_parts      = array();
	$all_categories = array();
	$seen_cats      = array();

	foreach ( designinserter_get_parts_catalog_paths() as $spec ) {
		$path   = $spec['path'];
		$source = $spec['source'];

		if ( ! file_exists( $path ) ) {
			continue;
		}

		$decoded = json_decode( file_get_contents( $path ), true );
		if ( ! is_array( $decoded ) ) {
			continue;
		}

		$parts = isset( $decoded['parts'] ) && is_array( $decoded['parts'] ) ? $decoded['parts'] : array();
		$cats  = isset( $decoded['categories'] ) && is_array( $decoded['categories'] ) ? $decoded['categories'] : array();

		// Stamp source on each part if not already set.
		foreach ( $parts as &$part ) {
			if ( ! isset( $part['source'] ) ) {
				$part['source'] = $source;
			}
		}
		unset( $part );

		$all_parts = array_merge( $all_parts, $parts );

		// Merge categories, deduplicating by slug.
		foreach ( $cats as $cat ) {
			$slug = isset( $cat['slug'] ) ? $cat['slug'] : '';
			if ( $slug && ! isset( $seen_cats[ $slug ] ) ) {
				$seen_cats[ $slug ] = true;
				$all_categories[]   = $cat;
			}
		}
	}

	$catalog = array(
		'parts'      => $all_parts,
		'categories' => $all_categories,
		'sourceUrl'  => DESIGNINSERTER_SOURCE_URL,
		'scrapedAt'  => '',
	);

	return $catalog;
}


function designinserter_get_part_display_title( $part ) {
	$id             = isset( $part['id'] ) ? (string) $part['id'] : '';
	$title          = isset( $part['title'] ) ? trim( (string) $part['title'] ) : '';
	$category_label = isset( $part['categoryLabel'] ) ? trim( (string) $part['categoryLabel'] ) : '';

	if ( '' !== $title && $title !== $id ) {
		return $title;
	}

	$base_label = '' !== $category_label ? $category_label : __( '素材', 'designinserter' );
	if ( preg_match( '/(?:^|[-_])(\d+)$/', $id, $matches ) ) {
		return sprintf( '%s %s', $base_label, $matches[1] );
	}

	$hash = strtoupper( substr( md5( $id ), 0, 6 ) );
	return sprintf( '%s %s', $base_label, $hash );
}

function designinserter_shape_part_for_editor_catalog( $part ) {
	$item = array(
		'id'            => isset( $part['id'] ) ? $part['id'] : '',
		'title'         => designinserter_get_part_display_title( $part ),
		'categoryLabel' => isset( $part['categoryLabel'] ) ? $part['categoryLabel'] : '',
		'previewImage'  => isset( $part['previewImage'] ) && $part['previewImage']
			? DESIGNINSERTER_PLUGIN_URL . $part['previewImage']
			: '',
		'source'        => isset( $part['source'] ) ? $part['source'] : 'css-stock',
		'type'          => 'part',
	);

	if ( isset( $part['behavior'] ) && is_array( $part['behavior'] ) ) {
		$item['behavior'] = array(
			'type'             => isset( $part['behavior']['type'] ) ? $part['behavior']['type'] : '',
			'requiresJs'       => ! empty( $part['behavior']['requiresJs'] ),
			'enhancementLevel' => isset( $part['behavior']['enhancementLevel'] ) ? $part['behavior']['enhancementLevel'] : '',
		);
	}

	if ( isset( $part['inputs'] ) && is_array( $part['inputs'] ) ) {
		$item['inputs'] = $part['inputs'];
	}

	return $item;
}

function designinserter_get_parts() {
	$catalog = designinserter_get_catalog();
	return $catalog['parts'];
}

// ─── templates catalog (Template Party full-page templates) ───────────────────

function designinserter_get_templates_catalog() {
	static $templates_catalog = null;

	if ( null !== $templates_catalog ) {
		return $templates_catalog;
	}

	$path = designinserter_get_templates_catalog_path();
	if ( ! file_exists( $path ) ) {
		$templates_catalog = array(
			'templates'  => array(),
			'categories' => array(),
		);
		return $templates_catalog;
	}

	$decoded = json_decode( file_get_contents( $path ), true );
	if ( ! is_array( $decoded ) ) {
		$decoded = array();
	}

	$templates_catalog = array(
		'templates'  => isset( $decoded['templates'] ) && is_array( $decoded['templates'] ) ? $decoded['templates'] : array(),
		'categories' => isset( $decoded['categories'] ) && is_array( $decoded['categories'] ) ? $decoded['categories'] : array(),
		'sourceUrl'  => isset( $decoded['sourceUrl'] ) ? $decoded['sourceUrl'] : '',
		'scrapedAt'  => isset( $decoded['scrapedAt'] ) ? $decoded['scrapedAt'] : '',
	);

	return $templates_catalog;
}

function designinserter_get_templates() {
	$catalog = designinserter_get_templates_catalog();
	return $catalog['templates'];
}

function designinserter_get_template( $template_id ) {
	$template_id = sanitize_key( $template_id );
	$templates   = designinserter_get_templates();

	foreach ( $templates as $template ) {
		if ( isset( $template['id'] ) && strtolower( $template['id'] ) === $template_id ) {
			return $template;
		}
	}

	return null;
}

// ─── editor catalog (parts + templates summary for Gutenberg block) ──────────

function designinserter_get_editor_catalog() {
	$catalog = designinserter_get_catalog();
	$items   = array();

	foreach ( $catalog['parts'] as $part ) {
		$items[] = designinserter_shape_part_for_editor_catalog( $part );
	}

	// Append full-page template entries.
	$tmpl_catalog = designinserter_get_templates_catalog();
	$tmpl_items   = array();

	foreach ( $tmpl_catalog['templates'] as $template ) {
		$tmpl_items[] = array(
			'id'            => isset( $template['id'] ) ? strtolower( $template['id'] ) : '',
			'title'         => isset( $template['title'] ) ? $template['title'] : '',
			'categoryLabel' => isset( $template['categoryLabel'] ) ? $template['categoryLabel'] : '',
			'previewImage'  => isset( $template['thumb'] ) && $template['thumb']
				? DESIGNINSERTER_PLUGIN_URL . $template['thumb']
				: '',
			'source'        => 'template-party',
			'type'          => 'template',
			'demoUrl'       => isset( $template['demoUrl'] ) ? $template['demoUrl'] : '',
			'bundleDir'     => isset( $template['bundleDir'] ) ? $template['bundleDir'] : '',
		);
	}

	return array(
		'parts'      => $items,
		'templates'  => $tmpl_items,
		'sources'    => array(
			array( 'id' => 'all',            'label' => 'すべて' ),
			array( 'id' => 'css-stock',      'label' => 'CSS Stock パーツ' ),
			array( 'id' => 'template-party', 'label' => 'Template Party' ),
		),
		'restUrl'          => rest_url( 'designinserter/v1/parts/' ),
		'nonce'            => wp_create_nonce( 'wp_rest' ),
		'templatesRestUrl' => rest_url( 'designinserter/v1/templates/' ),
	);
}

// ─── bundle-dir sanitizer (preserves case; blocks path traversal) ────────────

function designinserter_sanitize_bundle_dir( $value ) {
	return preg_replace( '/[^A-Za-z0-9_\-]/', '', basename( (string) $value ) );
}

// ─── single part lookup ───────────────────────────────────────────────────────

function designinserter_get_part( $part_id ) {
	$part_id = sanitize_key( $part_id );
	$parts   = designinserter_get_parts();

	if ( is_numeric( $part_id ) ) {
		$index = absint( $part_id ) - 1;
		if ( isset( $parts[ $index ] ) ) {
			return $parts[ $index ];
		}
	}

	foreach ( $parts as $part ) {
		if ( isset( $part['id'] ) && $part['id'] === $part_id ) {
			return $part;
		}
	}

	return null;
}
