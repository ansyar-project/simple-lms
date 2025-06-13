"use client";

import { motion } from "framer-motion";
import { BookOpen, Users, Shield } from "lucide-react";

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

export default function FeaturesSection({ features }: FeaturesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1 }}
      className="mb-20"
    >
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Everything you need to succeed
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Our platform provides comprehensive tools for every type of user in
          the learning ecosystem
        </p>
      </div>

      <div className="grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            className={`${
              feature.title === "For Instructors" ? "md:col-span-2" : ""
            } rounded-xl bg-white/70 backdrop-blur-sm border border-blue-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between`}
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div
              className={`w-full h-20 bg-gradient-to-br ${feature.gradient} rounded-lg mb-6`}
            ></div>{" "}
            <div className="flex-1">
              <div className="flex items-center mb-3">
                {(() => {
                  const IconComponent = iconMap[feature.iconName];
                  return <IconComponent className="h-6 w-6 text-blue-500" />;
                })()}
                <h3 className="text-xl font-bold text-gray-900 ml-3">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
