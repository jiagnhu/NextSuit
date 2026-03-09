import { z } from "zod";

export const createTagSchema = z.object({
  name: z.string().min(1).max(60),
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/)
});
