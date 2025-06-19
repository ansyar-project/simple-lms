import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { QuizWrapper } from "@/components/course/QuizWrapper";
import type { QuizAttemptWithBasicUser } from "@/types";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

interface QuizPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  // Get quiz with questions and check enrollment
  const quiz = await db.quiz.findUnique({
    where: {
      id: id,
      isPublished: true,
    },
    include: {
      questions: {
        orderBy: { order: "asc" },
      },
      lesson: {
        include: {
          module: {
            include: {
              course: {
                include: {
                  enrollments: {
                    where: { userId: session.user.id },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!quiz) {
    notFound();
  }

  // Check if user is enrolled in the course
  if (quiz.lesson.module.course.enrollments.length === 0) {
    redirect(`/courses/${quiz.lesson.module.course.id}`);
  }

  // Get user's quiz attempts
  const attempts = await db.quizAttempt.findMany({
    where: {
      quizId: id,
      userId: session.user.id,
    },
    include: {
      answers: {
        include: {
          question: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      quiz: {
        include: {
          questions: {
            orderBy: { order: "asc" },
          },
          lesson: true,
        },
      },
    },
    orderBy: { startedAt: "desc" },
  });
  return (
    <main aria-labelledby="quiz-title">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Courses", href: "/courses" },
          {
            label: quiz.lesson.module.course.title,
            href: `/courses/${quiz.lesson.module.course.id}`,
          },
          { label: "Quiz" },
        ]}
        className="mb-4"
      />
      <h1 id="quiz-title" className="sr-only">
        Quiz
      </h1>
      <QuizWrapper
        quiz={quiz}
        attempts={attempts as QuizAttemptWithBasicUser[]}
        onComplete={() => {
          // Could add additional logic here like updating progress
        }}
      />
    </main>
  );
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const canonicalUrl = `https://simple-lms.ansyar-world.top/quiz/${params.id}`;
  return {
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
