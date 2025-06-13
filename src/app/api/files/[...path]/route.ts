import { NextRequest, NextResponse } from "next/server";
import { minioClient, BUCKETS } from "@/lib/minio";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;

    if (!path || path.length < 2) {
      return new NextResponse("Invalid path", { status: 400 });
    }

    const [bucketName, ...filePathParts] = path;
    const fileName = filePathParts.join("/"); // Validate bucket name to prevent unauthorized access
    const validBuckets = Object.values(BUCKETS) as string[];
    if (!validBuckets.includes(bucketName)) {
      return new NextResponse("Invalid bucket", { status: 400 });
    }

    // Check if file exists
    try {
      await minioClient.statObject(bucketName, fileName);
    } catch {
      return new NextResponse("File not found", { status: 404 });
    }

    // Get the file stream from MinIO
    const stream = await minioClient.getObject(bucketName, fileName);

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Determine content type based on file extension
    const ext = fileName.split(".").pop()?.toLowerCase();
    let contentType = "application/octet-stream";

    switch (ext) {
      case "jpg":
      case "jpeg":
        contentType = "image/jpeg";
        break;
      case "png":
        contentType = "image/png";
        break;
      case "webp":
        contentType = "image/webp";
        break;
      case "gif":
        contentType = "image/gif";
        break;
      case "svg":
        contentType = "image/svg+xml";
        break;
      case "pdf":
        contentType = "application/pdf";
        break;
      case "mp4":
        contentType = "video/mp4";
        break;
      case "avi":
        contentType = "video/avi";
        break;
      case "mov":
        contentType = "video/quicktime";
        break;
      case "wmv":
        contentType = "video/x-ms-wmv";
        break;
    }

    // Return the file with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
