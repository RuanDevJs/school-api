import { knex as setupKnex, Knex } from "knex";
import { env } from "../env";

export const config: Knex.Config = {
  client: "sqlite3",
  connection: {
    filename: env.DB_PATH,
  },
  useNullAsDefault: true,
  migrations: {
    extension: "ts",
    directory: env.DB_MIGRATION,
  },
};

export const database = setupKnex(config);
