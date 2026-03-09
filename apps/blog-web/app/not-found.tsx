import Link from "next/link";

import { getRequestLocale, tServer } from "@/i18n/server";

export default async function NotFoundPage() {
  const locale = await getRequestLocale();
  const t = (key: string) => tServer(locale, key);

  return (
    <section className="empty-state reveal-up">
      <h2>{t("notFound.title")}</h2>
      <p>{t("notFound.desc")}</p>
      <Link href="/" className="primary-btn">
        {t("notFound.back")}
      </Link>
    </section>
  );
}
