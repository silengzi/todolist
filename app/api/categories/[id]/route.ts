import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, createAuthResponse } from '@/lib/auth-middleware'
import { z } from 'zod'

const categoryUpdateSchema = z.object({
  name: z.string().min(1, '分类名称不能为空').max(50, '分类名称不能超过50个字符').optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '颜色格式不正确').optional(),
  description: z.string().optional(),
})

// 获取单个分类
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
    const category = await prisma.category.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        _count: {
          select: { todos: true },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: '分类不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('获取分类错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 更新分类
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
    const updateData = categoryUpdateSchema.parse(body)

    const { id } = await params
    // 验证分类是否存在且属于当前用户
    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: '分类不存在' },
        { status: 404 }
      )
    }

    // 如果更新名称，检查是否与其他分类重名
    if (updateData.name && updateData.name !== existingCategory.name) {
      const duplicateCategory = await prisma.category.findFirst({
        where: {
          userId: user.id,
          name: updateData.name,
        },
      })

      if (duplicateCategory) {
        return NextResponse.json(
          { error: '分类名称已存在' },
          { status: 400 }
        )
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(category)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('更新分类错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 删除分类
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
    const category = await prisma.category.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: '分类不存在' },
        { status: 404 }
      )
    }

    // 删除分类时，将该分类下的待办事项的分类设为null
    await prisma.todo.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    })

    await prisma.category.delete({
      where: { id },
    })

    return NextResponse.json({ message: '删除成功' })
  } catch (error) {
    console.error('删除分类错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
