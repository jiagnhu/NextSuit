const withFallback = (value: string | undefined, fallback: string) => {
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

const normalizeBaseUrl = (url: string) => url.replace(/\/$/, "");
const normalizeBasePath = (value: string | undefined) => {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed === "/") {
    return "";
  }

  const prefixed = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return prefixed.endsWith("/") ? prefixed.slice(0, -1) : prefixed;
};

const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);
const withBasePath = (pathname: string) => {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (!basePath) {
    return normalized;
  }

  return normalized === "/" ? `${basePath}/` : `${basePath}${normalized}`;
};

export const env = {
  siteUrl: withFallback(process.env.NEXT_PUBLIC_SITE_URL, "http://localhost:18633"),
  apiBaseUrl: normalizeBaseUrl(
    withFallback(process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL, "http://localhost:18640/api/v1")
  ),
  orgSlug: withFallback(process.env.ORG_SLUG ?? process.env.NEXT_PUBLIC_ORG_SLUG, "nextsuit-demo"),
  adminUrl: withFallback(
    process.env.NEXT_PUBLIC_ADMIN_URL,
    "http://localhost:18631/content/articles"
  ).replace(/\/$/, ""),
  basePath,
  withBasePath
};
