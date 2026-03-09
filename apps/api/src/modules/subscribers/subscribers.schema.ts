import { z } from "zod";

export const createSubscriberSchema = z.object({
  email: z.string().email(),
  sourcePage: z.string().max(200).optional()
});

export const subscriberListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  q: z.string().optional()
});

export const subscriberIdParamSchema = z.object({
  id: z.string().uuid()
});

export const subscriberStatusSchema = z.object({
  status: z.enum(["active", "unsubscribed"])
});
