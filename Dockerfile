FROM node:20-alpine

WORKDIR /app

# 国内 npm 镜像，提高构建稳定性
RUN npm config set registry https://registry.npmmirror.com

# 1. 先复制依赖文件
COPY package.json package-lock.json ./

# 2. 复制整个项目，包括 prisma/schema.prisma 和 SQLite 文件
COPY . .

# 3. 安装依赖
RUN npm ci --unsafe-perm

# 4. 生成 Prisma Client
RUN npx prisma generate

# 5. 构建 Next.js 项目
RUN npm run build

# 6. 暴露端口
EXPOSE 3000

# 7. 启动
CMD ["node", ".next/standalone/server.js"]