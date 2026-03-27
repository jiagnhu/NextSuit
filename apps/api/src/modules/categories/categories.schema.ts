import { z } from "zod";

export const createCategorySchema = z.object({
  nameEn: z.string().min(1).max(100),
  nameZh: z.string().min(1).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(300).optional()
});

export const categoryIdParamSchema = z.object({
  id: z.string().uuid()
});
