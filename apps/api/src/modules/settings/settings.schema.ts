import { z } from "zod";

export const settingKeyParamSchema = z.object({
  key: z.string().min(1).max(80)
});

export const updateSettingSchema = z.object({
  valueJson: z.any(),
  isPublic: z.boolean().optional()
});
