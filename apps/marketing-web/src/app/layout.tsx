import type { Metadata } from "next";
import Link from "next/link";

import { LocaleSwitch } from "@/components/locale-switch";
import { MarketingI18nProvider } from "@/i18n/provider";
import { getRequestLocale, tServer } from "@/i18n/server";

import "./globals.css";

export const metadata: Metadata = {
  title: "SuiteOps Growth Site",
  description: "Marketing website demo powered by Next.js + Node.js API"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();
  const t = (key: string) => tServer(locale, key);

  return (
    <html lang={locale}>
      <body>
        <MarketingI18nProvider initialLocale={locale}>
          <div className="site-shell">
            <header className="site-header">
              <Link href="/" className="brand">
                SuiteOps
              </Link>
              <nav>
                <Link href="/">{t("nav.home")}</Link>
                <a href="/#pricing">{t("nav.pricing")}</a>
                <a href="/#insights">{t("nav.insights")}</a>
                <Link href="/contact">{t("nav.contact")}</Link>
                <LocaleSwitch />
              </nav>
            </header>

            {children}

            <footer className="site-footer">
              <p>{t("footer.line1")}</p>
              <p>{t("footer.line2")}</p>
            </footer>
          </div>
        </MarketingI18nProvider>
      </body>
    </html>
  );
}
