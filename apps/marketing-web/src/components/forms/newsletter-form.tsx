"use client";

import { useActionState, useEffect, useRef } from "react";

import { submitSubscriberAction } from "@/app/actions";
import { initialActionState } from "@/app/action-state";
import { FormSubmitButton } from "@/components/forms/form-submit-button";
import { useMarketingI18n } from "@/i18n/provider";

type NewsletterFormProps = {
  sourcePage: string;
};

export const NewsletterForm = ({ sourcePage }: NewsletterFormProps) => {
  const { translate: t } = useMarketingI18n();
  const [state, action, isPending] = useActionState(submitSubscriberAction, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={action} className="panel-form">
      <input type="hidden" name="sourcePage" value={sourcePage} />
      <label htmlFor="newsletter-email">{t("form.workEmail")}</label>
      <input id="newsletter-email" name="email" type="email" required placeholder="you@company.com" />
      <FormSubmitButton label={t("form.submitSubscribe")} pendingLabel={t("form.pending")} />
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
