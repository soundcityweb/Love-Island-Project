import { NextRequest, NextResponse } from 'next/server'
import { getApiBaseUrl } from '@/app/lib/api-server'

const ACCESS_COOKIE = 'li_admin_token'
const REFRESH_COOKIE = 'li_admin_refresh'

export async function PATCH(req: NextRequest) {
  const accessToken = req.cookies.get(ACCESS_COOKIE)?.value

  if (!accessToken) {
    return NextResponse.json({ message: 'Not authenticated.' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 })
  }

  const apiBase = getApiBaseUrl()
  const forwarded = req.headers.get('x-forwarded-for')

  try {
    const res = await fetch(`${apiBase}/api/auth/change-password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `${ACCESS_COOKIE}=${accessToken}`,
        ...(forwarded ? { 'x-forwarded-for': forwarded } : {}),
      },
      body: JSON.stringify(body),
    })

    const data = await res.json().catch(() => ({}))
    const response = NextResponse.json(data, { status: res.status })

    const nestSetCookie = res.headers.getSetCookie?.() ?? []
    nestSetCookie.forEach((c) => response.headers.append('Set-Cookie', c))

    if (!res.ok) {
      return response
    }

    // Ensure client cookies are cleared if upstream did not send Set-Cookie
    if (nestSetCookie.length === 0) {
      response.cookies.delete(ACCESS_COOKIE)
      response.cookies.delete(REFRESH_COOKIE)
    }

    return response
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[api/auth/change-password] upstream fetch failed:', apiBase, err)
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
