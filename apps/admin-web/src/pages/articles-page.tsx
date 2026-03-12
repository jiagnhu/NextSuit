import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  App,
  Button,
  Card,
  Descriptions,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography
} from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { ARTICLE_STATUS_OPTIONS, articlesApi } from "@/features/articles/api";
import type { ArticleItem, ArticleStatus } from "@/features/articles/types";
import { useListPage } from "@/hooks/use-list-page";
import { useI18n } from "@/i18n/i18n-provider";
import { resolveUploadedAssetUrl } from "@/lib/env";

const statusColorMap: Record<ArticleStatus, string> = {
  draft: "default",
  published: "green",
  archived: "volcano"
};

export const ArticlesPage = () => {
  const { t } = useI18n();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const { searchParams, page, pageSize, updateParams, onTableChange, buildPagination } =
    useListPage();
  const status = (searchParams.get("status") ?? "") as ArticleStatus | "";
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";

  const [searchText, setSearchText] = useState(search);
  const [activeArticle, setActiveArticle] = useState<ArticleItem | null>(null);

  const statusOptions = ARTICLE_STATUS_OPTIONS.map((item) => ({
    value: item.value,
    label: t(`articles.status.${item.value}`)
  }));

  const categoriesQuery = useQuery({
    queryKey: ["articles", "categories"],
    queryFn: articlesApi.listCategories
  });

  const queryKey = useMemo(
    () => ["articles", "list", { page, pageSize, status, search, category }] as const,
    [page, pageSize, status, search, category]
  );

  const listQuery = useQuery({
    queryKey,
    queryFn: () =>
      articlesApi.listAdmin({
        page,
        pageSize,
        search: search || undefined,
        status: status || undefined,
        category: category || undefined
      })
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      articlesApi.togglePublish(id, publish),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["articles", "list"] });
      message.success(t("articles.statusUpdated"));
    },
    onError: (error) => {
      const msg = error instanceof Error ? error.message : t("articles.updateFailed");
      message.error(msg);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => articlesApi.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["articles", "list"] });
      message.success(t("articles.articleDeleted"));
    },
    onError: (error) => {
      const msg = error instanceof Error ? error.message : t("articles.deleteFailed");
      message.error(msg);
    }
  });

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Space style={{ width: "100%", justifyContent: "space-between" }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {t("articles.title")}
        </Typography.Title>

        <Link to="/content/articles/new">
          <Button type="primary" icon={<PlusOutlined />}>
            {t("articles.newArticle")}
          </Button>
        </Link>
      </Space>

      <Card>
        <Space wrap>
          <Input.Search
            placeholder={t("articles.searchPlaceholder")}
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            onSearch={(value) => updateParams({ search: value || undefined, page: 1 })}
            allowClear
            style={{ width: 280 }}
          />

          <Select
            style={{ width: 180 }}
            value={status}
            options={[{ label: t("articles.allStatus"), value: "" }, ...statusOptions]}
            onChange={(value) => updateParams({ status: value || undefined, page: 1 })}
          />

          <Select
            style={{ width: 220 }}
            value={category}
            loading={categoriesQuery.isPending}
            options={[
              { label: t("articles.allCategories"), value: "" },
              ...(categoriesQuery.data ?? []).map((item) => ({
                label: item.name,
                value: item.slug
              }))
            ]}
            onChange={(value) => updateParams({ category: value || undefined, page: 1 })}
          />

          <Button
            onClick={() => {
              setSearchText("");
              updateParams({ search: undefined, status: undefined, category: undefined, page: 1 });
            }}
          >
            {t("common.reset")}
          </Button>
        </Space>
      </Card>

      <Card loading={listQuery.isPending}>
        <Table
          rowKey="id"
          dataSource={listQuery.data?.items ?? []}
          onChange={onTableChange}
          scroll={{ x: "max-content" }}
          pagination={buildPagination(listQuery.data?.meta)}
          columns={[
            {
              title: t("articles.table.title"),
              dataIndex: "title",
              minWidth:200,
              render: (_title, record) => (
                <div>
                  <Link to={`/content/articles/${record.id}/edit`}>
                    <Typography.Text
                      style={{
                        color: "#1677ff",
                        cursor: "pointer"
                      }}
                    >
                      {record.title}
                    </Typography.Text>
                  </Link>
                  <Typography.Text type="secondary" style={{ display: "block", fontSize: 12 }}>
                    /{record.slug}
                  </Typography.Text>
                </div>
              )
            },
            {
              title: t("articles.table.category"),
              width: 140,
              render: (_, record) => record.category?.name ?? "-"
            },
            {
              title: t("articles.table.tags"),
              width: 220,
              render: (_, record) =>
                record.articleTags.length ? (
                  <Space size={[4, 4]} wrap>
                    {record.articleTags.map((tagRef) => (
                      <Tag key={tagRef.tag.id}>{tagRef.tag.name}</Tag>
                    ))}
                  </Space>
                ) : (
                  "-"
                )
            },
            {
              title: t("articles.table.status"),
              width: 120,
              render: (_, record) => (
                <Tag color={statusColorMap[record.status]}>{t(`articles.status.${record.status}`)}</Tag>
              )
            },
            {
              title: t("articles.table.published"),
              width: 160,
              render: (_, record) => (
                <Switch
                  checked={record.status === "published"}
                  checkedChildren="ON"
                  unCheckedChildren="OFF"
                  loading={publishMutation.isPending}
                  onChange={(checked) =>
                    publishMutation.mutate({
                      id: record.id,
                      publish: checked
                    })
                  }
                />
              )
            },
            {
              title: t("articles.table.updated"),
              width: 180,
              render: (_, record) => dayjs(record.updatedAt).format("YYYY-MM-DD HH:mm")
            },
            {
              title: t("articles.table.action"),
              width: 240,
              fixed: "right",
              render: (_, record) => (
                <Space>
                  <Button size="small" onClick={() => setActiveArticle(record)}>
                    {t("articles.viewDetail")}
                  </Button>
                  <Link to={`/content/articles/${record.id}/edit`}>
                    <Button icon={<EditOutlined />} size="small">
                      {t("common.edit")}
                    </Button>
                  </Link>
                  <Popconfirm
                    title={t("articles.deleteTitle")}
                    description={t("articles.deleteDescription")}
                    okText={t("common.delete")}
                    okButtonProps={{ danger: true }}
                    onConfirm={() => deleteMutation.mutate(record.id)}
                  >
                    <Button size="small" danger loading={deleteMutation.isPending}>
                      {t("common.delete")}
                    </Button>
                  </Popconfirm>
                </Space>
              )
            }
          ]}
        />
      </Card>

      <Modal
        open={Boolean(activeArticle)}
        title={t("articles.detailTitle")}
        onCancel={() => setActiveArticle(null)}
        footer={null}
        width={980}
        destroyOnHidden
      >
        {activeArticle ? (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Descriptions
              bordered
              size="small"
              column={2}
              items={[
                { key: "title", label: t("articles.table.title"), children: activeArticle.title },
                { key: "slug", label: "Slug", children: activeArticle.slug },
                {
                  key: "status",
                  label: t("common.status"),
                  children: t(`articles.status.${activeArticle.status}`)
                },
                {
                  key: "author",
                  label: t("articles.author"),
                  children: `${activeArticle.author.name} (${activeArticle.author.email})`
                },
                {
                  key: "category",
                  label: t("articles.table.category"),
                  children: activeArticle.category?.name ?? "-"
                },
                {
                  key: "tags",
                  label: t("articles.table.tags"),
                  children: activeArticle.articleTags.length
                    ? activeArticle.articleTags.map((item) => item.tag.name).join(", ")
                    : "-"
                },
                {
                  key: "publishedAt",
                  label: t("articles.table.published"),
                  children: activeArticle.publishedAt
                    ? dayjs(activeArticle.publishedAt).format("YYYY-MM-DD HH:mm")
                    : "-"
                },
                {
                  key: "updatedAt",
                  label: t("articles.table.updated"),
                  children: dayjs(activeArticle.updatedAt).format("YYYY-MM-DD HH:mm")
                },
                { key: "excerpt", label: t("editor.excerptField"), children: activeArticle.excerpt ?? "-", span: 2 },
                { key: "seoTitle", label: t("editor.seoTitle"), children: activeArticle.seoTitle ?? "-", span: 2 },
                {
                  key: "seoDescription",
                  label: t("editor.seoDescription"),
                  children: activeArticle.seoDescription ?? "-",
                  span: 2
                }
              ]}
            />

            {activeArticle.coverImage ? (
              <div>
                <Typography.Text strong style={{ display: "block", marginBottom: 8 }}>
                  {t("editor.coverImage")}
                </Typography.Text>
                <img
                  src={resolveUploadedAssetUrl(activeArticle.coverImage)}
                  alt={activeArticle.title}
                  style={{ width: "100%", maxHeight: 300, objectFit: "cover", borderRadius: 8 }}
                />
              </div>
            ) : null}

            <div>
              <Typography.Text strong style={{ display: "block", marginBottom: 8 }}>
                {t("articles.contentPreview")}
              </Typography.Text>
              <Typography.Paragraph style={{ whiteSpace: "pre-wrap", marginBottom: 0 }}>
                {activeArticle.contentMd.slice(0, 1600)}
                {activeArticle.contentMd.length > 1600 ? "\n..." : ""}
              </Typography.Paragraph>
            </div>
          </Space>
        ) : null}
      </Modal>
    </Space>
  );
};
