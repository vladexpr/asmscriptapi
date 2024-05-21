import { app } from "./app.js";
import { PORT } from "./env.js";
import logger from "pino";

let LOGGER = logger();

let server = app.listen(PORT, () => {
  LOGGER.info(`[server]: Server is running at http://localhost:${PORT}`);
});

process.on("SIGTERM", () => {
  LOGGER.info("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    LOGGER.info("HTTP server closed");
  });
});
