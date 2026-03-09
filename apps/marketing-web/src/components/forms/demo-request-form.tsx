"use client";

import { useActionState, useEffect, useRef } from "react";

import { submitLeadAction } from "@/app/actions";
import { initialActionState } from "@/app/action-state";
import { FormSubmitButton } from "@/components/forms/form-submit-button";
import { useMarketingI18n } from "@/i18n/provider";

type DemoRequestFormProps = {
  source: string;
};

export const DemoRequestForm = ({ source }: DemoRequestFormProps) => {
  const { translate: t } = useMarketingI18n();
  const [state, action, isPending] = useActionState(submitLeadAction, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={action} className="panel-form">
      <input type="hidden" name="source" value={source} />

      <label htmlFor="lead-name">{t("form.name")}</label>
      <input id="lead-name" name="name" required placeholder={t("form.placeholderName")} />

      <label htmlFor="lead-email">{t("form.workEmail")}</label>
      <input id="lead-email" name="email" type="email" required placeholder={t("form.placeholderEmail")} />

      <label htmlFor="lead-company">{t("form.company")}</label>
      <input id="lead-company" name="company" placeholder={t("form.placeholderCompany")} />

      <label htmlFor="lead-interest">{t("form.projectType")}</label>
      <select id="lead-interest" name="interest" defaultValue="">
        <option value="" disabled>
          {t("form.selectOne")}
        </option>
        <option value="SaaS Dashboard">SaaS Dashboard</option>
        <option value="Marketing Website">Marketing Website</option>
        <option value="Content Platform">Content Platform</option>
      </select>

      <label htmlFor="lead-budget">{t("form.budget")}</label>
      <select id="lead-budget" name="budgetRange" defaultValue="">
        <option value="" disabled>
          {t("form.selectRange")}
        </option>
        <option value="$3k-$5k">$3k-$5k</option>
        <option value="$5k-$10k">$5k-$10k</option>
        <option value="$10k-$25k">$10k-$25k</option>
      </select>

      <label htmlFor="lead-notes">{t("form.notes")}</label>
      <textarea id="lead-notes" name="notes" rows={4} placeholder={t("form.placeholderNotes")} />

      <FormSubmitButton label={t("form.submitLead")} pendingLabel={t("form.pending")} />
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
