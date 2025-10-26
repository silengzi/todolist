import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 在 Vercel 上，Prisma 需要能够找到正确的二进制文件
// 为 Vercel 环境配置 binaryTargets
const prismaClientOptions = process.env.VERCEL 
  ? {
      log: ['query', 'error', 'warn'] as const,
    }
  : {}

// 使用默认配置，让 Prisma 从环境变量中读取 DATABASE_URL
export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
