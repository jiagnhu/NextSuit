import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { prisma } from "../../lib/prisma.js";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { requireAdmin, requireAuth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { ok } from "../../utils/api-response.js";
import { AppError } from "../../utils/app-error.js";
import { createTagSchema, tagIdParamSchema } from "./tags.schema.js";

export const tagsRouter = Router();

tagsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const tags = await prisma.tag.findMany({
      where: { orgId: req.orgId! },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        nameEn: true,
        nameZh: true,
        slug: true,
        _count: {
          select: {
            articleTags: true
          }
        }
      }
    });

    res.json(ok(tags));
  })
);

tagsRouter.post(
  "/",
  requireAuth,
  requireAdmin,
  validate(createTagSchema),
  asyncHandler(async (req, res) => {
    const { nameEn, nameZh, slug } = req.body;
    const created = await prisma.tag.create({
      data: {
        orgId: req.orgId!,
        name: nameEn,
        nameEn,
        nameZh,
        slug
      }
    });

    res.status(StatusCodes.CREATED).json(ok(created));
  })
);

tagsRouter.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  validate(tagIdParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const result = await prisma.tag.deleteMany({
      where: {
        id: req.params.id,
        orgId: req.orgId!
      }
    });

    if (!result.count) {
      throw new AppError("Tag not found", StatusCodes.NOT_FOUND, "TAG_NOT_FOUND");
    }

    res.json(
      ok({
        id: req.params.id,
        deleted: true
      })
    );
  })
);
