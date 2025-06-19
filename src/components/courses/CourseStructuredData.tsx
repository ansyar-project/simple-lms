import React from "react";
import StructuredData from "../StructuredData";

interface CourseStructuredDataProps {
  course: {
    id: string;
    title: string;
    description: string;
    category: { name: string };
    instructor: { name: string };
    price?: number | null;
    modules: Array<{
      lessons: Array<{ title: string; duration?: number | null }>;
    }>;
    _count: { enrollments: number };
  };
}

const CourseStructuredData: React.FC<CourseStructuredDataProps> = ({
  course,
}) => {
  const totalLessons = course.modules.reduce(
    (total, m) => total + m.lessons.length,
    0
  );
  const totalDuration = course.modules.reduce(
    (total, m) => total + m.lessons.reduce((t, l) => t + (l.duration ?? 0), 0),
    0
  );
  const schema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    provider: {
      "@type": "Organization",
      name: "Ansyar",
      url: "https://simple-lms.ansyar-world.top/",
    },
    educationalCredentialAwarded: course.category.name,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      instructor: {
        "@type": "Person",
        name: course.instructor.name || "",
      },
      description: course.description,
      url: `https://simple-lms.ansyar-world.top/courses/${course.id}`,
      offers: {
        "@type": "Offer",
        price: course.price ?? 0,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `https://simple-lms.ansyar-world.top/courses/${course.id}`,
      },
      numberOfCredits: totalLessons,
      totalTime: `${Math.round(totalDuration / 60)}H`,
      enrollmentCount: course._count.enrollments,
    },
  };
  return <StructuredData schema={schema} />;
};

export default CourseStructuredData;
