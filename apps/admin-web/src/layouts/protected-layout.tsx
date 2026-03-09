import { Outlet } from "react-router-dom";

import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";

export const ProtectedLayout = () => {
  return (
    <AuthGuard>
      <AppShell>
        <Outlet />
      </AppShell>
    </AuthGuard>
  );
};
