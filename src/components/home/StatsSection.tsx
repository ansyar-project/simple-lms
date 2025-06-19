"use client";

import { motion } from "framer-motion";
import { BookOpen, Users, Award, TrendingUp } from "lucide-react";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { NeonGradientCard } from "@/components/magicui/neon-gradient-card";

interface Stat {
  iconName: "BookOpen" | "Users" | "Award" | "TrendingUp";
  label: string;
  value: string;
  id: string;
}

interface StatsProps {
  readonly stats: Stat[];
}

const iconMap = {
  BookOpen,
  Users,
  Award,
  TrendingUp,
};

export default function StatsSection({ stats }: StatsProps) {
  return (
    <div className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {" "}
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join Thousands of Learners
          </h2>
          <p className="text-gray-200 text-lg max-w-2xl mx-auto">
            Our platform has helped students and professionals achieve their
            learning goals
          </p>
        </motion.div>
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
        >
          {stats.map((stat, index) => {
            const IconComponent = iconMap[stat.iconName];
            // Extract number from stat value for animation
            const numericValue = parseInt(stat.value.replace(/[^\d]/g, ""));

            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  transition: { type: "spring", stiffness: 300, damping: 30 },
                }}
                className="relative group"
              >
                {" "}
                <NeonGradientCard
                  className="h-full"
                  neonColors={{
                    firstColor: index % 2 === 0 ? "#3b82f6" : "#8b5cf6",
                    secondColor: index % 2 === 0 ? "#06b6d4" : "#ec4899",
                  }}
                >
                  <div className="p-6 text-center h-full flex flex-col justify-center bg-gray-900/90 backdrop-blur-sm rounded-xl">
                    <IconComponent className="w-8 h-8 text-white mx-auto mb-4 group-hover:text-blue-200 transition-colors duration-300" />
                    <div className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center justify-center">
                      {numericValue > 0 ? (
                        <>
                          <NumberTicker
                            value={numericValue}
                            className="text-white"
                          />
                          {stat.value.includes("+") && (
                            <span className="ml-1">+</span>
                          )}
                          {stat.value.includes("%") && (
                            <span className="ml-1">%</span>
                          )}
                        </>
                      ) : (
                        <span className="text-white">{stat.value}</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-200 font-medium">
                      {stat.label}
                    </div>
                  </div>
                </NeonGradientCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
