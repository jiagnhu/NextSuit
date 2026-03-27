import { app } from "./app.js";
import { env } from "./config/env.js";
import { startWeeklyDigestScheduler } from "./jobs/weekly-digest.js";
import { prisma } from "./lib/prisma.js";

const server = app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`NextSuit Core API running on http://localhost:${env.PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Swagger docs: http://localhost:${env.PORT}/docs`);
});
const stopWeeklyDigestScheduler = startWeeklyDigestScheduler();

const shutdown = async () => {
  // eslint-disable-next-line no-console
  console.log("Shutting down...");
  stopWeeklyDigestScheduler();
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
