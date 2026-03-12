import { UploadOutlined } from "@ant-design/icons";
import { App, Button, Card, Form, Input, Select, Space, Typography, Upload } from "antd";
import type { UploadProps } from "antd";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";

import { useI18n } from "@/i18n/i18n-provider";
import { resolveUploadedAssetUrl } from "@/lib/env";

import { articlesApi, ARTICLE_STATUS_OPTIONS } from "./api";
import { MarkdownRichEditor } from "./markdown-rich-editor";
import type { ArticleFormValues, CategoryItem, TagItem } from "./types";

type ArticleEditorFormProps = {
  initialValues?: Partial<ArticleFormValues>;
  categories: CategoryItem[];
  tags: TagItem[];
  loading?: boolean;
  submitText?: string;
  draftStorageKey?: string;
  onSubmit: (values: ArticleFormValues) => void;
};

type DraftPayload = {
  values: Partial<ArticleFormValues>;
  savedAt: string;
};

type UploadRequestOption = Parameters<NonNullable<UploadProps["customRequest"]>>[0];

export const clearArticleDraft = (draftStorageKey?: string) => {
  if (!draftStorageKey || typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(draftStorageKey);
};

export const ArticleEditorForm = ({
  initialValues,
  categories,
  tags,
  loading,
  submitText,
  draftStorageKey,
  onSubmit
}: ArticleEditorFormProps) => {
  const { t } = useI18n();
  const [form] = Form.useForm<ArticleFormValues>();
  const { message } = App.useApp();
  const restoredRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);
  const [lastDraftAt, setLastDraftAt] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const coverImage = Form.useWatch("coverImage", form);

  useEffect(() => {
    if (!draftStorageKey) {
      return;
    }
    if (restoredRef.current) {
      return;
    }

    try {
      const raw = localStorage.getItem(draftStorageKey);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as DraftPayload;
      if (!parsed.values) {
        return;
      }

      form.setFieldsValue(parsed.values);
      setLastDraftAt(parsed.savedAt);
      restoredRef.current = true;
      message.info(t("editor.draftRestored"));
    } catch {
      localStorage.removeItem(draftStorageKey);
    }
  }, [draftStorageKey, form, message, t]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const saveDraft = () => {
    if (!draftStorageKey) {
      return;
    }

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      const draft: DraftPayload = {
        values: form.getFieldsValue(true),
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(draftStorageKey, JSON.stringify(draft));
      setLastDraftAt(draft.savedAt);
    }, 600);
  };

  const onUploadCover = async (options: UploadRequestOption) => {
    const file = options.file as File;

    try {
      setUploadingImage(true);
      const uploaded = await articlesApi.uploadImage(file);
      form.setFieldValue("coverImage", resolveUploadedAssetUrl(uploaded.url));
      message.success(t("editor.uploadSuccess"));
      options.onSuccess?.(uploaded);
    } catch (error) {
      const msg = error instanceof Error ? error.message : t("editor.uploadFailed");
      message.error(msg);
      options.onError?.(error as Error);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <Card>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: "draft",
          tagIds: [],
          ...initialValues
        }}
        onValuesChange={saveDraft}
        onFinish={onSubmit}
      >
        <Space
          style={{ width: "100%", justifyContent: "space-between", marginBottom: 8 }}
          align="center"
        >
          <Typography.Title level={4} style={{ margin: 0 }}>
            {t("editor.title")}
          </Typography.Title>

          {draftStorageKey ? (
            <Space>
              <Typography.Text type="secondary">
                {t("editor.autoSave")}
                {lastDraftAt ? ` · ${dayjs(lastDraftAt).format("YYYY-MM-DD HH:mm:ss")}` : ""}
              </Typography.Text>
              <Button
                type="link"
                onClick={() => {
                  clearArticleDraft(draftStorageKey);
                  setLastDraftAt(null);
                  message.success(t("editor.draftCleared"));
                }}
              >
                {t("editor.clearDraft")}
              </Button>
            </Space>
          ) : null}
        </Space>

        <Form.Item
          label={t("editor.titleField")}
          name="title"
          rules={[{ required: true, message: t("editor.titleRequired") }]}
        >
          <Input placeholder="How to Build a Scalable SaaS Frontend" />
        </Form.Item>

        <Form.Item
          label={t("editor.slugField")}
          name="slug"
          rules={[
            { required: true, message: t("editor.slugRequired") },
            {
              pattern: /^[a-z0-9-]+$/,
              message: t("editor.slugPattern")
            }
          ]}
        >
          <Input placeholder="how-to-build-a-scalable-saas-frontend" />
        </Form.Item>

        <Form.Item label={t("editor.excerptField")} name="excerpt">
          <Input.TextArea rows={3} placeholder="Short summary shown in article list" />
        </Form.Item>

        <Form.Item
          label={t("editor.contentField")}
          name="contentMd"
          rules={[
            { required: true, message: t("editor.contentRequired") },
            {
              validator: async (_, value: string | undefined) => {
                const length = (value ?? "").trim().length;
                if (length < 20) {
                  throw new Error(t("editor.contentTooShort"));
                }
              }
            }
          ]}
        >
          <MarkdownRichEditor placeholder="# Heading\n\nWrite your article here..." />
        </Form.Item>

        <Form.Item label={t("editor.coverImage")} extra={t("editor.coverHint")}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Space wrap>
              <Upload
                accept="image/*"
                maxCount={1}
                showUploadList={false}
                customRequest={onUploadCover}
              >
                <Button icon={<UploadOutlined />} loading={uploadingImage}>
                  {t("editor.uploadCover")}
                </Button>
              </Upload>

              <Button
                onClick={() => form.setFieldValue("coverImage", "")}
                disabled={!coverImage}
              >
                {t("editor.clearCover")}
              </Button>
            </Space>

            <Form.Item name="coverImage" noStyle>
              <Input placeholder="https://images.example.com/cover.jpg" />
            </Form.Item>

            {coverImage ? (
              <div>
                <img
                  src={resolveUploadedAssetUrl(coverImage)}
                  alt="cover preview"
                  style={{
                    width: 260,
                    maxWidth: "100%",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb"
                  }}
                />
              </div>
            ) : null}
          </Space>
        </Form.Item>

        <Space size={16} style={{ width: "100%" }} align="start" wrap>
          <Form.Item label={t("editor.statusField")} name="status" style={{ minWidth: 180 }}>
            <Select
              options={ARTICLE_STATUS_OPTIONS.map((item) => ({
                value: item.value,
                label: t(`articles.status.${item.value}`)
              }))}
            />
          </Form.Item>

          <Form.Item label={t("editor.categoryField")} name="categoryId" style={{ minWidth: 220 }}>
            <Select
              allowClear
              options={categories.map((item) => ({
                label: item.name,
                value: item.id
              }))}
            />
          </Form.Item>

          <Form.Item label={t("editor.tagsField")} name="tagIds" style={{ minWidth: 260 }}>
            <Select
              mode="multiple"
              allowClear
              options={tags.map((item) => ({
                label: item.name,
                value: item.id
              }))}
            />
          </Form.Item>
        </Space>

        <Form.Item label={t("editor.seoTitle")} name="seoTitle">
          <Input placeholder="SEO title" />
        </Form.Item>

        <Form.Item label={t("editor.seoDescription")} name="seoDescription">
          <Input.TextArea rows={3} placeholder="SEO description" />
        </Form.Item>

        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {submitText ?? t("common.save")}
          </Button>
        </Space>
      </Form>
    </Card>
  );
};
