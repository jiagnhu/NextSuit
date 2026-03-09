import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { prisma } from "../../lib/prisma.js";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { ok } from "../../utils/api-response.js";

export const healthRouter = Router();

healthRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    let database: "ok" | "error" = "ok";

    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      database = "error";
    }

    const statusCode = database === "ok" ? StatusCodes.OK : StatusCodes.SERVICE_UNAVAILABLE;

    res.status(statusCode).json(
      ok({
        name: "nextsuit-core-api",
        status: database === "ok" ? "ok" : "degraded",
        services: {
          database
        },
        timestamp: new Date().toISOString()
      })
    );
  })
);
