"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { localeOptions, type Locale } from "@/i18n/messages";
import { useBlogI18n } from "@/i18n/provider";
import { env } from "@/lib/env";

export const LocaleSwitch = () => {
  const router = useRouter();
  const { locale, setLocale } = useBlogI18n();
  const [isPending, setIsPending] = useState(false);

  const onChangeLocale = async (nextLocale: Locale) => {
    if (nextLocale === locale || isPending) {
      return;
    }

    setIsPending(true);

    try {
      await fetch(env.withBasePath("/api/locale"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ locale: nextLocale })
      });

      setLocale(nextLocale);
      router.refresh();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="locale-switch" role="group" aria-label="language switch">
      {localeOptions.map((item) => (
        <button
          key={item.value}
          type="button"
          className={`locale-btn ${locale === item.value ? "locale-btn-active" : ""}`}
          onClick={() => onChangeLocale(item.value)}
          disabled={isPending}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};
