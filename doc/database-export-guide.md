# 数据库导出脚本使用说明

## 概述

本项目提供了两个数据库导出脚本，可以将 Neon 在线数据库的数据导出为 JSON 格式文件。

## 脚本说明

### 1. 完整导出脚本 (`export-data.ts`)

导出所有表的完整数据，包含关联关系信息。

**特点：**
- 导出所有数据表（users, sessions, todos, categories, reports）
- 包含表之间的关联关系
- 隐藏敏感信息（如密码）
- 生成单一 JSON 文件

**使用方法：**
```bash
npm run export-db
```

**输出文件：**
- `database-export-{timestamp}.json`

### 2. 分表导出脚本 (`export-tables.ts`)

分别导出每个表的数据到独立的 JSON 文件。

**特点：**
- 每个表生成单独的文件
- 只包含表的基本字段
- 更适合数据分析和迁移

**使用方法：**
```bash
npx tsx scripts/export-tables.ts
```

**输出文件：**
- `users-export-{timestamp}.json`
- `todos-export-{timestamp}.json`
- `categories-export-{timestamp}.json`
- `reports-export-{timestamp}.json`

## 输出格式示例

### 完整导出文件结构：
```json
{
  "metadata": {
    "exportedAt": "2026-02-05T10:30:04.850Z",
    "databaseUrl": "postgresql://***:***@ep-floral-meadow-a1q6nptg-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
    "recordCounts": {
      "users": 1,
      "sessions": 12,
      "todos": 36,
      "categories": 3,
      "reports": 3
    }
  },
  "data": {
    "users": [...],
    "sessions": [...],
    "todos": [...],
    "categories": [...],
    "reports": [...]
  }
}
```

### 分表导出文件结构：
```json
{
  "exportedAt": "2026-02-05T10:30:04.850Z",
  "table": "todos",
  "count": 36,
  "records": [...]
}
```

## 注意事项

1. **环境变量**：确保 `.env` 文件中正确配置了 `DATABASE_URL`
2. **敏感信息**：导出文件会隐藏密码等敏感信息
3. **文件位置**：所有导出文件都会保存在项目根目录下
4. **时间戳**：文件名包含时间戳，避免覆盖之前的导出文件

## 依赖安装

如果尚未安装 `tsx`，请运行：
```bash
npm install --save-dev tsx
```

## 故障排除

如果遇到连接问题：
1. 检查 `.env` 文件中的 `DATABASE_URL` 是否正确
2. 确认网络连接正常
3. 验证 Neon 数据库是否可访问
