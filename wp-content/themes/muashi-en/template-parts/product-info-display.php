<?php
/**
 * プロダクト詳細表示テンプレート
 *
 * ACFプラグインを使用して詳細情報を表示する
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
        array('label' => esc_html__( 'Product Name (Trademark):', 'muashi' ), 'value' => get_field('product_name_trademark_en', $product_id)),
        array('label' => esc_html__( 'Line Number:', 'muashi' ), 'value' => get_field('product_line_number', $product_id)),
        array('label' => esc_html__( 'Solvent Type:', 'muashi' ), 'value' => get_field('product_solvent_type', $product_id)),
        array('label' => esc_html__( 'Paint Category:', 'muashi' ), 'value' => get_field('product_paint_type', $product_id)),
        array('label' => esc_html__( 'Resin Type:', 'muashi' ), 'value' => get_field('product_resin_type', $product_id)),
        array('label' => esc_html__( 'Remarks:', 'muashi' ), 'value' => get_field('product_remarks', $product_id)),
    );
} else {
    // ACF未インストール時のフォールバック
    $fields = array(
        array('label' => '日本語品名（商標）', 'value' => $product_title_ja),
        array('label' => esc_html__( 'Product Name (Trademark):', 'muashi' ), 'value' => get_post_meta($product_id, 'product_name_trademark_en', true)),
        array('label' => esc_html__( 'Line Number:', 'muashi' ), 'value' => get_post_meta($product_id, 'product_line_number', true)),
        array('label' => esc_html__( 'Solvent Type:', 'muashi' ), 'value' => get_post_meta($product_id, 'product_solvent_type', true)),
        array('label' => esc_html__( 'Paint Category:', 'muashi' ), 'value' => get_post_meta($product_id, 'product_paint_type', true)),
        array('label' => esc_html__( 'Resin Type:', 'muashi' ), 'value' => get_post_meta($product_id, 'product_resin_type', true)),
        array('label' => esc_html__( 'Remarks:', 'muashi' ), 'value' => get_post_meta($product_id, 'product_remarks', true)),
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
// 詳細フィールド（タイトル以外）- 英語品名も詳細テーブルに含める
$detail_fields = array_slice($fields, 1);
?>

<div class="product-info" data-testid="product-info">
    <div class="product-info__name">
        <p class="product-info__name-value"><?php echo esc_html($product_title_ja); ?></p>
    </div>
    <?php if ($has_custom_fields): ?>
    <dl class="product-info__details">
        <?php foreach ($detail_fields as $field): ?>
            <?php if (!empty($field['value'])): ?>
            <div class="product-info__item">
                <dt class="product-info__label"><?php echo esc_html($field['label']); ?></dt>
                <dd class="product-info__value"><?php echo esc_html($field['value']); ?></dd>
            </div>
            <?php endif; ?>
        <?php endforeach; ?>
    </dl>
    <?php endif; ?>
</div>
