# 🚀 WW Commerce — Production Deployment Guide

## Quick Start (Docker)

```bash
# 1. Clone & setup
git clone your-repo
cd wwcommerce
cp .env.example .env
nano .env   # Fill in your values

# 2. Start everything
docker-compose up -d

# 3. Seed database (first time only)
docker-compose exec app node prisma/seed-demo.js

# 4. Generate 10,000+ products (optional)
docker-compose exec app node prisma/generate-10k-products.js --count=10000
```

---

## Server Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 1 vCPU | 2 vCPU |
| RAM | 1 GB | 2 GB |
| Storage | 20 GB SSD | 50 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Node.js | 20.x LTS | 20.x LTS |
| PostgreSQL | 14+ | 16 |

---

## Deployment Options

### Option A — VPS (DigitalOcean / Contabo / Linode)

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Nginx (if not using Docker nginx)
sudo apt install nginx certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Copy SSL certs for Docker nginx (if using)
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem docker/nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem docker/nginx/ssl/

# Start
docker-compose up -d
```

### Option B — Railway.app (Easiest)

1. Push code to GitHub
2. Go to railway.app → New Project → Deploy from GitHub
3. Add PostgreSQL plugin
4. Set environment variables (copy from .env.example)
5. Deploy ✅ (Railway detects Next.js automatically)

### Option C — Vercel + Neon PostgreSQL (Free Tier)

1. Push to GitHub
2. Import on vercel.com
3. Create free DB on neon.tech
4. Add `DATABASE_URL` to Vercel env vars
5. Deploy ✅

---

## Required Environment Variables

```bash
DATABASE_URL="postgresql://..."    # Required
JWT_SECRET="..."                    # Required — min 32 chars
ADMIN_SETUP_KEY="..."               # Required — for first admin creation
NEXT_PUBLIC_APP_URL="https://..."   # Required — your domain
```

---

## First-Time Setup After Deploy

```bash
# 1. Run database migrations
npx prisma migrate deploy

# 2. Create superadmin (visit this URL in browser):
GET https://yourdomain.com/api/auth/setup-admin
# OR via API:
curl -X POST https://yourdomain.com/api/auth/setup-admin \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@yourdomain.com","password":"StrongPass!","setupKey":"YOUR_ADMIN_SETUP_KEY"}'

# 3. Seed sample data (optional)
node prisma/seed-demo.js

# 4. Generate products (optional)
node prisma/generate-10k-products.js --count=10000
```

---

## Database Backup

```bash
# Backup
docker-compose exec db pg_dump -U wwadmin wwcommerce > backup_$(date +%Y%m%d).sql

# Restore
docker-compose exec -T db psql -U wwadmin wwcommerce < backup_20240101.sql
```

---

## Performance at 10,000+ Products

The database is configured with indexes on:
- `categoryId` — fast category filtering
- `isActive`, `isFeatured` — fast listing queries  
- `demandScore`, `soldCount` — AI sorting
- `basePrice` — price range filtering
- `createdAt` — newest first pagination

**Expected performance:**
- Product listing: ~15ms per page
- Category filter: ~20ms  
- Search: ~50ms (with pg_trgm)
- 10K initial bulk insert: ~2 seconds

---

## Monitoring

```bash
# Check app health
curl https://yourdomain.com/api/health

# Watch logs
docker-compose logs -f app

# Database size
docker-compose exec db psql -U wwadmin -c "SELECT pg_size_pretty(pg_database_size('wwcommerce'));"
```
