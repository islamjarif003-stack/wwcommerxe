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

# Ensure Prisma client is in sync at runtime
echo "🧠 Generating Prisma client..."
npx prisma generate

# Apply schema changes automatically on boot
# - If migrations exist: use migrate deploy (production-safe)
# - If no migrations exist yet: optional fallback to db push for table creation
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
    echo "📦 Running database migrations (prisma migrate deploy)..."
    npx prisma migrate deploy
else
    if [ "${AUTO_DB_PUSH:-true}" = "true" ]; then
        echo "📦 No migrations found. Running prisma db push to create/update tables..."
        npx prisma db push
    else
        echo "⚠️ No migrations found and AUTO_DB_PUSH=false. Skipping schema apply."
    fi
fi

# Seed superadmin if not exists (idempotent)
if [ "${RUN_SEED:-false}" = "true" ]; then
    echo "🌱 Running seed..."
    node prisma/seed-demo.js
fi

echo "🎉 Starting Next.js..."
exec "$@"
