import type { NextConfig } from "next";
import { existsSync, readFileSync } from 'fs';

// 检查并打印 DATABASE_URL 环境变量
function checkDatabaseUrl() {
  let dbUrl = process.env.DATABASE_URL
  
  // 如果环境变量中没有，尝试直接读取文件
  if (!dbUrl) {
    const envFiles = ['.env', '.env.local']
    for (const file of envFiles) {
      if (existsSync(file)) {
        try {
          const content = readFileSync(file, 'utf-8')
          console.log(`尝试读取文件 ${file}, 长度: ${content.length}`)
          const match = content.match(/DATABASE_URL=([^\r\n]+)/)
          if (match) {
            dbUrl = match[1].trim()
            process.env.DATABASE_URL = dbUrl
            console.log(`从文件 ${file} 中读取到 DATABASE_URL`)
            break
          } else {
            console.log(`文件 ${file} 中没有找到 DATABASE_URL，内容前100字符: ${content.substring(0, 100)}`)
          }
        } catch (e) {
          console.error(`读取文件 ${file} 失败:`, e)
        }
      } else {
        console.log(`文件 ${file} 不存在`)
      }
    }
  }
  
  if (dbUrl) {
    // 打印安全的信息（隐藏密码部分）
    const safeUrl = dbUrl.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@')
    console.log('✓ DATABASE_URL 已配置:', safeUrl)
  } else {
    console.error('❌ DATABASE_URL 环境变量未找到！请检查 .env 或 .env.local 文件')
    console.warn('⚠️  项目将无法连接到数据库')
  }
}

checkDatabaseUrl()

const nextConfig: NextConfig = {
  // Next.js 16 会自动加载 .env.local 和 .env 文件
  // 不需要手动在 env 中配置，除非需要暴露给客户端
  
  // 明确使用 Turbopack
  turbopack: {},
  
  // 使用 standalone 输出模式以确保所有必要的文件被包含
  output: "standalone",
  
  // 确保 Prisma Client 及其二进制文件在 Vercel 上被正确打包
  // 这些文件包含查询引擎，在 serverless 环境中非常重要
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
