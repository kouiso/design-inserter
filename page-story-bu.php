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

    <div class="navigation">
        <div class="navigation__inner">
            <ul class="navigation__list">
                <li class="navigation__item">
                    <a href="<?php echo URL_ABOUT_US; ?>" class="navigation__item-title">
                    企業情報
                    </a>
                </li>
                <li class="navigation__item">
                    <a href="<?php echo URL_COMPANY; ?>" class="navigation__item-title">
                    会社概要
                    </a>
                </li>
                <li class="navigation__item">
                    <p class="navigation__item-title">
                    ストーリー
                    </p>
                </li>
                <li class="navigation__item">
                    <a href="" class="navigation__item-title">
                    お客様の声
                    </a>
                </li>
            </ul>
        </div>
    </div>

    <div class="page__wrapper">
        <div class="page__container">

            <div class="page__kv">
                <picture class="page__kv-pic">
                    <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/img/story/kv.jpg" alt="">
                </picture>

                <div class="page__kv-icon">
                    <svg viewBox="0 0 55 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M55 27.5168C55 42.696 42.6691 55 27.4981 55C12.3271 55 0 42.696 0 27.5168C0 25.7618 0.186605 24.0329 0.507566 22.3824H18.6195V25.9373C18.3209 25.702 18.0522 25.59 18.0522 25.59C13.3012 23.8723 8.12479 26.3555 6.43788 31.0642C4.76216 35.7954 7.21415 41.0007 11.9315 42.6811C14.1447 43.4578 16.4623 43.3383 18.459 42.5056C18.459 42.5056 18.4702 42.5392 18.4814 42.5952C18.7874 46.7961 22.5232 50.6721 27.6325 50.6721C31.596 50.6721 36.3432 47.7409 36.3432 42.3936V34.0926C36.3432 32.2704 37.7689 30.1382 40.2992 30.1382C42.0869 30.1382 44.2441 31.5609 44.2441 34.1038C44.2441 35.8551 42.8333 38.0583 40.2806 38.0583C39.4371 38.0583 38.6683 37.767 37.9182 37.2218V42.8081C38.6795 43.0433 39.7506 43.2114 40.609 43.2114C45.6585 43.2114 49.6929 39.1486 49.6929 34.1337C49.6929 29.1187 45.6585 25.0336 40.609 25.0336C35.5595 25.0336 31.5475 29.115 31.5475 34.1337V41.292C31.5475 43.9993 29.7075 45.6199 27.5466 45.6199C26.3412 45.6199 23.5496 44.873 23.5496 41.2584V22.3824H27.681C32.6634 22.3749 36.7314 18.3047 36.7314 13.2935C36.7314 8.2823 32.6634 4.22704 27.681 4.22704C22.6987 4.22704 18.6157 8.2935 18.6157 13.2935V17.2965H1.97055C6.02361 7.16953 15.9249 0 27.4944 0C42.6654 0 54.9963 12.3114 54.9963 27.5168H55ZM14.9844 30.1195C12.831 30.1195 11.0955 31.8671 11.0955 34.0179C11.0955 36.1688 12.831 37.879 14.9844 37.879C17.1378 37.879 18.8508 36.165 18.8508 34.0179C18.8508 31.8708 17.1042 30.1195 14.9844 30.1195ZM31.428 13.3084C31.428 11.1725 29.6963 9.42494 27.5504 9.42494C25.4044 9.42494 23.6653 11.1725 23.6653 13.3084V17.177H27.5504C29.6926 17.177 31.428 15.4406 31.428 13.3084Z" fill="#7B7B00"/>
                    </svg>
                </div>
            </div>

            <div class="page__content">
                    
                <h1 class="page__title js-page-title">
                ストーリー
                </h1>
                <div class="page__inner page__inner--narrow">

                    <div class="story">

                        <div class="archive">

                            <ul class="archive__list">
                                <li class="archive__item">
                                    <a href="" class="archive__link">
                                        <div class="archive__image-wrapper">
                                            <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/img/story/test_01.jpg" alt="" class="archive__image">
                                        </div>
                                        <div class="archive__text-wrapper">
                                            <p class="archive__title">
                                            和の静寂を纏う美しさ〜日本の伝統文化を彩る深い色合い「Matcha（抹茶） color」をカラーコレクションに追加！
                                            </p>
                                            <p class="archive__text">
                                            2025.08.21
                                            </p>
                                        </div>
                                    </a>
                                </li>
                                <li class="archive__item">
                                    <a href="" class="archive__link">
                                        <div class="archive__image-wrapper">
                                            <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/img/story/test_02.jpg" alt="" class="archive__image">
                                        </div>
                                        <div class="archive__text-wrapper">
                                            <p class="archive__title">
                                            『塗料が環境の歯車を回す』"手に触れるアイテムに関わる特殊塗料メーカー武蔵塗料が70％のバイオマス含有塗料で未来を描く
                                            </p>
                                            <p class="archive__text">
                                            2025.08.21
                                            </p>
                                        </div>
                                    </a>
                                </li>
                                <li class="archive__item">
                                    <a href="" class="archive__link">
                                        <div class="archive__image-wrapper">
                                            <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/img/story/test_03.jpg" alt="" class="archive__image">
                                        </div>
                                        <div class="archive__text-wrapper">
                                            <p class="archive__title">
                                            持続可能性を追求する製品！SDGsへの関心の高まりを受け開発、PP（ポリプロピレン）素材向けの環境配慮型プライマー「VITA PANUCO PP EA-NVP81-」
                                            </p>
                                            <p class="archive__text">
                                            2025.08.21
                                            </p>
                                        </div>
                                    </a>
                                </li>
                                <li class="archive__item">
                                    <a href="" class="archive__link">
                                        <div class="archive__image-wrapper">
                                            <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/img/story/test_01.jpg" alt="" class="archive__image">
                                        </div>
                                        <div class="archive__text-wrapper">
                                            <p class="archive__title">
                                            和の静寂を纏う美しさ〜日本の伝統文化を彩る深い色合い「Matcha（抹茶） color」をカラーコレクションに追加！
                                            </p>
                                            <p class="archive__text">
                                            2025.08.21
                                            </p>
                                        </div>
                                    </a>
                                </li>
                                <li class="archive__item">
                                    <a href="" class="archive__link">
                                        <div class="archive__image-wrapper">
                                            <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/img/story/test_02.jpg" alt="" class="archive__image">
                                        </div>
                                        <div class="archive__text-wrapper">
                                            <p class="archive__title">
                                            『塗料が環境の歯車を回す』"手に触れるアイテムに関わる特殊塗料メーカー武蔵塗料が70％のバイオマス含有塗料で未来を描く
                                            </p>
                                            <p class="archive__text">
                                            2025.08.21
                                            </p>
                                        </div>
                                    </a>
                                </li>
                                <li class="archive__item">
                                    <a href="" class="archive__link">
                                        <div class="archive__image-wrapper">
                                            <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/img/story/test_03.jpg" alt="" class="archive__image">
                                        </div>
                                        <div class="archive__text-wrapper">
                                            <p class="archive__title">
                                            持続可能性を追求する製品！SDGsへの関心の高まりを受け開発、PP（ポリプロピレン）素材向けの環境配慮型プライマー「VITA PANUCO PP EA-NVP81-」
                                            </p>
                                            <p class="archive__text">
                                            2025.08.21
                                            </p>
                                        </div>
                                    </a>
                                </li>
                                <li class="archive__item">
                                    <a href="" class="archive__link">
                                        <div class="archive__image-wrapper">
                                            <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/img/story/test_01.jpg" alt="" class="archive__image">
                                        </div>
                                        <div class="archive__text-wrapper">
                                            <p class="archive__title">
                                            和の静寂を纏う美しさ〜日本の伝統文化を彩る深い色合い「Matcha（抹茶） color」をカラーコレクションに追加！
                                            </p>
                                            <p class="archive__text">
                                            2025.08.21
                                            </p>
                                        </div>
                                    </a>
                                </li>
                                <li class="archive__item">
                                    <a href="" class="archive__link">
                                        <div class="archive__image-wrapper">
                                            <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/img/story/test_02.jpg" alt="" class="archive__image">
                                        </div>
                                        <div class="archive__text-wrapper">
                                            <p class="archive__title">
                                            『塗料が環境の歯車を回す』"手に触れるアイテムに関わる特殊塗料メーカー武蔵塗料が70％のバイオマス含有塗料で未来を描く
                                            </p>
                                            <p class="archive__text">
                                            2025.08.21
                                            </p>
                                        </div>
                                    </a>
                                </li>
                                <li class="archive__item">
                                    <a href="" class="archive__link">
                                        <div class="archive__image-wrapper">
                                            <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/img/story/test_03.jpg" alt="" class="archive__image">
                                        </div>
                                        <div class="archive__text-wrapper">
                                            <p class="archive__title">
                                            持続可能性を追求する製品！SDGsへの関心の高まりを受け開発、PP（ポリプロピレン）素材向けの環境配慮型プライマー「VITA PANUCO PP EA-NVP81-」
                                            </p>
                                            <p class="archive__text">
                                            2025.08.21
                                            </p>
                                        </div>
                                    </a>
                                </li>
                                <li class="archive__item">
                                    <a href="" class="archive__link">
                                        <div class="archive__image-wrapper">
                                            <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/img/story/test_01.jpg" alt="" class="archive__image">
                                        </div>
                                        <div class="archive__text-wrapper">
                                            <p class="archive__title">
                                            和の静寂を纏う美しさ〜日本の伝統文化を彩る深い色合い「Matcha（抹茶） color」をカラーコレクションに追加！
                                            </p>
                                            <p class="archive__text">
                                            2025.08.21
                                            </p>
                                        </div>
                                    </a>
                                </li>
                            </ul>

                            <div class="pagination">
                                <a href="" class="pagination__link">
                                    <span class="pagination__icon">
                                        <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M30.0831 20.5833H10.6873L18.9998 28.8958L17.9548 30.0833L7.66309 19.7917L17.9548 9.5L18.9998 10.6875L10.6873 19H30.0831V20.5833Z" fill="black"/>
                                        </svg>
                                    </span>
                                    <span class="pagination__text">
                                    前のページ
                                    </span>
                                </a>
                                <a href="" class="pagination__link">
                                    <span class="pagination__text">
                                    次のページ
                                    </span>
                                    <span class="pagination__icon">
                                        <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6.33301 19H25.7288L17.4163 10.6875L18.4613 9.5L28.753 19.7917L18.4613 30.0833L17.4163 28.8958L25.7288 20.5833H6.33301V19Z" fill="black"/>
                                        </svg>
                                    </span>
                                </a>
                            </div>
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

