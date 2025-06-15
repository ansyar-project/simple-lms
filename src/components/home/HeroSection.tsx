"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, Zap } from "lucide-react";

export default function HeroSection() {
  return (
    <motion.div
      className="text-center max-w-5xl mx-auto mb-20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent mb-6">
          Welcome to Simple LMS
        </h1>
      </motion.div>

      <motion.p
        className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        A comprehensive Learning Management System built with modern web
        technologies. Start your learning journey today!
      </motion.p>

      <motion.div
        className="flex flex-col sm:flex-row gap-6 justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        {" "}
        <Link href="/register">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button className="relative inline-flex items-center justify-center px-10 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Zap className="w-5 h-5 mr-2" />
              Get Started
            </button>
          </motion.div>
        </Link>
        <Link href="/login">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button className="relative inline-flex items-center justify-center px-10 py-4 text-lg font-medium text-blue-600 bg-transparent border-2 border-blue-500 rounded-full hover:bg-blue-50 transition-all duration-300 transform hover:scale-105">
              <TrendingUp className="w-5 h-5 mr-2" />
              Sign In
            </button>
          </motion.div>
        </Link>
      </motion.div>
    </motion.div>
  );
}
