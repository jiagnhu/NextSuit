# NextSuit 单子域部署文档（studio.tangyikai.top）

本文档按你当前目标整理：

- 只使用一个子域名：`studio.tangyikai.top`
- 路径分流 4 个项目
- 服务器自部署（Nginx + PM2 + PostgreSQL）

## 1. 最终访问路径规划

- Marketing：`https://studio.tangyikai.top/nextsuit`
- Admin：`https://studio.tangyikai.top/nextsuit/admin`
- Blog：`https://studio.tangyikai.top/nextsuit/blog`
- API：`https://studio.tangyikai.top/nextsuit/api/v1`
- Uploads：`https://studio.tangyikai.top/nextsuit/uploads/...`

说明：

1. 本仓库已加了子路径部署配置：
- `admin-web` 支持 `VITE_APP_BASE_PATH`
- `marketing-web` 支持 `NEXT_PUBLIC_BASE_PATH`
- `blog-web` 支持 `NEXT_PUBLIC_BASE_PATH`
2. 你只需要按下面环境变量填好并部署。

## 2. 服务器准备

建议环境：

- Ubuntu 22.04+
- Node.js 20（必须）
- pnpm 10+
- Nginx
- PM2
- PostgreSQL 14+

安装（示例）：

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx postgresql postgresql-contrib
sudo npm i -g pnpm pm2
```

## 3. 代码部署到服务器

```bash
cd /www/wwwroot/studio.tangyikai.top
git clone <你的仓库地址> NextSuit
cd NextSuit
nvm use 20 || true
pnpm install --frozen-lockfile
```

## 4. 生产环境变量

## 4.1 API：`apps/api/.env`

```env
NODE_ENV=production
PORT=18640
API_PREFIX=/api/v1
DATABASE_URL=postgresql://<user>:<password>@127.0.0.1:5432/nextsuit?schema=public
JWT_SECRET=<请使用高强度随机字符串>
JWT_EXPIRES_IN=7d
COOKIE_NAME=nextsuit_session
CORS_ORIGIN=https://studio.tangyikai.top
PUBLIC_BASE_URL=https://studio.tangyikai.top/nextsuit
DEFAULT_ORG_SLUG=nextsuit-demo
ADMIN_EMAIL=admin@nextsuit.dev
ADMIN_PASSWORD=<你的生产密码>
```

## 4.2 Admin：`apps/admin-web/.env.local`

```env
VITE_API_BASE_URL=https://studio.tangyikai.top/nextsuit/api/v1
VITE_ORG_SLUG=nextsuit-demo
VITE_APP_BASE_PATH=/nextsuit/admin
```

## 4.3 Marketing：`apps/marketing-web/.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=https://studio.tangyikai.top/nextsuit/api/v1
NEXT_PUBLIC_ORG_SLUG=nextsuit-demo
NEXT_PUBLIC_BLOG_URL=https://studio.tangyikai.top/nextsuit/blog
NEXT_PUBLIC_BASE_PATH=/nextsuit
```

## 4.4 Blog：`apps/blog-web/.env.local`

```env
NEXT_PUBLIC_SITE_URL=https://studio.tangyikai.top/nextsuit/blog
NEXT_PUBLIC_API_BASE_URL=https://studio.tangyikai.top/nextsuit/api/v1
NEXT_PUBLIC_ORG_SLUG=nextsuit-demo
NEXT_PUBLIC_ADMIN_URL=https://studio.tangyikai.top/nextsuit/admin/content/articles
NEXT_PUBLIC_BASE_PATH=/nextsuit/blog
```

## 5. 数据库初始化

```bash
cd /www/wwwroot/studio.tangyikai.top/NextSuit
pnpm --filter @nextsuit/api prisma:generate
pnpm --filter @nextsuit/api exec prisma migrate deploy
pnpm --filter @nextsuit/api prisma:seed
```

## 6. 构建项目

```bash
cd /www/wwwroot/studio.tangyikai.top/NextSuit
pnpm --filter @nextsuit/api build
pnpm --filter @nextsuit/admin-web build
pnpm --filter @nextsuit/marketing-web build
pnpm --filter @nextsuit/blog-web build
```

## 7. PM2 启动（API + Marketing + Blog）

项目已提供 PM2 配置文件：

- `deploy/pm2/ecosystem.config.cjs`

其中包含 3 个进程：`nextsuit-api`、`nextsuit-marketing`、`nextsuit-blog`。

说明：`admin-web` 不走 PM2，使用 Nginx 直接托管静态构建目录 `apps/admin-web/dist`。

启动：

```bash
cd /www/wwwroot/studio.tangyikai.top/NextSuit
pm2 start deploy/pm2/ecosystem.config.cjs
pm2 save
pm2 startup
```

## 8. Nginx 配置（单域路径分流）

项目已提供模板：

- `deploy/nginx/studio.tangyikai.top.conf`

使用方式：

```bash
sudo cp /www/wwwroot/studio.tangyikai.top/NextSuit/deploy/nginx/studio.tangyikai.top.conf /etc/nginx/sites-available/studio.tangyikai.top
sudo ln -s /etc/nginx/sites-available/studio.tangyikai.top /etc/nginx/sites-enabled/studio.tangyikai.top
sudo nginx -t
sudo systemctl reload nginx
```

如果你使用宝塔默认站点模板，请关闭或注释这行，避免与本项目路由规则冲突：

`include /www/server/panel/vhost/rewrite/html_studio.tangyikai.top.conf;`

确保 `admin-web` 已执行过 `build`，且存在目录：`/www/wwwroot/studio.tangyikai.top/NextSuit/apps/admin-web/dist`。

再配置 SSL（推荐 Certbot）：

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d studio.tangyikai.top
```

## 9. 上线验证清单

1. `https://studio.tangyikai.top/nextsuit` 可打开。  
2. `https://studio.tangyikai.top/nextsuit/admin` 可登录。  
3. `https://studio.tangyikai.top/nextsuit/blog` 可查看文章。  
4. 官网提交联系/线索后，Admin 中可见。  
5. Admin 新建文章并上传封面后，Blog 可见封面图。  
6. `https://studio.tangyikai.top/nextsuit/api/v1/health` 返回健康状态。

## 10. 常见问题

1. Admin 登录 401：检查 API `CORS_ORIGIN` 是否为 `https://studio.tangyikai.top`。  
2. 文章封面图不显示：检查 Nginx 是否代理了 `/nextsuit/uploads/`。  
3. 刷新 Admin 子页面 404：检查 Nginx 中 `/nextsuit/admin/` 是否为静态目录映射，并且 `apps/admin-web/dist/index.html` 存在。  
4. Next 资源 404：确认 `NEXT_PUBLIC_BASE_PATH` 和 `VITE_APP_BASE_PATH` 已设置并重新 build。

## 11. 日常发布与重启（推荐）

根 `package.json` 已提供两个命令，后续不用手敲一长串：

```bash
cd /www/wwwroot/studio.tangyikai.top/NextSuit

# 有代码更新时：构建四个项目并重启 PM2（api/marketing/blog）
pnpm run deploy:build

# 仅重启服务（不重新构建）
pnpm run deploy:restart
```

说明：

1. `admin-web` 不走 PM2，但会在 `deploy:build` 里重新构建静态文件，Nginx 自动读取新产物。  
2. 只有改了环境变量（`.env` / `.env.local`）时，才需要重新构建对应项目。  
