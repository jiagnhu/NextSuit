import { Router } from "express";

import { prisma } from "../../lib/prisma.js";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { requireAuth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { ok } from "../../utils/api-response.js";
import { settingKeyParamSchema, updateSettingSchema } from "./settings.schema.js";

export const settingsRouter = Router();

settingsRouter.get(
  "/public",
  asyncHandler(async (req, res) => {
    const settings = await prisma.setting.findMany({
      where: {
        orgId: req.orgId!,
        isPublic: true
      },
      select: {
        key: true,
        valueJson: true,
        updatedAt: true
      }
    });

    res.json(ok(settings));
  })
);

settingsRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const settings = await prisma.setting.findMany({
      where: {
        orgId: req.orgId!
      },
      orderBy: {
        key: "asc"
      }
    });

    res.json(ok(settings));
  })
);

settingsRouter.patch(
  "/:key",
  requireAuth,
  validate(settingKeyParamSchema, "params"),
  validate(updateSettingSchema),
  asyncHandler(async (req, res) => {
    const updated = await prisma.setting.upsert({
      where: {
        orgId_key: {
          orgId: req.orgId!,
          key: req.params.key
        }
      },
      update: {
        valueJson: req.body.valueJson,
        isPublic: req.body.isPublic
      },
      create: {
        orgId: req.orgId!,
        key: req.params.key,
        valueJson: req.body.valueJson,
        isPublic: req.body.isPublic ?? false
      }
    });

    res.json(ok(updated));
  })
);
