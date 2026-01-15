<?php
/**
 * Master Test Runner
 *
 * Usage: php run-all-tests.php (from tests dir)
 *    or  php tests/run-all-tests.php (from root)
 */

$test_dir = __DIR__;
$tests = [
    'test-voice-order.php',
    'test-career-permalink.php',
    'test-image-responsive.php',
    'test-pagination.php',
    'test-template-integrity.php',
    'test-inquiry-approval-plugin.php',
    'test-top-section-order.php',
    'test-interview-post-type.php',
    'test-language-links.php',
    'test-media-page.php',
    'test-faq-page.php',
    'test-news-page.php',
];

$passed_count = 0;
$failed_count = 0;

echo "Running PHP Test Suite...\n";
echo "========================================\n";

foreach ( $tests as $test ) {
    $script_path = $test_dir . '/' . $test;
    if ( ! file_exists( $script_path ) ) {
        echo "[ERROR] Test file not found: $script_path\n";
        $failed_count++;
        continue;
    }

    $php_ini = php_ini_loaded_file();
    $php_ini_arg = $php_ini ? ' -c ' . escapeshellarg($php_ini) : '';
    $cmd = PHP_BINARY . $php_ini_arg . " " . escapeshellarg( $script_path );
    
    // Header for the test
    echo "\n>>> Running: $test\n";
    
    // Run script
    passthru( $cmd, $return_var );
    
    if ( $return_var === 0 ) {
        $passed_count++;
    } else {
        $failed_count++;
    }
}

echo "\n";
echo "========================================\n";
echo "SUMMARY\n";
echo "========================================\n";
echo "Total Tests: " . count( $tests ) . "\n";
echo "Passed:      $passed_count\n";
echo "Failed:      $failed_count\n";

if ( $failed_count === 0 ) {
    echo "RESULT: ALL TESTS PASSED\n";
    exit(0);
} else {
    echo "RESULT: FAILURES DETECTED\n";
    exit(1);
}
