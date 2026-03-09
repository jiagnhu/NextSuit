import { z } from "zod";

export const createContactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  company: z.string().max(120).optional(),
  subject: z.string().max(150).optional(),
  message: z.string().min(1).max(5000),
  sourcePage: z.string().max(200).optional(),
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
  honey: z.string().optional()
});

export const contactListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  status: z.enum(["new", "in_progress", "resolved", "spam"]).optional(),
  q: z.string().optional()
});

export const contactStatusSchema = z.object({
  status: z.enum(["new", "in_progress", "resolved", "spam"])
});

export const contactIdParamSchema = z.object({
  id: z.string().uuid()
});
