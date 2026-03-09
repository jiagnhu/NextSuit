import { Router } from "express";

import { asyncHandler } from "../../middlewares/async-handler.js";
import { requireAuth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { prisma } from "../../lib/prisma.js";
import { ok } from "../../utils/api-response.js";
import { pageViewsService } from "../page-views/page-views.service.js";
import { dashboardContentPerformanceQuerySchema } from "./dashboard.schema.js";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get(
  "/overview",
  asyncHandler(async (req, res) => {
    const orgId = req.orgId!;

    const [totalLeads, newLeads, totalContacts, totalSubscribers, publishedArticles, totalPageViews] =
      await Promise.all([
        prisma.lead.count({ where: { orgId } }),
        prisma.lead.count({ where: { orgId, status: "new" } }),
        prisma.contact.count({ where: { orgId } }),
        prisma.subscriber.count({ where: { orgId, status: "active" } }),
        prisma.article.count({ where: { orgId, status: "published" } }),
        prisma.pageView.count({ where: { orgId } })
      ]);

    res.json(
      ok({
        totalLeads,
        newLeads,
        totalContacts,
        totalSubscribers,
        publishedArticles,
        totalPageViews
      })
    );
  })
);

dashboardRouter.get(
  "/recent-leads",
  asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit ?? 10);
    const orgId = req.orgId!;

    const leads = await prisma.lead.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
      take: Math.min(Math.max(limit, 1), 50),
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        status: true,
        source: true,
        createdAt: true
      }
    });

    res.json(ok(leads));
  })
);

dashboardRouter.get(
  "/content-performance",
  validate(dashboardContentPerformanceQuerySchema, "query"),
  asyncHandler(async (req, res) => {
    const daysInput = Number(req.query.days ?? 14);
    const days = Number.isFinite(daysInput) && daysInput > 0 ? daysInput : 14;

    const result = await pageViewsService.getContentPerformance({
      orgId: req.orgId!,
      days
    });

    res.json(ok(result));
  })
);
