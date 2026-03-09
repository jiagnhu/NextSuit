"use client";

import { createContext, useContext, useMemo, useState, type PropsWithChildren } from "react";

import { t, type Locale } from "@/i18n/messages";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  translate: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const BlogI18nProvider = ({
  children,
  initialLocale
}: PropsWithChildren<{ initialLocale: Locale }>) => {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      translate: (key, vars) => t(locale, key, vars)
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useBlogI18n = () => {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useBlogI18n must be used within BlogI18nProvider");
  }

  return context;
};
