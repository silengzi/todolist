import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('无效的邮箱地址'),
  password: z.string().min(6, '密码至少需要6个字符'),
  name: z.string().min(1, '姓名不能为空'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = registerSchema.parse(body)

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      )
    }

    // 加密密码
    const hashedPassword = await hashPassword(password)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      message: '注册成功',
      user
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('注册错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
