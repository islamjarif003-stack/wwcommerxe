#!/bin/sh
# docker/entrypoint.sh — runs before the app starts on every container boot

set -e
echo "🚀 WW Commerce starting..."

# Wait for DB to be ready (belt-and-suspenders alongside docker-compose healthcheck)
echo "⏳ Waiting for database..."
until npx prisma db ping 2>/dev/null; do
    echo "   DB not ready yet, retrying in 2s..."
    sleep 2
done
echo "✅ Database ready!"

# Run migrations (safe — only applies pending ones)
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Seed superadmin if not exists (idempotent)
if [ "${RUN_SEED:-false}" = "true" ]; then
    echo "🌱 Running seed..."
    node prisma/seed-demo.js
fi

echo "🎉 Starting Next.js..."
exec "$@"
