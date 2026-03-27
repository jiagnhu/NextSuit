import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { asyncHandler } from "../../middlewares/async-handler.js";
import { requireAdmin, requireAuth } from "../../middlewares/auth.js";
import { publicFormRateLimit } from "../../middlewares/public-rate-limit.js";
import { validate } from "../../middlewares/validate.js";
import { ok } from "../../utils/api-response.js";
import { AppError } from "../../utils/app-error.js";
import {
  contactIdParamSchema,
  contactListQuerySchema,
  contactStatusSchema,
  createContactSchema
} from "./contacts.schema.js";
import { contactsService } from "./contacts.service.js";

export const contactsRouter = Router();

contactsRouter.post(
  "/",
  publicFormRateLimit,
  validate(createContactSchema),
  asyncHandler(async (req, res) => {
    const { honey, ...payload } = req.body;

    if (honey) {
      throw new AppError("Invalid submission", StatusCodes.BAD_REQUEST, "INVALID_SUBMISSION");
    }

    const created = await contactsService.create(req.orgId!, payload);

    res.status(StatusCodes.CREATED).json(ok(created));
  })
);

contactsRouter.get(
  "/",
  requireAuth,
  requireAdmin,
  validate(contactListQuerySchema, "query"),
  asyncHandler(async (req, res) => {
    const result = await contactsService.list({ orgId: req.orgId!, ...req.query });
    res.json(ok(result.items, result.meta));
  })
);

contactsRouter.patch(
  "/:id/status",
  requireAuth,
  requireAdmin,
  validate(contactIdParamSchema, "params"),
  validate(contactStatusSchema),
  asyncHandler(async (req, res) => {
    const updated = await contactsService.updateStatus(req.orgId!, req.params.id, req.body.status);

    if (!updated.count) {
      throw new AppError("Contact not found", StatusCodes.NOT_FOUND, "CONTACT_NOT_FOUND");
    }

    res.json(ok({ id: req.params.id, status: req.body.status }));
  })
);
