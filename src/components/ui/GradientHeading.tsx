import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GradientHeadingProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly level?: 1 | 2 | 3 | 4 | 5 | 6;
  readonly size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
}

export default function GradientHeading({
  children,
  className,
  level = 1,
  size = "xl",
}: GradientHeadingProps) {
  const sizeClasses = {
    sm: "text-2xl md:text-3xl",
    md: "text-3xl md:text-4xl",
    lg: "text-4xl md:text-5xl",
    xl: "text-5xl md:text-6xl",
    "2xl": "text-6xl md:text-7xl",
    "3xl": "text-7xl md:text-8xl",
  };

  const baseClasses = cn(
    "font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent",
    sizeClasses[size],
    className
  );

  switch (level) {
    case 1:
      return <h1 className={baseClasses}>{children}</h1>;
    case 2:
      return <h2 className={baseClasses}>{children}</h2>;
    case 3:
      return <h3 className={baseClasses}>{children}</h3>;
    case 4:
      return <h4 className={baseClasses}>{children}</h4>;
    case 5:
      return <h5 className={baseClasses}>{children}</h5>;
    case 6:
      return <h6 className={baseClasses}>{children}</h6>;
    default:
      return <h1 className={baseClasses}>{children}</h1>;
  }
}
