"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const AnimatedButton = ({
  children,
  className,
  variant = "primary",
  onClick,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}) => {
  return (
    <motion.button
      className={cn(
        "relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium transition duration-300 ease-out border-2 rounded-full shadow-md group",
        variant === "primary"
          ? "border-blue-500 text-white bg-blue-500 hover:bg-blue-600"
          : "border-blue-500 text-blue-500 bg-transparent hover:text-white",
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400"></span>
      <span
        className={cn(
          "absolute bottom-0 right-0 block w-64 h-64 mb-32 mr-4 transition duration-500 origin-bottom-left transform rotate-45 translate-x-24 bg-blue-600 rounded-full opacity-30 group-hover:rotate-90 ease",
          variant === "secondary" && "bg-blue-500"
        )}
      ></span>
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};
