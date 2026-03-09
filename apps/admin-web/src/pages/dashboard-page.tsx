import { useQuery } from "@tanstack/react-query";
import { Card, Col, Row, Space, Statistic, Table, Tag, Typography } from "antd";
import dayjs from "dayjs";

import { dashboardApi } from "@/features/dashboard/api";
import { useI18n } from "@/i18n/i18n-provider";

const statusColorMap = {
  new: "blue",
  qualified: "gold",
  won: "green",
  lost: "red"
} as const;

export const DashboardPage = () => {
  const { t } = useI18n();
  const overviewQuery = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: dashboardApi.getOverview
  });

  const recentLeadsQuery = useQuery({
    queryKey: ["dashboard", "recent-leads"],
    queryFn: () => dashboardApi.getRecentLeads(8)
  });

  const contentPerformanceQuery = useQuery({
    queryKey: ["dashboard", "content-performance", 14],
    queryFn: () => dashboardApi.getContentPerformance(14)
  });

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {t("dashboard.title")}
      </Typography.Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card loading={overviewQuery.isPending}>
            <Statistic title={t("dashboard.totalLeads")} value={overviewQuery.data?.totalLeads ?? 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card loading={overviewQuery.isPending}>
            <Statistic title={t("dashboard.newLeads")} value={overviewQuery.data?.newLeads ?? 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card loading={overviewQuery.isPending}>
            <Statistic title={t("dashboard.contacts")} value={overviewQuery.data?.totalContacts ?? 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card loading={overviewQuery.isPending}>
            <Statistic title={t("dashboard.subscribers")} value={overviewQuery.data?.totalSubscribers ?? 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card loading={overviewQuery.isPending}>
            <Statistic title={t("dashboard.published")} value={overviewQuery.data?.publishedArticles ?? 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card loading={overviewQuery.isPending}>
            <Statistic title={t("dashboard.pageViews")} value={overviewQuery.data?.totalPageViews ?? 0} />
          </Card>
        </Col>
      </Row>

      <Card
        title={t("dashboard.contentPerformance", { days: contentPerformanceQuery.data?.days ?? 14 })}
        loading={contentPerformanceQuery.isPending}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Statistic title={t("dashboard.periodViews")} value={contentPerformanceQuery.data?.totalViews ?? 0} />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic title={t("dashboard.uniquePaths")} value={contentPerformanceQuery.data?.uniquePaths ?? 0} />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title={t("dashboard.dailyAvg")}
              value={
                contentPerformanceQuery.data
                  ? (contentPerformanceQuery.data.totalViews / contentPerformanceQuery.data.days).toFixed(1)
                  : "0.0"
              }
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
          <Col xs={24} lg={8}>
            <Table
              size="small"
              title={() => t("dashboard.topArticles")}
              rowKey="slug"
              pagination={false}
              scroll={{ x: "max-content" }}
              dataSource={contentPerformanceQuery.data?.topArticles ?? []}
              locale={{ emptyText: t("dashboard.noArticleViews") }}
              columns={[
                {
                  title: t("dashboard.article"),
                  dataIndex: "title",
                  render: (_value: string, record: { title: string; path: string }) => (
                    <div>
                      <Typography.Text ellipsis style={{ maxWidth: 240, display: "block" }} title={record.title}>
                        {record.title}
                      </Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }} ellipsis title={record.path}>
                        {record.path}
                      </Typography.Text>
                    </div>
                  )
                },
                {
                  title: t("dashboard.views"),
                  dataIndex: "views",
                  width: 90
                }
              ]}
            />
          </Col>
          <Col xs={24} lg={8}>
            <Table
              size="small"
              title={() => t("dashboard.topPaths")}
              rowKey="path"
              pagination={false}
              scroll={{ x: "max-content" }}
              dataSource={contentPerformanceQuery.data?.topPaths ?? []}
              columns={[
                {
                  title: t("dashboard.path"),
                  dataIndex: "path"
                },
                {
                  title: t("dashboard.views"),
                  dataIndex: "views",
                  width: 90
                }
              ]}
            />
          </Col>
          <Col xs={24} lg={8}>
            <Table
              size="small"
              title={() => t("dashboard.topReferrers")}
              rowKey="referrer"
              pagination={false}
              scroll={{ x: "max-content" }}
              dataSource={contentPerformanceQuery.data?.topReferrers ?? []}
              locale={{ emptyText: t("dashboard.noReferrer") }}
              columns={[
                {
                  title: t("dashboard.referrer"),
                  dataIndex: "referrer",
                  render: (value: string) => (
                    <Typography.Text ellipsis style={{ maxWidth: 240 }} title={value}>
                      {value}
                    </Typography.Text>
                  )
                },
                {
                  title: t("dashboard.views"),
                  dataIndex: "views",
                  width: 90
                }
              ]}
            />
          </Col>
        </Row>
      </Card>

      <Card title={t("dashboard.recentLeads")} loading={recentLeadsQuery.isPending}>
        <Table
          rowKey="id"
          dataSource={recentLeadsQuery.data ?? []}
          pagination={false}
          scroll={{ x: "max-content" }}
          columns={[
            {
              title: t("dashboard.name"),
              dataIndex: "name"
            },
            {
              title: t("dashboard.email"),
              dataIndex: "email"
            },
            {
              title: t("dashboard.company"),
              dataIndex: "company",
              render: (value: string | null) => value ?? "-"
            },
            {
              title: t("common.status"),
              dataIndex: "status",
              render: (status: keyof typeof statusColorMap) => (
                <Tag color={statusColorMap[status]}>{t(`leads.status.${status}`)}</Tag>
              )
            },
            {
              title: t("common.createdAt"),
              dataIndex: "createdAt",
              render: (value: string) => dayjs(value).format("YYYY-MM-DD HH:mm")
            }
          ]}
        />
      </Card>
    </Space>
  );
};
