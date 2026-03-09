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

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:18640/api/v1",
  orgSlug: import.meta.env.VITE_ORG_SLUG ?? "nextsuit-demo",
  appBasePath: normalizeBasePath(import.meta.env.VITE_APP_BASE_PATH)
};
