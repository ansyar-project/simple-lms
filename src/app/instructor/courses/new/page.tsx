import { CourseForm } from "@/components/course/CourseForm";
import { getCategories } from "@/actions/courses";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ThemeBackground from "@/components/ui/ThemeBackground";
import GlassCard from "@/components/ui/GlassCard";

export default async function NewCoursePage() {
  const categories = await getCategories();

  return (
    <main>
      <ThemeBackground>
        <div className="max-w-4xl mx-auto space-y-8 relative z-10 py-16">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/instructor/courses">
              <Button
                variant="ghost"
                size="sm"
                className="bg-white/70 backdrop-blur-sm border-blue-100 hover:bg-white/90"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Button>
            </Link>
          </div>

          <header
            className="text-center mb-8"
            aria-labelledby="new-course-title"
          >
            <h1
              id="new-course-title"
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Create New Course
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Fill in the details below to create your new course. You can
              always edit these later.
            </p>
          </header>

          {/* Course Form */}
          <GlassCard className="p-8">
            <CourseForm categories={categories} />
          </GlassCard>
        </div>
      </ThemeBackground>
    </main>
  );
}
