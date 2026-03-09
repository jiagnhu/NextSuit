import { contentApi } from "@/lib/content-api";
import { siteDescription, siteName, siteUrl, toAbsoluteUrl, xmlEscape } from "@/lib/seo";

export const revalidate = 600;

export async function GET() {
  const articles = await contentApi.listAllArticles();

  const itemsXml = articles
    .slice(0, 50)
    .map((article) => {
      const title = xmlEscape(article.title);
      const description = xmlEscape(article.excerpt || article.contentMd.slice(0, 220));
      const link = `${siteUrl}/articles/${article.slug}`;
      const pubDate = new Date(article.publishedAt ?? article.createdAt).toUTCString();
      const guid = xmlEscape(article.id);
      const coverImage = article.coverImage ? `<enclosure url="${xmlEscape(toAbsoluteUrl(article.coverImage))}" />` : "";

      return `<item><title>${title}</title><description>${description}</description><link>${xmlEscape(
        link
      )}</link><guid isPermaLink="false">${guid}</guid><pubDate>${xmlEscape(pubDate)}</pubDate>${coverImage}</item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${xmlEscape(
    siteName
  )}</title><description>${xmlEscape(siteDescription)}</description><link>${xmlEscape(
    siteUrl
  )}</link>${itemsXml}</channel></rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=600, stale-while-revalidate=1200"
    }
  });
}
