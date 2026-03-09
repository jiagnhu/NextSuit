import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { asyncHandler } from "../../middlewares/async-handler.js";
import { requireAuth } from "../../middlewares/auth.js";
import { publicFormRateLimit } from "../../middlewares/public-rate-limit.js";
import { validate } from "../../middlewares/validate.js";
import { ok } from "../../utils/api-response.js";
import { AppError } from "../../utils/app-error.js";
import {
  createSubscriberSchema,
  subscriberIdParamSchema,
  subscriberListQuerySchema,
  subscriberStatusSchema
} from "./subscribers.schema.js";
import { subscribersService } from "./subscribers.service.js";

export const subscribersRouter = Router();

subscribersRouter.post(
  "/",
  publicFormRateLimit,
  validate(createSubscriberSchema),
  asyncHandler(async (req, res) => {
    const created = await subscribersService.create(req.orgId!, req.body);
    res.status(StatusCodes.CREATED).json(ok(created));
  })
);

subscribersRouter.get(
  "/",
  requireAuth,
  validate(subscriberListQuerySchema, "query"),
  asyncHandler(async (req, res) => {
    const result = await subscribersService.list({ orgId: req.orgId!, ...req.query });
    res.json(ok(result.items, result.meta));
  })
);

subscribersRouter.patch(
  "/:id/status",
  requireAuth,
  validate(subscriberIdParamSchema, "params"),
  validate(subscriberStatusSchema),
  asyncHandler(async (req, res) => {
    const updated = await subscribersService.updateStatus(req.orgId!, req.params.id, req.body.status);

    if (!updated.count) {
      throw new AppError("Subscriber not found", StatusCodes.NOT_FOUND, "SUBSCRIBER_NOT_FOUND");
    }

    res.json(ok({ id: req.params.id, status: req.body.status }));
  })
);
