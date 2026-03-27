import bcrypt from "bcryptjs";

import { PrismaClient } from "@prisma/client";

import { env } from "../src/config/env.js";

const prisma = new PrismaClient();

const ensureRbacUsers = async () => {
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

  // eslint-disable-next-line no-console
  console.log(
    "RBAC users synced:",
    `${env.ADMIN_EMAIL} (admin),`,
    `${env.VIEWER_EMAIL} (viewer)`
  );
};

ensureRbacUsers()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

