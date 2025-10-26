import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 动态获取数据库连接字符串
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL
  console.log('当前数据库连接字符串(DATABASE_URL):', url ? '已设置' : '未设置')
  console.log('所有环境变量:', Object.keys(process.env).filter(key => key.includes('DATABASE')))
  
  if (!url) {
    throw new Error('DATABASE_URL 环境变量未设置。请确保 .env.local 文件存在且包含正确的 DATABASE_URL')
  }
  
  return url
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
