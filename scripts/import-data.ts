#!/usr/bin/env tsx
/**
 * 数据库导入脚本
 * 将JSON导出文件中的数据导入到SQLite数据库
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// 禁用类型检查以简化导入过程
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExportData = any;

const prisma = new PrismaClient();

async function importDatabase() {
  console.log('🚀 开始导入数据库...');
  
  try {
    // 读取导出文件
    const exportFilePath = path.join(process.cwd(), 'database-export-2026-02-05T10-30-04-851Z.json');
    
    if (!fs.existsSync(exportFilePath)) {
      throw new Error(`导出文件不存在: ${exportFilePath}`);
    }

    const exportData: ExportData = JSON.parse(fs.readFileSync(exportFilePath, 'utf8'));
    console.log('✅ 成功读取导出文件');

    // 开始事务处理
    await prisma.$transaction(async (tx) => {
      console.log('\n📋 开始导入数据...');

      // 1. 导入用户数据
      console.log('\n👤 导入用户数据...');
      const importedUsers = [];
      for (const userData of exportData.data.users) {
        // 清理用户数据，移除计算字段
        const { sessions, todos, categories, reports, ...cleanUserData } = userData;
        
        const user = await tx.user.create({
          data: cleanUserData
        });
        importedUsers.push(user);
        console.log(`   ✓ 导入用户: ${user.email}`);
      }

      // 2. 导入分类数据
      console.log('\n📂 导入分类数据...');
      const importedCategories = [];
      for (const categoryData of exportData.data.categories) {
        // 清理分类数据
        const { user, todos, ...cleanCategoryData } = categoryData;
        
        const category = await tx.category.create({
          data: cleanCategoryData
        });
        importedCategories.push(category);
        console.log(`   ✓ 导入分类: ${category.name}`);
      }

      // 3. 导入待办事项数据
      console.log('\n📝 导入待办事项数据...');
      const importedTodos = [];
      for (const todoData of exportData.data.todos) {
        // 清理待办事项数据
        const { category, user, ...cleanTodoData } = todoData;
        
        // 处理日期字段
        if (cleanTodoData.dueDate) {
          cleanTodoData.dueDate = new Date(cleanTodoData.dueDate as string);
        }
        if (cleanTodoData.completedAt) {
          cleanTodoData.completedAt = new Date(cleanTodoData.completedAt as string);
        }
        cleanTodoData.createdAt = new Date(cleanTodoData.createdAt as string);
        cleanTodoData.updatedAt = new Date(cleanTodoData.updatedAt as string);
        
        const todo = await tx.todo.create({
          data: cleanTodoData
        });
        importedTodos.push(todo);
        console.log(`   ✓ 导入待办事项: ${todo.title}`);
      }

      // 4. 导入会话数据
      console.log('\n🔐 导入会话数据...');
      const importedSessions = [];
      for (const sessionData of exportData.data.sessions) {
        // 清理会话数据
        const { user, ...cleanSessionData } = sessionData;
        
        // 处理日期字段
        cleanSessionData.expiresAt = new Date(cleanSessionData.expiresAt as string);
        cleanSessionData.createdAt = new Date(cleanSessionData.createdAt as string);
        
        const session = await tx.session.create({
          data: cleanSessionData
        });
        importedSessions.push(session);
        console.log(`   ✓ 导入会话: ${session.id.substring(0, 8)}...`);
      }

      // 5. 导入报告数据
      console.log('\n📊 导入报告数据...');
      const importedReports = [];
      for (const reportData of exportData.data.reports) {
        // 清理报告数据
        const { user, ...cleanReportData } = reportData;
        
        // 处理日期字段
        cleanReportData.startDate = new Date(cleanReportData.startDate as string);
        cleanReportData.endDate = new Date(cleanReportData.endDate as string);
        cleanReportData.createdAt = new Date(cleanReportData.createdAt as string);
        cleanReportData.updatedAt = new Date(cleanReportData.updatedAt as string);
        
        const report = await tx.report.create({
          data: cleanReportData
        });
        importedReports.push(report);
        console.log(`   ✓ 导入报告: ${report.type} - ${report.id.substring(0, 8)}...`);
      }

      console.log('\n✅ 数据导入完成！');
      console.log('\n📊 导入统计:');
      console.log(`   用户: ${importedUsers.length} 条`);
      console.log(`   分类: ${importedCategories.length} 条`);
      console.log(`   待办事项: ${importedTodos.length} 条`);
      console.log(`   会话: ${importedSessions.length} 条`);
      console.log(`   报告: ${importedReports.length} 条`);
    });

  } catch (error) {
    console.error('❌ 导入过程中发生错误:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 运行导入
importDatabase().catch((error) => {
  console.error('❌ 导入失败:', error);
  process.exit(1);
});