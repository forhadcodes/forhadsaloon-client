import { NextResponse, type NextRequest } from "next/server"

/**
 * Optimistic cookie check only. Authoritative role/blocked checks live in
 * `lib/session.ts` and on the Express API.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/payment/") ||
    (pathname.startsWith("/services/") && pathname !== "/services")

  if (!isProtected) return NextResponse.next()

  const hasSession = request.cookies.has("better-auth.session_token")
  if (hasSession) return NextResponse.next()

  const signIn = new URL("/signin", request.url)
  signIn.searchParams.set("redirect", `${pathname}${search}`)
  return NextResponse.redirect(signIn)
}

export const config = {
  matcher: ["/dashboard/:path*", "/payment/:path*", "/services/:path*"],
}
