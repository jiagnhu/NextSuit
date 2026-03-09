import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { ApiError } from "@/lib/api-client";
import { contentApi } from "@/lib/content-api";
import { formatDate, readingTime } from "@/lib/format";
import { getRequestLocale, tServer } from "@/i18n/server";
import { siteName, siteUrl, toAbsoluteUrl } from "@/lib/seo";
import { buildPathWithQuery } from "@/lib/url";
import { StructuredData } from "@/components/structured-data";

type Params = {
  slug: string;
};

type ArticleDetailPageProps = {
  params: Promise<Params>;
};

const resolveArticle = async (slug: string) => {
  try {
    return await contentApi.getArticleBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.code === "ARTICLE_NOT_FOUND")) {
      notFound();
    }
    throw error;
  }
};

export async function generateMetadata(props: ArticleDetailPageProps): Promise<Metadata> {
  const params = await props.params;
  const article = await resolveArticle(params.slug);
  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.excerpt || `Read ${article.title} on ${siteName}`;
  const url = `${siteUrl}/articles/${article.slug}`;
  const ogImage = `${siteUrl}/api/og?title=${encodeURIComponent(article.title)}&subtitle=${encodeURIComponent(
    article.excerpt || "Engineering and growth delivery notes."
  )}`;

  return {
    title,
    description,
    alternates: {
      canonical: url
    },
    keywords: article.articleTags.map((item) => item.tag.name),
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName,
      images: [
        {
          url: article.coverImage ? toAbsoluteUrl(article.coverImage) : ogImage,
          width: 1200,
          height: 630,
          alt: title
        }
      ],
      publishedTime: article.publishedAt || article.createdAt,
      modifiedTime: article.updatedAt,
      tags: article.articleTags.map((item) => item.tag.name)
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [article.coverImage ? toAbsoluteUrl(article.coverImage) : ogImage]
    }
  };
}

export default async function ArticleDetailPage(props: ArticleDetailPageProps) {
  const locale = await getRequestLocale();
  const t = (key: string) => tServer(locale, key);
  const params = await props.params;
  const article = await resolveArticle(params.slug);
  const coverImageUrl = article.coverImage ? toAbsoluteUrl(article.coverImage) : null;
  const articleUrl = toAbsoluteUrl(`/articles/${article.slug}`);
  const publishedAt = article.publishedAt ?? article.createdAt;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || undefined,
    datePublished: publishedAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: articleUrl,
    image: article.coverImage ? [toAbsoluteUrl(article.coverImage)] : undefined,
    author: {
      "@type": "Person",
      name: article.author.name
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/api/og?title=${encodeURIComponent("NS")}&subtitle=${encodeURIComponent(siteName)}`
      }
    },
    keywords: article.articleTags.map((item) => item.tag.name).join(", ")
  };

  return (
    <article className="article-page reveal-up">
      <StructuredData data={articleSchema} />

      <Link href="/" className="inline-link back-link">
        {t("articleDetail.back")}
      </Link>

      <header className="article-page-head">
        <h1>{article.title}</h1>
        <p>{article.excerpt ?? t("articleDetail.excerptFallback")}</p>

        {coverImageUrl ? (
          <figure className="article-hero-image">
            <img src={coverImageUrl} alt={article.title} loading="eager" />
          </figure>
        ) : null}

        <div className="hero-meta">
          <span>{formatDate(article.publishedAt ?? article.createdAt)}</span>
          <span>
            {readingTime(article.contentMd)} {t("articleDetail.minRead")}
          </span>
          {article.category && (
            <Link href={buildPathWithQuery("/", { category: article.category.slug })}>{article.category.name}</Link>
          )}
        </div>

        <div className="chip-row">
          {article.articleTags.map((relation) => (
            <Link
              key={relation.tag.id}
              href={buildPathWithQuery("/", {
                tag: relation.tag.slug
              })}
              className="chip"
            >
              #{relation.tag.name}
            </Link>
          ))}
        </div>
      </header>

      <section className="article-markdown">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.contentMd}</ReactMarkdown>
      </section>
    </article>
  );
}
