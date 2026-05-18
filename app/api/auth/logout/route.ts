import { NextRequest, NextResponse } from 'next/server'
import { getApiBaseUrl } from '@/app/lib/api-server'

const ACCESS_COOKIE = 'li_admin_token'
const REFRESH_COOKIE = 'li_admin_refresh'

export async function POST(req: NextRequest) {
  const accessToken = req.cookies.get(ACCESS_COOKIE)?.value

  // Best-effort logout — always clear local cookies
  if (accessToken) {
    try {
      await fetch(`${getApiBaseUrl()}/api/auth/logout`, {
        method: 'POST',
        headers: {
          Cookie: `${ACCESS_COOKIE}=${accessToken}`,
        },
      })
    } catch {
      // Swallow — we still clear cookies below
    }
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.delete(ACCESS_COOKIE)
  response.cookies.delete(REFRESH_COOKIE)
  return response
}
