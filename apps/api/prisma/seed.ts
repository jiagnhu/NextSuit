import bcrypt from "bcryptjs";

import { PrismaClient, ArticleStatus, LeadStatus } from "@prisma/client";

import { env } from "../src/config/env.js";

const prisma = new PrismaClient();

const articleSeed = [
  {
    title: "How to Build a Scalable SaaS Frontend with Next.js",
    slug: "scalable-saas-frontend-nextjs",
    excerpt: "Architecture notes for a production-grade Next.js SaaS frontend.",
    contentMd: "# Scalable SaaS Frontend\n\nThis is a seeded article for demo.",
    status: ArticleStatus.published
  },
  {
    title: "Lead Generation Playbook for B2B Marketing Sites",
    slug: "lead-generation-playbook-b2b",
    excerpt: "Capture and qualify leads through high-intent forms.",
    contentMd: "# Lead Generation\n\nThis is a seeded article for demo.",
    status: ArticleStatus.published
  },
  {
    title: "Content Ops Workflow for Product Teams",
    slug: "content-ops-workflow-product-teams",
    excerpt: "How to manage content lifecycle from draft to publish.",
    contentMd: "# Content Ops\n\nThis is a seeded article for demo.",
    status: ArticleStatus.draft
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

  const [adminRole, editorRole] = await Promise.all([
    prisma.role.upsert({
      where: { code: "admin" },
      update: { name: "Administrator" },
      create: { code: "admin", name: "Administrator" }
    }),
    prisma.role.upsert({
      where: { code: "editor" },
      update: { name: "Editor" },
      create: { code: "editor", name: "Editor" }
    })
  ]);

  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
  const adminUser = await prisma.user.upsert({
    where: { email: env.ADMIN_EMAIL },
    update: {
      name: "NextSuit Admin",
      orgId: org.id,
      passwordHash
    },
    create: {
      orgId: org.id,
      email: env.ADMIN_EMAIL,
      name: "NextSuit Admin",
      passwordHash
    }
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id
      }
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id
    }
  });

  const [catEngineering, catGrowth] = await Promise.all([
    prisma.category.upsert({
      where: {
        orgId_slug: {
          orgId: org.id,
          slug: "engineering"
        }
      },
      update: { name: "Engineering" },
      create: {
        orgId: org.id,
        name: "Engineering",
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
      update: { name: "Growth" },
      create: {
        orgId: org.id,
        name: "Growth",
        slug: "growth"
      }
    })
  ]);

  const [tagNextjs, tagSaas, tagMarketing] = await Promise.all([
    prisma.tag.upsert({
      where: {
        orgId_slug: {
          orgId: org.id,
          slug: "nextjs"
        }
      },
      update: { name: "Next.js" },
      create: {
        orgId: org.id,
        name: "Next.js",
        slug: "nextjs"
      }
    }),
    prisma.tag.upsert({
      where: {
        orgId_slug: {
          orgId: org.id,
          slug: "saas"
        }
      },
      update: { name: "SaaS" },
      create: {
        orgId: org.id,
        name: "SaaS",
        slug: "saas"
      }
    }),
    prisma.tag.upsert({
      where: {
        orgId_slug: {
          orgId: org.id,
          slug: "marketing"
        }
      },
      update: { name: "Marketing" },
      create: {
        orgId: org.id,
        name: "Marketing",
        slug: "marketing"
      }
    })
  ]);

  for (const [index, article] of articleSeed.entries()) {
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
        categoryId: index % 2 === 0 ? catEngineering.id : catGrowth.id,
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
        categoryId: index % 2 === 0 ? catEngineering.id : catGrowth.id,
        publishedAt: article.status === ArticleStatus.published ? new Date() : null
      }
    });

    const tags = index % 2 === 0 ? [tagNextjs, tagSaas] : [tagMarketing, tagSaas];
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
  console.log("Seed completed. Admin:", env.ADMIN_EMAIL, env.ADMIN_PASSWORD, "Role:", editorRole.code);
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
