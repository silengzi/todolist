import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (token) {
      // 删除会话
      await prisma.session.deleteMany({
        where: { token }
      })
    }

    const response = NextResponse.json({
      message: '注销成功'
    })

    // 清除 Cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
    })

    return response

  } catch (error) {
    console.error('注销错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
