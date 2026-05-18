import { NextRequest, NextResponse } from 'next/server'
import { getApiBaseUrl } from '@/app/lib/api-server'

const ACCESS_COOKIE = 'li_admin_token'

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get(ACCESS_COOKIE)?.value

  if (!accessToken) {
    return NextResponse.json({ message: 'Not authenticated.' }, { status: 401 })
  }

  const apiBase = getApiBaseUrl()

  try {
    const res = await fetch(`${apiBase}/api/auth/me`, {
      headers: {
        Cookie: `${ACCESS_COOKIE}=${accessToken}`,
      },
      cache: 'no-store',
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      return NextResponse.json(
        { message: 'Not authenticated.' },
        { status: 401 },
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[api/auth/me] upstream fetch failed:', apiBase, err)
    }
    return NextResponse.json(
      {
        message:
          process.env.NODE_ENV === 'development'
            ? `Could not reach the auth service at ${apiBase}. Is the Nest API running?`
            : 'Could not reach the auth service.',
      },
      { status: 503 },
    )
  }
}
