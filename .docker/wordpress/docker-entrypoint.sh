#!/bin/bash
set -euo pipefail

WP_PATH=/var/www/html

if [ ! -f "${WP_PATH}/wp-load.php" ]; then
	echo "Downloading WordPress core..."
	wp core download \
		--locale="${WP_LOCALE:-ja}" \
		--path="${WP_PATH}" \
		--allow-root
fi

if [ ! -f "${WP_PATH}/wp-config.php" ]; then
	echo "Creating wp-config.php..."
	wp config create \
		--dbname="${WORDPRESS_DB_NAME}" \
		--dbuser="${WORDPRESS_DB_USER}" \
		--dbpass="${WORDPRESS_DB_PASSWORD}" \
		--dbhost="${WORDPRESS_DB_HOST}" \
		--dbcharset=utf8mb4 \
		--dbcollate=utf8mb4_unicode_ci \
		--locale="${WP_LOCALE:-ja}" \
		--path="${WP_PATH}" \
		--allow-root
	wp config set WP_DEBUG true --raw --path="${WP_PATH}" --allow-root
	wp config set WP_DEBUG_LOG true --raw --path="${WP_PATH}" --allow-root
	wp config set WP_DEBUG_DISPLAY false --raw --path="${WP_PATH}" --allow-root
fi

MAX_WAIT=60
WAITED=0
until mysqladmin ping -h "${WORDPRESS_DB_HOST}" -u "${WORDPRESS_DB_USER}" -p"${WORDPRESS_DB_PASSWORD}" --silent 2>/dev/null; do
	sleep 2
	WAITED=$((WAITED + 2))
	if [ "$WAITED" -ge "$MAX_WAIT" ]; then
		echo "ERROR: MySQL connection timed out after ${MAX_WAIT}s" >&2
		exit 1
	fi
	echo "Waiting for MySQL... (${WAITED}/${MAX_WAIT}s)"
done

if [ "${WP_AUTO_INSTALL:-false}" = "true" ] && ! wp core is-installed --path="${WP_PATH}" --allow-root 2>/dev/null; then
	echo "Installing WordPress..."
	wp core install \
		--url="${WP_HOME}" \
		--title="${WP_TITLE:-Design Inserter Dev}" \
		--admin_user="${WP_ADMIN_USER:-admin}" \
		--admin_password="${WP_ADMIN_PASS:-admin}" \
		--admin_email="${WP_ADMIN_EMAIL:-admin@example.com}" \
		--skip-email \
		--path="${WP_PATH}" \
		--allow-root
	wp rewrite structure '/%postname%/' --path="${WP_PATH}" --allow-root
fi

if wp core is-installed --path="${WP_PATH}" --allow-root 2>/dev/null; then
	if [ -n "${WP_THEME:-}" ]; then
		wp theme activate "${WP_THEME}" --path="${WP_PATH}" --allow-root 2>/dev/null || true
	fi

	if [ -n "${WP_PLUGINS:-}" ]; then
		for plugin in $WP_PLUGINS; do
			wp plugin install "$plugin" --activate --path="${WP_PATH}" --allow-root 2>/dev/null || true
		done
	fi
fi

mkdir -p "${WP_PATH}/wp-content/uploads"
chown -R www-data:www-data "${WP_PATH}/wp-content/uploads" 2>/dev/null || true

exec apache2-foreground
