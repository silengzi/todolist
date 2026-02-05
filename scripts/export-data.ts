#!/usr/bin/env tsx
/**
 * 数据库导出脚本
 * 将Neon在线数据库的所有数据导出到JSON文件
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ExportData {
  metadata: {
    exportedAt: string;
    databaseUrl: string;
    recordCounts: Record<string, number>;
  };
  data: {
    users: Array<Record<string, unknown>>;
    sessions: Array<Record<string, unknown>>;
    todos: Array<Record<string, unknown>>;
    categories: Array<Record<string, unknown>>;
    reports: Array<Record<string, unknown>>;
  };
}

async function exportDatabase() {
  try {
    console.log('🚀 开始导出数据库...');
    
    // 获取数据库URL（隐藏敏感信息）
    const dbUrl = process.env.DATABASE_URL || '';
    const safeDbUrl = dbUrl.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@');
    console.log('📊 连接数据库:', safeDbUrl);

    // 导出各个表的数据
    console.log('📥 正在导出用户数据...');
    const users = await prisma.user.findMany({
      include: {
        categories: true,
        reports: true,
        sessions: true,
        todos: true
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log('📥 正在导出会话数据...');
    const sessions = await prisma.session.findMany({
      orderBy: { createdAt: 'asc' }
    });

    console.log('📥 正在导出待办事项数据...');
    const todos = await prisma.todo.findMany({
      include: {
        category: true
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log('📥 正在导出分类数据...');
    const categories = await prisma.category.findMany({
      include: {
        user: true,
        todos: true
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log('📥 正在导出报告数据...');
    const reports = await prisma.report.findMany({
      include: {
        user: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // 创建导出数据对象
    const exportData: ExportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        databaseUrl: safeDbUrl,
        recordCounts: {
          users: users.length,
          sessions: sessions.length,
          todos: todos.length,
          categories: categories.length,
          reports: reports.length
        }
      },
      data: {
        users: users.map(user => ({
          ...user,
          password: '[HIDDEN]', // 隐藏密码
          sessions: user.sessions?.length || 0,
          todos: user.todos?.length || 0,
          categories: user.categories?.length || 0,
          reports: user.reports?.length || 0
        })),
        sessions,
        todos: todos.map(todo => ({
          ...todo,
          // 移除关联对象，只保留ID
          category: todo.category ? { id: todo.category.id, name: todo.category.name } : null
        })),
        categories: categories.map(category => ({
          ...category,
          // 移除关联对象，只保留ID
          user: { id: category.user.id, email: category.user.email },
          todos: category.todos?.length || 0
        })),
        reports: reports.map(report => ({
          ...report,
          // 移除关联对象，只保留ID
          user: { id: report.user.id, email: report.user.email }
        }))
      }
    };

    // 生成文件名
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `database-export-${timestamp}.json`;
    const filepath = path.join(process.cwd(), filename);

    // 写入文件
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2), 'utf8');

    console.log('✅ 数据导出完成！');
    console.log('📁 导出文件:', filepath);
    console.log('📊 记录统计:');
    Object.entries(exportData.metadata.recordCounts).forEach(([table, count]) => {
      console.log(`   ${table}: ${count} 条记录`);
    });
    console.log('⏰ 导出时间:', exportData.metadata.exportedAt);

  } catch (error) {
    console.error('❌ 导出过程中发生错误:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 运行导出
exportDatabase();
