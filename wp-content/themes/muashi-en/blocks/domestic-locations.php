<?php
/**
 * 国内拠点情報ブロック
 *
 * Google Map iframe埋め込み対応版
 */

// 拠点データ
$locations = array(
    array(
        'name'       => '武蔵塗料ホールディングス株式会社',
        'tel'        => '03-3985-8118',
        'fax'        => '03-3985-0947',
        'postal'     => '171-0022',
        'address'    => '東京都豊島区南池袋 2-30-16 グリックビル',
        'map_query'  => '東京都豊島区南池袋2-30-16',
    ),
    array(
        'name'       => '武蔵塗料株式会社 入間工場',
        'tel'        => '04-2934-4131',
        'fax'        => '04-2934-4134',
        'postal'     => '358-0032',
        'address'    => '埼玉県入間市狭山ヶ原11-2',
        'map_query'  => '埼玉県入間市狭山ヶ原11-2',
    ),
    array(
        'name'       => '武蔵塗料株式会社 営業部',
        'tel'        => '04-2908-7634',
        'fax'        => '04-2935-0273',
        'postal'     => '358-0032',
        'address'    => '埼玉県入間市狭山ヶ原11-2',
        'map_query'  => '埼玉県入間市狭山ヶ原11-2',
        'is_sub'     => true,
    ),
    array(
        'name'       => '武蔵塗料株式会社 大阪事業所',
        'tel'        => '072-963-1133',
        'fax'        => '072-963-0606',
        'postal'     => '578-0921',
        'address'    => '大阪府東大阪市水走1-17-13',
        'map_query'  => '大阪府東大阪市水走1-17-13',
        'is_sub'     => true,
    ),
    array(
        'name'       => '武蔵塗料株式会社 名古屋営業所',
        'tel'        => '0568-54-2113',
        'fax'        => '0568-54-2117',
        'postal'     => '485-0029',
        'address'    => '愛知県小牧市中央1丁目267 小牧ガスビル 3F',
        'map_query'  => '愛知県小牧市中央1丁目267',
        'is_sub'     => true,
    ),
    array(
        'name'       => '武蔵塗料国際株式会社',
        'tel'        => '03-3985-8118',
        'fax'        => '03-3985-0947',
        'postal'     => '171-0022',
        'address'    => '東京都豊島区南池袋 2-30-16 グリックビル 6F',
        'map_query'  => '東京都豊島区南池袋2-30-16',
    ),
);
?>
<section class="location-section" id="03">
    <h2 class="location-header">日本国内</h2>
    <div class="location-cards">
        <?php foreach ( $locations as $location ) :
            $map_url = 'https://maps.google.com/maps?q=' . rawurlencode( $location['map_query'] ) . '&output=embed';
        ?>
        <div class="location-card">
            <div class="location-card__info">
                <h3 class="location-card__name"><?php echo esc_html( $location['name'] ); ?></h3>
                <div class="location-card__contact">
                    <p><span class="location-card__label">TEL:</span> <?php echo esc_html( $location['tel'] ); ?></p>
                    <?php if ( ! empty( $location['fax'] ) ) : ?>
                    <p><span class="location-card__label">FAX:</span> <?php echo esc_html( $location['fax'] ); ?></p>
                    <?php endif; ?>
                    <p><span class="location-card__label">住所:</span> 〒<?php echo esc_html( $location['postal'] ); ?></p>
                    <p><?php echo esc_html( $location['address'] ); ?></p>
                </div>
            </div>
            <div class="location-card__map">
                <iframe
                    src="<?php echo esc_url( $map_url ); ?>"
                    width="100%"
                    height="100%"
                    frameborder="0"
                    style="border:0"
                    loading="lazy"
                    aria-label="<?php echo esc_attr( $location['name'] ); ?> 地図">
                </iframe>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
</section>
