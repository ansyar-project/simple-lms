import { motion } from "framer-motion";
import { BookOpen, Users, Award, TrendingUp } from "lucide-react";
import { NumberTicker } from "@/components/magicui/number-ticker";

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
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Join Thousands of Learners
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Our platform has helped students and professionals achieve their
            learning goals
          </p>
        </motion.div>{" "}
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

            // Define light color schemes for each card
            const colorSchemes = [
              {
                gradient: "from-blue-500/20 to-cyan-500/20",
                iconColor: "text-blue-600",
                shadow: "hover:shadow-blue-200/50",
              },
              {
                gradient: "from-emerald-500/20 to-teal-500/20",
                iconColor: "text-emerald-600",
                shadow: "hover:shadow-emerald-200/50",
              },
              {
                gradient: "from-violet-500/20 to-purple-500/20",
                iconColor: "text-violet-600",
                shadow: "hover:shadow-violet-200/50",
              },
              {
                gradient: "from-orange-500/20 to-red-500/20",
                iconColor: "text-orange-600",
                shadow: "hover:shadow-orange-200/50",
              },
            ];

            const colorScheme = colorSchemes[index % colorSchemes.length];

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
                className={`relative group transition-all duration-300 hover:shadow-lg ${colorScheme.shadow} hover:-translate-y-1`}
              >
                <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-colors duration-300">
                  {/* Background gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${colorScheme.gradient}`}
                  />

                  <div className="relative p-6 text-center h-full flex flex-col justify-center">
                    <IconComponent
                      className={`w-8 h-8 ${colorScheme.iconColor} mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                    />
                    <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center justify-center">
                      {numericValue > 0 ? (
                        <>
                          <NumberTicker
                            value={numericValue}
                            className="text-gray-900 dark:text-gray-100"
                          />
                          {stat.value.includes("+") && (
                            <span className="ml-1">+</span>
                          )}
                          {stat.value.includes("%") && (
                            <span className="ml-1">%</span>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-900 dark:text-gray-100">
                          {stat.value}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
