import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, createAuthResponse } from '@/lib/auth-middleware'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1, '分类名称不能为空').max(50, '分类名称不能超过50个字符'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '颜色格式不正确').optional(),
  description: z.string().optional(),
})

// 获取分类列表
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
          select: { todos: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('获取分类列表错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 创建分类
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return createAuthResponse('未授权访问')
    }

    const body = await request.json()
    const { name, color, description } = categorySchema.parse(body)

    // 检查分类名称是否已存在
    const existingCategory = await prisma.category.findFirst({
      where: {
        userId: user.id,
        name,
      },
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: '分类名称已存在' },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name,
        color: color || '#3B82F6',
        description,
        userId: user.id,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('创建分类错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
