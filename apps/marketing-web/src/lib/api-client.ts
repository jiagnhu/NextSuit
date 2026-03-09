import { env } from "./env";
import type { ApiResponse, ApiSuccess } from "@/types/api";

type QueryValue = string | number | boolean | null | undefined;

type ApiRequestOptions = Omit<RequestInit, "body" | "next"> & {
  body?: unknown;
  query?: Record<string, QueryValue>;
  revalidate?: number;
};

const buildUrl = (path: string, query?: Record<string, QueryValue>) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${env.apiBaseUrl}${normalizedPath}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        return;
      }
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
};

const maybeJsonBody = (body: unknown): BodyInit | undefined => {
  if (!body) {
    return undefined;
  }

  if (
    typeof body === "string" ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer
  ) {
    return body;
  }

  return JSON.stringify(body);
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

export const apiRequest = async <T>(path: string, options: ApiRequestOptions = {}) => {
  const { query, revalidate, headers, body, ...rest } = options;
  const normalizedBody = maybeJsonBody(body);

  const requestInit: RequestInit & { next?: { revalidate?: number | false } } = {
    ...rest,
    body: normalizedBody,
    headers: {
      "x-org-slug": env.orgSlug,
      ...(normalizedBody && !(normalizedBody instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...headers
    }
  };

  if (typeof revalidate === "number") {
    requestInit.next = { revalidate };
  }

  const response = await fetch(buildUrl(path, query), requestInit);

  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError(response.status, "Invalid API response", "API_INVALID_RESPONSE");
  }

  if (!response.ok || !payload.success) {
    if (payload && !payload.success) {
      throw new ApiClientError(response.status, payload.error.message, payload.error.code, payload.error.details);
    }

    throw new ApiClientError(response.status, `Request failed with status ${response.status}`);
  }

  return payload as ApiSuccess<T>;
};
