import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

export async function getCurrentUser(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return null
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!session || session.expiresAt < new Date()) {
      return null
    }

    return session.user
  } catch (error) {
    console.error('获取用户信息错误:', error)
    return null
  }
}

export function createAuthResponse(message: string, status: number = 401) {
  return Response.json({ error: message }, { status })
}
