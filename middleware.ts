import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const ACCESS_COOKIE = 'li_admin_token';
const REFRESH_COOKIE = 'li_admin_refresh';
const LOGIN_PATH = '/admin/login';

const ADMIN_PREFIX = '/admin';

function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export async function middleware(req: NextRequest) {
  const pathname = normalizePathname(req.nextUrl.pathname);

  // Only protect /admin routes
  if (!pathname.startsWith(ADMIN_PREFIX)) {
    return NextResponse.next();
  }

  // Admin sign-in page — no JWT (GlobalChrome also skips all /admin/*)
  if (pathname === LOGIN_PATH || pathname.startsWith(`${LOGIN_PATH}/`)) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get(ACCESS_COOKIE)?.value;

  // #region agent log
  const _dbgCookieNames = req.cookies.getAll().map((c) => c.name);
  const _dbgHasToken = !!accessToken;
  const _dbgSecret = !!process.env.JWT_SECRET;
  console.error('[DBG-31c049][middleware] cookies:', JSON.stringify(_dbgCookieNames), '| hasToken:', _dbgHasToken, '| hasJwtSecret:', _dbgSecret, '| path:', pathname);
  fetch('http://127.0.0.1:7830/ingest/f10f73e1-8af7-4ba2-b2ff-3cbfff6c99da',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'31c049'},body:JSON.stringify({sessionId:'31c049',location:'middleware.ts:30',message:'middleware cookie check',data:{cookieNames:_dbgCookieNames,hasToken:_dbgHasToken,hasJwtSecret:_dbgSecret,path:pathname},hypothesisId:'A-D',timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  // Fast path — no token at all
  if (!accessToken) {
    console.error('[DBG-31c049][middleware] No access token found — redirecting to login');
    return redirectToLogin(req);
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Misconfiguration — fail safely by redirecting to login
    console.error('[DBG-31c049][middleware] JWT_SECRET is not set — redirecting to login');
    return redirectToLogin(req);
  }

  try {
    await jwtVerify(accessToken, new TextEncoder().encode(secret), {
      algorithms: ['HS256'],
    });
    // Token is valid — let the request through
    return NextResponse.next();
  } catch (error) {
    // #region agent log
    const _dbgErrMsg = error instanceof Error ? error.message : String(error);
    const _dbgTokenPreview = accessToken ? accessToken.slice(0, 20) + '...' : 'none';
    console.error('[DBG-31c049][middleware] jwtVerify FAILED — error:', _dbgErrMsg, '| tokenPreview:', _dbgTokenPreview, '| secretLen:', secret.length);
    fetch('http://127.0.0.1:7830/ingest/f10f73e1-8af7-4ba2-b2ff-3cbfff6c99da',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'31c049'},body:JSON.stringify({sessionId:'31c049',location:'middleware.ts:59',message:'jwtVerify failed',data:{error:_dbgErrMsg,tokenPreview:_dbgTokenPreview,secretLen:secret.length},hypothesisId:'E',timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    console.error('[middleware] JWT verification failed:', error);
    // Access token invalid or expired — check if we have a refresh token so
    // the browser can silently refresh (the /api/auth/refresh handler will
    // set a new access token and redirect back).
    const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;

    if (refreshToken) {
      // Redirect to a silent refresh endpoint that will restore the session
      const refreshUrl = new URL('/api/auth/silent-refresh', req.url);
      refreshUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(refreshUrl);
    }

    // No valid tokens at all — clear stale cookies and redirect to login
    const response = redirectToLogin(req);
    response.cookies.delete(ACCESS_COOKIE);
    response.cookies.delete(REFRESH_COOKIE);
    return response;
  }
}

function redirectToLogin(req: NextRequest): NextResponse {
  console.error('[middleware] Redirecting to login');
  const loginUrl = new URL(LOGIN_PATH, req.url);
  loginUrl.searchParams.set(
    'redirect',
    normalizePathname(req.nextUrl.pathname),
  );
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
