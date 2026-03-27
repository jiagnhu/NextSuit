import type { Prisma, ArticleStatus } from "@prisma/client";

import { prisma } from "../../lib/prisma.js";
import { getPagination, paginationMeta } from "../../utils/pagination.js";

type PublicArticleListInput = {
  orgId: string;
  page?: number;
  pageSize?: number;
  category?: string;
  tag?: string;
  search?: string;
};

type AdminArticleListInput = {
  orgId: string;
  page?: number;
  pageSize?: number;
  status?: ArticleStatus;
  search?: string;
  category?: string;
};

type CreateArticleInput = {
  orgId: string;
  authorId: string;
  title: string;
  slug: string;
  excerpt?: string;
  contentMd: string;
  coverImage?: string;
  status?: ArticleStatus;
  categoryId?: string;
  tagIds?: string[];
  seoTitle?: string;
  seoDescription?: string;
};

type UpdateArticleInput = Partial<CreateArticleInput> & {
  orgId: string;
  id: string;
};

const articleInclude = {
  author: {
    select: {
      id: true,
      name: true,
      email: true
    }
  },
  category: {
    select: {
      id: true,
      name: true,
      nameEn: true,
      nameZh: true,
      slug: true
    }
  },
  articleTags: {
    include: {
      tag: {
        select: {
          id: true,
          name: true,
          nameEn: true,
          nameZh: true,
          slug: true
        }
      }
    }
  }
} satisfies Prisma.ArticleInclude;

export const articlesService = {
  async listPublic(input: PublicArticleListInput) {
    const { page, pageSize, skip, take } = getPagination(input, 50);

    const where: Prisma.ArticleWhereInput = {
      orgId: input.orgId,
      status: "published",
      ...(input.category ? { category: { slug: input.category } } : {}),
      ...(input.tag ? { articleTags: { some: { tag: { slug: input.tag } } } } : {}),
      ...(input.search
        ? {
            OR: [
              { title: { contains: input.search, mode: "insensitive" } },
              { excerpt: { contains: input.search, mode: "insensitive" } },
              { contentMd: { contains: input.search, mode: "insensitive" } }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        skip,
        take,
        include: articleInclude
      }),
      prisma.article.count({ where })
    ]);

    return {
      items,
      meta: paginationMeta(page, pageSize, total)
    };
  },

  async listAdmin(input: AdminArticleListInput) {
    const { page, pageSize, skip, take } = getPagination(input, 100);

    const where: Prisma.ArticleWhereInput = {
      orgId: input.orgId,
      ...(input.status ? { status: input.status } : {}),
      ...(input.category ? { category: { slug: input.category } } : {}),
      ...(input.search
        ? {
            OR: [
              { title: { contains: input.search, mode: "insensitive" } },
              { excerpt: { contains: input.search, mode: "insensitive" } }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: [{ updatedAt: "desc" }],
        skip,
        take,
        include: articleInclude
      }),
      prisma.article.count({ where })
    ]);

    return {
      items,
      meta: paginationMeta(page, pageSize, total)
    };
  },

  async findPublicBySlug(orgId: string, slug: string) {
    return prisma.article.findFirst({
      where: {
        orgId,
        slug,
        status: "published"
      },
      include: articleInclude
    });
  },

  async findAdminById(orgId: string, id: string) {
    return prisma.article.findFirst({
      where: {
        orgId,
        id
      },
      include: articleInclude
    });
  },

  async create(input: CreateArticleInput) {
    const { tagIds, status, ...rest } = input;
    return prisma.article.create({
      data: {
        ...rest,
        status: status ?? "draft",
        publishedAt: status === "published" ? new Date() : null,
        articleTags: tagIds?.length
          ? {
              createMany: {
                data: tagIds.map((tagId) => ({ tagId }))
              }
            }
          : undefined
      },
      include: articleInclude
    });
  },

  async update(input: UpdateArticleInput) {
    const { orgId, id, tagIds, status, ...rest } = input;

    return prisma.$transaction(async (tx) => {
      const existing = await tx.article.findFirst({
        where: { orgId, id },
        select: { id: true, status: true }
      });

      if (!existing) {
        return null;
      }

      const updated = await tx.article.update({
        where: { id },
        data: {
          ...rest,
          ...(status ? { status } : {}),
          ...(status === "published" ? { publishedAt: new Date() } : {}),
          ...(status === "draft" ? { publishedAt: null } : {})
        },
        include: articleInclude
      });

      if (Array.isArray(tagIds)) {
        await tx.articleTag.deleteMany({
          where: { articleId: id }
        });

        if (tagIds.length) {
          await tx.articleTag.createMany({
            data: tagIds.map((tagId) => ({ articleId: id, tagId }))
          });
        }

        return tx.article.findUnique({
          where: { id },
          include: articleInclude
        });
      }

      return updated;
    });
  },

  async publish(orgId: string, id: string, publish = true) {
    const result = await prisma.article.updateMany({
      where: { id, orgId },
      data: {
        status: publish ? "published" : "draft",
        publishedAt: publish ? new Date() : null
      }
    });

    if (!result.count) {
      return null;
    }

    return prisma.article.findUnique({
      where: { id },
      include: articleInclude
    });
  },

  async remove(orgId: string, id: string) {
    const result = await prisma.article.deleteMany({
      where: { orgId, id }
    });

    return result.count > 0;
  }
};
