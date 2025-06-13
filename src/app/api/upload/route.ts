import { NextRequest, NextResponse } from "next/server";
import {
  uploadCourseThumbnail,
  uploadCourseVideo,
  uploadCourseDocument,
} from "@/actions/upload";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const type = formData.get("type") as string;

    let result;
    switch (type) {
      case "thumbnail":
        result = await uploadCourseThumbnail(formData);
        break;
      case "video":
        result = await uploadCourseVideo(formData);
        break;
      case "document":
        result = await uploadCourseDocument(formData);
        break;
      default:
        return NextResponse.json(
          { success: false, error: "Invalid upload type" },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}
