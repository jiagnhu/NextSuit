import { useQuery } from "@tanstack/react-query";
import { Navigate, useLocation } from "react-router-dom";
import { type PropsWithChildren } from "react";

import { authApi } from "@/features/auth/api";
import { canAccessPath } from "@/features/auth/permissions";

export const RoleGuard = ({ children }: PropsWithChildren) => {
  const location = useLocation();
  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.me,
    staleTime: 5 * 60 * 1000,
    retry: false
  });

  if (!meQuery.data) {
    return <>{children}</>;
  }

  if (!canAccessPath(meQuery.data, location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

