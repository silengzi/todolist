import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, createAuthResponse } from '@/lib/auth-middleware'

// 趋势分析
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return createAuthResponse('未授权访问')
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

    // 获取每日创建和完成的待办事项数量
    const dailyStats = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as created,
        SUM(CASE WHEN completed = true THEN 1 ELSE 0 END) as completed
      FROM "Todo"
      WHERE user_id = ${user.id}
        AND created_at >= ${startDate}
        AND created_at <= ${endDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `

    // 获取优先级趋势
    const priorityTrends = await prisma.todo.groupBy({
      by: ['priority', 'completed'],
      where: {
        userId: user.id,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        priority: true,
      },
    })

    // 获取分类趋势
    const categoryTrends = await prisma.category.findMany({
      where: { userId: user.id },
      include: {
        todos: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            completed: true,
            createdAt: true,
          },
        },
      },
    })

    const categoryStats = categoryTrends.map(category => {
      const completed = category.todos.filter(todo => todo.completed).length
      const total = category.todos.length
      return {
        categoryId: category.id,
        categoryName: category.name,
        categoryColor: category.color,
        total,
        completed,
        completionRate: total > 0 ? (completed / total) * 100 : 0,
      }
    })

    return NextResponse.json({
      dailyStats,
      priorityTrends: priorityTrends.reduce((acc, trend) => {
        const key = `${trend.priority}_${trend.completed ? 'completed' : 'pending'}`
        acc[key] = trend._count.priority
        return acc
      }, {} as Record<string, number>),
      categoryStats,
    })
  } catch (error) {
    console.error('获取趋势分析错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
