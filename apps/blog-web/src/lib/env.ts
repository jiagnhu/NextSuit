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

const stripApiPrefix = (apiBaseUrl: string) => apiBaseUrl.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
const isLoopbackHost = (host: string) =>
  host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0";

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
  apiPublicBaseUrl: stripApiPrefix(
    normalizeBaseUrl(withFallback(process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL, "http://localhost:18640/api/v1"))
  ),
  basePath,
  withBasePath
};

export const resolveUploadedAssetUrl = (pathOrUrl: string) => {
  if (!pathOrUrl) {
    return pathOrUrl;
  }

  if (/^https?:\/\//i.test(pathOrUrl)) {
    try {
      const parsed = new URL(pathOrUrl);
      if (isLoopbackHost(parsed.hostname)) {
        return `${env.apiPublicBaseUrl}${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    } catch {
      return pathOrUrl;
    }
    return pathOrUrl;
  }

  const normalizedPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  if (env.apiPublicBaseUrl && normalizedPath.startsWith(`${env.apiPublicBaseUrl}/`)) {
    return normalizedPath;
  }
  return `${env.apiPublicBaseUrl}${normalizedPath}`;
};
