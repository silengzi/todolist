FROM node:20-bullseye-slim

WORKDIR /app

# 使用国内 npm 镜像
RUN npm config set registry https://registry.npmmirror.com

# 复制依赖文件
COPY package.json package-lock.json ./

# 复制项目源码
COPY . .

# 安装依赖
RUN npm ci --unsafe-perm

# Prisma 生成
RUN npx prisma generate

# Next.js 构建
RUN npm run build

EXPOSE 3000

CMD ["node", ".next/standalone/server.js"]