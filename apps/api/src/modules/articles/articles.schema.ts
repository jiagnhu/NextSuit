import { z } from "zod";

export const articleListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(50).optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  search: z.string().optional()
});

export const adminArticleListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(50).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  search: z.string().optional(),
  category: z.string().optional()
});

export const articleSlugParamSchema = z.object({
  slug: z.string().min(2).max(180)
});

export const articleIdParamSchema = z.object({
  id: z.string().uuid()
});

export const createArticleSchema = z.object({
  title: z.string().min(5).max(180),
  slug: z.string().min(3).max(180).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().max(300).optional(),
  contentMd: z.string().min(20),
  coverImage: z.string().url().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  categoryId: z.string().uuid().optional(),
  tagIds: z.array(z.string().uuid()).max(10).optional(),
  seoTitle: z.string().max(180).optional(),
  seoDescription: z.string().max(300).optional()
});

export const updateArticleSchema = createArticleSchema.partial();

export const publishArticleSchema = z.object({
  publish: z.boolean().default(true)
});
