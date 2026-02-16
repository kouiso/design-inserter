<?php
/**
 * Featured Product Data Helper Functions
 *
 * Handles data retrieval and formatting for featured product download pages.
 */

if ( ! function_exists( 'muashi_get_featured_product_download_data' ) ) {
    /**
     * Retrieves and formats featured product data for the download page application.
     *
     * @return array The structured data for the download page frontend.
     */
    function muashi_get_featured_product_download_data() {
        $max_selectable = 5;

        $product_posts = get_posts(
            array(
                'post_type'      => 'featured_product',
                'post_status'    => 'publish',
                'posts_per_page' => -1,
                'orderby'        => 'title',
                'order'          => 'ASC',
            )
        );

        $products_data   = array();
        $slug_to_id      = array();
        $all_product_ids = array();

        foreach ( $product_posts as $product_post ) {
            $product_id  = (int) $product_post->ID;
            $product_url = get_permalink( $product_post );

            // カスタムURL設定の確認
            $custom_url = get_post_meta( $product_id, 'product_custom_url', true );
            if ( $custom_url ) {
                $product_url = $custom_url;
            }

            $thumbnail = get_the_post_thumbnail_url( $product_post, 'medium' );

            // PDFのURL取得
            $pdf_id  = (int) get_post_meta( $product_id, 'product_pdf_attachment_id', true );
            $pdf_url = $pdf_id ? wp_get_attachment_url( $pdf_id ) : '';

            if ( ! $pdf_url ) {
                $external_url = get_post_meta( $product_id, 'product_pdf_external_url', true );
                if ( $external_url ) {
                    $pdf_url = $external_url;
                }
            }

            $slug_to_id[ $product_post->post_name ] = $product_id;
            $all_product_ids[]                      = $product_id;

            $products_data[] = array(
                'id'         => $product_id,
                'title'      => get_the_title( $product_post ),
                'slug'       => $product_post->post_name,
                'permalink'  => $product_url,
                'pdfUrl'     => $pdf_url ? $pdf_url : '',
                'thumbnail'  => $thumbnail ? $thumbnail : '',
                'taxonomies' => new stdClass(),
                'date'       => get_the_date( 'Y-m-d', $product_post ),
                'timestamp'  => get_post_timestamp( $product_post ),
            );
        }

        // URL パラメータ処理
        $requested_ids = array();

        $raw_product_slug = isset( $_GET['dl_product'] ) ? sanitize_text_field( wp_unslash( $_GET['dl_product'] ) ) : '';
        if ( $raw_product_slug !== '' ) {
            $slugs = array_filter( array_map( 'sanitize_title', explode( ',', $raw_product_slug ) ) );
            foreach ( $slugs as $slug ) {
                if ( isset( $slug_to_id[ $slug ] ) ) {
                    $requested_ids[] = $slug_to_id[ $slug ];
                }
            }
        }

        $raw_products_slug = isset( $_GET['dl_products'] ) ? sanitize_text_field( wp_unslash( $_GET['dl_products'] ) ) : '';
        if ( $raw_products_slug !== '' ) {
            $slugs = array_filter( array_map( 'sanitize_title', explode( ',', $raw_products_slug ) ) );
            foreach ( $slugs as $slug ) {
                if ( isset( $slug_to_id[ $slug ] ) ) {
                    $requested_ids[] = $slug_to_id[ $slug ];
                }
            }
        }

        $raw_product_ids = isset( $_GET['dl_product_id'] ) ? sanitize_text_field( wp_unslash( $_GET['dl_product_id'] ) ) : '';
        if ( $raw_product_ids !== '' ) {
            $ids = array_filter( array_map( 'intval', explode( ',', $raw_product_ids ) ) );
            foreach ( $ids as $id ) {
                if ( in_array( $id, $all_product_ids, true ) ) {
                    $requested_ids[] = $id;
                }
            }
        }

        $requested_ids = array_slice( array_values( array_unique( $requested_ids ) ), 0, $max_selectable );

        $source_product_id = 0;
        $raw_source_id     = isset( $_GET['source_product_id'] ) ? (int) $_GET['source_product_id'] : 0;
        if ( $raw_source_id && in_array( $raw_source_id, $all_product_ids, true ) ) {
            $source_product_id = $raw_source_id;
        }

        $raw_source_slug = isset( $_GET['source'] ) ? sanitize_text_field( wp_unslash( $_GET['source'] ) ) : '';
        if ( ! $source_product_id && $raw_source_slug !== '' && isset( $slug_to_id[ $raw_source_slug ] ) ) {
            $source_product_id = $slug_to_id[ $raw_source_slug ];
        }

        if ( ! $source_product_id && ! empty( $requested_ids ) ) {
            $source_product_id = $requested_ids[0];
        }

        return array(
            'maxSelectable'    => $max_selectable,
            'products'         => $products_data,
            'taxonomies'       => new stdClass(),
            'initialSelection' => $requested_ids,
            'sourceProductId'  => $source_product_id,
            'i18n'             => array(
                'selectedHeading'   => '選択中',
                'selectedEmpty'     => '資料が選択されていません。',
                'remove'            => '削除',
                'searchPlaceholder' => '製品名やキーワードで検索',
                'resultCount'       => '該当件数: %d件',
                'noResults'         => '該当する製品がありません。',
                'limitReached'      => '資料は最大5件まで選択できます。5件を超える場合はお問い合わせください。',
                'noneSelectedError' => '資料を1件以上選択してください。',
                'resetFilters'      => '条件をクリア',
                'allOption'         => 'すべて',
            ),
        );
    }
}
