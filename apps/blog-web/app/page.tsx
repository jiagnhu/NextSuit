import Link from "next/link";

import { ArticleCard } from "@/components/article-card";
import { FiltersPanel } from "@/components/filters-panel";
import { Pagination } from "@/components/pagination";
import { StructuredData } from "@/components/structured-data";
import { SubscribeForm } from "@/components/subscribe-form";
import { getRequestLocale, tServer } from "@/i18n/server";
import { contentApi } from "@/lib/content-api";
import { siteDescription, siteName, toAbsoluteUrl } from "@/lib/seo";
import { buildPathWithQuery, firstValue, toPositiveInt, type SearchParamValue } from "@/lib/url";

type SearchParams = Record<string, SearchParamValue>;

type HomePageProps = {
  searchParams?: Promise<SearchParams>;
};

const PAGE_SIZE = 9;

const readString = (params: SearchParams, key: string) => {
  const value = firstValue(params[key]);
  return value?.trim() ? value.trim() : undefined;
};

const readHeroContent = (settings: { key: string; valueJson: unknown }[]) => {
  const heroSetting = settings.find((item) => item.key === "marketing.home.hero")?.valueJson;

  if (!heroSetting || typeof heroSetting !== "object") {
    return {
      title: "Architecture notes from real SaaS delivery",
      subtitle: "Actionable frontend + growth playbooks for teams shipping under constraints."
    };
  }

  const record = heroSetting as { title?: unknown; subtitle?: unknown };

  return {
    title: typeof record.title === "string" && record.title.trim() ? record.title : "Architecture notes from real SaaS delivery",
    subtitle:
      typeof record.subtitle === "string" && record.subtitle.trim()
        ? record.subtitle
        : "Actionable frontend + growth playbooks for teams shipping under constraints."
  };
};

export default async function HomePage(props: HomePageProps) {
  const locale = await getRequestLocale();
  const t = (key: string) => tServer(locale, key);
  const searchParams = (await props.searchParams) ?? {};

  const page = toPositiveInt(firstValue(searchParams.page), 1);
  const search = readString(searchParams, "search");
  const category = readString(searchParams, "category");
  const tag = readString(searchParams, "tag");

  const fallbackResult = {
    items: [],
    meta: {
      page,
      pageSize: PAGE_SIZE,
      total: 0,
      totalPages: 1
    }
  };

  const [articlesResult, categories, tags, settings] = await Promise.all([
    contentApi
      .listArticles({
        page,
        pageSize: PAGE_SIZE,
        search,
        category,
        tag
      })
      .catch(() => fallbackResult),
    contentApi.listCategories().catch(() => []),
    contentApi.listTags().catch(() => []),
    contentApi.listPublicSettings().catch(() => [])
  ]);

  const hero = readHeroContent(settings);
  const listPath = buildPathWithQuery("/", { page, search, category, tag });
  const listUrl = toAbsoluteUrl(listPath);

  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: siteName,
    description: siteDescription,
    url: toAbsoluteUrl("/")
  };

  const listSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${siteName} articles`,
    url: listUrl,
    numberOfItems: articlesResult.items.length,
    itemListElement: articlesResult.items.map((article, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: toAbsoluteUrl(`/articles/${article.slug}`),
      name: article.title
    }))
  };

  return (
    <div className="page-shell">
      <StructuredData data={[homeSchema, listSchema]} />

      <section className="hero-panel reveal-up">
        <p className="eyebrow">{t("home.eyebrow")}</p>
        <h1>{hero.title}</h1>
        <p>{hero.subtitle}</p>

        <div className="hero-meta">
          <span>
            {articlesResult.meta.total} {t("home.indexedPosts")}
          </span>
          <span>
            {categories.length} {t("home.categories")}
          </span>
          <span>
            {tags.length} {t("home.tags")}
          </span>
        </div>
      </section>

      <FiltersPanel search={search} category={category} tag={tag} categories={categories} tags={tags} />

      <section className="article-grid" aria-label="Article list">
        {articlesResult.items.length === 0 && (
          <div className="empty-state reveal-up">
            <h3>{t("home.emptyTitle")}</h3>
            <p>{t("home.emptyDesc")}</p>
          </div>
        )}

        {articlesResult.items.map((article, index) => (
          <ArticleCard
            key={article.id}
            article={article}
            index={index}
            labels={{
              uncategorized: t("articleCard.uncategorized"),
              noExcerpt: t("articleCard.noExcerpt"),
              minRead: t("articleCard.minRead")
            }}
          />
        ))}
      </section>

      <Pagination
        page={articlesResult.meta.page}
        totalPages={articlesResult.meta.totalPages}
        basePath="/"
        labels={{
          aria: t("pagination.aria"),
          previous: t("pagination.previous"),
          next: t("pagination.next")
        }}
        query={{
          search,
          category,
          tag
        }}
      />

      <section className="topic-strip reveal-up" aria-label="Quick filters">
        <h3>{t("home.quickTopic")}</h3>
        <div className="chip-row">
          {tags.map((item) => (
            <Link key={item.id} href={buildPathWithQuery("/", { tag: item.slug })} className="chip" scroll={false}>
              #{item.name}
            </Link>
          ))}
        </div>
      </section>

      <SubscribeForm />
    </div>
  );
}
