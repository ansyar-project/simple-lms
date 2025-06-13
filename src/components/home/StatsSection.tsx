"use client";

import { motion } from "framer-motion";
import { BookOpen, Users, Award, TrendingUp } from "lucide-react";

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
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.2 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
    >
      {" "}
      {stats.map((stat) => {
        const IconComponent = iconMap[stat.iconName];
        return (
          <motion.div
            key={stat.id}
            className="text-center bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <IconComponent className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
