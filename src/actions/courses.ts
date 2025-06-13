"use server";

import { revalidatePath } from "next/cache";
import { PerformanceMonitor } from "@/lib/performance";
import { db } from "@/lib/db";
import { authorize } from "@/lib/authorization";
import {
  createCourseSchema,
  updateCourseSchema,
  courseStatusSchema,
  courseSearchSchema,
  type CourseSearchInput,
} from "@/lib/validations";
import type {
  CourseWithDetails,
  PaginatedCourses,
  CourseFormState,
  InstructorDashboard,
} from "@/types/course";

// Helper function to generate slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Create a new course
export async function createCourse(
  prevState: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  try {
    const user = await authorize(["INSTRUCTOR", "ADMIN"]);

    // Validate form data
    const validatedFields = createCourseSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      categoryId: formData.get("categoryId"),
      price: formData.get("price") ? Number(formData.get("price")) : undefined,
      thumbnail: formData.get("thumbnail") || undefined,
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Invalid form data. Please check your inputs.",
      };
    }

    const { title, description, categoryId, price, thumbnail } =
      validatedFields.data;

    // Generate unique slug
    const baseSlug = generateSlug(title);
    let slug = baseSlug;
    let counter = 1;

    while (await db.course.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    } // Create course
    await db.course.create({
      data: {
        title,
        description,
        slug,
        instructorId: user.id,
        categoryId,
        price: price ?? null,
        thumbnail,
        status: "DRAFT",
      },
      include: {
        instructor: {
          select: { id: true, name: true, email: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: {
            modules: true,
            enrollments: true,
          },
        },
      },
    });

    revalidatePath("/instructor/courses");
    return {
      success: true,
      message: "Course created successfully!",
    };
  } catch (error) {
    console.error("Error creating course:", error);
    return {
      errors: {
        _form: ["Failed to create course. Please try again."],
      },
    };
  }
}

// Update an existing course
export async function updateCourse(
  prevState: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  try {
    const user = await authorize(["INSTRUCTOR", "ADMIN"]);

    const validatedFields = updateCourseSchema.safeParse({
      id: formData.get("id"),
      title: formData.get("title"),
      description: formData.get("description"),
      categoryId: formData.get("categoryId"),
      price: formData.get("price") ? Number(formData.get("price")) : undefined,
      thumbnail: formData.get("thumbnail") || undefined,
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Invalid form data. Please check your inputs.",
      };
    }

    const { id, ...updateData } = validatedFields.data;

    // Check if course exists and user has permission
    const existingCourse = await db.course.findUnique({
      where: { id },
      select: { instructorId: true },
    });

    if (!existingCourse) {
      return {
        errors: {
          _form: ["Course not found."],
        },
      };
    }

    if (existingCourse.instructorId !== user.id && user.role !== "ADMIN") {
      return {
        errors: {
          _form: ["You don't have permission to edit this course."],
        },
      };
    } // Update slug if title changed
    const updateDataWithSlug: Record<string, unknown> = { ...updateData };
    if (updateData.title) {
      const newSlug = generateSlug(updateData.title);
      const existingSlugCourse = await db.course.findFirst({
        where: { slug: newSlug, NOT: { id } },
      });

      if (!existingSlugCourse) {
        updateDataWithSlug.slug = newSlug;
      }
    }

    await db.course.update({
      where: { id },
      data: updateDataWithSlug,
    });

    revalidatePath("/instructor/courses");
    revalidatePath(`/instructor/courses/${id}`);
    return {
      success: true,
      message: "Course updated successfully!",
    };
  } catch (error) {
    console.error("Error updating course:", error);
    return {
      errors: {
        _form: ["Failed to update course. Please try again."],
      },
    };
  }
}

// Update course status
export async function updateCourseStatus(
  courseId: string,
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
): Promise<{ success: boolean; message: string }> {
  try {
    const user = await authorize(["INSTRUCTOR", "ADMIN"]);

    const validatedFields = courseStatusSchema.safeParse({
      id: courseId,
      status,
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Invalid course ID or status.",
      };
    }

    // Check if course exists and user has permission
    const existingCourse = await db.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true, title: true },
    });

    if (!existingCourse) {
      return {
        success: false,
        message: "Course not found.",
      };
    }

    if (existingCourse.instructorId !== user.id && user.role !== "ADMIN") {
      return {
        success: false,
        message: "You don't have permission to modify this course.",
      };
    }

    await db.course.update({
      where: { id: courseId },
      data: { status },
    });

    revalidatePath("/instructor/courses");
    revalidatePath(`/instructor/courses/${courseId}`);

    return {
      success: true,
      message: `Course ${status.toLowerCase()} successfully!`,
    };
  } catch (error) {
    console.error("Error updating course status:", error);
    return {
      success: false,
      message: "Failed to update course status. Please try again.",
    };
  }
}

// Delete a course
export async function deleteCourse(
  courseId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const user = await authorize(["INSTRUCTOR", "ADMIN"]);

    // Check if course exists and user has permission
    const existingCourse = await db.course.findUnique({
      where: { id: courseId },
      select: {
        instructorId: true,
        title: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!existingCourse) {
      return {
        success: false,
        message: "Course not found.",
      };
    }

    if (existingCourse.instructorId !== user.id && user.role !== "ADMIN") {
      return {
        success: false,
        message: "You don't have permission to delete this course.",
      };
    }

    // Prevent deletion if there are enrollments
    if (existingCourse._count.enrollments > 0) {
      return {
        success: false,
        message:
          "Cannot delete course with active enrollments. Archive it instead.",
      };
    }

    await db.course.delete({
      where: { id: courseId },
    });

    revalidatePath("/instructor/courses");
    return {
      success: true,
      message: "Course deleted successfully!",
    };
  } catch (error) {
    console.error("Error deleting course:", error);
    return {
      success: false,
      message: "Failed to delete course. Please try again.",
    };
  }
}

// Get courses for instructor with search and pagination
export async function getInstructorCourses(
  searchParams: CourseSearchInput
): Promise<PaginatedCourses> {
  try {
    const user = await authorize(["INSTRUCTOR", "ADMIN"]);

    const validatedParams = courseSearchSchema.parse(searchParams);
    const { query, categoryId, status, sortBy, sortOrder, page, limit } =
      validatedParams;

    const skip = (page - 1) * limit; // Build where clause
    const where: Record<string, unknown> = {};

    // Instructors can only see their own courses (unless admin)
    if (user.role === "INSTRUCTOR") {
      where.instructorId = user.id;
    }
    if (query) {
      // Optimize search: prioritize title search and limit description search
      const searchTerms = query.trim().split(/\s+/);
      const titleConditions = searchTerms.map((term) => ({
        title: { contains: term, mode: "insensitive" as const },
      }));

      where.OR = [
        // Prioritize title matches
        { AND: titleConditions },
        // Only search first 500 chars of description for performance
        {
          description: {
            contains: query.slice(0, 100),
            mode: "insensitive" as const,
          },
        },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status;
    } // Get total count for pagination
    const total = await db.course.count({ where });

    // Get courses with optimized includes - only fetch what's needed for list view
    const courses = await db.course.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        slug: true,
        price: true,
        thumbnail: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        instructor: {
          select: { id: true, name: true, email: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: {
            modules: true,
            enrollments: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    // Convert Decimal to number for client components
    const serializedCourses = courses.map((course) => ({
      ...course,
      price: course.price ? Number(course.price) : null,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      courses: serializedCourses as CourseWithDetails[],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching instructor courses:", error);
    return {
      courses: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }
}

// Cache for search results (simple in-memory cache)
const searchCache = new Map<
  string,
  { data: PaginatedCourses; timestamp: number }
>();
const CACHE_DURATION = 60000; // 1 minute

// Optimized version with caching
export async function getInstructorCoursesOptimized(
  searchParams: CourseSearchInput
): Promise<PaginatedCourses> {
  try {
    const user = await authorize(["INSTRUCTOR", "ADMIN"]);

    const validatedParams = courseSearchSchema.parse(searchParams);
    const { query, categoryId, status, sortBy, sortOrder, page, limit } =
      validatedParams;

    // Create cache key
    const cacheKey = JSON.stringify({
      userId: user.id,
      query,
      categoryId,
      status,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    // Check cache
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const skip = (page - 1) * limit; // Build optimized where clause
    const where: Record<string, unknown> = {};

    // Instructors can only see their own courses (unless admin)
    if (user.role === "INSTRUCTOR") {
      where.instructorId = user.id;
    }

    if (query) {
      // Optimize search: prioritize title search and limit description search
      const searchTerms = query.trim().split(/\s+/);
      const titleConditions = searchTerms.map((term) => ({
        title: { contains: term, mode: "insensitive" as const },
      }));

      where.OR = [
        // Prioritize title matches
        { AND: titleConditions },
        // Only search first 100 chars of description for performance
        {
          description: {
            contains: query.slice(0, 100),
            mode: "insensitive" as const,
          },
        },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status;
    } // Get total count and courses in parallel
    const [total, courses] = await PerformanceMonitor.measure(
      "instructor-courses-query",
      () =>
        Promise.all([
          db.course.count({ where }),
          db.course.findMany({
            where,
            select: {
              id: true,
              title: true,
              description: true,
              slug: true,
              price: true,
              thumbnail: true,
              status: true,
              createdAt: true,
              updatedAt: true,
              instructor: {
                select: { id: true, name: true, email: true },
              },
              category: {
                select: { id: true, name: true, slug: true },
              },
              _count: {
                select: {
                  modules: true,
                  enrollments: true,
                },
              },
            },
            orderBy: {
              [sortBy]: sortOrder,
            },
            skip,
            take: limit,
          }),
        ])
    );

    // Convert Decimal to number for client components
    const serializedCourses = courses.map((course) => ({
      ...course,
      price: course.price ? Number(course.price) : null,
    }));

    const totalPages = Math.ceil(total / limit);

    const result = {
      courses: serializedCourses as CourseWithDetails[],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    }; // Cache the result
    searchCache.set(cacheKey, { data: result, timestamp: Date.now() }); // Clean up old cache entries (simple cleanup)
    if (searchCache.size > 100) {
      const entries = Array.from(searchCache.entries());
      const sortedEntries = entries.toSorted(
        (a, b) => a[1].timestamp - b[1].timestamp
      );
      const oldestEntry = sortedEntries[0];
      if (oldestEntry) {
        searchCache.delete(oldestEntry[0]);
      }
    }

    return result;
  } catch (error) {
    console.error("Error fetching instructor courses:", error);
    return {
      courses: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }
}

// Get single course by ID
export async function getCourseById(
  courseId: string
): Promise<CourseWithDetails | null> {
  try {
    const user = await authorize(["INSTRUCTOR", "ADMIN"]);

    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          select: { id: true, name: true, email: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        modules: {
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        enrollments: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        _count: {
          select: {
            modules: true,
            enrollments: true,
          },
        },
      },
    });
    if (!course) {
      return null;
    }

    // Check permissions
    if (user.role === "INSTRUCTOR" && course.instructorId !== user.id) {
      return null;
    }

    // Convert Decimal to number for client components
    const serializedCourse = {
      ...course,
      price: course.price ? Number(course.price) : null,
    };

    return serializedCourse as CourseWithDetails;
  } catch (error) {
    console.error("Error fetching course:", error);
    return null;
  }
}

// Get instructor dashboard data
export async function getInstructorDashboard(): Promise<InstructorDashboard> {
  try {
    const user = await authorize(["INSTRUCTOR", "ADMIN"]);

    const where = user.role === "INSTRUCTOR" ? { instructorId: user.id } : {};

    // Get statistics
    const [totalCourses, publishedCourses, draftCourses] = await Promise.all([
      db.course.count({ where }),
      db.course.count({ where: { ...where, status: "PUBLISHED" } }),
      db.course.count({ where: { ...where, status: "DRAFT" } }),
    ]); // Get total enrollments
    const enrollmentStats = await db.enrollment.aggregate({
      where: {
        course: where,
      },
      _count: true,
    });

    // Get total revenue (simplified calculation)
    const coursesWithRevenue = await db.course.findMany({
      where,
      select: {
        price: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    const totalRevenue = coursesWithRevenue.reduce((sum, course) => {
      const price = course.price ? Number(course.price) : 0;
      const enrollments = course._count.enrollments;
      return sum + price * enrollments;
    }, 0); // Get recent courses
    const recentCourses = await db.course.findMany({
      where,
      include: {
        instructor: {
          select: { id: true, name: true, email: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        modules: {
          include: {
            lessons: true,
          },
        },
        _count: {
          select: {
            modules: true,
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Convert Decimal to number for client components
    const serializedRecentCourses = recentCourses.map((course) => ({
      ...course,
      price: course.price ? Number(course.price) : null,
    }));

    // Get recent enrollments
    const recentEnrollments = await db.enrollment.findMany({
      where: {
        course: where,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { enrolledAt: "desc" },
      take: 10,
    });

    return {
      stats: {
        totalCourses,
        publishedCourses,
        draftCourses,
        totalEnrollments: enrollmentStats._count,
        totalRevenue,
      },
      recentCourses: serializedRecentCourses as CourseWithDetails[],
      recentEnrollments,
    };
  } catch (error) {
    console.error("Error fetching instructor dashboard:", error);
    return {
      stats: {
        totalCourses: 0,
        publishedCourses: 0,
        draftCourses: 0,
        totalEnrollments: 0,
        totalRevenue: 0,
      },
      recentCourses: [],
      recentEnrollments: [],
    };
  }
}

// Get all categories for course creation
export async function getCategories() {
  try {
    const categories = await db.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { name: "asc" },
    });

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}
