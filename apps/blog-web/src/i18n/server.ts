import { cookies } from "next/headers";

import { LOCALE_COOKIE_KEY, resolveLocale, t, type Locale } from "@/i18n/messages";

export const getRequestLocale = async (): Promise<Locale> => {
  const cookieStore = await cookies();
  const locale = cookieStore.get(LOCALE_COOKIE_KEY)?.value;
  return resolveLocale(locale);
};

export const tServer = (locale: Locale, key: string, vars?: Record<string, string | number>) =>
  t(locale, key, vars);
