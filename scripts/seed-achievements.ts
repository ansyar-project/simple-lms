import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedAchievements() {
  console.log("🌱 Seeding achievements...");

  const achievements = [
    // Streak achievements
    {
      name: "🔥 First Streak",
      description: "Complete lessons for 3 consecutive days",
      icon: "🔥",
      category: "streak",
      criteria: { days: 3 },
      points: 10,
    },
    {
      name: "🔥 Week Warrior",
      description: "Complete lessons for 7 consecutive days",
      icon: "🔥",
      category: "streak",
      criteria: { days: 7 },
      points: 25,
    },
    {
      name: "🔥 Fortnight Fighter",
      description: "Complete lessons for 14 consecutive days",
      icon: "🔥",
      category: "streak",
      criteria: { days: 14 },
      points: 50,
    },
    {
      name: "🔥 Monthly Master",
      description: "Complete lessons for 30 consecutive days",
      icon: "🔥",
      category: "streak",
      criteria: { days: 30 },
      points: 100,
    },
    {
      name: "🔥 Hundred Club",
      description: "Complete lessons for 100 consecutive days",
      icon: "🔥",
      category: "streak",
      criteria: { days: 100 },
      points: 500,
    },
    // Completion achievements
    {
      name: "🎓 First Graduate",
      description: "Complete your first course",
      icon: "🎓",
      category: "completion",
      criteria: { courses: 1 },
      points: 50,
    },
    {
      name: "🎓 Course Collector",
      description: "Complete 3 courses",
      icon: "🎓",
      category: "completion",
      criteria: { courses: 3 },
      points: 150,
    },
    {
      name: "🎓 Learning Master",
      description: "Complete 5 courses",
      icon: "🎓",
      category: "completion",
      criteria: { courses: 5 },
      points: 300,
    },
    {
      name: "🎓 Academic Achiever",
      description: "Complete 10 courses",
      icon: "🎓",
      category: "completion",
      criteria: { courses: 10 },
      points: 750,
    },
    // Lesson achievements
    {
      name: "📚 First Lesson",
      description: "Complete your first lesson",
      icon: "📚",
      category: "lessons",
      criteria: { lessons: 1 },
      points: 5,
    },
    {
      name: "📚 Lesson Learner",
      description: "Complete 10 lessons",
      icon: "📚",
      category: "lessons",
      criteria: { lessons: 10 },
      points: 25,
    },
    {
      name: "📚 Knowledge Seeker",
      description: "Complete 25 lessons",
      icon: "📚",
      category: "lessons",
      criteria: { lessons: 25 },
      points: 75,
    },
    {
      name: "📚 Study Machine",
      description: "Complete 50 lessons",
      icon: "📚",
      category: "lessons",
      criteria: { lessons: 50 },
      points: 150,
    },
    {
      name: "📚 Century Scholar",
      description: "Complete 100 lessons",
      icon: "📚",
      category: "lessons",
      criteria: { lessons: 100 },
      points: 400,
    },
    // Time-based achievements
    {
      name: "⏱️ Quick Start",
      description: "Complete first learning session",
      icon: "⏱️",
      category: "time",
      criteria: { minutes: 1 },
      points: 5,
    },
    {
      name: "⏱️ Dedicated Learner",
      description: "Spend 60 minutes learning",
      icon: "⏱️",
      category: "time",
      criteria: { minutes: 60 },
      points: 30,
    },
    {
      name: "⏱️ Time Investor",
      description: "Spend 5 hours learning",
      icon: "⏱️",
      category: "time",
      criteria: { minutes: 300 },
      points: 100,
    },
    {
      name: "⏱️ Marathon Learner",
      description: "Spend 20 hours learning",
      icon: "⏱️",
      category: "time",
      criteria: { minutes: 1200 },
      points: 300,
    },
    // Engagement achievements
    {
      name: "🚀 Early Bird",
      description: "Complete first lesson in a course",
      icon: "🚀",
      category: "engagement",
      criteria: { firstLesson: true },
      points: 10,
    },
    {
      name: "🎯 Focused Learner",
      description: "Complete a full course module in one session",
      icon: "🎯",
      category: "engagement",
      criteria: { moduleInSession: true },
      points: 25,
    },
    {
      name: "💪 Persistent Student",
      description: "Return to learning after a break",
      icon: "💪",
      category: "engagement",
      criteria: { comeback: true },
      points: 15,
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const achievementData of achievements) {
    try {
      const existing = await prisma.achievement.findFirst({
        where: {
          name: achievementData.name,
        },
      });

      if (!existing) {
        await prisma.achievement.create({
          data: achievementData,
        });
        created++;
        console.log(`✅ Created achievement: ${achievementData.name}`);
      } else {
        skipped++;
        console.log(
          `⏭️  Skipped existing achievement: ${achievementData.name}`
        );
      }
    } catch (error) {
      console.error(
        `❌ Error creating achievement ${achievementData.name}:`,
        error
      );
    }
  }

  console.log(`\n🎉 Achievement seeding completed!`);
  console.log(`📊 Created: ${created} achievements`);
  console.log(`⏭️  Skipped: ${skipped} achievements`);
  console.log(`📈 Total: ${created + skipped} achievements processed`);
}

async function main() {
  try {
    await seedAchievements();
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { seedAchievements };
