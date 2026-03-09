import Link from "next/link";

import type { ArticleItem } from "@/lib/api-types";
import { formatDate, readingTime } from "@/lib/format";
import { toAbsoluteUrl } from "@/lib/seo";
import { buildPathWithQuery } from "@/lib/url";

type ArticleCardProps = {
  article: ArticleItem;
  index: number;
  labels: {
    uncategorized: string;
    noExcerpt: string;
    minRead: string;
  };
};

export const ArticleCard = ({ article, index, labels }: ArticleCardProps) => {
  const publishDate = formatDate(article.publishedAt ?? article.createdAt);
  const minutes = readingTime(article.contentMd);
  const coverImageUrl = article.coverImage ? toAbsoluteUrl(article.coverImage) : null;

  return (
    <article className="article-card" style={{ animationDelay: `${Math.min(index, 6) * 70}ms` }}>
      {coverImageUrl ? (
        <Link href={`/articles/${article.slug}`} className="article-cover-link">
          <img src={coverImageUrl} alt={article.title} className="article-cover" loading="lazy" />
        </Link>
      ) : null}

      <div className="article-headline-row">
        {article.category ? (
          <Link href={buildPathWithQuery("/", { category: article.category.slug })} className="article-category">
            {article.category.name}
          </Link>
        ) : (
          <span className="article-category article-category-muted">{labels.uncategorized}</span>
        )}
        <span className="article-meta">{publishDate}</span>
      </div>

      <Link href={`/articles/${article.slug}`} className="article-title-link">
        <h2>{article.title}</h2>
      </Link>

      <p className="article-excerpt">{article.excerpt ?? labels.noExcerpt}</p>

      <div className="article-footer-row">
        <span className="article-meta">
          {minutes} {labels.minRead}
        </span>
        <div className="chip-row">
          {article.articleTags.slice(0, 2).map((relation) => (
            <Link
              key={relation.tag.id}
              href={buildPathWithQuery("/", { tag: relation.tag.slug })}
              className="chip chip-muted"
            >
              #{relation.tag.name}
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
};
