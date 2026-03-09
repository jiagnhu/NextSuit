import { Router } from "express";

import { articlesRouter } from "./articles/articles.routes.js";
import { authRouter } from "./auth/auth.routes.js";
import { categoriesRouter } from "./categories/categories.routes.js";
import { contactsRouter } from "./contacts/contacts.routes.js";
import { dashboardRouter } from "./dashboard/dashboard.routes.js";
import { healthRouter } from "./health/health.routes.js";
import { leadsRouter } from "./leads/leads.routes.js";
import { pageViewsRouter } from "./page-views/page-views.routes.js";
import { settingsRouter } from "./settings/settings.routes.js";
import { subscribersRouter } from "./subscribers/subscribers.routes.js";
import { tagsRouter } from "./tags/tags.routes.js";
import { uploadsRouter } from "./uploads/uploads.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/leads", leadsRouter);
apiRouter.use("/contacts", contactsRouter);
apiRouter.use("/subscribers", subscribersRouter);
apiRouter.use("/articles", articlesRouter);
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/tags", tagsRouter);
apiRouter.use("/settings", settingsRouter);
apiRouter.use("/uploads", uploadsRouter);
apiRouter.use("/page-views", pageViewsRouter);
