import { env } from "@/lib/env";

export const siteName = "NextSuit Insights";

export const siteDescription =
  "A production-style blog web app for Upwork portfolio demos, powered by real API data from the NextSuit suite.";

export const siteUrl = env.siteUrl.replace(/\/$/, "");

export const toAbsoluteUrl = (pathOrUrl: string) => {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const normalizedPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${siteUrl}${normalizedPath}`;
};

export const xmlEscape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
