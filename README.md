# Next.js TodoList 项目

基于 Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 的个人待办事项管理应用。

## 🚀 技术栈

- **框架**: Next.js 16 (App Router)
- **前端**: React 19 + TypeScript 5
- **样式**: Tailwind CSS 4 + PostCSS
- **数据库**: Prisma ORM + PostgreSQL
- **认证**: JWT + Cookie
- **部署**: Docker + Vercel

## 📁 项目目录结构

```
todolist/
├── app/                          # Next.js App Router 应用目录
│   ├── api/                      # API 路由
│   │   ├── auth/                 # 认证相关API
│   │   │   ├── login/            # 登录接口
│   │   │   ├── logout/           # 登出接口
│   │   │   ├── me/               # 获取当前用户信息
│   │   │   └── register/         # 注册接口
│   │   ├── categories/           # 分类管理API
│   │   ├── reports/              # 报告生成API
│   │   ├── stats/                # 统计数据API
│   │   └── todos/                # 待办事项API
│   ├── components/               # 共享组件
│   │   ├── FilterBar.tsx         # 筛选栏组件
│   │   ├── ReportCard.tsx        # 报告卡片组件
│   │   ├── ReportFilters.tsx     # 报告筛选器
│   │   ├── ReportGenerator.tsx   # 报告生成器
│   │   ├── ReportTypeSelector.tsx # 报告类型选择器
│   │   ├── ReportViewer.tsx      # 报告查看器
│   │   ├── StatsCard.tsx         # 统计卡片组件
│   │   ├── TodoForm.tsx          # 待办事项表单
│   │   └── TodoItem.tsx          # 待办事项项
│   ├── dashboard/                # 仪表板页面
│   │   ├── categories/           # 分类管理页面
│   │   ├── reports/              # 报告页面
│   │   │   ├── [id]/             # 报告详情页
│   │   │   ├── generate/         # 生成报告页
│   │   │   └── page.tsx          # 报告列表页
│   │   └── page.tsx              # 主仪表板页
│   ├── login/                    # 登录页面
│   ├── register/                 # 注册页面
│   ├── favicon.ico               # 网站图标
│   ├── globals.css               # 全局样式
│   ├── layout.tsx                # 根布局组件
│   └── page.tsx                  # 首页
├── doc/                          # 文档目录
│   ├── stage3/                   # 第三阶段文档
│   ├── todo/                     # 项目开发文档
│   ├── database-export-guide.md  # 数据库导出指南
│   ├── database-import-guide.md  # 数据库导入指南
│   ├── deployment-guide.md       # 部署指南
│   ├── todolist-design-document.md # 设计文档
│   └── 需求文档.md               # 需求文档
├── lib/                          # 核心库文件
│   ├── auth-context.tsx          # 认证上下文
│   ├── auth-middleware.ts        # 认证中间件
│   ├── auth.ts                   # 认证工具函数
│   └── db.ts                     # 数据库连接
├── prisma/                       # Prisma 配置
│   ├── prisma/
│   │   └── dev.db                # 项目sqlite数据库文件，使用prisma连接
│   ├── migrations/               # 数据库迁移文件
│   └── schema.prisma             # Prisma Schema 定义
├── scripts/                      # 脚本文件
│   ├── export-data.ts            # 数据导出脚本
│   └── import-data.ts            # 数据导入脚本
├── types/                        # TypeScript 类型定义
│   ├── prisma-monorepo-workaround.d.ts # Prisma 类型修复
│   ├── report.ts                 # 报告类型定义
│   └── todo.ts                   # 待办事项类型定义
├── public/                       # 静态资源
├── .dockerignore                 # Docker 忽略文件
├── .env                          # 环境变量配置
├── .gitignore                    # Git 忽略文件
├── .npmrc                        # NPM 配置
├── .vercelignore                 # Vercel 忽略文件
├── Dockerfile                    # Docker 镜像配置
├── docker-compose.yml            # Docker Compose 配置
├── eslint.config.mjs             # ESLint 配置
├── next.config.ts                # Next.js 配置
├── nginx.conf                    # Nginx 配置
├── package.json                  # 项目依赖配置
├── postcss.config.mjs            # PostCSS 配置
├── tsconfig.json                 # TypeScript 配置
└── vercel.json                   # Vercel 部署配置
```

## 🎯 主要功能

- ✅ 用户注册/登录认证
- ✅ 待办事项增删改查
- ✅ 分类管理
- ✅ 数据统计分析
- ✅ 报告生成与导出
- ✅ 响应式设计
- ✅ 数据导入导出

## 🛠 开发环境搭建

### 环境要求

- Node.js >= 18.17.0
- PostgreSQL >= 13
- pnpm (推荐) 或 npm/yarn

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 环境变量配置

复制 `.env.example` 为 `.env` 并配置相应参数：

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/todolist"
JWT_SECRET="your-jwt-secret-key"
```

### 数据库初始化

```bash
npx prisma migrate dev
npx prisma generate
```

### 启动开发服务器

```bash
npm run dev
# 或
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 🐳 Docker 部署

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d
```

## ☁️ Vercel 部署

详细部署指南请查看：[doc/deployment-guide.md](doc/deployment-guide.md)


