#!/bin/bash
set -euo pipefail

# 1. WPコアダウンロード（未ダウンロードの場合のみ）
if [ ! -f /var/www/html/wp-load.php ]; then
	echo "WordPress コアをダウンロード中..."
	wp core download \
		--locale="${WP_LOCALE:-ja}" \
		--path=/var/www/html \
		--allow-root
fi

# 2. wp-config.php 生成（存在しなければ）
if [ ! -f /var/www/html/wp-config.php ]; then
	echo "wp-config.php を生成中..."
	wp config create \
		--dbname="${WORDPRESS_DB_NAME}" \
		--dbuser="${WORDPRESS_DB_USER}" \
		--dbpass="${WORDPRESS_DB_PASSWORD}" \
		--dbhost="${WORDPRESS_DB_HOST}" \
		--dbcharset=utf8mb4 \
		--dbcollate=utf8mb4_unicode_ci \
		--locale="${WP_LOCALE:-ja}" \
		--path=/var/www/html \
		--allow-root
	wp config set WP_DEBUG true --raw --allow-root
	wp config set WP_DEBUG_LOG true --raw --allow-root
	wp config set WP_DEBUG_DISPLAY false --raw --allow-root
fi

# 3. DB接続待機（タイムアウト30秒）
# WP-CLIのwp db checkはMariaDBクライアント経由でSSL問題が起きるため mysqladmin を使用
MAX_WAIT=30
WAITED=0
until mysqladmin ping -h "${WORDPRESS_DB_HOST}" -u "${WORDPRESS_DB_USER}" -p"${WORDPRESS_DB_PASSWORD}" --silent 2>/dev/null; do
	sleep 2
	WAITED=$((WAITED + 2))
	if [ "$WAITED" -ge "$MAX_WAIT" ]; then
		echo "ERROR: MySQL接続タイムアウト (${MAX_WAIT}秒)" >&2
		exit 1
	fi
	echo "MySQL接続待機中... (${WAITED}/${MAX_WAIT}秒)"
done

# 4. WordPressインストール（未インストールの場合）
if ! wp core is-installed --allow-root 2>/dev/null; then
	echo "WordPress をインストール中..."
	wp core install \
		--url="${WP_HOME}" \
		--title="${WP_TITLE:-MusashiPaint}" \
		--admin_user="${WP_ADMIN_USER:-admin}" \
		--admin_password="${WP_ADMIN_PASS:-admin}" \
		--admin_email="${WP_ADMIN_EMAIL:-admin@example.com}" \
		--skip-email \
		--allow-root
	wp rewrite structure '/%postname%/' --allow-root
fi

# 5. テーマ有効化
wp theme activate "${WP_THEME:-muashi}" --allow-root 2>/dev/null || true

# 6. プラグインインストール（WP_PLUGINS環境変数にリストがあれば）
if [ -n "${WP_PLUGINS:-}" ]; then
	for plugin in $WP_PLUGINS; do
		wp plugin install "$plugin" --activate --allow-root 2>/dev/null || true
	done
fi

# 7. Mailpit用 mu-plugin 生成（SMTP設定を自動構成）
mkdir -p /var/www/html/wp-content/mu-plugins
cat > /var/www/html/wp-content/mu-plugins/docker-smtp.php << 'MUEOF'
<?php
/**
 * Docker環境用SMTP設定（Mailpit経由）
 * docker-entrypoint.shが自動生成 — 手動編集不要
 */
add_action( 'phpmailer_init', function( $phpmailer ) {
	$phpmailer->isSMTP();
	$phpmailer->Host     = getenv( 'SMTP_HOST' ) ?: 'musashi-mail';
	$phpmailer->Port     = (int) ( getenv( 'SMTP_PORT' ) ?: 1025 );
	$phpmailer->SMTPAuth = false;
} );
MUEOF

# 8. uploads ディレクトリ権限修正
chown -R www-data:www-data /var/www/html/wp-content/uploads 2>/dev/null || true

# 9. Apache起動（PID 1 に置換 = シグナル伝播のため exec）
exec apache2-foreground
