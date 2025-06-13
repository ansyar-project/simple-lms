import { Client } from "minio";

// Minio client configuration
export const minioClient = new Client({
  endPoint:
    process.env.MINIO_ENDPOINT?.replace(/^https?:\/\//, "") ?? "localhost",
  port: parseInt(process.env.MINIO_PORT ?? "9000"),
  useSSL:
    process.env.MINIO_PORT === "443" ||
    process.env.MINIO_ENDPOINT?.startsWith("https"),
  accessKey: process.env.MINIO_ACCESS_KEY ?? "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY ?? "minioadmin",
});

// Bucket names
export const BUCKETS = {
  COURSE_THUMBNAILS: "course-thumbnails",
  COURSE_VIDEOS: "course-videos",
  COURSE_DOCUMENTS: "course-documents",
  USER_AVATARS: "user-avatars",
} as const;

// Initialize buckets
export async function initializeBuckets() {
  try {
    for (const bucketName of Object.values(BUCKETS)) {
      const exists = await minioClient.bucketExists(bucketName);
      if (!exists) {
        await minioClient.makeBucket(bucketName);
        console.log(`✅ Created bucket: ${bucketName}`);
      }
    }
  } catch (error) {
    console.error("❌ Error initializing Minio buckets:", error);
  }
}

// Helper function to upload file
export async function uploadFile(
  file: Buffer,
  fileName: string,
  bucketName: string,
  contentType?: string
): Promise<string> {
  try {
    await minioClient.putObject(bucketName, fileName, file, file.length, {
      "Content-Type": contentType,
    });

    // Return the file URL
    return `/${bucketName}/${fileName}`;
  } catch (error) {
    console.error("❌ Error uploading file to Minio:", error);
    throw new Error("Failed to upload file");
  }
}

// Helper function to get presigned URL for private files
export async function getPresignedUrl(
  bucketName: string,
  fileName: string,
  expiry: number = 24 * 60 * 60 // 24 hours
): Promise<string> {
  try {
    return await minioClient.presignedGetObject(bucketName, fileName, expiry);
  } catch (error) {
    console.error("❌ Error generating presigned URL:", error);
    throw new Error("Failed to generate file URL");
  }
}

// Helper function to delete file
export async function deleteFile(
  bucketName: string,
  fileName: string
): Promise<void> {
  try {
    await minioClient.removeObject(bucketName, fileName);
  } catch (error) {
    console.error("❌ Error deleting file from Minio:", error);
    throw new Error("Failed to delete file");
  }
}
