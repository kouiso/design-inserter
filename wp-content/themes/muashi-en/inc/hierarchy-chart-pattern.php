<?php
/**
 * Block Patterns Registration
 *
 * @package Muashi
 */

/**
 * Register block pattern categories
 */
function muashi_register_block_pattern_categories() {
    if ( function_exists( 'register_block_pattern_category' ) ) {
        register_block_pattern_category(
            'muashi-charts',
            array( 'label' => __( 'Charts & Diagrams', 'muashi' ) )
        );
    }
}
add_action( 'init', 'muashi_register_block_pattern_categories' );

/**
 * Register block patterns
 */
function muashi_register_block_patterns() {
    if ( ! function_exists( 'register_block_pattern' ) ) {
        return;
    }

    // 階層図パターン
    register_block_pattern(
        'muashi/hierarchy-chart',
        array(
            'title'       => __( 'Hierarchy Chart', 'muashi' ),
            'description' => __( 'A hierarchical organization chart with color-coded categories', 'muashi' ),
            'categories'  => array( 'muashi-charts' ),
            'content'     => '<!-- wp:html -->
<div class="hierarchy-chart">
  <!-- Header Guide -->
  <div class="hierarchy-chart__legend">
    <div class="hierarchy-chart__legend-item hierarchy-chart__legend-item--l1">大分類</div>
    <div class="hierarchy-chart__legend-item hierarchy-chart__legend-item--l2">方針</div>
    <div class="hierarchy-chart__legend-item hierarchy-chart__legend-item--l3">関連2次文書</div>
  </div>

  <!-- サステナビリティ -->
  <div class="hierarchy-chart__section">
    <div class="hierarchy-chart__l1 hierarchy-chart__box hierarchy-chart__box--sustainability">サステナビリティ</div>
    <div class="hierarchy-chart__group">
        <div class="hierarchy-chart__l2-wrapper">
            <div class="hierarchy-chart__l2 hierarchy-chart__box hierarchy-chart__box--sustainability">サステナビリティ基本方針</div>
        </div>
        <div class="hierarchy-chart__l3-wrapper">
             <div class="hierarchy-chart__l3 hierarchy-chart__box hierarchy-chart__box--sustainability">-</div>
        </div>
    </div>
  </div>

  <!-- CSR全般 -->
  <div class="hierarchy-chart__section">
    <div class="hierarchy-chart__l1 hierarchy-chart__box hierarchy-chart__box--csr">CSR全般</div>
    <div class="hierarchy-chart__group">
        <div class="hierarchy-chart__l2-wrapper">
            <div class="hierarchy-chart__l2 hierarchy-chart__box hierarchy-chart__box--csr">CSR方針</div>
        </div>
        <div class="hierarchy-chart__l3-wrapper">
             <div class="hierarchy-chart__l3 hierarchy-chart__box hierarchy-chart__box--csr hierarchy-chart__box--empty-white">-</div>
        </div>
    </div>
  </div>

  <!-- 環境への取り組み -->
  <div class="hierarchy-chart__section">
    <div class="hierarchy-chart__l1 hierarchy-chart__box hierarchy-chart__box--environment">環境への取り組み</div>
    <!-- Group 1 -->
    <div class="hierarchy-chart__group">
        <div class="hierarchy-chart__l2-wrapper">
            <div class="hierarchy-chart__l2 hierarchy-chart__box hierarchy-chart__box--environment">環境方針</div>
        </div>
        <div class="hierarchy-chart__l3-wrapper">
             <div class="hierarchy-chart__l3 hierarchy-chart__box hierarchy-chart__box--environment">ISO14001 関連規定類</div>
        </div>
    </div>
    <!-- Group 2 -->
    <div class="hierarchy-chart__group">
        <div class="hierarchy-chart__l2-wrapper">
            <div class="hierarchy-chart__l2 hierarchy-chart__box hierarchy-chart__box--environment">化学物質管理方針</div>
        </div>
    </div>
  </div>

  <!-- 社会への取り組み -->
  <div class="hierarchy-chart__section">
    <div class="hierarchy-chart__l1 hierarchy-chart__box hierarchy-chart__box--social">社会への取り組み</div>
    <!-- Group 1 -->
    <div class="hierarchy-chart__group">
        <div class="hierarchy-chart__l2-wrapper">
            <div class="hierarchy-chart__l2 hierarchy-chart__box hierarchy-chart__box--social">人権方針</div>
        </div>
        <div class="hierarchy-chart__l3-wrapper">
             <div class="hierarchy-chart__l3 hierarchy-chart__box hierarchy-chart__box--social">紛争鉱物管理運用手順<small>（コンフリクトミネラル）</small></div>
        </div>
    </div>
    <!-- Group 2 -->
    <div class="hierarchy-chart__group">
        <div class="hierarchy-chart__l2-wrapper">
            <div class="hierarchy-chart__l2 hierarchy-chart__box hierarchy-chart__box--social">労働安全衛生方針</div>
        </div>
    </div>
    <!-- Group 3 -->
    <div class="hierarchy-chart__group">
        <div class="hierarchy-chart__l2-wrapper">
            <div class="hierarchy-chart__l2 hierarchy-chart__box hierarchy-chart__box--social">品質方針</div>
        </div>
        <div class="hierarchy-chart__l3-wrapper">
             <div class="hierarchy-chart__l3 hierarchy-chart__box hierarchy-chart__box--social">ISO9001 関連規定類</div>
        </div>
    </div>
  </div>

  <!-- ガバナンスへの取り組み -->
  <div class="hierarchy-chart__section">
    <div class="hierarchy-chart__l1 hierarchy-chart__box hierarchy-chart__box--governance">ガバナンスへの取り組み</div>
    <!-- Group 1 -->
    <div class="hierarchy-chart__group">
        <div class="hierarchy-chart__l2-wrapper">
            <div class="hierarchy-chart__l2 hierarchy-chart__box hierarchy-chart__box--governance">コンプライアンス方針</div>
        </div>
        <div class="hierarchy-chart__l3-wrapper">
             <div class="hierarchy-chart__l3 hierarchy-chart__box hierarchy-chart__box--governance">公正取引運用ガイドライン<br>内部通報制度運用ガイドライン<br>知的財産教育文書</div>
        </div>
    </div>
    <!-- Group 2 -->
    <div class="hierarchy-chart__group">
        <div class="hierarchy-chart__l2-wrapper">
            <div class="hierarchy-chart__l2 hierarchy-chart__box hierarchy-chart__box--governance">情報セキュリティ方針</div>
        </div>
        <div class="hierarchy-chart__l3-wrapper">
             <div class="hierarchy-chart__l3 hierarchy-chart__box hierarchy-chart__box--governance">情報セキュリティ運用手順</div>
        </div>
    </div>
  </div>
</div>
<!-- /wp:html -->',
        )
    );
}
add_action( 'init', 'muashi_register_block_patterns' );
