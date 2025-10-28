import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, createAuthResponse } from '@/lib/auth-middleware'

// 获取报告详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return createAuthResponse('未授权访问')
    }

    const resolvedParams = await params
    const report = await prisma.report.findFirst({
      where: {
        id: resolvedParams.id,
        userId: user.id,
      },
    })

    if (!report) {
      return NextResponse.json(
        { error: '报告不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('获取报告详情错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 更新报告
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return createAuthResponse('未授权访问')
    }

    const resolvedParams = await params
    const body = await request.json()
    const { summary, content } = body

    const report = await prisma.report.findFirst({
      where: {
        id: resolvedParams.id,
        userId: user.id,
      },
    })

    if (!report) {
      return NextResponse.json(
        { error: '报告不存在' },
        { status: 404 }
      )
    }

    const updatedReport = await prisma.report.update({
      where: { id: resolvedParams.id },
      data: {
        summary: summary !== undefined ? summary : report.summary,
        content: content !== undefined ? content : report.content,
      },
    })

    return NextResponse.json(updatedReport)
  } catch (error) {
    console.error('更新报告错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 删除报告
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return createAuthResponse('未授权访问')
    }

    const resolvedParams = await params
    const report = await prisma.report.findFirst({
      where: {
        id: resolvedParams.id,
        userId: user.id,
      },
    })

    if (!report) {
      return NextResponse.json(
        { error: '报告不存在' },
        { status: 404 }
      )
    }

    await prisma.report.delete({
      where: { id: resolvedParams.id },
    })

    return NextResponse.json({ message: '删除成功' })
  } catch (error) {
    console.error('删除报告错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

