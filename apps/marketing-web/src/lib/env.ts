const trimSlash = (input: string) => (input.endsWith("/") ? input.slice(0, -1) : input);
const normalizeBasePath = (input: string | undefined) => {
  if (!input) {
    return "";
  }

  const trimmed = input.trim();
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
  apiBaseUrl: trimSlash(process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:18640/api/v1"),
  orgSlug: process.env.NEXT_PUBLIC_ORG_SLUG ?? "nextsuit-demo",
  blogUrl: trimSlash(process.env.NEXT_PUBLIC_BLOG_URL ?? "http://localhost:18633"),
  basePath,
  withBasePath
};
