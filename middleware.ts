// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || ''
  const { pathname } = req.nextUrl

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|css|js|woff2?)$/)
  ) {
    return NextResponse.next()
  }

  let identifier = ''

  if (host !== ROOT_DOMAIN && host.endsWith(`.${ROOT_DOMAIN}`)) {
    identifier = host.replace(`.${ROOT_DOMAIN}`, '')
  } else if (
    host !== ROOT_DOMAIN &&
    !host.includes('localhost') &&
    !host.includes('127.0.0.1')
  ) {
    identifier = host
  }

  const res = NextResponse.next()
  res.headers.set('x-school-identifier', identifier)
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}