"use client";

import { useActionState, useEffect, useRef } from "react";

import { submitContactAction } from "@/app/actions";
import { initialActionState } from "@/app/action-state";
import { FormSubmitButton } from "@/components/forms/form-submit-button";
import { useMarketingI18n } from "@/i18n/provider";

type ContactFormProps = {
  sourcePage: string;
};

export const ContactForm = ({ sourcePage }: ContactFormProps) => {
  const { translate: t } = useMarketingI18n();
  const [state, action, isPending] = useActionState(submitContactAction, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={action} className="panel-form">
      <input type="hidden" name="sourcePage" value={sourcePage} />
      <input type="text" name="honey" tabIndex={-1} autoComplete="off" className="hp-field" />

      <label htmlFor="contact-name">{t("form.name")}</label>
      <input id="contact-name" name="name" required placeholder={t("form.placeholderName")} />

      <label htmlFor="contact-email">{t("form.email")}</label>
      <input id="contact-email" name="email" type="email" required placeholder={t("form.placeholderEmail")} />

      <label htmlFor="contact-company">{t("form.company")}</label>
      <input id="contact-company" name="company" placeholder={t("form.placeholderCompany")} />

      <label htmlFor="contact-subject">{t("form.subject")}</label>
      <input id="contact-subject" name="subject" placeholder={t("form.placeholderSubject")} />

      <label htmlFor="contact-message">{t("form.message")}</label>
      <textarea
        id="contact-message"
        name="message"
        rows={6}
        required
        placeholder={t("form.placeholderMessage")}
      />

      <FormSubmitButton label={t("form.submitContact")} pendingLabel={t("form.pending")} />
      {isPending ? (
        <p className="form-pending" aria-live="polite">
          {t("form.pendingHint")}
        </p>
      ) : state.message ? (
        <p className={state.status === "error" ? "form-error" : "form-success"} aria-live="polite">
          {state.message}
        </p>
      ) : null}
    </form>
  );
};
