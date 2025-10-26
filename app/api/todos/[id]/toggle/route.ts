import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, createAuthResponse } from '@/lib/auth-middleware'

// 切换待办事项完成状态
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return createAuthResponse('未授权访问')
    }

    const { id } = await params
    const todo = await prisma.todo.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!todo) {
      return NextResponse.json(
        { error: '待办事项不存在' },
        { status: 404 }
      )
    }

    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: {
        completed: !todo.completed,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(updatedTodo)
  } catch (error) {
    console.error('切换待办事项状态错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
