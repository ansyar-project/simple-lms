"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { enrollInCourse } from "@/actions/enrollment";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Loader2, UserPlus } from "lucide-react";

interface CourseEnrollButtonProps {
  courseId: string;
  isLoggedIn: boolean;
  isStudent: boolean;
  className?: string;
}

export function CourseEnrollButton({
  courseId,
  isLoggedIn,
  isStudent,
  className,
}: CourseEnrollButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEnroll = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    if (!isStudent) {
      toast({
        title: "Access Denied",
        description: "Only students can enroll in courses",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await enrollInCourse(courseId);

      toast({
        title: "Success!",
        description: "You have been enrolled in this course",
      });

      router.push(`/courses/${courseId}/learn`);
    } catch (error) {
      console.error("Enrollment error:", error);
      toast({
        title: "Enrollment Failed",
        description:
          error instanceof Error ? error.message : "Failed to enroll in course",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleEnroll} disabled={isLoading} className={className}>
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Enrolling...
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          {isLoggedIn ? "Enroll Now" : "Sign In to Enroll"}
        </>
      )}
    </Button>
  );
}
