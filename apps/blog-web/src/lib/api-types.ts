export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: {
    articles: number;
  };
};

export type TagItem = {
  id: string;
  name: string;
  slug: string;
  _count?: {
    articleTags: number;
  };
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
  status: "draft" | "published" | "archived";
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

export type PublicSetting = {
  key: string;
  valueJson: unknown;
  updatedAt: string;
};

export type SubscriberRecord = {
  id: string;
  email: string;
  sourcePage?: string | null;
  status: "active" | "unsubscribed";
  createdAt: string;
};

export type PaginatedResult<T> = {
  items: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
