/**
 * Silent refresh endpoint — called by Next.js middleware when the access token
 * is expired but a refresh token exists. Exchanges the refresh token for a new
 * access token, then redirects to the originally requested path.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getApiBaseUrl } from '@/app/lib/api-server'

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

const ACCESS_COOKIE = 'li_admin_token'
const REFRESH_COOKIE = 'li_admin_refresh'

export async function GET(req: NextRequest) {
  const redirect = req.nextUrl.searchParams.get('redirect') ?? '/admin'
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value

  if (!refreshToken) {
    console.error('[api/auth/silent-refresh] No refresh token found');
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        Cookie: `${REFRESH_COOKIE}=${refreshToken}`,
      },
    })

    if (!res.ok) {
      console.error('[api/auth/silent-refresh] upstream fetch failed:', getApiBaseUrl(), res.status, res.statusText);
      const response = NextResponse.redirect(new URL('/admin/login', req.url))
      response.cookies.delete(ACCESS_COOKIE)
      response.cookies.delete(REFRESH_COOKIE)
      return response
    }

    const response = NextResponse.redirect(new URL(redirect, req.url))

    const nestSetCookie = res.headers.getSetCookie?.() ?? []
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
    console.error('[api/auth/silent-refresh] upstream fetch failed:', getApiBaseUrl(), err);
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }
}
