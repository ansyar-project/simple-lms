"use client";

import { motion } from "framer-motion";
import { BookOpen, Users, Shield, Zap, Trophy, BarChart3 } from "lucide-react";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { TextAnimate } from "@/components/magicui/text-animate";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { AnimatedList } from "@/components/magicui/animated-list";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Feature {
  title: string;
  description: string;
  iconName: "BookOpen" | "Users" | "Shield";
  gradient: string;
}

interface FeaturesProps {
  readonly features: Feature[];
}

const iconMap = {
  BookOpen,
  Users,
  Shield,
};

// Convert main features to bento card format
const convertFeaturesToBentoCards = (features: Feature[]) => {
  return features.map((feature) => {
    const IconComponent = iconMap[feature.iconName];
    return {
      Icon: IconComponent,
      name: feature.title,
      description: feature.description,
      href: "#",
      cta: "Learn More",
      className: "lg:col-span-1", // All main feature cards have equal size
      background: (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${feature.gradient
            .replace("from-", "from-")
            .replace("to-", "to-")}/20`}
        />
      ),
    };
  });
};

// Additional features for the bento grid
const additionalFeatures = [
  {
    Icon: BarChart3,
    name: "Analytics Dashboard",
    description:
      "Track learning progress with detailed insights and performance metrics.",
    href: "#",
    cta: "View Analytics",
    className: "lg:col-span-1",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20" />
    ),
  },
  {
    Icon: Zap,
    name: "Instant Feedback",
    description: "Get immediate feedback on assessments and assignments.",
    href: "#",
    cta: "Try Now",
    className: "lg:col-span-1",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-amber-500/20" />
    ),
  },
  {
    Icon: Trophy,
    name: "Achievement System",
    description: "Earn badges and certificates as you complete milestones.",
    href: "#",
    cta: "Explore",
    className: "lg:col-span-2",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
    ),
  },
];

const achievements = [
  {
    name: "Course Completion",
    description: "Complete your first course",
    icon: "🎓",
    color: "#3b82f6",
  },
  {
    name: "Perfect Score",
    description: "Achieve 100% on a quiz",
    icon: "⭐",
    color: "#10b981",
  },
  {
    name: "Study Streak",
    description: "7 days of continuous learning",
    icon: "🔥",
    color: "#f59e0b",
  },
];

export default function FeaturesSection({ features }: FeaturesProps) {
  const mainFeatureCards = convertFeaturesToBentoCards(features);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1 }}
      className="mb-20 flex flex-col items-center w-full"
    >
      <div className="text-center mb-12">
        <TextAnimate
          className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4"
          animation="fadeIn"
        >
          Everything you need to succeed
        </TextAnimate>
        <div className="flex justify-center">
          <AnimatedShinyText className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
            Our platform provides comprehensive tools for every type of user in
            the learning ecosystem
          </AnimatedShinyText>
        </div>
      </div>
      {/* Main Features Bento Grid */}
      <div className="mb-16">
        <BentoGrid className="max-w-6xl mx-auto">
          {mainFeatureCards.map((feature) => (
            <BentoCard key={feature.name} {...feature} />
          ))}
        </BentoGrid>
      </div>{" "}
      {/* Additional Features Bento Grid */}
      <div className="mb-16 w-full">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Advanced Features
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Discover more powerful tools to enhance your learning experience
          </p>
        </div>
        <div className="flex justify-center w-full">
          <div className="max-w-4xl w-full">
            <BentoGrid className="mx-auto">
              {additionalFeatures.map((feature) => (
                <BentoCard key={feature.name} {...feature} />
              ))}
            </BentoGrid>
          </div>
        </div>
      </div>{" "}
      {/* Achievement System Preview */}
      <div className="w-full flex justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl w-full">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <Badge
                variant="secondary"
                className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              >
                Gamification
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Stay Motivated with Achievements
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Our gamification system keeps you engaged with badges, streaks,
              and milestones. Track your progress and celebrate your learning
              achievements as you advance through your courses.
            </p>
          </div>

          <div className="relative h-[300px] overflow-hidden rounded-lg border bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
            <AnimatedList>
              {achievements.map((item) => (
                <div
                  key={item.name}
                  className={cn(
                    "flex items-center gap-4 p-4 transition-all hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                  )}
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-2xl"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </AnimatedList>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
