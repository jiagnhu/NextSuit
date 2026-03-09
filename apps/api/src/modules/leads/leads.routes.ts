import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { asyncHandler } from "../../middlewares/async-handler.js";
import { requireAuth } from "../../middlewares/auth.js";
import { publicFormRateLimit } from "../../middlewares/public-rate-limit.js";
import { validate } from "../../middlewares/validate.js";
import { ok } from "../../utils/api-response.js";
import { AppError } from "../../utils/app-error.js";
import {
  createLeadActivitySchema,
  createLeadSchema,
  leadIdParamSchema,
  leadListQuerySchema,
  leadStatusSchema
} from "./leads.schema.js";
import { leadsService } from "./leads.service.js";

export const leadsRouter = Router();

leadsRouter.post(
  "/",
  publicFormRateLimit,
  validate(createLeadSchema),
  asyncHandler(async (req, res) => {
    const orgId = req.orgId!;
    const created = await leadsService.create(orgId, req.body);
    res.status(StatusCodes.CREATED).json(ok(created));
  })
);

leadsRouter.get(
  "/",
  requireAuth,
  validate(leadListQuerySchema, "query"),
  asyncHandler(async (req, res) => {
    const result = await leadsService.list({ orgId: req.orgId!, ...req.query });
    res.json(ok(result.items, result.meta));
  })
);

leadsRouter.get(
  "/:id",
  requireAuth,
  validate(leadIdParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const lead = await leadsService.findById(req.orgId!, req.params.id);

    if (!lead) {
      throw new AppError("Lead not found", StatusCodes.NOT_FOUND, "LEAD_NOT_FOUND");
    }

    res.json(ok(lead));
  })
);

leadsRouter.patch(
  "/:id/status",
  requireAuth,
  validate(leadIdParamSchema, "params"),
  validate(leadStatusSchema),
  asyncHandler(async (req, res) => {
    const result = await leadsService.updateStatus(
      req.orgId!,
      req.params.id,
      req.body.status,
      req.body.notes
    );

    if (!result.count) {
      throw new AppError("Lead not found", StatusCodes.NOT_FOUND, "LEAD_NOT_FOUND");
    }

    const updated = await leadsService.findById(req.orgId!, req.params.id);
    res.json(ok(updated));
  })
);

leadsRouter.post(
  "/:id/activities",
  requireAuth,
  validate(leadIdParamSchema, "params"),
  validate(createLeadActivitySchema),
  asyncHandler(async (req, res) => {
    const lead = await leadsService.findById(req.orgId!, req.params.id);
    if (!lead) {
      throw new AppError("Lead not found", StatusCodes.NOT_FOUND, "LEAD_NOT_FOUND");
    }

    const activity = await leadsService.createActivity(
      req.params.id,
      req.user!.userId,
      req.body.actionType,
      req.body.note
    );

    res.status(StatusCodes.CREATED).json(ok(activity));
  })
);
