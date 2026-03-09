# nextsuit-growth-site

Next.js marketing website for NextSuit Growth Suite.

## Stack

- Next.js (App Router)
- TypeScript
- Server Actions
- Shared Node.js API (`apps/api`)

## Routes

- `/` home page with dynamic hero/pricing/articles
- `/contact` contact page with real form submission

## Real Data Flow

- `GET /api/v1/settings/public` -> hero/pricing content
- `GET /api/v1/articles` -> featured insights
- `POST /api/v1/leads` -> demo request
- `POST /api/v1/subscribers` -> newsletter
- `POST /api/v1/contacts` -> contact form

## Local Run

```bash
nvm use 20
cp apps/marketing-web/.env.example apps/marketing-web/.env.local
pnpm install
pnpm --filter @nextsuit/marketing-web dev
```

Default URL: `http://localhost:18632`

## Env Keys

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_ORG_SLUG`
- `NEXT_PUBLIC_BLOG_URL`
- `NEXT_PUBLIC_BASE_PATH` (optional, e.g. `/nextsuit`)
