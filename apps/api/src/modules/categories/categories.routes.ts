import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { prisma } from "../../lib/prisma.js";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { requireAdmin, requireAuth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { ok } from "../../utils/api-response.js";
import { AppError } from "../../utils/app-error.js";
import { categoryIdParamSchema, createCategorySchema } from "./categories.schema.js";

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
        nameEn: true,
        nameZh: true,
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
  requireAdmin,
  validate(createCategorySchema),
  asyncHandler(async (req, res) => {
    const { nameEn, nameZh, slug, description } = req.body;
    const created = await prisma.category.create({
      data: {
        orgId: req.orgId!,
        name: nameEn,
        nameEn,
        nameZh,
        slug,
        description
      }
    });

    res.status(StatusCodes.CREATED).json(ok(created));
  })
);

categoriesRouter.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  validate(categoryIdParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const result = await prisma.category.deleteMany({
      where: {
        id: req.params.id,
        orgId: req.orgId!
      }
    });

    if (!result.count) {
      throw new AppError("Category not found", StatusCodes.NOT_FOUND, "CATEGORY_NOT_FOUND");
    }

    res.json(
      ok({
        id: req.params.id,
        deleted: true
      })
    );
  })
);
