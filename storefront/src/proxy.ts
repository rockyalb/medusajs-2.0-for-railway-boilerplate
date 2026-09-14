import { NextRequest, NextResponse } from "next/server"

/** Albania is the sole market. Public links stay clean; Next renders /al internally. */
export function proxy(request: NextRequest) {
  const segments = request.nextUrl.pathname.split("/").filter(Boolean)
  if (segments[0]?.toLowerCase() === "al") {
    const clean = request.nextUrl.clone()
    clean.pathname = `/${segments.slice(1).join("/")}`
    return NextResponse.redirect(clean, 308)
  }

  const cartId = request.nextUrl.searchParams.get("cart_id")
  if (cartId && !request.nextUrl.searchParams.get("step")) {
    const checkout = request.nextUrl.clone()
    checkout.searchParams.set("step", "address")
    const response = NextResponse.redirect(checkout, 307)
    response.cookies.set("_medusa_cart_id", cartId, {
      maxAge: 60 * 60 * 24,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
    response.headers.set("Cache-Control", "private, no-store")
    return response
  }

  const internal = request.nextUrl.clone()
  internal.pathname = request.nextUrl.pathname === "/" ? "/al" : `/al${request.nextUrl.pathname}`
  // No region fetch or country cookie. Next determines cache policy per route;
  // cart/account/checkout responses remain personalized.
  return NextResponse.rewrite(internal)
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
}
