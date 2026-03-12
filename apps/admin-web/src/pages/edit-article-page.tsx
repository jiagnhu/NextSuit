import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Button, Result, Skeleton, Space, Typography } from "antd";
import { Link, useParams } from "react-router-dom";

import { ArticleEditorForm, clearArticleDraft } from "@/features/articles/article-editor-form";
import { articlesApi } from "@/features/articles/api";
import type { ArticleFormValues } from "@/features/articles/types";
import { useI18n } from "@/i18n/i18n-provider";
import { resolveUploadedAssetUrl } from "@/lib/env";

const toPayload = (values: ArticleFormValues) => ({
  title: values.title,
  slug: values.slug,
  excerpt: values.excerpt || undefined,
  contentMd: values.contentMd,
  coverImage: values.coverImage ? resolveUploadedAssetUrl(values.coverImage) : undefined,
  status: values.status,
  categoryId: values.categoryId || undefined,
  tagIds: values.tagIds?.length ? values.tagIds : undefined,
  seoTitle: values.seoTitle || undefined,
  seoDescription: values.seoDescription || undefined
});

export const EditArticlePage = () => {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const id = params.id ?? "";
  const draftKey = `article:draft:${id}`;

  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const articleQuery = useQuery({
    queryKey: ["articles", "detail", id],
    queryFn: () => articlesApi.getById(id),
    enabled: Boolean(id)
  });

  const categoriesQuery = useQuery({
    queryKey: ["articles", "categories"],
    queryFn: articlesApi.listCategories
  });

  const tagsQuery = useQuery({
    queryKey: ["articles", "tags"],
    queryFn: articlesApi.listTags
  });

  const updateMutation = useMutation({
    mutationFn: (values: ArticleFormValues) => articlesApi.update(id, toPayload(values)),
    onSuccess: async () => {
      clearArticleDraft(draftKey);
      message.success(t("articles.updated"));
      await queryClient.invalidateQueries({ queryKey: ["articles", "detail", id] });
      await queryClient.invalidateQueries({ queryKey: ["articles", "list"] });
    },
    onError: (error) => {
      const msg = error instanceof Error ? error.message : t("articles.saveFailed");
      message.error(msg);
    }
  });

  const loading = articleQuery.isPending || categoriesQuery.isPending || tagsQuery.isPending;

  if (loading) {
    return <Skeleton active paragraph={{ rows: 12 }} />;
  }

  if (articleQuery.isError || !articleQuery.data) {
    return (
      <Result
        status="404"
        title={t("articles.articleNotFound")}
        subTitle={t("articles.articleNotFoundSubtitle")}
        extra={
          <Link to="/content/articles">
            <Button>{t("common.back")}</Button>
          </Link>
        }
      />
    );
  }

  if (categoriesQuery.isError || tagsQuery.isError) {
    return (
      <Result
        status="error"
        title={t("articles.loadMetaFailed")}
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
          {t("articles.editArticle")}
        </Typography.Title>

        <Link to="/content/articles">
          <Button>{t("common.backToList")}</Button>
        </Link>
      </Space>

      <ArticleEditorForm
        initialValues={{
          title: articleQuery.data.title,
          slug: articleQuery.data.slug,
          excerpt: articleQuery.data.excerpt ?? undefined,
          contentMd: articleQuery.data.contentMd,
          coverImage: articleQuery.data.coverImage
            ? resolveUploadedAssetUrl(articleQuery.data.coverImage)
            : undefined,
          status: articleQuery.data.status,
          categoryId: articleQuery.data.categoryId ?? undefined,
          tagIds: articleQuery.data.articleTags.map((item) => item.tag.id),
          seoTitle: articleQuery.data.seoTitle ?? undefined,
          seoDescription: articleQuery.data.seoDescription ?? undefined
        }}
        categories={categoriesQuery.data ?? []}
        tags={tagsQuery.data ?? []}
        loading={updateMutation.isPending}
        submitText={t("common.saveChanges")}
        draftStorageKey={draftKey}
        onSubmit={(values) => updateMutation.mutate(values)}
      />
    </Space>
  );
};
