import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";

export const validate = (
  schema: ZodSchema,
  source: "body" | "query" | "params" = "body"
): RequestHandler => {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      next(result.error);
      return;
    }

    (req as unknown as Record<string, unknown>)[source] = result.data;
    next();
  };
};
