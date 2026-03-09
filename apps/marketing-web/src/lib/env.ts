const trimSlash = (input: string) => (input.endsWith("/") ? input.slice(0, -1) : input);

export const env = {
  apiBaseUrl: trimSlash(process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1"),
  orgSlug: process.env.NEXT_PUBLIC_ORG_SLUG ?? "nextsuit-demo",
  blogUrl: trimSlash(process.env.NEXT_PUBLIC_BLOG_URL ?? "http://localhost:3003")
};
