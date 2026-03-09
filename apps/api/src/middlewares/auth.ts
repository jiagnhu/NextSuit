import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import { env } from "../config/env.js";
import { fail } from "../utils/api-response.js";
import { verifyAccessToken } from "../utils/jwt.js";

const parseBearerToken = (authorization?: string) => {
  if (!authorization) {
    return null;
  }

  const [type, token] = authorization.split(" ");
  if (type !== "Bearer" || !token) {
    return null;
  }

  return token;
};

export const requireAuth: RequestHandler = (req, res, next) => {
  const cookieToken = req.cookies?.[env.COOKIE_NAME] as string | undefined;
  const bearerToken = parseBearerToken(req.headers.authorization);
  const token = cookieToken ?? bearerToken;

  if (!token) {
    res.status(StatusCodes.UNAUTHORIZED).json(fail("Unauthorized", "UNAUTHORIZED"));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      userId: payload.userId,
      orgId: payload.orgId,
      email: payload.email
    };
    req.orgId = payload.orgId;
    next();
  } catch {
    res.status(StatusCodes.UNAUTHORIZED).json(fail("Invalid session", "INVALID_SESSION"));
  }
};
