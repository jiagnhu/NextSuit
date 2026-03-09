#!/usr/bin/env node

const API_BASE_URL = process.env.SMOKE_API_BASE_URL ?? "http://localhost:18640/api/v1";
const ORG_SLUG = process.env.SMOKE_ORG_SLUG ?? "nextsuit-demo";
const ADMIN_EMAIL = process.env.SMOKE_ADMIN_EMAIL ?? "admin@nextsuit.dev";
const ADMIN_PASSWORD = process.env.SMOKE_ADMIN_PASSWORD ?? "Admin123!";

const request = async (path, init = {}) => {
  const headers = new Headers(init.headers ?? {});
  headers.set("x-org-slug", ORG_SLUG);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers
  });
};

const readJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const assertSuccess = async (response, label) => {
  const payload = await readJson(response);

  if (!response.ok || !payload?.success) {
    throw new Error(
      `${label} failed: status=${response.status}, payload=${JSON.stringify(payload ?? null)}`
    );
  }

  return payload;
};

const run = async () => {
  const marker = Date.now();

  const healthRes = await request("/health");
  const health = await assertSuccess(healthRes, "health");
  console.log(`[smoke] health: ${health.data.status}`);

  const loginRes = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    })
  });

  const login = await assertSuccess(loginRes, "auth/login");
  const cookieHeader = loginRes.headers.get("set-cookie");

  if (!cookieHeader) {
    throw new Error("auth/login failed: missing set-cookie header");
  }

  const sessionCookie = cookieHeader.split(";")[0];
  console.log(`[smoke] login: ${login.data.email}`);

  const authHeaders = {
    Cookie: sessionCookie
  };

  await assertSuccess(
    await request("/auth/me", {
      method: "GET",
      headers: authHeaders
    }),
    "auth/me"
  );
  console.log("[smoke] auth/me: ok");

  await assertSuccess(
    await request("/dashboard/overview", {
      method: "GET",
      headers: authHeaders
    }),
    "dashboard/overview"
  );
  console.log("[smoke] dashboard/overview: ok");

  await assertSuccess(
    await request("/articles", {
      method: "GET"
    }),
    "articles"
  );
  console.log("[smoke] articles list: ok");

  const uniqueEmail = `smoke_${marker}@example.com`;

  await assertSuccess(
    await request("/contacts", {
      method: "POST",
      body: JSON.stringify({
        name: "Smoke Contact",
        email: uniqueEmail,
        company: "Smoke Co",
        subject: "Smoke Contact",
        message: "Smoke test contact submission.",
        sourcePage: "/smoke"
      })
    }),
    "contacts create"
  );
  console.log("[smoke] contacts create: ok");

  await assertSuccess(
    await request("/subscribers", {
      method: "POST",
      body: JSON.stringify({
        email: `sub_${marker}@example.com`,
        sourcePage: "/smoke"
      })
    }),
    "subscribers create"
  );
  console.log("[smoke] subscribers create: ok");

  await assertSuccess(
    await request("/leads", {
      method: "POST",
      body: JSON.stringify({
        name: "Smoke Lead",
        email: `lead_${marker}@example.com`,
        company: "Smoke Co",
        budgetRange: "$5k-$10k",
        interest: "Marketing Website",
        source: "smoke-test"
      })
    }),
    "leads create"
  );
  console.log("[smoke] leads create: ok");

  await assertSuccess(
    await request("/auth/logout", {
      method: "POST",
      headers: authHeaders
    }),
    "auth/logout"
  );
  console.log("[smoke] logout: ok");

  console.log("[smoke] all checks passed");
};

run().catch((error) => {
  console.error(`[smoke] failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
