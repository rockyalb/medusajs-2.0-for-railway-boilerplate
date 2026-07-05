import { revalidatePath, revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET

  if (secret) {
    const provided =
      request.headers.get("x-revalidate-secret") ??
      request.nextUrl.searchParams.get("secret")

    if (provided !== secret) {
      return NextResponse.json(
        { message: "Invalid revalidation secret" },
        { status: 401 }
      )
    }
  }

  // Hard-expire the homepage: both the tagged data fetches and the
  // fully rendered route for every country code.
  revalidateTag("homepage", "max")
  revalidatePath("/[countryCode]", "page")

  return NextResponse.json({ revalidated: true, now: Date.now() })
}
