import Link from "next/link";

import { DemoRequestForm } from "@/components/forms/demo-request-form";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { getRequestLocale, tServer } from "@/i18n/server";
import { env } from "@/lib/env";
import { getMarketingHomeData } from "@/lib/marketing-api";

export const revalidate = 120;

export default async function HomePage() {
  const locale = await getRequestLocale();
  const t = (key: string) => tServer(locale, key);
  const homeData = await getMarketingHomeData();

  return (
    <main>
      <section className="hero">
        <div>
          <p className="kicker">{t("home.heroKicker")}</p>
          <h1>{homeData.hero.title}</h1>
          <p>{homeData.hero.subtitle}</p>
          <div className="hero-actions">
            <a href="#book-demo" className="btn btn-primary">
              {t("home.bookDemo")}
            </a>
            <Link href="/contact" className="btn btn-ghost">
              {t("home.contactTeam")}
            </Link>
          </div>
        </div>

        <div className="hero-stat-grid">
          <article>
            <h3>42%</h3>
            <p>{t("home.statLead")}</p>
          </article>
          <article>
            <h3>9 days</h3>
            <p>{t("home.statMvp")}</p>
          </article>
          <article>
            <h3>99.9%</h3>
            <p>{t("home.statUptime")}</p>
          </article>
        </div>
      </section>

      <section className="feature-grid">
        <article className="panel">
          <h3>{t("home.feature1Title")}</h3>
          <p>{t("home.feature1Desc")}</p>
        </article>
        <article className="panel">
          <h3>{t("home.feature2Title")}</h3>
          <p>{t("home.feature2Desc")}</p>
        </article>
        <article className="panel">
          <h3>{t("home.feature3Title")}</h3>
          <p>{t("home.feature3Desc")}</p>
        </article>
      </section>

      <section id="book-demo" className="dual-column">
        <article className="panel">
          <h2>{t("home.demoTitle")}</h2>
          <p>{t("home.demoDesc")}</p>
          <DemoRequestForm source="marketing-home-demo" />
        </article>
        <article className="panel">
          <h2>{t("home.newsletterTitle")}</h2>
          <p>{t("home.newsletterDesc")}</p>
          <NewsletterForm sourcePage="/" />
        </article>
      </section>

      <section id="pricing" className="pricing-section">
        <div className="section-header">
          <p className="kicker">{t("home.pricingKicker")}</p>
          <h2>{t("home.pricingTitle")}</h2>
        </div>

        <div className="pricing-grid">
          {homeData.plans.map((plan) => (
            <article key={plan.name} className="panel pricing-card">
              <h3>{plan.name}</h3>
              <p className="price">${plan.price}</p>
              <p>{t("home.perMonth")}</p>
              <Link className="btn btn-ghost" href="/contact">
                {t("home.talkToSales")}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="insights" className="insights-section">
        <div className="section-header">
          <p className="kicker">{t("home.insightsKicker")}</p>
          <h2>{t("home.insightsTitle")}</h2>
        </div>

        <div className="insights-grid">
          {homeData.featuredArticles.length ? (
            homeData.featuredArticles.map((article) => (
              <article key={article.id} className="panel insight-card">
                <div className="insight-meta">
                  <span>{article.category?.name ?? t("home.categoryFallback")}</span>
                  <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : t("home.draft")}</span>
                </div>
                <h3>{article.title}</h3>
                <p>{article.excerpt ?? t("home.articleExcerptFallback")}</p>
                <a href={`${env.blogUrl}/articles/${article.slug}`} target="_blank" rel="noreferrer">
                  {t("home.openArticle")}
                </a>
              </article>
            ))
          ) : (
            <article className="panel insight-card">
              <h3>{t("home.noArticlesTitle")}</h3>
              <p>{t("home.noArticlesDesc")}</p>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
