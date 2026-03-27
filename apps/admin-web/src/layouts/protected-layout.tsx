import { Outlet } from "react-router-dom";

import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import { RoleGuard } from "@/components/role-guard";

export const ProtectedLayout = () => {
  return (
    <AuthGuard>
      <RoleGuard>
        <AppShell>
          <Outlet />
        </AppShell>
      </RoleGuard>
    </AuthGuard>
  );
};
