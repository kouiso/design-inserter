#!/bin/bash
set -euo pipefail

BEDROCK_PATH="/var/www/html"
BEDROCK_WEB_PATH="${BEDROCK_PATH}/web"
WP_PATH="${BEDROCK_WEB_PATH}/wp"

# 1. Bedrock一式を初期化（初回のみ）
if [ ! -f "${BEDROCK_PATH}/composer.json" ]; then
	echo "Bedrock を初期化中..."
	tmp_bedrock_dir="$(mktemp -d)"
	composer create-project roots/bedrock "${tmp_bedrock_dir}" --no-interaction --prefer-dist
	mkdir -p "${BEDROCK_PATH}"
	cp -a "${tmp_bedrock_dir}"/. "${BEDROCK_PATH}/"
	rm -rf "${tmp_bedrock_dir}"
fi

# 2. 依存パッケージを導入
cd "${BEDROCK_PATH}"
composer install --no-interaction --prefer-dist --no-progress

# 3. Bedrock .env を生成/更新
if [ ! -f "${BEDROCK_PATH}/.env" ]; then
	cp "${BEDROCK_PATH}/.env.example" "${BEDROCK_PATH}/.env"
fi

set_bedrock_env() {
	local key="$1"
	local value="$2"
	if grep -q "^${key}=" "${BEDROCK_PATH}/.env"; then
		sed -i "s|^${key}=.*|${key}='${value}'|" "${BEDROCK_PATH}/.env"
	else
		echo "${key}='${value}'" >> "${BEDROCK_PATH}/.env"
	fi
}

set_bedrock_env "DB_NAME" "${WORDPRESS_DB_NAME}"
set_bedrock_env "DB_USER" "${WORDPRESS_DB_USER}"
set_bedrock_env "DB_PASSWORD" "${WORDPRESS_DB_PASSWORD}"
set_bedrock_env "DB_HOST" "${WORDPRESS_DB_HOST}"
set_bedrock_env "WP_HOME" "${WP_HOME}"
set_bedrock_env "WP_SITEURL" "${WP_HOME}/wp"
set_bedrock_env "WP_ENV" "development"

# 4. DB接続待機（タイムアウト60秒）
MAX_WAIT=60
WAITED=0
until mysqladmin ping -h "${WORDPRESS_DB_HOST}" -u "${WORDPRESS_DB_USER}" -p"${WORDPRESS_DB_PASSWORD}" --silent 2>/dev/null; do
	sleep 2
	WAITED=$((WAITED + 2))
	if [ "${WAITED}" -ge "${MAX_WAIT}" ]; then
		echo "ERROR: MySQL接続タイムアウト (${MAX_WAIT}秒)" >&2
		exit 1
	fi
	echo "MySQL接続待機中... (${WAITED}/${MAX_WAIT}秒)"
done

# 5. WordPressインストール（未インストール時のみ）
if ! wp core is-installed --path="${WP_PATH}" --allow-root 2>/dev/null; then
	echo "Bedrock WordPress をインストール中..."
	wp core install \
		--url="${WP_HOME}" \
		--title="${WP_TITLE:-MusashiPaint Bogo}" \
		--admin_user="${WP_ADMIN_USER:-admin}" \
		--admin_password="${WP_ADMIN_PASS:-admin}" \
		--admin_email="${WP_ADMIN_EMAIL:-admin@example.com}" \
		--skip-email \
		--path="${WP_PATH}" \
		--allow-root
	wp rewrite structure '/%postname%/' --path="${WP_PATH}" --allow-root
fi

# 6. テーマ有効化
wp theme activate "${WP_THEME:-muashi-bogo}" --path="${WP_PATH}" --allow-root 2>/dev/null || true

# 7. プラグイン導入
if [ -n "${WP_PLUGINS:-}" ]; then
	for plugin in ${WP_PLUGINS}; do
		wp plugin install "${plugin}" --activate --path="${WP_PATH}" --allow-root 2>/dev/null || true
	done
fi

# 8. Mailpit用 mu-plugin 生成
mkdir -p "${BEDROCK_WEB_PATH}/app/mu-plugins"
cat > "${BEDROCK_WEB_PATH}/app/mu-plugins/docker-smtp.php" << 'MUEOF'
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

# 9. ドキュメントルート権限修正（Apacheアクセス許可）
chmod 755 "${BEDROCK_PATH}" "${BEDROCK_WEB_PATH}"
chown -R www-data:www-data "${BEDROCK_PATH}" 2>/dev/null || true

# 10. uploads ディレクトリ権限修正
mkdir -p "${BEDROCK_WEB_PATH}/app/uploads"
chown -R www-data:www-data "${BEDROCK_WEB_PATH}/app/uploads" 2>/dev/null || true

# 11. Apache起動
exec apache2-foreground