<?php
/**
 * 固定ページ作成スクリプト
 *
 * 実行方法: functions.php に以下を一時追加して、ページアクセス時に実行
 * add_action('init', 'muashi_create_missing_pages');
 */

function muashi_create_missing_pages() {
	// サステナブルなビジネス展開
	$page_sustainable = get_page_by_path('sustainable-business');
	if (!$page_sustainable) {
		$page_id = wp_insert_post(array(
			'post_title'   => 'サステナブルなビジネス展開',
			'post_name'    => 'sustainable-business',
			'post_type'    => 'page',
			'post_status'  => 'publish',
			'post_content' => '',
			'page_template' => 'page-sustainable-business.php',
		));
		error_log('Created page: sustainable-business (ID: ' . $page_id . ')');
	}

	// 採用に関するQ&A
	$page_career_faq = get_page_by_path('career-faq');
	if (!$page_career_faq) {
		$page_id = wp_insert_post(array(
			'post_title'   => '採用に関するQ&A',
			'post_name'    => 'career-faq',
			'post_type'    => 'page',
			'post_status'  => 'publish',
			'post_content' => '',
		));
		error_log('Created page: career-faq (ID: ' . $page_id . ')');
	}
}
