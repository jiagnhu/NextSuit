import bcrypt from "bcryptjs";

import { PrismaClient, ArticleStatus, LeadStatus } from "@prisma/client";

import { env } from "../src/config/env.js";

const prisma = new PrismaClient();

type ArticleSeedItem = {
  title: string;
  slug: string;
  excerpt: string;
  contentMd: string;
  status: ArticleStatus;
  category: "engineering" | "growth";
  tagSlugs: string[];
};

const articleSeed: ArticleSeedItem[] = [
  {
    title: "How to Build a Scalable SaaS Frontend with Next.js",
    slug: "scalable-saas-frontend-nextjs",
    excerpt: "Architecture notes for a production-grade Next.js SaaS frontend.",
    contentMd: "# Scalable SaaS Frontend\n\nThis is a seeded article for demo.",
    status: ArticleStatus.published,
    category: "engineering",
    tagSlugs: ["nextjs", "saas", "architecture"]
  },
  {
    title: "Lead Generation Playbook for B2B Marketing Sites",
    slug: "lead-generation-playbook-b2b",
    excerpt: "Capture and qualify leads through high-intent forms.",
    contentMd: "# Lead Generation\n\nThis is a seeded article for demo.",
    status: ArticleStatus.published,
    category: "growth",
    tagSlugs: ["marketing", "saas"]
  },
  {
    title: "Content Ops Workflow for Product Teams",
    slug: "content-ops-workflow-product-teams",
    excerpt: "How to manage content lifecycle from draft to publish.",
    contentMd: "# Content Ops\n\nThis is a seeded article for demo.",
    status: ArticleStatus.draft,
    category: "growth",
    tagSlugs: ["marketing", "saas"]
  },
  {
    title: "我如何构建了一个 SaaS 系统",
    slug: "how-i-built-a-saas-system",
    excerpt: "从需求拆解、模型设计到上线运维，完整复盘一个可商业化 SaaS 系统的落地过程。",
    contentMd: `# 我如何构建了一个 SaaS 系统

很多人看作品只看页面是否“好看”，但在真实商业项目里，客户真正关心的是：系统是否能长期维护、是否能扩展、是否能支撑业务增长。这个项目的核心目标，就是做一套不仅能演示前端能力，还能展示完整业务闭环的 SaaS 系统。

## 1. 先定义业务闭环，而不是先写页面

在项目开始时，我先把业务链路拆成四段：

1. 流量进入：Marketing Website 提供服务介绍与转化入口。  
2. 留资转化：访客通过 contact/lead/subscriber 表单提交数据。  
3. 内容运营：Blog 读取真实文章、分类、标签并支持筛选分页。  
4. 销售跟进：Admin Dashboard 统一查看线索、联系记录、订阅与内容表现。

这样做的好处是，前后端的每个接口都有明确业务归属，避免“为了做接口而做接口”。

## 2. 技术拆分策略：3 个前端 + 1 个统一后端

我采用了一个统一 Node.js 后端，服务三个前端项目：

- Marketing Web：负责获客、品牌展示、表单提交。  
- Blog Web：负责内容增长、SEO、文章消费场景。  
- Admin Web：负责运营后台、状态管理和数据协同。  
- Core API：提供统一身份、组织上下文、内容与线索能力。

这种结构最接近中小团队的真实交付模型：前台体验可以分开迭代，但数据模型和权限逻辑统一在一个后端维护。

## 3. 数据模型设计：从“关系”出发

我把核心实体定义为：

- organizations / users / roles  
- articles / categories / tags / article_tags  
- leads / contacts / subscribers  
- settings / page_views / dashboard_stats_daily

重点不是表数量，而是关系是否合理。比如：

- 文章与标签是多对多，避免后续标签扩展受限。  
- leads/contacts/subscribers 分开建模，便于后续做不同 SLA 与运营规则。  
- settings 做成键值配置，适合快速支持营销站内容动态化。

## 4. 前后端约定：统一响应、统一分页、统一错误

为了让三个前端接入成本最低，我在 API 层做了统一规范：

- 统一响应结构：\`{ success, data, meta }\`。  
- 分页列表统一 \`page/pageSize/total/totalPages\`。  
- 错误返回统一 \`code/message\`，前端可按 code 做精细提示。

这个规范让 Admin 的表格、Blog 的列表、Marketing 的表单都能复用一套请求和错误处理逻辑。

## 5. 部署与可运维性

项目部署在单域名子路径下，便于演示和后续扩展：

- /nextsuit -> marketing  
- /nextsuit/admin -> admin  
- /nextsuit/blog -> blog  
- /nextsuit/api/v1 -> api

同时支持 Swagger 文档、静态资源代理、上传文件访问、PM2 守护与环境变量隔离。对客户来说，这不是“课堂作业”，而是一套可上线、可继续迭代的工程基础。

## 6. 结果与复盘

这套系统最有价值的地方，是把“前端能力展示”升级成了“产品交付能力展示”。  
我不仅展示了页面实现，还展示了数据流、模型设计、接口规范、后台运营流程和部署思路。这也是客户在筛选长期合作开发者时最看重的部分。`,
    status: ArticleStatus.published,
    category: "engineering",
    tagSlugs: ["saas", "architecture", "nextjs"]
  },
  {
    title: "Node.js 后端架构",
    slug: "nodejs-backend-architecture",
    excerpt: "围绕可维护性、可扩展性和真实业务复杂度，拆解 Node.js 后端架构设计实践。",
    contentMd: `# Node.js 后端架构

这套项目的后端使用 Node.js + Express + Prisma + PostgreSQL。技术本身并不稀奇，关键在于架构边界是否清晰，是否能持续承载需求增长。

## 1. 架构目标

我给后端设定了三条硬标准：

1. 单体应用也要模块化，避免“路由文件失控”。  
2. 统一组织上下文（multi-tenant），任何查询都能安全隔离。  
3. 接口协议稳定，前端可以并行开发，不被后端频繁改动拖慢。

## 2. 模块分层

后端按“路由 -> 校验 -> 服务 -> 数据访问”分层：

- routes：只做 HTTP 路由和状态码控制。  
- schema：用 zod 做参数与 body 校验。  
- service：承载业务规则（状态流转、统计聚合等）。  
- prisma：负责数据库交互和关系查询。

这样分层后，新增业务时可以在 service 层扩展，不需要把逻辑堆在路由里。

## 3. 中间件链路

请求会经过几个关键中间件：

- org-context：解析 \`x-org-slug\`，加载组织上下文。  
- auth：从 cookie 解析 JWT，确定用户身份。  
- validate：统一执行请求参数校验。  
- error-handler：统一输出错误格式，避免前端处理分裂。

这条链路让接口行为更可预测，也让错误排查成本更低。

## 4. 数据库设计原则

我在表设计上坚持两件事：

- 所有业务实体都带 \`orgId\`，确保多租户安全。  
- 需要检索和排序的字段提前建索引（如 status、createdAt、publishedAt）。

在文章模块中，category 是一对多，tag 是多对多；在线索模块中，lead 与 activity 分开，便于长期跟进记录沉淀。

## 5. 性能与稳定性

在性能策略上，优先做“80% 场景足够好”：

- 列表接口默认分页，避免一次性返回过大数据集。  
- 仪表盘统计采用聚合查询 + 并行 Promise.all。  
- 上传接口限制文件大小和 MIME 类型，降低资源滥用风险。  
- 统一响应结构降低前端状态分支复杂度。

## 6. 文档与协作

后端提供 Swagger 文档，并补充了中文注释，便于产品、前端和测试协同。  
一个接口文档真正有价值，不是“能打开”，而是字段、约束、错误场景都能看懂、能联调、能复现。

## 7. 可扩展方向

如果项目继续演进，我会优先做：

- 审计日志（谁在何时改了什么）。  
- 细粒度 RBAC 权限。  
- 异步任务队列（邮件、Webhook、数据同步）。  
- 可观测性（结构化日志 + tracing）。

这样可以在保持单体开发效率的同时，把系统平滑演进到更大规模。`,
    status: ArticleStatus.published,
    category: "engineering",
    tagSlugs: ["nodejs", "architecture", "saas"]
  },
  {
    title: "管理员仪表盘设计",
    slug: "admin-dashboard-design",
    excerpt: "从信息架构、交互体验到服务端分页策略，分享可落地的后台仪表盘设计思路。",
    contentMd: `# 管理员仪表盘设计

后台系统的核心价值不是“炫酷视觉”，而是帮助运营和销售团队更快做决策。  
我在设计这个 Admin Dashboard 时，目标是“5 秒内看见关键数据，30 秒内完成一次操作”。

## 1. 信息架构先行

仪表盘首页只放最关键的指标：

- totalLeads / newLeads  
- totalContacts  
- totalSubscribers  
- publishedArticles  
- totalPageViews

其余深度操作放到独立模块（Leads、Contacts、Subscribers、Articles），避免首页承载过多操作入口。

## 2. 列表页设计：统一交互模式

所有列表页采用同一交互协议：

- 顶部筛选（状态、关键词、分类等）  
- 服务端分页（page/pageSize）  
- 行内关键字段 + 详情弹窗  
- 状态更新动作可见且可追踪

统一模式的好处是：用户学习一次即可迁移到其他模块，显著降低后台使用门槛。

## 3. 服务端分页而不是前端假分页

后台列表使用服务端分页有三个收益：

1. 数据量大时保持稳定性能。  
2. 搜索与筛选结果真实准确。  
3. 与数据库索引策略一致，便于后续优化。

这也是我在作品集中重点展示的“真实业务能力”之一。

## 4. 状态管理策略

我使用 React Query 处理服务端状态：

- queryKey 显式包含分页与筛选参数。  
- 变更操作后精确失效对应列表查询。  
- 错误提示统一化，避免静默失败。

UI 本地状态（如侧栏折叠、多语言）由轻量 store 管理，前后端状态边界清晰。

## 5. 文章管理：运营场景优先

文章模块支持：

- Markdown 富文本编辑  
- 封面上传与预览  
- 发布/下线状态切换  
- SEO 字段维护  
- 后台详情预览

这让后台不仅是“看数据”，还能够直接驱动内容生产和增长策略。

## 6. 国际化与团队协作

管理端支持中英文切换，目的是适配跨地域团队协作。  
在真实外包项目里，双语后台能明显提升沟通效率，也更容易让海外客户接受交付物。

## 7. 设计结论

一个好的仪表盘不是把图表堆满页面，而是：

- 关键指标一眼可见  
- 常用动作一步到位  
- 数据来源真实可追踪  
- 结构可扩展且易维护

这也是我构建这套 Admin Dashboard 的底层原则。`,
    status: ArticleStatus.published,
    category: "growth",
    tagSlugs: ["dashboard", "saas", "nextjs"]
  }
];

async function main() {
  const org = await prisma.organization.upsert({
    where: { slug: env.DEFAULT_ORG_SLUG },
    update: { name: "NextSuit Demo Org" },
    create: {
      name: "NextSuit Demo Org",
      slug: env.DEFAULT_ORG_SLUG,
      timezone: "UTC"
    }
  });

  const [adminRole, viewerRole] = await Promise.all([
    prisma.role.upsert({
      where: { code: "admin" },
      update: { name: "Administrator" },
      create: { code: "admin", name: "Administrator" }
    }),
    prisma.role.upsert({
      where: { code: "viewer" },
      update: { name: "Viewer" },
      create: { code: "viewer", name: "Viewer" }
    })
  ]);

  const [adminPasswordHash, viewerPasswordHash] = await Promise.all([
    bcrypt.hash(env.ADMIN_PASSWORD, 10),
    bcrypt.hash(env.VIEWER_PASSWORD, 10)
  ]);

  const adminUser = await prisma.user.upsert({
    where: { email: env.ADMIN_EMAIL },
    update: {
      name: "NextSuit Admin",
      orgId: org.id,
      passwordHash: adminPasswordHash
    },
    create: {
      orgId: org.id,
      email: env.ADMIN_EMAIL,
      name: "NextSuit Admin",
      passwordHash: adminPasswordHash
    }
  });

  const viewerUser = await prisma.user.upsert({
    where: { email: env.VIEWER_EMAIL },
    update: {
      name: "NextSuit Visitor",
      orgId: org.id,
      passwordHash: viewerPasswordHash
    },
    create: {
      orgId: org.id,
      email: env.VIEWER_EMAIL,
      name: "NextSuit Visitor",
      passwordHash: viewerPasswordHash
    }
  });

  await prisma.$transaction([
    prisma.userRole.deleteMany({
      where: {
        userId: {
          in: [adminUser.id, viewerUser.id]
        }
      }
    }),
    prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: adminRole.id
      }
    }),
    prisma.userRole.create({
      data: {
        userId: viewerUser.id,
        roleId: viewerRole.id
      }
    })
  ]);

  const [catEngineering, catGrowth] = await Promise.all([
    prisma.category.upsert({
      where: {
        orgId_slug: {
          orgId: org.id,
          slug: "engineering"
        }
      },
      update: { name: "Engineering", nameEn: "Engineering", nameZh: "工程" },
      create: {
        orgId: org.id,
        name: "Engineering",
        nameEn: "Engineering",
        nameZh: "工程",
        slug: "engineering"
      }
    }),
    prisma.category.upsert({
      where: {
        orgId_slug: {
          orgId: org.id,
          slug: "growth"
        }
      },
      update: { name: "Growth", nameEn: "Growth", nameZh: "增长" },
      create: {
        orgId: org.id,
        name: "Growth",
        nameEn: "Growth",
        nameZh: "增长",
        slug: "growth"
      }
    })
  ]);

  const tagRecords = await Promise.all(
    [
      { name: "Next.js", nameEn: "Next.js", nameZh: "Next.js", slug: "nextjs" },
      { name: "SaaS", nameEn: "SaaS", nameZh: "SaaS", slug: "saas" },
      { name: "Marketing", nameEn: "Marketing", nameZh: "营销", slug: "marketing" },
      { name: "Node.js", nameEn: "Node.js", nameZh: "Node.js", slug: "nodejs" },
      { name: "Architecture", nameEn: "Architecture", nameZh: "架构", slug: "architecture" },
      { name: "Dashboard", nameEn: "Dashboard", nameZh: "仪表盘", slug: "dashboard" }
    ].map((tag) =>
      prisma.tag.upsert({
        where: {
          orgId_slug: {
            orgId: org.id,
            slug: tag.slug
          }
        },
        update: { name: tag.name, nameEn: tag.nameEn, nameZh: tag.nameZh },
        create: {
          orgId: org.id,
          name: tag.name,
          nameEn: tag.nameEn,
          nameZh: tag.nameZh,
          slug: tag.slug
        }
      })
    )
  );

  const tagsBySlug = new Map(tagRecords.map((tag) => [tag.slug, tag]));

  for (const article of articleSeed) {
    const created = await prisma.article.upsert({
      where: {
        orgId_slug: {
          orgId: org.id,
          slug: article.slug
        }
      },
      update: {
        title: article.title,
        excerpt: article.excerpt,
        contentMd: article.contentMd,
        status: article.status,
        authorId: adminUser.id,
        categoryId: article.category === "engineering" ? catEngineering.id : catGrowth.id,
        publishedAt: article.status === ArticleStatus.published ? new Date() : null
      },
      create: {
        orgId: org.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        contentMd: article.contentMd,
        status: article.status,
        authorId: adminUser.id,
        categoryId: article.category === "engineering" ? catEngineering.id : catGrowth.id,
        publishedAt: article.status === ArticleStatus.published ? new Date() : null
      }
    });

    const tags = article.tagSlugs
      .map((slug) => tagsBySlug.get(slug))
      .filter((tag): tag is (typeof tagRecords)[number] => Boolean(tag));

    await Promise.all(
      tags.map((tag) =>
        prisma.articleTag.upsert({
          where: {
            articleId_tagId: {
              articleId: created.id,
              tagId: tag.id
            }
          },
          update: {},
          create: {
            articleId: created.id,
            tagId: tag.id
          }
        })
      )
    );
  }

  await Promise.all([
    prisma.setting.upsert({
      where: {
        orgId_key: {
          orgId: org.id,
          key: "marketing.home.hero"
        }
      },
      update: {
        valueJson: {
          title: "Build Better SaaS Experiences",
          subtitle: "Unified growth suite powered by Next.js and Node.js"
        },
        isPublic: true
      },
      create: {
        orgId: org.id,
        key: "marketing.home.hero",
        valueJson: {
          title: "Build Better SaaS Experiences",
          subtitle: "Unified growth suite powered by Next.js and Node.js"
        },
        isPublic: true
      }
    }),
    prisma.setting.upsert({
      where: {
        orgId_key: {
          orgId: org.id,
          key: "marketing.pricing"
        }
      },
      update: {
        valueJson: {
          plans: [
            { name: "Starter", price: 49 },
            { name: "Growth", price: 149 },
            { name: "Scale", price: 299 }
          ]
        },
        isPublic: true
      },
      create: {
        orgId: org.id,
        key: "marketing.pricing",
        valueJson: {
          plans: [
            { name: "Starter", price: 49 },
            { name: "Growth", price: 149 },
            { name: "Scale", price: 299 }
          ]
        },
        isPublic: true
      }
    })
  ]);

  await Promise.all([
    prisma.lead.create({
      data: {
        orgId: org.id,
        name: "Alice Brown",
        email: "alice@example.com",
        company: "Acme Inc",
        budgetRange: "$5k-$10k",
        interest: "Admin Dashboard",
        source: "book-demo",
        status: LeadStatus.new
      }
    }),
    prisma.lead.create({
      data: {
        orgId: org.id,
        name: "John Miller",
        email: "john@example.com",
        company: "Northwind",
        budgetRange: "$10k-$25k",
        interest: "Website Revamp",
        source: "book-demo",
        status: LeadStatus.qualified,
        ownerUserId: adminUser.id
      }
    }),
    prisma.contact.create({
      data: {
        orgId: org.id,
        name: "Emily Davis",
        email: "emily@example.com",
        company: "Globex",
        subject: "Need a modern Next.js website",
        message: "Can you help us redesign our marketing site?",
        sourcePage: "/contact"
      }
    }),
    prisma.subscriber.upsert({
      where: {
        orgId_email: {
          orgId: org.id,
          email: "subscriber@example.com"
        }
      },
      update: { status: "active" },
      create: {
        orgId: org.id,
        email: "subscriber@example.com",
        sourcePage: "/"
      }
    })
  ]);

  await prisma.dashboardStatsDaily.upsert({
    where: {
      orgId_date: {
        orgId: org.id,
        date: new Date(new Date().toDateString())
      }
    },
    update: {
      totalLeads: await prisma.lead.count({ where: { orgId: org.id } }),
      newLeads: await prisma.lead.count({ where: { orgId: org.id, status: LeadStatus.new } }),
      totalContacts: await prisma.contact.count({ where: { orgId: org.id } }),
      totalSubscribers: await prisma.subscriber.count({ where: { orgId: org.id, status: "active" } }),
      publishedArticles: await prisma.article.count({ where: { orgId: org.id, status: ArticleStatus.published } })
    },
    create: {
      orgId: org.id,
      date: new Date(new Date().toDateString()),
      totalLeads: await prisma.lead.count({ where: { orgId: org.id } }),
      newLeads: await prisma.lead.count({ where: { orgId: org.id, status: LeadStatus.new } }),
      totalContacts: await prisma.contact.count({ where: { orgId: org.id } }),
      totalSubscribers: await prisma.subscriber.count({ where: { orgId: org.id, status: "active" } }),
      publishedArticles: await prisma.article.count({ where: { orgId: org.id, status: ArticleStatus.published } })
    }
  });

  // eslint-disable-next-line no-console
  console.log(
    "Seed completed.",
    "Admin:",
    env.ADMIN_EMAIL,
    env.ADMIN_PASSWORD,
    "Role:",
    adminRole.code,
    "| Viewer:",
    env.VIEWER_EMAIL,
    env.VIEWER_PASSWORD,
    "Role:",
    viewerRole.code
  );
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
