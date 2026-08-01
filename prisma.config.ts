import "dotenv/config"; // 👈 IMPORTANTE: Carrega o arquivo .env
import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL!, // O "!" garante ao TS que a variável existe
  },
});
