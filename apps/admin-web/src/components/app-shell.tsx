import {
  DashboardOutlined,
  FileTextOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  LogoutOutlined,
  MailOutlined,
  TeamOutlined,
  UserOutlined
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Button, Layout, Menu, Select, Space, Typography } from "antd";
import type { MenuProps } from "antd";
import { useMemo, type PropsWithChildren } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { authApi } from "@/features/auth/api";
import { useI18n } from "@/i18n/i18n-provider";
import { useUiStore } from "@/stores/ui-store";

const { Header, Sider, Content } = Layout;

const pickSelectedKey = (pathname: string) => {
  if (pathname.startsWith("/leads")) {
    return "/leads";
  }
  if (pathname.startsWith("/contacts")) {
    return "/contacts";
  }
  if (pathname.startsWith("/subscribers")) {
    return "/subscribers";
  }
  if (pathname.startsWith("/content/articles")) {
    return "/content/articles";
  }
  if (pathname.startsWith("/about")) {
    return "/about";
  }
  return "/dashboard";
};

export const AppShell = ({ children }: PropsWithChildren) => {
  const { locale, setLocale, t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const collapsed = useUiStore((state) => state.collapsed);
  const setCollapsed = useUiStore((state) => state.setCollapsed);

  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.me,
    staleTime: 5 * 60 * 1000,
    retry: false
  });

  const menuItems: MenuProps["items"] = useMemo(
    () => [
      {
        key: "/dashboard",
        icon: <DashboardOutlined />,
        label: t("nav.dashboard")
      },
      {
        key: "/leads",
        icon: <TeamOutlined />,
        label: t("nav.leads")
      },
      {
        key: "/contacts",
        icon: <MailOutlined />,
        label: t("nav.contacts")
      },
      {
        key: "/subscribers",
        icon: <UserOutlined />,
        label: t("nav.subscribers")
      },
      {
        key: "/content/articles",
        icon: <FileTextOutlined />,
        label: t("nav.articles")
      },
      {
        key: "/about",
        icon: <InfoCircleOutlined />,
        label: t("nav.about")
      }
    ],
    [t]
  );

  const selectedMenu = useMemo(
    () => pickSelectedKey(location.pathname || "/dashboard"),
    [location.pathname]
  );

  const currentRouteLabel = useMemo(() => {
    const routeMap: Record<string, string> = {
      "/dashboard": t("nav.dashboard"),
      "/leads": t("nav.leads"),
      "/contacts": t("nav.contacts"),
      "/subscribers": t("nav.subscribers"),
      "/content/articles": t("nav.articles"),
      "/about": t("nav.about")
    };

    return routeMap[selectedMenu] ?? selectedMenu;
  }, [selectedMenu, t]);

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey: ["auth", "me"] });
      queryClient.removeQueries({ queryKey: ["auth", "me"] });
      navigate("/login", { replace: true });
    },
    onError: () => {
      message.error(t("shell.logoutFailed"));
    }
  });

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
        width={220}
        style={{
          height: "100vh",
          overflow: "auto",
          borderRight: "1px solid #f0f0f0"
        }}
      >
        <div
          style={{
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            paddingLeft: collapsed ? 0 : 16,
            fontWeight: 700,
            fontSize: 16,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}
        >
          {collapsed ? (
            <img
              src="/favicon.svg"
              alt="SuiteOps"
              width={28}
              height={28}
              style={{ display: "block" }}
            />
          ) : (
            t("shell.appName")
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedMenu]}
          items={menuItems}
          onClick={({ key }) => {
            const target = String(key);
            if (target !== location.pathname) {
              navigate(target);
            }
          }}
        />
      </Sider>

      <Layout style={{ minWidth: 0, height: "100vh", overflow: "hidden" }}>
        <Header
          style={{
            background: "#fff",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 16px",
            flexShrink: 0
          }}
        >
          <Typography.Text type="secondary">
            {t("shell.routeLabel")}: {currentRouteLabel}
          </Typography.Text>
          <Space size={16}>
            <Select
              size="small"
              value={locale}
              suffixIcon={<GlobalOutlined />}
              onChange={(value) => setLocale(value as "en" | "zh-CN")}
              options={[
                { label: "English", value: "en" },
                { label: "中文", value: "zh-CN" }
              ]}
              style={{ width: 130 }}
            />
            <Typography.Text>{meQuery.data?.name ?? "Admin"}</Typography.Text>
            <Button
              icon={<LogoutOutlined />}
              loading={logoutMutation.isPending}
              onClick={() => logoutMutation.mutate()}
            >
              {t("shell.logout")}
            </Button>
          </Space>
        </Header>

        <Content
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            padding: 16
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};
