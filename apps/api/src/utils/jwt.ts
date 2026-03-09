import jwt, { type SignOptions } from "jsonwebtoken";

import { env } from "../config/env.js";

export type JwtUserPayload = {
  userId: string;
  orgId: string;
  email: string;
};

export const signAccessToken = (payload: JwtUserPayload) =>
  jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
  });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET) as Express.UserPayload;
