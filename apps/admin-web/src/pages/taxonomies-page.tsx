import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Button, Card, Col, Form, Input, Popconfirm, Row, Space, Table, Tabs, Typography } from "antd";

import { articlesApi } from "@/features/articles/api";
import { getLocalizedTaxonomyName } from "@/features/articles/taxonomy-i18n";
import type { CategoryFormPayload, CategoryItem, TagFormPayload, TagItem } from "@/features/articles/types";
import { useI18n } from "@/i18n/i18n-provider";

const slugRules = [
  { required: true, message: "required" },
  { pattern: /^[a-z0-9-]+$/, message: "pattern" }
] as const;

export const TaxonomiesPage = () => {
  const { locale, t } = useI18n();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [categoryForm] = Form.useForm<CategoryFormPayload>();
  const [tagForm] = Form.useForm<TagFormPayload>();

  const categoriesQuery = useQuery({
    queryKey: ["articles", "categories"],
    queryFn: articlesApi.listCategories
  });

  const tagsQuery = useQuery({
    queryKey: ["articles", "tags"],
    queryFn: articlesApi.listTags
  });

  const refreshCategories = async () => {
    await queryClient.invalidateQueries({ queryKey: ["articles", "categories"] });
    await queryClient.invalidateQueries({ queryKey: ["articles", "list"] });
    await queryClient.invalidateQueries({ queryKey: ["articles", "detail"] });
  };

  const refreshTags = async () => {
    await queryClient.invalidateQueries({ queryKey: ["articles", "tags"] });
    await queryClient.invalidateQueries({ queryKey: ["articles", "list"] });
    await queryClient.invalidateQueries({ queryKey: ["articles", "detail"] });
  };

  const createCategoryMutation = useMutation({
    mutationFn: articlesApi.createCategory,
    onSuccess: async () => {
      message.success(t("taxonomies.categories.created"));
      categoryForm.resetFields();
      await refreshCategories();
    },
    onError: (error) => {
      const msg = error instanceof Error ? error.message : t("taxonomies.categories.createFailed");
      message.error(msg);
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: articlesApi.removeCategory,
    onSuccess: async () => {
      message.success(t("taxonomies.categories.deleted"));
      await refreshCategories();
    },
    onError: (error) => {
      const msg = error instanceof Error ? error.message : t("taxonomies.categories.deleteFailed");
      message.error(msg);
    }
  });

  const createTagMutation = useMutation({
    mutationFn: articlesApi.createTag,
    onSuccess: async () => {
      message.success(t("taxonomies.tags.created"));
      tagForm.resetFields();
      await refreshTags();
    },
    onError: (error) => {
      const msg = error instanceof Error ? error.message : t("taxonomies.tags.createFailed");
      message.error(msg);
    }
  });

  const deleteTagMutation = useMutation({
    mutationFn: articlesApi.removeTag,
    onSuccess: async () => {
      message.success(t("taxonomies.tags.deleted"));
      await refreshTags();
    },
    onError: (error) => {
      const msg = error instanceof Error ? error.message : t("taxonomies.tags.deleteFailed");
      message.error(msg);
    }
  });

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {t("taxonomies.title")}
      </Typography.Title>

      <Card>
        <Tabs
          items={[
            {
              key: "categories",
              label: t("taxonomies.categories.title"),
              children: (
                <>
                  <Form
                    form={categoryForm}
                    layout="vertical"
                    onFinish={(values) => createCategoryMutation.mutate(values)}
                  >
                    <Row gutter={12}>
                      <Col xs={24} md={6}>
                        <Form.Item
                          label={t("taxonomies.fields.nameZh")}
                          name="nameZh"
                          rules={[{ required: true, message: t("taxonomies.fields.nameZhRequired") }]}
                        >
                          <Input placeholder="工程" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                        <Form.Item
                          label={t("taxonomies.fields.nameEn")}
                          name="nameEn"
                          rules={[{ required: true, message: t("taxonomies.fields.nameEnRequired") }]}
                        >
                          <Input placeholder="Engineering" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                        <Form.Item
                          label={t("taxonomies.fields.slug")}
                          name="slug"
                          rules={slugRules.map((item) =>
                            item.message === "required"
                              ? { ...item, message: t("taxonomies.fields.slugRequired") }
                              : { ...item, message: t("taxonomies.fields.slugPattern") }
                          )}
                        >
                          <Input placeholder="engineering" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                        <Form.Item label={t("taxonomies.fields.description")} name="description">
                          <Input placeholder={t("taxonomies.fields.descriptionPlaceholder")} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<PlusOutlined />}
                      loading={createCategoryMutation.isPending}
                    >
                      {t("taxonomies.categories.create")}
                    </Button>
                  </Form>

                  <Table<CategoryItem>
                    rowKey="id"
                    style={{ marginTop: 16 }}
                    loading={categoriesQuery.isPending}
                    dataSource={categoriesQuery.data ?? []}
                    pagination={false}
                    scroll={{ x: "max-content" }}
                    columns={[
                      {
                        title: t("taxonomies.fields.localizedName"),
                        dataIndex: "name",
                        minWidth: 180,
                        render: (_name, record) => getLocalizedTaxonomyName(record, locale)
                      },
                      {
                        title: t("taxonomies.fields.nameZh"),
                        dataIndex: "nameZh",
                        minWidth: 160
                      },
                      {
                        title: t("taxonomies.fields.nameEn"),
                        dataIndex: "nameEn",
                        minWidth: 180
                      },
                      {
                        title: t("taxonomies.fields.slug"),
                        dataIndex: "slug",
                        width: 180
                      },
                      {
                        title: t("taxonomies.fields.usage"),
                        width: 120,
                        render: (_value, record) => record._count?.articles ?? 0
                      },
                      {
                        title: t("common.actions"),
                        width: 140,
                        fixed: "right",
                        render: (_value, record) => (
                          <Popconfirm
                            title={t("taxonomies.deleteTitle")}
                            description={t("taxonomies.deleteDescription")}
                            okText={t("common.delete")}
                            cancelText={t("common.back")}
                            onConfirm={() => deleteCategoryMutation.mutate(record.id)}
                          >
                            <Button
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              loading={deleteCategoryMutation.isPending}
                            >
                              {t("common.delete")}
                            </Button>
                          </Popconfirm>
                        )
                      }
                    ]}
                  />
                </>
              )
            },
            {
              key: "tags",
              label: t("taxonomies.tags.title"),
              children: (
                <>
                  <Form
                    form={tagForm}
                    layout="vertical"
                    onFinish={(values) => createTagMutation.mutate(values)}
                  >
                    <Row gutter={12}>
                      <Col xs={24} md={8}>
                        <Form.Item
                          label={t("taxonomies.fields.nameZh")}
                          name="nameZh"
                          rules={[{ required: true, message: t("taxonomies.fields.nameZhRequired") }]}
                        >
                          <Input placeholder="营销" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          label={t("taxonomies.fields.nameEn")}
                          name="nameEn"
                          rules={[{ required: true, message: t("taxonomies.fields.nameEnRequired") }]}
                        >
                          <Input placeholder="Marketing" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          label={t("taxonomies.fields.slug")}
                          name="slug"
                          rules={slugRules.map((item) =>
                            item.message === "required"
                              ? { ...item, message: t("taxonomies.fields.slugRequired") }
                              : { ...item, message: t("taxonomies.fields.slugPattern") }
                          )}
                        >
                          <Input placeholder="marketing" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<PlusOutlined />}
                      loading={createTagMutation.isPending}
                    >
                      {t("taxonomies.tags.create")}
                    </Button>
                  </Form>

                  <Table<TagItem>
                    rowKey="id"
                    style={{ marginTop: 16 }}
                    loading={tagsQuery.isPending}
                    dataSource={tagsQuery.data ?? []}
                    pagination={false}
                    scroll={{ x: "max-content" }}
                    columns={[
                      {
                        title: t("taxonomies.fields.localizedName"),
                        dataIndex: "name",
                        minWidth: 180,
                        render: (_name, record) => getLocalizedTaxonomyName(record, locale)
                      },
                      {
                        title: t("taxonomies.fields.nameZh"),
                        dataIndex: "nameZh",
                        minWidth: 160
                      },
                      {
                        title: t("taxonomies.fields.nameEn"),
                        dataIndex: "nameEn",
                        minWidth: 180
                      },
                      {
                        title: t("taxonomies.fields.slug"),
                        dataIndex: "slug",
                        width: 180
                      },
                      {
                        title: t("taxonomies.fields.usage"),
                        width: 120,
                        render: (_value, record) => record._count?.articleTags ?? 0
                      },
                      {
                        title: t("common.actions"),
                        width: 140,
                        fixed: "right",
                        render: (_value, record) => (
                          <Popconfirm
                            title={t("taxonomies.deleteTitle")}
                            description={t("taxonomies.deleteDescription")}
                            okText={t("common.delete")}
                            cancelText={t("common.back")}
                            onConfirm={() => deleteTagMutation.mutate(record.id)}
                          >
                            <Button
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              loading={deleteTagMutation.isPending}
                            >
                              {t("common.delete")}
                            </Button>
                          </Popconfirm>
                        )
                      }
                    ]}
                  />
                </>
              )
            }
          ]}
        />
      </Card>
    </Space>
  );
};
