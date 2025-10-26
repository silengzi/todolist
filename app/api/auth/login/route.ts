import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/auth'
import { z } from 'zod'
import { randomBytes } from 'crypto'

const loginSchema = z.object({
  email: z.string().email('无效的邮箱地址'),
  password: z.string().min(1, '密码不能为空'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      )
    }

    // 验证密码
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      )
    }

    // 生成会话令牌
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7天

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      }
    })

    // 设置 Cookie
    const response = NextResponse.json({
      message: '登录成功',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7天
    })

    return response

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('登录错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
