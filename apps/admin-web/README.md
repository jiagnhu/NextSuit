# suiteops-admin

React admin dashboard for NextSuit Growth Suite.

## Stack

- React 19 + Vite
- React Router
- TypeScript
- Ant Design
- TanStack Query
- Zustand
- @uiw/react-md-editor (Articles markdown rich editor)

## Routes

- `/login`
- `/dashboard`
- `/leads`
- `/contacts`
- `/subscribers`
- `/content/articles`
- `/content/articles/new`
- `/content/articles/:id/edit`
- `/about`

## Articles Features

- Markdown rich editor with toolbar + live preview
- Cover image upload (to API `/uploads/images`)
- Draft auto-save to localStorage

## v2 Enhancement

- Built-in i18n switch in header (`English` / `中文`)
- Language preference persisted in browser localStorage
- Added `About` showcase page with 4-project architecture overview and data-flow diagrams

## Local Run

```bash
nvm use 20
cp apps/admin-web/.env.example apps/admin-web/.env.local
pnpm install
pnpm dev:admin
```

Default backend: `http://localhost:4000/api/v1`

Env keys:

- `VITE_API_BASE_URL`
- `VITE_ORG_SLUG`
