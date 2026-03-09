export type SearchParamValue = string | string[] | undefined;

export const firstValue = (value: SearchParamValue) => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

export const toPositiveInt = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
};

export const buildPathWithQuery = (
  pathname: string,
  query: Record<string, string | number | undefined | null>
) => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    params.set(key, String(value));
  });

  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
};
