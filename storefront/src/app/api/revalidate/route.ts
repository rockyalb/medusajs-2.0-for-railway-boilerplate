import { revalidatePath, revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

type RevalidateBody = {
  tags?: string[]
  paths?: string[]
}

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

  const body = (await request.json().catch(() => ({}))) as RevalidateBody
  const tags = body.tags?.length ? body.tags : ["homepage"]
  const paths = body.paths?.length ? body.paths : ["/[countryCode]"]

  for (const tag of tags) {
    revalidateTag(tag, "max")
  }

  for (const path of paths) {
    revalidatePath(path, "page")
  }

  return NextResponse.json({ revalidated: true, tags, paths, now: Date.now() })
}
