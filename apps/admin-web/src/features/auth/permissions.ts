import type { MeProfile } from "./types";

const normalizePath = (pathname: string) => {
  const trimmed = pathname.trim();
  if (!trimmed || trimmed === "/") {
    return "/";
  }

  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
};

export const hasRole = (profile: MeProfile | undefined, role: string) =>
  Boolean(profile?.roles.some((item) => item.code === role));

export const isAdminUser = (profile: MeProfile | undefined) => hasRole(profile, "admin");

export const canAccessPath = (profile: MeProfile | undefined, pathname: string) => {
  if (isAdminUser(profile)) {
    return true;
  }

  const path = normalizePath(pathname);
  return path === "/dashboard" || path === "/content/articles" || path === "/about";
};

