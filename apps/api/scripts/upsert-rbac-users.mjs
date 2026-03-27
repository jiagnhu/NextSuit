import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

const ensureRbacUsers = async () => {
  const orgSlug = process.env.DEFAULT_ORG_SLUG ?? "nextsuit-demo";
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@nextsuit.dev";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin123!";
  const viewerEmail = process.env.VIEWER_EMAIL ?? "visitor@nextsuit.dev";
  const viewerPassword = process.env.VIEWER_PASSWORD ?? "Visitor123!";

  const org = await prisma.organization.upsert({
    where: { slug: orgSlug },
    update: { name: "NextSuit Demo Org" },
    create: {
      name: "NextSuit Demo Org",
      slug: orgSlug,
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
    bcrypt.hash(adminPassword, 10),
    bcrypt.hash(viewerPassword, 10)
  ]);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "NextSuit Admin",
      orgId: org.id,
      passwordHash: adminPasswordHash
    },
    create: {
      orgId: org.id,
      email: adminEmail,
      name: "NextSuit Admin",
      passwordHash: adminPasswordHash
    }
  });

  const viewerUser = await prisma.user.upsert({
    where: { email: viewerEmail },
    update: {
      name: "NextSuit Visitor",
      orgId: org.id,
      passwordHash: viewerPasswordHash
    },
    create: {
      orgId: org.id,
      email: viewerEmail,
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

  console.log(
    "RBAC users synced:",
    `${adminEmail} (admin),`,
    `${viewerEmail} (viewer)`
  );
};

ensureRbacUsers()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

