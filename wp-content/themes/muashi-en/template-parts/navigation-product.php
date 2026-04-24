<?php
/**
 * プロダクト用サイドバーナビゲーション
 *
 * 管理画面の「外観 > メニュー」で対象サイドバーにメニューが
 * 設定されている場合はそちらを表示。未設定の場合はタクソノミーベースの
 * デフォルト表示にフォールバックする。
 *
 * 使用方法:
 * get_template_part( 'template-parts/navigation', 'product' );
 *
 * @package Muashi
 */

// メニューが管理画面で設定されている場合はそちらを使用
if ( has_nav_menu( 'sidebar_product' ) ) {
    muashi_render_sidebar_navigation( 'sidebar_product' );
    return;
}

// ────────────────────────────────────────────
// 以下はフォールバック（メニュー未設定時の従来の表示）
// ────────────────────────────────────────────

// タクソノミー設定を取得
$product_taxonomies = muashi_get_product_taxonomy_config();

// アクティブタブ（page-product.phpでのみ使用）
$active_tab = get_query_var( 'active_tab', '' );

// タクソノミーアーカイブページの場合、現在のタームを検出
$current_term_obj      = get_queried_object();
$current_taxonomy_name = ( $current_term_obj instanceof WP_Term ) ? $current_term_obj->taxonomy : '';
$current_term_id       = ( $current_term_obj instanceof WP_Term ) ? (int) $current_term_obj->term_id : 0;
$current_term_anc      = ( $current_term_obj instanceof WP_Term ) ? array_map( 'intval', get_ancestors( $current_term_id, $current_taxonomy_name ) ) : array();
?>

<div class="navigation">
    <div class="navigation__inner">
        <ul class="navigation__list">
            <li class="navigation__item">
                <p class="navigation__item-title">
                Solutions Overview
                </p>
                <ul class="navigation__sub-list">
                    <?php
                    foreach ( $product_taxonomies as $taxonomy => $settings ) :
                        $terms = muashi_get_sorted_product_terms( $taxonomy, 0 );
                        $has_terms = ! empty( $terms );

                        // タブスラッグとタクソノミー名のマッチング（product_design → design）
                        $taxonomy_slug = str_replace( 'product_', '', $taxonomy );
                        $is_active_tab = ( $active_tab !== '' && $active_tab === $taxonomy_slug );

                        // タクソノミーアーカイブで該当タクソノミーを閲覧中の場合もアクティブ
                        $should_open = $is_active_tab || ( $current_taxonomy_name === $taxonomy );
                        ?>
                        <?php
                        $sub_link_classes = 'navigation__sub-link';
                        if ( $has_terms ) {
                            $sub_link_classes .= ' js-navigation-accordion has-accordion';
                        }
                        if ( $should_open ) {
                            $sub_link_classes .= ' is-active';
                        }
                        ?>
                        <li class="navigation__sub-item">
                            <p class="<?php echo esc_attr( $sub_link_classes ); ?>"<?php echo $has_terms ? ' role="button" tabindex="0" aria-expanded="' . ( $should_open ? 'true' : 'false' ) . '" data-taxonomy="' . esc_attr( $taxonomy ) . '"' : ''; ?>>
                            <?php echo esc_html( $settings['label'] ); ?>
                            </p>
                            <?php if ( $has_terms ) : ?>
                                <ul class="navigation__sub-accordion-list<?php echo $should_open ? ' is-active' : ''; ?>" aria-hidden="<?php echo $should_open ? 'false' : 'true'; ?>">
                                    <?php foreach ( $terms as $term ) :
                                        $is_current_term  = $should_open && $current_term_id === (int) $term->term_id;
                                        $is_term_ancestor = $should_open && in_array( (int) $term->term_id, $current_term_anc, true );
                                        $item_classes     = 'navigation__sub-accordion-item';
                                        if ( $is_current_term || $is_term_ancestor ) {
                                            $item_classes .= ' is-current';
                                        }
                                        ?>
                                        <li class="<?php echo esc_attr( $item_classes ); ?>">
                                            <a href="<?php echo esc_url( get_term_link( $term ) ); ?>" class="navigation__sub-accordion-link<?php echo $is_current_term ? ' is-current' : ''; ?>">
                                            <?php echo esc_html( $term->name ); ?>
                                            </a>
                                        </li>
                                        <?php
                                        $child_terms = muashi_get_sorted_product_terms( $taxonomy, $term->term_id );
                                        if ( ! empty( $child_terms ) ) {
                                            foreach ( $child_terms as $child ) {
                                                $is_current_child = $should_open && $current_term_id === (int) $child->term_id;
                                                $child_item_classes = 'navigation__sub-accordion-item navigation__sub-accordion-item--child';
                                                if ( $is_current_child ) {
                                                    $child_item_classes .= ' is-current';
                                                }
                                                ?>
                                                <li class="<?php echo esc_attr( $child_item_classes ); ?>">
                                                    <a href="<?php echo esc_url( get_term_link( $child ) ); ?>" class="navigation__sub-accordion-link<?php echo $is_current_child ? ' is-current' : ''; ?>">
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
                <a href="<?php echo esc_url( URL_FEATURED ); ?>" class="navigation__item-title">
                Featured Solutions
                </a>
            </li>
            <li class="navigation__item">
                <a href="<?php echo esc_url( URL_APPLICATIONS ); ?>" class="navigation__item-title">
                Applications
                </a>
            </li>
        </ul>
    </div>
</div>
