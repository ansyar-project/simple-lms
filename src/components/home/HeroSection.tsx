"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, Zap } from "lucide-react";
import { TextAnimate } from "@/components/magicui/text-animate";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";

export default function HeroSection() {
  return (
    <motion.div
      className="text-center max-w-5xl mx-auto mb-20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {" "}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {" "}
        <TextAnimate
          animation="blurInUp"
          by="word"
          className="text-6xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 drop-shadow-lg"
          as="h1"
        >
          Welcome to Simple LMS
        </TextAnimate>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mb-12"
      >
        <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-blue-600 hover:duration-300 hover:dark:text-blue-400">
          <span className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive Learning Management System built with modern web
            technologies. Start your learning journey today!
          </span>
        </AnimatedShinyText>
      </motion.div>{" "}
      <motion.div
        className="flex flex-col sm:flex-row gap-6 justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Link href="/register">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button className="relative inline-flex items-center justify-center px-10 py-4 text-lg font-medium text-white bg-blue-600 border-2 border-blue-600 rounded-full hover:bg-blue-700 hover:border-blue-700 transition-all duration-300 shadow-lg">
              <Zap className="w-5 h-5 mr-2" />
              Get Started
            </button>
          </motion.div>
        </Link>
        <Link href="/login">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button className="relative inline-flex items-center justify-center px-10 py-4 text-lg font-medium text-blue-600 bg-transparent border-2 border-blue-500 rounded-full hover:bg-blue-50 transition-all duration-300 shadow-lg">
              <TrendingUp className="w-5 h-5 mr-2" />
              Sign In
            </button>
          </motion.div>
        </Link>
      </motion.div>
    </motion.div>
  );
}
