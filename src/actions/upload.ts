"use server";

import { revalidatePath } from "next/cache";
import { authorize } from "@/lib/authorization";
import { uploadFile, BUCKETS } from "@/lib/minio";
import type { FileUploadResult } from "@/types/course";

// Allowed file types and sizes
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/avi",
  "video/mov",
  "video/wmv",
];
const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZES = {
  thumbnail: 5 * 1024 * 1024, // 5MB
  video: 500 * 1024 * 1024, // 500MB
  document: 50 * 1024 * 1024, // 50MB
};

// Helper function to validate file
function validateFile(
  file: File,
  type: "thumbnail" | "video" | "document"
): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZES[type]) {
    const sizeMB = Math.round(MAX_FILE_SIZES[type] / (1024 * 1024));
    return {
      valid: false,
      error: `File size must be less than ${sizeMB}MB`,
    };
  }

  // Check file type
  let allowedTypes: string[] = [];
  switch (type) {
    case "thumbnail":
      allowedTypes = ALLOWED_IMAGE_TYPES;
      break;
    case "video":
      allowedTypes = ALLOWED_VIDEO_TYPES;
      break;
    case "document":
      allowedTypes = ALLOWED_DOCUMENT_TYPES;
      break;
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  return { valid: true };
}

// Generate unique filename
function generateFileName(originalName: string, userId: string): string {
  const timestamp = Date.now();
  const extension = originalName.split(".").pop();
  const sanitizedName = originalName
    .replace(/\.[^/.]+$/, "") // Remove extension
    .replace(/[^a-zA-Z0-9]/g, "-") // Replace special chars with hyphens
    .toLowerCase();

  return `${userId}-${timestamp}-${sanitizedName}.${extension}`;
}

// Upload course thumbnail
export async function uploadCourseThumbnail(
  formData: FormData
): Promise<FileUploadResult> {
  try {
    const user = await authorize(["INSTRUCTOR", "ADMIN"]);

    const file = formData.get("file") as File;
    if (!file) {
      return {
        success: false,
        error: "No file provided",
      };
    }

    // Validate file
    const validation = validateFile(file, "thumbnail");
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const fileName = generateFileName(file.name, user.id);

    // Upload to Minio
    const fileUrl = await uploadFile(
      buffer,
      fileName,
      BUCKETS.COURSE_THUMBNAILS,
      file.type
    );

    return {
      success: true,
      url: fileUrl,
      fileName,
    };
  } catch (error) {
    console.error("Error uploading thumbnail:", error);
    return {
      success: false,
      error: "Failed to upload thumbnail. Please try again.",
    };
  }
}

// Upload course video
export async function uploadCourseVideo(
  formData: FormData
): Promise<FileUploadResult> {
  try {
    const user = await authorize(["INSTRUCTOR", "ADMIN"]);

    const file = formData.get("file") as File;
    if (!file) {
      return {
        success: false,
        error: "No file provided",
      };
    }

    // Validate file
    const validation = validateFile(file, "video");
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const fileName = generateFileName(file.name, user.id);

    // Upload to Minio
    const fileUrl = await uploadFile(
      buffer,
      fileName,
      BUCKETS.COURSE_VIDEOS,
      file.type
    );

    return {
      success: true,
      url: fileUrl,
      fileName,
    };
  } catch (error) {
    console.error("Error uploading video:", error);
    return {
      success: false,
      error: "Failed to upload video. Please try again.",
    };
  }
}

// Upload course document
export async function uploadCourseDocument(
  formData: FormData
): Promise<FileUploadResult> {
  try {
    const user = await authorize(["INSTRUCTOR", "ADMIN"]);

    const file = formData.get("file") as File;
    if (!file) {
      return {
        success: false,
        error: "No file provided",
      };
    }

    // Validate file
    const validation = validateFile(file, "document");
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const fileName = generateFileName(file.name, user.id);

    // Upload to Minio
    const fileUrl = await uploadFile(
      buffer,
      fileName,
      BUCKETS.COURSE_DOCUMENTS,
      file.type
    );

    return {
      success: true,
      url: fileUrl,
      fileName,
    };
  } catch (error) {
    console.error("Error uploading document:", error);
    return {
      success: false,
      error: "Failed to upload document. Please try again.",
    };
  }
}
