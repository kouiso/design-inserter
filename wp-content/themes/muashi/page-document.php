<?php
/*
Template Name: Document
*/

// このページを検索エンジンにインデックスさせない
add_filter( 'wp_robots', function( $robots ) {
    $robots['noindex'] = true;
    $robots['nofollow'] = true;
    return $robots;
} );

get_header('download');

$download_data = muashi_get_product_download_data();
$max_selectable = $download_data['maxSelectable'];
$taxonomy_terms = $download_data['taxonomies'];


$download_data_json = wp_json_encode( $download_data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES );

$page_content = '';
if ( have_posts() ) {
    the_post();
    $page_content = apply_filters( 'the_content', get_the_content() );
    rewind_posts();
}
?>

<section class="page page--no-image">

    <div class="page__bg-wrapper">
        <div class="page__bg-main"></div>
        <div class="page__bg-sub"></div>
    </div>

    <div class="navigation">
        <div class="navigation__inner">
            <ul class="navigation__list">
                <li class="navigation__item is-current">
                    <a href="<?php echo esc_url( home_url( '/document/' ) ); ?>" class="navigation__link">カタログダウンロード</a>
                </li>
            </ul>
        </div>
    </div>

    <div class="page__wrapper">
        <div class="page__container">

          <div class="page__kv">
              <div class="page__kv-icon page__kv-icon--no-image">
                  <svg viewBox="0 0 55 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M55 27.5168C55 42.696 42.6691 55 27.4981 55C12.3271 55 0 42.696 0 27.5168C0 25.7618 0.186605 24.0329 0.507566 22.3824H18.6195V25.9373C18.3209 25.702 18.0522 25.59 18.0522 25.59C13.3012 23.8723 8.12479 26.3555 6.43788 31.0642C4.76216 35.7954 7.21415 41.0007 11.9315 42.6811C14.1447 43.4578 16.4623 43.3383 18.459 42.5056C18.459 42.5056 18.4702 42.5392 18.4814 42.5952C18.7874 46.7961 22.5232 50.6721 27.6325 50.6721C31.596 50.6721 36.3432 47.7409 36.3432 42.3936V34.0926C36.3432 32.2704 37.7689 30.1382 40.2992 30.1382C42.0869 30.1382 44.2441 31.5609 44.2441 34.1038C44.2441 35.8551 42.8333 38.0583 40.2806 38.0583C39.4371 38.0583 38.6683 37.767 37.9182 37.2218V42.8081C38.6795 43.0433 39.7506 43.2114 40.609 43.2114C45.6585 43.2114 49.6929 39.1486 49.6929 34.1337C49.6929 29.1187 45.6585 25.0336 40.609 25.0336C35.5595 25.0336 31.5475 29.115 31.5475 34.1337V41.292C31.5475 43.9993 29.7075 45.6199 27.5466 45.6199C26.3412 45.6199 23.5496 44.873 23.5496 41.2584V22.3824H27.681C32.6634 22.3749 36.7314 18.3047 36.7314 13.2935C36.7314 8.2823 32.6634 4.22704 27.681 4.22704C22.6987 4.22704 18.6157 8.2935 18.6157 13.2935V17.2965H1.97055C6.02361 7.16953 15.9249 0 27.4944 0C42.6654 0 54.9963 12.3114 54.9963 27.5168H55ZM14.9844 30.1195C12.831 30.1195 11.0955 31.8671 11.0955 34.0179C11.0955 36.1688 12.831 37.879 14.9844 37.879C17.1378 37.879 18.8508 36.165 18.8508 34.0179C18.8508 31.8708 17.1042 30.1195 14.9844 30.1195ZM31.428 13.3084C31.428 11.1725 29.6963 9.42494 27.5504 9.42494C25.4044 9.42494 23.6653 11.1725 23.6653 13.3084V17.177H27.5504C29.6926 17.177 31.428 15.4406 31.428 13.3084Z" fill="#7B7B00"/>
                  </svg>
              </div>
          </div>

          <div class="page__content page__content--no-image">

            <h1 id="01" class="page__title js-page-title">
              カタログダウンロード
            </h1>

            <div class="page__inner page__inner--narrow">

              <section class="download" data-download-page data-page-type="document">
                <div class="contact__content">
                  <div class="contact__inner">
                    <div class="download__layout">
                      <div class="download__main download__main--full">
                        <div class="download__controls">
                          <label class="download__search">
                            <span class="download__search-label">キーワード</span>
                            <input type="search" class="download__search-input" data-download-search placeholder="製品名やキーワードで検索">
                          </label>
                        </div>

                        <div class="download__feedback" data-download-feedback hidden></div>

                        <p class="download__result-count" data-download-result-count></p>

                        <ul class="download__list" data-download-list></ul>

                      </div>
                    </div>
                  </div>
                </div>
                <script type="application/json" id="download-page-data"><?php echo $download_data_json ? $download_data_json : '{}'; ?></script>
              </section>

              <?php if ( ! empty( $page_content ) ) : ?>
              <section class="contact">
                <div class="contact__content">
                  <div class="contact__inner">
                    <?php echo $page_content; ?>
                  </div>
                </div>
              </section>
              <?php endif; ?>

            </div>
          </div>

        </div>
    </div>

</section>


