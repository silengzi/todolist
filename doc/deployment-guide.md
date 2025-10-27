# Vercel 部署指南

## 环境变量配置

由于 `.env*` 文件在 `.gitignore` 中，不会自动提交到仓库。部署到 Vercel 时需要手动配置环境变量。

### 需要在 Vercel 上配置的环境变量

#### 1. DATABASE_URL

项目使用 PostgreSQL 数据库，需要配置数据库连接字符串。

**格式：**
```
DATABASE_URL="postgresql://用户名:密码@主机名:端口/数据库名?schema=public"
```

#### 2. 配置步骤

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** → **Environment Variables**
4. 添加以下环境变量：

   | 变量名 | 值 | 环境 |
   |--------|-----|------|
   | `DATABASE_URL` | 你的数据库连接字符串 | Production, Preview, Development |

#### 3. 数据库选项

##### 选项 A：使用 Vercel Postgres（推荐）

1. 在项目页面，点击 **Storage** 标签
2. 点击 **Create Database** → 选择 **Postgres**
3. 创建后会自动添加 `POSTGRES_PRISMA_URL` 和 `POSTGRES_URL_NON_POOLING`
4. 需要在 Environment Variables 中添加：
   - `DATABASE_URL` = `POSTGRES_PRISMA_URL` 的值（用于连接池）

##### 选项 B：使用外部数据库（如 Supabase、Railway、Render）

使用你外部数据库提供的连接字符串即可。

### 数据库迁移

#### 首次部署

在首次部署前，需要在 Vercel 上运行数据库迁移。

**方法 1：使用 Vercel CLI（推荐）**

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 链接项目
vercel link

# 在本地推送环境变量（仅 DATABASE_URL）
vercel env pull .env.local

# 运行迁移
npx prisma migrate deploy

# 生成 Prisma Client
npx prisma generate
```

**方法 2：使用 Database 设置**

1. 在 Vercel Dashboard 进入 **Settings** → **Build & Development Settings**
2. 找到 **Build Command**
3. 暂时修改为：
   ```bash
   npx prisma generate && npx prisma migrate deploy && next build
   ```

#### 更新部署配置

添加 `vercel.json` 配置文件（如果需要）：

```json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build",
  "installCommand": "npm install"
}
```

但实际上，我们已经在 `next.config.ts` 中配置了正确的设置，通常不需要额外的 `vercel.json`。

### 环境变量安全检查

✅ 本地开发：使用 `.env.local` 文件
✅ 生产环境：在 Vercel Dashboard 配置
✅ 信息安全：所有敏感信息不会提交到 Git

### 常见问题

#### Q: 部署后无法连接数据库？
A: 检查以下几点：
1. `DATABASE_URL` 环境变量是否已配置
2. 数据库服务是否允许 Vercel IP 访问（如果使用外部数据库）
3. 查看 Vercel 构建日志中的错误信息

#### Q: 如何查看数据库迁移状态？
A: 可以通过 Vercel 的构建日志查看，或使用 Vercel CLI：
```bash
vercel logs
```

#### Q: 每次部署都需要运行迁移吗？
A: 不需要。Vercel 会自动运行 `prisma generate`，但迁移只在你通过 Git push 新迁移文件时运行。

### 推荐工作流程

1. **首次部署前**：
   ```bash
   # 本地创建迁移
   npx prisma migrate dev --name your_migration_name
   
   # 提交代码
   git add .
   git commit -m "Add migration"
   git push origin main
   ```

2. **配置 Vercel**：
   - 在 Vercel Dashboard 添加 `DATABASE_URL`
   - 项目会自动构建和部署

3. **验证部署**：
   - 访问部署的 URL
   - 测试登录/注册功能
   - 检查数据是否正常

### 维护清单

- [ ] 已配置 `DATABASE_URL` 环境变量
- [ ] 已运行数据库迁移
- [ ] 已测试生产环境登录/注册
- [ ] 已测试 Todos 创建/更新/删除功能
- [ ] 已配置数据库连接池（如果使用）
- [ ] 已设置备份策略（重要数据）

## 总结

主要问题：`.env` 文件不会自动部署
解决方案：在 Vercel Dashboard 手动配置 `DATABASE_URL` 环境变量

部署步骤简述：
1. Push 代码到 Git
2. 在 Vercel Dashboard 添加 `DATABASE_URL`
3. Vercel 自动构建并部署
4. 首次部署可能需要手动运行迁移
