const withFallback = (value: string | undefined, fallback: string) => {
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

const normalizeBaseUrl = (url: string) => url.replace(/\/$/, "");

export const env = {
  siteUrl: withFallback(process.env.NEXT_PUBLIC_SITE_URL, "http://localhost:3003"),
  apiBaseUrl: normalizeBaseUrl(
    withFallback(process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL, "http://localhost:4000/api/v1")
  ),
  orgSlug: withFallback(process.env.ORG_SLUG ?? process.env.NEXT_PUBLIC_ORG_SLUG, "nextsuit-demo")
};
