FROM php:8.4-cli-alpine

RUN apk add --no-cache \
    bash curl git unzip libzip-dev oniguruma-dev icu-dev \
    freetype-dev libjpeg-turbo-dev libpng-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql mbstring intl zip pcntl gd \
    && docker-php-ext-enable gd \
    && php -m | grep -i '^gd$'

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock* ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

COPY . .

RUN composer dump-autoload --optimize --no-dev \
    && php artisan package:discover --ansi

RUN chmod +x /app/start.sh

EXPOSE 10000
CMD ["/app/start.sh"]