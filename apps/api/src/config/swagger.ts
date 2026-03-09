import type { Express } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import { env } from "./env.js";

export const setupSwagger = (app: Express) => {
  const spec = swaggerJsdoc({
    definition: {
      openapi: "3.0.0",
      info: {
        title: "NextSuit Core API",
        version: "0.1.0",
        description: "Unified backend for admin, marketing and blog apps"
      },
      servers: [{ url: `http://localhost:${env.PORT}${env.API_PREFIX}` }]
    },
    apis: []
  });

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(spec));
};
