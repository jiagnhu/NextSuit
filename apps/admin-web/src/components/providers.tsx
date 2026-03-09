import { QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, App as AntdApp } from "antd";
import enUS from "antd/locale/en_US";
import zhCN from "antd/locale/zh_CN";
import { useState, type PropsWithChildren } from "react";

import { I18nProvider, useI18n } from "@/i18n/i18n-provider";
import { createQueryClient } from "@/lib/query-client";

const InnerProviders = ({ children }: PropsWithChildren) => {
  const { locale } = useI18n();
  const [queryClient] = useState(() => createQueryClient());

  return (
    <ConfigProvider
      locale={locale === "zh-CN" ? zhCN : enUS}
      theme={{
        token: {
          colorPrimary: "#0057ff",
          borderRadius: 10
        }
      }}
    >
      <AntdApp>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </AntdApp>
    </ConfigProvider>
  );
};

export const Providers = ({ children }: PropsWithChildren) => (
  <I18nProvider>
    <InnerProviders>{children}</InnerProviders>
  </I18nProvider>
);
