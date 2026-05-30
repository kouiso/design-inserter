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
		if ( isset( $template['id'] ) && $template['id'] === $template_id ) {
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
		$item = array(
			'id'            => $part['id'],
			'title'         => isset( $part['title'] ) ? $part['title'] : $part['id'],
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

		$items[] = $item;
	}

	// Append full-page template entries.
	$tmpl_catalog = designinserter_get_templates_catalog();
	$tmpl_items   = array();

	foreach ( $tmpl_catalog['templates'] as $template ) {
		$tmpl_items[] = array(
			'id'            => isset( $template['id'] ) ? $template['id'] : '',
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
