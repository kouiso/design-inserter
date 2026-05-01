# IMPLEMENTATION_PLAN

## Source

- Source site: https://pote-chil.com/css-stock/ja
- Scraped catalog: `wp-content/plugins/designinserter/data/css-stock-parts.json`
- Current scrape result: 28 categories, 222 parts.
- CSS Stock permits use of listed source code on websites/blogs. When the code itself is republished elsewhere, include a source link and attribution.

## UX

### Gutenberg Block

- Register one dynamic block: `designinserter/css-part`.
- The editor sidebar provides a searchable/selectable part list grouped by category label.
- The selected part renders a live preview in the editor using the scraped HTML/CSS.
- Frontend rendering is server-side, so saved posts store only the selected `partId`.
- This is the primary UX because it is discoverable for editors and keeps future color/setting controls in one place.

### Shortcode

- Provide `[designinserter_part id="heading-1"]`.
- This supports classic editor, widgets, reusable blocks, and fallback/manual insertion.
- The shortcode uses the same renderer as the block.

### Block Patterns

- Do not generate 222 block patterns in the first implementation.
- Revisit patterns after the block UI is stable, likely for curated/common parts only. Full pattern generation would flood the inserter and make maintenance harder.

## Implementation

1. Scraper
   - `npm run scrape:css-stock` fetches the guide page, discovers category pages, extracts each part from Astro-rendered `<template>` blocks, and writes JSON.
   - The scraper validates the extracted total against category counts from the source page.

2. Catalog
   - Store `id`, source part id, category, section, title, HTML, CSS, editable input metadata, preview image URL, and source URL.
   - Use ids in the form `{categorySlug}-{sourcePartId}`.

3. Rendering
   - The renderer allowlists by catalog id.
   - The plugin outputs the known local catalog HTML and CSS, plus an HTML source comment.
   - SVG-only loading parts have empty CSS and are rendered without a `<style>` tag.

4. Editor
   - Plain WordPress editor JavaScript is used; no build step is required yet.
   - If controls become complex, add `@wordpress/scripts` later.

## Premortem

- CSS collisions: CSS Stock classes are global. If collisions appear, add a selector prefixer or iframe-style preview/render isolation.
- Placeholder images: Some snippets include `/css-stock/img/...` placeholder paths. Do not hotlink source images by default; future UI should let users replace images from the Media Library.
- Form controls: Search forms, tabs, toggles, and modal snippets include inputs. The renderer intentionally outputs trusted local catalog HTML rather than passing it through `wp_kses_post`, which would break controls.
- Source drift: Re-run the scraper periodically and review diffs before committing regenerated catalog data.
- Docker blocker: Full WordPress admin verification remains blocked until OrbStack/Docker daemon recovers.
