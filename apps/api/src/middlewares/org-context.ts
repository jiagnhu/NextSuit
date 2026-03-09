import type { RequestHandler } from "express";

import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/app-error.js";

const orgCache = new Map<string, string>();

const loadOrgIdBySlug = async (slug: string) => {
  const cached = orgCache.get(slug);
  if (cached) {
    return cached;
  }

  const org = await prisma.organization.findUnique({
    where: { slug },
    select: { id: true }
  });

  if (!org) {
    if (slug === env.DEFAULT_ORG_SLUG) {
      const created = await prisma.organization.create({
        data: {
          name: "NextSuit Demo Org",
          slug: env.DEFAULT_ORG_SLUG,
          timezone: "UTC"
        },
        select: { id: true }
      });
      orgCache.set(slug, created.id);
      return created.id;
    }
    throw new AppError(`Organization not found for slug: ${slug}`, 400, "ORG_NOT_FOUND");
  }

  orgCache.set(slug, org.id);
  return org.id;
};

export const withOrgContext: RequestHandler = async (req, _res, next) => {
  try {
    if (req.path.startsWith("/health")) {
      next();
      return;
    }

    if (req.orgId) {
      next();
      return;
    }

    const orgSlug = (req.headers["x-org-slug"] as string | undefined) ?? env.DEFAULT_ORG_SLUG;
    req.orgId = await loadOrgIdBySlug(orgSlug);
    next();
  } catch (error) {
    next(error);
  }
};
