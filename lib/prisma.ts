// lib/prisma.ts
// Singleton para evitar múltiplas instâncias do PrismaClient em dev
// (Next.js hot-reload cria novos módulos a cada mudança — sem isso,
//  o pool de conexões esgota rapidamente)

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
