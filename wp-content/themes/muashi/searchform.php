<?php
/**
 * 検索フォームテンプレート
 * 
 * WordPress標準の検索フォームをカスタマイズ
 * get_search_form() で呼び出される
 *
 * @package Muashi
 */

// 検索クエリを取得（XSS対策のためエスケープ）
$search_query = get_search_query();
?>

<form role="search" method="get" class="search-form" action="<?php echo esc_url( home_url( '/' ) ); ?>">
    <label class="search-form__label" for="search-input">
        <span class="screen-reader-text"><?php echo esc_html_x( '検索:', 'label', 'muashi' ); ?></span>
    </label>
    <input 
        type="search" 
        id="search-input"
        class="search-form__input" 
        placeholder="<?php echo esc_attr_x( 'キーワードを入力...', 'placeholder', 'muashi' ); ?>" 
        value="<?php echo esc_attr( $search_query ); ?>" 
        name="s"
        autocomplete="off"
    />
    <button type="submit" class="search-form__submit" aria-label="<?php echo esc_attr_x( '検索', 'submit button', 'muashi' ); ?>">
        <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8.5" cy="8.5" r="6.5" stroke="currentColor" stroke-width="2" fill="none"/>
            <path d="M13 13L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
    </button>
</form>
