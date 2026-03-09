import { Spin } from "antd";
import { Suspense, lazy, type ReactNode } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";

import { ProtectedLayout } from "@/layouts/protected-layout";

const LoginPage = lazy(() =>
  import("@/pages/login-page").then((module) => ({ default: module.LoginPage }))
);
const DashboardPage = lazy(() =>
  import("@/pages/dashboard-page").then((module) => ({ default: module.DashboardPage }))
);
const LeadsPage = lazy(() =>
  import("@/pages/leads-page").then((module) => ({ default: module.LeadsPage }))
);
const ContactsPage = lazy(() =>
  import("@/pages/contacts-page").then((module) => ({ default: module.ContactsPage }))
);
const SubscribersPage = lazy(() =>
  import("@/pages/subscribers-page").then((module) => ({ default: module.SubscribersPage }))
);
const ArticlesPage = lazy(() =>
  import("@/pages/articles-page").then((module) => ({ default: module.ArticlesPage }))
);
const NewArticlePage = lazy(() =>
  import("@/pages/new-article-page").then((module) => ({ default: module.NewArticlePage }))
);
const EditArticlePage = lazy(() =>
  import("@/pages/edit-article-page").then((module) => ({ default: module.EditArticlePage }))
);
const AboutPage = lazy(() =>
  import("@/pages/about-page").then((module) => ({ default: module.AboutPage }))
);

const withFallback = (element: ReactNode) => (
  <Suspense
    fallback={
      <div style={{ minHeight: 200, display: "grid", placeItems: "center" }}>
        <Spin />
      </div>
    }
  >
    {element}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/login",
    element: withFallback(<LoginPage />)
  },
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: "dashboard",
        element: withFallback(<DashboardPage />)
      },
      {
        path: "leads",
        element: withFallback(<LeadsPage />)
      },
      {
        path: "contacts",
        element: withFallback(<ContactsPage />)
      },
      {
        path: "subscribers",
        element: withFallback(<SubscribersPage />)
      },
      {
        path: "content/articles",
        element: withFallback(<ArticlesPage />)
      },
      {
        path: "content/articles/new",
        element: withFallback(<NewArticlePage />)
      },
      {
        path: "content/articles/:id/edit",
        element: withFallback(<EditArticlePage />)
      },
      {
        path: "about",
        element: withFallback(<AboutPage />)
      }
    ]
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />
  }
]);
