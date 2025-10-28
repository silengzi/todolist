import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, createAuthResponse } from '@/lib/auth-middleware'

// 保存报告
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return createAuthResponse('未授权访问')
    }

    const body = await request.json()
    const { id, summary, content } = body

    if (!id) {
      return NextResponse.json(
        { error: '报告ID不能为空' },
        { status: 400 }
      )
    }

    // 验证报告是否存在且属于当前用户
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

    // 更新报告
    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        summary: summary !== undefined ? summary : report.summary,
        content: content !== undefined ? content : report.content,
      },
    })

    return NextResponse.json(updatedReport)
  } catch (error) {
    console.error('保存报告错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

