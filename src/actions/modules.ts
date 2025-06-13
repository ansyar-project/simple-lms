"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { authorize } from "@/lib/authorization";
import {
  createModuleSchema,
  updateModuleSchema,
  reorderModulesSchema,
  type ReorderModulesInput,
} from "@/lib/validations";

export interface ModuleFormState {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

// Create a new module
export async function createModule(
  prevState: ModuleFormState,
  formData: FormData
): Promise<ModuleFormState> {
  try {
    const user = await authorize(["INSTRUCTOR", "ADMIN"]);

    // Validate form data
    const validatedFields = createModuleSchema.safeParse({
      courseId: formData.get("courseId"),
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      order: Number(formData.get("order")) || 0,
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { courseId, title, description, order } = validatedFields.data;

    // Verify user owns the course
    const course = await db.course.findFirst({
      where: {
        id: courseId,
        instructorId: user.id,
      },
    });

    if (!course) {
      return {
        success: false,
        message: "Course not found or you don't have permission to modify it",
      };
    }

    // Get the next order if not provided
    let moduleOrder = order;
    if (order === 0) {
      const lastModule = await db.module.findFirst({
        where: { courseId },
        orderBy: { order: "desc" },
      });
      moduleOrder = (lastModule?.order ?? 0) + 1;
    }

    // Create module
    await db.module.create({
      data: {
        courseId,
        title,
        description,
        order: moduleOrder,
      },
    });

    revalidatePath(`/instructor/courses/${courseId}`);

    return {
      success: true,
      message: "Module created successfully",
    };
  } catch (error) {
    console.error("Error creating module:", error);
    return {
      success: false,
      message: "Failed to create module. Please try again.",
    };
  }
}

// Update an existing module
export async function updateModule(
  prevState: ModuleFormState,
  formData: FormData
): Promise<ModuleFormState> {
  try {
    const user = await authorize(["INSTRUCTOR", "ADMIN"]);

    // Validate form data
    const validatedFields = updateModuleSchema.safeParse({
      id: formData.get("id"),
      courseId: formData.get("courseId"),
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      order: formData.get("order") ? Number(formData.get("order")) : undefined,
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { id, ...updateData } = validatedFields.data; // Verify user owns the module through course
    const moduleData = await db.module.findFirst({
      where: {
        id,
        course: {
          instructorId: user.id,
        },
      },
      include: {
        course: true,
      },
    });

    if (!moduleData) {
      return {
        success: false,
        message: "Module not found or you don't have permission to modify it",
      };
    }

    // Update module
    await db.module.update({
      where: { id },
      data: updateData,
    });

    revalidatePath(`/instructor/courses/${moduleData.courseId}`);

    return {
      success: true,
      message: "Module updated successfully",
    };
  } catch (error) {
    console.error("Error updating module:", error);
    return {
      success: false,
      message: "Failed to update module. Please try again.",
    };
  }
}

// Delete a module
export async function deleteModule(moduleId: string): Promise<ModuleFormState> {
  try {
    const user = await authorize(["INSTRUCTOR", "ADMIN"]); // Verify user owns the module through course
    const moduleData = await db.module.findFirst({
      where: {
        id: moduleId,
        course: {
          instructorId: user.id,
        },
      },
    });

    if (!moduleData) {
      return {
        success: false,
        message: "Module not found or you don't have permission to delete it",
      };
    }

    // Delete module (cascade will handle lessons)
    await db.module.delete({
      where: { id: moduleId },
    });

    revalidatePath(`/instructor/courses/${moduleData.courseId}`);

    return {
      success: true,
      message: "Module deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting module:", error);
    return {
      success: false,
      message: "Failed to delete module. Please try again.",
    };
  }
}

// Reorder modules
export async function reorderModules(
  input: ReorderModulesInput
): Promise<ModuleFormState> {
  try {
    const user = await authorize(["INSTRUCTOR", "ADMIN"]);

    const validatedFields = reorderModulesSchema.safeParse(input);

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Invalid input data",
      };
    }

    const { courseId, moduleIds } = validatedFields.data;

    // Verify user owns the course
    const course = await db.course.findFirst({
      where: {
        id: courseId,
        instructorId: user.id,
      },
    });

    if (!course) {
      return {
        success: false,
        message: "Course not found or you don't have permission to modify it",
      };
    }

    // Update module orders
    await db.$transaction(
      moduleIds.map((moduleId, index) =>
        db.module.update({
          where: { id: moduleId },
          data: { order: index + 1 },
        })
      )
    );

    revalidatePath(`/instructor/courses/${courseId}`);

    return {
      success: true,
      message: "Modules reordered successfully",
    };
  } catch (error) {
    console.error("Error reordering modules:", error);
    return {
      success: false,
      message: "Failed to reorder modules. Please try again.",
    };
  }
}

// Get modules for a course
export async function getCourseModules(courseId: string) {
  try {
    const user = await authorize(["INSTRUCTOR", "ADMIN"]);

    // Verify user owns the course
    const course = await db.course.findFirst({
      where: {
        id: courseId,
        instructorId: user.id,
      },
    });

    if (!course) {
      throw new Error("Course not found or access denied");
    }

    const modules = await db.module.findMany({
      where: { courseId },
      include: {
        lessons: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            lessons: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    return modules;
  } catch (error) {
    console.error("Error fetching modules:", error);
    throw error;
  }
}
