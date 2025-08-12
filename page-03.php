<?php
/*
* Template Name: Custom Template
*/


global $description;
$description = '';
get_header();
?>

<section class="top-kv" data-bg-color="changeable" data-text-color="white" data-inview-area="100%">
    <div class="top-kv__bg js-color-bg"></div>

    <div class="top-kv__inner">
        <picture class="top-kv__pic"">
            <source srcset="<?php echo get_stylesheet_directory_uri(); ?>/assets/img/top/kv.jpg" media="(min-width: 768px)">
            <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/img/top/kv_sp.jpg" alt="">
        </picture>

        <div class="top-kv__message-bg u-hidden-md-up">
            <p class="top-section__title">
                <span class="top-section__title-text top-section__title-text--kv" data-inview data-bg-clip-to-right data-delay="0.4">
                ENRICHING
                </span><br>
                <span class="top-section__title-text top-section__title-text--kv" data-inview data-bg-clip-to-right data-delay="0.45">
                THE WORLD 
                </span><br>
                <span class="top-section__title-text top-section__title-text--kv" data-inview data-bg-clip-to-right data-delay="0.5">
                WITH OUR
                </span><br>
                <span class="top-section__title-text top-section__title-text--kv" data-inview data-bg-clip-to-right data-delay="0.5">
                COLORS AND
                </span><br>
                <span class="top-section__title-text top-section__title-text--kv" data-inview data-bg-clip-to-right data-delay="0.5">
                TECHNOLOGY
                </span>
            </p>
        </div>
        <div class="top-kv__message-bg u-visible-md-up">
            <p class="top-section__title">
                <span class="top-section__title-text top-section__title-text--kv" data-inview data-bg-clip-to-right data-delay="0.4">
                ENRICHING THE WORLD
                </span><br>
                <span class="top-section__title-text top-section__title-text--kv" data-inview data-bg-clip-to-right data-delay="0.45">
                WITH OUR COLORS
                </span><br>
                <span class="top-section__title-text top-section__title-text--kv" data-inview data-bg-clip-to-right data-delay="0.5">
                AND TECHNOLOGY 
                </span>
            </p>
        </div>

        <div class="top-kv__icon">
            <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M150 75.0458C150 116.444 116.37 150 74.9949 150C33.6195 150 0 116.444 0 75.0458C0 70.2594 0.508923 65.5442 1.38427 61.0428H50.7803V70.738C49.9661 70.0964 49.2332 69.7909 49.2332 69.7909C36.276 65.1063 22.1585 71.8786 17.5578 84.7206C12.9877 97.6237 19.675 111.82 32.5405 116.403C38.5764 118.521 44.8972 118.195 50.3427 115.924C50.3427 115.924 50.3732 116.016 50.4037 116.169C51.2384 127.626 61.427 138.197 75.3613 138.197C86.1709 138.197 99.1179 130.202 99.1179 115.619V92.9798C99.1179 88.0101 103.006 82.195 109.907 82.195C114.783 82.195 120.666 86.0751 120.666 93.0104C120.666 97.7867 116.818 103.795 109.856 103.795C107.556 103.795 105.459 103.001 103.413 101.514V116.749C105.49 117.391 108.411 117.849 110.752 117.849C124.523 117.849 135.526 106.769 135.526 93.0919C135.526 79.4148 124.523 68.2735 110.752 68.2735C96.9804 68.2735 86.0385 79.4046 86.0385 93.0919V112.615C86.0385 119.998 81.0206 124.418 75.1272 124.418C71.8396 124.418 64.2261 122.381 64.2261 112.523V61.0428H75.4937C89.0819 61.0225 100.176 49.9219 100.176 36.255C100.176 22.5881 89.0819 11.5283 75.4937 11.5283C61.9054 11.5283 50.7702 22.6186 50.7702 36.255V47.1722H5.37423C16.428 19.5533 43.4315 0 74.9847 0C116.36 0 149.99 33.5766 149.99 75.0458H150ZM40.8665 82.1441C34.9935 82.1441 30.2606 86.9102 30.2606 92.7762C30.2606 98.6421 34.9935 103.306 40.8665 103.306C46.7395 103.306 51.4114 98.632 51.4114 92.7762C51.4114 86.9204 46.6479 82.1441 40.8665 82.1441ZM85.7128 36.2957C85.7128 30.4705 80.99 25.7044 75.1374 25.7044C69.2848 25.7044 64.5416 30.4705 64.5416 36.2957V46.8464H75.1374C80.9798 46.8464 85.7128 42.1108 85.7128 36.2957Z" fill="#6EFF6E"/>
            </svg>
        </div>
    </div>

    <nav class="top-kv__nav">
        <ul class="top-kv__nav-list">
            <li class="top-kv__nav-item">
                <a href="" class="top-kv__nav-link">
                    <span class="top-kv__nav-link-text">商品について</span>
                </a>
            </li>
            <li class="top-kv__nav-item">
                <a href="" class="top-kv__nav-link">
                    <span class="top-kv__nav-link-text">私たちについて</span>
                </a>
            </li>
            <li class="top-kv__nav-item">
                <a href="" class="top-kv__nav-link">
                    <span class="top-kv__nav-link-text">採用情報</span>
                </a>
            </li>
            <li class="top-kv__nav-item">
                <a href="" class="top-kv__nav-link">
                    <span class="top-kv__nav-link-text">お問い合わせ</span>
                </a>
            </li>
            <li class="top-kv__nav-item">
                <a href="" class="top-kv__nav-link">
                    <span class="top-kv__nav-link-text">En | 中文</span>
                </a>
            </li>
        </ul>
    </nav>

    <!-- svg -->
    <svg width="0" height="0" style="position: absolute;">
        <defs>
            <clipPath id="sp-header-wave" clipPathUnits="objectBoundingBox">
            <!-- 元のパスを変換 -->
            <path d="M1 0 H0 V0.208 C0 0.208, 0.125 1, 0.225 1 C0.325 1, 0.5115 0.4688, 0.6174 0.4688 C0.7232 0.4688, 0.8094 0.8125, 0.8715 0.8125 C0.9337 0.8125, 1 0.5, 1 0.5 V0 Z" />
            </clipPath>
        </defs>
    </svg>
    <svg width="0" height="0" style="position: absolute;">
    <defs>
        <clipPath id="pc-header-wave" clipPathUnits="objectBoundingBox">
        <!-- 元のパスを変換 -->
        <path d="M1 0 H0 V0.208 C0 0.208, 0.125 1, 0.225 1 C0.325 1, 0.5194 0.4688, 0.6174 0.4688 C0.7153 0.4688, 0.8094 0.8125, 0.8715 0.8125 C0.9337 0.8125, 1 0.5, 1 0.5 V0 Z" />
        </clipPath>
    </defs>
    </svg>

    <div class="top-kv__wave">
        <div class="wave">
            <div class="wave__sp" style="clip-path: url(#sp-header-wave); height: 24px;">
            </div>
            <div class="wave__pc" style="clip-path: url(#pc-header-wave); height: 48px; position: relative; z-index: 10;">
            </div>
        </div>
    </div>
</section>

<section class="top-product" data-bg-color="changeable" data-text-color="black" data-inview-area="50%">
    <div class="top-product__bg js-color-bg"></div>

    <div class="top-product__inner">
        <picture class="top-product__pic" data-inview data-fade-in>
            <source srcset="<?php echo get_stylesheet_directory_uri(); ?>/assets/img/top/product.jpg" media="(min-width: 768px)">
            <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/img/top/product_sp.jpg" alt="">
        </picture>
        <div class="top-product__contents-wrapper">
            <div class="top-product__title-wrapper">
                <p class="top-section__title">
                    <span class="top-section__title-text" data-inview data-bg-clip-to-right data-delay="0.4">
                    Cutting-edge 
                    </span><br>
                    <span class="top-section__title-text" data-inview data-bg-clip-to-right data-delay="0.45">
                    development 
                    </span><br>
                    <span class="top-section__title-text" data-inview data-bg-clip-to-right data-delay="0.5">
                    technology
                    </span>
                </p>
            </div>
            <div class="top-product__contents">
                <div class="top-section__text-wrapper">
                    <p class="top-section__contents-title" data-inview data-fade-in data-delay="0.8">
                    最先端の開発技術力
                    </p>
                    <p class="top-section__contents-text" data-inview data-fade-in data-delay="1">
                    60年以上の実績を基に、市場と顧客のニーズを捉え、独自のアイデアで、高品質で革新的な製品を生み出します。
                    </p>
                    <a href="" class="top-section__contents-link" data-inview data-fade-in data-delay="1.2">
                        <span class="top-section__contents-link-text">
                        Product
                        </span>
                        <div class="top-section__contents-link-icon-wrapper">
                            <div class="top-section__contents-link-icon top-section__contents-link-icon--sp">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.66602 8H10.8327L7.33268 4.5L7.77268 4L12.106 8.33333L7.77268 12.6667L7.33268 12.1667L10.8327 8.66667H2.66602V8Z" fill="black"/>
                                </svg>
                            </div>
                            <div class="top-section__contents-link-icon top-section__contents-link-icon--pc">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 12H16.25L11 6.75L11.66 6L18.16 12.5L11.66 19L11 18.25L16.25 13H4V12Z" fill="black"/>
                                </svg>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </div>
</section>

<section class="top-about" data-bg-color="changeable" data-text-color="black" data-inview-area="50%">
    <div class="top-about__bg js-color-bg"></div>

    <div class="top-about__inner">
        <picture class="top-about__pic" data-inview data-fade-in>
            <source srcset="<?php echo get_stylesheet_directory_uri(); ?>/assets/img/top/about.jpg" media="(min-width: 768px)">
            <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/img/top/about_sp.jpg" alt="">
        </picture>
        <div class="top-about__contents-wrapper">
            <div class="top-about__title-wrapper">
                <p class="top-section__title">
                    <span class="top-section__title-text" data-inview data-bg-clip-to-right data-delay="0.4">
                    GLOBAL NETWORK
                    </span>
                </p>
            </div>
            <div class="top-about__contents">
                <div class="top-section__text-wrapper">
                    <p class="top-section__contents-title" data-inview data-fade-in data-delay="0.8">
                    グローバルネットワーク
                    </p>
                    <p class="top-section__contents-text" data-inview data-fade-in data-delay="1">
                    20年前からグローバル。アジアを中心に、欧州、北米に広がる生産拠点と販売網で世界中の市場と顧客に対応します。世界で高品質かつ同一品質の塗料を提供します。
                    </p>
                    <a href="" class="top-section__contents-link" data-inview data-fade-in data-delay="1.2">
                        <span class="top-section__contents-link-text">
                        About us
                        </span>
                        <div class="top-section__contents-link-icon-wrapper">
                            <div class="top-section__contents-link-icon top-section__contents-link-icon--sp">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.66602 8H10.8327L7.33268 4.5L7.77268 4L12.106 8.33333L7.77268 12.6667L7.33268 12.1667L10.8327 8.66667H2.66602V8Z" fill="black"/>
                                </svg>
                            </div>
                            <div class="top-section__contents-link-icon top-section__contents-link-icon--pc">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 12H16.25L11 6.75L11.66 6L18.16 12.5L11.66 19L11 18.25L16.25 13H4V12Z" fill="black"/>
                                </svg>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- svg -->
    <svg width="0" height="0" style="position:absolute;">
        <defs>
            <clipPath id="wave-clip" clipPathUnits="objectBoundingBox">
                <path d="M1 0 H0 V0.0925 C0.0375 0.6707, 0.1319 1, 0.2486 1 C0.3995 1, 0.4658 0.4063, 0.6694 0.2966 C0.7806 0.2367, 0.9306 0.4413, 1 0.7406 V0 Z" />
            </clipPath>
        </defs>
    </svg>
    <svg width="0" height="0" style="position: absolute;">
      <defs>
        <clipPath id="mobile-wave-clip" clipPathUnits="objectBoundingBox">
          <path d="M0 1 H1 C1 0.691, 0.896 0, 0.695 0 C0.494 0, 0.424 0.875, 0.264 0.875 C0.104 0.875, 0 0.524, 0 0.524 V1 Z" />
        </clipPath>
      </defs>
    </svg>

    <div class="top-about__wave">
        <div class="wave">
            <div class="wave__sp" style="clip-path: url(#mobile-wave-clip); height: 360px;">
            </div>
            <div class="wave__pc" style="clip-path: url(#wave-clip); height: 360px;">
            </div>
        </div>
    </div>
</section>

<section class="top-sustainability" data-bg-color="changeable" data-text-color="white" data-inview-area="50%">
    <div class="top-sustainability__bg js-color-bg"></div>

    <div class="top-sustainability__inner">
        <picture class="top-sustainability__pic" data-inview data-fade-in>
            <source srcset="<?php echo get_stylesheet_directory_uri(); ?>/assets/img/top/sustainability.jpg" media="(min-width: 768px)">
            <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/img/top/sustainability_sp.jpg" alt="">
        </picture>
        <div class="top-sustainability__contents-wrapper">
            <div class="top-sustainability__title-wrapper">
                <p class="top-section__title">
                    <span class="top-section__title-text" data-inview data-bg-clip-to-right data-delay="0.4">
                    Sustainable
                    </span><br>
                    <span class="top-section__title-text" data-inview data-bg-clip-to-right data-delay="0.45">
                    business
                    </span>
                </p>
            </div>
            <div class="top-sustainability__contents">
                <div class="top-section__text-wrapper">
                    <p class="top-section__contents-title" data-inview data-fade-in data-delay="0.8">
                    サステナブルなビジネス展開
                    </p>
                    <p class="top-section__contents-text" data-inview data-fade-in data-delay="1">
                    環境に配慮した製品開発と社会貢献に本気で取り組み、サステナブルな社会の実現を目指しています。
                    </p>
                    <a href="" class="top-section__contents-link" data-inview data-fade-in data-delay="1.2">
                        <span class="top-section__contents-link-text">
                        Sustainability
                        </span>
                        <div class="top-section__contents-link-icon-wrapper">
                            <div class="top-section__contents-link-icon top-section__contents-link-icon--sp">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.66602 8H10.8327L7.33268 4.5L7.77268 4L12.106 8.33333L7.77268 12.6667L7.33268 12.1667L10.8327 8.66667H2.66602V8Z" fill="black"/>
                                </svg>
                            </div>
                            <div class="top-section__contents-link-icon top-section__contents-link-icon--pc">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 12H16.25L11 6.75L11.66 6L18.16 12.5L11.66 19L11 18.25L16.25 13H4V12Z" fill="black"/>
                                </svg>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </div>
</section>

<section class="top-customer" data-text-color="white" data-inview-area="50%">
    <picture class="top-customer__bg">
        <source srcset="<?php echo get_stylesheet_directory_uri(); ?>/assets/img/top/customer.jpg" media="(min-width: 768px)">
        <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/img/top/customer_sp.jpg" alt="" class="top-customer__bg-img">
    </picture>

    <div class="top-customer__inner">
        <div class="top-customer__contents-wrapper">
            <div class="top-customer__title-wrapper">
                <p class="top-section__title">
                    <span class="top-section__title-text" data-inview data-bg-clip-to-right>
                    Customer-centric
                    </span><br>
                    <span class="top-section__title-text" data-inview data-bg-clip-to-right data-delay="0.05">
                    customization
                    </span>
                </p>
            </div>
            <div class="top-customer__contents">
                <div class="top-section__text-wrapper top-section__text-wrapper--white">
                    <p class="top-section__contents-title" data-inview data-fade-in data-delay="0.4">
                    顧客志向のカスタマイズ
                    </p>
                    <p class="top-section__contents-text" data-inview data-fade-in data-delay="0.6">
                    完全オーダーメイドで、常にお客様に寄り添い、多様なニーズに対応します。
                    </p>
                    <a href="" class="top-section__contents-link" data-inview data-fade-in data-delay="0.8">
                        <span class="top-section__contents-link-text">
                        Our Customer
                        </span>
                        <picture class="top-section__contents-link-pic">
                            <source srcset="<?php echo get_stylesheet_directory_uri(); ?>/assets/img/top/arrow_white.svg" media="(min-width: 768px)">
                            <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/img/top/arrow_white_sp.svg" alt="">
                        </picture>
                    </a>
                </div>
            </div>
        </div>
    </div>
</section>

<section class="top-news" data-bg-color="changeable" data-text-color="white" data-inview-area="50%">
    <div class="top-news__bg js-color-bg"></div>

    <div class="top-news__inner">
        <div class="top-news__title-wrapper">
            <p class="top-section__title">
                <span class="top-section__title-text" data-inview data-bg-clip-to-right>
                    News
                </span>
            </p>
        </div>

        <div class="top-news__contents-wrapper">
            <p class="top-news__contents-title" data-inview data-fade-in data-delay="0.4">
                お知らせ
            </p>
            <ul class="top-news__list" data-inview data-fade-in data-delay="0.6">
                <li class="top-news__item">
                    <a href="" class="top-news__link">
                        <div class="top-news__date-wrapper">
                            <p class="top-news__date">
                            2025.01.01
                            </p>
                            <p class="top-news__category">
                            ニュース
                            </p>
                        </div>
                        <div class="top-news__article-wrapper">
                            <p class="top-news__article-title">
                            ホームページをリニューアルしました。
                            </p>
                            <div class="top-news__article-icon-wrapper">
                                <div class="top-news__article-icon u-hidden-md-up">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path class="top-news__article-icon-path" d="M4.00065 8H9.50065L7.33398 5.83333L7.78065 5.33333L10.7807 8.33333L7.78065 11.3333L7.33398 10.8333L9.50065 8.66667H4.00065V8ZM14.0006 8.33333C14.0006 10.013 13.3334 11.6239 12.1457 12.8117C10.9579 13.9994 9.34702 14.6667 7.66732 14.6667C4.17398 14.6667 1.33398 11.8333 1.33398 8.33333C1.33398 6.65363 2.00124 5.04272 3.18897 3.85499C4.3767 2.66726 5.98761 2 7.66732 2C9.34702 2 10.9579 2.66726 12.1457 3.85499C13.3334 5.04272 14.0006 6.65363 14.0006 8.33333ZM13.334 8.33333C13.334 6.83044 12.737 5.3891 11.6743 4.32639C10.6115 3.26369 9.17021 2.66667 7.66732 2.66667C6.16442 2.66667 4.72309 3.26369 3.66038 4.32639C2.59767 5.3891 2.00065 6.83044 2.00065 8.33333C2.00065 9.83623 2.59767 11.2776 3.66038 12.3403C4.72309 13.403 6.16442 14 7.66732 14C8.41147 14 9.14834 13.8534 9.83586 13.5686C10.5234 13.2839 11.1481 12.8665 11.6743 12.3403C12.2005 11.8141 12.6179 11.1894 12.9026 10.5019C13.1874 9.81436 13.334 9.07749 13.334 8.33333Z"/>
                                    </svg>
                                </div>
                                <div class="top-news__article-icon u-visible-md-up">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path class="top-news__article-icon-path" d="M6 12H14.25L11 8.75L11.67 8L16.17 12.5L11.67 17L11 16.25L14.25 13H6V12ZM21 12.5C21 15.0196 19.9991 17.4359 18.2175 19.2175C16.4359 20.9991 14.0196 22 11.5 22C6.26 22 2 17.75 2 12.5C2 9.98044 3.00089 7.56408 4.78249 5.78249C6.56408 4.00089 8.98044 3 11.5 3C14.0196 3 16.4359 4.00089 18.2175 5.78249C19.9991 7.56408 21 9.98044 21 12.5ZM20 12.5C20 10.2457 19.1045 8.08365 17.5104 6.48959C15.9163 4.89553 13.7543 4 11.5 4C9.24566 4 7.08365 4.89553 5.48959 6.48959C3.89553 8.08365 3 10.2457 3 12.5C3 14.7543 3.89553 16.9163 5.48959 18.5104C7.08365 20.1045 9.24566 21 11.5 21C12.6162 21 13.7215 20.7801 14.7528 20.353C15.7841 19.9258 16.7211 19.2997 17.5104 18.5104C18.2997 17.7211 18.9258 16.7841 19.353 15.7528C19.7801 14.7215 20 13.6162 20 12.5Z"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </a>
                </li>
                <li class="top-news__item">
                    <a href="" class="top-news__link">
                        <div class="top-news__date-wrapper">
                            <p class="top-news__date">
                            2025.01.01
                            </p>
                            <p class="top-news__category">
                            ニュース
                            </p>
                        </div>
                        <div class="top-news__article-wrapper">
                            <p class="top-news__article-title">
                            〇〇事業について、〇〇社との契約締結をいたしました。
                            </p>
                            <div class="top-news__article-icon-wrapper">
                                <div class="top-news__article-icon u-hidden-md-up">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path class="top-news__article-icon-path" d="M4.00065 8H9.50065L7.33398 5.83333L7.78065 5.33333L10.7807 8.33333L7.78065 11.3333L7.33398 10.8333L9.50065 8.66667H4.00065V8ZM14.0006 8.33333C14.0006 10.013 13.3334 11.6239 12.1457 12.8117C10.9579 13.9994 9.34702 14.6667 7.66732 14.6667C4.17398 14.6667 1.33398 11.8333 1.33398 8.33333C1.33398 6.65363 2.00124 5.04272 3.18897 3.85499C4.3767 2.66726 5.98761 2 7.66732 2C9.34702 2 10.9579 2.66726 12.1457 3.85499C13.3334 5.04272 14.0006 6.65363 14.0006 8.33333ZM13.334 8.33333C13.334 6.83044 12.737 5.3891 11.6743 4.32639C10.6115 3.26369 9.17021 2.66667 7.66732 2.66667C6.16442 2.66667 4.72309 3.26369 3.66038 4.32639C2.59767 5.3891 2.00065 6.83044 2.00065 8.33333C2.00065 9.83623 2.59767 11.2776 3.66038 12.3403C4.72309 13.403 6.16442 14 7.66732 14C8.41147 14 9.14834 13.8534 9.83586 13.5686C10.5234 13.2839 11.1481 12.8665 11.6743 12.3403C12.2005 11.8141 12.6179 11.1894 12.9026 10.5019C13.1874 9.81436 13.334 9.07749 13.334 8.33333Z"/>
                                    </svg>
                                </div>
                                <div class="top-news__article-icon u-visible-md-up">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path class="top-news__article-icon-path" d="M6 12H14.25L11 8.75L11.67 8L16.17 12.5L11.67 17L11 16.25L14.25 13H6V12ZM21 12.5C21 15.0196 19.9991 17.4359 18.2175 19.2175C16.4359 20.9991 14.0196 22 11.5 22C6.26 22 2 17.75 2 12.5C2 9.98044 3.00089 7.56408 4.78249 5.78249C6.56408 4.00089 8.98044 3 11.5 3C14.0196 3 16.4359 4.00089 18.2175 5.78249C19.9991 7.56408 21 9.98044 21 12.5ZM20 12.5C20 10.2457 19.1045 8.08365 17.5104 6.48959C15.9163 4.89553 13.7543 4 11.5 4C9.24566 4 7.08365 4.89553 5.48959 6.48959C3.89553 8.08365 3 10.2457 3 12.5C3 14.7543 3.89553 16.9163 5.48959 18.5104C7.08365 20.1045 9.24566 21 11.5 21C12.6162 21 13.7215 20.7801 14.7528 20.353C15.7841 19.9258 16.7211 19.2997 17.5104 18.5104C18.2997 17.7211 18.9258 16.7841 19.353 15.7528C19.7801 14.7215 20 13.6162 20 12.5Z"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </a>
                </li>
                <li class="top-news__item">
                    <a href="" class="top-news__link">
                        <div class="top-news__date-wrapper">
                            <p class="top-news__date">
                            2025.01.01
                            </p>
                            <p class="top-news__category">
                            ニュース
                            </p>
                        </div>
                        <div class="top-news__article-wrapper">
                            <p class="top-news__article-title">
                            投資家様に向けた、資料の更新を行いました。
                            </p>
                            <div class="top-news__article-icon-wrapper">
                                <div class="top-news__article-icon u-hidden-md-up">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path class="top-news__article-icon-path" d="M4.00065 8H9.50065L7.33398 5.83333L7.78065 5.33333L10.7807 8.33333L7.78065 11.3333L7.33398 10.8333L9.50065 8.66667H4.00065V8ZM14.0006 8.33333C14.0006 10.013 13.3334 11.6239 12.1457 12.8117C10.9579 13.9994 9.34702 14.6667 7.66732 14.6667C4.17398 14.6667 1.33398 11.8333 1.33398 8.33333C1.33398 6.65363 2.00124 5.04272 3.18897 3.85499C4.3767 2.66726 5.98761 2 7.66732 2C9.34702 2 10.9579 2.66726 12.1457 3.85499C13.3334 5.04272 14.0006 6.65363 14.0006 8.33333ZM13.334 8.33333C13.334 6.83044 12.737 5.3891 11.6743 4.32639C10.6115 3.26369 9.17021 2.66667 7.66732 2.66667C6.16442 2.66667 4.72309 3.26369 3.66038 4.32639C2.59767 5.3891 2.00065 6.83044 2.00065 8.33333C2.00065 9.83623 2.59767 11.2776 3.66038 12.3403C4.72309 13.403 6.16442 14 7.66732 14C8.41147 14 9.14834 13.8534 9.83586 13.5686C10.5234 13.2839 11.1481 12.8665 11.6743 12.3403C12.2005 11.8141 12.6179 11.1894 12.9026 10.5019C13.1874 9.81436 13.334 9.07749 13.334 8.33333Z"/>
                                    </svg>
                                </div>
                                <div class="top-news__article-icon u-visible-md-up">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path class="top-news__article-icon-path" d="M6 12H14.25L11 8.75L11.67 8L16.17 12.5L11.67 17L11 16.25L14.25 13H6V12ZM21 12.5C21 15.0196 19.9991 17.4359 18.2175 19.2175C16.4359 20.9991 14.0196 22 11.5 22C6.26 22 2 17.75 2 12.5C2 9.98044 3.00089 7.56408 4.78249 5.78249C6.56408 4.00089 8.98044 3 11.5 3C14.0196 3 16.4359 4.00089 18.2175 5.78249C19.9991 7.56408 21 9.98044 21 12.5ZM20 12.5C20 10.2457 19.1045 8.08365 17.5104 6.48959C15.9163 4.89553 13.7543 4 11.5 4C9.24566 4 7.08365 4.89553 5.48959 6.48959C3.89553 8.08365 3 10.2457 3 12.5C3 14.7543 3.89553 16.9163 5.48959 18.5104C7.08365 20.1045 9.24566 21 11.5 21C12.6162 21 13.7215 20.7801 14.7528 20.353C15.7841 19.9258 16.7211 19.2997 17.5104 18.5104C18.2997 17.7211 18.9258 16.7841 19.353 15.7528C19.7801 14.7215 20 13.6162 20 12.5Z"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </a>
                </li>
            </ul>
            <div class="top-news__more" data-inview data-fade-in data-delay="0.8">
                <a href="" class="top-news__more-link">
                    <span class="top-news__more-text">
                    ニュース一覧はこちら
                    </span>
                    <div class="top-news__more-icon-wrapper">
                        <div class="top-news__more-icon u-hidden-md-up">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path class="top-news__more-icon-path" d="M7.15828 15.1333L11.875 10.4166L7.15828 5.69995L6.57495 6.29162L10.7 10.4166L6.57495 14.5416L7.15828 15.1333Z"/>
                        </svg>
                        </div>
                        <div class="top-news__more-icon u-visible-md-up">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path class="top-news__more-icon-path" d="M8.59001 18.1598L14.25 12.4998L8.59001 6.83984L7.89001 7.54984L12.84 12.4998L7.89001 17.4498L8.59001 18.1598Z"/>
                        </svg>
                        </div>
                    </div>
                </a>
            </div>
        </div>
    </div>
</section>

<?php
get_footer();
?>

