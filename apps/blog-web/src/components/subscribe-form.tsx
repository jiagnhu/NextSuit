"use client";

import { FormEvent, useMemo, useState } from "react";

import { ApiError } from "@/lib/api-client";
import { useBlogI18n } from "@/i18n/provider";
import { contentApi } from "@/lib/content-api";

type Status = "idle" | "loading" | "success" | "error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SubscribeForm = () => {
  const { translate: t } = useBlogI18n();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  const statusClass = useMemo(() => {
    if (status === "success") {
      return "notice success";
    }

    if (status === "error") {
      return "notice error";
    }

    return "notice";
  }, [status]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();

    if (!EMAIL_PATTERN.test(email)) {
      setStatus("error");
      setMessage(t("subscribe.invalidEmail"));
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const sourcePage = `${window.location.pathname}${window.location.search}`;
      await contentApi.subscribe(email, sourcePage);
      event.currentTarget.reset();
      setStatus("success");
      setMessage(t("subscribe.success"));
    } catch (error) {
      if (error instanceof ApiError) {
        setMessage(error.message);
      } else {
        setMessage(t("subscribe.failed"));
      }
      setStatus("error");
    }
  };

  return (
    <section className="subscribe-panel reveal-up">
      <h3>{t("subscribe.title")}</h3>
      <p>{t("subscribe.desc")}</p>

      <form onSubmit={handleSubmit} className="subscribe-form">
        <input type="email" name="email" placeholder="you@company.com" autoComplete="email" required />
        <button type="submit" className="primary-btn" disabled={status === "loading"}>
          {status === "loading" ? t("subscribe.pending") : t("subscribe.button")}
        </button>
      </form>

      {(status === "success" || status === "error") && <p className={statusClass}>{message}</p>}
    </section>
  );
};
