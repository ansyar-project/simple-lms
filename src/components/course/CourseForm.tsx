"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCourse, updateCourse } from "@/actions/courses";
import { uploadCourseThumbnail } from "@/actions/upload";
import type { CourseFormState } from "@/types/course";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CourseFormProps {
  categories: Category[];
  initialData?: {
    id?: string;
    title?: string;
    description?: string;
    categoryId?: string;
    price?: number;
    thumbnail?: string;
  };
  mode?: "create" | "edit";
}

export function CourseForm({
  categories,
  initialData,
  mode = "create",
}: CourseFormProps) {
  const [state, formAction] = useActionState<CourseFormState, FormData>(
    mode === "create" ? createCourse : updateCourse,
    { errors: {}, message: "", success: false }
  );

  const [thumbnail, setThumbnail] = useState<string | null>(
    initialData?.thumbnail || null
  );
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

  // Handle thumbnail upload
  const handleThumbnailUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingThumbnail(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadCourseThumbnail(formData);

      if (result.success && result.url) {
        setThumbnail(result.url);
      } else {
        console.error("Failed to upload thumbnail:", result.error);
      }
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  // Remove thumbnail
  const removeThumbnail = () => {
    setThumbnail(null);
  };

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden fields for edit mode */}
      {mode === "edit" && initialData?.id && (
        <input type="hidden" name="id" value={initialData.id} />
      )}

      {/* Thumbnail input (hidden) */}
      {thumbnail && <input type="hidden" name="thumbnail" value={thumbnail} />}

      {/* Course Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Course Title *</Label>
        <Input
          id="title"
          name="title"
          type="text"
          placeholder="Enter course title"
          defaultValue={initialData?.title}
          className={state.errors?.title ? "border-red-500" : ""}
        />
        {state.errors?.title && (
          <p className="text-sm text-red-600">{state.errors.title[0]}</p>
        )}
      </div>

      {/* Course Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Course Description *</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Describe what students will learn in this course"
          rows={6}
          defaultValue={initialData?.description}
          className={state.errors?.description ? "border-red-500" : ""}
        />
        {state.errors?.description && (
          <p className="text-sm text-red-600">{state.errors.description[0]}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="categoryId">Category *</Label>
        <select
          id="categoryId"
          name="categoryId"
          defaultValue={initialData?.categoryId}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            state.errors?.categoryId ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {state.errors?.categoryId && (
          <p className="text-sm text-red-600">{state.errors.categoryId[0]}</p>
        )}
      </div>

      {/* Course Thumbnail */}
      <div className="space-y-2">
        <Label>Course Thumbnail</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          {thumbnail ? (
            <div className="relative">
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <Image
                  src={thumbnail}
                  alt="Course thumbnail"
                  fill
                  className="object-cover"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={removeThumbnail}
                className="absolute top-2 right-2 bg-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Label
                  htmlFor="thumbnail-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  {isUploadingThumbnail ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Thumbnail
                    </>
                  )}
                </Label>
                <input
                  id="thumbnail-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  disabled={isUploadingThumbnail}
                  className="hidden"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                PNG, JPG, WEBP up to 5MB
              </p>
            </div>
          )}
        </div>
        {state.errors?.thumbnail && (
          <p className="text-sm text-red-600">{state.errors.thumbnail[0]}</p>
        )}
      </div>

      {/* Course Price */}
      <div className="space-y-2">
        <Label htmlFor="price">Course Price (USD)</Label>
        <Input
          id="price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          defaultValue={initialData?.price}
          className={state.errors?.price ? "border-red-500" : ""}
        />
        <p className="text-sm text-gray-500">Leave empty for free course</p>
        {state.errors?.price && (
          <p className="text-sm text-red-600">{state.errors.price[0]}</p>
        )}
      </div>

      {/* Form Messages */}
      {state.errors?._form && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{state.errors._form[0]}</p>
        </div>
      )}

      {state.success && state.message && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">{state.message}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button type="submit" disabled={isUploadingThumbnail}>
          {isUploadingThumbnail ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : mode === "create" ? (
            "Create Course"
          ) : (
            "Update Course"
          )}
        </Button>
      </div>
    </form>
  );
}
