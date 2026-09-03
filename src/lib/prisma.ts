import { PrismaClient } from "@prisma/client";

/*
 * En développement, le rechargement à chaud recrée les modules : sans ce cache
 * global, chaque rechargement ouvrirait une nouvelle connexion.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
