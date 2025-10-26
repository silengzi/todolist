import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 会自动加载 .env.local 和 .env 文件
  // 不需要手动在 env 中配置，除非需要暴露给客户端
  
  // 配置 Turbopack 以避免警告
  turbopack: {},
  
  // 使用 standalone 输出模式以确保所有必要的文件被包含
  output: "standalone",
  
  // 确保 Prisma Client 在 Vercel 上能够正确工作
  // Vercel 会自动处理 Prisma 的二进制文件
};

export default nextConfig;
