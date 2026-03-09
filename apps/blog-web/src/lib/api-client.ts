import { env } from "@/lib/env";
import type { ApiResponse, ApiSuccess } from "@/lib/api-types";

type QueryValue = string | number | boolean | null | undefined;

type RequestOptions = {
  query?: Record<string, QueryValue>;
  init?: RequestInit;
};

const buildUrl = (path: string, query?: Record<string, QueryValue>) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${env.apiBaseUrl}${normalizedPath}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
};

const parsePayload = async <T>(response: Response) => {
  try {
    return (await response.json()) as ApiResponse<T>;
  } catch {
    return null;
  }
};

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, message: string, code = "API_ERROR", details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const apiRequest = async <T>(path: string, options: RequestOptions = {}) => {
  const headers = new Headers(options.init?.headers);
  headers.set("x-org-slug", env.orgSlug);

  const response = await fetch(buildUrl(path, options.query), {
    ...options.init,
    headers,
    cache: options.init?.cache ?? "no-store"
  });

  const payload = await parsePayload<T>(response);

  if (!payload || !response.ok || !payload.success) {
    if (payload && !payload.success) {
      throw new ApiError(response.status, payload.error.message, payload.error.code, payload.error.details);
    }

    throw new ApiError(response.status, `Request failed with status ${response.status}`);
  }

  return payload as ApiSuccess<T>;
};
