import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, createAuthResponse } from '@/lib/auth-middleware'
import { ReportType } from '@/types/report'

// 生成报告
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return createAuthResponse('未授权访问')
    }

    const body = await request.json()
    const { type, startDate, endDate } = body

    if (!type || !startDate || !endDate) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    if (!['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'].includes(type)) {
      return NextResponse.json(
        { error: '无效的报告类型' },
        { status: 400 }
      )
    }

    // 处理日期范围，确保时区正确
    const startDateTime = new Date(startDate)
    const endDateTime = new Date(endDate)
    
    // 设置开始时间为当天00:00:00，结束时间为当天23:59:59
    startDateTime.setHours(0, 0, 0, 0)
    endDateTime.setHours(23, 59, 59, 999)

    // 查询指定日期范围内的已完成任务
    const completedTodos = await prisma.todo.findMany({
      where: {
        userId: user.id,
        completed: true,
        completedAt: {
          gte: startDateTime,
          lte: endDateTime,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
    })

    // 查询待完成任务
    const pendingTodos = await prisma.todo.findMany({
      where: {
        userId: user.id,
        completed: false,
        OR: [
          { dueDate: null },
          { dueDate: { lte: endDateTime } },
        ],
      },
      include: {
        category: true,
      },
    })

    // 生成统计信息
    const totalCompleted = completedTodos.length
    const totalPending = pendingTodos.length
    const categoriesCount = completedTodos.reduce((acc, todo) => {
      const categoryName = todo.category?.name || '未分类'
      acc[categoryName] = (acc[categoryName] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const prioritiesCount = completedTodos.reduce((acc, todo) => {
      acc[todo.priority] = (acc[todo.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // 模拟 AI 生成摘要
    const summary = generateSummary(completedTodos, totalCompleted, categoriesCount, prioritiesCount, type as ReportType)

    // 生成完整报告内容
    const content = generateReportContent(completedTodos, pendingTodos, type as ReportType, startDate, endDate)

    // 创建报告记录
    const report = await prisma.report.create({
      data: {
        userId: user.id,
        type: type as ReportType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        summary,
        content,
      },
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error('生成报告错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 模拟 AI 生成摘要
function generateSummary(
  todos: Array<{ title: string; priority: string; category?: { name: string } | null }>,
  totalCompleted: number,
  categoriesCount: Record<string, number>,
  prioritiesCount: Record<string, number>,
  type: ReportType
): string {
  if (todos.length === 0) {
    return `${getReportTypeName(type)}无已完成任务。`
  }

  // 获取完成最多的分类
  const topCategory = Object.entries(categoriesCount).sort((a, b) => b[1] - a[1])[0]
  const categoryInfo = topCategory ? `主要集中在「${topCategory[0]}」分类` : ''

  // 获取优先级分布
  const urgentCount = prioritiesCount.URGENT || 0
  const highCount = prioritiesCount.HIGH || 0
  
  const priorityInfo = urgentCount > 0 
    ? `完成了 ${urgentCount} 项紧急任务和 ${highCount} 项高优先级任务`
    : highCount > 0
    ? `完成了 ${highCount} 项高优先级任务`
    : ''

  return `${getReportTypeName(type)}共完成 ${totalCompleted} 项任务${categoryInfo}${priorityInfo}。主要成果包括：${todos.slice(0, 3).map(t => t.title).join('、')}等。`
}

// 生成完整报告内容（Markdown 格式）
function generateReportContent(
  completedTodos: Array<{ 
    title: string; 
    description?: string | null; 
    priority: string; 
    completedAt?: Date | null; 
    category?: { name: string } | null 
  }>,
  pendingTodos: Array<{ 
    title: string; 
    description?: string | null; 
    priority: string; 
    dueDate?: Date | null; 
    category?: { name: string } | null 
  }>,
  type: ReportType,
  startDate: string,
  endDate: string
): string {
  const reportTitle = getReportTypeName(type)
  const dateRange = `${formatDate(startDate)} 至 ${formatDate(endDate)}`
  
  let content = `# ${reportTitle}\n\n`
  content += `**时间范围**：${dateRange}\n`
  content += `**生成时间**：${new Date().toLocaleString('zh-CN')}\n\n`

  // 今日/本周完成
  content += `## ${type === 'DAILY' ? '今日完成' : '已完成任务'}\n\n`
  if (completedTodos.length === 0) {
    content += `暂无已完成的任务。\n\n`
  } else {
    const tasksByCategory = completedTodos.reduce((acc, todo) => {
      const category = todo.category?.name || '未分类'
      if (!acc[category]) acc[category] = []
      acc[category].push(todo)
      return acc
    }, {} as Record<string, typeof completedTodos>)

    for (const [category, tasks] of Object.entries(tasksByCategory)) {
      content += `### ${category}\n\n`
      tasks.forEach((todo: typeof completedTodos[0]) => {
        const priority = getPriorityName(todo.priority)
        const timeStr = todo.completedAt 
          ? formatDate(todo.completedAt.toString())
          : ''
        content += `- ✅ **${todo.title}** ${todo.description ? `- ${todo.description}` : ''} | ${priority} | ${timeStr}\n`
      })
    }
  }

  // 待完成任务
  if (pendingTodos.length > 0) {
    content += `\n## 待完成任务\n\n`
    pendingTodos.slice(0, 10).forEach(todo => {
      const dueDateStr = todo.dueDate ? formatDate(todo.dueDate.toString()) : '无截止日期'
      const priority = getPriorityName(todo.priority)
      content += `- ⏳ **${todo.title}** ${todo.description ? `- ${todo.description}` : ''} | ${priority} | 截止：${dueDateStr}\n`
    })
    if (pendingTodos.length > 10) {
      content += `\n*还有 ${pendingTodos.length - 10} 项待完成任务...*\n`
    }
  }

  // 统计信息
  content += `\n## 统计概览\n\n`
  content += `- 已完成任务：${completedTodos.length} 项\n`
  content += `- 待完成任务：${pendingTodos.length} 项\n`
  content += `- 完成率：${completedTodos.length + pendingTodos.length > 0 
    ? Math.round((completedTodos.length / (completedTodos.length + pendingTodos.length)) * 100)
    : 0}%\n`

  return content
}

function getReportTypeName(type: ReportType): string {
  const names = {
    DAILY: '日报',
    WEEKLY: '周报',
    MONTHLY: '月报',
    QUARTERLY: '季度报告',
    YEARLY: '年度报告',
  }
  return names[type] || '报告'
}

function getPriorityName(priority: string): string {
  const names = {
    LOW: '低',
    MEDIUM: '中',
    HIGH: '高',
    URGENT: '紧急',
  }
  return names[priority as keyof typeof names] || priority
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

