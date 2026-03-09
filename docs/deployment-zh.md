# NextSuit 四项目部署文档（中文）

本文档用于部署以下 4 个项目：

- `apps/api`（Node.js + Express + Prisma + PostgreSQL）
- `apps/admin-web`（React + Vite 管理后台）
- `apps/marketing-web`（Next.js 官网）
- `apps/blog-web`（Next.js 博客）

## 1. 推荐部署架构

推荐组合（兼顾稳定性和上手速度）：

| 项目 | 平台建议 | 域名建议 | 说明 |
| --- | --- | --- | --- |
| API | Render 或 Railway | `https://api.yourdomain.com` | 提供统一后端接口和上传文件 |
| Admin | Vercel | `https://admin.yourdomain.com` | React SPA 管理后台 |
| Marketing | Vercel | `https://www.yourdomain.com` | 官网和线索表单 |
| Blog | Vercel | `https://blog.yourdomain.com` | 文章列表、详情、SEO |
| PostgreSQL | Render / Railway / Neon | 平台内网连接 | 用于业务数据持久化 |

关键建议：

1. `admin`、`marketing`、`blog`、`api` 尽量使用同一主域名的子域（如 `*.yourdomain.com`）。
2. 当前登录态依赖 Cookie（`sameSite=lax`），同主域子域更稳定。
3. 当前上传文件默认落在 API 本地磁盘（`uploads/images`），容器重启可能丢失，见“常见问题”。

## 2. 部署前检查（本地）

先在本地确认构建通过，避免线上排错。

```bash
nvm use 20
pnpm install
pnpm run ci:check
```

可选：验证 API 关键链路。

```bash
pnpm run smoke:api
```

## 3. 生产环境变量清单

以下变量按你当前项目代码实际需要整理。

### 3.1 API（`apps/api`）

| 变量 | 必填 | 示例 |
| --- | --- | --- |
| `NODE_ENV` | 是 | `production` |
| `PORT` | 是（或平台注入） | `4000` |
| `API_PREFIX` | 是 | `/api/v1` |
| `DATABASE_URL` | 是 | `postgresql://user:pass@host:5432/db?schema=public` |
| `JWT_SECRET` | 是 | 长随机字符串（>= 32 位） |
| `JWT_EXPIRES_IN` | 否 | `7d` |
| `COOKIE_NAME` | 否 | `nextsuit_session` |
| `CORS_ORIGIN` | 是 | `https://admin.yourdomain.com,https://www.yourdomain.com,https://blog.yourdomain.com` |
| `PUBLIC_BASE_URL` | 是 | `https://api.yourdomain.com` |
| `DEFAULT_ORG_SLUG` | 是 | `nextsuit-demo` |
| `ADMIN_EMAIL` | 是 | `admin@nextsuit.dev` |
| `ADMIN_PASSWORD` | 是 | 强密码 |

### 3.2 Admin（`apps/admin-web`）

| 变量 | 必填 | 示例 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | 是 | `https://api.yourdomain.com/api/v1` |
| `VITE_ORG_SLUG` | 是 | `nextsuit-demo` |

### 3.3 Marketing（`apps/marketing-web`）

| 变量 | 必填 | 示例 |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | 是 | `https://api.yourdomain.com/api/v1` |
| `NEXT_PUBLIC_ORG_SLUG` | 是 | `nextsuit-demo` |
| `NEXT_PUBLIC_BLOG_URL` | 是 | `https://blog.yourdomain.com` |

### 3.4 Blog（`apps/blog-web`）

| 变量 | 必填 | 示例 |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | 是 | `https://blog.yourdomain.com` |
| `NEXT_PUBLIC_API_BASE_URL` | 是 | `https://api.yourdomain.com/api/v1` |
| `NEXT_PUBLIC_ORG_SLUG` | 是 | `nextsuit-demo` |

## 4. 生产部署步骤（推荐顺序）

## 4.1 部署 PostgreSQL

在 Render / Railway / Neon 创建 PostgreSQL 实例，拿到连接串，填到 API 的 `DATABASE_URL`。

建议先确认数据库连通后再部署 API。

## 4.2 部署 API（Render / Railway）

以 monorepo 根目录部署，使用以下命令：

- Build Command

```bash
corepack enable && pnpm install --frozen-lockfile && pnpm --filter @nextsuit/api prisma:generate && pnpm --filter @nextsuit/api build
```

- Start Command

```bash
pnpm --filter @nextsuit/api start
```

首次上线后执行迁移（在平台 Shell 或一次性 Job 执行）：

```bash
pnpm --filter @nextsuit/api exec prisma migrate deploy
pnpm --filter @nextsuit/api prisma:seed
```

检查：

- `https://api.yourdomain.com/api/v1/health`
- `https://api.yourdomain.com/docs`

## 4.3 部署 Marketing（Vercel）

1. Vercel 导入仓库。
2. Root Directory 选 `apps/marketing-web`。
3. 配置环境变量（见 3.3）。
4. Deploy。

## 4.4 部署 Blog（Vercel）

1. Root Directory 选 `apps/blog-web`。
2. 配置环境变量（见 3.4）。
3. Deploy。

## 4.5 部署 Admin（Vercel）

1. Root Directory 选 `apps/admin-web`。
2. 配置环境变量（见 3.2）。
3. Deploy。

Admin 是 React SPA，若刷新子路由出现 404，可在 `apps/admin-web/vercel.json` 添加回退规则：

```json
{
  "rewrites": [{ "source": "/:path*", "destination": "/index.html" }]
}
```

## 5. 上线联调清单

按顺序检查：

1. API 健康检查：`/api/v1/health` 返回 `ok`。
2. Admin 登录：`admin@nextsuit.dev` / 你设置的生产密码。
3. Marketing 提交线索：Admin 的 `Leads` 页面能看到新增数据。
4. Marketing 联系表单：Admin 的 `Contacts` 页面能看到记录。
5. Blog 订阅：Admin 的 `Subscribers` 页面能看到记录。
6. Admin 新建文章并上传封面：Blog 文章列表和详情可看到封面。

## 6. 常见问题与处理

### 6.1 Admin 登录后 401 / 登录态丢失

排查顺序：

1. API 的 `CORS_ORIGIN` 是否包含 `admin` 域名（必须完整带 `https://`）。
2. 前端请求是否携带 `credentials: include`（项目里已配置）。
3. 域名是否同主域子域（推荐 `*.yourdomain.com`）。

如果前后端是完全不同站点（非同主域），可能需要把 `apps/api/src/modules/auth/auth.routes.ts` 里的 Cookie 策略改为：

- `sameSite: "none"`
- `secure: true`

### 6.2 封面图上传后线上偶尔消失

当前文件存储在 API 容器本地目录 `uploads/images`。很多 PaaS 容器重启后本地文件不保留。

解决方案：

1. 作品集演示：可接受（重启后重新上传）。
2. 生产方案：改成对象存储（S3 / Cloudinary / R2）。

### 6.3 Blog/Marketing 调不到 API

1. 检查 `NEXT_PUBLIC_API_BASE_URL` 是否为生产 API 地址。 
2. 检查 API 是否启用 HTTPS。 
3. 检查 `x-org-slug` 对应组织是否存在（默认 `nextsuit-demo`）。

### 6.4 Prisma 迁移失败

1. 确认 `DATABASE_URL` 指向生产库。 
2. 先运行 `prisma migrate deploy`，不要在生产库跑 `migrate dev`。 
3. 如需重置演示数据，谨慎处理生产库，避免直接 `reset`。

## 7. 发布建议（给 Upwork 展示）

建议至少准备以下 4 条公开链接：

1. Marketing 站点 URL
2. Blog 站点 URL
3. Admin 演示 URL（可提供测试账号）
4. API Swagger URL（`/docs`）

再附一段说明：

- “三个前端应用共用一个 Node.js API 与 PostgreSQL，支持真实表单入库、服务端分页筛选、文章 CRUD 与内容统计。”

这样能明显提升客户对“真实项目能力”的信任。
