import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 会自动加载 .env.local 和 .env 文件
  // 不需要手动在 env 中配置，除非需要暴露给客户端
  
  // 配置 Turbopack 以避免警告
  turbopack: {},
  
  // 确保 Prisma Client 及其二进制文件在 Vercel 上被正确打包
  // 这对于部署到 Vercel 等服务器less环境非常重要
  serverExternalPackages: ["@prisma/client", "prisma"],
  
  // 可选：添加输出模式以提高性能
  output: undefined, // 保持默认，让 Vercel 使用其优化的打包方式
};

export default nextConfig;
