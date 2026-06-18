#!/bin/sh
set -e

echo "[startup] clearing Laravel caches"
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Run migrations at startup so free-tier deployments work without shell access.
# Fail fast if DB config is wrong, instead of starting an API that returns 500s.
echo "[startup] running database migrations"
php artisan migrate --force --no-interaction -v

# Optional one-time seed for environments without shell access (e.g. Render free tier).
# Set RUN_DB_SEED=true in env, deploy once, then set it back to false.
if [ "${RUN_DB_SEED:-false}" = "true" ]; then
	echo "[startup] RUN_DB_SEED=true, running database seeders"
	php artisan db:seed --force --no-interaction -v
fi

# Queue worker in background
echo "[startup] starting queue worker"
php artisan queue:work --sleep=1 --tries=3 --timeout=120 &

# Web server on Render-assigned port
echo "[startup] starting web server on port ${PORT:-10000}"
php artisan serve --host=0.0.0.0 --port=${PORT:-10000}