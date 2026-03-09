import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { fail } from "../utils/api-response.js";

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json(
    fail(`Route ${req.method} ${req.originalUrl} not found`, "NOT_FOUND")
  );
};
