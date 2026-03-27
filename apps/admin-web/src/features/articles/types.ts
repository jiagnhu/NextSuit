export type ArticleStatus = "draft" | "published" | "archived";

export type CategoryItem = {
  id: string;
  name: string;
  nameEn: string;
  nameZh: string;
  slug: string;
  description?: string | null;
  _count?: {
    articles: number;
  };
};

export type TagItem = {
  id: string;
  name: string;
  nameEn: string;
  nameZh: string;
  slug: string;
  _count?: {
    articleTags: number;
  };
};

export type CategoryFormPayload = {
  nameEn: string;
  nameZh: string;
  slug: string;
  description?: string;
};

export type TagFormPayload = {
  nameEn: string;
  nameZh: string;
  slug: string;
};

export type ArticleAuthor = {
  id: string;
  name: string;
  email: string;
};

export type ArticleTagRelation = {
  tag: TagItem;
};

export type ArticleItem = {
  id: string;
  orgId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  contentMd: string;
  coverImage: string | null;
  status: ArticleStatus;
  authorId: string;
  categoryId: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: ArticleAuthor;
  category: CategoryItem | null;
  articleTags: ArticleTagRelation[];
};

export type ArticleListParams = {
  page: number;
  pageSize: number;
  search?: string;
  status?: ArticleStatus;
  category?: string;
};

export type ArticleListResult = {
  items: ArticleItem[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type ArticleFormPayload = {
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

export type ArticleFormValues = {
  title: string;
  slug: string;
  excerpt?: string;
  contentMd: string;
  coverImage?: string;
  status: ArticleStatus;
  categoryId?: string;
  tagIds?: string[];
  seoTitle?: string;
  seoDescription?: string;
};

export type UploadedImageResult = {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
};
