import { prisma } from "../../lib/prisma.js";

type TrackPageViewInput = {
  orgId: string;
  path: string;
  referrer?: string;
  utmSource?: string;
  device?: string;
};

type ContentPerformanceInput = {
  orgId: string;
  days: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date: Date) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

const normalizePath = (rawPath: string) => {
  const trimmed = rawPath.trim();
  if (!trimmed) {
    return "/";
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const parsed = new URL(trimmed);
      return `${parsed.pathname}${parsed.search}`.slice(0, 300) || "/";
    } catch {
      return "/";
    }
  }

  if (trimmed.startsWith("/")) {
    return trimmed.slice(0, 300);
  }

  return `/${trimmed}`.slice(0, 300);
};

export const pageViewsService = {
  async track(input: TrackPageViewInput) {
    return prisma.pageView.create({
      data: {
        orgId: input.orgId,
        path: normalizePath(input.path),
        referrer: input.referrer?.trim() || null,
        utmSource: input.utmSource?.trim() || null,
        device: input.device?.trim() || null
      },
      select: {
        id: true,
        path: true,
        referrer: true,
        utmSource: true,
        device: true,
        createdAt: true
      }
    });
  },

  async getContentPerformance(input: ContentPerformanceInput) {
    const today = startOfDay(new Date());
    const since = new Date(today.getTime() - (input.days - 1) * DAY_MS);

    const [totalViews, uniquePathResult, topPathsRows, topReferrersRows, dailyRows, topArticleSlugRows] =
      await Promise.all([
      prisma.pageView.count({
        where: {
          orgId: input.orgId,
          createdAt: { gte: since }
        }
      }),
      prisma.$queryRaw<Array<{ count: number }>>`
        SELECT COUNT(DISTINCT "path")::int AS "count"
        FROM "PageView"
        WHERE "orgId" = ${input.orgId}
          AND "createdAt" >= ${since}
      `,
      prisma.pageView.groupBy({
        by: ["path"],
        where: {
          orgId: input.orgId,
          createdAt: { gte: since }
        },
        _count: {
          path: true
        },
        orderBy: {
          _count: {
            path: "desc"
          }
        },
        take: 12
      }),
      prisma.pageView.groupBy({
        by: ["referrer"],
        where: {
          orgId: input.orgId,
          createdAt: { gte: since },
          referrer: {
            not: null
          }
        },
        _count: {
          referrer: true
        },
        orderBy: {
          _count: {
            referrer: "desc"
          }
        },
        take: 8
      }),
      prisma.$queryRaw<Array<{ day: Date; views: number }>>`
        SELECT DATE_TRUNC('day', "createdAt") AS "day", COUNT(*)::int AS "views"
        FROM "PageView"
        WHERE "orgId" = ${input.orgId}
          AND "createdAt" >= ${since}
        GROUP BY DATE_TRUNC('day', "createdAt")
        ORDER BY "day" ASC
      `,
      prisma.$queryRaw<Array<{ slug: string; views: number }>>`
        SELECT "slug", COUNT(*)::int AS "views"
        FROM (
          SELECT SUBSTRING(SPLIT_PART("path", '?', 1) FROM '^/articles/([^/?#]+)') AS "slug"
          FROM "PageView"
          WHERE "orgId" = ${input.orgId}
            AND "createdAt" >= ${since}
            AND "path" LIKE '/articles/%'
        ) AS "article_paths"
        WHERE "slug" IS NOT NULL
        GROUP BY "slug"
        ORDER BY "views" DESC
        LIMIT 8
      `
    ]);

    const articleSlugs = topArticleSlugRows.map((item) => item.slug).filter((value): value is string => Boolean(value));
    const articleRows = articleSlugs.length
      ? await prisma.article.findMany({
          where: {
            orgId: input.orgId,
            slug: {
              in: articleSlugs
            }
          },
          select: {
            slug: true,
            title: true
          }
        })
      : [];
    const articleTitleMap = new Map(articleRows.map((item) => [item.slug, item.title]));

    const dailyMap = new Map<string, number>(
      dailyRows.map((item) => [isoDate(new Date(item.day)), Number(item.views)])
    );

    const dailyViews = Array.from({ length: input.days }, (_value, index) => {
      const date = new Date(since.getTime() + index * DAY_MS);
      const key = isoDate(date);

      return {
        date: key,
        views: dailyMap.get(key) ?? 0
      };
    });

    return {
      days: input.days,
      since: since.toISOString(),
      totalViews,
      uniquePaths: uniquePathResult[0]?.count ?? 0,
      topPaths: topPathsRows.map((item) => ({
        path: item.path,
        views: item._count.path ?? 0
      })),
      topReferrers: topReferrersRows
        .filter((item) => item.referrer && item.referrer.trim().length > 0)
        .map((item) => ({
          referrer: item.referrer!,
          views: item._count.referrer ?? 0
        })),
      topArticles: topArticleSlugRows.map((item) => ({
        slug: item.slug,
        title: articleTitleMap.get(item.slug) ?? item.slug,
        path: `/articles/${item.slug}`,
        views: Number(item.views)
      })),
      dailyViews
    };
  }
};
