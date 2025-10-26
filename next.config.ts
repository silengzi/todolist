import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 会自动加载 .env.local 和 .env 文件
  // 不需要手动在 env 中配置，除非需要暴露给客户端
  experimental: {
    // 确保在构建时也能访问到环境变量
  },
};

export default nextConfig;
