"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { env } from "@/lib/env";

const STORAGE_KEY = "nextsuit:tracked-pageviews";

const classifyDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/bot|spider|crawler|curl/.test(userAgent)) {
    return "bot";
  }

  if (/ipad|tablet/.test(userAgent)) {
    return "tablet";
  }

  if (/mobi|android|iphone/.test(userAgent)) {
    return "mobile";
  }

  return "desktop";
};

const readTrackedPaths = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return new Set<string>();
    }

    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set<string>();
  }
};

const persistTrackedPaths = (paths: Set<string>) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(paths).slice(-80)));
  } catch {
    // Ignore storage errors in private mode.
  }
};

export const PageViewTracker = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) {
      return;
    }

    const search = searchParams.toString();
    const path = search ? `${pathname}?${search}` : pathname;
    const trackedPaths = readTrackedPaths();

    if (trackedPaths.has(path)) {
      return;
    }

    trackedPaths.add(path);
    persistTrackedPaths(trackedPaths);

    const utmSource = searchParams.get("utm_source") || undefined;

    const payload = {
      path,
      referrer: document.referrer || undefined,
      utmSource,
      device: classifyDevice()
    };

    const endpoint = `${env.apiBaseUrl}/page-views`;

    void fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-org-slug": env.orgSlug
      },
      body: JSON.stringify(payload),
      keepalive: true,
      cache: "no-store"
    }).catch(() => {
      // Tracking failure should never break page rendering.
    });
  }, [pathname, searchParams]);

  return null;
};
