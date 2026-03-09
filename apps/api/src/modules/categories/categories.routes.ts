import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { prisma } from "../../lib/prisma.js";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { requireAuth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { ok } from "../../utils/api-response.js";
import { createCategorySchema } from "./categories.schema.js";

export const categoriesRouter = Router();

categoriesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const categories = await prisma.category.findMany({
      where: { orgId: req.orgId! },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        _count: {
          select: {
            articles: true
          }
        }
      }
    });

    res.json(ok(categories));
  })
);

categoriesRouter.post(
  "/",
  requireAuth,
  validate(createCategorySchema),
  asyncHandler(async (req, res) => {
    const created = await prisma.category.create({
      data: {
        orgId: req.orgId!,
        ...req.body
      }
    });

    res.status(StatusCodes.CREATED).json(ok(created));
  })
);
