import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
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

export const requireAuth: RequestHandler = async (req, res, next) => {
  const cookieToken = req.cookies?.[env.COOKIE_NAME] as string | undefined;
  const bearerToken = parseBearerToken(req.headers.authorization);
  const token = cookieToken ?? bearerToken;

  if (!token) {
    res.status(StatusCodes.UNAUTHORIZED).json(fail("Unauthorized", "UNAUTHORIZED"));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    const tokenRoles = Array.isArray(payload.roles) ? payload.roles : [];
    const resolvedRoles =
      tokenRoles.length > 0
        ? tokenRoles
        : (
            await prisma.userRole.findMany({
              where: { userId: payload.userId },
              select: {
                role: {
                  select: { code: true }
                }
              }
            })
          ).map((item) => item.role.code);

    req.user = {
      userId: payload.userId,
      orgId: payload.orgId,
      email: payload.email,
      roles: resolvedRoles
    };
    req.orgId = payload.orgId;
    next();
  } catch {
    res.status(StatusCodes.UNAUTHORIZED).json(fail("Invalid session", "INVALID_SESSION"));
  }
};

export const requireRole = (...roles: string[]): RequestHandler => {
  return (req, res, next) => {
    const currentRoles = req.user?.roles ?? [];
    const allowed = roles.some((role) => currentRoles.includes(role));

    if (!allowed) {
      res.status(StatusCodes.FORBIDDEN).json(fail("Forbidden", "FORBIDDEN"));
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole("admin");
