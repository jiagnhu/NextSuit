import { useQuery } from "@tanstack/react-query";
import { Navigate, useLocation } from "react-router-dom";
import { Result, Space, Spin, Typography } from "antd";
import { type PropsWithChildren } from "react";

import { authApi } from "@/features/auth/api";
import { useI18n } from "@/i18n/i18n-provider";
import { ApiClientError } from "@/lib/api-client";

export const AuthGuard = ({ children }: PropsWithChildren) => {
  const { t } = useI18n();
  const location = useLocation();

  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.me,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: "always"
  });

  if (meQuery.isPending || (meQuery.isFetching && !meQuery.data)) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center"
        }}
      >
        <Space direction="vertical" size={12} align="center">
          <Spin size="large" />
          <Typography.Text type="secondary">{t("common.loadingAccount")}</Typography.Text>
        </Space>
      </div>
    );
  }

  if (meQuery.isError) {
    const isUnauthorized =
      meQuery.error instanceof ApiClientError &&
      (meQuery.error.status === 401 || meQuery.error.status === 403);

    if (isUnauthorized) {
      const nextPath = `${location.pathname}${location.search}`;
      return <Navigate to={`/login?next=${encodeURIComponent(nextPath)}`} replace />;
    }

    const message =
      meQuery.error instanceof Error ? meQuery.error.message : t("common.failedToLoadProfile");

    return <Result status="403" title={t("common.forbiddenTitle")} subTitle={message} />;
  }

  return <>{children}</>;
};
