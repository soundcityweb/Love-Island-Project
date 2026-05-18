import { NextRequest, NextResponse } from 'next/server'
import { getApiBaseUrl } from '@/app/lib/api-server'

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

const ACCESS_COOKIE = 'li_admin_token'
const REFRESH_COOKIE = 'li_admin_refresh'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 })
  }

  const apiBase = getApiBaseUrl()

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    const forwarded = req.headers.get('x-forwarded-for')
    if (forwarded) headers['x-forwarded-for'] = forwarded

    const res = await fetch(`${apiBase}/api/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      const msg =
        typeof (data as { message?: string }).message === 'string'
          ? (data as { message: string }).message
          : 'Invalid credentials.'
      return NextResponse.json({ message: msg }, { status: res.status })
    }

    // Extract tokens set as cookies by NestJS (if using cookie-based approach)
    // or from the response body if returned directly.
    // NestJS sets Set-Cookie headers — forward them to the browser.
    const nestSetCookie = res.headers.getSetCookie?.() ?? []
    const response = NextResponse.json(
      { user: (data as { user: unknown }).user },
      { status: 200 },
    )

    // #region agent log
    console.error('[DBG-31c049][login] nestSetCookie count:', nestSetCookie.length, '| raw headers:', JSON.stringify(nestSetCookie));
    fetch('http://127.0.0.1:7830/ingest/f10f73e1-8af7-4ba2-b2ff-3cbfff6c99da',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'31c049'},body:JSON.stringify({sessionId:'31c049',location:'login/route.ts:43',message:'login nestSetCookie',data:{count:nestSetCookie.length,headers:nestSetCookie,isProduction:IS_PRODUCTION},hypothesisId:'B-C',timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    if (nestSetCookie.length > 0) {
      // Forward the cookies from Nest directly
      nestSetCookie.forEach((c) => response.headers.append('Set-Cookie', c))
      // #region agent log
      console.error('[DBG-31c049][login] path: forwarding NestJS Set-Cookie headers verbatim');
      // #endregion
    } else {
      // #region agent log
      console.error('[DBG-31c049][login] path: fallback — setting cookies from body tokens');
      // #endregion
      // Fallback: if tokens were returned in body, set cookies here
      const tokens = data as { accessToken?: string; refreshToken?: string }
      if (tokens.accessToken) {
        response.cookies.set(ACCESS_COOKIE, tokens.accessToken, {
          httpOnly: true,
          secure: IS_PRODUCTION,
          sameSite: 'strict',
          path: '/',
          maxAge: 15 * 60, // 15 minutes
        })
      }
      if (tokens.refreshToken) {
        response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
          httpOnly: true,
          secure: IS_PRODUCTION,
          sameSite: 'strict',
          path: '/api/auth/refresh',
          maxAge: 7 * 24 * 60 * 60, // 7 days
        })
      }
    }

    return response
  } catch (err) {
    const dev = process.env.NODE_ENV === 'development'
    const cause = err instanceof Error ? err.message : String(err)
    if (dev) {
      console.error('[api/auth/login] upstream fetch failed:', apiBase, err)
    }
    return NextResponse.json(
      {
        message: dev
          ? `Could not reach the auth service at ${apiBase}. Is the Nest API running? (${cause})`
          : 'Could not reach the auth service.',
      },
      { status: 503 },
    )
  }
}
