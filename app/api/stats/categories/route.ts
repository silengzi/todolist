import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, createAuthResponse } from '@/lib/auth-middleware'

type CategoryWithTodos = {
  id: string
  name: string
  color: string
  todos: { completed: boolean }[]
  _count: { todos: number }
}

// 按分类统计
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return createAuthResponse('未授权访问')
    }

    const categories = await prisma.category.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: {
            todos: true,
          },
        },
        todos: {
          select: {
            completed: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const categoryStats = categories.map((category: CategoryWithTodos) => {
      const completedCount = category.todos.filter((todo) => todo.completed).length
      const totalCount = category.todos.length
      const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

      return {
        id: category.id,
        name: category.name,
        color: category.color,
        total: totalCount,
        completed: completedCount,
        pending: totalCount - completedCount,
        completionRate: Math.round(completionRate * 100) / 100,
      }
    })

    // 添加未分类的统计
    const uncategorizedTodos = await prisma.todo.findMany({
      where: {
        userId: user.id,
        categoryId: null,
      },
      select: {
        completed: true,
      },
    })

    const uncategorizedCompleted = uncategorizedTodos.filter(todo => todo.completed).length
    const uncategorizedTotal = uncategorizedTodos.length
    const uncategorizedCompletionRate = uncategorizedTotal > 0 
      ? (uncategorizedCompleted / uncategorizedTotal) * 100 
      : 0

    if (uncategorizedTotal > 0) {
      categoryStats.push({
        id: 'uncategorized',
        name: '未分类',
        color: '#6B7280',
        total: uncategorizedTotal,
        completed: uncategorizedCompleted,
        pending: uncategorizedTotal - uncategorizedCompleted,
        completionRate: Math.round(uncategorizedCompletionRate * 100) / 100,
      })
    }

    return NextResponse.json(categoryStats)
  } catch (error) {
    console.error('获取分类统计错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
