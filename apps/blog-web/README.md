# nextsuit-insights (blog-web)

Next.js blog/content web app connected to real `apps/api` data.

## Implemented Flows

- Public article list (`GET /api/v1/articles`) with:
  - keyword search
  - category filter
  - tag filter
  - pagination
- Article detail by slug (`GET /api/v1/articles/:slug`)
- Public settings-driven hero (`GET /api/v1/settings/public`)
- Newsletter subscription (`POST /api/v1/subscribers`)
- Automatic page view tracking (`POST /api/v1/page-views`) on route changes
- SEO showcase pack:
  - `sitemap.xml` and `robots.txt`
  - `rss.xml` feed
  - dynamic social image endpoint (`/api/og`)
  - JSON-LD structured data on homepage and article pages

## Local Run

1. Prepare env:

```bash
cp apps/blog-web/.env.example apps/blog-web/.env.local
```

2. Start app:

```bash
nvm use 20
pnpm dev:blog
```

- Blog URL: `http://localhost:3003`

## Env Keys

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_ORG_SLUG`
