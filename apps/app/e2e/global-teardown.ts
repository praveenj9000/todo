import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import { deleteAllE2ETasks } from "./cleanup";

loadEnv({ path: resolve(__dirname, "../../../.env.e2e") });

export default async function globalTeardown() {
  await deleteAllE2ETasks();
}
