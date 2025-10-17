import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  DB_PATH: z.string(),
  DB_MIGRATION: z.string(),
  NODE_PORT: z.string(),
  NODE_HOST: z.string(),
});

export const env = envSchema.parse(process.env);
