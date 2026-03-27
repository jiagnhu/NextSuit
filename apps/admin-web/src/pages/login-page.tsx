import { useMutation, useQueryClient } from "@tanstack/react-query";
import { App, Button, Card, Form, Input, Typography } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";

import { authApi } from "@/features/auth/api";
import type { LoginPayload } from "@/features/auth/types";
import { useI18n } from "@/i18n/i18n-provider";
import { ApiClientError } from "@/lib/api-client";

export const LoginPage = () => {
  const { t } = useI18n();
  const [form] = Form.useForm<LoginPayload>();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const nextPath = searchParams.get("next") || "/dashboard";

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey: ["auth", "me"] });
      queryClient.removeQueries({ queryKey: ["auth", "me"] });
      navigate(nextPath, { replace: true });
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        message.error(error.message);
        return;
      }

      message.error(t("auth.loginFailed"));
    }
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24
      }}
    >
      <Card style={{ width: "100%", maxWidth: 420 }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          {t("auth.loginTitle")}
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          {t("auth.loginHint")}
        </Typography.Paragraph>

        <Form
          layout="vertical"
          form={form}
          initialValues={{
            email: "visitor@nextsuit.dev",
            password: "Visitor123!"
          }}
          onFinish={(values) => loginMutation.mutate(values)}
        >
          <Form.Item
            label={t("auth.email")}
            name="email"
            rules={[
              { required: true, message: t("auth.inputEmail") },
              { type: "email", message: t("auth.invalidEmail") }
            ]}
          >
            <Input autoComplete="email" />
          </Form.Item>

          <Form.Item
            label={t("auth.password")}
            name="password"
            rules={[{ required: true, message: t("auth.inputPassword") }]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loginMutation.isPending}>
            {t("auth.loginButton")}
          </Button>
        </Form>
      </Card>
    </div>
  );
};
