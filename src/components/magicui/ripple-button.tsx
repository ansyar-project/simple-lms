"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface RippleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export default function RippleButton({
  children,
  className,
  ...props
}: RippleButtonProps) {
  return (
    <button
      className={cn(
        "relative overflow-hidden rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95",
        "before:absolute before:inset-0 before:rounded-lg before:bg-white/20 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
        "after:absolute after:left-1/2 after:top-1/2 after:h-0 after:w-0 after:rounded-full after:bg-white/30 after:transition-all after:duration-500 after:ease-out active:after:h-full active:after:w-full active:after:-translate-x-1/2 active:after:-translate-y-1/2",
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}
