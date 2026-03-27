import { z } from "zod";

export const createTagSchema = z.object({
  nameEn: z.string().min(1).max(60),
  nameZh: z.string().min(1).max(60),
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/)
});

export const tagIdParamSchema = z.object({
  id: z.string().uuid()
});
