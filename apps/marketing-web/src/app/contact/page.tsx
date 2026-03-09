import { ContactForm } from "@/components/forms/contact-form";
import { getRequestLocale, tServer } from "@/i18n/server";

export default async function ContactPage() {
  const locale = await getRequestLocale();
  const t = (key: string) => tServer(locale, key);

  return (
    <main className="contact-page">
      <section className="section-header">
        <p className="kicker">{t("contact.kicker")}</p>
        <h1>{t("contact.title")}</h1>
        <p>{t("contact.desc")}</p>
      </section>

      <section className="dual-column">
        <article className="panel">
          <h2>{t("contact.formTitle")}</h2>
          <ContactForm sourcePage="/contact" />
        </article>

        <article className="panel">
          <h2>{t("contact.expectationTitle")}</h2>
          <ul className="check-list">
            <li>{t("contact.item1")}</li>
            <li>{t("contact.item2")}</li>
            <li>{t("contact.item3")}</li>
            <li>{t("contact.item4")}</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
