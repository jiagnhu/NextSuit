import { useMutation, useQuery } from "@tanstack/react-query";
import { App, Button, Result, Skeleton, Space, Typography } from "antd";
import { Link, useNavigate } from "react-router-dom";

import { ArticleEditorForm, clearArticleDraft } from "@/features/articles/article-editor-form";
import { articlesApi } from "@/features/articles/api";
import type { ArticleFormValues } from "@/features/articles/types";
import { useI18n } from "@/i18n/i18n-provider";

const toPayload = (values: ArticleFormValues) => ({
  title: values.title,
  slug: values.slug,
  excerpt: values.excerpt || undefined,
  contentMd: values.contentMd,
  coverImage: values.coverImage || undefined,
  status: values.status,
  categoryId: values.categoryId || undefined,
  tagIds: values.tagIds?.length ? values.tagIds : undefined,
  seoTitle: values.seoTitle || undefined,
  seoDescription: values.seoDescription || undefined
});

export const NewArticlePage = () => {
  const { t } = useI18n();
  const draftKey = "article:draft:new";
  const { message } = App.useApp();
  const navigate = useNavigate();

  const categoriesQuery = useQuery({
    queryKey: ["articles", "categories"],
    queryFn: articlesApi.listCategories
  });

  const tagsQuery = useQuery({
    queryKey: ["articles", "tags"],
    queryFn: articlesApi.listTags
  });

  const createMutation = useMutation({
    mutationFn: articlesApi.create,
    onSuccess: (created) => {
      clearArticleDraft(draftKey);
      message.success(t("articles.created"));
      navigate(`/content/articles/${created.id}/edit`, { replace: true });
    },
    onError: (error) => {
      const msg = error instanceof Error ? error.message : t("articles.createFailed");
      message.error(msg);
    }
  });

  const loading = categoriesQuery.isPending || tagsQuery.isPending;
  const failed = categoriesQuery.isError || tagsQuery.isError;

  if (loading) {
    return <Skeleton active paragraph={{ rows: 12 }} />;
  }

  if (failed) {
    return (
      <Result
        status="error"
        title={t("articles.loadMetaFailed")}
        subTitle={t("articles.loadMetaFailedSubtitle")}
        extra={
          <Link to="/content/articles">
            <Button>{t("common.back")}</Button>
          </Link>
        }
      />
    );
  }

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Space style={{ width: "100%", justifyContent: "space-between" }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {t("articles.newArticleTitle")}
        </Typography.Title>

        <Link to="/content/articles">
          <Button>{t("common.backToList")}</Button>
        </Link>
      </Space>

      <ArticleEditorForm
        categories={categoriesQuery.data ?? []}
        tags={tagsQuery.data ?? []}
        loading={createMutation.isPending}
        submitText={t("common.create")}
        draftStorageKey={draftKey}
        onSubmit={(values) => createMutation.mutate(toPayload(values))}
      />
    </Space>
  );
};
