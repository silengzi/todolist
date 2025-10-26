import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 会自动加载 .env.local 和 .env 文件
  // 不需要手动在 env 中配置，除非需要暴露给客户端
  
  // 配置 Turbopack 以避免警告
  turbopack: {},
  
  // 使用 standalone 输出模式以确保所有必要的文件被包含
  output: "standalone",
  
  // 确保 Prisma Client 及其二进制文件在 Vercel 上被正确打包
  // 这些文件包含查询引擎，在 serverless 环境中非常重要
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
  
  webpack: (config, { isServer }) => {
    if (isServer) {
      // 在构建时包含 Prisma 的查询引擎
      config.externals = config.externals || [];
      config.externals.push({
        "child_process": "commonjs child_process",
      });
    }
    return config;
  },
};

export default nextConfig;
