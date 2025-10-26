# TodoList 项目设计文档

## 1. 技术栈

### 前端技术栈
- **框架**: Next.js 16 (App Router)
- **前端库**: React 19 + TypeScript 5
- **样式框架**: Tailwind CSS 4 + PostCSS
- **字体**: Geist Sans + Geist Mono
- **代码规范**: ESLint + Next.js 配置

### 后端技术栈
- **API**: Next.js API Routes
- **数据库**: PostgreSQL
- **ORM**: Prisma 6.18
- **身份验证**: 基于 Session 的自定义认证系统
- **密码加密**: bcryptjs
- **数据验证**: Zod

### 开发工具
- **包管理**: npm
- **类型检查**: TypeScript 5
- **代码格式化**: ESLint
- **环境变量**: dotenv

## 2. 数据库设计

### 现有表结构

#### User 表
```sql
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  sessions  Session[]
  todos     Todo[]   // 新增关联
  categories Category[] // 新增关联
}
```

#### Session 表
```sql
model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### 新增表结构

#### Todo 表
```sql
model Todo {
  id          String   @id @default(cuid())
  title       String
  description String?
  completed   Boolean  @default(false)
  priority    Priority @default(MEDIUM)
  dueDate     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // 关联关系
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  categoryId  String?
  category    Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  
  // 索引
  @@index([userId])
  @@index([categoryId])
  @@index([completed])
  @@index([dueDate])
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

#### Category 表
```sql
model Category {
  id          String   @id @default(cuid())
  name        String
  color       String   @default("#3B82F6") // 十六进制颜色值
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // 关联关系
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  todos       Todo[]
  
  // 约束
  @@unique([userId, name]) // 同一用户下分类名唯一
  @@index([userId])
}
```

#### TodoTag 表（可选扩展）
```sql
model TodoTag {
  id        String   @id @default(cuid())
  name      String
  color     String   @default("#6B7280")
  createdAt DateTime @default(now())
  
  // 关联关系
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  todos     TodoTagRelation[]
  
  @@unique([userId, name])
  @@index([userId])
}

model TodoTagRelation {
  id      String @id @default(cuid())
  todoId  String
  tagId   String
  
  todo    Todo    @relation(fields: [todoId], references: [id], onDelete: Cascade)
  tag     TodoTag @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@unique([todoId, tagId])
}
```

## 3. 功能需求设计

### 3.1 核心功能模块

#### 用户认证模块
- **注册功能**
  - 邮箱注册
  - 密码强度验证
  - 邮箱格式验证
  - 重复邮箱检查

- **登录功能**
  - 邮箱/密码登录
  - 记住登录状态（7天）
  - 自动登录验证

- **登出功能**
  - 清除会话
  - 清除本地存储

#### Todo 管理模块
- **基础 CRUD 操作**
  - 创建待办事项
  - 查看待办事项列表
  - 编辑待办事项
  - 删除待办事项
  - 标记完成/未完成

- **高级功能**
  - 设置优先级（低/中/高/紧急）
  - 设置截止日期
  - 添加详细描述
  - 批量操作（批量删除、批量标记完成）

#### 分类管理模块
- **分类 CRUD**
  - 创建分类
  - 编辑分类名称和颜色
  - 删除分类
  - 查看分类列表

- **分类功能**
  - 为待办事项分配分类
  - 按分类筛选待办事项
  - 分类统计（每个分类的待办事项数量）

#### 搜索和筛选模块
- **搜索功能**
  - 按标题搜索
  - 按描述内容搜索
  - 实时搜索建议

- **筛选功能**
  - 按完成状态筛选
  - 按优先级筛选
  - 按分类筛选
  - 按截止日期筛选
  - 组合筛选条件

#### 统计和报表模块
- **基础统计**
  - 总待办事项数量
  - 已完成数量
  - 未完成数量
  - 完成率

- **高级统计**
  - 按分类统计
  - 按优先级统计
  - 按时间统计（今日、本周、本月）
  - 趋势分析

### 3.2 用户界面设计

#### 页面结构
- **首页** (`/`)
  - 产品介绍
  - 登录/注册入口

- **登录页** (`/login`)
  - 登录表单
  - 注册链接

- **注册页** (`/register`)
  - 注册表单
  - 登录链接

- **仪表板** (`/dashboard`)
  - 待办事项列表
  - 快速添加
  - 统计概览

- **分类管理** (`/dashboard/categories`)
  - 分类列表
  - 分类编辑

- **设置页面** (`/dashboard/settings`)
  - 个人信息编辑
  - 密码修改
  - 账户设置

#### 组件设计
- **TodoItem 组件**
  - 显示待办事项信息
  - 完成状态切换
  - 编辑/删除操作

- **TodoForm 组件**
  - 创建/编辑表单
  - 表单验证
  - 分类选择

- **CategorySelector 组件**
  - 分类选择下拉框
  - 颜色预览

- **FilterBar 组件**
  - 搜索输入框
  - 筛选条件选择
  - 排序选项

- **StatsCard 组件**
  - 统计数据展示
  - 图表可视化

### 3.3 API 接口设计

#### 认证相关 API
```
POST /api/auth/register    # 用户注册
POST /api/auth/login       # 用户登录
POST /api/auth/logout      # 用户登出
GET  /api/auth/me          # 获取当前用户信息
```

#### Todo 相关 API
```
GET    /api/todos          # 获取待办事项列表
POST   /api/todos          # 创建待办事项
GET    /api/todos/[id]     # 获取单个待办事项
PUT    /api/todos/[id]     # 更新待办事项
DELETE /api/todos/[id]     # 删除待办事项
PATCH  /api/todos/[id]/toggle # 切换完成状态
```

#### 分类相关 API
```
GET    /api/categories     # 获取分类列表
POST   /api/categories     # 创建分类
GET    /api/categories/[id] # 获取单个分类
PUT    /api/categories/[id] # 更新分类
DELETE /api/categories/[id] # 删除分类
```

#### 统计相关 API
```
GET /api/stats/overview    # 获取统计概览
GET /api/stats/categories  # 按分类统计
GET /api/stats/trends      # 趋势分析
```

### 3.4 数据流设计

#### 状态管理
- **认证状态**: 使用 React Context 管理用户登录状态
- **Todo 状态**: 使用 React useState/useReducer 管理待办事项
- **UI 状态**: 使用本地状态管理筛选、搜索等 UI 状态

#### 数据获取策略
- **服务端渲染**: 使用 Next.js Server Components 获取初始数据
- **客户端更新**: 使用 React Query 或 SWR 进行数据缓存和更新
- **乐观更新**: 对用户操作进行乐观更新，提升用户体验

### 3.5 性能优化

#### 前端优化
- **代码分割**: 使用 Next.js 自动代码分割
- **图片优化**: 使用 next/image 组件
- **字体优化**: 使用 next/font 优化字体加载
- **缓存策略**: 合理使用浏览器缓存和 CDN

#### 后端优化
- **数据库索引**: 为常用查询字段添加索引
- **查询优化**: 使用 Prisma 的 select 和 include 优化查询
- **分页**: 实现数据分页，避免一次性加载大量数据
- **缓存**: 对统计数据进行适当缓存

### 3.6 安全考虑

#### 数据安全
- **密码加密**: 使用 bcryptjs 加密存储密码
- **会话管理**: 使用安全的会话令牌
- **输入验证**: 使用 Zod 验证所有用户输入
- **SQL 注入防护**: 使用 Prisma ORM 防止 SQL 注入

#### 权限控制
- **用户隔离**: 确保用户只能访问自己的数据
- **API 权限**: 所有 API 都需要身份验证
- **前端权限**: 根据用户状态控制页面访问

### 3.7 扩展性设计

#### 功能扩展
- **标签系统**: 支持为待办事项添加多个标签
- **子任务**: 支持待办事项的子任务功能
- **提醒功能**: 支持邮件或推送提醒
- **协作功能**: 支持团队协作和共享待办事项

#### 技术扩展
- **移动端**: 支持 PWA 或 React Native 移动端
- **实时同步**: 使用 WebSocket 实现实时数据同步
- **文件上传**: 支持待办事项附件功能
- **导入导出**: 支持数据导入导出功能

## 4. 开发计划

### 阶段一：基础功能（1-2周）
- 完善用户认证系统
- 实现基础的 Todo CRUD 功能
- 完成基本的 UI 界面

### 阶段二：核心功能（2-3周）
- 实现分类管理功能
- 添加搜索和筛选功能
- 完善用户界面和交互

### 阶段三：高级功能（2-3周）
- 实现统计和报表功能
- 添加优先级和截止日期功能
- 优化性能和用户体验

### 阶段四：扩展功能（1-2周）
- 实现标签系统
- 添加批量操作功能
- 完善移动端适配

## 5. 技术债务和注意事项

### 当前技术债务
- 需要完善错误处理机制
- 需要添加单元测试和集成测试
- 需要完善 TypeScript 类型定义
- 需要添加数据验证和错误边界

### 开发注意事项
- 保持代码简洁和可维护性
- 遵循 Next.js 最佳实践
- 确保响应式设计
- 注重用户体验和性能优化
- 保持数据库设计的灵活性，便于后续扩展

---

*本文档将随着项目开发进度持续更新和完善。*
