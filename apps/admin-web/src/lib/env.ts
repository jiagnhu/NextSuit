const normalizeBasePath = (input: string | undefined) => {
  if (!input) {
    return "/";
  }

  const trimmed = input.trim();
  if (!trimmed || trimmed === "/") {
    return "/";
  }

  const prefixed = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return prefixed.endsWith("/") ? prefixed.slice(0, -1) : prefixed;
};

const envConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:18640/api/v1",
  orgSlug: import.meta.env.VITE_ORG_SLUG ?? "nextsuit-demo",
  appBasePath: normalizeBasePath(import.meta.env.VITE_APP_BASE_PATH)
};

export const env = envConfig;

const apiPublicBase = envConfig.apiBaseUrl.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
const isLoopbackHost = (host: string) =>
  host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0";

export const withAppBasePath = (assetPath: string) => {
  if (/^(https?:)?\/\//.test(assetPath) || assetPath.startsWith("data:")) {
    return assetPath;
  }

  const normalizedPath = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;
  if (envConfig.appBasePath === "/") {
    return normalizedPath;
  }
  return `${envConfig.appBasePath}${normalizedPath}`;
};

export const resolveUploadedAssetUrl = (pathOrUrl: string | null | undefined) => {
  if (!pathOrUrl) {
    return "";
  }

  if (pathOrUrl.startsWith("data:")) {
    return pathOrUrl;
  }

  if (/^https?:\/\//i.test(pathOrUrl)) {
    try {
      const parsed = new URL(pathOrUrl);

      if (isLoopbackHost(parsed.hostname)) {
        return `${apiPublicBase}${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    } catch {
      return pathOrUrl;
    }

    return pathOrUrl;
  }

  const normalizedPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  if (apiPublicBase && normalizedPath.startsWith(`${apiPublicBase}/`)) {
    return normalizedPath;
  }
  return `${apiPublicBase}${normalizedPath}`;
};
