<?php
/**
 * Template Name: History Founding Page
 */

global $description;
$description = '';
get_header();

$history_image_base = get_theme_file_uri( '/assets/img/history' );
?>

<section class="page page--history">

    <div class="page__bg-wrapper">
        <div class="page__bg-main"></div>
        <div class="page__bg-sub"></div>
    </div>

    <div class="navigation">
        <div class="navigation__inner">
            <ul class="navigation__list">
                <li class="navigation__item">
                    <a href="<?= URL_ABOUT_US ?>" class="navigation__item-title">
                    企業情報
                    </a>
                </li>
                <li class="navigation__item">
                    <a href="<?php echo URL_HISTORY; ?>" class="navigation__item-title">
                    ヒストリー
                    </a>
                    <ul class="navigation__item-children">
                        <li class="is-current"><a href="<?php echo URL_HISTORY_FOUNDING; ?>">創業期 1958年〜</a></li>
                        <li><a href="<?php echo URL_HISTORY_INNOVATION; ?>">技術革新期 1980年〜</a></li>
                        <li><a href="<?php echo URL_HISTORY_GLOBAL; ?>">グローバル展開期 2000年〜</a></li>
                    </ul>
                </li>
                <li class="navigation__item">
                    <a href="<?php echo URL_COMPANY; ?>" class="navigation__item-title">
                    会社概要
                    </a>
                </li>
                <li class="navigation__item">
                    <a href="<?php echo URL_STORY; ?>" class="navigation__item-title">
                    ストーリー
                    </a>
                </li>
                <li class="navigation__item">
                    <a href="<?php echo URL_VOICE; ?>" class="navigation__item-title">
                    お客様の声
                    </a>
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

            <div class="page__content page__content--history">

            <?php if ( have_posts() ) : ?>
                <?php while ( have_posts() ) : the_post(); ?>
                    <h1 class="page__title js-page-title">
                    <?php the_title(); ?>
                    </h1>
                    <div class="page__inner page__inner--history">
                        <section class="history" data-placeholder="<?= esc_url( get_stylesheet_directory_uri() . '/assets/img/common/no_image.jpg' ); ?>">
                            <div class="history__header">
                                <p class="history__description">1958年の創業以来、半世紀にわたり武蔵塗料グループはお客様と共に歩んできました。<br>
                                    創業からの主な出来事と当時の主力製品をご紹介します。
                                </p>
                            </div>
                            <div class="history__navigation">
                                <p class="history__navigation-title">武蔵塗料グループ年表</p>
                                <ul class="history__navigation-list">
                                    <li class="history__navigation-item history__navigation-item--current">創業期 1958年〜</li>
                                    <li class="history__navigation-item"><a href="<?php echo URL_HISTORY_INNOVATION; ?>">技術革新期 1980年〜</a></li>
                                    <li class="history__navigation-item"><a href="<?php echo URL_HISTORY_GLOBAL; ?>">グローバル展開期 2000年〜</a></li>
                                </ul>
                            </div>
                            <div class="history__table-wrapper">
                                <table class="table_style">
                                    <tbody>
                                        <tr class="tr1">
                                            <td class="title">&nbsp;</td>
                                            <td class="title width_285">主な出来事</td>
                                            <td class="title width_145">当時の主力製品</td>
                                            <td class="title end_border">グループの変化と成長</td>
                                        </tr>
                                        <tr class="yellow_area tr2">
                                            <th>1958年<br>
                                                (昭和33年)</th>
                                            <td class="txt_align">
                                                <p>東京都葛飾区小菅で<br>
                                                    福井敏雄社長が創業</p>
                                                <ul class="photo_list">
                                                    <li>
                                                        <p><img src="<?= esc_url( $history_image_base . '/img-photo_stage01.jpg' ); ?>" width="130" height="80" alt="創業当時 社屋"></p>
                                                        <p>創業当時 社屋</p>
                                                    </li>
                                                    <li class="last_one">
                                                        <p><img src="<?= esc_url( $history_image_base . '/img-photo_stage02.jpg' ); ?>" width="130" height="80" alt="福井敏雄　創業社長"></p>
                                                        <p>福井敏雄　創業社長</p>
                                                    </li>
                                                </ul>
                                            </td>
                                            <td>ニトロン(鉛筆用ラッカー)</td>
                                            <td class="end_border">8人でスタート</td>
                                        </tr>
                                        <tr class="tr3">
                                            <th>1959年</th>
                                            <td class="txt_align">
                                                <p>東京都葛飾区本田渋江町へ移転<br>
                                                    埼玉県川口市に土地取得、川口工場建設</p>
                                                <ul class="photo_list">
                                                    <li>
                                                        <p><img src="<?= esc_url( $history_image_base . '/img-photo_stage03.jpg' ); ?>" width="130" height="80" alt="東京都葛飾区本田渋江町へ移転 埼玉県川口市に土地取得、川口工場建設"></p>
                                                    </li>
                                                    <li class="last_one">
                                                        <p><img src="<?= esc_url( $history_image_base . '/img-photo_stage04.jpg' ); ?>" width="130" height="80" alt="東京都葛飾区本田渋江町へ移転 埼玉県川口市に土地取得、川口工場建設"></p>
                                                    </li>
                                                </ul>
                                            </td>
                                            <td>
                                                <div class="photo_top"><img src="<?= esc_url( $history_image_base . '/img-photo_stage05.jpg' ); ?>" width="75" height="80" alt="メラァル ウレックス ビ・ニトロン"></div>
                                                <p>メラァル<br>
                                                    ウレックス<br>
                                                    ビ・ニトロン</p>
                                            </td>
                                            <td class="end_border">&nbsp;</td>
                                        </tr>
                                        <tr class="yellow_area tr4">
                                            <th>1960年</th>
                                            <td class="txt_align">
                                                <p>本社営業部を豊島区雑司が谷へ移転<br>
                                                    都内特約店会「むさ志会」結成<br>
                                                    武蔵塗料協力会(原材料納入業者)結成</p>
                                                <ul class="photo_list">
                                                    <li>
                                                        <p><img src="<?= esc_url( $history_image_base . '/img-photo_stage06.jpg' ); ?>" width="127" height="80" alt="本社営業部を豊島区雑司ヶ谷へ移転 都内特約店会「むさ志会」結成 武蔵塗料協力会(原材料納入業者)結成"></p>
                                                    </li>
                                                </ul>
                                            </td>
                                            <td>&nbsp;</td>
                                            <td class="end_border txt_align">
                                                <p class="text_top">1億円<br>
                                                    42人</p>
                                            </td>
                                        </tr>
                                        <tr class="tr5">
                                            <th>1961年</th>
                                            <td>「鉛筆むさ志会」結成</td>
                                            <td>&nbsp;</td>
                                            <td class="end_border">&nbsp;</td>
                                        </tr>
                                        <tr class="yellow_area tr6">
                                            <th>1962年</th>
                                            <td class="txt_align">
                                                <p>埼玉ビル(豊島区南池袋)へ移転<br>
                                                    「日本塗料工業会」入会</p>
                                                <ul class="photo_list">
                                                    <li>
                                                        <p><img src="<?= esc_url( $history_image_base . '/img-photo_stage07.jpg' ); ?>" width="81" height="130" alt="埼玉ビル"></p>
                                                        <p>埼玉ビル</p>
                                                    </li>
                                                </ul>
                                            </td>
                                            <td>
                                                <div class="photo_top"><img src="<?= esc_url( $history_image_base . '/img-photo_stage08.jpg' ); ?>" width="50" height="80" alt="リルコン フタルペット エポナイス"></div>
                                                <p>リルコン<br>
                                                    フタルペット<br>
                                                    エポナイス</p>
                                            </td>
                                            <td class="end_border">&nbsp;</td>
                                        </tr>
                                        <tr class="tr7">
                                            <th>1963年</th>
                                            <td class="txt_align">
                                                <p>川口工場増設<br>
                                                    「塗料懇談会」結成(後に関東塗料工業組合)</p>
                                                <ul class="photo_list">
                                                    <li>
                                                        <p><img src="<?= esc_url( $history_image_base . '/img-photo_stage09.jpg' ); ?>" width="127" height="80" alt="川口工場"></p>
                                                        <p>川口工場</p>
                                                    </li>
                                                </ul>
                                            </td>
                                            <td>&nbsp;</td>
                                            <td class="end_border">&nbsp;</td>
                                        </tr>
                                        <tr class="yellow_area tr8">
                                            <th>1964年</th>
                                            <td>「む二会」結成</td>
                                            <td>&nbsp;</td>
                                            <td class="end_border">&nbsp;</td>
                                        </tr>
                                        <tr class="tr9">
                                            <th>1965年</th>
                                            <td>「関東塗料工業組合」成立加入</td>
                                            <td class="txt_align">
                                                <p>ハイジェットパテ<br>
                                                    (自動車用で大ヒット)</p>
                                            </td>
                                            <td class="end_border">&nbsp;</td>
                                        </tr>
                                        <tr class="yellow_area tr10">
                                            <th>1966年</th>
                                            <td>&nbsp;</td>
                                            <td>
                                                <p><img src="<?= esc_url( $history_image_base . '/img-photo_stage10.jpg' ); ?>" width="81" height="129" alt="プラエース713 （プラスチック木目塗料の先駆け）"></p>
                                                <p class="explain_text">プラエース713<br>（プラスチック木目塗料の先駆け）</p>
                                                <p class="explain_text02">プラエース716</p>
                                                <p><img src="<?= esc_url( $history_image_base . '/img-photo_stage11.jpg' ); ?>" width="81" height="129" alt="チャクロン （自動車エンブレム、家電などメッキ軽合金用）"></p>
                                                <p class="explain_text">チャクロン<br>（自動車エンブレム、家電などメッキ軽合金用）</p>
                                            </td>
                                            <td class="end_border">&nbsp;</td>
                                        </tr>
                                        <tr class="tr11">
                                            <th>1967年</th>
                                            <td>&nbsp;</td>
                                            <td>ネオチャクロン</td>
                                            <td class="end_border">&nbsp;</td>
                                        </tr>
                                        <tr class="yellow_area tr12">
                                            <th>1968年</th>
                                            <td>創立10周年記念式典</td>
                                            <td>サンカミン</td>
                                            <td class="end_border">&nbsp;</td>
                                        </tr>
                                        <tr class="tr13">
                                            <th>1969年</th>
                                            <td>大阪営業所開設</td>
                                            <td>プラエースWW（ワイピング技術の先駆け）</td>
                                            <td class="end_border">&nbsp;</td>
                                        </tr>
                                        <tr class="yellow_area tr14">
                                            <th>1970年</th>
                                            <td>入間工場第一期工事完成。<br>稼働開始<p class="explain_text"><img src="<?= esc_url( $history_image_base . '/img-photo_stage12.jpg' ); ?>" width="132" height="81" alt="入間工場"></p>
                                                <p class="explain_text">入間工場</p>
                                            </td>
                                            <td>ハイメラァル<br>バイタロン</td>
                                            <td class="end_border">5億円<br>59人</td>
                                        </tr>
                                        <tr class="tr15">
                                            <th>1971年</th>
                                            <td>&nbsp;</td>
                                            <td>モクメロン<br>（水面転写技術の先駆け）</td>
                                            <td class="end_border">&nbsp;</td>
                                        </tr>
                                        <tr class="yellow_area tr16">
                                            <th>1972年</th>
                                            <td>米デュポン社と販売提携<p class="explain_text">デュポンプロダクト証</p>
                                            </td>
                                            <td>&nbsp;</td>
                                            <td class="end_border">&nbsp;</td>
                                        </tr>
                                        <tr class="tr17">
                                            <th>1973年</th>
                                            <td>創立15周年記念式典<br>入間工場第2期工事完成<p class="explain_text"><img src="<?= esc_url( $history_image_base . '/img-photo_stage13.jpg' ); ?>" width="131" height="81" alt="15周年記念式典"></p>
                                                <p class="explain_text">15周年記念式典</p>
                                            </td>
                                            <td>ゼロンMM</td>
                                            <td class="end_border">&nbsp;</td>
                                        </tr>
                                        <tr class="yellow_area tr18">
                                            <th>1974年</th>
                                            <td>本社を豊島区南池袋2-30-16に移転（現在地）</td>
                                            <td>&nbsp;</td>
                                            <td class="end_border">&nbsp;</td>
                                        </tr>
                                        <tr class="tr19">
                                            <th>1975年</th>
                                            <td>「むさ志会」を全国組織へ</td>
                                            <td>&nbsp;</td>
                                            <td class="end_border">&nbsp;</td>
                                        </tr>
                                        <tr class="yellow_area tr20">
                                            <th>1976年</th>
                                            <td>&nbsp;</td>
                                            <td>ハイトマック</td>
                                            <td class="end_border">&nbsp;</td>
                                        </tr>
                                        <tr class="tr21">
                                            <th>1977年</th>
                                            <td>入間工場への移転完了<br>大阪営業所移転（源氏が丘）</td>
                                            <td>&nbsp;</td>
                                            <td class="end_border">10億円<br>69人</td>
                                        </tr>
                                        <tr class="yellow_area tr22">
                                            <th>1978年</th>
                                            <td>創立20周年記念式典<br>本社ビル「グリックビル」竣工<br>入間工場研究所完成</td>
                                            <td>&nbsp;</td>
                                            <td class="end_border">&nbsp;</td>
                                        </tr>
                                        <tr class="tr23">
                                            <th>1979年</th>
                                            <td>&nbsp;</td>
                                            <td class="last_td">ボンレザー</td>
                                            <td class="end_border">&nbsp;</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                <?php endwhile; ?>
            <?php endif; ?>
            </div>

        </div>
    </div>

</section>

<?php
get_footer();
?>
