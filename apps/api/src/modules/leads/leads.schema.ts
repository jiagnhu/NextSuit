import { z } from "zod";

export const createLeadSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  company: z.string().max(120).optional(),
  jobTitle: z.string().max(120).optional(),
  budgetRange: z.string().max(50).optional(),
  interest: z.string().max(120).optional(),
  source: z.string().max(100).optional(),
  notes: z.string().max(2000).optional()
});

export const leadListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  status: z.enum(["new", "qualified", "won", "lost"]).optional(),
  source: z.string().optional(),
  q: z.string().optional()
});

export const leadStatusSchema = z.object({
  status: z.enum(["new", "qualified", "won", "lost"]),
  notes: z.string().max(2000).optional()
});

export const createLeadActivitySchema = z.object({
  actionType: z.string().min(1).max(40),
  note: z.string().max(2000).optional()
});

export const leadIdParamSchema = z.object({
  id: z.string().uuid()
});
