import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, createAuthResponse } from '@/lib/auth-middleware'

// 获取统计概览
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return createAuthResponse('未授权访问')
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'all' // all, today, week, month

    let dateFilter: Record<string, any> = {}
    const now = new Date()

    switch (period) {
      case 'today':
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
        dateFilter = {
          createdAt: {
            gte: todayStart,
            lt: todayEnd,
          },
        }
        break
      case 'week':
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        dateFilter = {
          createdAt: {
            gte: weekStart,
          },
        }
        break
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        dateFilter = {
          createdAt: {
            gte: monthStart,
          },
        }
        break
    }

    const where = {
      userId: user.id,
      ...dateFilter,
    }

    const [
      totalTodos,
      completedTodos,
      pendingTodos,
      overdueTodos,
      priorityStats,
    ] = await Promise.all([
      prisma.todo.count({ where }),
      prisma.todo.count({ where: { ...where, completed: true } }),
      prisma.todo.count({ where: { ...where, completed: false } }),
      prisma.todo.count({
        where: {
          ...where,
          completed: false,
          dueDate: { lt: now },
        },
      }),
      prisma.todo.groupBy({
        by: ['priority'],
        where,
        _count: { priority: true },
      }),
    ])

    const completionRate = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0

    return NextResponse.json({
      overview: {
        total: totalTodos,
        completed: completedTodos,
        pending: pendingTodos,
        overdue: overdueTodos,
        completionRate: Math.round(completionRate * 100) / 100,
      },
      priorityStats: priorityStats.reduce((acc: Record<string, number>, stat: { priority: string; _count: { priority: number } }) => {
        acc[stat.priority] = stat._count.priority
        return acc
      }, {} as Record<string, number>),
    })
  } catch (error) {
    console.error('获取统计概览错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
