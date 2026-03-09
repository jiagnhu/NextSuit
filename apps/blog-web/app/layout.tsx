import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { LocaleSwitch } from "@/components/locale-switch";
import { PageViewTracker } from "@/components/page-view-tracker";
import { BlogI18nProvider } from "@/i18n/provider";
import { getRequestLocale, tServer } from "@/i18n/server";
import { env } from "@/lib/env";
import { siteDescription, siteName, siteUrl } from "@/lib/seo";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`
  },
  description: siteDescription,
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": `${siteUrl}/rss.xml`
    }
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: siteName,
    description: siteDescription,
    siteName,
    images: [
      {
        url: `${siteUrl}/api/og?title=${encodeURIComponent(siteName)}`,
        width: 1200,
        height: 630,
        alt: siteName
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: [`${siteUrl}/api/og?title=${encodeURIComponent(siteName)}`]
  }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getRequestLocale();
  const t = (key: string) => tServer(locale, key);

  return (
    <html lang={locale}>
      <body>
        <BlogI18nProvider initialLocale={locale}>
          <Suspense fallback={null}>
            <PageViewTracker />
          </Suspense>
          <div className="bg-orb orb-one" aria-hidden="true" />
          <div className="bg-orb orb-two" aria-hidden="true" />

          <header className="site-header">
            <Link href="/" className="brand-link">
              <span className="brand-mark">NS</span>
              <span>
                <strong>NextSuit Insights</strong>
                <small>{t("layout.subtitle")}</small>
              </span>
            </Link>

            <nav className="site-nav">
              <Link href="/">{t("layout.articles")}</Link>
              <a href={env.adminUrl} target="_blank" rel="noreferrer">
                {t("layout.openCms")}
              </a>
              <LocaleSwitch />
            </nav>
          </header>

          <main className="site-main">{children}</main>

          <footer className="site-footer">
            <p>{t("layout.footer")}</p>
          </footer>
        </BlogI18nProvider>
      </body>
    </html>
  );
}
