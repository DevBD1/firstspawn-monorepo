import { buildApp } from "./server.js";
import { getConfig } from "./lib/config.js";

const start = async (): Promise<void> => {
  const config = getConfig();
  const app = await buildApp();

  try {
    await app.listen({
      host: config.API_HOST,
      port: config.API_PORT,
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

await start();
