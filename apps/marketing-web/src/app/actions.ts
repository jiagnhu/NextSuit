"use server";

import type { FormActionState } from "@/app/action-state";
import { apiRequest, ApiClientError } from "@/lib/api-client";
import { getRequestLocale, tServer } from "@/i18n/server";

const pickText = (value: FormDataEntryValue | null) => (typeof value === "string" ? value.trim() : "");

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export const submitSubscriberAction = async (
  _prev: FormActionState,
  formData: FormData
): Promise<FormActionState> => {
  const locale = await getRequestLocale();
  const t = (key: string) => tServer(locale, key);

  const email = pickText(formData.get("email"));
  const sourcePage = pickText(formData.get("sourcePage"));

  if (!email || !email.includes("@")) {
    return { status: "error", message: t("action.invalidEmail") };
  }

  try {
    await apiRequest("/subscribers", {
      method: "POST",
      body: {
        email,
        sourcePage: sourcePage || undefined
      },
      cache: "no-store"
    });

    return { status: "success", message: t("action.subscriberSuccess") };
  } catch (error) {
    return {
      status: "error",
      message: extractErrorMessage(error, t("action.subscriberFailed"))
    };
  }
};

export const submitContactAction = async (
  _prev: FormActionState,
  formData: FormData
): Promise<FormActionState> => {
  const locale = await getRequestLocale();
  const t = (key: string) => tServer(locale, key);

  const name = pickText(formData.get("name"));
  const email = pickText(formData.get("email"));
  const company = pickText(formData.get("company"));
  const subject = pickText(formData.get("subject"));
  const message = pickText(formData.get("message"));
  const sourcePage = pickText(formData.get("sourcePage"));
  const utmSource = pickText(formData.get("utmSource"));
  const utmMedium = pickText(formData.get("utmMedium"));
  const utmCampaign = pickText(formData.get("utmCampaign"));
  const honey = pickText(formData.get("honey"));

  if (!name || !email || !message) {
    return { status: "error", message: t("action.contactRequired") };
  }

  try {
    await apiRequest("/contacts", {
      method: "POST",
      body: {
        name,
        email,
        company: company || undefined,
        subject: subject || undefined,
        message,
        sourcePage: sourcePage || undefined,
        utmSource: utmSource || undefined,
        utmMedium: utmMedium || undefined,
        utmCampaign: utmCampaign || undefined,
        honey: honey || undefined
      },
      cache: "no-store"
    });

    return { status: "success", message: t("action.contactSuccess") };
  } catch (error) {
    return {
      status: "error",
      message: extractErrorMessage(error, t("action.contactFailed"))
    };
  }
};

export const submitLeadAction = async (
  _prev: FormActionState,
  formData: FormData
): Promise<FormActionState> => {
  const locale = await getRequestLocale();
  const t = (key: string) => tServer(locale, key);

  const name = pickText(formData.get("name"));
  const email = pickText(formData.get("email"));
  const company = pickText(formData.get("company"));
  const interest = pickText(formData.get("interest"));
  const budgetRange = pickText(formData.get("budgetRange"));
  const source = pickText(formData.get("source"));
  const notes = pickText(formData.get("notes"));

  if (!name || !email) {
    return { status: "error", message: t("action.leadRequired") };
  }

  try {
    await apiRequest("/leads", {
      method: "POST",
      body: {
        name,
        email,
        company: company || undefined,
        interest: interest || undefined,
        budgetRange: budgetRange || undefined,
        source: source || "marketing-home",
        notes: notes || undefined
      },
      cache: "no-store"
    });

    return { status: "success", message: t("action.leadSuccess") };
  } catch (error) {
    return {
      status: "error",
      message: extractErrorMessage(error, t("action.leadFailed"))
    };
  }
};
