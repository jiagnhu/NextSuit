import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { env } from "../../config/env.js";
import { requireAuth } from "../../middlewares/auth.js";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { validate } from "../../middlewares/validate.js";
import { ok, fail } from "../../utils/api-response.js";
import { AppError } from "../../utils/app-error.js";
import { signAccessToken } from "../../utils/jwt.js";
import { loginSchema } from "./auth.schema.js";
import { authService } from "./auth.service.js";

export const authRouter = Router();

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/"
};

authRouter.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.login(req.body.email, req.body.password);

    if (!result) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json(fail("Invalid email or password", "INVALID_CREDENTIALS"));
      return;
    }

    const token = signAccessToken({
      userId: result.id,
      orgId: result.orgId,
      email: result.email
    });

    res.cookie(env.COOKIE_NAME, token, cookieOptions);
    res.json(ok(result));
  })
);

authRouter.post("/logout", (_req, res) => {
  res.clearCookie(env.COOKIE_NAME, cookieOptions);
  res.json(ok({ loggedOut: true }));
});

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const profile = await authService.getProfile(req.user!.userId);

    if (!profile) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND, "USER_NOT_FOUND");
    }

    res.json(
      ok({
        ...profile,
        roles: profile.roles.map((item) => item.role)
      })
    );
  })
);
