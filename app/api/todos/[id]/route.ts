import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, createAuthResponse } from '@/lib/auth-middleware'
import { z } from 'zod'

const todoUpdateSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题不能超过200个字符').optional(),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().datetime().optional(),
  categoryId: z.string().optional(),
  completed: z.boolean().optional(),
})

// 获取单个待办事项
export async function GET(
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
      include: {
        category: true,
      },
    })

    if (!todo) {
      return NextResponse.json(
        { error: '待办事项不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(todo)
  } catch (error) {
    console.error('获取待办事项错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 更新待办事项
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return createAuthResponse('未授权访问')
    }

    const body = await request.json()
    const updateData = todoUpdateSchema.parse(body)

    const { id } = await params
    // 验证待办事项是否存在且属于当前用户
    const existingTodo = await prisma.todo.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!existingTodo) {
      return NextResponse.json(
        { error: '待办事项不存在' },
        { status: 404 }
      )
    }

    // 验证分类是否属于当前用户
    if (updateData.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: updateData.categoryId, userId: user.id }
      })
      if (!category) {
        return NextResponse.json(
          { error: '分类不存在' },
          { status: 400 }
        )
      }
    }

    const todo = await prisma.todo.update({
      where: { id },
      data: {
        ...updateData,
        dueDate: updateData.dueDate ? new Date(updateData.dueDate) : undefined,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(todo)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('更新待办事项错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 删除待办事项
export async function DELETE(
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

    await prisma.todo.delete({
      where: { id },
    })

    return NextResponse.json({ message: '删除成功' })
  } catch (error) {
    console.error('删除待办事项错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
