# ═══════════════════════════════════════════════════════════════
# WW Commerce — Multi-stage Production Dockerfile
# ═══════════════════════════════════════════════════════════════

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Install ALL deps (including devDeps for build)
RUN npm ci --include=dev

# Generate Prisma client
RUN npx prisma generate

# ─────────────────────────────────────────────────────────────
# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Copy generated prisma client
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma

# Set production env for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Standalone output for smaller Docker image
RUN sed -i 's|// output: "standalone"|output: "standalone"|' next.config.ts || true

RUN npm run build

# ─────────────────────────────────────────────────────────────
# Stage 3: Runner (smallest possible image)
FROM node:20-alpine AS runner
RUN apk add --no-cache curl openssl

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Need prisma globally available to run migrations
RUN npm install -g prisma

# Copy only what's needed to run
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Startup script
COPY docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Set ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "server.js"]
