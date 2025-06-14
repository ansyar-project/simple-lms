"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export function CourseCard({ course }: Readonly<CourseCardProps>) {
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
        </div>{" "}
        {/* Actions Menu */}
        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="bg-white/90 hover:bg-white"
                disabled={isUpdating}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link
                  href={`/instructor/courses/${course.id}`}
                  className="flex items-center"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href={`/instructor/courses/${course.id}/edit`}
                  className="flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Course
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {course.status === "DRAFT" && (
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate("PUBLISHED")}
                  disabled={isUpdating}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Publish Course
                </DropdownMenuItem>
              )}

              {course.status === "PUBLISHED" && (
                <>
                  <DropdownMenuItem
                    onClick={() => handleStatusUpdate("DRAFT")}
                    disabled={isUpdating}
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Unpublish
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatusUpdate("ARCHIVED")}
                    disabled={isUpdating}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                </>
              )}

              {course.status === "ARCHIVED" && (
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate("DRAFT")}
                  disabled={isUpdating}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Restore to Draft
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isUpdating}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Course
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
              </Button>{" "}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
