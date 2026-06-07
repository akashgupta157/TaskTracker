import { PrismaClient } from "@/generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";

const prismaSingleton = () => new PrismaClient().$extends(withAccelerate());
type ExtendedPrismaClient = ReturnType<typeof prismaSingleton>;

const globalForPrisma = global as unknown as { prisma?: ExtendedPrismaClient };

export const prisma: ExtendedPrismaClient =
  globalForPrisma.prisma ?? prismaSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
