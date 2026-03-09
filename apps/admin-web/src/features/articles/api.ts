import { apiRequest } from "@/lib/api-client";

import type {
  ArticleFormPayload,
  ArticleItem,
  ArticleListParams,
  ArticleListResult,
  ArticleStatus,
  CategoryItem,
  TagItem,
  UploadedImageResult
} from "./types";

export const articlesApi = {
  async listAdmin(params: ArticleListParams): Promise<ArticleListResult> {
    const response = await apiRequest<ArticleListResult["items"]>("/articles/admin", {
      query: {
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
        status: params.status,
        category: params.category
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

  async getById(id: string) {
    const response = await apiRequest<ArticleItem>(`/articles/admin/${id}`);
    return response.data;
  },

  async create(payload: ArticleFormPayload) {
    const response = await apiRequest<ArticleItem>("/articles", {
      method: "POST",
      body: payload
    });

    return response.data;
  },

  async update(id: string, payload: Partial<ArticleFormPayload>) {
    const response = await apiRequest<ArticleItem>(`/articles/${id}`, {
      method: "PATCH",
      body: payload
    });

    return response.data;
  },

  async togglePublish(id: string, publish: boolean) {
    const response = await apiRequest<ArticleItem>(`/articles/${id}/publish`, {
      method: "PATCH",
      body: { publish }
    });

    return response.data;
  },

  async remove(id: string) {
    const response = await apiRequest<{ id: string; deleted: true }>(`/articles/${id}`, {
      method: "DELETE"
    });
    return response.data;
  },

  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiRequest<UploadedImageResult>("/uploads/images", {
      method: "POST",
      body: formData
    });

    return response.data;
  },

  async listCategories() {
    const response = await apiRequest<CategoryItem[]>("/categories");
    return response.data;
  },

  async listTags() {
    const response = await apiRequest<TagItem[]>("/tags");
    return response.data;
  }
};

export const ARTICLE_STATUS_OPTIONS: { label: string; value: ArticleStatus }[] = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" }
];
