"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface NeonGradientCardProps {
  children: ReactNode;
  className?: string;
  borderSize?: number;
  borderRadius?: number;
  neonColors?: {
    firstColor: string;
    secondColor: string;
  };
}

export function NeonGradientCard({
  children,
  className,
  borderSize = 2,
  borderRadius = 20,
  neonColors = {
    firstColor: "#ff00aa",
    secondColor: "#00FFF1",
  },
}: NeonGradientCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-black p-[1px]",
        className
      )}
      style={{
        borderRadius: `${borderRadius}px`,
      }}
    >
      <div
        className="absolute inset-0 bg-gradient-to-r opacity-75 blur-sm"
        style={{
          background: `linear-gradient(90deg, ${neonColors.firstColor}, ${neonColors.secondColor}, ${neonColors.firstColor})`,
          borderRadius: `${borderRadius}px`,
        }}
      />
      <div
        className="relative z-10 rounded-xl bg-black/90 backdrop-blur-xl"
        style={{
          borderRadius: `${borderRadius - borderSize}px`,
          margin: `${borderSize}px`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default NeonGradientCard;
