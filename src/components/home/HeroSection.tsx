"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, Zap } from "lucide-react";
import { TextAnimate } from "@/components/magicui/text-animate";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import RippleButton from "@/components/magicui/ripple-button";

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
          className="text-6xl md:text-7xl font-bold text-blue-900 dark:text-blue-100 mb-6 drop-shadow-lg"
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
        {" "}
        <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-blue-600 hover:duration-300 hover:dark:text-blue-400">
          <span className="text-xl md:text-2xl text-blue-700 dark:text-blue-300 max-w-3xl mx-auto">
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
        {" "}
        <Link href="/register">
          <ShimmerButton
            shimmerColor="#ffffff"
            background="linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
            className="relative inline-flex items-center justify-center w-44 h-14 text-lg font-medium text-white border-2 border-blue-600 hover:border-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl rounded-lg"
          >
            <Zap className="w-5 h-5 mr-2" />
            Get Started
          </ShimmerButton>
        </Link>{" "}
        <Link href="/login">
          <RippleButton className="inline-flex items-center justify-center w-44 h-14 text-lg font-medium bg-transparent border-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-950/20 transition-all duration-300 shadow-lg hover:shadow-xl rounded-lg">
            <div className="flex items-center justify-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              <span>Sign In</span>
            </div>
          </RippleButton>
        </Link>
      </motion.div>
    </motion.div>
  );
}
