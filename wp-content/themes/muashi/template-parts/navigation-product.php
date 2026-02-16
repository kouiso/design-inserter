<?php
/**
 * 製品情報サイドバーナビゲーション
 *
 * 使用方法:
 * get_template_part( 'template-parts/navigation', 'product' );
 *
 * アクティブタブを渡す場合:
 * set_query_var( 'active_tab', 'design' );
 * get_template_part( 'template-parts/navigation', 'product' );
 *
 * @package Muashi
 */

// タクソノミー設定を取得
$product_taxonomies = muashi_get_product_taxonomy_config();

// アクティブタブ（page-product.phpでのみ使用）
$active_tab = get_query_var( 'active_tab', '' );
?>

<div class="navigation">
    <div class="navigation__inner">
        <ul class="navigation__list">
            <li class="navigation__item">
                <p class="navigation__item-title">
                製品情報
                </p>
                <ul class="navigation__sub-list">
                    <?php
                    foreach ( $product_taxonomies as $taxonomy => $settings ) :
                        $terms = muashi_get_sorted_product_terms( $taxonomy, 0 );
                        $has_terms = ! empty( $terms );

                        // タブスラッグとタクソノミー名のマッチング（product_design → design）
                        $taxonomy_slug = str_replace( 'product_', '', $taxonomy );
                        $is_active_tab = ( $active_tab !== '' && $active_tab === $taxonomy_slug );
                        ?>
                        <?php
                        $sub_link_classes = 'navigation__sub-link';
                        if ( $has_terms ) {
                            $sub_link_classes .= ' js-navigation-accordion has-accordion';
                        }
                        if ( $is_active_tab ) {
                            $sub_link_classes .= ' is-active';
                        }
                        ?>
                        <li class="navigation__sub-item">
                            <p class="<?php echo esc_attr( $sub_link_classes ); ?>"<?php echo $has_terms ? ' role="button" tabindex="0" aria-expanded="' . ( $is_active_tab ? 'true' : 'false' ) . '" data-taxonomy="' . esc_attr( $taxonomy ) . '"' : ''; ?>>
                            <?php echo esc_html( $settings['label'] ); ?>
                            </p>
                            <?php if ( $has_terms ) : ?>
                                <ul class="navigation__sub-accordion-list<?php echo $is_active_tab ? ' is-active' : ''; ?>" aria-hidden="<?php echo $is_active_tab ? 'false' : 'true'; ?>">
                                    <?php foreach ( $terms as $term ) : ?>
                                        <li class="navigation__sub-accordion-item">
                                            <a href="<?php echo esc_url( get_term_link( $term ) ); ?>" class="navigation__sub-accordion-link">
                                            <?php echo esc_html( $term->name ); ?>
                                            </a>
                                        </li>
                                        <?php
                                        $child_terms = muashi_get_sorted_product_terms( $taxonomy, $term->term_id );
                                        if ( ! empty( $child_terms ) ) {
                                            foreach ( $child_terms as $child ) {
                                                ?>
                                                <li class="navigation__sub-accordion-item navigation__sub-accordion-item--child">
                                                    <a href="<?php echo esc_url( get_term_link( $child ) ); ?>" class="navigation__sub-accordion-link">
                                                    <?php echo esc_html( $child->name ); ?>
                                                    </a>
                                                </li>
                                                <?php
                                            }
                                        }
                                        ?>
                                    <?php endforeach; ?>
                                </ul>
                            <?php endif; ?>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </li>
            <li class="navigation__item">
                <a href="<?php echo URL_FEATURED; ?>" class="navigation__item-title">
                注目製品
                </a>
            </li>
            <li class="navigation__item">
                <a href="<?php echo URL_APPLICATIONS; ?>" class="navigation__item-title">
                製品用途紹介
                </a>
            </li>
        </ul>
    </div>
</div>
