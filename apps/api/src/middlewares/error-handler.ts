import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { MulterError } from "multer";
import { ZodError } from "zod";

import { env } from "../config/env.js";
import { fail } from "../utils/api-response.js";
import { AppError } from "../utils/app-error.js";

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (error instanceof ZodError) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(
      fail("Validation failed", "VALIDATION_ERROR", {
        issues: error.issues
      })
    );
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json(fail(error.message, error.code, error.details));
    return;
  }

  if (error instanceof MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "File is too large. Max allowed size is 5MB."
        : error.message;
    res.status(StatusCodes.BAD_REQUEST).json(fail(message, "UPLOAD_ERROR"));
    return;
  }

  if (env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error(error);
  }

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(fail("Internal server error"));
};
