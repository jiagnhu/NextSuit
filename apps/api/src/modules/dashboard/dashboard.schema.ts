import { z } from "zod";

export const dashboardContentPerformanceQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).optional()
});
