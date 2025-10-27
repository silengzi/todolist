import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  dbUrlChecked?: boolean
}

// 服务器端立即检查并打印 DATABASE_URL 环境变量（仅执行一次）
if (typeof window === 'undefined' && !globalForPrisma.dbUrlChecked) {
  globalForPrisma.dbUrlChecked = true
  
  const dbUrl = process.env.DATABASE_URL
  if (dbUrl) {
    // 打印安全的信息（隐藏密码部分）
    const safeUrl = dbUrl.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@')
    console.log('✓ DATABASE_URL 已配置:', safeUrl)
  } else {
    console.error('❌ DATABASE_URL 环境变量未找到！请检查 .env 或 .env.local 文件')
    console.warn('⚠️  项目将无法连接到数据库')
  }
}

// 使用默认配置，让 Prisma 从环境变量中读取 DATABASE_URL
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
