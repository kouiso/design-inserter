<?php
global $description;
$description = '';
get_header();
?>

<section class="page">

    <div class="page__bg-wrapper">
        <div class="page__bg-main"></div>
        <div class="page__bg-sub"></div>
    </div>

    <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>

    <?php
    // 本文を取得（ショートコードなども反映）
    $raw_content = get_the_content();
    $content     = apply_filters( 'the_content', $raw_content );

    // h2見出しを収集し、idがなければ付与して本文を置換
    $toc_items = [];
    $used_ids  = [];

    if ( preg_match_all( '/<h2([^>]*)>(.*?)<\/h2>/is', $content, $matches, PREG_SET_ORDER ) ) {
        foreach ( $matches as $m ) {
            $attrs = $m[1];           // 例: ' class="..."'
            $inner = trim( wp_strip_all_tags( $m[2] ) );
            if ( $inner === '' ) continue;

            // 既存idの有無
            $existing_id = '';
            if ( preg_match( '/\sid=["\']([^"\']+)["\']/i', $attrs, $idmatch ) ) {
                $existing_id = $idmatch[1];
            }

            // id生成（既存なければタイトルから生成・重複回避）
            if ( $existing_id ) {
                $id = $existing_id;
            } else {
                // sanitize_title_with_dashes は WP関数（日本語にも対応）
                $base = sanitize_title_with_dashes( $inner );
                $id   = $base !== '' ? $base : 'section';
                $i    = 2;
                while ( in_array( $id, $used_ids, true ) ) {
                    $id = $base . '-' . $i;
                    $i++;
        }
    }

            $used_ids[] = $id;

            // 本文側：idが無いh2にはidを付与して置換（最初の該当のみ）
            if ( ! $existing_id ) {
                $new_tag = '<h2' . $attrs . ' id="' . esc_attr( $id ) . '">' . $m[2] . '</h2>';
                $content = preg_replace( '/' . preg_quote( $m[0], '/' ) . '/', addcslashes( $new_tag, '\\$' ), $content, 1 );
            }

            // 目次用に追加
            $toc_items[] = [
                'id'    => $id,
                'title' => $inner,
            ];
        }
    }
    ?>

    <?php
    $post_type = get_post_type();
    $back_link = '';
    if ( $post_type ) {
        $custom_back_links = array(
            'post'          => defined( 'URL_NEWS' ) ? URL_NEWS : get_post_type_archive_link( 'post' ),
            'product'       => defined( 'URL_PRODUCT' ) ? URL_PRODUCT : get_post_type_archive_link( 'product' ),
            'voice'         => defined( 'URL_VOICE' ) ? URL_VOICE : get_post_type_archive_link( 'voice' ),
            'career'        => defined( 'URL_CAREER' ) ? URL_CAREER : get_post_type_archive_link( 'career' ),
            'interview'     => defined( 'URL_INTERVIEW' ) ? URL_INTERVIEW : get_post_type_archive_link( 'interview' ),
            'globalnetwork' => defined( 'URL_GLOBAL_NETWORK' ) ? URL_GLOBAL_NETWORK : get_post_type_archive_link( 'globalnetwork' ),
            'media_post'    => get_post_type_archive_link( 'media_post' ),
        );

        if ( isset( $custom_back_links[ $post_type ] ) && $custom_back_links[ $post_type ] ) {
            $back_link = $custom_back_links[ $post_type ];
        } else {
            $archive_link = get_post_type_archive_link( $post_type );
            if ( $archive_link ) {
                $back_link = $archive_link;
            }
        }
    }
    ?>

    <div class="navigation">
        <div class="navigation__inner">
            <ul class="navigation__list">
                <li class="navigation__item">
                    <p class="navigation__item-title">
                        <?php echo esc_html( get_the_title() ); ?>
                    </p>
                    <ul class="navigation__sub-list">
                        <?php if ( ! empty( $toc_items ) ) : ?>
                            <?php foreach ( $toc_items as $i => $toc ) : ?>
                                <li class="navigation__sub-item">
                                    <a href="#<?php echo esc_attr( $toc['id'] ); ?>" class="navigation__sub-link">
                                        <?php echo esc_html( $toc['title'] ); ?>
                                    </a>
                                </li>
                            <?php endforeach; ?>
                        <?php else : ?>
                            <!-- h2が無い場合は目次を出さない/空で維持 -->
                        <?php endif; ?>
                    </ul>
                </li>
            </ul>
        </div>
    </div>

    <div class="page__wrapper">
        <div class="page__container">

            <div class="page__kv">
                <?php
                muashi_render_kv_picture( array(
                    'fallback_pc'    => get_stylesheet_directory_uri() . '/assets/img/page/kv.jpg',
                    'fallback_sp'    => get_stylesheet_directory_uri() . '/assets/img/page/kv_sp.jpg',
                    'include_source' => true,
                ) );
                ?>

                <div class="page__kv-icon">
                    <svg viewBox="0 0 55 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M55 27.5168C55 42.696 42.6691 55 27.4981 55C12.3271 55 0 42.696 0 27.5168C0 25.7618 0.186605 24.0329 0.507566 22.3824H18.6195V25.9373C18.3209 25.702 18.0522 25.59 18.0522 25.59C13.3012 23.8723 8.12479 26.3555 6.43788 31.0642C4.76216 35.7954 7.21415 41.0007 11.9315 42.6811C14.1447 43.4578 16.4623 43.3383 18.459 42.5056C18.459 42.5056 18.4702 42.5392 18.4814 42.5952C18.7874 46.7961 22.5232 50.6721 27.6325 50.6721C31.596 50.6721 36.3432 47.7409 36.3432 42.3936V34.0926C36.3432 32.2704 37.7689 30.1382 40.2992 30.1382C42.0869 30.1382 44.2441 31.5609 44.2441 34.1038C44.2441 35.8551 42.8333 38.0583 40.2806 38.0583C39.4371 38.0583 38.6683 37.767 37.9182 37.2218V42.8081C38.6795 43.0433 39.7506 43.2114 40.609 43.2114C45.6585 43.2114 49.6929 39.1486 49.6929 34.1337C49.6929 29.1187 45.6585 25.0336 40.609 25.0336C35.5595 25.0336 31.5475 29.115 31.5475 34.1337V41.292C31.5475 43.9993 29.7075 45.6199 27.5466 45.6199C26.3412 45.6199 23.5496 44.873 23.5496 41.2584V22.3824H27.681C32.6634 22.3749 36.7314 18.3047 36.7314 13.2935C36.7314 8.2823 32.6634 4.22704 27.681 4.22704C22.6987 4.22704 18.6157 8.2935 18.6157 13.2935V17.2965H1.97055C6.02361 7.16953 15.9249 0 27.4944 0C42.6654 0 54.9963 12.3114 54.9963 27.5168H55ZM14.9844 30.1195C12.831 30.1195 11.0955 31.8671 11.0955 34.0179C11.0955 36.1688 12.831 37.879 14.9844 37.879C17.1378 37.879 18.8508 36.165 18.8508 34.0179C18.8508 31.8708 17.1042 30.1195 14.9844 30.1195ZM31.428 13.3084C31.428 11.1725 29.6963 9.42494 27.5504 9.42494C25.4044 9.42494 23.6653 11.1725 23.6653 13.3084V17.177H27.5504C29.6926 17.177 31.428 15.4406 31.428 13.3084Z" fill="#7B7B00"/>
                    </svg>
                </div>
            </div>

            <div class="page__content">
                <h1 class="page__title"><?php the_title(); ?></h1>

                <div class="page__inner page__inner--narrow">
                    <div class="single__contents">
                        <?php echo $content; // id付与済みの本文を出力 ?>
                    </div>

                    <?php if ( 'product' === get_post_type() ) : ?>
                        <?php
                        $product_slug     = get_post_field( 'post_name', get_the_ID() );
                        $download_args    = array(
                            'dl_product'         => $product_slug,
                            'source_product_id'  => get_the_ID(),
                        );
                        $download_permalink = add_query_arg( $download_args, home_url( '/download/' ) );
                        ?>
                        <div class="single__cta">
                            <a class="single__download-button" href="<?php echo esc_url( $download_permalink ); ?>">カタログダウンロード</a>
                        </div>
                    <?php endif; ?>

                    <?php if ( $back_link ) : ?>
                        <div class="single__back">
                            <a class="single__back-button" href="<?php echo esc_url( $back_link ); ?>">一覧へ戻る</a>
                        </div>
                    <?php endif; ?>
                </div>
            </div>

        </div>
    </div>

    <?php endwhile; endif; ?>

</section>

<?php get_footer(); ?>
