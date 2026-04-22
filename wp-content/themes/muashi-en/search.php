<?php
/**
 * 検索結果ページテンプレート
 * 
 * サイト内検索の結果を表示
 *
 * @package Muashi
 */

$search_query = get_search_query();

get_header();
?>

<section class="page">

    <div class="page__bg-wrapper">
        <div class="page__bg-main"></div>
        <div class="page__bg-sub"></div>
    </div>

    <div class="navigation">
        <div class="navigation__inner">
            <ul class="navigation__list">
                <li class="navigation__item">
                    <p class="navigation__item-title">
                    Search Results
                    </p>
                </li>
            </ul>
        </div>
    </div>

    <div class="page__wrapper">
        <div class="page__container">

            <div class="page__content">
                <h1 class="page__title js-page-title">
                    <?php if ( $search_query ) : ?>
                        Search results for "<?php echo esc_html( $search_query ); ?>"
                    <?php else : ?>
                        Search Results
                    <?php endif; ?>
                </h1>

                <div class="page__inner page__inner--narrow">

                    <div class="search-results">

                        <?php if ( ! $search_query ) : ?>
                            <!-- 検索キーワードが空の場合 -->
                            <div class="search-results__empty">
                                <p class="search-results__message">Please enter a search keyword.</p>
                                <div class="search-results__form">
                                    <?php get_search_form(); ?>
                                </div>
                            </div>

                        <?php elseif ( have_posts() ) : ?>
                            <!-- 検索結果がある場合 -->
                            <div class="archive">
                                <p class="search-results__count">
                                    <?php
                                    global $wp_query;
                                    printf(
                                        esc_html( '%s result(s) found' ),
                                        '<strong>' . esc_html( $wp_query->found_posts ) . '</strong>'
                                    );
                                    ?>
                                </p>

                                <ul class="archive__list">
                                <?php while ( have_posts() ) : the_post(); ?>
                                <li class="archive__item">
                                    <a href="<?php the_permalink(); ?>" class="archive__link">
                                        <div class="archive__image-wrapper">
                                            <?php if ( has_post_thumbnail() ) : ?>
                                            <img
                                                src="<?php echo esc_url( get_the_post_thumbnail_url( null, 'medium_large' ) ); ?>"
                                                alt="<?php the_title_attribute(); ?>"
                                                class="archive__image"
                                                loading="lazy"
                                            />
                                            <?php else : ?>
                                            <div class="archive__image archive__image--placeholder"></div>
                                            <?php endif; ?>
                                        </div>
                                        <div class="archive__content">
                                            <?php
                                            // 投稿タイプのラベルを取得
                                            $post_type_obj = get_post_type_object( get_post_type() );
                                            $post_type_label = $post_type_obj ? $post_type_obj->labels->singular_name : '';
                                            ?>
                                            <?php if ( $post_type_label ) : ?>
                                            <span class="archive__category"><?php echo esc_html( $post_type_label ); ?></span>
                                            <?php endif; ?>
                                            <h2 class="archive__title"><?php the_title(); ?></h2>
                                            <?php if ( has_excerpt() || get_the_content() ) : ?>
                                            <p class="archive__excerpt">
                                                <?php echo esc_html( wp_trim_words( get_the_excerpt(), 80, '...' ) ); ?>
                                            </p>
                                            <?php endif; ?>
                                        </div>
                                    </a>
                                </li>
                                <?php endwhile; ?>
                            </ul>

                            <?php
                            // ページネーション
                            ts_render_pagination();
                            ?>
                            </div>

                        <?php else : ?>
                            <!-- 検索結果がない場合 -->
                            <div class="search-results__empty">
                                <p class="search-results__message">
                                    No results were found for "<?php echo esc_html( $search_query ); ?>".
                                </p>
                                <p class="search-results__suggestion">Try searching with a different keyword.</p>
                                <div class="search-results__form">
                                    <?php get_search_form(); ?>
                                </div>
                            </div>
                        <?php endif; ?>

                    </div>

                </div>
            </div>

        </div>
    </div>

</section>

<?php get_footer(); ?>
