import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { LOCALE_COOKIE_KEY, resolveLocale } from "@/i18n/messages";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as { locale?: string };
  const locale = resolveLocale(payload.locale);
  const cookieStore = await cookies();

  cookieStore.set(LOCALE_COOKIE_KEY, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax"
  });

  return NextResponse.json({ success: true, locale });
}
