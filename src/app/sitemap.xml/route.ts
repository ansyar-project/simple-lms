import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const baseUrl = "https://simple-lms.ansyar-world.top";
  // Fetch all published courses with updatedAt and modules/lessons
  const courses = await db.course.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      updatedAt: true,
      modules: {
        select: {
          lessons: {
            select: {
              id: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });
  const staticUrls = [
    "",
    "/courses",
    "/dashboard",
    "/student/dashboard",
    "/instructor",
    "/instructor/courses",
    "/login",
    "/register",
  ];
  const staticUrlTags = staticUrls.map(
    (path) => `<url><loc>${baseUrl}${path}</loc></url>`
  );
  const courseUrlTags = courses.map(
    (course) =>
      `<url><loc>${baseUrl}/courses/${
        course.id
      }</loc><lastmod>${course.updatedAt.toISOString()}</lastmod></url>`
  );
  const lessonUrlTags = courses.flatMap((course) =>
    course.modules.flatMap((module) =>
      module.lessons.map(
        (lesson) =>
          `<url><loc>${baseUrl}/lessons/${
            lesson.id
          }</loc><lastmod>${lesson.createdAt.toISOString()}</lastmod></url>`
      )
    )
  );
  const urls = [...staticUrlTags, ...courseUrlTags, ...lessonUrlTags];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
