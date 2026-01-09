<?php
/**
 * Template Integrity Test (Issue #85, #90)
 *
 * Usage: php tests/test-template-integrity.php
 */

require_once __DIR__ . '/../app/public/wp-load.php';

echo "\n";
echo "========================================\n";
echo "Template Integrity Test (Issue #85, #90) (PHP)\n";
echo "========================================\n\n";

$theme_dir = get_stylesheet_directory();
$all_passed = true;

// 1. Obsolete Templates
$obsolete_templates = [
    "page-0-blank.php",
    "page-sample.php",
    "page-debug.php",
    "page-test.php",
    "page-old.php",
    "template-old.php"
];

echo "Checking for obsolete template files in $theme_dir ...\n";

foreach ( $obsolete_templates as $tmpl ) {
    if ( file_exists( $theme_dir . '/' . $tmpl ) ) {
        echo "[FAIL] Obsolete template found: $tmpl\n";
        $all_passed = false;
    }
}

if ( $all_passed ) {
    echo "[OK] No obsolete template files found.\n";
}

// 2. Required Templates
$required_templates = [
    "index.php",
    "header.php",
    "footer.php",
    "functions.php",
    "page-voice.php",
    "page-story.php",
    "single-voice.php",
    "single-story.php"
];

$missing_templates = [];

echo "\nChecking for required template files...\n";

foreach ( $required_templates as $tmpl ) {
    if ( file_exists( $theme_dir . '/' . $tmpl ) ) {
        echo "[OK] Required template exists: $tmpl\n";
    } else {
        echo "[FAIL] Required template missing: $tmpl\n";
        $missing_templates[] = $tmpl;
        $all_passed = false;
    }
}

// 3. Obsolete Plugins
$plugins_dir = WP_CONTENT_DIR . '/plugins';
$obsolete_plugins = [
    "debug-plugin",
    "test-plugin",
    "unused-plugin"
];

echo "\nChecking obsolete plugins in $plugins_dir ...\n";

foreach ( $obsolete_plugins as $plugin ) {
    if ( is_dir( $plugins_dir . '/' . $plugin ) ) {
        echo "[FAIL] Obsolete plugin directory found: $plugin\n";
        $all_passed = false;
    }
}
echo "[OK] Plugin check complete.\n";

echo "\n========================================\n";

if ( $all_passed ) {
    echo "PASS: Template integrity check passed!\n";
    exit(0);
} else {
    echo "FAIL: Template integrity check found issues\n";
    if ( ! empty( $missing_templates ) ) {
        echo "Missing: " . implode( ', ', $missing_templates ) . "\n";
    }
    exit(1);
}
