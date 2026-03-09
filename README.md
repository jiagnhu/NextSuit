# NextSuit Growth Suite

Monorepo for an Upwork-ready portfolio stack:

- `apps/api` - unified Node.js backend (Express + Prisma + PostgreSQL)
- `apps/admin-web` - React admin dashboard (Vite + React Router + Ant Design + React Query)
- `apps/marketing-web` - Next.js marketing site (real API-connected forms and dynamic sections)
- `apps/blog-web` - Next.js content platform (real API-connected article hub, SEO-ready)

## v2.1 Highlights

- `admin-web` supports i18n language switch (`English` / `中文`) with persisted preference.
- `marketing-web` supports i18n language switch (`English` / `中文`) via locale cookie + server-rendered copy.
- `blog-web` supports i18n language switch (`English` / `中文`) via locale cookie + server-rendered copy.
- `blog-web` and `marketing-web` include API fetch fallback for offline-safe build and CI.
- API health endpoint includes database service check and degraded status response.
- Added CI workflow: typecheck + build for all 4 projects.
- Added one-command CI check: `pnpm run ci:check`.
- Added API smoke test script: `pnpm run smoke:api`.

## Deployment Guide

- Chinese deployment guide: `docs/deployment-zh.md`
- Nginx template for single-subdomain routing: `deploy/nginx/studio.tangyikai.top.conf`
- PM2 process template: `deploy/pm2/ecosystem.config.cjs`

## Quick Start (API)

1. Use Node 20:

```bash
nvm use 20
```

2. Copy env:

```bash
cp apps/api/.env.example apps/api/.env
```

3. Install dependencies:

```bash
pnpm install
```

4. Start PostgreSQL (example):

```bash
docker run --name nextsuit-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=nextsuit -p 5432:5432 -d postgres:16
```

5. Run migrations and seed:

```bash
pnpm --filter @nextsuit/api prisma:migrate
pnpm --filter @nextsuit/api prisma:seed
```

6. Start API:

```bash
pnpm dev:api
```

- API root: `http://localhost:18640`
- Health: `http://localhost:18640/api/v1/health`
- Swagger: `http://localhost:18640/docs`

## Run Admin Web

1. Prepare env:

```bash
cp apps/admin-web/.env.example apps/admin-web/.env.local
```

2. Start app:

```bash
nvm use 20
pnpm dev:admin
```

- Admin URL: `http://localhost:18631`
- Login: `admin@nextsuit.dev` / `Admin123!`

## Run Marketing Web

1. Prepare env:

```bash
cp apps/marketing-web/.env.example apps/marketing-web/.env.local
```

2. Start app:

```bash
nvm use 20
pnpm dev:marketing
```

- Marketing URL: `http://localhost:18632`

## Run Blog Web

1. Prepare env:

```bash
cp apps/blog-web/.env.example apps/blog-web/.env.local
```

2. Start app:

```bash
nvm use 20
pnpm dev:blog
```

- Blog URL: `http://localhost:18633`

## DB Troubleshooting

If you see errors like `role "postgres" does not exist` or `User was denied access on the database`, your local PostgreSQL role/db does not match `apps/api/.env`.

Example for this machine:

```bash
createdb nextsuit
# then set DATABASE_URL in apps/api/.env:
# postgresql://a@localhost:5432/nextsuit?schema=public
pnpm --filter @nextsuit/api prisma:migrate
pnpm --filter @nextsuit/api prisma:seed
```

## Seeded Admin Account

- Email: `admin@nextsuit.dev`
- Password: `Admin123!`

## Smoke Test (API Data Flow)

Run after API is started and seed is ready:

```bash
pnpm run smoke:api
```

Optional env overrides:

```bash
SMOKE_API_BASE_URL=http://localhost:18640/api/v1 \
SMOKE_ORG_SLUG=nextsuit-demo \
SMOKE_ADMIN_EMAIL=admin@nextsuit.dev \
SMOKE_ADMIN_PASSWORD=Admin123! \
pnpm run smoke:api
```

## Implemented MVP Endpoints

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /api/v1/dashboard/overview`
- `GET /api/v1/dashboard/recent-leads`
- `GET /api/v1/dashboard/content-performance`
- `POST /api/v1/contacts`
- `GET /api/v1/contacts`
- `PATCH /api/v1/contacts/:id/status`
- `POST /api/v1/leads`
- `GET /api/v1/leads`
- `GET /api/v1/leads/:id`
- `PATCH /api/v1/leads/:id/status`
- `POST /api/v1/leads/:id/activities`
- `POST /api/v1/subscribers`
- `POST /api/v1/page-views`
- `GET /api/v1/subscribers`
- `PATCH /api/v1/subscribers/:id/status`
- `GET /api/v1/articles`
- `GET /api/v1/articles/admin`
- `GET /api/v1/articles/:slug`
- `POST /api/v1/articles`
- `PATCH /api/v1/articles/:id`
- `PATCH /api/v1/articles/:id/publish`
- `DELETE /api/v1/articles/:id`
- `GET /api/v1/categories`
- `POST /api/v1/categories`
- `GET /api/v1/tags`
- `POST /api/v1/tags`
- `GET /api/v1/settings/public`
- `GET /api/v1/settings`
- `PATCH /api/v1/settings/:key`
- `POST /api/v1/uploads/images`
