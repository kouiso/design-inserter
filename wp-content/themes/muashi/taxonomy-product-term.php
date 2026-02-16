<?php
// 製品情報タクソノミー共通テンプレート

$term      = get_queried_object();
$taxonomy  = $term ? get_taxonomy( $term->taxonomy ) : null;
$term_name = $term ? $term->name : '';
$term_desc = $term ? term_description( $term ) : '';

get_header();
?>

<section class="page">

    <div class="page__bg-wrapper">
        <div class="page__bg-main"></div>
        <div class="page__bg-sub"></div>
    </div>

    <?php get_template_part( 'template-parts/navigation', 'product' ); ?>

    <div class="page__wrapper">
        <div class="page__container">

            <div class="page__kv">
                <?php muashi_render_kv_picture( array( 'include_source' => true ) ); ?>
                <div class="page__kv-icon"><!-- SVGアイコン --></div>
            </div>

            <div class="page__content">
                <h1 class="page__title js-page-title">
                <?php echo esc_html( $term_name ); ?>
                </h1>

                <div class="page__inner page__inner--narrow page__inner--no-top-margin">
                    <?php if ( $term_desc ) : ?>
                        <div class="page__lead">
                            <?php echo wp_kses_post( wpautop( $term_desc ) ); ?>
                        </div>
                    <?php endif; ?>

                    <div class="story">
                        <div class="archive">

                            <ul class="archive__list">
                            <?php if ( have_posts() ) : ?>
                                <?php while ( have_posts() ) : the_post(); ?>
                                <li class="archive__item" data-testid="product-list-item">
                                    <a href="<?php the_permalink(); ?>" class="archive__link archive__link--product">
                                        <div class="archive__text-wrapper">
                                            <?php get_template_part('template-parts/product-info-display', null, array('product_id' => get_the_ID())); ?>
                                        </div>
                                    </a>
                                </li>
                                <?php endwhile; ?>
                            <?php else : ?>
                                <li class="archive__item">
                                <div class="archive__text-wrapper">
                                    <p class="archive__title">該当する製品がありません。</p>
                                </div>
                                </li>
                            <?php endif; ?>
                            </ul>

                            <?php ts_render_pagination(); ?>

                        </div>
                    </div>

                </div>
            </div>

        </div>
    </div>

</section>

<?php
get_footer();
?>
