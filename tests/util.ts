import { Server } from "http";
import { app } from "../src/app";

// @ts-ignore
import logger from "pino";

let LOGGER = logger();

var server: Server | null = null;

export const TEST_PORT = process.env.TEST_PORT || 5000;

export async function startServer() {
  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, () => {
      LOGGER.info(
        `[test server]: Server is running at http://localhost:${TEST_PORT}`,
      );
      resolve(server);
    });
  });
}

export function stopServer() {
  LOGGER.info(`[test server]: Stopping the server`);
  server!.close();
  server = null;
}

export function postJSON(url: string, body: any): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
