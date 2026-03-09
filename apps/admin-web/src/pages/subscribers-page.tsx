import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  App,
  Button,
  Card,
  Descriptions,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography
} from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";

import { subscribersApi } from "@/features/subscribers/api";
import type { SubscriberItem, SubscriberStatus } from "@/features/subscribers/types";
import { useListPage } from "@/hooks/use-list-page";
import { useI18n } from "@/i18n/i18n-provider";

const statusColorMap: Record<SubscriberStatus, string> = {
  active: "green",
  unsubscribed: "default"
};

export const SubscribersPage = () => {
  const { t } = useI18n();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const { searchParams, page, pageSize, updateParams, onTableChange, buildPagination } =
    useListPage();
  const q = searchParams.get("q") ?? "";

  const [searchText, setSearchText] = useState(q);
  const [activeSubscriber, setActiveSubscriber] = useState<SubscriberItem | null>(null);

  const queryKey = useMemo(() => ["subscribers", { page, pageSize, q }] as const, [page, pageSize, q]);

  const subscribersQuery = useQuery({
    queryKey,
    queryFn: () => subscribersApi.list({ page, pageSize, q: q || undefined })
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: SubscriberStatus }) =>
      subscribersApi.updateStatus(id, nextStatus),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["subscribers"] });
      message.success(t("subscribers.statusUpdated"));
    },
    onError: (error) => {
      const msg = error instanceof Error ? error.message : t("subscribers.statusUpdateFailed");
      message.error(msg);
    }
  });

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {t("subscribers.title")}
      </Typography.Title>

      <Card>
        <Space wrap>
          <Input.Search
            placeholder={t("subscribers.searchPlaceholder")}
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            onSearch={(value) => updateParams({ q: value || undefined, page: 1 })}
            allowClear
            style={{ width: 280 }}
          />

          <Button
            onClick={() => {
              setSearchText("");
              updateParams({ q: undefined, page: 1 });
            }}
          >
            {t("common.reset")}
          </Button>
        </Space>
      </Card>

      <Card loading={subscribersQuery.isPending}>
        <Table
          rowKey="id"
          dataSource={subscribersQuery.data?.items ?? []}
          onChange={onTableChange}
          scroll={{ x: "max-content" }}
          pagination={buildPagination(subscribersQuery.data?.meta)}
          columns={[
            { title: t("dashboard.email"), dataIndex: "email" },
            {
              title: t("subscribers.sourcePage"),
              dataIndex: "sourcePage",
              render: (value: string | null) => value ?? "-",
              width: 180
            },
            {
              title: t("common.status"),
              width: 220,
              render: (_, record) => (
                <Space>
                  <Tag color={statusColorMap[record.status]}>{t(`subscribers.status.${record.status}`)}</Tag>
                  <Select
                    size="small"
                    value={record.status}
                    options={[
                      { label: t("subscribers.status.active"), value: "active" },
                      { label: t("subscribers.status.unsubscribed"), value: "unsubscribed" }
                    ]}
                    onChange={(nextStatus) =>
                      updateStatusMutation.mutate({
                        id: record.id,
                        nextStatus: nextStatus as SubscriberStatus
                      })
                    }
                    loading={updateStatusMutation.isPending}
                    style={{ width: 130 }}
                  />
                </Space>
              )
            },
            {
              title: t("common.createdAt"),
              dataIndex: "createdAt",
              width: 180,
              render: (value: string) => dayjs(value).format("YYYY-MM-DD HH:mm")
            },
            {
              title: t("common.actions"),
              width: 120,
              fixed: "right",
              render: (_, record) => (
                <Button size="small" onClick={() => setActiveSubscriber(record)}>
                  {t("subscribers.viewDetail")}
                </Button>
              )
            }
          ]}
        />
      </Card>

      <Modal
        open={Boolean(activeSubscriber)}
        title={t("subscribers.detailTitle")}
        onCancel={() => setActiveSubscriber(null)}
        footer={null}
        width={720}
        destroyOnHidden
      >
        {activeSubscriber ? (
          <Descriptions
            bordered
            size="small"
            column={1}
            items={[
              { key: "email", label: t("dashboard.email"), children: activeSubscriber.email },
              {
                key: "status",
                label: t("common.status"),
                children: t(`subscribers.status.${activeSubscriber.status}`)
              },
              {
                key: "sourcePage",
                label: t("subscribers.sourcePage"),
                children: activeSubscriber.sourcePage ?? "-"
              },
              {
                key: "createdAt",
                label: t("common.createdAt"),
                children: dayjs(activeSubscriber.createdAt).format("YYYY-MM-DD HH:mm")
              }
            ]}
          />
        ) : null}
      </Modal>
    </Space>
  );
};
