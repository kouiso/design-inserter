<?php
/**
 * インタビュー投稿タイプ用 ACF フィールド設定
 *
 * フィールドグループは acf-json/group_interview_info.json で管理しています。
 * ACFのLocal JSON機能により、JSONファイルが自動的に読み込まれます。
 *
 * このファイルは互換性のために残していますが、
 * フィールド定義の変更は acf-json/group_interview_info.json を編集してください。
 *
 * フィールド名は既存の get_post_meta() と互換性を保つため、同じ名前を使用しています：
 * - interview_company (会社名)
 * - interview_position (部署・役職)
 * - interview_person_name (氏名)
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// ACF Local JSON で管理しているため、PHPでのフィールド登録は不要
// フィールド定義は acf-json/group_interview_info.json を参照
