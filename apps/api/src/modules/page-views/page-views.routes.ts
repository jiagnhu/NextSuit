import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { asyncHandler } from "../../middlewares/async-handler.js";
import { publicFormRateLimit } from "../../middlewares/public-rate-limit.js";
import { validate } from "../../middlewares/validate.js";
import { ok } from "../../utils/api-response.js";
import { createPageViewSchema } from "./page-views.schema.js";
import { pageViewsService } from "./page-views.service.js";

export const pageViewsRouter = Router();

pageViewsRouter.post(
  "/",
  publicFormRateLimit,
  validate(createPageViewSchema),
  asyncHandler(async (req, res) => {
    const created = await pageViewsService.track({
      orgId: req.orgId!,
      ...req.body
    });

    res.status(StatusCodes.CREATED).json(ok(created));
  })
);
