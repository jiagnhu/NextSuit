export const ok = <T>(data: T, meta?: unknown) => ({
  success: true as const,
  data,
  ...(meta ? { meta } : {})
});

export const fail = (message: string, code = "INTERNAL_ERROR", details?: unknown) => ({
  success: false as const,
  error: {
    code,
    message,
    ...(details ? { details } : {})
  }
});
