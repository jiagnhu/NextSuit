import type { Express } from "express";
import swaggerUi from "swagger-ui-express";

import { env } from "./env.js";
import { openApiSpec } from "./openapi.js";

export const setupSwagger = (app: Express) => {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
  app.use(`${env.API_PREFIX}/docs`, swaggerUi.serve, swaggerUi.setup(openApiSpec));
};
