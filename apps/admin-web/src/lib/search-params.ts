export const toPositiveInt = (value: string | null | undefined, fallback: number) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) {
    return fallback;
  }
  return Math.floor(num);
};

export const buildQueryString = (
  current: URLSearchParams,
  updates: Record<string, string | number | undefined | null>
) => {
  const next = new URLSearchParams(current.toString());

  Object.entries(updates).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      next.delete(key);
      return;
    }

    next.set(key, String(value));
  });

  return next.toString();
};
