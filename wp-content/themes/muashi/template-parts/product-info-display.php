<?php
/**
 * 製品情報表示テンプレート
 *
 * ACFプラグインを使用して製品情報を表示する
 *
 * @param int $args['product_id'] 製品ID（オプション）
 */

$product_id = isset($args['product_id']) ? $args['product_id'] : get_the_ID();

// 投稿タイトル（日本語品名）
$product_title_ja = get_the_title($product_id);

// ACFフィールド取得（ACF未インストール時はget_post_meta()でフォールバック）
if (function_exists('get_field')) {
    $fields = array(
        array('label' => '日本語品名（商標）', 'value' => $product_title_ja),
        array('label' => '英語品名（商標）', 'value' => get_field('product_name_trademark_en', $product_id)),
        array('label' => 'ライン番号', 'value' => get_field('product_line_number', $product_id)),
        array('label' => '溶剤・水系・無溶剤系分類', 'value' => get_field('product_solvent_type', $product_id)),
        array('label' => '塗料別分類', 'value' => get_field('product_paint_type', $product_id)),
        array('label' => '樹脂別分類', 'value' => get_field('product_resin_type', $product_id)),
    );
} else {
    // ACF未インストール時のフォールバック
    $fields = array(
        array('label' => '日本語品名（商標）', 'value' => $product_title_ja),
        array('label' => '英語品名（商標）', 'value' => get_post_meta($product_id, 'product_name_trademark_en', true)),
        array('label' => 'ライン番号', 'value' => get_post_meta($product_id, 'product_line_number', true)),
        array('label' => '溶剤・水系・無溶剤系分類', 'value' => get_post_meta($product_id, 'product_solvent_type', true)),
        array('label' => '塗料別分類', 'value' => get_post_meta($product_id, 'product_paint_type', true)),
        array('label' => '樹脂別分類', 'value' => get_post_meta($product_id, 'product_resin_type', true)),
    );
}

// 全フィールドが空かチェック（タイトル以外）
$has_custom_fields = false;
for ($i = 1; $i < count($fields); $i++) {
    if (!empty($fields[$i]['value'])) {
        $has_custom_fields = true;
        break;
    }
}

// タイトルのみの場合でも表示する（製品名は必ずある）
?>

<div class="product-info" data-testid="product-info">
    <dl class="product-info__list">
        <?php foreach ($fields as $field): ?>
            <?php if (!empty($field['value'])): ?>
            <div class="product-info__item">
                <dt class="product-info__label"><?php echo esc_html($field['label']); ?></dt>
                <dd class="product-info__value"><?php echo esc_html($field['value']); ?></dd>
            </div>
            <?php endif; ?>
        <?php endforeach; ?>
    </dl>
</div>
