<?php
/*
Template Name: Catalog Request
*/

get_header();

$max_selectable = 5;
$taxonomy_config = function_exists('muashi_get_product_taxonomy_config') ? muashi_get_product_taxonomy_config() : array();

$product_posts = get_posts(
    array(
        'post_type' => 'product',
        'post_status' => 'publish',
        'posts_per_page' => -1,
        'orderby' => 'title',
        'order' => 'ASC',
    )
);

$products_data = array();
$slug_to_id = array();
$all_product_ids = array();
$all_product_slugs = array();

foreach ($product_posts as $product_post) {
    $product_id = (int) $product_post->ID;
    $product_url = get_permalink($product_post);
    $thumbnail = get_the_post_thumbnail_url($product_post, 'medium');
    $pdf_id = (int) get_post_meta($product_id, 'product_pdf_attachment_id', true);
    $pdf_url = $pdf_id ? wp_get_attachment_url($pdf_id) : '';

    $slug_to_id[$product_post->post_name] = $product_id;
    $all_product_ids[] = $product_id;
    $all_product_slugs[] = $product_post->post_name;

    $terms_data = array();

    foreach ($taxonomy_config as $taxonomy => $settings) {
        $terms = get_the_terms($product_id, $taxonomy);
        if (is_wp_error($terms) || empty($terms)) {
            $terms_data[$taxonomy] = array();
            continue;
        }

        $terms_data[$taxonomy] = array_map(
            function ($term) {
                return array(
                    'id' => (int) $term->term_id,
                    'name' => $term->name,
                    'slug' => $term->slug,
                );
            },
            $terms
        );
    }

    $products_data[] = array(
        'id' => $product_id,
        'title' => get_the_title($product_post),
        'slug' => $product_post->post_name,
        'permalink' => $product_url,
        'pdfUrl' => $pdf_url ? $pdf_url : '',
        'thumbnail' => $thumbnail ? $thumbnail : '',
        'taxonomies' => $terms_data,
        'date' => get_the_date('Y-m-d', $product_post),
        'timestamp' => get_post_timestamp($product_post),
    );
}

$taxonomy_terms = array();

foreach ($taxonomy_config as $taxonomy => $settings) {
    $terms = muashi_get_sorted_product_terms_flat($taxonomy);

    if (empty($terms)) {
        $taxonomy_terms[$taxonomy] = array(
            'label' => $settings['label'],
            'terms' => array(),
        );
        continue;
    }

    $taxonomy_terms[$taxonomy] = array(
        'label' => $settings['label'],
        'terms' => array_map(
            function ($term) {
                return array(
                    'id' => (int) $term->term_id,
                    'name' => $term->name,
                    'slug' => $term->slug,
                    'parent' => (int) $term->parent,
                );
            },
            $terms
        ),
    );
}

$requested_ids = array();

$raw_product_slug = isset($_GET['dl_product']) ? sanitize_text_field(wp_unslash($_GET['dl_product'])) : '';
if ($raw_product_slug !== '') {
    $slugs = array_filter(array_map('sanitize_title', explode(',', $raw_product_slug)));
    foreach ($slugs as $slug) {
        if (isset($slug_to_id[$slug])) {
            $requested_ids[] = $slug_to_id[$slug];
        }
    }
}

$raw_products_slug = isset($_GET['dl_products']) ? sanitize_text_field(wp_unslash($_GET['dl_products'])) : '';
if ($raw_products_slug !== '') {
    $slugs = array_filter(array_map('sanitize_title', explode(',', $raw_products_slug)));
    foreach ($slugs as $slug) {
        if (isset($slug_to_id[$slug])) {
            $requested_ids[] = $slug_to_id[$slug];
        }
    }
}

$raw_product_ids = isset($_GET['dl_product_id']) ? sanitize_text_field(wp_unslash($_GET['dl_product_id'])) : '';
if ($raw_product_ids !== '') {
    $ids = array_filter(array_map('intval', explode(',', $raw_product_ids)));
    foreach ($ids as $id) {
        if (in_array($id, $all_product_ids, true)) {
            $requested_ids[] = $id;
        }
    }
}

$requested_ids = array_slice(array_values(array_unique($requested_ids)), 0, $max_selectable);

$source_product_id = 0;
$raw_source_id = isset($_GET['source_product_id']) ? (int) $_GET['source_product_id'] : 0;
if ($raw_source_id && in_array($raw_source_id, $all_product_ids, true)) {
    $source_product_id = $raw_source_id;
}

$raw_source_slug = isset($_GET['source']) ? sanitize_text_field(wp_unslash($_GET['source'])) : '';
if (!$source_product_id && $raw_source_slug !== '' && isset($slug_to_id[$raw_source_slug])) {
    $source_product_id = $slug_to_id[$raw_source_slug];
}

if (!$source_product_id && !empty($requested_ids)) {
    $source_product_id = $requested_ids[0];
}

$download_data = array(
    'maxSelectable' => $max_selectable,
    'perPage' => 20,
    'products' => $products_data,
    'taxonomies' => $taxonomy_terms,
    'initialSelection' => $requested_ids,
    'sourceProductId' => $source_product_id,
    'i18n' => array(
        'selectedHeading' => 'Selected',
        'selectedEmpty' => 'No items selected.',
        'remove' => 'Remove',
        'searchPlaceholder' => 'Search by product details',
        'resultCount' => '%d result(s)',
        'noResults' => 'No matching products.',
        'limitReached' => 'You can select up to 5 items. Please contact us if you need more.',
        'noneSelectedError' => 'Please select at least one item.',
        'resetFilters' => 'Clear filters',
        'allOption' => 'All',
    ),
);

$download_data_json = wp_json_encode($download_data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

$page_content = '';
if (have_posts()) {
    the_post();
    $page_content = apply_filters('the_content', get_the_content());
    rewind_posts();
}
?>

<section class="page page--no-image">

    <div class="page__bg-wrapper">
        <div class="page__bg-main"></div>
        <div class="page__bg-sub"></div>
    </div>

    <?php muashi_render_sidebar_navigation('sidebar_contact'); ?>

    <div class="page__wrapper">
        <div class="page__container">

            <div class="page__kv">
                <div class="page__kv-icon page__kv-icon--no-image">
                    <svg viewBox="0 0 55 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M55 27.5168C55 42.696 42.6691 55 27.4981 55C12.3271 55 0 42.696 0 27.5168C0 25.7618 0.186605 24.0329 0.507566 22.3824H18.6195V25.9373C18.3209 25.702 18.0522 25.59 18.0522 25.59C13.3012 23.8723 8.12479 26.3555 6.43788 31.0642C4.76216 35.7954 7.21415 41.0007 11.9315 42.6811C14.1447 43.4578 16.4623 43.3383 18.459 42.5056C18.459 42.5056 18.4702 42.5392 18.4814 42.5952C18.7874 46.7961 22.5232 50.6721 27.6325 50.6721C31.596 50.6721 36.3432 47.7409 36.3432 42.3936V34.0926C36.3432 32.2704 37.7689 30.1382 40.2992 30.1382C42.0869 30.1382 44.2441 31.5609 44.2441 34.1038C44.2441 35.8551 42.8333 38.0583 40.2806 38.0583C39.4371 38.0583 38.6683 37.767 37.9182 37.2218V42.8081C38.6795 43.0433 39.7506 43.2114 40.609 43.2114C45.6585 43.2114 49.6929 39.1486 49.6929 34.1337C49.6929 29.1187 45.6585 25.0336 40.609 25.0336C35.5595 25.0336 31.5475 29.115 31.5475 34.1337V41.292C31.5475 43.9993 29.7075 45.6199 27.5466 45.6199C26.3412 45.6199 23.5496 44.873 23.5496 41.2584V22.3824H27.681C32.6634 22.3749 36.7314 18.3047 36.7314 13.2935C36.7314 8.2823 32.6634 4.22704 27.681 4.22704C22.6987 4.22704 18.6157 8.2935 18.6157 13.2935V17.2965H1.97055C6.02361 7.16953 15.9249 0 27.4944 0C42.6654 0 54.9963 12.3114 54.9963 27.5168H55ZM14.9844 30.1195C12.831 30.1195 11.0955 31.8671 11.0955 34.0179C11.0955 36.1688 12.831 37.879 14.9844 37.879C17.1378 37.879 18.8508 36.165 18.8508 34.0179C18.8508 31.8708 17.1042 30.1195 14.9844 30.1195ZM31.428 13.3084C31.428 11.1725 29.6963 9.42494 27.5504 9.42494C25.4044 9.42494 23.6653 11.1725 23.6653 13.3084V17.177H27.5504C29.6926 17.177 31.428 15.4406 31.428 13.3084Z"
                            fill="#7B7B00" />
                    </svg>
                </div>
            </div>

            <div class="page__content page__content--no-image">

                <h1 id="01" class="page__title js-page-title">
                    Request for Catalog
                </h1>

                <div class="page__inner page__inner--narrow">

                    <section class="download" data-download-page data-page-type="download">
                        <div class="contact__content">
                            <div class="contact__inner">
                                <div class="download__layout">
                                    <div class="download__main download__main--full">
                                        <div class="download__feedback" data-download-feedback hidden></div>

                                        <ul class="download__list" data-download-list></ul>

                                        <!-- <p class="download__contact-note">5件を超える資料をご希望の場合は <a href="<?php echo esc_url(home_url('/contact/')); ?>">お問い合わせフォーム</a> からご連絡ください。</p> -->
                                    </div>
                                </div>
                            </div>
                        </div>
                        <script type="application/json"
                            id="download-page-data"><?php echo $download_data_json ? $download_data_json : '{}'; ?></script>
                    </section>

                </div>
            </div>

        </div>
    </div>

</section>

<?php get_footer(); ?>
