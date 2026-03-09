import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { prisma } from "../../lib/prisma.js";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { requireAuth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { ok } from "../../utils/api-response.js";
import { createTagSchema } from "./tags.schema.js";

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
  validate(createTagSchema),
  asyncHandler(async (req, res) => {
    const created = await prisma.tag.create({
      data: {
        orgId: req.orgId!,
        ...req.body
      }
    });

    res.status(StatusCodes.CREATED).json(ok(created));
  })
);
