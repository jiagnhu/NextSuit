import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { asyncHandler } from "../../middlewares/async-handler.js";
import { requireAdmin, requireAuth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { ok } from "../../utils/api-response.js";
import { AppError } from "../../utils/app-error.js";
import {
  adminArticleListQuerySchema,
  articleIdParamSchema,
  articleListQuerySchema,
  articleSlugParamSchema,
  createArticleSchema,
  publishArticleSchema,
  updateArticleSchema
} from "./articles.schema.js";
import { articlesService } from "./articles.service.js";

export const articlesRouter = Router();

articlesRouter.get(
  "/",
  validate(articleListQuerySchema, "query"),
  asyncHandler(async (req, res) => {
    const result = await articlesService.listPublic({
      orgId: req.orgId!,
      ...req.query
    });

    res.json(ok(result.items, result.meta));
  })
);

articlesRouter.get(
  "/admin",
  requireAuth,
  validate(adminArticleListQuerySchema, "query"),
  asyncHandler(async (req, res) => {
    const result = await articlesService.listAdmin({
      orgId: req.orgId!,
      ...req.query
    });

    res.json(ok(result.items, result.meta));
  })
);

articlesRouter.get(
  "/admin/:id",
  requireAuth,
  validate(articleIdParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const article = await articlesService.findAdminById(req.orgId!, req.params.id);

    if (!article) {
      throw new AppError("Article not found", StatusCodes.NOT_FOUND, "ARTICLE_NOT_FOUND");
    }

    res.json(ok(article));
  })
);

articlesRouter.get(
  "/:slug",
  validate(articleSlugParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const article = await articlesService.findPublicBySlug(req.orgId!, req.params.slug);

    if (!article) {
      throw new AppError("Article not found", StatusCodes.NOT_FOUND, "ARTICLE_NOT_FOUND");
    }

    res.json(ok(article));
  })
);

articlesRouter.post(
  "/",
  requireAuth,
  requireAdmin,
  validate(createArticleSchema),
  asyncHandler(async (req, res) => {
    const created = await articlesService.create({
      ...req.body,
      orgId: req.orgId!,
      authorId: req.user!.userId
    });

    res.status(StatusCodes.CREATED).json(ok(created));
  })
);

articlesRouter.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  validate(articleIdParamSchema, "params"),
  validate(updateArticleSchema),
  asyncHandler(async (req, res) => {
    const updated = await articlesService.update({
      ...req.body,
      orgId: req.orgId!,
      id: req.params.id
    });

    if (!updated) {
      throw new AppError("Article not found", StatusCodes.NOT_FOUND, "ARTICLE_NOT_FOUND");
    }

    res.json(ok(updated));
  })
);

articlesRouter.patch(
  "/:id/publish",
  requireAuth,
  requireAdmin,
  validate(articleIdParamSchema, "params"),
  validate(publishArticleSchema),
  asyncHandler(async (req, res) => {
    const updated = await articlesService.publish(req.orgId!, req.params.id, req.body.publish);

    if (!updated) {
      throw new AppError("Article not found", StatusCodes.NOT_FOUND, "ARTICLE_NOT_FOUND");
    }

    res.json(ok(updated));
  })
);

articlesRouter.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  validate(articleIdParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const removed = await articlesService.remove(req.orgId!, req.params.id);

    if (!removed) {
      throw new AppError("Article not found", StatusCodes.NOT_FOUND, "ARTICLE_NOT_FOUND");
    }

    res.json(ok({ id: req.params.id, deleted: true }));
  })
);
