import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, createAuthResponse } from '@/lib/auth-middleware'

// 导出报告
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return createAuthResponse('未授权访问')
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const format = searchParams.get('format') || 'markdown'

    if (!id) {
      return NextResponse.json(
        { error: '报告ID不能为空' },
        { status: 400 }
      )
    }

    const report = await prisma.report.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!report) {
      return NextResponse.json(
        { error: '报告不存在' },
        { status: 404 }
      )
    }

    if (format === 'markdown') {
      // 返回 Markdown 格式
      const content = report.content || report.summary || '无内容'
      
      return new NextResponse(content, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': `attachment; filename="report-${report.id}.md"`,
        },
      })
    } else if (format === 'json') {
      // 返回 JSON 格式
      return NextResponse.json(report, {
        headers: {
          'Content-Disposition': `attachment; filename="report-${report.id}.json"`,
        },
      })
    } else {
      return NextResponse.json(
        { error: '不支持的导出格式' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('导出报告错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

