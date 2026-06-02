FROM php:8.2-apache

# システム依存パッケージ
RUN apt-get update && apt-get install -y --no-install-recommends \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    libzip-dev \
    libicu-dev \
    libexif-dev \
    libonig-dev \
    unzip \
    less \
    default-mysql-client \
    && rm -rf /var/lib/apt/lists/*

# PHP拡張モジュール
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        mysqli \
        pdo_mysql \
        gd \
        zip \
        intl \
        exif \
        opcache \
        mbstring

# XDebug
RUN pecl install xdebug && docker-php-ext-enable xdebug

# Apache mod_rewrite（パーマリンク用）+ AllowOverride All（.htaccess有効化）
RUN a2enmod rewrite \
    && sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# WP-CLI
RUN curl -o /usr/local/bin/wp \
    https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
    && chmod +x /usr/local/bin/wp

# エントリポイント（Windows CRLF対策: sed で \r 除去）
COPY docker-entrypoint.sh /usr/local/bin/
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh \
    && chmod +x /usr/local/bin/docker-entrypoint.sh

WORKDIR /var/www/html
EXPOSE 80
ENTRYPOINT ["docker-entrypoint.sh"]
