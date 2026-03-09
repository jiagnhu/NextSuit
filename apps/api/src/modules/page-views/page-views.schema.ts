import { z } from "zod";

export const createPageViewSchema = z.object({
  path: z.string().min(1).max(300),
  referrer: z.string().max(500).optional(),
  utmSource: z.string().max(100).optional(),
  device: z.enum(["desktop", "mobile", "tablet", "bot", "unknown"]).optional()
});
