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

import { leadsApi } from "@/features/leads/api";
import type { LeadDetail, LeadStatus } from "@/features/leads/types";
import { useListPage } from "@/hooks/use-list-page";
import { useI18n } from "@/i18n/i18n-provider";

const statusColorMap: Record<LeadStatus, string> = {
  new: "blue",
  qualified: "gold",
  won: "green",
  lost: "red"
};

export const LeadsPage = () => {
  const { t } = useI18n();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const { searchParams, page, pageSize, updateParams, onTableChange, buildPagination } =
    useListPage();
  const status = (searchParams.get("status") ?? "") as LeadStatus | "";
  const q = searchParams.get("q") ?? "";

  const [searchText, setSearchText] = useState(q);
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);

  const queryKey = useMemo(
    () => ["leads", { page, pageSize, status, q }] as const,
    [page, pageSize, status, q]
  );

  const leadsQuery = useQuery({
    queryKey,
    queryFn: () =>
      leadsApi.list({
        page,
        pageSize,
        status: status || undefined,
        q: q || undefined
      })
  });

  const leadDetailQuery = useQuery({
    queryKey: ["leads", "detail", activeLeadId],
    queryFn: () => leadsApi.detail(activeLeadId!),
    enabled: Boolean(activeLeadId)
  });

  const statusOptions = [
    { label: t("leads.allStatus"), value: "" },
    { label: t("leads.status.new"), value: "new" },
    { label: t("leads.status.qualified"), value: "qualified" },
    { label: t("leads.status.won"), value: "won" },
    { label: t("leads.status.lost"), value: "lost" }
  ];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: LeadStatus }) =>
      leadsApi.updateStatus(id, nextStatus),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
      message.success(t("leads.statusUpdated"));
    },
    onError: (error) => {
      const msg = error instanceof Error ? error.message : t("leads.statusUpdateFailed");
      message.error(msg);
    }
  });

  const renderDetailModalContent = () => {
    if (leadDetailQuery.isPending) {
      return <Typography.Text type="secondary">{t("common.loadingAccount")}</Typography.Text>;
    }

    if (leadDetailQuery.isError || !leadDetailQuery.data) {
      return <Typography.Text type="danger">{t("leads.detailLoadFailed")}</Typography.Text>;
    }

    const lead = leadDetailQuery.data as LeadDetail;

    return (
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Descriptions
          bordered
          size="small"
          column={2}
          items={[
            { key: "name", label: t("dashboard.name"), children: lead.name },
            { key: "email", label: t("dashboard.email"), children: lead.email },
            { key: "company", label: t("dashboard.company"), children: lead.company ?? "-" },
            { key: "status", label: t("common.status"), children: t(`leads.status.${lead.status}`) },
            { key: "interest", label: t("leads.interest"), children: lead.interest ?? "-" },
            { key: "source", label: t("leads.source"), children: lead.source ?? "-" },
            { key: "budgetRange", label: t("leads.budgetRange"), children: lead.budgetRange ?? "-" },
            { key: "owner", label: t("leads.owner"), children: lead.ownerUserId ?? "-" },
            {
              key: "createdAt",
              label: t("common.createdAt"),
              children: dayjs(lead.createdAt).format("YYYY-MM-DD HH:mm")
            },
            {
              key: "updatedAt",
              label: t("common.updatedAt"),
              children: dayjs(lead.updatedAt).format("YYYY-MM-DD HH:mm")
            },
            {
              key: "notes",
              label: t("leads.notes"),
              children: lead.notes ?? "-",
              span: 2
            }
          ]}
        />

        <div>
          <Typography.Title level={5} style={{ marginTop: 0 }}>
            {t("leads.activities")}
          </Typography.Title>
          {lead.activities.length ? (
            <Table
              size="small"
              rowKey="id"
              pagination={false}
              scroll={{ x: "max-content" }}
              dataSource={lead.activities}
              columns={[
                {
                  title: t("leads.actionType"),
                  dataIndex: "actionType",
                  width: 140
                },
                {
                  title: t("leads.activityNote"),
                  dataIndex: "note",
                  render: (value: string | null) => value ?? "-"
                },
                {
                  title: t("leads.actor"),
                  render: (_, record) => `${record.actorUser.name} (${record.actorUser.email})`,
                  width: 220
                },
                {
                  title: t("common.createdAt"),
                  dataIndex: "createdAt",
                  width: 180,
                  render: (value: string) => dayjs(value).format("YYYY-MM-DD HH:mm")
                }
              ]}
            />
          ) : (
            <Typography.Text type="secondary">{t("leads.noActivities")}</Typography.Text>
          )}
        </div>
      </Space>
    );
  };

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {t("leads.title")}
      </Typography.Title>

      <Card>
        <Space wrap>
          <Input.Search
            placeholder={t("leads.searchPlaceholder")}
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

      <Card loading={leadsQuery.isPending}>
        <Table
          rowKey="id"
          dataSource={leadsQuery.data?.items ?? []}
          onChange={onTableChange}
          scroll={{ x: "max-content" }}
          pagination={buildPagination(leadsQuery.data?.meta)}
          columns={[
            {
              title: t("dashboard.name"),
              dataIndex: "name",
              width: 160
            },
            {
              title: t("dashboard.email"),
              dataIndex: "email",
              width: 220
            },
            {
              title: t("dashboard.company"),
              dataIndex: "company",
              render: (value: string | null) => value ?? "-"
            },
            {
              title: t("leads.interest"),
              dataIndex: "interest",
              render: (value: string | null) => value ?? "-"
            },
            {
              title: t("leads.source"),
              dataIndex: "source",
              width: 120,
              render: (value: string | null) => value ?? "-"
            },
            {
              title: t("common.status"),
              dataIndex: "status",
              width: 180,
              render: (_value: LeadStatus, record) => (
                <Space>
                  <Tag color={statusColorMap[record.status]}>{t(`leads.status.${record.status}`)}</Tag>
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
                        nextStatus: nextStatus as LeadStatus
                      })
                    }
                    loading={updateStatusMutation.isPending}
                    style={{ width: 110 }}
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
                <Button size="small" onClick={() => setActiveLeadId(record.id)}>
                  {t("leads.viewDetail")}
                </Button>
              )
            }
          ]}
        />
      </Card>

      <Modal
        open={Boolean(activeLeadId)}
        title={t("leads.detailTitle")}
        onCancel={() => setActiveLeadId(null)}
        footer={null}
        width={900}
        destroyOnHidden
      >
        {renderDetailModalContent()}
      </Modal>
    </Space>
  );
};
