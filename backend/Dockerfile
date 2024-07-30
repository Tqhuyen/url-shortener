# syntax=docker/dockerfile:1


# Giai đoạn cài đặt các gói phụ thuộc với Composer
FROM php:8.3.3-cli as deps

# Cài đặt các công cụ cần thiết cho phpize và autoconf
RUN apt-get update && apt-get install -y \
    autoconf \
    build-essential \
    libtool \ 
    libzip-dev \
    unzip \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /app
COPY composer.json composer.lock ./
RUN docker-php-ext-install zip
RUN pecl install mongodb && docker-php-ext-enable mongodb zip

RUN --mount=type=bind,source=composer.json,target=composer.json \
    --mount=type=bind,source=composer.lock,target=composer.lock \
    --mount=type=cache,target=/tmp/cache \
    composer install --no-dev --no-interaction


# run app    
FROM php:8.3.3-apache as final

RUN apt-get update && apt-get install -y \
    && a2enmod rewrite

RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
RUN docker-php-ext-install pdo pdo_mysql mysqli


COPY --from=deps app/vendor/ /var/www/html/vendor

RUN pecl install mongodb \
    && docker-php-ext-enable mongodb

COPY ./docker/apache.conf /etc/apache2/sites-available/000-default.conf
# Enable mod_rewrite
RUN a2enmod headers
RUN a2enmod rewrite
COPY ./src /var/www/html
USER www-data
