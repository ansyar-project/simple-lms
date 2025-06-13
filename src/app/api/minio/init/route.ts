import { NextResponse } from "next/server";
import { initializeBuckets } from "@/lib/minio";

export async function GET() {
  try {
    await initializeBuckets();
    return NextResponse.json({
      success: true,
      message: "Minio buckets initialized",
    });
  } catch (error) {
    console.error("Error initializing Minio buckets:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initialize buckets" },
      { status: 500 }
    );
  }
}
