import { NextRequest, NextResponse } from 'next/server'
import { getApiBaseUrl } from '@/app/lib/api-server'

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

const ACCESS_COOKIE = 'li_admin_token'
const REFRESH_COOKIE = 'li_admin_refresh'

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value

  if (!refreshToken) {
    return NextResponse.json({ message: 'No refresh token.' }, { status: 401 })
  }

  const apiBase = getApiBaseUrl()

  try {
    const res = await fetch(`${apiBase}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        Cookie: `${REFRESH_COOKIE}=${refreshToken}`,
      },
    })

    if (!res.ok) {
      console.error('[api/auth/refresh] upstream fetch failed:', apiBase, res.status, res.statusText);
      const response = NextResponse.json(
        { message: 'Session expired. Please log in again.' },
        { status: 401 },
      )
      response.cookies.delete(ACCESS_COOKIE)
      response.cookies.delete(REFRESH_COOKIE)
      return response
    }

    // Forward any Set-Cookie headers from NestJS
    const nestSetCookie = res.headers.getSetCookie?.() ?? []
    const response = NextResponse.json({ ok: true })

    if (nestSetCookie.length > 0) {
      nestSetCookie.forEach((c) => response.headers.append('Set-Cookie', c))
    } else {
      const data = await res.json().catch(() => ({})) as {
        accessToken?: string
        refreshToken?: string
      }
      if (data.accessToken) {
        response.cookies.set(ACCESS_COOKIE, data.accessToken, {
          httpOnly: true,
          secure: IS_PRODUCTION,
          sameSite: 'strict',
          path: '/',
          maxAge: 15 * 60,
        })
      }
      if (data.refreshToken) {
        response.cookies.set(REFRESH_COOKIE, data.refreshToken, {
          httpOnly: true,
          secure: IS_PRODUCTION,
          sameSite: 'strict',
          path: '/api/auth/refresh',
          maxAge: 7 * 24 * 60 * 60,
        })
      }
    }

    return response
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[api/auth/refresh] upstream fetch failed:', apiBase, err)
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
