import { env } from "./env";
import type { ApiResponse, ApiSuccess } from "@/types/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  headers?: HeadersInit;
  query?: Record<string, string | number | undefined | null>;
  cache?: RequestCache;
};

const buildUrl = (path: string, query?: RequestOptions["query"]) => {
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

export class ApiClientError extends Error {
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
  const isFormData = options.body instanceof FormData;

  const response = await fetch(buildUrl(path, options.query), {
    method: options.method ?? "GET",
    credentials: "include",
    headers: {
      "x-org-slug": env.orgSlug,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers
    },
    body: options.body
      ? isFormData
        ? (options.body as FormData)
        : JSON.stringify(options.body)
      : undefined,
    cache: options.cache ?? "no-store"
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success) {
    if (!payload.success) {
      throw new ApiClientError(response.status, payload.error.message, payload.error.code, payload.error.details);
    }

    throw new ApiClientError(response.status, `Request failed with status ${response.status}`);
  }

  return payload as ApiSuccess<T>;
};
