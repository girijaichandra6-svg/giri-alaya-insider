# ALAYA INSIDER — Deployment Guide

## Prerequisites

- Hostinger VPS or Node.js hosting plan
- Node.js 20+ installed on the server
- PostgreSQL 16+ database (can be Hostinger's managed DB or a separate VPS)
- pnpm installed globally: `npm install -g pnpm`

## Environment Variables

Set these in your Hostinger control panel or `.env.production` file:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/alayainsider"

# Clerk (Auth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Typesense (Search)
TYPESENSE_API_KEY=...
TYPESENSE_HOST=...
TYPESENSE_PORT=443
TYPESENSE_PROTOCOL=https

# Redis (optional, for rate limiting)
REDIS_URL=redis://...

# Resend (Email)
RESEND_API_KEY=...

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
POSTHOG_API_KEY=...
POSTHOG_HOST=...

# Storage (Cloudflare R2)
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...

# Image optimization
NEXT_PUBLIC_SANITY_PROJECT_ID=...
SANITY_API_TOKEN=...
```

## Step 1: Clone & Install

```bash
git clone <your-repo-url> alaya-insider
cd alaya-insider
pnpm install
```

## Step 2: Database Setup

```bash
# Generate Prisma client
cd packages/db
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed the database (optional, for initial data)
npx tsx prisma/seed.ts

cd ../..
```

## Step 3: Build

```bash
pnpm build
```

## Step 4: Start Production Server

The build produces a standalone output at `apps/web/.next/standalone/`.

### Option A: Direct Node.js (Recommended for VPS)

```bash
cd apps/web

# Copy static assets to standalone
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/static

# Set environment
export NODE_ENV=production
export PORT=3000

# Start server
node .next/standalone/server.js
```

### Option B: Process Manager (PM2)

```bash
npm install -g pm2

cd apps/web
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/static

pm2 start .next/standalone/server.js \
  --name alaya-insider \
  --env NODE_ENV=production \
  --env PORT=3000

pm2 save
pm2 startup
```

### Option C: Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
docker build -t alaya-insider .
docker run -p 3000:3000 --env-file .env.production alaya-insider
```

## Step 5: Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        expires 365d;
        access_log off;
        add_header Cache-Control "public, immutable";
    }

    location /images {
        proxy_pass http://127.0.0.1:3000;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

## Step 6: SSL (Certbot)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Health Check

After deploying, verify:
- `https://yourdomain.com` — Homepage loads with header and footer
- `https://yourdomain.com/api/products?limit=1` — Returns JSON
- `https://yourdomain.com/health` — App health endpoint (if configured)

## Troubleshooting

**502 Bad Gateway**: The Node.js server isn't running or crashed. Check `pm2 status`.

**500 Internal Server Error**: Check environment variables and database connection.

**Missing assets**: Run `cp -r public .next/standalone/` to copy static files.

**Database errors**: Run `cd packages/db && npx prisma migrate deploy` to apply migrations.

## CI/CD (GitHub Actions)

The CI pipeline at `.github/workflows/ci.yml` runs on every push to `main`:
1. Lint & Typecheck
2. Unit & Integration tests (with Postgres service)
3. E2E smoke test
4. Build

To deploy automatically, add a deploy step that SSHes into your server:
```yaml
- name: Deploy
  run: |
    ssh user@host "cd /var/www/alaya && git pull && pnpm install && pnpm build && pm2 restart alaya-insider"
```
