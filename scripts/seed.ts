import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create categories
  const categories = [
    {
      name: "Web Development",
      description: "Learn modern web development technologies",
      slug: "web-development",
    },
    {
      name: "Data Science",
      description: "Master data analysis and machine learning",
      slug: "data-science",
    },
    {
      name: "Mobile Development",
      description: "Build mobile applications for iOS and Android",
      slug: "mobile-development",
    },
  ];

  const createdCategories: any[] = [];
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    createdCategories.push(created);
    console.log(`✅ Created category: ${created.name}`);
  }

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@lms.com" },
    update: {},
    create: {
      email: "admin@lms.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });
  console.log(`✅ Created admin user: ${admin.email}`);

  // Create instructor user
  const instructorPassword = await bcrypt.hash("instructor123", 12);
  const instructor = await prisma.user.upsert({
    where: { email: "instructor@lms.com" },
    update: {},
    create: {
      email: "instructor@lms.com",
      name: "John Instructor",
      password: instructorPassword,
      role: "INSTRUCTOR",
      emailVerified: new Date(),
    },
  });
  console.log(`✅ Created instructor user: ${instructor.email}`);

  // Create student user
  const studentPassword = await bcrypt.hash("student123", 12);
  const student = await prisma.user.upsert({
    where: { email: "student@lms.com" },
    update: {},
    create: {
      email: "student@lms.com",
      name: "Jane Student",
      password: studentPassword,
      role: "STUDENT",
      emailVerified: new Date(),
    },
  });
  console.log(`✅ Created student user: ${student.email}`);

  // Create sample course
  const course = await prisma.course.upsert({
    where: { slug: "introduction-to-react" },
    update: {},
    create: {
      title: "Introduction to React",
      description:
        "Learn the fundamentals of React.js and modern web development",
      slug: "introduction-to-react",
      instructorId: instructor.id,
      categoryId: createdCategories[0].id,
      price: 99.99,
      status: "PUBLISHED",
    },
  });
  console.log(`✅ Created course: ${course.title}`);

  // Create course modules
  const module1 = await prisma.module.create({
    data: {
      courseId: course.id,
      title: "Getting Started",
      description: "Introduction to React fundamentals",
      order: 1,
    },
  });

  const module2 = await prisma.module.create({
    data: {
      courseId: course.id,
      title: "Components and Props",
      description: "Learn about React components and props",
      order: 2,
    },
  });

  console.log(`✅ Created modules for course: ${course.title}`);

  // Create lessons
  await prisma.lesson.createMany({
    data: [
      {
        moduleId: module1.id,
        title: "What is React?",
        content:
          "React is a JavaScript library for building user interfaces...",
        contentType: "TEXT",
        order: 1,
      },
      {
        moduleId: module1.id,
        title: "Setting up your environment",
        content: "Learn how to set up your development environment...",
        contentType: "TEXT",
        order: 2,
      },
      {
        moduleId: module2.id,
        title: "Creating your first component",
        content: "Let's create your first React component...",
        contentType: "TEXT",
        order: 1,
      },
    ],
  });

  console.log(`✅ Created lessons for course modules`);

  console.log("🎉 Database seeding completed!");
  console.log("\n📧 Test accounts:");
  console.log("Admin: admin@lms.com / admin123");
  console.log("Instructor: instructor@lms.com / instructor123");
  console.log("Student: student@lms.com / student123");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
