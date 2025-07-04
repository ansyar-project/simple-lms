import { NextResponse } from "next/server";

export async function GET() {
  const content = `User-agent: *
Allow: /
Sitemap: https://simple-lms.ansyar-world.top/sitemap.xml`;
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
