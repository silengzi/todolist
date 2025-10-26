# Next.js 用户系统开发指南

## 概述

本指南将详细介绍如何在 Next.js 项目中开发一个完整的用户系统，包括：
- 用户注册
- 用户登录
- 用户注销
- 获取当前用户信息

## 技术栈

- **前端**: Next.js 16 + React 19 + TypeScript
- **后端**: Next.js API Routes
- **数据库**: PostgreSQL (开发和生产环境)
- **认证**: NextAuth.js
- **密码加密**: bcryptjs
- **表单验证**: Zod

## 1. 项目依赖安装

首先安装必要的依赖包：

```bash
# 数据库相关
npm install prisma @prisma/client
npm install -D prisma

# 认证相关
npm install next-auth
npm install bcryptjs
npm install -D @types/bcryptjs

# 表单验证
npm install zod

# UI 组件 (可选)
npm install @radix-ui/react-form @radix-ui/react-button
```

## 2. 数据库配置

### 2.1 初始化 Prisma

```bash
npx prisma init
```

### 2.2 配置数据库连接

编辑 `prisma/schema.prisma`：

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### 2.3 生成 Prisma 客户端

```bash
npx prisma generate
npx prisma db push
```

## 3. 数据库工具类

创建 `lib/db.ts`：

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## 4. 密码加密工具

创建 `lib/auth.ts`：

```typescript
import bcrypt from 'bcryptjs'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}
```

## 5. API 路由实现

### 5.1 用户注册 API

创建 `app/api/auth/register/route.ts`：

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('无效的邮箱地址'),
  password: z.string().min(6, '密码至少需要6个字符'),
  name: z.string().min(1, '姓名不能为空'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = registerSchema.parse(body)

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      )
    }

    // 加密密码
    const hashedPassword = await hashPassword(password)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      message: '注册成功',
      user
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('注册错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
```

### 5.2 用户登录 API

创建 `app/api/auth/login/route.ts`：

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/auth'
import { z } from 'zod'
import { randomBytes } from 'crypto'

const loginSchema = z.object({
  email: z.string().email('无效的邮箱地址'),
  password: z.string().min(1, '密码不能为空'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      )
    }

    // 验证密码
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      )
    }

    // 生成会话令牌
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7天

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      }
    })

    // 设置 Cookie
    const response = NextResponse.json({
      message: '登录成功',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7天
    })

    return response

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('登录错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
```

### 5.3 用户注销 API

创建 `app/api/auth/logout/route.ts`：

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (token) {
      // 删除会话
      await prisma.session.deleteMany({
        where: { token }
      })
    }

    const response = NextResponse.json({
      message: '注销成功'
    })

    // 清除 Cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
    })

    return response

  } catch (error) {
    console.error('注销错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
```

### 5.4 获取当前用户信息 API

创建 `app/api/auth/me/route.ts`：

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    // 查找会话
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json(
        { error: '会话已过期' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        createdAt: session.user.createdAt,
      }
    })

  } catch (error) {
    console.error('获取用户信息错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
```

## 6. 前端页面实现

### 6.1 认证上下文

创建 `lib/auth-context.tsx`：

```typescript
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('检查认证状态失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        return true
      }
      return false
    } catch (error) {
      console.error('登录失败:', error)
      return false
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        return true
      }
      return false
    } catch (error) {
      console.error('注册失败:', error)
      return false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
    } catch (error) {
      console.error('注销失败:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

### 6.2 登录页面

创建 `app/login/page.tsx`：

```typescript
'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const success = await login(email, password)
    
    if (success) {
      router.push('/dashboard')
    } else {
      setError('登录失败，请检查邮箱和密码')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            登录账户
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                邮箱地址
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </div>

          <div className="text-center">
            <a href="/register" className="text-blue-600 hover:text-blue-500">
              还没有账户？立即注册
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
```

### 6.3 注册页面

创建 `app/register/page.tsx`：

```typescript
'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const success = await register(email, password, name)
    
    if (success) {
      router.push('/dashboard')
    } else {
      setError('注册失败，请检查输入信息')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            创建账户
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                姓名
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                邮箱地址
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </div>

          <div className="text-center">
            <a href="/login" className="text-blue-600 hover:text-blue-500">
              已有账户？立即登录
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
```

### 6.4 用户仪表板

创建 `app/dashboard/page.tsx`：

```typescript
'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">用户仪表板</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">欢迎，{user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                注销
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                欢迎使用 TodoList
              </h2>
              <div className="space-y-2 text-gray-600">
                <p>用户ID: {user.id}</p>
                <p>邮箱: {user.email}</p>
                <p>姓名: {user.name}</p>
                <p>注册时间: {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
```

## 7. 更新根布局

更新 `app/layout.tsx` 以包含认证提供者：

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TodoList - 高效管理你的待办事项",
  description: "一个简洁、美观、功能强大的待办事项管理工具，帮助你提高工作效率，让生活更有条理。",
  keywords: ["待办事项", "任务管理", "效率工具", "时间管理", "TodoList"],
  authors: [{ name: "TodoList Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

## 8. 环境变量配置

创建 `.env.local` 文件：

```env
# PostgreSQL 数据库连接
DATABASE_URL="postgresql://username:password@localhost:5432/todolist_dev"

# NextAuth 配置
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 8.1 PostgreSQL 安装和配置

#### Windows 安装 PostgreSQL：

1. **下载 PostgreSQL**：
   - 访问 [PostgreSQL 官网](https://www.postgresql.org/download/windows/)
   - 下载 Windows 安装程序

2. **安装 PostgreSQL**：
   - 运行安装程序
   - 设置超级用户密码
   - 记住端口号（默认 5432）

3. **创建数据库**：
   ```sql
   -- 连接到 PostgreSQL
   psql -U postgres
   
   -- 创建开发数据库
   CREATE DATABASE todolist_dev;
   
   -- 创建用户（可选）
   CREATE USER todolist_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE todolist_dev TO todolist_user;
   ```

#### macOS 安装 PostgreSQL：

```bash
# 使用 Homebrew 安装
brew install postgresql@15

# 启动 PostgreSQL 服务
brew services start postgresql@15

# 创建数据库
createdb todolist_dev
```

#### Linux (Ubuntu/Debian) 安装 PostgreSQL：

```bash
# 安装 PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# 启动服务
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 创建数据库
sudo -u postgres createdb todolist_dev
```

#### Docker 方式运行 PostgreSQL：

创建 `docker-compose.yml` 文件：

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: todolist_dev
      POSTGRES_USER: todolist_user
      POSTGRES_PASSWORD: your_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

启动 PostgreSQL：

```bash
docker-compose up -d
```

对应的 `.env.local` 配置：

```env
DATABASE_URL="postgresql://todolist_user:your_password@localhost:5432/todolist_dev"
```

## 9. 测试步骤

1. **初始化数据库**：
   ```bash
   # 生成 Prisma 客户端
   npx prisma generate
   
   # 推送数据库模式
   npx prisma db push
   
   # 可选：查看数据库
   npx prisma studio
   ```

2. **启动开发服务器**：
   ```bash
   npm run dev
   ```

3. **测试注册功能**：
   - 访问 `http://localhost:3000/register`
   - 填写用户信息并提交
   - 检查是否成功跳转到仪表板

4. **测试登录功能**：
   - 访问 `http://localhost:3000/login`
   - 使用注册的邮箱和密码登录
   - 检查是否成功跳转到仪表板

5. **测试用户信息获取**：
   - 在仪表板页面查看用户信息是否正确显示

6. **测试注销功能**：
   - 点击注销按钮
   - 检查是否成功跳转到首页

## 10. 安全注意事项

1. **密码安全**：使用 bcrypt 加密存储密码
2. **会话管理**：使用安全的 Cookie 设置
3. **输入验证**：使用 Zod 进行严格的输入验证
4. **错误处理**：避免泄露敏感信息
5. **HTTPS**：生产环境必须使用 HTTPS

## 11. 扩展功能

可以考虑添加的功能：
- 邮箱验证
- 密码重置
- 社交登录
- 双因素认证
- 用户角色管理
- API 限流

## 12. 部署建议

1. **数据库**：使用 PostgreSQL（开发和生产环境一致）
2. **环境变量**：正确配置生产环境变量
3. **HTTPS**：启用 SSL 证书
4. **监控**：添加错误监控和日志记录
5. **备份**：定期备份数据库
6. **连接池**：生产环境配置数据库连接池

这个用户系统提供了完整的认证功能，可以作为 TodoList 应用的基础。所有代码都遵循了 Next.js 最佳实践，使用了 TypeScript 确保类型安全，并且具有良好的用户体验。
