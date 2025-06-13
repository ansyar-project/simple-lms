"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateCourseStatus, deleteCourse } from "@/actions/courses";
import type { CourseWithDetails } from "@/types/course";
import {
  BookOpen,
  Users,
  DollarSign,
  MoreVertical,
  Edit,
  Eye,
  Archive,
  Trash2,
  Play,
  Pause,
} from "lucide-react";

interface CourseCardProps {
  course: CourseWithDetails;
}

export function CourseCard({ course }: CourseCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Handle status update
  const handleStatusUpdate = async (
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  ) => {
    setIsUpdating(true);
    try {
      const result = await updateCourseStatus(course.id, status);
      if (result.success) {
        // Refresh the page to show updated status
        window.location.reload();
      } else {
        console.error("Failed to update status:", result.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
      setShowActions(false);
    }
  };

  // Handle course deletion
  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this course? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsUpdating(true);
    try {
      const result = await deleteCourse(course.id);
      if (result.success) {
        // Refresh the page to remove the deleted course
        window.location.reload();
      } else {
        console.error("Failed to delete course:", result.message);
        alert(result.message);
      }
    } catch (error) {
      console.error("Error deleting course:", error);
    } finally {
      setIsUpdating(false);
      setShowActions(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      {/* Course Thumbnail */}
      <div className="relative h-48 w-full">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded-t-lg flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-gray-400" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              course.status === "PUBLISHED"
                ? "bg-green-100 text-green-800"
                : course.status === "DRAFT"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {course.status}
          </span>
        </div>

        {/* Actions Menu */}
        <div className="absolute top-3 right-3">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActions(!showActions)}
              className="bg-white/90 hover:bg-white"
              disabled={isUpdating}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>

            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                <div className="py-1">
                  <Link
                    href={`/instructor/courses/${course.id}`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Link>

                  <Link
                    href={`/instructor/courses/${course.id}/edit`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Course
                  </Link>

                  <div className="border-t border-gray-100" />

                  {course.status === "DRAFT" && (
                    <button
                      onClick={() => handleStatusUpdate("PUBLISHED")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      disabled={isUpdating}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Publish Course
                    </button>
                  )}

                  {course.status === "PUBLISHED" && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate("DRAFT")}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        disabled={isUpdating}
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Unpublish
                      </button>
                      <button
                        onClick={() => handleStatusUpdate("ARCHIVED")}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        disabled={isUpdating}
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </button>
                    </>
                  )}

                  {course.status === "ARCHIVED" && (
                    <button
                      onClick={() => handleStatusUpdate("DRAFT")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      disabled={isUpdating}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Restore to Draft
                    </button>
                  )}

                  <div className="border-t border-gray-100" />

                  <button
                    onClick={handleDelete}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    disabled={isUpdating}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Course
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-4 space-y-3">
        {/* Course Title */}
        <div>
          <Link href={`/instructor/courses/${course.id}`}>
            <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
              {course.title}
            </h3>
          </Link>
          <p className="text-sm text-gray-600 mt-1">{course.category.name}</p>
        </div>

        {/* Course Description */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {course.description}
        </p>

        {/* Course Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              <span>{course._count?.modules || 0} modules</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{course._count?.enrollments || 0} students</span>
            </div>
          </div>{" "}
          {course.price && (
            <div className="flex items-center text-green-600 font-medium">
              <DollarSign className="h-4 w-4 mr-1" />
              <span>${course.price}</span>
            </div>
          )}
        </div>

        {/* Course Actions */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex space-x-2">
            <Link href={`/instructor/courses/${course.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                Manage
              </Button>
            </Link>
            <Link href={`/courses/${course.slug}`} className="flex-1">
              <Button variant="ghost" size="sm" className="w-full">
                Preview
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Click outside to close actions menu */}
      {showActions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
}
