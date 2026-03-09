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

import { contactsApi } from "@/features/contacts/api";
import type { ContactItem, ContactStatus } from "@/features/contacts/types";
import { useListPage } from "@/hooks/use-list-page";
import { useI18n } from "@/i18n/i18n-provider";

const statusColorMap: Record<ContactStatus, string> = {
  new: "blue",
  in_progress: "gold",
  resolved: "green",
  spam: "red"
};

export const ContactsPage = () => {
  const { t } = useI18n();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const { searchParams, page, pageSize, updateParams, onTableChange, buildPagination } =
    useListPage();
  const status = (searchParams.get("status") ?? "") as ContactStatus | "";
  const q = searchParams.get("q") ?? "";

  const [searchText, setSearchText] = useState(q);
  const [activeContact, setActiveContact] = useState<ContactItem | null>(null);

  const queryKey = useMemo(
    () => ["contacts", { page, pageSize, status, q }] as const,
    [page, pageSize, status, q]
  );

  const statusOptions = [
    { label: t("contacts.allStatus"), value: "" },
    { label: t("contacts.status.new"), value: "new" },
    { label: t("contacts.status.in_progress"), value: "in_progress" },
    { label: t("contacts.status.resolved"), value: "resolved" },
    { label: t("contacts.status.spam"), value: "spam" }
  ];

  const contactsQuery = useQuery({
    queryKey,
    queryFn: () => contactsApi.list({ page, pageSize, status: status || undefined, q: q || undefined })
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: ContactStatus }) =>
      contactsApi.updateStatus(id, nextStatus),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["contacts"] });
      message.success(t("contacts.statusUpdated"));
    },
    onError: (error) => {
      const msg = error instanceof Error ? error.message : t("contacts.statusUpdateFailed");
      message.error(msg);
    }
  });

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {t("contacts.title")}
      </Typography.Title>

      <Card>
        <Space wrap>
          <Input.Search
            placeholder={t("contacts.searchPlaceholder")}
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            onSearch={(value) => updateParams({ q: value || undefined, page: 1 })}
            allowClear
            style={{ width: 280 }}
          />

          <Select
            style={{ width: 180 }}
            value={status}
            options={statusOptions}
            onChange={(value) => updateParams({ status: value || undefined, page: 1 })}
          />

          <Button
            onClick={() => {
              setSearchText("");
              updateParams({ q: undefined, status: undefined, page: 1 });
            }}
          >
            {t("common.reset")}
          </Button>
        </Space>
      </Card>

      <Card loading={contactsQuery.isPending}>
        <Table
          rowKey="id"
          dataSource={contactsQuery.data?.items ?? []}
          onChange={onTableChange}
          scroll={{ x: "max-content" }}
          pagination={buildPagination(contactsQuery.data?.meta)}
          columns={[
            { title: t("dashboard.name"), dataIndex: "name", width: 140 },
            { title: t("dashboard.email"), dataIndex: "email", width: 220 },
            {
              title: t("contacts.subject"),
              dataIndex: "subject",
              render: (value: string | null) => value ?? "-"
            },
            {
              title: t("contacts.sourcePage"),
              dataIndex: "sourcePage",
              render: (value: string | null) => value ?? "-",
              width: 180
            },
            {
              title: t("common.status"),
              width: 200,
              render: (_, record) => (
                <Space>
                  <Tag color={statusColorMap[record.status]}>{t(`contacts.status.${record.status}`)}</Tag>
                  <Select
                    size="small"
                    value={record.status}
                    options={statusOptions.filter((item) => item.value).map((item) => ({
                      label: item.label,
                      value: item.value
                    }))}
                    onChange={(nextStatus) =>
                      updateStatusMutation.mutate({
                        id: record.id,
                        nextStatus: nextStatus as ContactStatus
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
                <Button size="small" onClick={() => setActiveContact(record)}>
                  {t("contacts.viewDetail")}
                </Button>
              )
            }
          ]}
        />
      </Card>

      <Modal
        open={Boolean(activeContact)}
        title={t("contacts.detailTitle")}
        onCancel={() => setActiveContact(null)}
        footer={null}
        width={820}
        destroyOnHidden
      >
        {activeContact ? (
          <Descriptions
            bordered
            size="small"
            column={2}
            items={[
              { key: "name", label: t("dashboard.name"), children: activeContact.name },
              { key: "email", label: t("dashboard.email"), children: activeContact.email },
              { key: "company", label: t("dashboard.company"), children: activeContact.company ?? "-" },
              {
                key: "status",
                label: t("common.status"),
                children: t(`contacts.status.${activeContact.status}`)
              },
              { key: "subject", label: t("contacts.subject"), children: activeContact.subject ?? "-" },
              { key: "source", label: t("contacts.sourcePage"), children: activeContact.sourcePage ?? "-" },
              {
                key: "createdAt",
                label: t("common.createdAt"),
                children: dayjs(activeContact.createdAt).format("YYYY-MM-DD HH:mm")
              },
              {
                key: "message",
                label: t("contacts.message"),
                children: activeContact.message,
                span: 2
              }
            ]}
          />
        ) : null}
      </Modal>
    </Space>
  );
};
