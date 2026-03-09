import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import fs from "fs";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

import { env } from "./config/env.js";
import { setupSwagger } from "./config/swagger.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFoundHandler } from "./middlewares/not-found.js";
import { withOrgContext } from "./middlewares/org-context.js";
import { apiRouter } from "./modules/index.js";

export const app = express();
const uploadsDir = path.resolve(process.cwd(), "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(",").map((item) => item.trim()),
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

setupSwagger(app);

app.get("/", (_req, res) => {
  res.json({
    service: "nextsuit-core-api",
    docs: "/docs",
    health: `${env.API_PREFIX}/health`
  });
});

app.use(
  "/uploads",
  (_req, res, next) => {
    // Uploaded assets are consumed by admin-web/blog-web on different origins.
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(uploadsDir)
);
app.use(env.API_PREFIX, withOrgContext, apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);
