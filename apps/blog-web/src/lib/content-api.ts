import { apiRequest } from "@/lib/api-client";
import type {
  ArticleItem,
  CategoryItem,
  PaginatedResult,
  PublicSetting,
  SubscriberRecord,
  TagItem
} from "@/lib/api-types";

type ArticleListParams = {
  page: number;
  pageSize: number;
  search?: string;
  category?: string;
  tag?: string;
};

const MAX_PAGE_SIZE = 50;

export const contentApi = {
  async listArticles(params: ArticleListParams): Promise<PaginatedResult<ArticleItem>> {
    const response = await apiRequest<ArticleItem[]>("/articles", {
      query: {
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
        category: params.category,
        tag: params.tag
      }
    });

    return {
      items: response.data,
      meta: {
        page: response.meta?.page ?? params.page,
        pageSize: response.meta?.pageSize ?? params.pageSize,
        total: response.meta?.total ?? response.data.length,
        totalPages: response.meta?.totalPages ?? 1
      }
    };
  },

  async getArticleBySlug(slug: string): Promise<ArticleItem> {
    const response = await apiRequest<ArticleItem>(`/articles/${slug}`);
    return response.data;
  },

  async listCategories(): Promise<CategoryItem[]> {
    const response = await apiRequest<CategoryItem[]>("/categories");
    return response.data;
  },

  async listTags(): Promise<TagItem[]> {
    const response = await apiRequest<TagItem[]>("/tags");
    return response.data;
  },

  async listPublicSettings(): Promise<PublicSetting[]> {
    const response = await apiRequest<PublicSetting[]>("/settings/public");
    return response.data;
  },

  async listAllArticles(maxPages = 20): Promise<ArticleItem[]> {
    const firstPage = await contentApi.listArticles({
      page: 1,
      pageSize: MAX_PAGE_SIZE
    });

    const totalPages = Math.min(firstPage.meta.totalPages, Math.max(1, maxPages));

    if (totalPages === 1) {
      return firstPage.items;
    }

    const restPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_value, index) =>
        contentApi.listArticles({
          page: index + 2,
          pageSize: MAX_PAGE_SIZE
        })
      )
    );

    return [firstPage, ...restPages].flatMap((item) => item.items);
  },

  async subscribe(email: string, sourcePage?: string) {
    const response = await apiRequest<SubscriberRecord>("/subscribers", {
      init: {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          sourcePage
        })
      }
    });

    return response.data;
  }
};
